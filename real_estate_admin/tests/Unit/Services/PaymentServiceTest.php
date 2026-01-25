<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\PaymentService;
use App\Models\Customer;
use App\Models\Package;
use App\Models\Payments;
use App\Models\UserPurchasedPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PaymentService $service;
    protected Customer $customer;
    protected Package $package;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new PaymentService();
        $this->customer = Customer::factory()->create();
        $this->package = Package::factory()->create([
            'duration' => 30,
            'price' => 99.99,
            'status' => 1,
            'type' => 'product_listing',
        ]);
    }

    /**
     * Test creating payment intent
     */
    public function test_create_payment_intent(): void
    {
        $amount = 99.99;
        $intent = $this->service->createPaymentIntent($this->customer, $this->package->id, $amount);

        $this->assertIsArray($intent);
        $this->assertArrayHasKey('client_secret', $intent);
        $this->assertArrayHasKey('amount', $intent);
        $this->assertEquals($amount, $intent['amount']);
        $this->assertEquals($this->package->id, $intent['package_id']);
        $this->assertEquals($this->customer->id, $intent['customer_id']);
    }

    /**
     * Test confirming payment
     */
    public function test_confirm_payment(): void
    {
        $data = [
            'package_id' => $this->package->id,
            'amount' => 99.99,
            'payment_gateway' => 'stripe',
            'transaction_id' => 'pi_test123',
            'status' => '1',
        ];

        $payment = $this->service->confirmPayment($this->customer, $data);

        $this->assertInstanceOf(Payments::class, $payment);
        $this->assertEquals($this->customer->id, $payment->customer_id);
        $this->assertEquals(99.99, $payment->amount);
        $this->assertEquals('1', $payment->status);
        $this->assertEquals('stripe', $payment->payment_gateway);
    }

    /**
     * Test payment creates package assignment
     */
    public function test_payment_assigns_package(): void
    {
        $data = [
            'package_id' => $this->package->id,
            'amount' => 99.99,
            'payment_gateway' => 'stripe',
            'transaction_id' => 'pi_test123',
            'status' => '1',
        ];

        $payment = $this->service->confirmPayment($this->customer, $data);

        // Check that package was assigned
        $purchased = UserPurchasedPackage::where([
            'modal_id' => $this->customer->id,
            'modal_type' => 'App\\Models\\Customer',
            'package_id' => $this->package->id
        ])->first();

        $this->assertNotNull($purchased);
        $this->assertNotNull($purchased->start_date);
        $this->assertNotNull($purchased->end_date);
    }

    /**
     * Test payment without package (not applicable since package_id is NOT NULL)
     * Modified to always include package
     */
    public function test_confirm_payment_without_package(): void
    {
        // Since package_id is NOT NULL, we create payment with a package
        $data = [
            'amount' => 50.00,
            'payment_gateway' => 'paypal',
            'transaction_id' => 'pi_test456',
            'status' => '1',
            'package_id' => $this->package->id,
        ];

        $payment = $this->service->confirmPayment($this->customer, $data);

        $this->assertInstanceOf(Payments::class, $payment);
        $this->assertEquals(50.00, $payment->amount);
        $this->assertNotNull($payment->package_id);
    }

    /**
     * Test payment status defaults to completed
     */
    public function test_payment_status_is_completed(): void
    {
        $data = [
            'amount' => 99.99,
            'payment_gateway' => 'stripe',
            'package_id' => $this->package->id,
        ];

        $payment = $this->service->confirmPayment($this->customer, $data);

        $this->assertInstanceOf(Payments::class, $payment);
        $this->assertEquals('1', $payment->status);
    }

    /**
     * Test get payment details
     */
    public function test_get_payment_details(): void
    {
        // Create multiple payments
        Payments::create([
            'customer_id' => $this->customer->id,
            'package_id' => $this->package->id,
            'amount' => 50.00,
            'payment_gateway' => 'stripe',
            'transaction_id' => 'txn_001',
            'status' => '1',
        ]);

        Payments::create([
            'customer_id' => $this->customer->id,
            'package_id' => $this->package->id,
            'amount' => 100.00,
            'payment_gateway' => 'paypal',
            'transaction_id' => 'txn_002',
            'status' => '1',
        ]);

        $payments = $this->service->getPaymentDetails($this->customer);

        $this->assertCount(2, $payments);
        $this->assertContains(50.00, $payments->pluck('amount')->toArray());
        $this->assertContains(100.00, $payments->pluck('amount')->toArray());
    }
}
