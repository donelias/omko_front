<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $parameters = [
            ['id' => 1, 'en' => 'Bedroom', 'es' => 'Habitación'],
            ['id' => 2, 'en' => 'Bathroom', 'es' => 'Baño'],
            ['id' => 3, 'en' => 'Kitchen', 'es' => 'Cocina'],
            ['id' => 4, 'en' => 'Garage', 'es' => 'Garaje'],
            ['id' => 5, 'en' => 'Reception', 'es' => 'Recepción'],
            ['id' => 6, 'en' => 'Area', 'es' => 'Área'],
            ['id' => 7, 'en' => 'Parking', 'es' => 'Estacionamiento'],
            ['id' => 8, 'en' => 'Security', 'es' => 'Seguridad'],
            ['id' => 9, 'en' => 'Balconies', 'es' => 'Balcones'],
            ['id' => 10, 'en' => 'Pool', 'es' => 'Piscina'],
            ['id' => 11, 'en' => 'Ac', 'es' => 'Aire Acondicionado'],
            ['id' => 12, 'en' => 'CCTV', 'es' => 'Cámaras CCTV'],
            ['id' => 13, 'en' => 'Fitness', 'es' => 'Gimnasio'],
            ['id' => 14, 'en' => 'Centre', 'es' => 'Centro Comercial'],
            ['id' => 15, 'en' => 'Elevatore', 'es' => 'Ascensor'],
            ['id' => 16, 'en' => 'Wifi', 'es' => 'Wifi'],
            ['id' => 17, 'en' => 'Colors included', 'es' => 'Colores incluidos'],
            ['id' => 18, 'en' => 'Layout - Number', 'es' => 'Diseño - Número'],
            ['id' => 19, 'en' => 'Build Area (ft2)', 'es' => 'Área de Construcción (ft2)'],
            ['id' => 20, 'en' => 'Carpet Area (ft2)', 'es' => 'Área Cubierta (ft2)'],
        ];

        foreach ($parameters as $param) {
            DB::table('parameters')
                ->where('id', $param['id'])
                ->update(['names' => json_encode(['en' => $param['en'], 'es' => $param['es']])]);
        }
    }

    public function down(): void
    {
        DB::table('parameters')->update(['names' => null]);
    }
};
