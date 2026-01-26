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
        if (Schema::hasTable('agent_availabilities')) {
            return;
        }

        Schema::create('agent_availabilities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('agent_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Día de la semana: 0 = Lunes, 6 = Domingo
            $table->integer('day_of_week'); // 0-6

            // Horario de trabajo
            $table->time('start_time'); // Ej: 09:00
            $table->time('end_time');   // Ej: 18:00

            // Disponibilidad
            $table->boolean('is_available')->default(true);

            // Descanso (almuerzo, etc)
            $table->time('break_start')->nullable(); // Ej: 13:00
            $table->time('break_end')->nullable();   // Ej: 14:00

            $table->timestamps();

            // Indexes
            $table->index('agent_id');
            $table->index('day_of_week');
            $table->index('is_available');
            $table->unique(['agent_id', 'day_of_week']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_availabilities');
    }
};
