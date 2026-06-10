<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;
use App\Models\CheckIn;
use App\Models\Payment;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $months = min((int) $request->get('months', 6), 12);
        $now = Carbon::now();
        $reports = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $year = $date->year;
            $month = $date->month;

            $revenue = Payment::where('status', 'paid')
                ->whereMonth('paid_at', $month)
                ->whereYear('paid_at', $year)
                ->sum('final_amount');

            $newMembers = Member::whereMonth('created_at', $month)
                ->whereYear('created_at', $year)
                ->count();

            $checkinCount = CheckIn::whereMonth('checked_in_at', $month)
                ->whereYear('checked_in_at', $year)
                ->count();

            $reports[] = [
                'id' => $months - $i,
                'period' => $date->format('Y-m'),
                'period_label' => $date->locale('vi')->isoFormat('MMMM YYYY'),
                'revenue' => (int) $revenue,
                'new_members' => $newMembers,
                'checkin_count' => $checkinCount,
            ];
        }

        $currentMonth = $reports[count($reports) - 1] ?? null;
        $prevMonth = $reports[count($reports) - 2] ?? null;

        return response()->json([
            'reports' => $reports,
            'summary' => [
                'current_month_revenue' => $currentMonth['revenue'] ?? 0,
                'current_month_members' => $currentMonth['new_members'] ?? 0,
                'current_month_checkins' => $currentMonth['checkin_count'] ?? 0,
                'revenue_change' => $this->percentChange(
                    $prevMonth['revenue'] ?? 0,
                    $currentMonth['revenue'] ?? 0
                ),
                'members_change' => $this->percentChange(
                    $prevMonth['new_members'] ?? 0,
                    $currentMonth['new_members'] ?? 0
                ),
                'checkins_change' => $this->percentChange(
                    $prevMonth['checkin_count'] ?? 0,
                    $currentMonth['checkin_count'] ?? 0
                ),
            ],
        ]);
    }

    private function percentChange(int $previous, int $current): ?int
    {
        if ($previous === 0) {
            return $current > 0 ? 100 : 0;
        }

        return (int) round((($current - $previous) / $previous) * 100);
    }
}
