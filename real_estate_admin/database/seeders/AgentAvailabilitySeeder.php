<?php

namespace Database\Seeders;

use App\Models\AgentAvailability;
use App\Models\User;
use Illuminate\Database\Seeder;

class AgentAvailabilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agents = User::where('type', 'agent')->inRandomOrder()->limit(20)->get();

        // Si no hay agentes, no ejecutar
        if ($agents->isEmpty()) {
            $this->command->warn('⚠️  No hay agentes para crear disponibilidades');
            return;
        }

        // Crear horarios de disponibilidad para cada agente (lunes a viernes)
        foreach ($agents as $agent) {
            // Verificar si ya existen disponibilidades para este agente
            $existingCount = \App\Models\AgentAvailability::where('agent_id', $agent->id)->count();
            if ($existingCount > 0) {
                continue; // Saltar si ya existen
            }

            // Lunes a Viernes: 9 AM a 6 PM con descanso de 1 PM a 2 PM
            foreach (range(0, 4) as $dayOfWeek) {
                AgentAvailability::create([
                    'agent_id' => $agent->id,
                    'day_of_week' => $dayOfWeek,
                    'start_time' => '09:00:00',
                    'end_time' => '18:00:00',
                    'break_start' => '13:00:00',
                    'break_end' => '14:00:00',
                    'is_available' => true,
                ]);
            }

            // Sábado: 10 AM a 2 PM (sin descanso)
            AgentAvailability::create([
                'agent_id' => $agent->id,
                'day_of_week' => 5,
                'start_time' => '10:00:00',
                'end_time' => '14:00:00',
                'is_available' => (bool)rand(0, 1),
            ]);

            // Domingo: No disponible
            AgentAvailability::create([
                'agent_id' => $agent->id,
                'day_of_week' => 6,
                'start_time' => '00:00:00',
                'end_time' => '00:00:00',
                'is_available' => false,
            ]);
        }

        $this->command->info('✅ Disponibilidades de agentes creadas exitosamente');
    }
}
