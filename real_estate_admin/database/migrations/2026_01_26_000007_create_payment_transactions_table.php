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
        if (Schema::hasTable('payment_transactions')) {
            return;
        }

        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('payment_id')->nullable()->constrained('payments')->onDelete('set null')->onUpdate('cascade');
            $table->foreignId('package_id')->nullable()->constrained('packages')->onDelete('set null')->onUpdate('cascade');
            $table->foreignId('property_id')->nullable()->constrained('properties')->onDelete('set null')->onUpdate('cascade');

            // Información de pago
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('currency')->default('DOP');
            $table->string('payment_method')->default('credit_card');
            $table->string('transaction_id')->unique()->nullable();
            $table->string('status')->default('pending');
            $table->text('description')->nullable();

            // Metadata adicional
            $table->json('metadata')->nullable();
            $table->datetime('paid_at')->nullable();
            $table->text('failed_reason')->nullable();

            // Auditoria
            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('user_id');
            $table->index('payment_id');
            $table->index('package_id');
            $table->index('property_id');
            $table->index('status');
            $table->index('payment_method');
            $table->index('currency');
            $table->index('created_at');
            $table->index('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
