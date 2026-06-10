<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;
use Illuminate\Support\Str;
use App\Services\AuditLogService;
use App\Services\QrCodeService;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = Member::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('full_name', 'like', "%{$search}%")
                  ->orWhere('member_code', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('id_card', 'like', "%{$search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:members,phone',
            'email' => 'nullable|email|max:255',
            'id_card' => 'nullable|string|max:20|unique:members,id_card',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'branch' => 'nullable|string|max:100',
        ], [
            'full_name.required' => 'Họ và tên là bắt buộc.',
            'phone.required' => 'Số điện thoại là bắt buộc.',
            'phone.unique' => 'Số điện thoại này đã được đăng ký.',
            'email.email' => 'Email không đúng định dạng.',
            'id_card.unique' => 'Số CCCD/CMND này đã tồn tại trong hệ thống.',
            'date_of_birth.date' => 'Ngày sinh không đúng định dạng ngày.',
        ]);

        $validated['member_code'] = 'GYM-' . strtoupper(Str::random(6));
        $validated['registered_by'] = $request->user()->id;

        $member = Member::create($validated);

        // Generate QR Token after member creation
        $token = \App\Services\QrCodeService::generateToken($member->id);
        $member->update(['qr_token' => $token]);

        AuditLogService::log($request->user()->id, 'create', 'member', $member->id, null, $member->toArray());

        return response()->json([
            'message' => 'Tạo hội viên thành công',
            'member' => $member
        ], 201);
    }

    public function show(Member $member)
    {
        $member->load(['packages', 'payments', 'checkIns']);
        return response()->json($member);
    }

    public function update(Request $request, Member $member)
    {
        // Lễ tân có quyền sửa các trường cơ bản
        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20|unique:members,phone,' . $member->id,
            'email' => 'nullable|email|max:255',
            'id_card' => 'nullable|string|max:20|unique:members,id_card,' . $member->id,
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
        ], [
            'phone.unique' => 'Số điện thoại này đã được đăng ký.',
            'email.email' => 'Email không đúng định dạng.',
            'id_card.unique' => 'Số CCCD/CMND này đã tồn tại trong hệ thống.',
            'date_of_birth.date' => 'Ngày sinh không đúng định dạng ngày.',
        ]);

        $oldData = $member->toArray();
        $member->update($validated);

        AuditLogService::log($request->user()->id, 'update', 'member', $member->id, $oldData, $member->toArray());

        return response()->json([
            'message' => 'Cập nhật thành công',
            'member' => $member
        ]);
    }

    public function lock(Request $request, Member $member)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate(['reason' => 'required|string']);

        $oldData = $member->toArray();
        $member->update([
            'status' => 'locked',
            'lock_reason' => $request->reason
        ]);

        AuditLogService::log($request->user()->id, 'lock', 'member', $member->id, $oldData, $member->toArray());

        return response()->json([
            'message' => 'Đã khóa hội viên',
            'member' => $member
        ]);
    }

    /**
    * Return QR code image for a member (download PNG).
    */
    public function qr(Member $member)
    {
        // Ensure member has a QR token
        if (empty($member->qr_token)) {
            $member->qr_token = QrCodeService::generateToken($member->id);
            $member->save();
        }
        $token = $member->qr_token;
        $imageBase64 = QrCodeService::generateQrImage($token);
        // Strip data URI prefix and decode
        $base64 = preg_replace('#^data:image/\w+;base64,#i', '', $imageBase64);
        $binary = base64_decode($base64);
        return response($binary, 200)
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', "attachment; filename=\"member_{$member->member_code}_qr.png\"");
    }

    // Existing unlock method remains unchanged
    public function unlock(Request $request, Member $member)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $oldData = $member->toArray();
        $member->update([
            'status' => 'active',
            'lock_reason' => null
        ]);

        AuditLogService::log($request->user()->id, 'unlock', 'member', $member->id, $oldData, $member->toArray());

        return response()->json([
            'message' => 'Đã mở khóa hội viên',
            'member' => $member
        ]);
    }

}
