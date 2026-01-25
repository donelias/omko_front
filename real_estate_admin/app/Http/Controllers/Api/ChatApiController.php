<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use App\Models\User;
use App\Models\Chats;
use App\Models\Property;
use App\Models\Customer;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Services\ChatService;
use App\Http\Requests\SendMessageRequest;
use App\Http\Requests\GetMessagesRequest;
use App\Http\Requests\DeleteMessageRequest;

class ChatApiController extends Controller
{
    protected ChatService $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    /**
     * Send a message
     *
     * @param SendMessageRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendMessage(SendMessageRequest $request)
    {
        try {
            $validated = $request->validated();
            $sender = Auth::user();
            $chat = $this->chatService->sendMessage(
                $sender,
                $validated['receiver_id'],
                $validated
            );
            
            return response()->json([
                'error' => false,
                'message' => 'Message sent successfully',
                'data' => $chat
            ]);
        } catch (\Exception $e) {
            Log::error('Send message error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get messages for a property conversation
     *
     * @param GetMessagesRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMessages(GetMessagesRequest $request)
    {
        try {
            $user = Auth::user();
            $validated = $request->validated();
            $result = $this->chatService->getMessages(
                $user,
                $validated['receiver_id'],
                $request->get('page', 1),
                $request->get('per_page', 15)
            );
            
            return response()->json([
                'error' => false,
                'message' => 'Messages fetched successfully',
                'total_page' => ceil($result['total'] / $result['limit']),
                'data' => $result['data']
            ]);
        } catch (\Exception $e) {
            Log::error('Get messages error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Get chat conversations list
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getChats(Request $request)
    {
        try {
            $currentUser = Auth::user()->id;
            $perPage = $request->per_page ?? 15;
            $page = $request->page ?? 1;

            $chats = Chats::with(['sender', 'receiver', 'property'])
                ->select('id', 'sender_id', 'receiver_id', 'property_id', 'created_at')
                ->where(function ($query) use ($currentUser) {
                    $query->where('sender_id', $currentUser)
                        ->orWhere('receiver_id', $currentUser);
                })
                ->orderBy('id', 'desc')
                ->groupBy('property_id')
                ->paginate($perPage, ['*'], 'page', $page);

            if ($chats->count() > 0) {
                $conversations = [];

                foreach ($chats as $chat) {
                    $conversation = [
                        'property_id' => $chat->property_id,
                        'title' => $chat->property->title ?? '',
                        'title_image' => $chat->property->title_image ?? '',
                        'date' => $chat->created_at
                    ];

                    if (!$chat->receiver || !$chat->sender) {
                        // One party is admin
                        $conversation['user_id'] = 0;
                        $conversation['name'] = 'Admin';
                        $conversation['profile'] = url('assets/images/faces/2.jpg');
                    } else {
                        // Both are customers
                        if ($chat->sender->id == $currentUser) {
                            $conversation['user_id'] = $chat->receiver->id;
                            $conversation['name'] = $chat->receiver->name;
                            $conversation['profile'] = $chat->receiver->profile;
                        } else {
                            $conversation['user_id'] = $chat->sender->id;
                            $conversation['name'] = $chat->sender->name;
                            $conversation['profile'] = $chat->sender->profile;
                        }
                    }

                    $conversations[] = $conversation;
                }

                return response()->json([
                    'error' => false,
                    'message' => 'Chats fetched successfully',
                    'total_page' => $chats->lastPage(),
                    'data' => $conversations
                ]);
            }

            return response()->json([
                'error' => false,
                'message' => 'No chats found',
                'data' => [],
                'total_page' => 0
            ]);
        } catch (\Exception $e) {
            Log::error('Get chats error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    /**
     * Delete a chat message
     *
     * @param DeleteMessageRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteMessage(DeleteMessageRequest $request)
    {
        try {
            $message = Chats::find($request->validated()['message_id']);
            if (!$message) {
                return response()->json(['error' => true, 'message' => 'Message not found'], 404);
            }
            $user = Auth::user();
            $this->chatService->deleteMessage($message, $user);

            return response()->json([
                'error' => false,
                'message' => 'Message deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete message error: ' . $e->getMessage());

            return response()->json([
                'error' => true,
                'message' => 'Something went wrong'
            ], 500);
        }
    }
}
