<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Package;
use App\Services\AuditLogService;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $query = Package::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->orderBy('price', 'asc')->get());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:packages,name',
            'type' => 'required|in:monthly,quarterly,yearly,pt',
            'duration_days' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'max_pt_sessions' => 'nullable|integer|min:1',
            'benefits' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ], [
            'name.required' => 'Tên gói tập là bắt buộc.',
            'name.unique' => 'Tên gói tập này đã tồn tại.',
            'type.required' => 'Loại gói tập là bắt buộc.',
            'type.in' => 'Loại gói tập không hợp lệ.',
            'duration_days.required' => 'Số ngày hiệu lực là bắt buộc.',
            'duration_days.integer' => 'Số ngày hiệu lực phải là số nguyên.',
            'duration_days.min' => 'Số ngày hiệu lực tối thiểu là 1.',
            'price.required' => 'Giá tiền là bắt buộc.',
            'price.numeric' => 'Giá tiền phải là số.',
            'price.min' => 'Giá tiền không được nhỏ hơn 0.',
            'status.required' => 'Trạng thái là bắt buộc.',
            'status.in' => 'Trạng thái không hợp lệ.',
        ]);

        $package = Package::create($validated);

        AuditLogService::log($request->user()->id, 'create', 'package', $package->id, null, $package->toArray());

        return response()->json([
            'message' => 'Tạo gói tập thành công',
            'package' => $package
        ], 201);
    }

    public function show(Package $package)
    {
        return response()->json($package);
    }

    public function update(Request $request, Package $package)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:packages,name,' . $package->id,
            'type' => 'required|in:monthly,quarterly,yearly,pt',
            'duration_days' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'max_pt_sessions' => 'nullable|integer|min:1',
            'benefits' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ], [
            'name.required' => 'Tên gói tập là bắt buộc.',
            'name.unique' => 'Tên gói tập này đã tồn tại.',
            'type.required' => 'Loại gói tập là bắt buộc.',
            'type.in' => 'Loại gói tập không hợp lệ.',
            'duration_days.required' => 'Số ngày hiệu lực là bắt buộc.',
            'duration_days.integer' => 'Số ngày hiệu lực phải là số nguyên.',
            'duration_days.min' => 'Số ngày hiệu lực tối thiểu là 1.',
            'price.required' => 'Giá tiền là bắt buộc.',
            'price.numeric' => 'Giá tiền phải là số.',
            'price.min' => 'Giá tiền không được nhỏ hơn 0.',
            'status.required' => 'Trạng thái là bắt buộc.',
            'status.in' => 'Trạng thái không hợp lệ.',
        ]);

        $oldData = $package->toArray();
        $package->update($validated);

        AuditLogService::log($request->user()->id, 'update', 'package', $package->id, $oldData, $package->toArray());

        return response()->json([
            'message' => 'Cập nhật thành công',
            'package' => $package
        ]);
    }

    public function destroy(Request $request, Package $package)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Check if package is being used
        if ($package->memberPackages()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa vì đang có hội viên sử dụng. Vui lòng chuyển gói hoặc gia hạn trước.'
            ], 400);
        }

        $oldData = $package->toArray();
        $package->delete();

        AuditLogService::log($request->user()->id, 'delete', 'package', $package->id, $oldData, null);

        return response()->json(['message' => 'Đã xóa gói tập']);
    }

    public function duplicate(Request $request, Package $package)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $newPackage = $package->replicate();
        $newPackage->name = $newPackage->name . ' (Copy)';
        $newPackage->status = 'inactive';
        $newPackage->save();

        AuditLogService::log($request->user()->id, 'duplicate', 'package', $newPackage->id, null, $newPackage->toArray());

        return response()->json([
            'message' => 'Đã sao chép gói tập',
            'package' => $newPackage
        ], 201);
    }
}
