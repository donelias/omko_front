<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Property;
use App\Models\Category;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InterestApiControllerTest extends TestCase
{
    use RefreshDatabase;

    protected Customer $user;
    protected Property $property;

    public function setUp(): void
    {
        parent::setUp();
        $this->user = Customer::factory()->create();
        
        $category = Category::factory()->create();
        $this->property = Property::factory()->create([
            'category_id' => $category->id
        ]);
    }

    /**
     * Test getting report reasons endpoint
     */
    public function test_get_report_reasons(): void
    {
        $response = $this->getJson('/api/get_report_reasons');

        // Endpoint should be accessible
        $this->assertIsInt($response->status());
    }
}

