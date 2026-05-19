<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hóa Đơn {{ $payment->invoice_code }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 14px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #2563eb;
        }
        .info-table, .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .info-table td {
            padding: 5px 0;
        }
        .item-table th, .item-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        .item-table th {
            background-color: #f3f4f6;
        }
        .total-row {
            font-weight: bold;
            background-color: #f9fafb;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>GYM MANAGEMENT</h1>
        <p>HÓA ĐƠN THANH TOÁN</p>
    </div>

    <table class="info-table">
        <tr>
            <td><strong>Mã HĐ:</strong> {{ $payment->invoice_code }}</td>
            <td style="text-align: right;"><strong>Ngày:</strong> {{ $payment->paid_at->format('d/m/Y H:i') }}</td>
        </tr>
        <tr>
            <td><strong>Khách hàng:</strong> {{ $payment->member->full_name ?? 'N/A' }}</td>
            <td style="text-align: right;"><strong>SĐT:</strong> {{ $payment->member->phone ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td><strong>Thu ngân:</strong> {{ $payment->collector->name ?? 'N/A' }}</td>
            <td style="text-align: right;"><strong>Thanh toán:</strong> {{ strtoupper($payment->payment_method) }}</td>
        </tr>
    </table>

    <table class="item-table">
        <thead>
            <tr>
                <th>STT</th>
                <th>Tên Dịch Vụ / Gói Tập</th>
                <th style="text-align: right;">Đơn Giá (VNĐ)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>
                    {{ $payment->memberPackage->package->name ?? 'Dịch vụ' }}
                    <br>
                    <small>Thời hạn: {{ optional($payment->memberPackage)->start_date?->format('d/m/Y') }} - {{ optional($payment->memberPackage)->end_date?->format('d/m/Y') }}</small>
                </td>
                <td style="text-align: right;">{{ number_format($payment->amount, 0, ',', '.') }}</td>
            </tr>
            @if($payment->discount > 0)
            <tr>
                <td colspan="2" style="text-align: right;"><strong>Giảm Giá:</strong></td>
                <td style="text-align: right;">-{{ number_format($payment->discount, 0, ',', '.') }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td colspan="2" style="text-align: right;">TỔNG THANH TOÁN:</td>
                <td style="text-align: right;">{{ number_format($payment->final_amount, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
        <p>Hóa đơn này được tạo tự động bởi hệ thống Gym Management.</p>
    </div>

</body>
</html>
