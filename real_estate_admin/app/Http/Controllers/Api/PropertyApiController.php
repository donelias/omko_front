<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\Property;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Favourite;
use App\Models\CityImage;
use Illuminate\Support\Facades\Log;
use App\Models\parameter;
use App\Models\Advertisement;
use App\Models\PropertyImages;
use App\Models\InterestedUser;
use Illuminate\Http\Request;
use App\Models\AssignParameters;
use App\Models\PropertiesDocument;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\AssignedOutdoorFacilities;
use App\Services\PropertyService;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Http\Requests\UpdatePropertyStatusRequest;
use App\Http\Requests\PropertyClickRequest;
use App\Http\Requests\RemovePropertyImageRequest;
use App\Http\Requests\DeletePropertyRequest;

class PropertyApiController extends Controller
{
    protected PropertyService $propertyService;

    public function __construct(PropertyService $propertyService)
    {
        $this->propertyService = $propertyService;
    }

    /**
     * Get all properties with filters
     *
     * @param Request $request
     * @return array
     */
    public function getProperties(Request $request)
    {
        try {
            $offset = isset($request->offset) ? $request->offset : 0;
            $limit = isset($request->limit) ? $request->limit : 10;
            
            $current_user = null;
            if (Auth::guard('sanctum')->check()) {
                $current_user = Auth::guard('sanctum')->user()->id;
            }

            $property = Property::with('customer', 'user', 'category:id,category,image,slug_id', 'assignfacilities.outdoorfacilities', 'parameters', 'favourite', 'interested_users')->where('status', 1);

            $max_price = isset($request->max_price) ? $request->max_price : Property::max('price');
            $min_price = isset($request->min_price) ? $request->min_price : 0;

            // Filter by parameter ID
            if ($request->has('parameter_id') && !empty($request->parameter_id)) {
                $parameterId = $request->parameter_id;
                $property = $property->whereHas('parameters', function ($q) use ($parameterId) {
                    $q->where('parameter_id', $parameterId);
                });
            }

            // Filter by price range
            if (isset($request->max_price) && isset($request->min_price) && (!empty($request->max_price) && !empty($min_price))) {
                $property = $property->whereBetween('price', [$min_price, $max_price]);
            }

            // Filter by property type (0: Sell, 1: Rent)
            if ($request->has('property_type') && (!empty($request->property_type) || $request->property_type == 0)) {
                $property = $property->where('propery_type', $request->property_type);
            }

            // Filter by posted since
            if ($request->has('posted_since') && !empty($request->posted_since)) {
                $posted_since = $request->posted_since;
                if ($posted_since == 0) {
                    $startDateOfWeek = Carbon::now()->subWeek()->startOfWeek();
                    $endDateOfWeek = Carbon::now()->subWeek()->endOfWeek();
                    $property = $property->whereBetween('created_at', [$startDateOfWeek, $endDateOfWeek]);
                } elseif ($posted_since == 1) {
                    $yesterdayDate = Carbon::yesterday();
                    $property = $property->whereDate('created_at', $yesterdayDate);
                }
            }

            // Filter by category
            if ($request->has('category_id') && !empty($request->category_id)) {
                $property = $property->where('category_id', $request->category_id);
            }

            // Filter by category slug
            if ($request->has('category_slug_id') && !empty($request->category_slug_id)) {
                $category = Category::where('slug_id', $request->category_slug_id)->first();
                if ($category) {
                    $property = $property->where('category_id', $category->id);
                }
            }

            // Filter by property ID
            if ($request->has('id') && !empty($request->id)) {
                $property = $property->where('id', $request->id);
            }

            // Filter by slug
            if ($request->has('slug_id') && !empty($request->slug_id)) {
                $property = $property->where('slug_id', $request->slug_id);
            }

            // Filter by country
            if ($request->has('country') && !empty($request->country)) {
                $property = $property->where('country', $request->country);
            }

            // Filter by state
            if ($request->has('state') && !empty($request->state)) {
                $property = $property->where('state', $request->state);
            }

            // Filter by city
            if ($request->has('city') && !empty($request->city)) {
                $property = $property->where('city', $request->city);
            }

            // Filter by promoted
            if ($request->has('promoted') && !empty($request->promoted)) {
                $propertiesId = Advertisement::whereNot('type', 'Slider')->where('is_enable', 1)->pluck('property_id');
                $property = $property->whereIn('id', $propertiesId)->inRandomOrder();
            }

            // Filter by user promoted
            if ($request->has('users_promoted') && !empty($request->users_promoted) && $current_user) {
                $propertiesId = Advertisement::where('customer_id', $current_user)->pluck('property_id');
                $property = $property->whereIn('id', $propertiesId);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $property = $property->where(function ($query) use ($search) {
                    $query->where('title', 'LIKE', "%$search%")
                        ->orWhere('address', 'LIKE', "%$search%")
                        ->orWhereHas('category', function ($query1) use ($search) {
                            $query1->where('category', 'LIKE', "%$search%");
                        });
                });
            }

            // Sort by top rated
            if ($request->has('top_rated') && $request->top_rated == 1) {
                $property = $property->orderBy('total_click', 'DESC');
            }

            // Sort by most liked
            if ($request->has('most_liked') && !empty($request->most_liked)) {
                $property = $property->withCount('favourite')->orderBy('favourite_count', 'DESC');
            }

            $total = $property->count();
            $result = $property->orderBy('id', 'DESC')->skip($offset)->take($limit)->get();

            if (!$result->isEmpty()) {
                $property_details = get_property_details($result, $current_user);

                if ($property_details) {
                    $getSimilarProperties = [];
                    if (isset($request->id) && !empty($request->id)) {
                        $getSimilarPropertiesQueryData = Property::where('id', '!=', $request->id)
                            ->select('id', 'slug_id', 'category_id', 'title', 'added_by', 'address', 'city', 'country', 'state', 'propery_type', 'price', 'created_at', 'title_image')
                            ->where('status', 1)
                            ->orderBy('id', 'desc')
                            ->limit(10)
                            ->get();
                        $getSimilarProperties = get_property_details($getSimilarPropertiesQueryData, $current_user);
                    } elseif (isset($request->slug_id) && !empty($request->slug_id)) {
                        $getSimilarPropertiesQueryData = Property::where('slug_id', '!=', $request->slug_id)
                            ->select('id', 'slug_id', 'category_id', 'title', 'added_by', 'address', 'city', 'country', 'state', 'propery_type', 'price', 'created_at', 'title_image')
                            ->where('status', 1)
                            ->orderBy('id', 'desc')
                            ->limit(10)
                            ->get();
                        $getSimilarProperties = get_property_details($getSimilarPropertiesQueryData, $current_user);
                    }

                    return response()->json([
                        'error' => false,
                        'message' => 'Data Fetch Successfully',
                        'total' => $total,
                        'data' => $property_details,
                        'similar_properties' => $getSimilarProperties ?? []
                    ]);
                }
            }

            return response()->json([
                'error' => false,
                'message' => 'No data found!',
                'data' => [],
                'total' => 0
            ]);
        } catch (\Exception $e) {
            Log::error('Get properties error: ' . $e->getMessage());
            return response()->json(['error' => true, 'message' => 'Error fetching properties'], 500);
        }
    }

    /**
     * Create a new property
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createProperty(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required',
            'description' => 'required',
            'category_id' => 'required',
            'property_type' => 'required',
            'address' => 'required',
            'title_image' => 'required|file|max:3000|mimes:jpeg,png,jpg',
            'three_d_image' => 'nullable|mimes:jpg,jpeg,png,gif|max:3000',
            'documents.*' => 'nullable|mimes:pdf,doc,docx,txt|max:5120',
            'price' => ['required', function ($attribute, $value, $fail) {
                if ($value > 1000000000000) {
                    $fail("The Price must not exceed one trillion.");
                }
            }],
            'video_link' => ['nullable', 'url'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first(),
            ]);
        }

        try {
            DB::beginTransaction();
            $loggedInUserId = Auth::user()->id;

            // Get current package with property limit check
            $currentPackage = $this->getCurrentPackage($loggedInUserId, 1);

            if (!$currentPackage) {
                return response()->json([
                    'error' => true,
                    'message' => 'Package not found'
                ]);
            }

            $slugData = $request->slug_id ?? $request->title;
            $property = new Property();
            $property->category_id = $request->category_id;
            $property->slug_id = generateUniqueSlug($slugData, 1);
            $property->title = $request->title;
            $property->description = $request->description;
            $property->address = $request->address;
            $property->client_address = $request->client_address ?? '';
            $property->propery_type = $request->property_type;
            $property->price = $request->price;
            $property->country = $request->country ?? '';
            $property->state = $request->state ?? '';
            $property->city = $request->city ?? '';
            $property->latitude = $request->latitude ?? '';
            $property->longitude = $request->longitude ?? '';
            $property->rentduration = $request->rentduration ?? '';
            $property->meta_title = $request->meta_title ?? '';
            $property->meta_description = $request->meta_description ?? '';
            $property->meta_keywords = $request->meta_keywords ?? '';
            $property->added_by = $loggedInUserId;
            $property->video_link = $request->video_link ?? '';
            $property->package_id = $request->package_id ?? null;
            $property->post_type = 1;
            $property->status = $this->getAutoApproveStatus($loggedInUserId) ? 1 : 0;

            // Handle title image
            if ($request->hasFile('title_image')) {
                $destinationPath = public_path('images') . config('global.PROPERTY_TITLE_IMG_PATH');
                if (!is_dir($destinationPath)) {
                    mkdir($destinationPath, 0777, true);
                }
                $file = $request->file('title_image');
                $imageName = microtime(true) . "." . $file->getClientOriginalExtension();
                $titleImageName = handleFileUpload($request, 'title_image', $destinationPath, $imageName);
                $property->title_image = $titleImageName;
            }

            // Handle meta image
            if ($request->hasFile('meta_image')) {
                $destinationPath = public_path('images') . config('global.PROPERTY_SEO_IMG_PATH');
                if (!is_dir($destinationPath)) {
                    mkdir($destinationPath, 0777, true);
                }
                $file = $request->file('meta_image');
                $imageName = microtime(true) . "." . $file->getClientOriginalExtension();
                $metaImageName = handleFileUpload($request, 'meta_image', $destinationPath, $imageName);
                $property->meta_image = $metaImageName;
            }

            // Handle 3D image
            if ($request->hasFile('three_d_image')) {
                $destinationPath = public_path('images') . config('global.3D_IMG_PATH');
                if (!is_dir($destinationPath)) {
                    mkdir($destinationPath, 0777, true);
                }
                $file = $request->file('three_d_image');
                $imageName = microtime(true) . "." . $file->getClientOriginalExtension();
                $three_dImage = handleFileUpload($request, 'three_d_image', $destinationPath, $imageName);
                $property->three_d_image = $three_dImage;
            }

            $property->is_premium = $request->is_premium === 'true' ? 1 : 0;
            $property->save();

            // Update property limit
            $newPropertyLimitCount = $currentPackage->used_limit_for_property + 1;
            $addPropertyStatus = (!$currentPackage->package->property_limit || $newPropertyLimitCount < $currentPackage->package->property_limit) ? 1 : 0;
            
            $currentPackage->update([
                'used_limit_for_property' => $newPropertyLimitCount,
                'prop_status' => $addPropertyStatus
            ]);

            // Handle facilities
            if ($request->facilities) {
                foreach ($request->facilities as $facility) {
                    AssignedOutdoorFacilities::create([
                        'facility_id' => $facility['facility_id'],
                        'property_id' => $property->id,
                        'distance' => $facility['distance']
                    ]);
                }
            }

            // Handle parameters
            if ($request->parameters) {
                $destinationPathForParam = public_path('images') . config('global.PARAMETER_IMAGE_PATH');
                if (!is_dir($destinationPathForParam)) {
                    mkdir($destinationPathForParam, 0777, true);
                }

                foreach ($request->parameters as $key => $parameter) {
                    if (isset($parameter['value']) && !empty($parameter['value'])) {
                        $assignParam = new AssignParameters();
                        $assignParam->modal()->associate($property);
                        $assignParam->parameter_id = $parameter['parameter_id'];

                        if ($request->hasFile('parameters.' . $key . '.value')) {
                            $file = $request->file('parameters.' . $key . '.value');
                            $imageName = microtime(true) . "." . $file->getClientOriginalExtension();
                            $file->move($destinationPathForParam, $imageName);
                            $assignParam->value = $imageName;
                        } elseif (filter_var($parameter['value'], FILTER_VALIDATE_URL)) {
                            $ch = curl_init($parameter['value']);
                            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                            $fileContents = curl_exec($ch);
                            curl_close($ch);
                            $filename = microtime(true) . basename($parameter['value']);
                            file_put_contents($destinationPathForParam . '/' . $filename, $fileContents);
                            $assignParam->value = $filename;
                        } else {
                            $assignParam->value = $parameter['value'];
                        }
                        $assignParam->save();
                    }
                }
            }

            // Handle gallery images
            $galleryPath = public_path('images') . config('global.PROPERTY_GALLERY_IMG_PATH') . "/" . $property->id;
            if (!is_dir($galleryPath)) {
                mkdir($galleryPath, 0777, true);
            }

            if ($request->hasfile('gallery_images')) {
                foreach ($request->file('gallery_images') as $file) {
                    $name = microtime(true) . '.' . $file->extension();
                    $file->move($galleryPath, $name);
                    PropertyImages::create([
                        'image' => $name,
                        'propertys_id' => $property->id
                    ]);
                }
            }

            // Handle documents
            $documentPath = public_path('images') . config('global.PROPERTY_DOCUMENT_PATH') . "/" . $property->id;
            if (!is_dir($documentPath)) {
                mkdir($documentPath, 0777, true);
            }

            if ($request->hasfile('documents')) {
                $documentsData = [];
                foreach ($request->file('documents') as $file) {
                    $name = microtime(true) . '.' . $file->extension();
                    $type = $file->extension();
                    $file->move($documentPath, $name);
                    $documentsData[] = [
                        'property_id' => $property->id,
                        'name' => $name,
                        'type' => $type
                    ];
                }

                if (!empty($documentsData)) {
                    PropertiesDocument::insert($documentsData);
                }
            }

            // Add city data
            if ($request->city) {
                CityImage::updateOrCreate(['city' => $request->city]);
            }

            $result = Property::with('customer', 'category:id,category,image', 'assignfacilities.outdoorfacilities', 'favourite', 'parameters', 'interested_users')
                ->where('id', $property->id)
                ->get();
            
            $property_details = get_property_details($result);

            DB::commit();

            return response()->json([
                'error' => false,
                'message' => 'Property created successfully',
                'data' => $property_details
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Property creation error: ' . $e->getMessage());
            
            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Update an existing property
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProperty(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required',
            'title' => 'required',
            'description' => 'required',
            'category_id' => 'required',
            'property_type' => 'required',
            'address' => 'required',
            'price' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ]);
        }

        try {
            DB::beginTransaction();
            $property = Property::find($request->property_id);

            if (!$property) {
                return response()->json([
                    'error' => true,
                    'message' => 'Property not found'
                ]);
            }

            $property->update($request->only([
                'title', 'description', 'category_id', 'propery_type', 'address',
                'client_address', 'price', 'country', 'state', 'city',
                'latitude', 'longitude', 'rentduration', 'meta_title',
                'meta_description', 'meta_keywords', 'video_link'
            ]));

            // Handle image updates
            if ($request->hasFile('title_image')) {
                $destinationPath = public_path('images') . config('global.PROPERTY_TITLE_IMG_PATH');
                if (!is_dir($destinationPath)) {
                    mkdir($destinationPath, 0777, true);
                }
                $file = $request->file('title_image');
                $imageName = microtime(true) . "." . $file->getClientOriginalExtension();
                $titleImageName = handleFileUpload($request, 'title_image', $destinationPath, $imageName);
                $property->title_image = $titleImageName;
                $property->save();
            }

            DB::commit();

            return response()->json([
                'error' => false,
                'message' => 'Property updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Property update error: ' . $e->getMessage());
            
            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Delete a property
     *
     * @param DeletePropertyRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteProperty(DeletePropertyRequest $request)
    {
        try {
            $property = Property::find($request->property_id);

            if (!$property) {
                return response()->json([
                    'error' => true,
                    'message' => 'Property not found'
                ]);
            }

            $this->propertyService->deleteProperty($property);

            return response()->json([
                'error' => false,
                'message' => 'Property deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Property deletion error: ' . $e->getMessage());
            
            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Update property status
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePropertyStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required',
            'status' => 'required|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ]);
        }

        try {
            Property::where('id', $request->property_id)->update(['status' => $request->status]);

            return response()->json([
                'error' => false,
                'message' => 'Property status updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Property status update error: ' . $e->getMessage());
            
            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Set property total clicks
     *
     * @param PropertyClickRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function setPropertyClick(PropertyClickRequest $request)
    {
        try {
            $property = Property::find($request->property_id);
            if (!$property) {
                return response()->json([
                    'error' => true,
                    'message' => 'Property not found'
                ], 404);
            }

            $this->propertyService->recordPropertyClick($property);

            return response()->json([
                'error' => false,
                'message' => 'Click count updated'
            ]);
        } catch (\Exception $e) {
            Log::error('Property click error: ' . $e->getMessage());
            
            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get nearby properties
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getNearbyProperties(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'distance' => 'nullable|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ]);
        }

        try {
            $distance = $request->distance ?? 10;
            $latitude = $request->latitude;
            $longitude = $request->longitude;

            $properties = Property::where('status', 1)
                ->whereBetween('latitude', [$latitude - $distance, $latitude + $distance])
                ->whereBetween('longitude', [$longitude - $distance, $longitude + $distance])
                ->limit(50)
                ->get();

            $current_user = Auth::guard('sanctum')->check() ? Auth::guard('sanctum')->user()->id : null;
            $property_details = get_property_details($properties, $current_user);

            return response()->json([
                'error' => false,
                'message' => 'Nearby properties fetched',
                'data' => $property_details
            ]);
        } catch (\Exception $e) {
            Log::error('Get nearby properties error: ' . $e->getMessage());
            
            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get user added properties
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserProperties()
    {
        try {
            $userId = Auth::user()->id;
            
            $properties = Property::where('added_by', $userId)
                ->with('category:id,category,image', 'assignfacilities.outdoorfacilities', 'favourite', 'parameters')
                ->orderBy('created_at', 'desc')
                ->get();

            $property_details = get_property_details($properties, $userId);

            return response()->json([
                'error' => false,
                'message' => 'User properties fetched',
                'data' => $property_details
            ]);
        } catch (\Exception $e) {
            Log::error('Get user properties error: ' . $e->getMessage());
            
            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Remove property image
     *
     * @param RemovePropertyImageRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function removePropertyImage(RemovePropertyImageRequest $request)
    {
        try {
            $result = $this->propertyService->removePropertyImage($request->image_id);

            if (!$result) {
                return response()->json([
                    'error' => true,
                    'message' => 'Image not found'
                ], 404);
            }

            return response()->json([
                'error' => false,
                'message' => 'Image removed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Remove property image error: ' . $e->getMessage());
            
            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Helper: Get current package with limits
     *
     * @param int $userId
     * @param int $type
     * @return mixed
     */
    private function getCurrentPackage($userId, $type)
    {
        return \App\Models\UserPurchasedPackage::where('modal_id', $userId)
            ->where('modal_type', 'App\\Models\\Customer')
            ->where('prop_status', 1)
            ->with('package')
            ->first();
    }

    /**
     * Helper: Check if property should auto-approve
     *
     * @param int $userId
     * @return bool
     */
    private function getAutoApproveStatus($userId)
    {
        $customer = Customer::find($userId);
        return $customer && $customer->is_premium == 1;
    }
}
