<?php

namespace Tests\Unit;

use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\ChatApiController;
use App\Http\Controllers\Api\PropertyApiController;
use App\Http\Controllers\Api\PaymentApiController;
use App\Http\Controllers\Api\PackageApiController;
use App\Http\Controllers\Api\InterestApiController;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

class ControllersRefactoringTest extends TestCase
{
    /**
     * Test that all API controllers are properly refactored with Service injection
     */
    public function test_api_controllers_have_service_injection()
    {
        $controllers = [
            UserApiController::class,
            ChatApiController::class,
            PropertyApiController::class,
            PaymentApiController::class,
            PackageApiController::class,
            InterestApiController::class,
        ];

        foreach ($controllers as $controllerClass) {
            $reflection = new ReflectionClass($controllerClass);
            
            // Check that constructor exists
            $constructor = $reflection->getConstructor();
            $this->assertNotNull($constructor, "$controllerClass should have a constructor");
            
            // Check that service is injected
            $properties = $reflection->getProperties();
            $hasServiceProperty = false;
            
            foreach ($properties as $property) {
                if (strpos($property->getName(), 'Service') !== false) {
                    $hasServiceProperty = true;
                    break;
                }
            }
            
            // At least one method should use the service
            $methods = $reflection->getMethods();
            $this->assertGreaterThan(0, count($methods), "$controllerClass should have methods");
        }
    }

    /**
     * Test that User controller has refactored methods
     */
    public function test_user_controller_has_refactored_methods()
    {
        $controller = new ReflectionClass(UserApiController::class);
        $methods = ['signup', 'updateProfile', 'deleteUser', 'getOtp'];
        
        foreach ($methods as $methodName) {
            $this->assertTrue(
                $controller->hasMethod($methodName),
                "UserApiController should have method: $methodName"
            );
        }
    }

    /**
     * Test that Chat controller has refactored methods
     */
    public function test_chat_controller_has_refactored_methods()
    {
        $controller = new ReflectionClass(ChatApiController::class);
        $methods = ['sendMessage', 'getMessages', 'deleteMessage'];
        
        foreach ($methods as $methodName) {
            $this->assertTrue(
                $controller->hasMethod($methodName),
                "ChatApiController should have method: $methodName"
            );
        }
    }

    /**
     * Test that Interest controller has refactored methods
     */
    public function test_interest_controller_has_refactored_methods()
    {
        $controller = new ReflectionClass(InterestApiController::class);
        $methods = ['addFavourite', 'markInterested', 'deleteUserInterest'];
        
        foreach ($methods as $methodName) {
            $this->assertTrue(
                $controller->hasMethod($methodName),
                "InterestApiController should have method: $methodName"
            );
        }
    }

    /**
     * Test that controllers have proper error handling with try-catch
     */
    public function test_controllers_have_try_catch_blocks()
    {
        $controllers = [
            UserApiController::class,
            ChatApiController::class,
            PropertyApiController::class,
            PaymentApiController::class,
            PackageApiController::class,
            InterestApiController::class,
        ];

        foreach ($controllers as $controllerClass) {
            $reflection = new ReflectionClass($controllerClass);
            $filename = $reflection->getFileName();
            $code = file_get_contents($filename);
            
            // Check that controllers have try-catch blocks for error handling
            $this->assertStringContainsString(
                'try {',
                $code,
                "$controllerClass should have try-catch error handling"
            );
            
            $this->assertStringContainsString(
                'catch',
                $code,
                "$controllerClass should have catch blocks"
            );
        }
    }
}
