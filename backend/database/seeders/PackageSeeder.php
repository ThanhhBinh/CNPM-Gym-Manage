<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Package;

class PackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Gym 1 Tháng',
                'type' => 'monthly',
                'duration_days' => 30,
                'price' => 500000,
                'max_pt_sessions' => null,
                'benefits' => 'Tự do sử dụng thiết bị gym cơ bản.',
                'status' => 'active',
            ],
            [
                'name' => 'Gym 3 Tháng',
                'type' => 'quarterly',
                'duration_days' => 90,
                'price' => 1350000,
                'max_pt_sessions' => null,
                'benefits' => 'Tự do sử dụng thiết bị gym cơ bản, giảm giá 10% khi mua thêm nước.',
                'status' => 'active',
            ],
            [
                'name' => 'Gym 1 Năm VIP',
                'type' => 'yearly',
                'duration_days' => 365,
                'price' => 5000000,
                'max_pt_sessions' => null,
                'benefits' => 'Khăn tắm miễn phí, tủ đồ riêng, gửi xe miễn phí.',
                'status' => 'active',
            ],
            [
                'name' => 'Gói PT 12 Buổi',
                'type' => 'pt',
                'duration_days' => 45,
                'price' => 3600000,
                'max_pt_sessions' => 12,
                'benefits' => '12 buổi tập cùng Huấn luyện viên cá nhân, đo Inbody định kỳ.',
                'status' => 'active',
            ],
        ];

        foreach ($packages as $pkg) {
            Package::firstOrCreate(['name' => $pkg['name']], $pkg);
        }
    }
}
