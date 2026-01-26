<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('old_user_purchased_packages', function (Blueprint $table) {
            $table->id();
            $table->string('old_user_id')->nullable(); // Non-migrated user ID
            $table->foreignId('old_package_id')->nullable()->constrained('old_packages')->onDelete('set null');
            $table->timestamp('purchased_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('price_paid', 10, 2)->nullable();
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active');
            $table->timestamps();
            
            $table->index('old_user_id');
            $table->index('old_package_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('old_user_purchased_packages');
    }
};
