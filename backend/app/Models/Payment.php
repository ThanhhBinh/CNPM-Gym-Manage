<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_code',
        'member_id',
        'member_package_id',
        'amount',
        'discount',
        'final_amount',
        'payment_method',
        'status',
        'refund_reason',
        'refunded_by',
        'collected_by',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function memberPackage()
    {
        return $this->belongsTo(MemberPackage::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function refunder()
    {
        return $this->belongsTo(User::class, 'refunded_by');
    }
}
