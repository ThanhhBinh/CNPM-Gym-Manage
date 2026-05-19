<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_code',
        'full_name',
        'phone',
        'email',
        'id_card',
        'date_of_birth',
        'address',
        'avatar',
        'qr_token',
        'body_metrics',
        'status',
        'lock_reason',
        'branch',
        'registered_by',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'body_metrics' => 'array',
    ];

    public function registrar()
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public function packages()
    {
        return $this->hasMany(MemberPackage::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function checkIns()
    {
        return $this->hasMany(CheckIn::class);
    }
}
