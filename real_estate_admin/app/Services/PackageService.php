<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Package;
use App\Models\UserPurchasedPackage;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PackageService
{
    /**
     * Get all active packages
     */
    public function getPackages()
    {
        return Package::where('status', 1)->get();
    }

    /**
     * Assign package to user
     */
    public function assignPackage(int $customerId, int $packageId): UserPurchasedPackage
    {
        return DB::transaction(function () use ($customerId, $packageId) {
            $package = Package::find($packageId);

            // Deactivate previous packages
            UserPurchasedPackage::where('modal_id', $customerId)
                ->where('modal_type', 'App\\Models\\Customer')
                ->where('end_date', '>', now())
                ->update(['end_date' => now()]);

            // Create new package assignment
            return UserPurchasedPackage::create([
                'modal_id' => $customerId,
                'modal_type' => 'App\\Models\\Customer',
                'package_id' => $packageId,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addMonths($package->duration)->toDateString(),
            ]);
        });
    }

    /**
     * Get user's package limits
     */
    public function getLimits(int $customerId): array
    {
        $user = Customer::find($customerId);
        if (!$user) {
            return [
                'property_limit' => 0,
                'ad_limit' => 0,
                'properties_used' => 0,
                'ads_used' => 0,
                'properties_remaining' => 0,
                'ads_remaining' => 0,
            ];
        }

        $package = $user->activePackage();

        if (!$package) {
            return [
                'property_limit' => 0,
                'ad_limit' => 0,
                'properties_used' => 0,
                'ads_used' => 0,
                'properties_remaining' => 0,
                'ads_remaining' => 0,
            ];
        }

        $propertiesUsed = $user->properties()->count();
        $adsUsed = 0; // TODO: Implement ad counting

        return [
            'package_id' => $package->id,
            'package_name' => $package->name,
            'property_limit' => $package->property_limit,
            'ad_limit' => $package->advertisement_limit,
            'properties_used' => $propertiesUsed,
            'ads_used' => $adsUsed,
            'properties_remaining' => max(0, $package->property_limit - $propertiesUsed),
            'ads_remaining' => max(0, $package->advertisement_limit - $adsUsed),
            'expires_at' => $user->activePackagePurchase()?->end_date,
        ];
    }

    /**
     * Remove all packages
     */
    public function removeAllPackages(int $customerId): bool
    {
        return DB::transaction(function () use ($customerId) {
            UserPurchasedPackage::where('modal_id', $customerId)
                ->where('modal_type', 'App\\Models\\Customer')
                ->where('end_date', '>', now())
                ->update(['end_date' => now()]);

            return true;
        });
    }

    /**
     * Purchase a package
     */
    public function purchasePackage(int $customerId, int $packageId): array
    {
        $package = Package::find($packageId);

        return [
            'package_id' => $packageId,
            'amount' => $package->price,
            'currency' => 'USD',
            'customer_id' => $customerId,
            'status' => 'pending',
        ];
    }
}
