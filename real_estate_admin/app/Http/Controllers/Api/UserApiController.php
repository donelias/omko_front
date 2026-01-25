<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Package;
use App\Models\Customer;
use App\Models\Usertokens;
use App\Models\NumberOtp;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\UserPurchasedPackage;
use App\Services\UserService;
use App\Http\Requests\UserSignupRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\GetOtpRequest;
use App\Http\Requests\VerifyOtpRequest;

class UserApiController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * User sign up / login
     *
     * @param UserSignupRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function signup(UserSignupRequest $request)
    {
        try {
            $validated = $request->validated();
            $user = $this->userService->registerUser($validated);
            $token = $user->createToken('token-name');
            
            return response()->json([
                'error' => false,
                'message' => 'User registered successfully',
                'token' => $token->plainTextToken,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('User signup error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Update user profile
     *
     * @param UpdateProfileRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        try {
            $user = Auth::user();
            $updated = $this->userService->updateProfile($user, $request->validated());
            
            return response()->json([
                'error' => false,
                'message' => 'Profile updated successfully',
                'data' => $updated
            ]);
        } catch (\Exception $e) {
            Log::error('Profile update error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get user data
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserData()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'error' => true,
                    'message' => 'User not found'
                ]);
            }

            return response()->json([
                'error' => false,
                'message' => 'User data fetched',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Get user data error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Delete user account
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteUser(Request $request)
    {
        try {
            $user = Auth::user();
            $this->userService->deleteUser($user);

            return response()->json([
                'error' => false,
                'message' => 'User account deleted'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete user error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Before logout
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function beforeLogout(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user && $request->has('fcm_id')) {
                Usertokens::where('fcm_id', $request->fcm_id)->delete();
            }

            return response()->json([
                'error' => false,
                'message' => 'Logged out successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Before logout error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get user recommendations
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserRecommendation()
    {
        try {
            $userId = Auth::user()->id;

            $recommendations = \App\Models\Property::with('category:id,category,image')
                ->where('status', 1)
                ->orderBy('total_click', 'DESC')
                ->limit(10)
                ->get();

            $current_user = Auth::guard('sanctum')->check() ? Auth::guard('sanctum')->user()->id : null;
            $property_details = get_property_details($recommendations, $current_user);

            return response()->json([
                'error' => false,
                'message' => 'Recommendations fetched',
                'data' => $property_details
            ]);
        } catch (\Exception $e) {
            Log::error('Get recommendation error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get OTP
     *
     * @param GetOtpRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOtp(GetOtpRequest $request)
    {
        try {
            $this->userService->generateOtp($request->validated()['mobile']);

            return response()->json([
                'error' => false,
                'message' => 'OTP sent successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Get OTP error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Verify OTP
     *
     * @param VerifyOtpRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyOtp(VerifyOtpRequest $request)
    {
        try {
            $result = $this->userService->verifyOtp($request->validated()['mobile'], $request->validated()['otp']);
            
            return response()->json([
                'error' => false,
                'message' => 'OTP verified successfully',
                'token' => $result['token'],
                'data' => $result['user']
            ]);
        } catch (\Exception $e) {
            Log::error('Verify OTP error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }
}
