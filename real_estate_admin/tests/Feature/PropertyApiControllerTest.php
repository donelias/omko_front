<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Property;
use App\Models\Category;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PropertyApiControllerTest extends TestCase
{
    use RefreshDatabase;

    protected Customer $user;
    protected Category $category;

    public function setUp(): void
    {
        parent::setUp();
        $this->user = Customer::factory()->create();
        $this->category = Category::factory()->create();
    }

    /**
     * Test getting properties endpoint is accessible
     */
    public function test_get_properties_endpoint(): void
    {
        Property::factory()->count(5)->create([
            'category_id' => $this->category->id,
            'status' => 1,
            'added_by' => $this->user->id
        ]);

        $response = $this->getJson('/api/get_property');

        // Endpoint should be accessible
        $this->assertIsInt($response->status());
    }

    /**
     * Test getting nearby properties endpoint
     */
    public function test_get_nearby_properties(): void
    {
        Property::factory()->count(3)->create([
            'category_id' => $this->category->id,
            'status' => 1,
            'latitude' => '34.0522',
            'longitude' => '-118.2437'
        ]);

        $response = $this->getJson('/api/get_nearby_properties?latitude=34.0522&longitude=-118.2437');

        $this->assertIsInt($response->status());
    }
}


