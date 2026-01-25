<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Mapeo de traducciones inglés → español para facilities
        $translations = [
            'Hospital' => 'Hospital',
            'School' => 'Escuela',
            'Supermarket' => 'Supermercado',
            'Bank ATM' => 'Cajero Automático',
            'Bus Stop' => 'Parada de Autobús',
            'Gym' => 'Gimnasio',
            'Garden' => 'Jardín',
            'Gas Station' => 'Gasolinera',
            'Mall' => 'Centro Comercial',
            'Airport' => 'Aeropuerto',
            'Beach' => 'Playa',
            'Pharmacy' => 'Farmacia',
        ];

        // Actualizar cada facility con JSON names multiidioma
        foreach ($translations as $en => $es) {
            DB::table('outdoor_facilities')
                ->where('name', $en)
                ->update([
                    'names' => json_encode([
                        'en' => $en,
                        'es' => $es,
                    ]),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Limpiar el JSON names
        DB::table('outdoor_facilities')->update(['names' => null]);
    }
};
