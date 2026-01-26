<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('old_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index();
            $table->json('names')->nullable(); // Localized names
            $table->integer('duration')->default(30); // days
            $table->decimal('price', 10, 2);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('property_limit')->default(10);
            $table->integer('advertisement_limit')->default(5);
            $table->string('type')->nullable();
            $table->boolean('is_default')->default(false);
            $table->integer('position')->default(0);
            $table->timestamps();
            
            $table->index('status');
            $table->index('position');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('old_packages');
    }
};
