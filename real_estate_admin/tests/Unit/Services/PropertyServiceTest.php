<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\PropertyService;
use App\Models\Property;
use App\Models\Category;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PropertyServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PropertyService $service;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new PropertyService();
    }

    /**
     * Test getting properties with filters
     */
    public function test_get_properties_returns_filtered_results(): void
    {
        // Create test data
        $category = Category::factory()->create();
        Property::factory()->count(5)->create([
            'category_id' => $category->id,
            'status' => 1, // 1 = active
        ]);

        // Test filtering by category
        $result = $this->service->getProperties(['category_id' => $category->id]);

        $this->assertNotEmpty($result['data']);
        $this->assertEquals(5, $result['total']);
    }

    /**
     * Test creating a property
     */
    public function test_create_property(): void
    {
        $owner = Customer::factory()->create();
        $category = Category::factory()->create();

        $data = [
            'title' => 'Test Property',
            'description' => 'A beautiful test property',
            'category_id' => $category->id,
            'price' => 500000,
            'city_id' => 1,
            'location' => 'Downtown',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'area' => 150,
        ];

        $property = $this->service->createProperty($owner, $data);

        $this->assertInstanceOf(Property::class, $property);
        $this->assertEquals('Test Property', $property->title);
        $this->assertEquals(500000, $property->price);
    }

    /**
     * Test updating a property
     */
    public function test_update_property(): void
    {
        $property = Property::factory()->create();

        $data = [
            'title' => 'Updated Title',
            'price' => 600000,
        ];

        $updated = $this->service->updateProperty($property, $data);

        $this->assertEquals('Updated Title', $updated->title);
        $this->assertEquals(600000, $updated->price);
    }

    /**
     * Test deleting a property
     */
    public function test_delete_property(): void
    {
        $property = Property::factory()->create();

        $result = $this->service->deleteProperty($property);

        $this->assertTrue($result);
        $this->assertNull(Property::find($property->id));
    }

    /**
     * Test recording property click
     */
    public function test_record_property_click(): void
    {
        $property = Property::factory()->create(['total_click' => 5]);

        $this->service->recordPropertyClick($property);

        $this->assertEquals(6, $property->refresh()->total_click);
    }
}
