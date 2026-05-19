<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MemberPackage;
use Carbon\Carbon;

class ExpirePackages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'packages:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kiểm tra và cập nhật trạng thái các gói tập đã hết hạn';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredPackages = MemberPackage::where('status', 'active')
            ->whereDate('end_date', '<', Carbon::today())
            ->get();

        $count = 0;
        foreach ($expiredPackages as $package) {
            $package->update(['status' => 'expired']);
            $count++;
        }

        $this->info("Đã cập nhật {$count} gói tập hết hạn.");
    }
}
