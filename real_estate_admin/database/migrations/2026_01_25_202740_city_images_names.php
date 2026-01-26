<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('city_images', function (Blueprint $table) {
            if (!Schema::hasColumn('city_images', 'names')) {
                $table->json('names')->nullable()->after('city');
            }
        });
    }

    public function down(): void
    {
        Schema::table('city_images', function (Blueprint $table) {
            $table->dropColumn('names');
        });
    }
};
