<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('member_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->foreignId('package_id')->constrained('packages');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['active', 'expired', 'frozen', 'cancelled'])->default('active');
            $table->timestamp('frozen_at')->nullable();
            $table->unsignedInteger('frozen_days')->default(0);
            $table->text('freeze_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_packages');
    }
};
