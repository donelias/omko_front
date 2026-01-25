<?php

namespace App\Services;

use App\Models\Chats;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ChatService
{
    /**
     * Send a message
     */
    public function sendMessage(Customer $sender, int $recipientId, array $data): Chats
    {
        return Chats::create([
            'sender_id' => $sender->id,
            'receiver_id' => $recipientId,
            'property_id' => $data['property_id'] ?? null,
            'message' => $data['message'] ?? '',
            'file' => $data['file'] ?? null,
            'audio' => $data['audio'] ?? null,
        ]);
    }

    /**
     * Get conversation messages
     */
    public function getMessages(Customer $user, int $otherUserId, int $page = 1, int $limit = 50): array
    {
        $query = Chats::where(function ($q) use ($user, $otherUserId) {
            $q->where('sender_id', $user->id)->where('receiver_id', $otherUserId)
              ->orWhere('sender_id', $otherUserId)->where('receiver_id', $user->id);
        })->orderBy('created_at', 'desc');

        $total = $query->count();
        $messages = $query->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        return [
            'data' => $messages,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ];
    }

    /**
     * Get user's chat list
     */
    public function getChats(Customer $user): Collection
    {
        return Chats::where('sender_id', $user->id)
            ->orWhere('recipient_id', $user->id)
            ->groupBy('conversation_id')
            ->selectRaw('MAX(created_at) as latest_message, conversation_id')
            ->orderBy('latest_message', 'desc')
            ->get();
    }

    /**
     * Delete a message
     */
    public function deleteMessage(Chats $message, Customer $user): bool
    {
        if ($message->sender_id !== $user->id) {
            return false; // User can only delete their own messages
        }

        return $message->delete();
    }
}
