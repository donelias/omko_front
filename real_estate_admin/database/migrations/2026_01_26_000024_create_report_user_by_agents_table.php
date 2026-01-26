<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_user_by_agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('reported_user_id')->constrained('users')->onDelete('cascade');
            $table->string('reason')->nullable();
            $table->longText('description')->nullable();
            $table->boolean('status')->default(false); // false = pending, true = resolved
            $table->timestamps();
            
            $table->index('agent_id');
            $table->index('reported_user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_user_by_agents');
    }
};
