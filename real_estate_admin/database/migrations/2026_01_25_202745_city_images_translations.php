<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $cities = [
            ['id' => 1, 'en' => 'Moca', 'es' => 'Moca'],
            ['id' => 2, 'en' => 'Punta Cana', 'es' => 'Punta Cana'],
            ['id' => 3, 'en' => 'La Romana', 'es' => 'La Romana'],
            ['id' => 5, 'en' => 'Jarabacoa', 'es' => 'Jarabacoa'],
            ['id' => 7, 'en' => 'Bayahibe', 'es' => 'Bayahibe'],
            ['id' => 8, 'en' => 'Puerto Plata', 'es' => 'Puerto Plata'],
            ['id' => 12, 'en' => 'La Vega', 'es' => 'La Vega'],
            ['id' => 13, 'en' => 'Jamao', 'es' => 'Jamao'],
            ['id' => 14, 'en' => 'Cabarete', 'es' => 'Cabarete'],
            ['id' => 16, 'en' => '3', 'es' => '3'],
            ['id' => 17, 'en' => 'Playa Nueva Romana', 'es' => 'Playa Nueva Romana'],
            ['id' => 20, 'en' => 'La Caña', 'es' => 'La Caña'],
            ['id' => 23, 'en' => 'Juan Lopez', 'es' => 'Juan López'],
            ['id' => 24, 'en' => 'Las Terrenas', 'es' => 'Las Terrenas'],
            ['id' => 25, 'en' => 'Franco Bido', 'es' => 'Franco Bido'],
        ];

        foreach ($cities as $city) {
            DB::table('city_images')
                ->where('id', $city['id'])
                ->update(['names' => json_encode(['en' => $city['en'], 'es' => $city['es']])]);
        }
    }

    public function down(): void
    {
        DB::table('city_images')->update(['names' => null]);
    }
};
