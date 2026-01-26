<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_booking_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->boolean('allow_bookings')->default(true);
            $table->integer('booking_advance_days')->default(30);
            $table->integer('max_daily_bookings')->default(10);
            $table->boolean('allow_weekend_bookings')->default(true);
            $table->boolean('allow_evening_bookings')->default(true);
            $table->integer('preferred_booking_duration')->default(60); // minutes
            $table->boolean('auto_accept_bookings')->default(false);
            $table->text('booking_confirmation_message')->nullable();
            $table->text('cancellation_policy')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            
            $table->unique('agent_id');
            $table->index('allow_bookings');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_booking_preferences');
    }
};
