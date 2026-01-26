<?php

namespace Database\Seeders;

use App\Models\PropertyView;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class PropertyViewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $properties = Property::inRandomOrder()->limit(50)->get();
        $users = User::inRandomOrder()->limit(100)->get();

        $devices = ['desktop', 'mobile', 'tablet'];
        $countries = ['DO', 'US', 'MX', 'CO', 'ES', 'AR', 'CL'];
        $browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];

        // Crear 500 vistas de propiedades
        foreach (range(1, 500) as $index) {
            $property = $properties->random();
            $userOrNull = rand(0, 1) ? $users->random() : null;
            $deviceType = $devices[array_rand($devices)];

            PropertyView::create([
                'property_id' => $property->id,
                'user_id' => $userOrNull?->id,
                'ip_address' => rand(192, 255) . '.' . rand(1, 255) . '.' . rand(1, 255) . '.' . rand(1, 255),
                'user_agent' => $browsers[array_rand($browsers)] . '/' . rand(60, 120) . '.0',
                'referer' => rand(0, 1) ? 'https://google.com/search' : 'https://facebook.com',
                'country' => $countries[array_rand($countries)],
                'city' => match (rand(1, 3)) {
                    1 => 'Santo Domingo',
                    2 => 'Santiago',
                    default => 'Puerto Plata',
                },
                'device_type' => $deviceType,
                'created_at' => now()->subDays(rand(0, 90)),
            ]);
        }

        $this->command->info('✅ 500 vistas de propiedades creadas exitosamente');
    }
}
