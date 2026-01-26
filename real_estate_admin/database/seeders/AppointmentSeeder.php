<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\User;
use App\Models\Property;
use Illuminate\Database\Seeder;

class AppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::inRandomOrder()->limit(30)->get();
        $agents = User::where('type', 'agent')->inRandomOrder()->limit(15)->get();
        $properties = Property::inRandomOrder()->limit(40)->get();

        $meetingTypes = [
            Appointment::TYPE_PROPERTY_VIEWING,
            Appointment::TYPE_CONSULTATION,
            Appointment::TYPE_DOCUMENT_REVIEW,
            Appointment::TYPE_PAYMENT_DISCUSSION,
            Appointment::TYPE_PROJECT_TOUR,
        ];

        $statuses = [
            Appointment::STATUS_SCHEDULED,
            Appointment::STATUS_CONFIRMED,
            Appointment::STATUS_COMPLETED,
            Appointment::STATUS_CANCELLED,
            Appointment::STATUS_NO_SHOW,
            Appointment::STATUS_RESCHEDULED,
        ];

        // Crear 120 citas
        foreach (range(1, 120) as $index) {
            $user = $users->random();
            $agent = $agents->count() > 0 ? $agents->random() : $users->random();
            $property = $properties->count() > 0 ? $properties->random() : null;
            $status = $statuses[array_rand($statuses)];
            $appointmentDate = now()->addDays(rand(-30, 90));

            Appointment::create([
                'user_id' => $user->id,
                'agent_id' => $agent->id,
                'property_id' => $property?->id,
                'project_plan_id' => null,
                'meeting_type' => $meetingTypes[array_rand($meetingTypes)],
                'scheduled_at' => $appointmentDate,
                'scheduled_until' => $appointmentDate->copy()->addHour(),
                'status' => $status,
                'contents' => json_encode([
                    'en' => 'Appointment for property viewing and discussion',
                    'es' => 'Cita para visualización de propiedad y discusión',
                ]),
                'notes' => rand(0, 1) ? 'Important meeting regarding property details' : null,
                'completed_at' => in_array($status, [Appointment::STATUS_COMPLETED, Appointment::STATUS_NO_SHOW])
                    ? $appointmentDate->copy()->addHour()
                    : null,
                'created_at' => now()->subDays(rand(0, 90)),
            ]);
        }

        $this->command->info('✅ 120 citas creadas exitosamente');
    }
}
