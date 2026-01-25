<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\Package;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\UserPurchasedPackage;
use App\Services\PackageService;
use App\Http\Requests\AssignPackageRequest;
use App\Http\Requests\PurchasePackageRequest;

class PackageApiController extends Controller
{
    protected PackageService $packageService;

    public function __construct(PackageService $packageService)
    {
        $this->packageService = $packageService;
    }

    /**
     * Get all packages
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPackages()
    {
        try {
            $packages = Package::where('status', 1)
                ->orderBy('id', 'asc')
                ->get();

            return response()->json([
                'error' => false,
                'message' => 'Packages fetched',
                'data' => $packages
            ]);
        } catch (\Exception $e) {
            Log::error('Get packages error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Assign package to user
     *
     * @param AssignPackageRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignPackage(AssignPackageRequest $request)
    {
        try {
            $this->packageService->assignPackage(Auth::user()->id, $request->validated()['package_id']);

            return response()->json([
                'error' => false,
                'message' => 'Package assigned successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Assign package error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get user's package limits
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLimits()
    {
        try {
            $limits = $this->packageService->getLimits(Auth::user()->id);

            return response()->json([
                'error' => false,
                'message' => 'Limits fetched',
                'data' => $limits
            ]);
        } catch (\Exception $e) {
            Log::error('Get limits error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Remove all user packages
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeAllPackages()
    {
        try {
            $this->packageService->removeAllPackages(Auth::user()->id);

            return response()->json([
                'error' => false,
                'message' => 'All packages removed'
            ]);
        } catch (\Exception $e) {
            Log::error('Remove packages error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Purchase a package
     *
     * @param PurchasePackageRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function purchasePackage(PurchasePackageRequest $request)
    {
        try {
            $result = $this->packageService->purchasePackage(Auth::user()->id, $request->validated()['package_id']);

            return response()->json([
                'error' => false,
                'message' => 'Package purchased successfully',
                'payment_id' => $result['payment_id'] ?? null
            ]);
        } catch (\Exception $e) {
            Log::error('Purchase package error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }
}
