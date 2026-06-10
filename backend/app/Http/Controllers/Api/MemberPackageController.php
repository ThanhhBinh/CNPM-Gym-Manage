<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;
use App\Models\Package;
use App\Models\MemberPackage;
use App\Models\Payment;
use App\Services\AuditLogService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MemberPackageController extends Controller
{
    public function store(Request $request, Member $member)
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
            'start_date' => 'required|date',
            'payment_method' => 'required|in:cash,transfer',
            'discount' => 'nullable|numeric|min:0',
        ], [
            'package_id.required' => 'Vui lòng chọn gói tập.',
            'package_id.exists' => 'Gói tập được chọn không tồn tại.',
            'start_date.required' => 'Ngày bắt đầu là bắt buộc.',
            'start_date.date' => 'Ngày bắt đầu không đúng định dạng ngày.',
            'payment_method.required' => 'Phương thức thanh toán là bắt buộc.',
            'payment_method.in' => 'Phương thức thanh toán không hợp lệ.',
            'discount.numeric' => 'Số tiền giảm giá phải là số.',
            'discount.min' => 'Số tiền giảm giá không được nhỏ hơn 0.',
        ]);

        $package = Package::findOrFail($validated['package_id']);
        
        if ($package->status !== 'active') {
            return response()->json(['message' => 'Gói tập hiện không hoạt động'], 400);
        }

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = $startDate->copy()->addDays($package->duration_days);

        try {
            DB::beginTransaction();

            $memberPackage = MemberPackage::create([
                'member_id' => $member->id,
                'package_id' => $package->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'active',
            ]);

            $discount = $validated['discount'] ?? 0;
            $finalAmount = $package->price - $discount;

            $payment = Payment::create([
                'invoice_code' => 'INV-' . date('Ymd') . '-' . strtoupper(uniqid()),
                'member_id' => $member->id,
                'member_package_id' => $memberPackage->id,
                'amount' => $package->price,
                'discount' => $discount,
                'final_amount' => $finalAmount,
                'payment_method' => $validated['payment_method'],
                'status' => 'paid',
                'collected_by' => $request->user()->id,
                'paid_at' => now(),
            ]);

            AuditLogService::log($request->user()->id, 'buy_package', 'member_package', $memberPackage->id, null, $memberPackage->toArray());

            DB::commit();

            return response()->json([
                'message' => 'Đăng ký gói thành công',
                'member_package' => $memberPackage,
                'payment' => $payment
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function renew(Request $request, MemberPackage $memberPackage)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:cash,transfer',
            'discount' => 'nullable|numeric|min:0',
        ], [
            'payment_method.required' => 'Phương thức thanh toán là bắt buộc.',
            'payment_method.in' => 'Phương thức thanh toán không hợp lệ.',
            'discount.numeric' => 'Số tiền giảm giá phải là số.',
            'discount.min' => 'Số tiền giảm giá không được nhỏ hơn 0.',
        ]);

        $package = $memberPackage->package;

        try {
            DB::beginTransaction();

            $oldData = $memberPackage->toArray();
            
            // Logic gia hạn: Cộng dồn ngày
            // Nếu đã hết hạn, tính từ ngày hôm nay. Nếu còn hạn, cộng dồn vào ngày hết hạn cũ.
            $currentEndDate = Carbon::parse($memberPackage->end_date);
            $newStartDate = $currentEndDate->isPast() ? now() : $currentEndDate;
            $newEndDate = $newStartDate->copy()->addDays($package->duration_days);

            $memberPackage->update([
                'end_date' => $newEndDate,
                'status' => 'active'
            ]);

            $discount = $validated['discount'] ?? 0;
            $finalAmount = $package->price - $discount;

            $payment = Payment::create([
                'invoice_code' => 'INV-' . date('Ymd') . '-' . strtoupper(uniqid()),
                'member_id' => $memberPackage->member_id,
                'member_package_id' => $memberPackage->id,
                'amount' => $package->price,
                'discount' => $discount,
                'final_amount' => $finalAmount,
                'payment_method' => $validated['payment_method'],
                'status' => 'paid',
                'collected_by' => $request->user()->id,
                'paid_at' => now(),
            ]);

            AuditLogService::log($request->user()->id, 'renew_package', 'member_package', $memberPackage->id, $oldData, $memberPackage->toArray());

            DB::commit();

            return response()->json([
                'message' => 'Gia hạn thành công',
                'member_package' => $memberPackage,
                'payment' => $payment
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function freeze(Request $request, MemberPackage $memberPackage)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        if ($memberPackage->status !== 'active') {
            return response()->json(['message' => 'Chỉ có thể bảo lưu gói đang hoạt động'], 400);
        }

        if (Carbon::parse($memberPackage->end_date)->isPast()) {
            return response()->json(['message' => 'Gói đã hết hạn, không thể bảo lưu'], 400);
        }

        $oldData = $memberPackage->toArray();
        $memberPackage->update([
            'status' => 'frozen',
            'frozen_at' => now(),
            'freeze_reason' => $validated['reason']
        ]);

        AuditLogService::log($request->user()->id, 'freeze_package', 'member_package', $memberPackage->id, $oldData, $memberPackage->toArray());

        return response()->json([
            'message' => 'Đã bảo lưu gói tập',
            'member_package' => $memberPackage
        ]);
    }

    public function unfreeze(Request $request, MemberPackage $memberPackage)
    {
        if ($memberPackage->status !== 'frozen') {
            return response()->json(['message' => 'Gói không ở trạng thái bảo lưu'], 400);
        }

        $oldData = $memberPackage->toArray();
        
        // Tính số ngày đã bảo lưu
        $frozenAt = Carbon::parse($memberPackage->frozen_at);
        $daysFrozen = $frozenAt->diffInDays(now());
        
        // Cộng thêm số ngày đã bảo lưu vào ngày hết hạn
        $newEndDate = Carbon::parse($memberPackage->end_date)->addDays($daysFrozen);

        $memberPackage->update([
            'status' => 'active',
            'end_date' => $newEndDate,
            'frozen_days' => $memberPackage->frozen_days + $daysFrozen,
            'frozen_at' => null
        ]);

        AuditLogService::log($request->user()->id, 'unfreeze_package', 'member_package', $memberPackage->id, $oldData, $memberPackage->toArray());

        return response()->json([
            'message' => 'Đã mở bảo lưu gói tập',
            'member_package' => $memberPackage
        ]);
    }
}
