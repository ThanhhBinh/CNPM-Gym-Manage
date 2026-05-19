<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        User::firstOrCreate(
            ['phone' => '0901234567'],
            [
                'name' => 'Admin Chủ Phòng Tập',
                'email' => 'admin@gym.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // Receptionist
        User::firstOrCreate(
            ['phone' => '0909876543'],
            [
                'name' => 'Lễ Tân 1',
                'email' => 'letan@gym.com',
                'password' => Hash::make('password'),
                'role' => 'receptionist',
                'shift' => 'Sáng',
                'status' => 'active',
            ]
        );
    }
}
