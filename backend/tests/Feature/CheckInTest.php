<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Member;
use App\Models\Package;
use App\Models\MemberPackage;
use App\Services\QrCodeService;
use Carbon\Carbon;

class CheckInTest extends TestCase
{
    use RefreshDatabase;

    private $receptionist;
    private $member;
    private $package;

    protected function setUp(): void
    {
        parent::setUp();

        $this->receptionist = User::factory()->create([
            'role' => 'receptionist',
        ]);

        $this->member = Member::create([
            'full_name' => 'Nguyen Van A',
            'phone' => '0911111111',
            'status' => 'active',
            'member_code' => 'GYM-AAAAAA',
            'registered_by' => $this->receptionist->id,
        ]);

        $this->package = Package::create([
            'name' => 'Gym Monthly',
            'type' => 'monthly',
            'duration_days' => 30,
            'price' => 500000,
            'status' => 'active',
        ]);
    }

    public function test_member_cannot_checkin_without_package()
    {
        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/check-ins/manual', [
                'member_code' => $this->member->member_code,
            ]);

        $response->assertStatus(400)
            ->assertJsonFragment([
                'message' => 'Gói tập đã hết hạn hoặc không có gói hợp lệ. Vui lòng gia hạn.',
                'status' => 'expired'
            ]);
    }

    public function test_member_cannot_checkin_if_locked()
    {
        $this->member->update([
            'status' => 'locked',
            'lock_reason' => 'Chua thanh toan du',
        ]);

        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/check-ins/manual', [
                'member_code' => $this->member->member_code,
            ]);

        $response->assertStatus(403)
            ->assertJsonFragment([
                'message' => 'Hội viên đã bị khóa. Chua thanh toan du',
                'status' => 'error'
            ]);
    }

    public function test_member_can_checkin_with_active_package()
    {
        $memberPackage = MemberPackage::create([
            'member_id' => $this->member->id,
            'package_id' => $this->package->id,
            'start_date' => Carbon::today(),
            'end_date' => Carbon::today()->addDays(30),
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/check-ins/manual', [
                'member_code' => $this->member->member_code,
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Check-in thành công!',
                'status' => 'success'
            ]);

        $this->assertDatabaseHas('check_ins', [
            'member_id' => $this->member->id,
            'member_package_id' => $memberPackage->id,
        ]);
    }

    public function test_member_can_checkin_via_qr_code()
    {
        $memberPackage = MemberPackage::create([
            'member_id' => $this->member->id,
            'package_id' => $this->package->id,
            'start_date' => Carbon::today(),
            'end_date' => Carbon::today()->addDays(30),
            'status' => 'active',
        ]);

        $token = QrCodeService::generateToken($this->member->id);

        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/check-ins/scan', [
                'token' => $token,
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Check-in thành công!',
                'status' => 'success'
            ]);
    }
}
