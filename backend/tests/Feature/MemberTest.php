<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Member;

class MemberTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $receptionist;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->receptionist = User::factory()->create([
            'role' => 'receptionist',
        ]);
    }

    public function test_receptionist_can_list_members()
    {
        Member::create([
            'full_name' => 'Nguyen Van A',
            'phone' => '0911111111',
            'status' => 'active',
            'member_code' => 'GYM-AAAAAA',
            'registered_by' => $this->receptionist->id,
        ]);

        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->getJson('/api/members');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'full_name' => 'Nguyen Van A',
                'phone' => '0911111111',
            ]);
    }

    public function test_receptionist_can_create_member()
    {
        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->postJson('/api/members', [
                'full_name' => 'Tran Thi B',
                'phone' => '0922222222',
                'id_card' => '123456789',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'full_name' => 'Tran Thi B',
                'phone' => '0922222222',
            ]);

        $this->assertDatabaseHas('members', [
            'phone' => '0922222222',
        ]);
    }

    public function test_receptionist_cannot_lock_member()
    {
        $member = Member::create([
            'full_name' => 'Nguyen Van A',
            'phone' => '0911111111',
            'status' => 'active',
            'member_code' => 'GYM-AAAAAA',
            'registered_by' => $this->receptionist->id,
        ]);

        $response = $this->actingAs($this->receptionist, 'sanctum')
            ->patchJson("/api/members/{$member->id}/lock", [
                'reason' => 'Vi pham noi quy',
            ]);

        // Receptionist cannot lock members (only admin has rights based on RoleMiddleware role:admin)
        $response->assertStatus(403);
    }

    public function test_admin_can_lock_member()
    {
        $member = Member::create([
            'full_name' => 'Nguyen Van A',
            'phone' => '0911111111',
            'status' => 'active',
            'member_code' => 'GYM-AAAAAA',
            'registered_by' => $this->receptionist->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/members/{$member->id}/lock", [
                'reason' => 'Vi pham noi quy',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => 'locked',
            'lock_reason' => 'Vi pham noi quy',
        ]);
    }
}
