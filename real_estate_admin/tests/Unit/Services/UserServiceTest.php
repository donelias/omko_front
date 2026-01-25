<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\UserService;
use App\Models\Customer;
use App\Models\Package;
use App\Models\UserPurchasedPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    protected UserService $service;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new UserService();
    }

    /**
     * Test user registration
     */
    public function test_register_user(): void
    {
        Package::factory()->create(['status' => 1]);

        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+1234567890',
            'password' => 'password123',
        ];

        $user = $this->service->registerUser($data);

        $this->assertInstanceOf(Customer::class, $user);
        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john@example.com', $user->email);
    }

    /**
     * Test updating user profile
     */
    public function test_update_profile(): void
    {
        $user = Customer::factory()->create();

        $data = [
            'name' => 'Updated Name',
            'bio' => 'Updated bio',
        ];

        $updated = $this->service->updateProfile($user, $data);

        $this->assertEquals('Updated Name', $updated->name);
        $this->assertEquals('Updated bio', $updated->about_me);
    }

    /**
     * Test deleting user
     */
    public function test_delete_user(): void
    {
        $user = Customer::factory()->create();

        $result = $this->service->deleteUser($user);

        $this->assertTrue($result);
        $this->assertNull(Customer::find($user->id));
    }

    /**
     * Test logout cleanup
     */
    public function test_before_logout(): void
    {
        $user = Customer::factory()->create();

        // This should not throw an error
        $this->service->beforeLogout($user);

        $this->assertTrue(true);
    }
}
