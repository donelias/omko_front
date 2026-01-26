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
        if (Schema::hasTable('agent_unavailabilities')) {
            return;
        }

        Schema::create('agent_unavailabilities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('agent_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Period information
            $table->string('title')->nullable(); // Ej: "Vacaciones Diciembre"
            $table->enum('reason', [
                'vacation',
                'sick_leave',
                'personal',
                'training',
                'other'
            ])->nullable();

            $table->date('start_date');
            $table->date('end_date');

            // Status
            $table->boolean('is_blocked')->default(true); // Si está activo/bloqueado

            // Additional info
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('agent_id');
            $table->index('start_date');
            $table->index('end_date');
            $table->index('reason');
            $table->index('is_blocked');
            $table->index(['agent_id', 'start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_unavailabilities');
    }
};
