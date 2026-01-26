<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained('packages')->onDelete('cascade');
            $table->string('name')->index();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('value')->nullable();
            $table->boolean('is_included')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index('package_id');
            $table->index('is_included');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('features');
    }
};
