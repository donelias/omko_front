<?php

namespace Database\Seeders;

use App\Models\PaymentTransaction;
use App\Models\User;
use App\Models\Package;
use App\Models\Property;
use Illuminate\Database\Seeder;

class PaymentTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener datos necesarios
        $users = User::inRandomOrder()->limit(20)->get();
        $packages = Package::all();
        $properties = Property::inRandomOrder()->limit(30)->get();

        $paymentMethods = [
            PaymentTransaction::METHOD_CREDIT_CARD,
            PaymentTransaction::METHOD_DEBIT_CARD,
            PaymentTransaction::METHOD_PAYPAL,
            PaymentTransaction::METHOD_STRIPE,
            PaymentTransaction::METHOD_BANK_TRANSFER,
            PaymentTransaction::METHOD_WALLET,
        ];

        $currencies = [
            PaymentTransaction::CURRENCY_USD,
            PaymentTransaction::CURRENCY_DOP,
            PaymentTransaction::CURRENCY_EUR,
        ];

        $statuses = [
            PaymentTransaction::STATUS_COMPLETED,
            PaymentTransaction::STATUS_COMPLETED,
            PaymentTransaction::STATUS_COMPLETED,
            PaymentTransaction::STATUS_PENDING,
            PaymentTransaction::STATUS_FAILED,
            PaymentTransaction::STATUS_CANCELLED,
            PaymentTransaction::STATUS_REFUNDED,
        ];

        // Crear 150 transacciones
        foreach (range(1, 150) as $index) {
            $user = $users->random();
            $status = $statuses[array_rand($statuses)];

            PaymentTransaction::create([
                'user_id' => $user->id,
                'package_id' => $packages->count() > 0 ? $packages->random()->id : null,
                'property_id' => $properties->count() > 0 ? $properties->random()->id : null,
                'amount' => rand(2999, 99999) / 100, // Entre 29.99 y 999.99
                'currency' => $currencies[array_rand($currencies)],
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'transaction_id' => 'TXN-' . strtoupper(uniqid()) . '-' . time(),
                'status' => $status,
                'description' => match (rand(1, 3)) {
                    1 => 'Package subscription renewal',
                    2 => 'Property premium listing',
                    default => 'Featured advertisement',
                },
                'metadata' => [
                    'ip_address' => '192.168.' . rand(1, 255) . '.' . rand(1, 255),
                    'user_agent' => 'Mozilla/5.0',
                    'country' => 'DO',
                ],
                'paid_at' => $status === PaymentTransaction::STATUS_COMPLETED
                    ? now()->subDays(rand(0, 90))
                    : null,
                'failed_reason' => $status === PaymentTransaction::STATUS_FAILED
                    ? collect(['Card declined', 'Insufficient funds', 'Expired card', 'Fraud detected'])->random()
                    : null,
                'created_at' => now()->subDays(rand(0, 180)),
            ]);
        }

        $this->command->info('✅ 150 transacciones de pago creadas exitosamente');
    }
}
