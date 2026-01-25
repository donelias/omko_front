<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\InterestService;
use App\Models\Customer;
use App\Models\Property;
use App\Models\Favourite;
use App\Models\InterestedUser;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InterestServiceTest extends TestCase
{
    use RefreshDatabase;

    protected InterestService $service;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new InterestService();
    }

    /**
     * Test adding a favorite
     */
    public function test_add_favourite(): void
    {
        $user = Customer::factory()->create();
        $property = Property::factory()->create();

        $favourite = $this->service->addFavourite($user, $property->id);

        $this->assertInstanceOf(Favourite::class, $favourite);
        $this->assertEquals($user->id, $favourite->user_id);
        $this->assertEquals($property->id, $favourite->property_id);
    }

    /**
     * Test getting favorites
     */
    public function test_get_favourites(): void
    {
        $user = Customer::factory()->create();
        Property::factory()->count(3)->create();
        
        foreach (Property::all() as $property) {
            $this->service->addFavourite($user, $property->id);
        }

        $favourites = $this->service->getFavourites($user);

        $this->assertCount(3, $favourites);
    }

    /**
     * Test marking interested
     */
    public function test_mark_interested(): void
    {
        $user = Customer::factory()->create();
        $property = Property::factory()->create();

        $interest = $this->service->markInterested($user, $property->id);

        $this->assertInstanceOf(InterestedUser::class, $interest);
        $this->assertEquals(0, $interest->status);
    }

    /**
     * Test getting report reasons
     */
    public function test_get_report_reasons(): void
    {
        $reasons = $this->service->getReportReasons();

        $this->assertIsIterable($reasons);
    }
}
