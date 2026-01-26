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
        Schema::create('newsletter_subscriptions', function (Blueprint $table) {
            $table->id();
            
            // User relationship
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Email information
            $table->string('email')->unique();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            
            // Subscription status
            $table->enum('status', ['active', 'inactive', 'unsubscribed', 'bounced'])->default('inactive');
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'never'])->default('weekly');
            
            // Preferences
            $table->json('categories')->nullable()->comment('Categorías de interés');
            
            // Verification
            $table->boolean('is_verified')->default(false);
            $table->string('verification_token')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('unsubscribe_token')->unique();
            
            // Tracking
            $table->timestamp('subscribed_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->timestamp('last_sent_at')->nullable();
            
            // Bounce & Complaint tracking
            $table->unsignedInteger('bounce_count')->default(0);
            $table->unsignedInteger('complaint_count')->default(0);
            
            // Additional metadata
            $table->json('metadata')->nullable()->comment('Datos adicionales');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indices
            $table->index('email');
            $table->index('status');
            $table->index('is_verified');
            $table->index('frequency');
            $table->index('user_id');
            $table->index('created_at');
            $table->index('subscribed_at');
            $table->index(['status', 'frequency']);
            $table->index(['status', 'is_verified']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscriptions');
    }
};
