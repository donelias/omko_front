<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Favourite;
use App\Models\Property;
use App\Models\UserInterest;
use App\Models\InterestedUser;
use App\Models\user_reports;
use App\Models\report_reasons;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class InterestService
{
    /**
     * Add property to favorites
     */
    public function addFavourite(Customer $user, int $propertyId): Favourite
    {
        return Favourite::firstOrCreate(
            ['user_id' => $user->id, 'property_id' => $propertyId],
            ['created_at' => now()]
        );
    }

    /**
     * Get user's favorite properties
     */
    public function getFavourites(Customer $user): Collection
    {
        return Favourite::where('user_id', $user->id)
            ->with('property')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Mark property as interested
     */
    public function markInterested(Customer $user, int $propertyId, string $interestType = 'viewing'): InterestedUser
    {
        return InterestedUser::firstOrCreate(
            ['customer_id' => $user->id, 'property_id' => $propertyId],
            ['status' => 0]
        );
    }

    /**
     * Get users interested in a property
     */
    public function getInterestedUsers(Property $property): Collection
    {
        return InterestedUser::where('property_id', $property->id)
            ->with('customer')
            ->get();
    }

    /**
     * Report a property
     */
    public function reportProperty(Customer $user, int $propertyId, int $reasonId, string $description = ''): user_reports
    {
        return user_reports::create([
            'customer_id' => $user->id,
            'property_id' => $propertyId,
            'reason_id' => $reasonId,
            'description' => $description,
            'status' => 'pending',
        ]);
    }

    /**
     * Get report reasons
     */
    public function getReportReasons(): Collection
    {
        return report_reasons::all();
    }

    /**
     * Get user's custom interests
     */
    public function getUserInterests(Customer $user): Collection
    {
        return UserInterest::where('customer_id', $user->id)->get();
    }

    /**
     * Store user interests
     */
    public function storeUserInterests(Customer $user, array $interestIds): array
    {
        return DB::transaction(function () use ($user, $interestIds) {
            // Delete existing interests
            UserInterest::where('customer_id', $user->id)->delete();

            // Create new interests
            $interests = [];
            foreach ($interestIds as $categoryId) {
                $interests[] = UserInterest::create([
                    'customer_id' => $user->id,
                    'category_id' => $categoryId,
                ]);
            }

            return $interests;
        });
    }

    /**
     * Delete user interest
     */
    public function deleteUserInterest(Customer $user, int $interestId): bool
    {
        $interest = UserInterest::where('customer_id', $user->id)
            ->where('id', $interestId)
            ->first();

        if (!$interest) {
            return false;
        }

        return $interest->delete();
    }
}
