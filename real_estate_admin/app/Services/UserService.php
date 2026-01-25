<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Package;
use App\Models\Usertokens;
use App\Models\UserPurchasedPackage;
use App\Models\NumberOtp;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * Register a new user
     */
    public function registerUser(array $data): Customer
    {
        return DB::transaction(function () use ($data) {
            $customer = Customer::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'mobile' => $data['phone'],
                'password' => Hash::make($data['password']),
                'isActive' => true,
            ]);

            // Assign default package (first active package)
            $defaultPackage = Package::where('status', 1)->first();
            if ($defaultPackage) {
                UserPurchasedPackage::create([
                    'modal_id' => $customer->id,
                    'modal_type' => Customer::class,
                    'package_id' => $defaultPackage->id,
                    'start_date' => now(),
                    'end_date' => now()->addDays(30),
                ]);
            }

            return $customer;
        });
    }

    /**
     * Update user profile
     */
    public function updateProfile(Customer $user, array $data): Customer
    {
        $user->update(array_filter([
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'mobile' => $data['phone'] ?? null,
            'about_me' => $data['bio'] ?? null,
        ]));

        // Handle FCM token
        if (!empty($data['fcm_token'])) {
            Usertokens::updateOrCreate(
                ['customer_id' => $user->id],
                ['token' => $data['fcm_token']]
            );
        }

        return $user;
    }

    /**
     * Delete user account
     */
    public function deleteUser(Customer $user): bool
    {
        return DB::transaction(function () use ($user) {
            // Delete user tokens
            Usertokens::where('customer_id', $user->id)->delete();
            
            // Delete user purchased packages
            UserPurchasedPackage::where('modal_id', $user->id)
                ->where('modal_type', Customer::class)
                ->delete();
            
            // Delete the user
            return $user->delete();
        });
    }

    /**
     * Get user recommendations based on interests
     */
    public function getUserRecommendations(Customer $user, int $limit = 20)
    {
        // TODO: Implement recommendation logic
        return [];
    }

    /**
     * Generate and send OTP
     */
    public function generateOtp(string $phone): NumberOtp
    {
        $otp = NumberOtp::where('phone', $phone)->first();
        $code = rand(100000, 999999);

        if ($otp) {
            $otp->update(['otp' => $code, 'created_at' => now()]);
        } else {
            $otp = NumberOtp::create(['phone' => $phone, 'otp' => $code]);
        }

        // TODO: Send via Twilio
        return $otp;
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(string $phone, string $otp): ?Customer
    {
        $otpRecord = NumberOtp::where('phone', $phone)
            ->where('otp', $otp)
            ->where('created_at', '>=', now()->subMinutes(10))
            ->first();

        if (!$otpRecord) {
            return null;
        }

        $customer = Customer::where('phone', $phone)->first();
        
        if (!$customer) {
            $customer = Customer::create([
                'phone' => $phone,
                'name' => 'User ' . $phone,
                'email' => 'phone_' . $phone . '@realtor.local',
                'password' => Hash::make(uniqid()),
            ]);
        }

        // Delete used OTP
        $otpRecord->delete();

        return $customer;
    }

    /**
     * Logout user - cleanup
     */
    public function beforeLogout(Customer $user): void
    {
        // Clear FCM tokens
        Usertokens::where('customer_id', $user->id)->delete();
    }
}
