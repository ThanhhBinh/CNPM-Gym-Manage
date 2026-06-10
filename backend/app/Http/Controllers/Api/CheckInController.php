<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;
use App\Models\CheckIn;
use App\Services\AuditLogService;
use App\Services\QrCodeService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CheckInController extends Controller
{
    public function scanQr(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'branch' => 'nullable|string',
        ]);

        $memberId = QrCodeService::validateToken($validated['token']);

        if (!$memberId) {
            return response()->json(['message' => 'Mã QR không hợp lệ hoặc đã hết hạn'], 400);
        }

        $member = Member::with(['packages' => function($q) {
            $q->where('status', 'active')->orderBy('end_date', 'desc');
        }])->find($memberId);

        if (!$member) {
            return response()->json(['message' => 'Không tìm thấy hội viên'], 404);
        }

        return $this->processCheckIn($member, 'qr_scan', $validated['branch'] ?? null, $request->user()->id);
    }

    public function manual(Request $request)
    {
        $validated = $request->validate([
            'member_code' => 'required|string',
            'branch' => 'nullable|string',
        ]);

        $member = Member::with(['packages' => function($q) {
            $q->where('status', 'active')->orderBy('end_date', 'desc');
        }])->where('member_code', $validated['member_code'])->first();

        if (!$member) {
            return response()->json(['message' => 'Không tìm thấy hội viên'], 404);
        }

        return $this->processCheckIn($member, 'manual', $validated['branch'] ?? null, $request->user()->id);
    }

    private function processCheckIn(Member $member, $method, $branch, $userId)
    {
        // 1. Kiểm tra bị khóa
        if ($member->status === 'locked') {
            return response()->json([
                'message' => 'Hội viên đã bị khóa. ' . $member->lock_reason,
                'status' => 'error'
            ], 403);
        }

        // 2. Lấy gói tập đang active
        $activePackage = $member->packages->first();

        if (!$activePackage || Carbon::parse($activePackage->end_date)->isPast()) {
            return response()->json([
                'message' => 'Gói tập đã hết hạn hoặc không có gói hợp lệ. Vui lòng gia hạn.',
                'status' => 'expired',
                'member' => $member
            ], 400);
        }

        // 3. Kiểm tra chi nhánh (NFR nếu áp dụng - skip for now as MVP can be single branch or permissive)
        
        // 4. Giờ hoạt động (Skip for now, assume open)

        // 5. Ghi log check-in
        $checkIn = CheckIn::create([
            'member_id' => $member->id,
            'member_package_id' => $activePackage->id,
            'method' => $method,
            'branch' => $branch ?? $member->branch,
            'verified_by' => $userId,
            'checked_in_at' => now(),
        ]);

        return response()->json([
            'message' => 'Check-in thành công!',
            'status' => 'success',
            'member' => [
                'id' => $member->id,
                'full_name' => $member->full_name,
                'member_code' => $member->member_code,
                'avatar' => $member->avatar,
            ],
            'package' => [
                'name' => $activePackage->package->name ?? 'Gói tập',
                'end_date' => $activePackage->end_date,
            ],
            'check_in' => $checkIn
        ]);
    }

    // Liệt kê lịch sử checkin (optional for admin/receptionist)
    public function index(Request $request)
    {
        $query = CheckIn::with(['member', 'verifier'])->orderBy('checked_in_at', 'desc');

        if ($request->has('date')) {
            $query->whereDate('checked_in_at', $request->date);
        }

        $perPage = min((int) $request->get('per_page', 20), 100);

        return response()->json($query->paginate($perPage));
    }

    public function calendar(Request $request)
    {
        $month = $request->get('month', Carbon::now()->format('Y-m'));

        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            return response()->json(['message' => 'Định dạng tháng không hợp lệ (YYYY-MM)'], 400);
        }

        $start = Carbon::parse($month . '-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $dates = CheckIn::whereBetween('checked_in_at', [$start, $end])
            ->select(DB::raw('DATE(checked_in_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'count' => (int) $row->count,
            ]);

        return response()->json([
            'month' => $month,
            'dates' => $dates,
            'total_checkins' => $dates->sum('count'),
        ]);
    }
}
