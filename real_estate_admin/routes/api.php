<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PropertyApiController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\ChatApiController;
use App\Http\Controllers\Api\PaymentApiController;
use App\Http\Controllers\Api\PackageApiController;
use App\Http\Controllers\Api\InterestApiController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AgentUnavailabilityController;
use App\Http\Controllers\Api\PropertyViewController;
// Fallback to old controller for methods not yet migrated
use App\Http\Controllers\ApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

Route::middleware(['language'])->group(function () {

// Property Routes
Route::get('get_property', [PropertyApiController::class, 'getProperties']);
Route::get('get_nearby_properties', [PropertyApiController::class, 'getNearbyProperties']);
Route::post('set_property_total_click', [PropertyApiController::class, 'setPropertyClick']);

// User Routes
Route::post('user_signup', [UserApiController::class, 'signup']);
Route::get('get-otp', [UserApiController::class, 'getOtp']);
Route::get('verify-otp', [UserApiController::class, 'verifyOtp']);

// Package Routes
Route::get('get_package', [PackageApiController::class, 'getPackages']);

// Interest Routes
Route::get('get_report_reasons', [InterestApiController::class, 'getReportReasons']);

// General Routes (Still using old controller)
Route::get('get-cities-data', [ApiController::class, 'getCitiesData']);
Route::post('contct_us', [ApiController::class, 'contct_us']);
Route::get('get-slider', [ApiController::class, 'getSlider']);
Route::get('get_facilities', [ApiController::class, 'get_facilities']);
Route::get('get_seo_settings', [ApiController::class, 'get_seo_settings']);
Route::get('get_projects', [ApiController::class, 'get_projects']);
Route::get('get_articles', [ApiController::class, 'get_articles']);
Route::get('get_categories', [ApiController::class, 'get_categories']);
Route::get('get_languages', [ApiController::class, 'get_languages']);
Route::match(['GET', 'POST'], 'app_payment_status', [ApiController::class, 'app_payment_status']);
Route::get('get_advertisement', [ApiController::class, 'get_advertisement']);
Route::post('mortgage_calc', [ApiController::class, 'mortgage_calc']);
Route::get('get_app_settings', [ApiController::class, 'get_app_settings']);
Route::get('agent-list', [ApiController::class, 'getAgentList']);
Route::get('agent-properties', [ApiController::class, 'getAgentProperties']);
Route::get('web-settings', [ApiController::class, 'getWebSettings']);
Route::get('app-settings', [ApiController::class, 'getAppSettings']);
Route::post('get_system_settings', [ApiController::class, 'get_system_settings']);
Route::get('homepage-data', [ApiController::class, 'homepageData']);
Route::get('faqs', [ApiController::class, 'getFaqData']);

// Property Views (Public - for tracking)
Route::post('properties/{propertyId}/view', [PropertyViewController::class, 'recordView']);
Route::get('properties/{propertyId}/views/stats', [PropertyViewController::class, 'propertyViewsStats']);
Route::get('properties/most-viewed', [PropertyViewController::class, 'mostViewed']);
Route::get('properties/most-viewed/month', [PropertyViewController::class, 'mostViewedThisMonth']);

});

// ============================================
// AUTHENTICATED ROUTES
// ============================================

Route::middleware(['auth:sanctum'])->group(function () {

    // ========== PROPERTY ROUTES ==========
    Route::post('post_property', [PropertyApiController::class, 'createProperty']);
    Route::post('update_post_property', [PropertyApiController::class, 'updateProperty']);
    Route::post('delete_property', [PropertyApiController::class, 'deleteProperty']);
    Route::post('update_property_status', [PropertyApiController::class, 'updatePropertyStatus']);
    Route::get('get-added-properties', [PropertyApiController::class, 'getUserProperties']);
    Route::post('remove_post_images', [PropertyApiController::class, 'removePropertyImage']);

    // ========== USER ROUTES ==========
    Route::post('update_profile', [UserApiController::class, 'updateProfile']);
    Route::post('delete_user', [UserApiController::class, 'deleteUser']);
    Route::post('before-logout', [UserApiController::class, 'beforeLogout']);
    Route::get('get-user-data', [UserApiController::class, 'getUserData']);
    Route::get('get_user_recommendation', [UserApiController::class, 'getUserRecommendation']);

    // ========== CHAT ROUTES ==========
    Route::post('send_message', [ChatApiController::class, 'sendMessage']);
    Route::post('delete_chat_message', [ChatApiController::class, 'deleteMessage']);
    Route::get('get_messages', [ChatApiController::class, 'getMessages']);
    Route::get('get_chats', [ChatApiController::class, 'getChats']);

    // ========== PAYMENT ROUTES ==========
    Route::post('createPaymentIntent', [PaymentApiController::class, 'createPaymentIntent']);
    Route::post('confirmPayment', [PaymentApiController::class, 'confirmPayment']);
    Route::get('get_payment_settings', [PaymentApiController::class, 'getPaymentSettings']);
    Route::get('get_payment_details', [PaymentApiController::class, 'getPaymentDetails']);
    Route::post('paypal', [PaymentApiController::class, 'handlePaypal']);

    // ========== PACKAGE ROUTES ==========
    Route::post('assign_package', [PackageApiController::class, 'assignPackage']);
    Route::get('get_limits', [PackageApiController::class, 'getLimits']);
    Route::delete('remove-all-packages', [PackageApiController::class, 'removeAllPackages']);
    Route::post('user_purchase_package', [PackageApiController::class, 'purchasePackage']);

    // ========== APPOINTMENTS ROUTES ==========
    Route::get('appointments', [AppointmentController::class, 'index']);
    Route::post('appointments', [AppointmentController::class, 'store']);
    Route::get('appointments/{id}', [AppointmentController::class, 'show']);
    Route::put('appointments/{id}', [AppointmentController::class, 'update']);
    Route::patch('appointments/{id}/confirm', [AppointmentController::class, 'confirm']);
    Route::patch('appointments/{id}/complete', [AppointmentController::class, 'complete']);
    Route::delete('appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
    Route::patch('appointments/{id}/reschedule', [AppointmentController::class, 'reschedule']);
    Route::delete('appointments/{id}', [AppointmentController::class, 'destroy']);
    Route::get('appointments/stats', [AppointmentController::class, 'stats']);
    Route::get('users/{userId}/appointments', [AppointmentController::class, 'getUserAppointments']);
    Route::get('properties/{propertyId}/appointments', [AppointmentController::class, 'getPropertyAppointments']);

    // ========== AGENT UNAVAILABILITY ROUTES ==========
    Route::get('agents/{agentId}/unavailabilities', [AgentUnavailabilityController::class, 'index']);
    Route::post('agents/{agentId}/unavailabilities', [AgentUnavailabilityController::class, 'store']);
    Route::get('unavailabilities/{id}', [AgentUnavailabilityController::class, 'show']);
    Route::put('unavailabilities/{id}', [AgentUnavailabilityController::class, 'update']);
    Route::delete('unavailabilities/{id}', [AgentUnavailabilityController::class, 'destroy']);
    Route::get('agents/{agentId}/unavailabilities/current', [AgentUnavailabilityController::class, 'currentUnavailabilities']);
    Route::get('agents/{agentId}/check-availability/{date}', [AgentUnavailabilityController::class, 'checkAvailability']);
    Route::get('agents/{agentId}/unavailabilities/stats', [AgentUnavailabilityController::class, 'stats']);

    // ========== PROPERTY VIEWS ROUTES ==========
    Route::get('properties/{propertyId}/views', [PropertyViewController::class, 'propertyViews']);
    Route::get('users/{userId}/property-views', [PropertyViewController::class, 'userViews']);
    Route::delete('properties/{propertyId}/views/cleanup', [PropertyViewController::class, 'cleanup']);

    // ========== INTEREST/FAVORITES ROUTES ==========
    Route::post('add_favourite', [InterestApiController::class, 'addFavourite']);
    Route::get('get_favourite_property', [InterestApiController::class, 'getFavourites']);
    Route::post('user_interested_property', [InterestApiController::class, 'markInterested']);
    Route::get('get_interested_users', [InterestApiController::class, 'getInterestedUsers']);
    Route::post('add_reports', [InterestApiController::class, 'reportProperty']);
    Route::get('personalised-fields', [InterestApiController::class, 'getUserInterests']);
    Route::post('personalised-fields', [InterestApiController::class, 'storeUserInterests']);
    Route::delete('personalised-fields', [InterestApiController::class, 'deleteUserInterest']);

    // ========== FALLBACK ROUTES (Still using old controller) ==========
    Route::get('get_notification_list', [ApiController::class, 'get_notification_list']);
    Route::get('get_property_inquiry', [ApiController::class, 'get_property_inquiry']);
    Route::post('set_property_inquiry', [ApiController::class, 'set_property_inquiry']);
    Route::post('interested_users', [ApiController::class, 'interested_users']);
    Route::post('delete_favourite', [ApiController::class, 'delete_favourite']);
    Route::post('delete_advertisement', [ApiController::class, 'delete_advertisement']);
    Route::post('delete_inquiry', [ApiController::class, 'delete_inquiry']);
    Route::post('store_advertisement', [ApiController::class, 'store_advertisement']);
    Route::post('post_project', [ApiController::class, 'post_project']);
    Route::post('delete_project', [ApiController::class, 'delete_project']);
    Route::get('get-agent-verification-form-fields', [ApiController::class, 'getAgentVerificationFormFields']);
    Route::get('get-agent-verification-form-values', [ApiController::class, 'getAgentVerificationFormValues']);
    Route::post('apply-agent-verification', [ApiController::class, 'applyAgentVerification']);
    Route::post('add_edit_user_interest', [ApiController::class, 'add_edit_user_interest']);
});
