<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_banners', function (Blueprint $table) {
            $table->id();
            $table->string('placement')->index();
            $table->enum('page', ['homepage', 'property_listing', 'property_detail']);
            $table->enum('platform', ['app', 'web']);
            $table->string('banner_image')->nullable();
            $table->enum('ad_type', ['external_link', 'property', 'banner_only']);
            $table->string('external_link_url')->nullable();
            $table->foreignId('property_id')->nullable()->constrained('propertys')->onDelete('set null');
            $table->integer('duration')->default(30); // days
            $table->boolean('status')->default(true);
            $table->integer('views')->default(0);
            $table->integer('clicks')->default(0);
            $table->timestamps();
            
            $table->index('page');
            $table->index('platform');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_banners');
    }
};
