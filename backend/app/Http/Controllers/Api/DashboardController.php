<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;
use App\Models\CheckIn;
use App\Models\MemberPackage;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $now = Carbon::now();
        
        // 1. Active Members
        $activeMembers = Member::where('status', 'active')->count();
        $prevActiveMembers = Member::where('status', 'active')
            ->where('created_at', '<', $now->copy()->startOfMonth())
            ->count();
        $memberChange = 0;
        if ($prevActiveMembers > 0) {
            $memberChange = round((($activeMembers - $prevActiveMembers) / $prevActiveMembers) * 100);
        }

        // 2. Monthly Revenue
        $currentMonthRevenue = Payment::where('status', 'paid')
            ->whereMonth('paid_at', $now->month)
            ->whereYear('paid_at', $now->year)
            ->sum('final_amount');
            
        $lastMonthRevenue = Payment::where('status', 'paid')
            ->whereMonth('paid_at', $now->copy()->subMonth()->month)
            ->whereYear('paid_at', $now->copy()->subMonth()->year)
            ->sum('final_amount');
            
        $revenueChange = 0;
        if ($lastMonthRevenue > 0) {
            $revenueChange = round((($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100);
        }

        // 3. Today's Check-ins
        $todayCheckins = CheckIn::whereDate('checked_in_at', $now->toDateString())->count();
        $yesterdayCheckins = CheckIn::whereDate('checked_in_at', $now->copy()->subDay()->toDateString())->count();
        $checkinChange = 0;
        if ($yesterdayCheckins > 0) {
            $checkinChange = round((($todayCheckins - $yesterdayCheckins) / $yesterdayCheckins) * 100);
        } else if ($todayCheckins > 0) {
            $checkinChange = 100;
        }

        // 4. Expiring Packages (in next 7 days)
        $expiringPackages = MemberPackage::where('status', 'active')
            ->whereBetween('end_date', [$now->toDateString(), $now->copy()->addDays(7)->toDateString()])
            ->count();

        // 5. Check-in Activity by day (last 7 days)
        $checkinActivity = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $dayName = $date->locale('vi')->isoFormat('dd'); // T2, T3, etc.
            
            // Map Day names to T2, T3...
            $dayMap = [
                'Th 2' => 'T2',
                'Th 3' => 'T3',
                'Th 4' => 'T4',
                'Th 5' => 'T5',
                'Th 6' => 'T6',
                'Th 7' => 'T7',
                'CN'   => 'CN'
            ];
            $shortDay = $dayMap[$dayName] ?? $dayName;

            $count = CheckIn::whereDate('checked_in_at', $date->toDateString())->count();
            $checkinActivity[] = [
                'day' => $shortDay,
                'date' => $date->format('d/m'),
                'count' => $count
            ];
        }

        // 6. Popular Packages
        $totalActivePackages = MemberPackage::where('status', 'active')->count() ?: 1;
        $popularPackages = DB::table('member_packages')
            ->join('packages', 'member_packages.package_id', '=', 'packages.id')
            ->select('packages.name', DB::raw('count(member_packages.id) as users'))
            ->groupBy('packages.id', 'packages.name') // Corrected group by columns
            ->orderBy('users', 'desc')
            ->limit(3)
            ->get();
            
        $formattedPopular = collect($popularPackages)->map(function ($pkg) use ($totalActivePackages) {
            return [
                'name' => $pkg->name,
                'users' => $pkg->users,
                'percent' => round(($pkg->users / $totalActivePackages) * 100)
            ];
        });

        // 7. Revenue trend (last 6 months)
        $revenueTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $revenue = Payment::where('status', 'paid')
                ->whereMonth('paid_at', $date->month)
                ->whereYear('paid_at', $date->year)
                ->sum('final_amount');

            $revenueTrend[] = [
                'label' => $date->locale('vi')->isoFormat('MMM'),
                'month' => $date->format('Y-m'),
                'revenue' => (int) $revenue,
            ];
        }

        // 8. Payment method breakdown (current month)
        $paymentBreakdown = Payment::where('status', 'paid')
            ->whereMonth('paid_at', $now->month)
            ->whereYear('paid_at', $now->year)
            ->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(final_amount) as total'))
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($row) => [
                'method' => $row->payment_method,
                'label' => match ($row->payment_method) {
                    'cash' => 'Tiền mặt',
                    'transfer' => 'Chuyển khoản',
                    'card' => 'Thẻ POS',
                    default => $row->payment_method,
                },
                'count' => (int) $row->count,
                'total' => (int) $row->total,
            ]);

        // 9. Member growth (last 6 months)
        $memberGrowth = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $count = Member::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();

            $memberGrowth[] = [
                'label' => $date->locale('vi')->isoFormat('MMM'),
                'month' => $date->format('Y-m'),
                'count' => $count,
            ];
        }

        // 10. Recent check-ins
        $recentCheckIns = CheckIn::with('member')
            ->orderBy('checked_in_at', 'desc')
            ->limit(8)
            ->get()
            ->map(fn ($checkIn) => [
                'id' => $checkIn->id,
                'member_name' => $checkIn->member?->full_name ?? '—',
                'member_code' => $checkIn->member?->member_code ?? '—',
                'method' => $checkIn->method,
                'checked_in_at' => $checkIn->checked_in_at->toIso8601String(),
            ]);

        return response()->json([
            'stats' => [
                'active_members' => [
                    'value' => number_format($activeMembers),
                    'change' => ($memberChange >= 0 ? '+' : '') . $memberChange . '%'
                ],
                'monthly_revenue' => [
                    'value' => $this->formatRevenue($currentMonthRevenue),
                    'change' => ($revenueChange >= 0 ? '+' : '') . $revenueChange . '%'
                ],
                'today_checkins' => [
                    'value' => number_format($todayCheckins),
                    'change' => ($checkinChange >= 0 ? '+' : '') . $checkinChange . '%'
                ],
                'expiring_packages' => [
                    'value' => number_format($expiringPackages),
                    'change' => null
                ]
            ],
            'checkin_activity' => $checkinActivity,
            'popular_packages' => $formattedPopular,
            'revenue_trend' => $revenueTrend,
            'payment_breakdown' => $paymentBreakdown,
            'member_growth' => $memberGrowth,
            'recent_checkins' => $recentCheckIns,
        ]);
    }

    private function formatRevenue($amount)
    {
        if ($amount >= 1000000000) {
            return round($amount / 1000000000, 1) . 'B';
        }
        if ($amount >= 1000000) {
            return round($amount / 1000000, 1) . 'M';
        }
        if ($amount >= 1000) {
            return round($amount / 1000, 1) . 'K';
        }
        return number_format($amount);
    }
}
