<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Package;
use App\Models\Payments;
use App\Models\UserPurchasedPackage;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Create payment intent for Stripe
     */
    public function createPaymentIntent(Customer $customer, int $packageId, float $amount): array
    {
        $package = Package::find($packageId);

        return [
            'client_secret' => 'pi_' . uniqid(),
            'amount' => $amount,
            'currency' => 'usd',
            'package_id' => $packageId,
            'customer_id' => $customer->id,
        ];
    }

    /**
     * Confirm and process payment
     */
    public function confirmPayment(Customer $customer, array $data): Payments
    {
        return DB::transaction(function () use ($customer, $data) {
            $payment = Payments::create([
                'customer_id' => $customer->id,
                'package_id' => $data['package_id'] ?? null,
                'amount' => $data['amount'],
                'payment_gateway' => $data['payment_gateway'] ?? 'stripe',
                'transaction_id' => $data['transaction_id'] ?? uniqid('txn_'),
                'status' => $data['status'] ?? '1',
            ]);

            // Assign package if payment is for a package
            if (!empty($data['package_id'])) {
                $package = Package::find($data['package_id']);
                UserPurchasedPackage::create([
                    'modal_id' => $customer->id,
                    'modal_type' => 'App\\Models\\Customer',
                    'package_id' => $package->id,
                    'start_date' => now()->toDateString(),
                    'end_date' => now()->addMonths($package->duration)->toDateString(),
                ]);
            }

            return $payment;
        });
    }

    /**
     * Get payment details for user
     */
    public function getPaymentDetails(Customer $customer)
    {
        return Payments::where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get payment settings (public keys, etc.)
     */
    public function getPaymentSettings(): array
    {
        return [
            'stripe_public_key' => env('STRIPE_PUBLIC_KEY'),
            'paypal_client_id' => env('PAYPAL_CLIENT_ID'),
            'razorpay_key_id' => env('RAZORPAY_KEY_ID'),
            'paystack_public_key' => env('PAYSTACK_PUBLIC_KEY'),
        ];
    }
}
