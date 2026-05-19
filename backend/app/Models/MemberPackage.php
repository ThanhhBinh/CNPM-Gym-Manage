<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'package_id',
        'start_date',
        'end_date',
        'status',
        'frozen_at',
        'frozen_days',
        'freeze_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'frozen_at' => 'datetime',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
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
