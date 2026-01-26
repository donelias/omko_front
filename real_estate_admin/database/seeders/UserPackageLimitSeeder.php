<?php

namespace Database\Seeders;

use App\Models\UserPackageLimit;
use App\Models\User;
use App\Models\Package;
use Illuminate\Database\Seeder;

class UserPackageLimitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios y paquetes
        $users = User::inRandomOrder()->limit(25)->get();
        $packages = Package::all();

        $resetFrequencies = [
            UserPackageLimit::RESET_MONTHLY,
            UserPackageLimit::RESET_QUARTERLY,
            UserPackageLimit::RESET_ANNUALLY,
            UserPackageLimit::RESET_NEVER,
        ];

        // Crear límites para cada usuario con 2-3 paquetes
        foreach ($users as $user) {
            $selectedPackages = $packages->random(min(3, $packages->count()));

            foreach ($selectedPackages as $package) {
                // Verificar que no existe ya
                $exists = UserPackageLimit::where('user_id', $user->id)
                                         ->where('package_id', $package->id)
                                         ->exists();

                if ($exists) {
                    continue;
                }

                $frequency = $resetFrequencies[array_rand($resetFrequencies)];
                $quotaLimit = match (rand(1, 3)) {
                    1 => 5,   // Básico: 5 propiedades
                    2 => 15,  // Estándar: 15 propiedades
                    default => 50, // Premium: 50 propiedades
                };

                $nextReset = match ($frequency) {
                    UserPackageLimit::RESET_MONTHLY => now()->addMonth(),
                    UserPackageLimit::RESET_QUARTERLY => now()->addMonths(3),
                    UserPackageLimit::RESET_ANNUALLY => now()->addYear(),
                    default => null,
                };

                UserPackageLimit::create([
                    'user_id' => $user->id,
                    'package_id' => $package->id,
                    'quota_limit' => $quotaLimit,
                    'quota_used' => rand(0, $quotaLimit),
                    'reset_frequency' => $frequency,
                    'last_reset_at' => now()->subDays(rand(0, 30)),
                    'next_reset_at' => $nextReset,
                    'is_active' => (bool)rand(0, 1),
                    'notes' => rand(0, 1) ? 'Standard subscription ' . now()->format('Y-m-d') : null,
                ]);
            }
        }

        $this->command->info('✅ Límites de paquete de usuario creados exitosamente');
    }
}
