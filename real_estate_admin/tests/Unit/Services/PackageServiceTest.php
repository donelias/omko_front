<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\PackageService;
use App\Models\Customer;
use App\Models\Package;
use App\Models\UserPurchasedPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PackageServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PackageService $service;
    protected Customer $customer;
    protected Package $package;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new PackageService();
        $this->customer = Customer::factory()->create();
        $this->package = Package::factory()->create([
            'duration' => 12,
            'price' => 99.99,
            'status' => 1,
            'property_limit' => 5,
            'advertisement_limit' => 3,
            'type' => 'premium_user',
        ]);
    }

    /**
     * Test get all active packages
     */
    public function test_get_active_packages(): void
    {
        Package::factory()->create(['status' => 1]);
        Package::factory()->create(['status' => 1]);
        Package::factory()->create(['status' => 0]); // Inactive

        $packages = $this->service->getPackages();

        // Should only return active packages (status = 1)
        $this->assertTrue($packages->count() >= 3); // 2 from factory + 1 from setUp
        $this->assertTrue($packages->every(fn ($p) => $p->status === 1));
    }

    /**
     * Test assign package to user
     */
    public function test_assign_package(): void
    {
        $purchase = $this->service->assignPackage($this->customer->id, $this->package->id);

        $this->assertInstanceOf(UserPurchasedPackage::class, $purchase);
        $this->assertEquals($this->customer->id, $purchase->modal_id);
        $this->assertEquals('App\\Models\\Customer', $purchase->modal_type);
        $this->assertEquals($this->package->id, $purchase->package_id);
        $this->assertNotNull($purchase->start_date);
        $this->assertNotNull($purchase->end_date);
    }

    /**
     * Test assign package deactivates previous
     */
    public function test_assign_package_deactivates_previous(): void
    {
        // Assign first package
        $first = $this->service->assignPackage($this->customer->id, $this->package->id);

        $package2 = Package::factory()->create(['duration' => 6]);
        
        // Assign second package
        $second = $this->service->assignPackage($this->customer->id, $package2->id);

        // Verify first is deactivated
        $first->refresh();
        $this->assertTrue($first->end_date <= now()->toDateString());

        // Verify second is active
        $this->assertTrue($second->end_date > now()->toDateString());
    }

    /**
     * Test get package limits
     */
    public function test_get_package_limits(): void
    {
        $this->service->assignPackage($this->customer->id, $this->package->id);

        $limits = $this->service->getLimits($this->customer->id);

        $this->assertIsArray($limits);
        $this->assertEquals($this->package->id, $limits['package_id']);
        $this->assertEquals($this->package->name, $limits['package_name']);
        $this->assertEquals(5, $limits['property_limit']);
        $this->assertEquals(3, $limits['ad_limit']);
        $this->assertEquals(0, $limits['properties_used']);
        $this->assertEquals(5, $limits['properties_remaining']);
    }

    /**
     * Test get limits without active package
     */
    public function test_get_limits_without_package(): void
    {
        $limits = $this->service->getLimits($this->customer->id);

        $this->assertIsArray($limits);
        $this->assertEquals(0, $limits['property_limit']);
        $this->assertEquals(0, $limits['ad_limit']);
        $this->assertEquals(0, $limits['properties_remaining']);
    }

    /**
     * Test remove all packages
     */
    public function test_remove_all_packages(): void
    {
        // Assign package
        $this->service->assignPackage($this->customer->id, $this->package->id);

        // Remove all
        $result = $this->service->removeAllPackages($this->customer->id);

        $this->assertTrue($result);

        // Verify package is deactivated
        $purchase = UserPurchasedPackage::where('modal_id', $this->customer->id)
            ->where('modal_type', 'App\\Models\\Customer')
            ->first();

        $this->assertTrue($purchase->end_date <= now()->toDateString());
    }

    /**
     * Test purchase package returns correct data
     */
    public function test_purchase_package(): void
    {
        $purchaseData = $this->service->purchasePackage($this->customer->id, $this->package->id);

        $this->assertIsArray($purchaseData);
        $this->assertEquals($this->package->id, $purchaseData['package_id']);
        $this->assertEquals($this->package->price, $purchaseData['amount']);
        $this->assertEquals('USD', $purchaseData['currency']);
        $this->assertEquals($this->customer->id, $purchaseData['customer_id']);
        $this->assertEquals('pending', $purchaseData['status']);
    }

    /**
     * Test active package returns correct package
     */
    public function test_active_package(): void
    {
        $this->service->assignPackage($this->customer->id, $this->package->id);

        $activePackage = $this->customer->activePackage();

        $this->assertNotNull($activePackage);
        $this->assertEquals($this->package->id, $activePackage->id);
    }

    /**
     * Test active package returns null when expired
     */
    public function test_active_package_returns_null_when_expired(): void
    {
        $this->service->assignPackage($this->customer->id, $this->package->id);
        
        // Deactivate
        $this->service->removeAllPackages($this->customer->id);

        $activePackage = $this->customer->activePackage();

        $this->assertNull($activePackage);
    }
}
