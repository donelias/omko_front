<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_extra_time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->string('day_of_week'); // Monday, Tuesday, etc
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('max_appointments')->default(5);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('agent_id');
            $table->index('day_of_week');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_extra_time_slots');
    }
};
