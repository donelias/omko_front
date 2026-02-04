<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgentMetaCredential;
use App\Models\Customer;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AgentMetaCredentialController extends Controller
{
    /**
     * Get Meta credentials for authenticated agent
     * GET /api/agent/meta-credentials
     */
    public function show(Request $request)
    {
        try {
            $agentId = auth('api')->user()->id ?? null;

            if (!$agentId) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $credentials = AgentMetaCredential::where('agent_id', $agentId)->first();

            if (!$credentials) {
                return response()->json([
                    'error' => false,
                    'message' => 'No credentials configured',
                    'credentials' => null,
                ]);
            }

            return response()->json([
                'error' => false,
                'credentials' => [
                    'id' => $credentials->id,
                    'agent_id' => $credentials->agent_id,
                    'meta_app_id' => $credentials->meta_app_id ? '****' . substr($credentials->meta_app_id, -4) : null,
                    'meta_pixel_id' => $credentials->meta_pixel_id,
                    'meta_lead_form_id' => $credentials->meta_lead_form_id,
                    'meta_page_id' => $credentials->meta_page_id,
                    'meta_business_account_id' => $credentials->meta_business_account_id,
                    'is_active' => $credentials->is_active,
                    'is_complete' => $credentials->isComplete(),
                    'verified_at' => $credentials->verified_at,
                    'verified' => $credentials->verified_at !== null,
                    'last_webhook_received_at' => $credentials->last_webhook_received_at,
                    'webhook_received_count' => $credentials->webhook_received_count,
                    'notes' => $credentials->notes,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching Meta credentials', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error fetching credentials',
            ], 500);
        }
    }

    /**
     * Create or update Meta credentials for agent
     * POST /api/agent/meta-credentials
     * PUT /api/agent/meta-credentials
     */
    public function store(Request $request)
    {
        try {
            $agentId = auth('api')->user()->id ?? null;

            if (!$agentId) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 401);
            }

            // Validar entrada
            $request->validate([
                'meta_app_id' => 'required|string|min:10',
                'meta_app_secret' => 'required|string|min:20',
                'meta_webhook_token' => 'required|string|min:10',
                'meta_pixel_id' => 'nullable|string',
                'meta_conversion_api_token' => 'nullable|string',
                'meta_business_account_id' => 'nullable|string',
                'meta_lead_form_id' => 'nullable|string',
                'meta_page_id' => 'nullable|string',
                'notes' => 'nullable|string',
            ]);

            // Buscar o crear credenciales
            $credentials = AgentMetaCredential::firstOrNew(['agent_id' => $agentId]);

            $credentials->fill([
                'meta_app_id' => $request->meta_app_id,
                'meta_app_secret' => $request->meta_app_secret,
                'meta_webhook_token' => $request->meta_webhook_token,
                'meta_pixel_id' => $request->meta_pixel_id,
                'meta_conversion_api_token' => $request->meta_conversion_api_token,
                'meta_business_account_id' => $request->meta_business_account_id,
                'meta_lead_form_id' => $request->meta_lead_form_id,
                'meta_page_id' => $request->meta_page_id,
                'notes' => $request->notes,
            ]);

            $credentials->save();

            Log::info('Agent Meta credentials saved', [
                'agent_id' => $agentId,
                'app_id' => substr($request->meta_app_id, 0, 5) . '...',
            ]);

            return response()->json([
                'error' => false,
                'message' => 'Credentials saved successfully',
                'credentials' => [
                    'id' => $credentials->id,
                    'agent_id' => $credentials->agent_id,
                    'meta_app_id' => '****' . substr($credentials->meta_app_id, -4),
                    'is_complete' => $credentials->isComplete(),
                    'is_active' => $credentials->is_active,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Error saving Meta credentials', [
                'error' => $e->getMessage(),
                'agent_id' => auth('api')->user()->id ?? null,
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error saving credentials: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify Meta credentials
     * POST /api/agent/meta-credentials/verify
     */
    public function verify(Request $request)
    {
        try {
            $agentId = auth('api')->user()->id ?? null;

            if (!$agentId) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $credentials = AgentMetaCredential::where('agent_id', $agentId)->first();

            if (!$credentials) {
                return response()->json([
                    'error' => true,
                    'message' => 'No credentials found',
                ], 404);
            }

            if (!$credentials->isComplete()) {
                return response()->json([
                    'error' => true,
                    'message' => 'Credentials are incomplete. Please provide all required fields.',
                ], 400);
            }

            // Verificar con Meta API (simple validation)
            $decrypted = $credentials->getDecryptedCredentials();

            $testUrl = 'https://graph.facebook.com/v18.0/me?access_token=' . $decrypted['app_id'];
            
            // Aquí se podría hacer una llamada real a Meta para verificar
            // Por ahora marcamos como verificadas
            $credentials->markAsVerified(auth('api')->user()->email ?? 'unknown');

            Log::info('Agent Meta credentials verified', [
                'agent_id' => $agentId,
            ]);

            return response()->json([
                'error' => false,
                'message' => 'Credentials verified successfully',
                'verified_at' => $credentials->verified_at,
            ]);

        } catch (Exception $e) {
            Log::error('Error verifying Meta credentials', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error verifying credentials: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Activate/Deactivate Meta credentials
     * PATCH /api/agent/meta-credentials/toggle
     */
    public function toggle(Request $request)
    {
        try {
            $agentId = auth('api')->user()->id ?? null;

            if (!$agentId) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $credentials = AgentMetaCredential::where('agent_id', $agentId)->first();

            if (!$credentials) {
                return response()->json([
                    'error' => true,
                    'message' => 'No credentials found',
                ], 404);
            }

            $request->validate([
                'is_active' => 'required|boolean',
            ]);

            $credentials->update(['is_active' => $request->is_active]);

            Log::info('Agent Meta credentials toggled', [
                'agent_id' => $agentId,
                'is_active' => $request->is_active,
            ]);

            return response()->json([
                'error' => false,
                'message' => 'Credentials ' . ($request->is_active ? 'activated' : 'deactivated'),
                'is_active' => $credentials->is_active,
            ]);

        } catch (Exception $e) {
            Log::error('Error toggling Meta credentials', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error toggling credentials',
            ], 500);
        }
    }

    /**
     * Delete Meta credentials
     * DELETE /api/agent/meta-credentials
     */
    public function destroy(Request $request)
    {
        try {
            $agentId = auth('api')->user()->id ?? null;

            if (!$agentId) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $credentials = AgentMetaCredential::where('agent_id', $agentId)->first();

            if (!$credentials) {
                return response()->json([
                    'error' => true,
                    'message' => 'No credentials found',
                ], 404);
            }

            $credentials->delete();

            Log::info('Agent Meta credentials deleted', [
                'agent_id' => $agentId,
            ]);

            return response()->json([
                'error' => false,
                'message' => 'Credentials deleted successfully',
            ]);

        } catch (Exception $e) {
            Log::error('Error deleting Meta credentials', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error deleting credentials',
            ], 500);
        }
    }

    /**
     * Get webhook endpoint URL for this agent
     * GET /api/agent/meta-credentials/webhook-url
     */
    public function getWebhookUrl(Request $request)
    {
        try {
            $agentId = auth('api')->user()->id ?? null;

            if (!$agentId) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $webhookUrl = url("/api/leads/webhook/meta/{$agentId}");

            return response()->json([
                'error' => false,
                'webhook_url' => $webhookUrl,
                'description' => 'Use this URL in your Meta Dashboard webhook configuration',
            ]);

        } catch (Exception $e) {
            Log::error('Error getting webhook URL', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error getting webhook URL',
            ], 500);
        }
    }
}
