<?php

namespace Database\Seeders;

use App\Models\AgentUnavailability;
use App\Models\User;
use Illuminate\Database\Seeder;

class AgentUnavailabilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agents = User::where('type', 'agent')->inRandomOrder()->limit(20)->get();

        $reasons = [
            AgentUnavailability::REASON_VACATION,
            AgentUnavailability::REASON_SICK_LEAVE,
            AgentUnavailability::REASON_PERSONAL,
            AgentUnavailability::REASON_TRAINING,
            AgentUnavailability::REASON_OTHER,
        ];

        // Crear algunos períodos de indisponibilidad
        foreach ($agents as $agent) {
            // 0-2 períodos de indisponibilidad por agente
            $count = rand(0, 2);

            foreach (range(1, $count) as $i) {
                $startDate = now()->addDays(rand(10, 60));
                $endDate = $startDate->copy()->addDays(rand(1, 14));

                AgentUnavailability::create([
                    'agent_id' => $agent->id,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'reason' => $reasons[array_rand($reasons)],
                    'notes' => match (rand(1, 3)) {
                        1 => 'Annual vacation planned',
                        2 => 'Medical leave',
                        default => 'Professional development training',
                    },
                ]);
            }
        }

        $this->command->info('✅ Indisponibilidades de agentes creadas exitosamente');
    }
}
