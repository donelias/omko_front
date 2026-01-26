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
        if (Schema::hasTable('review_ratings')) {
            return;
        }

        Schema::create('review_ratings', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('agent_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade')->onUpdate('cascade');

            // Calificación y Reseña
            $table->decimal('rating', 3, 2); // 1.00 a 5.00
            $table->string('title')->nullable();
            $table->longText('review')->nullable();

            // Utilidad
            $table->integer('helpful_count')->default(0);
            $table->integer('unhelpful_count')->default(0);

            // Verificación y Estado
            $table->boolean('is_verified_purchase')->default(false);
            $table->string('status')->default('pending'); // pending, approved, rejected, flagged
            $table->boolean('featured')->default(false);

            // Metadata adicional
            $table->json('metadata')->nullable();

            // Auditoria
            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('user_id');
            $table->index('agent_id');
            $table->index('property_id');
            $table->index('rating');
            $table->index('status');
            $table->index('is_verified_purchase');
            $table->index('created_at');
            $table->index(['property_id', 'status']);
            $table->index(['agent_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_ratings');
    }
};
