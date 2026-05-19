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
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('member_code', 20)->unique();
            $table->string('full_name');
            $table->string('phone', 20)->unique();
            $table->string('email')->nullable();
            $table->string('id_card', 20)->unique()->nullable();
            $table->date('date_of_birth')->nullable();
            $table->text('address')->nullable();
            $table->string('avatar', 500)->nullable();
            $table->string('qr_token', 500)->unique()->nullable();
            $table->json('body_metrics')->nullable();
            $table->enum('status', ['active', 'locked', 'suspended'])->default('active');
            $table->text('lock_reason')->nullable();
            $table->string('branch', 100)->nullable();
            $table->foreignId('registered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
