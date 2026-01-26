<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_receipt_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_package_id')->constrained('user_packages')->onDelete('cascade');
            $table->string('file_path');
            $table->string('original_name');
            $table->integer('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            
            $table->index('user_package_id');
            $table->index('status');
            $table->index('verified_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_receipt_files');
    }
};
