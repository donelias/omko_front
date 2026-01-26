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
        if (Schema::hasTable('property_views')) {
            return;
        }

        Schema::create('property_views', function (Blueprint $table) {
            $table->id();

            $table->foreignId('property_id')
                  ->constrained('properties')
                  ->cascadeOnDelete();

            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Request information
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('referer')->nullable(); // De dónde vino el usuario

            // Geolocation (opcional, puede usar API de geoIP)
            $table->string('country')->nullable();
            $table->string('city')->nullable();

            // Device type
            $table->enum('device_type', [
                'desktop',
                'mobile',
                'tablet'
            ])->nullable();

            // Timestamp
            $table->dateTime('viewed_at')->default(now());

            $table->timestamps();

            // Indexes para queries frecuentes
            $table->index('property_id');
            $table->index('user_id');
            $table->index('viewed_at');
            $table->index('ip_address');
            $table->index('device_type');
            $table->index('country');
            $table->index(['property_id', 'viewed_at']);
            $table->index(['user_id', 'viewed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_views');
    }
};
