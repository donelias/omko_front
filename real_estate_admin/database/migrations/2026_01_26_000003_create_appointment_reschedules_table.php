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
        if (Schema::hasTable('appointment_reschedules')) {
            return;
        }

        Schema::create('appointment_reschedules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('appointment_id')
                  ->constrained('appointments')
                  ->cascadeOnDelete();

            // Original appointment info
            $table->date('original_date');
            $table->dateTime('original_time');

            // New appointment info
            $table->date('new_date');
            $table->dateTime('new_time');

            // Reschedule metadata
            $table->enum('reason', [
                'user_request',
                'agent_request',
                'admin_request',
                'conflict',
                'unavailable',
                'other'
            ])->nullable();

            $table->foreignId('rescheduled_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index('appointment_id');
            $table->index('original_date');
            $table->index('new_date');
            $table->index('rescheduled_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_reschedules');
    }
};
