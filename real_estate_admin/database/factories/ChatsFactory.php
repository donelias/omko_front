<?php

namespace Database\Factories;

use App\Models\Chats;
use App\Models\Customer;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChatsFactory extends Factory
{
    protected $model = Chats::class;

    public function definition(): array
    {
        return [
            'sender_id' => Customer::factory(),
            'receiver_id' => Customer::factory(),
            'property_id' => Property::factory(),
            'message' => $this->faker->sentence(),
            'file' => null,
            'audio' => null,
        ];
    }

    public function withFile(string $filename = null): self
    {
        return $this->state(function (array $attributes) use ($filename) {
            return [
                'file' => $filename ?? $this->faker->word() . '.pdf',
            ];
        });
    }

    public function withAudio(string $filename = null): self
    {
        return $this->state(function (array $attributes) use ($filename) {
            return [
                'audio' => $filename ?? $this->faker->word() . '.mp3',
            ];
        });
    }
}
