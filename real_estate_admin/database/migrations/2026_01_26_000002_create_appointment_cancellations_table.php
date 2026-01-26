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
        if (Schema::hasTable('appointment_cancellations')) {
            return;
        }

        Schema::create('appointment_cancellations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('appointment_id')
                  ->constrained('appointments')
                  ->cascadeOnDelete();

            $table->enum('reason', [
                'user_cancelled',
                'agent_cancelled',
                'admin_cancelled',
                'property_unavailable',
                'agent_unavailable',
                'personal_reasons',
                'other'
            ])->nullable();

            $table->foreignId('cancelled_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->dateTime('cancelled_at')->default(now());
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index('appointment_id');
            $table->index('cancelled_by');
            $table->index('cancelled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_cancellations');
    }
};
