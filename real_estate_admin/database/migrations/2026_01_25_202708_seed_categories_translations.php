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
        // Mapeo de traducciones inglés → español para categorías
        $translations = [
            'Villa' => 'Villa',
            'Penthouse' => 'Ático',
            'Banglow' => 'Bungaló',
            'House' => 'Casa',
            'Land' => 'Terreno',
            'Plote' => 'Lote',
            'Commercial' => 'Comercial',
            'Condo' => 'Condominio',
            'Townhouse' => 'Casa de Pueblo',
            'Apartment' => 'Apartamento',
        ];

        // Actualizar cada categoría con JSON names multiidioma
        foreach ($translations as $en => $es) {
            DB::table('categories')
                ->where('category', $en)
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
        DB::table('categories')->update(['names' => null]);
    }
};
