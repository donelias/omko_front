<?php

namespace App\Http\Controllers\Api;

use App\Models\Property;
use App\Models\Favourite;
use App\Models\UserInterest;
use App\Models\InterestedUser;
use App\Models\user_reports;
use App\Models\report_reasons;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Services\InterestService;
use App\Http\Requests\AddFavouriteRequest;
use App\Http\Requests\MarkInterestedRequest;
use App\Http\Requests\ReportPropertyRequest;
use App\Http\Requests\StoreUserInterestsRequest;
use App\Http\Requests\DeleteUserInterestRequest;

class InterestApiController extends Controller
{
    protected InterestService $interestService;

    public function __construct(InterestService $interestService)
    {
        $this->interestService = $interestService;
    }

    /**
     * Add property to favorites
     *
     * @param AddFavouriteRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addFavourite(AddFavouriteRequest $request)
    {
        try {
            $user = Auth::user();
            $this->interestService->addFavourite($user, $request->validated()['property_id']);

            return response()->json([
                'error' => false,
                'message' => 'Added to favorites'
            ]);
        } catch (\Exception $e) {
            Log::error('Add favourite error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get user's favourite properties
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFavourites()
    {
        try {
            $userId = Auth::user()->id;

            $favourites = Favourite::where('user_id', $userId)
                ->with('property:id,title,price,title_image,address,propery_type')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'error' => false,
                'message' => 'Favourites fetched',
                'data' => $favourites
            ]);
        } catch (\Exception $e) {
            Log::error('Get favourites error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Mark user as interested in a property
     *
     * @param MarkInterestedRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markInterested(MarkInterestedRequest $request)
    {
        try {
            $user = Auth::user();
            $this->interestService->markInterested($user, $request->validated()['property_id']);

            return response()->json([
                'error' => false,
                'message' => 'Marked as interested'
            ]);
        } catch (\Exception $e) {
            Log::error('Mark interested error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get interested users for a property
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInterestedUsers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ]);
        }

        try {
            $interestedUsers = InterestedUser::where('property_id', $request->property_id)
                ->with('customer:id,name,email,mobile,profile')
                ->get();

            return response()->json([
                'error' => false,
                'message' => 'Interested users fetched',
                'data' => $interestedUsers
            ]);
        } catch (\Exception $e) {
            Log::error('Get interested users error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Report a property
     *
     * @param ReportPropertyRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function reportProperty(ReportPropertyRequest $request)
    {
        try {
            $this->interestService->reportProperty(
                Auth::user()->id,
                $request->validated()['property_id'],
                $request->validated()['reason_id'],
                $request->validated()['description'] ?? ''
            );

            return response()->json([
                'error' => false,
                'message' => 'Report submitted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Report property error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get report reasons
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getReportReasons()
    {
        try {
            $reasons = report_reasons::all();

            return response()->json([
                'error' => false,
                'message' => 'Report reasons fetched',
                'data' => $reasons
            ]);
        } catch (\Exception $e) {
            Log::error('Get report reasons error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get user's personalized interests
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserInterests()
    {
        try {
            $userId = Auth::user()->id;

            $interests = UserInterest::where('customer_id', $userId)
                ->get();

            return response()->json([
                'error' => false,
                'message' => 'User interests fetched',
                'data' => $interests
            ]);
        } catch (\Exception $e) {
            Log::error('Get user interests error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Store user interests
     *
     * @param StoreUserInterestsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeUserInterests(StoreUserInterestsRequest $request)
    {
        try {
            $user = Auth::user();
            $this->interestService->storeUserInterests($user, $request->validated()['interests']);

            return response()->json([
                'error' => false,
                'message' => 'Interests saved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Store user interests error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Delete user interest
     *
     * @param DeleteUserInterestRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteUserInterest(DeleteUserInterestRequest $request)
    {
        try {
            $user = Auth::user();
            $this->interestService->deleteUserInterest($user, $request->validated()['interest_id']);

            return response()->json([
                'error' => false,
                'message' => 'Interest deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete user interest error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }
}
