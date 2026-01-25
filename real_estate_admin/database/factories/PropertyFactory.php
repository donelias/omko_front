<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $title = fake()->words(5, asText: true);
        return [
            'title' => $title,
            'description' => fake()->paragraph(),
            'address' => fake()->address(),
            'client_address' => fake()->address(),
            'propery_type' => fake()->randomElement(['apartment', 'house', 'condo', 'townhouse']),
            'price' => fake()->numberBetween(50000, 1000000),
            'category_id' => fake()->numberBetween(1, 10),
            'state' => fake()->state(),
            'country' => fake()->country(),
            'status' => 1,
            'total_click' => 0,
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'added_by' => 1,
            'slug_id' => Str::slug($title) . '-' . Str::random(8),
        ];
    }
}

