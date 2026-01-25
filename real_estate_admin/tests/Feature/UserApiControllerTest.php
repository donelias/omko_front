<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserApiControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test signup with missing fields fails validation
     */
    public function test_signup_missing_fields_validation(): void
    {
        $response = $this->postJson('/api/user_signup', [
            'name' => 'John Doe',
            // Missing email, phone, password
        ]);

        $response->assertStatus(422);
    }
}


