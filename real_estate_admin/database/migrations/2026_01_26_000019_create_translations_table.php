<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->morphs('translatable'); // translatable_id, translatable_type
            $table->string('locale')->index();
            $table->string('key')->index();
            $table->longText('value');
            $table->timestamps();
            
            $table->unique(['translatable_id', 'translatable_type', 'locale', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
