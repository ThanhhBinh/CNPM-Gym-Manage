<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Services\AuditLogService;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['member', 'memberPackage.package', 'collector', 'refunder']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('method')) {
            $query->where('payment_method', $request->method);
        }

        return response()->json($query->orderBy('paid_at', 'desc')->paginate(20));
    }

    public function show(Payment $payment)
    {
        $payment->load(['member', 'memberPackage.package', 'collector', 'refunder']);
        return response()->json($payment);
    }

    public function refund(Request $request, Payment $payment)
    {
        // Cả Chủ và Lễ tân đều được hoàn tiền (BR-08)
        $validated = $request->validate([
            'reason' => 'required|string'
        ]);

        if ($payment->status === 'refunded') {
            return response()->json(['message' => 'Hóa đơn này đã được hoàn tiền trước đó'], 400);
        }

        $oldData = $payment->toArray();

        $payment->update([
            'status' => 'refunded',
            'refund_reason' => $validated['reason'],
            'refunded_by' => $request->user()->id
        ]);

        // Hủy luôn gói tập liên kết nếu cần thiết
        if ($payment->memberPackage) {
            $payment->memberPackage->update(['status' => 'cancelled']);
        }

        AuditLogService::log($request->user()->id, 'refund', 'payment', $payment->id, $oldData, $payment->toArray());

        return response()->json([
            'message' => 'Hoàn tiền thành công',
            'payment' => $payment
        ]);
    }

    public function downloadInvoice(Payment $payment)
    {
        $payment->load(['member', 'memberPackage.package', 'collector']);

        $pdf = Pdf::loadView('invoice', ['payment' => $payment]);
        
        return $pdf->download('Invoice_' . $payment->invoice_code . '.pdf');
    }
}
