<?php

namespace App\Services;

use App\Models\Property;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Favourite;
use App\Models\PropertyImages;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class PropertyService
{
    /**
     * Get all properties with filters
     */
    public function getProperties(array $filters, int $page = 1, int $limit = 20): array
    {
        $query = Property::query();

        // Category filter
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Price range filter
        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        // City filter
        if (!empty($filters['city_id'])) {
            $query->where('city_id', $filters['city_id']);
        }

        // Search filter
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('location', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'newest';
        match ($sortBy) {
            'popular' => $query->orderBy('total_click', 'desc'),
            'price_low' => $query->orderBy('price', 'asc'),
            'price_high' => $query->orderBy('price', 'desc'),
            default => $query->latest('id'),
        };

        // Status filter - only active properties
        $query->where('status', 1);

        $total = $query->count();
        $properties = $query->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        return [
            'data' => $properties,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit),
        ];
    }

    /**
     * Create a new property
     */
    public function createProperty(Customer $owner, array $data): Property
    {
        return DB::transaction(function () use ($owner, $data) {
            $property = Property::create([
                'customer_id' => $owner->id,
                'category_id' => $data['category_id'],
                'title' => $data['title'],
                'description' => $data['description'] ?? '',
                'price' => $data['price'],
                'city_id' => $data['city_id'],
                'location' => $data['location'],
                'bedrooms' => $data['bedrooms'] ?? 0,
                'bathrooms' => $data['bathrooms'] ?? 0,
                'area' => $data['area'] ?? 0,
                'status' => 'pending', // Requires admin approval
            ]);

            // Handle images if provided
            if (!empty($data['property_images'])) {
                foreach ($data['property_images'] as $image) {
                    PropertyImages::create([
                        'property_id' => $property->id,
                        'image_url' => $this->uploadImage($image),
                    ]);
                }
            }

            return $property;
        });
    }

    /**
     * Update an existing property
     */
    public function updateProperty(Property $property, array $data): Property
    {
        return DB::transaction(function () use ($property, $data) {
            $property->update(array_filter([
                'title' => $data['title'] ?? null,
                'description' => $data['description'] ?? null,
                'category_id' => $data['category_id'] ?? null,
                'price' => $data['price'] ?? null,
                'city_id' => $data['city_id'] ?? null,
                'location' => $data['location'] ?? null,
                'bedrooms' => $data['bedrooms'] ?? null,
                'bathrooms' => $data['bathrooms'] ?? null,
                'area' => $data['area'] ?? null,
            ]));

            return $property;
        });
    }

    /**
     * Delete a property
     */
    public function deleteProperty(Property $property): bool
    {
        return DB::transaction(function () use ($property) {
            // Delete associated images
            PropertyImages::where('propertys_id', $property->id)->delete();
            
            // Delete the property
            return $property->delete();
        });
    }

    /**
     * Update property status
     */
    public function updatePropertyStatus(Property $property, string $status): Property
    {
        $property->update(['status' => $status]);
        return $property;
    }

    /**
     * Record a property click
     */
    public function recordPropertyClick(Property $property): void
    {
        $property->increment('total_click');
    }

    /**
     * Get nearby properties
     */
    public function getNearbyProperties(float $latitude, float $longitude, int $limit = 10): Collection
    {
        return Property::where('status', 'active')
            ->select('*', DB::raw(
                '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance'
            ))
            ->setBindings([$latitude, $longitude, $latitude])
            ->orderBy('distance')
            ->limit($limit)
            ->get();
    }

    /**
     * Get user's own properties
     */
    public function getUserProperties(Customer $user): Collection
    {
        return Property::where('customer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Remove property image
     */
    public function removePropertyImage(int $imageId): bool
    {
        return PropertyImages::find($imageId)->delete();
    }

    /**
     * Helper: Upload image and return URL
     */
    private function uploadImage($image): string
    {
        // TODO: Implement proper image upload logic
        // For now, return a placeholder
        return '/images/' . uniqid() . '.jpg';
    }
}
