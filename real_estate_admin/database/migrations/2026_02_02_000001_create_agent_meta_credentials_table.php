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
        Schema::create('agent_meta_credentials', function (Blueprint $table) {
            $table->id();
            
            // Agent Reference
            $table->foreignId('agent_id')->unique()->references('id')->on('customers')->onDelete('cascade');
            
            // Meta Credentials (Encrypted)
            $table->string('meta_app_id')->comment('Meta App ID - encrypted');
            $table->string('meta_app_secret')->comment('Meta App Secret - encrypted');
            $table->string('meta_pixel_id')->nullable()->comment('Meta Pixel ID - encrypted');
            $table->string('meta_conversion_api_token')->nullable()->comment('Conversion API Token - encrypted');
            $table->string('meta_webhook_token')->comment('Webhook Verification Token - encrypted');
            $table->string('meta_business_account_id')->nullable()->comment('Business Account ID');
            
            // Lead Form Configuration
            $table->string('meta_lead_form_id')->nullable()->comment('Meta Lead Form ID');
            $table->string('meta_page_id')->nullable()->comment('Meta Page ID where form is deployed');
            
            // Status
            $table->boolean('is_active')->default(true)->comment('If credentials are active');
            $table->text('notes')->nullable()->comment('Internal notes about this integration');
            
            // Verification
            $table->timestamp('verified_at')->nullable()->comment('When credentials were last verified');
            $table->timestamp('last_webhook_received_at')->nullable()->comment('When last webhook was received');
            $table->integer('webhook_received_count')->default(0)->comment('Total webhooks received');
            
            // Audit
            $table->string('verified_by')->nullable()->comment('User who verified credentials');
            
            $table->timestamps();
            
            // Indexes
            $table->index('agent_id');
            $table->index('is_active');
            $table->index('verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_meta_credentials');
    }
};
