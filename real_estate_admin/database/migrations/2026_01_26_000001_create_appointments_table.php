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
        if (Schema::hasTable('appointments')) {
            return;
        }

        Schema::create('appointments', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->foreignId('agent_id')
                  ->nullable()
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->foreignId('property_id')
                  ->nullable()
                  ->constrained('properties')
                  ->cascadeOnDelete();

            $table->foreignId('project_id')
                  ->nullable()
                  ->constrained('project_plans')
                  ->cascadeOnDelete();

            // Appointment Details
            $table->string('title')->nullable();
            $table->json('contents')->nullable(); // Para traducciones {es: {title, description}, en: {title, description}}
            $table->enum('status', [
                'scheduled',
                'confirmed',
                'completed',
                'cancelled',
                'no_show',
                'rescheduled'
            ])->default('scheduled');

            $table->enum('meeting_type', [
                'property_viewing',
                'consultation',
                'document_review',
                'payment_discussion',
                'project_tour'
            ])->default('property_viewing');

            // Date & Time
            $table->date('appointment_date');
            $table->dateTime('appointment_time');
            $table->integer('duration_minutes')->default(30);

            // Location Info
            $table->boolean('is_virtual')->default(false);
            $table->string('location')->nullable(); // Dirección física o nombre del lugar
            $table->text('video_call_link')->nullable(); // Link de Zoom, Google Meet, etc.

            // Additional Info
            $table->text('notes')->nullable(); // Notas adicionales de la reunión
            $table->string('color')->nullable(); // Para calendario (ej: #FF5733)

            // Timestamps
            $table->softDeletes();
            $table->timestamps();

            // Indexes para mejora de performance
            $table->index('user_id');
            $table->index('agent_id');
            $table->index('property_id');
            $table->index('project_id');
            $table->index('status');
            $table->index('appointment_date');
            $table->index('meeting_type');
            $table->index(['user_id', 'status']);
            $table->index(['agent_id', 'appointment_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
