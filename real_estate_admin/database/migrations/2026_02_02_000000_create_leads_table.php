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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            
            // Lead Information
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            
            // Property and Agent Information
            $table->foreignId('property_id')->nullable()->references('id')->on('propertys')->onDelete('set null');
            $table->foreignId('agent_id')->nullable()->references('id')->on('customers')->onDelete('set null');
            
            // Meta Integration
            $table->string('meta_lead_id')->unique()->comment('Lead ID from Meta');
            $table->string('meta_campaign_id')->nullable()->comment('Campaign ID from Meta');
            $table->string('meta_ad_id')->nullable()->comment('Ad ID from Meta');
            $table->string('meta_form_id')->nullable()->comment('Form ID from Meta');
            
            // Lead Status and Tracking
            $table->enum('status', ['new', 'contacted', 'interested', 'rejected', 'converted'])->default('new');
            $table->enum('source', ['meta', 'website', 'manual'])->default('meta');
            $table->text('notes')->nullable();
            $table->timestamp('contacted_at')->nullable();
            $table->timestamp('converted_at')->nullable();
            
            // Metadata
            $table->json('meta_data')->nullable()->comment('Raw data from Meta webhook');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('property_id');
            $table->index('agent_id');
            $table->index('status');
            $table->index('created_at');
            $table->index('meta_campaign_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
