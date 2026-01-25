<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\ChatService;
use App\Models\Customer;
use App\Models\Chats;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ChatServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ChatService $service;
    protected Customer $sender;
    protected Customer $receiver;
    protected Property $property;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new ChatService();
        $this->sender = Customer::factory()->create();
        $this->receiver = Customer::factory()->create();
        $this->property = Property::factory()->create();
    }

    /**
     * Test sending text message
     */
    public function test_send_text_message(): void
    {
        $data = [
            'message' => 'Hello, is this property available?',
            'property_id' => $this->property->id,
        ];

        $message = $this->service->sendMessage($this->sender, $this->receiver->id, $data);

        $this->assertInstanceOf(Chats::class, $message);
        $this->assertEquals($this->sender->id, $message->sender_id);
        $this->assertEquals($this->receiver->id, $message->receiver_id);
        $this->assertEquals($this->property->id, $message->property_id);
        $this->assertEquals('Hello, is this property available?', $message->message);
        $this->assertEmpty($message->file);
        $this->assertEmpty($message->audio);
    }

    /**
     * Test sending message with file
     */
    public function test_send_message_with_file(): void
    {
        $data = [
            'message' => 'Check this document',
            'file' => 'contract.pdf',
            'property_id' => $this->property->id,
        ];

        $message = $this->service->sendMessage($this->sender, $this->receiver->id, $data);

        $this->assertInstanceOf(Chats::class, $message);
        $this->assertEquals('Check this document', $message->message);
        $this->assertStringContainsString('contract.pdf', $message->file);
        $this->assertEmpty($message->audio);
    }

    /**
     * Test sending message with audio
     */
    public function test_send_message_with_audio(): void
    {
        $data = [
            'message' => 'Voice message',
            'audio' => 'voice_note.mp3',
            'property_id' => $this->property->id,
        ];

        $message = $this->service->sendMessage($this->sender, $this->receiver->id, $data);

        $this->assertInstanceOf(Chats::class, $message);
        $this->assertEquals('Voice message', $message->message);
        $this->assertStringContainsString('voice_note.mp3', $message->audio);
        $this->assertEmpty($message->file);
    }

    /**
     * Test getting messages between two users
     */
    public function test_get_messages(): void
    {
        // Create messages from both directions
        Chats::factory()->create([
            'sender_id' => $this->sender->id,
            'receiver_id' => $this->receiver->id,
            'property_id' => $this->property->id,
            'message' => 'Message 1',
        ]);

        Chats::factory()->create([
            'sender_id' => $this->receiver->id,
            'receiver_id' => $this->sender->id,
            'property_id' => $this->property->id,
            'message' => 'Message 2',
        ]);

        $result = $this->service->getMessages($this->sender, $this->receiver->id);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('total', $result);
        $this->assertArrayHasKey('page', $result);
        $this->assertArrayHasKey('limit', $result);
        $this->assertEquals(2, $result['total']);
    }

    /**
     * Test getting messages with pagination
     */
    public function test_get_messages_pagination(): void
    {
        // Create 55 messages
        for ($i = 0; $i < 55; $i++) {
            Chats::factory()->create([
                'sender_id' => $this->sender->id,
                'receiver_id' => $this->receiver->id,
                'property_id' => $this->property->id,
                'message' => 'Message ' . $i,
            ]);
        }

        // Get first page (50 messages)
        $page1 = $this->service->getMessages($this->sender, $this->receiver->id, 1, 50);

        $this->assertEquals(50, count($page1['data']));
        $this->assertEquals(55, $page1['total']);
        $this->assertEquals(1, $page1['page']);

        // Get second page (5 messages)
        $page2 = $this->service->getMessages($this->sender, $this->receiver->id, 2, 50);

        $this->assertEquals(5, count($page2['data']));
        $this->assertEquals(2, $page2['page']);
    }

    /**
     * Test getting messages only retrieves conversation between two users
     */
    public function test_get_messages_filters_by_users(): void
    {
        $otherUser = Customer::factory()->create();

        // Messages between sender and receiver
        Chats::factory()->create([
            'sender_id' => $this->sender->id,
            'receiver_id' => $this->receiver->id,
            'property_id' => $this->property->id,
            'message' => 'Message to receiver',
        ]);

        // Messages between sender and other user (should not appear)
        Chats::factory()->create([
            'sender_id' => $this->sender->id,
            'receiver_id' => $otherUser->id,
            'property_id' => $this->property->id,
            'message' => 'Message to other user',
        ]);

        $result = $this->service->getMessages($this->sender, $this->receiver->id);

        $this->assertEquals(1, $result['total']);
    }

    /**
     * Test empty conversation returns empty array
     */
    public function test_get_messages_empty_conversation(): void
    {
        $result = $this->service->getMessages($this->sender, $this->receiver->id);

        $this->assertEquals(0, $result['total']);
        $this->assertEmpty($result['data']);
    }
}
