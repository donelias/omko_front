<?php

namespace App\Http\Controllers\Api;

use App\Models\Setting;
use App\Models\Payments;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Libraries\Paypal;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Services\PaymentService;
use App\Http\Requests\CreatePaymentIntentRequest;
use App\Http\Requests\ConfirmPaymentRequest;
use App\Http\Requests\PaymentWebhookRequest;

class PaymentApiController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Create a payment intent (Stripe)
     *
     * @param CreatePaymentIntentRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createPaymentIntent(CreatePaymentIntentRequest $request)
    {
        try {
            $result = $this->paymentService->createPaymentIntent(
                $request->validated()['amount'],
                $request->validated()['currency'],
                $request->validated()['package_id'],
                Auth::user()->id
            );

            return response()->json([
                'error' => false,
                'message' => 'Payment intent created',
                'client_secret' => $result['client_secret'],
                'amount' => $result['amount']
            ]);
        } catch (\Exception $e) {
            Log::error('Create payment intent error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Failed to create payment intent'
            ], 500);
        }
    }

    /**
     * Confirm payment
     *
     * @param ConfirmPaymentRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirmPayment(ConfirmPaymentRequest $request)
    {
        try {
            $result = $this->paymentService->confirmPayment(
                Auth::user()->id,
                $request->validated()['payment_intent_id'],
                $request->validated()['package_id'],
                $request->validated()['amount']
            );

            return response()->json([
                'error' => false,
                'message' => 'Payment confirmed successfully',
                'payment_id' => $result['payment_id']
            ]);
        } catch (\Exception $e) {
            Log::error('Confirm payment error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Payment confirmation failed'
            ], 500);
        }
    }

    /**
     * Get payment settings
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPaymentSettings()
    {
        try {
            $settings = Setting::whereIn('type', [
                'paypal_business_id',
                'paypal_gateway',
                'razor_key',
                'razor_secret',
                'razorpay_gateway',
                'paystack_public_key',
                'paystack_gateway',
                'stripe_publishable_key',
                'stripe_gateway'
            ])->get();

            $paymentSettings = [];
            foreach ($settings as $setting) {
                if ($setting->type === 'stripe_secret_key') {
                    continue; // Don't expose secret keys
                }
                $paymentSettings[$setting->type] = $setting->data;
            }

            return response()->json([
                'error' => false,
                'message' => 'Payment settings fetched',
                'data' => $paymentSettings
            ]);
        } catch (\Exception $e) {
            Log::error('Get payment settings error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get payment details for a user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPaymentDetails()
    {
        try {
            $userId = Auth::user()->id;

            $payments = Payments::where('customer_id', $userId)
                ->with('package:id,title,price')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'error' => false,
                'message' => 'Payment details fetched',
                'data' => $payments
            ]);
        } catch (\Exception $e) {
            Log::error('Get payment details error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * PayPal payment handler
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handlePaypal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric',
            'package_id' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ]);
        }

        try {
            $paypal = new Paypal();
            // TODO: Implement PayPal integration
            
            return response()->json([
                'error' => false,
                'message' => 'PayPal integration pending'
            ]);
        } catch (\Exception $e) {
            Log::error('PayPal payment error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'PayPal payment failed'
            ], 500);
        }
    }

    /**
     * Handle payment status
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handlePaymentStatus(Request $request)
    {
        try {
            // This endpoint handles webhooks from payment gateways
            // Process the payment status and update records accordingly
            
            return response()->json([
                'error' => false,
                'message' => 'Status processed'
            ]);
        } catch (\Exception $e) {
            Log::error('Payment status error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Failed to process payment status'
            ], 500);
        }
    }
}
