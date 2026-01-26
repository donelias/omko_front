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
        if (Schema::hasTable('user_package_limits')) {
            return;
        }

        Schema::create('user_package_limits', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('package_id')->constrained('packages')->onDelete('cascade')->onUpdate('cascade');

            // Cuota
            $table->integer('quota_limit')->default(0); // Límite de cuota
            $table->integer('quota_used')->default(0);  // Cuota utilizada

            // Reset
            $table->string('reset_frequency')->default('monthly'); // monthly, quarterly, annually, never
            $table->datetime('last_reset_at')->nullable();
            $table->datetime('next_reset_at')->nullable();

            // Estado
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();

            // Auditoria
            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('user_id');
            $table->index('package_id');
            $table->index('is_active');
            $table->index('next_reset_at');
            $table->unique(['user_id', 'package_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_package_limits');
    }
};
