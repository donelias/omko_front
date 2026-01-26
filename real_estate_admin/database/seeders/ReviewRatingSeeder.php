<?php

namespace Database\Seeders;

use App\Models\ReviewRating;
use App\Models\User;
use App\Models\Property;
use Illuminate\Database\Seeder;

class ReviewRatingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios disponibles - si no hay agentes, usar usuarios normales
        $users = User::inRandomOrder()->limit(100)->get();
        $agents = User::where('type', 'agent')->inRandomOrder()->limit(20)->get();
        
        // Si no hay agentes, crear algunos de los usuarios normales
        if ($agents->isEmpty()) {
            $agents = User::inRandomOrder()->limit(10)->get();
        }
        
        $properties = Property::inRandomOrder()->limit(100)->get();

        // Si no hay datos suficientes, no ejecutar
        if ($users->isEmpty()) {
            $this->command->warn('⚠️  No hay usuarios para crear reseñas');
            return;
        }
        
        if ($properties->isEmpty()) {
            $this->command->warn('⚠️  No hay propiedades para crear reseñas');
            return;
        }

        $statuses = [
            ReviewRating::STATUS_APPROVED,
            ReviewRating::STATUS_APPROVED,
            ReviewRating::STATUS_APPROVED,
            ReviewRating::STATUS_APPROVED,
            ReviewRating::STATUS_PENDING,
            ReviewRating::STATUS_FLAGGED,
        ];

        $titles = [
            'Excelente propiedad',
            'Muy buena ubicación',
            'Agente muy profesional',
            'Se ajusta a mis necesidades',
            'Proceso muy rápido',
            'Recomendaría este lugar',
            'Fantástica experiencia',
            'Perfecto para mi familia',
        ];

        $reviews = [
            'Proceso muy fácil y rápido. El agente fue muy atento y profesional en todo momento.',
            'La propiedad superó mis expectativas. El estado es excelente y la ubicación es perfecta.',
            'Muy satisfecho con la transacción. Todo fue transparente y bien organizado.',
            'El equipo fue muy profesional. Respondieron todas mis dudas de manera clara.',
            'Excelente servicio de atención al cliente. Volvería a comprar con ellos.',
            'La propiedad es exactamente como se describía. Muy contento con mi compra.',
            'Proceso transparente y confiable. Recomendado 100%',
            'Buena comunicación durante todo el proceso. Sin sorpresas desagradables.',
        ];

        // Crear 250 reseñas
        foreach (range(1, 250) as $index) {
            $user = $users->random();
            $property = $properties->random();
            $agent = $agents->count() > 0 ? $agents->random() : null;
            $rating = rand(1, 50) / 10; // Distribuir mejor hacia calificaciones altas

            ReviewRating::create([
                'user_id' => $user->id,
                'agent_id' => $agent?->id,
                'property_id' => $property->id,
                'rating' => $rating,
                'title' => $titles[array_rand($titles)],
                'review' => $reviews[array_rand($reviews)],
                'helpful_count' => rand(0, 50),
                'unhelpful_count' => rand(0, 10),
                'is_verified_purchase' => (bool)rand(0, 1),
                'status' => $statuses[array_rand($statuses)],
                'featured' => rand(0, 1) ? false : true,
                'metadata' => [
                    'ip_address' => rand(192, 255) . '.' . rand(1, 255) . '.' . rand(1, 255) . '.' . rand(1, 255),
                    'user_agent' => 'Mozilla/5.0',
                ],
                'created_at' => now()->subDays(rand(0, 180)),
            ]);
        }

        $this->command->info('✅ 250 reseñas creadas exitosamente');
    }
}
