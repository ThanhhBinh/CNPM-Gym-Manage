<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\Api\MemberController;

use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\MemberPackageController;
use App\Http\Controllers\Api\CheckInController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;

Route::post('/auth/login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Dashboard Stats
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    // Reports (admin only)
    Route::get('/reports', [ReportController::class, 'index'])->middleware('role:admin');
    
    // QR code for member
    Route::get('/members/{member}/qr', [MemberController::class, 'qr'])->withoutMiddleware(['auth:sanctum']);
    // Existing members routes
    Route::apiResource('members', MemberController::class);
    Route::patch('/members/{member}/lock', [MemberController::class, 'lock'])->middleware('role:admin');
    Route::patch('/members/{member}/unlock', [MemberController::class, 'unlock'])->middleware('role:admin');
    
    // Member Packages
    Route::post('/members/{member}/packages', [MemberPackageController::class, 'store']);
    Route::patch('/member-packages/{memberPackage}/renew', [MemberPackageController::class, 'renew']);
    Route::patch('/member-packages/{memberPackage}/freeze', [MemberPackageController::class, 'freeze']);
    Route::patch('/member-packages/{memberPackage}/unfreeze', [MemberPackageController::class, 'unfreeze']);

    // Packages
    Route::apiResource('packages', PackageController::class);
    Route::post('/packages/{package}/duplicate', [PackageController::class, 'duplicate'])->middleware('role:admin');

    // Check-in
    Route::post('/check-ins/scan', [CheckInController::class, 'scanQr']);
    Route::post('/check-ins/manual', [CheckInController::class, 'manual']);
    Route::get('/check-ins/calendar', [CheckInController::class, 'calendar']);
    Route::get('/check-ins', [CheckInController::class, 'index']);

    // Payments
    Route::get('/payments', [\App\Http\Controllers\Api\PaymentController::class, 'index']);
    Route::get('/payments/{payment}', [\App\Http\Controllers\Api\PaymentController::class, 'show']);
    Route::get('/payments/{payment}/invoice', [\App\Http\Controllers\Api\PaymentController::class, 'downloadInvoice']);
    Route::post('/payments/{payment}/refund', [\App\Http\Controllers\Api\PaymentController::class, 'refund']);
});
