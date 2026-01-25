<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $packages = [
            ['id' => 1, 'en' => 'Trial Package', 'es' => 'Paquete de Prueba'],
            ['id' => 2, 'en' => 'Premium User', 'es' => 'Usuario Premium'],
            ['id' => 3, 'en' => 'Agent', 'es' => 'Agente'],
        ];

        foreach ($packages as $pkg) {
            DB::table('packages')
                ->where('id', $pkg['id'])
                ->update(['names' => json_encode(['en' => $pkg['en'], 'es' => $pkg['es']])]);
        }
    }

    public function down(): void
    {
        DB::table('packages')->update(['names' => null]);
    }
};
