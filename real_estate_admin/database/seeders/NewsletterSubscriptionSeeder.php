<?php

namespace Database\Seeders;

use App\Models\NewsletterSubscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NewsletterSubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::inRandomOrder()->limit(30)->get();

        if ($users->isEmpty()) {
            $this->command->warn('⚠️  No hay usuarios para crear suscripciones al newsletter');
            return;
        }

        $statuses = [
            NewsletterSubscription::STATUS_ACTIVE,
            NewsletterSubscription::STATUS_ACTIVE,
            NewsletterSubscription::STATUS_ACTIVE,
            NewsletterSubscription::STATUS_ACTIVE,
            NewsletterSubscription::STATUS_INACTIVE,
            NewsletterSubscription::STATUS_UNSUBSCRIBED,
        ];

        $frequencies = [
            NewsletterSubscription::FREQUENCY_DAILY,
            NewsletterSubscription::FREQUENCY_WEEKLY,
            NewsletterSubscription::FREQUENCY_WEEKLY,
            NewsletterSubscription::FREQUENCY_WEEKLY,
            NewsletterSubscription::FREQUENCY_MONTHLY,
            NewsletterSubscription::FREQUENCY_NEVER,
        ];

        $categories = [
            ['properties', 'agents'],
            ['properties', 'projects'],
            ['agents', 'projects'],
            ['properties'],
            ['agents'],
            ['projects'],
            ['properties', 'agents', 'projects'],
        ];

        $firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Francisca', 'Diego', 'Rosa'];
        $lastNames = ['García', 'López', 'Martínez', 'González', 'Rodríguez', 'Pérez', 'Díaz', 'Sánchez'];

        // Crear 100 suscripciones
        foreach (range(1, 100) as $index) {
            $user = $users->random();
            $status = $statuses[array_rand($statuses)];
            $isVerified = $status === NewsletterSubscription::STATUS_ACTIVE || $status === NewsletterSubscription::STATUS_INACTIVE;

            NewsletterSubscription::create([
                'user_id' => rand(0, 2) ? $user->id : null, // 66% con user_id
                'email' => 'subscriber-' . $index . '-' . uniqid() . '@omko.test',
                'first_name' => $firstNames[array_rand($firstNames)],
                'last_name' => $lastNames[array_rand($lastNames)],
                'status' => $status,
                'frequency' => $frequencies[array_rand($frequencies)],
                'categories' => $categories[array_rand($categories)],
                'is_verified' => $isVerified,
                'verification_token' => $isVerified ? null : Str::random(60),
                'verified_at' => $isVerified ? now()->subDays(rand(0, 30)) : null,
                'unsubscribe_token' => Str::random(60),
                'subscribed_at' => now()->subDays(rand(0, 180)),
                'unsubscribed_at' => $status === NewsletterSubscription::STATUS_UNSUBSCRIBED ? now()->subDays(rand(0, 30)) : null,
                'last_sent_at' => $isVerified ? now()->subDays(rand(0, 7)) : null,
                'bounce_count' => $status === NewsletterSubscription::STATUS_BOUNCED ? rand(1, 5) : 0,
                'complaint_count' => rand(0, 2),
                'metadata' => [
                    'source' => ['website', 'mobile_app', 'form'][rand(0, 2)],
                    'referral' => rand(0, 1) ? 'agent-' . rand(1, 50) : null,
                ],
            ]);
        }

        // Crear 50 suscripciones sin usuario asociado (emails independientes)
        foreach (range(1, 50) as $index) {
            $status = $statuses[array_rand($statuses)];
            $isVerified = $status === NewsletterSubscription::STATUS_ACTIVE;

            NewsletterSubscription::create([
                'user_id' => null,
                'email' => 'external-subscriber-' . $index . '-' . uniqid() . '@example.com',
                'first_name' => $firstNames[array_rand($firstNames)],
                'last_name' => $lastNames[array_rand($lastNames)],
                'status' => $status,
                'frequency' => $frequencies[array_rand($frequencies)],
                'categories' => $categories[array_rand($categories)],
                'is_verified' => $isVerified,
                'verification_token' => $isVerified ? null : Str::random(60),
                'verified_at' => $isVerified ? now()->subDays(rand(0, 60)) : null,
                'unsubscribe_token' => Str::random(60),
                'subscribed_at' => now()->subDays(rand(0, 365)),
                'unsubscribed_at' => $status === NewsletterSubscription::STATUS_UNSUBSCRIBED ? now()->subDays(rand(1, 30)) : null,
                'last_sent_at' => $isVerified ? now()->subDays(rand(0, 30)) : null,
                'bounce_count' => rand(0, 2),
                'complaint_count' => rand(0, 1),
                'metadata' => [
                    'source' => 'website',
                    'campaign' => 'initial-launch',
                ],
            ]);
        }

        $this->command->info('✅ 150 suscripciones a newsletter creadas exitosamente');
    }
}
