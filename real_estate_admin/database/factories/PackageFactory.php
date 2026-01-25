<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Package>
 */
class PackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'ios_product_id' => null,
            'name' => fake()->words(3, asText: true),
            'duration' => fake()->numberBetween(1, 365),
            'price' => fake()->numberBetween(100, 10000),
            'status' => 1,
            'property_limit' => fake()->numberBetween(1, 100),
            'advertisement_limit' => fake()->numberBetween(1, 50),
            'type' => 'standard',
        ];
    }

    /**
     * Indicate that the package should be the default one.
     *
     * @return static
     */
    public function default()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }
}
