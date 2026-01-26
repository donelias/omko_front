<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class NewModelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            AppointmentSeeder::class,
            AgentAvailabilitySeeder::class,
            AgentUnavailabilitySeeder::class,
            PropertyViewSeeder::class,
            PaymentTransactionSeeder::class,
            UserPackageLimitSeeder::class,
        ]);

        $this->command->info('✅ Todos los seeders de nuevos modelos ejecutados exitosamente');
    }
}
