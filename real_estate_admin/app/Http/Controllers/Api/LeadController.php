<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Models\Lead;
use App\Models\AgentMetaCredential;
use App\Services\LeadService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LeadController extends Controller
{
    private $leadService;

    public function __construct(LeadService $leadService)
    {
        $this->leadService = $leadService;
    }

    /**
     * Receive lead from Meta webhook (per-agent)
     * POST /api/leads/webhook/meta/{agentId}
     */
    public function metaWebhook($agentId, Request $request)
    {
        try {
            // Get agent's Meta credentials
            $credential = AgentMetaCredential::where('agent_id', $agentId)
                ->active()
                ->first();
            
            if (!$credential) {
                Log::warning("Meta webhook: No active credentials for agent {$agentId}");
                return response()->json([
                    'error' => true,
                    'message' => 'No credentials configured',
                ], 401);
            }

            // Validate Meta signature using agent's credentials
            $signature = $request->header('X-Hub-Signature-256');
            if (!$credential->verifyWebhookSignature($request->getContent(), $signature)) {
                Log::warning("Meta webhook: Signature verification failed for agent {$agentId}");
                return response()->json([
                    'error' => true,
                    'message' => 'Invalid signature',
                ], 401);
            }

            $data = $request->json()->all();

            // Handle Meta webhook events
            if ($data['entry'][0]['changes'][0]['value']['form_id'] ?? null) {
                $leadData = $data['entry'][0]['changes'][0]['value'];
                $lead = $this->leadService->createFromMeta($agentId, $leadData, $credential);

                return response()->json([
                    'error' => false,
                    'message' => 'Lead received and stored successfully',
                    'lead_id' => $lead->id,
                ]);
            }

            return response()->json([
                'error' => false,
                'message' => 'Event processed',
            ]);

        } catch (Exception $e) {
            Log::error("Meta webhook error for agent {$agentId}", [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error processing lead: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create lead from website form
     * POST /api/leads
     */
    public function store(StoreLeadRequest $request)
    {
        try {
            $data = array_merge(
                $request->validated(),
                [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent'),
                ]
            );

            $lead = $this->leadService->createFromWebsite($data);

            return response()->json([
                'error' => false,
                'message' => 'Lead created successfully',
                'lead' => $lead,
            ], 201);

        } catch (Exception $e) {
            Log::error('Error creating lead', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error creating lead: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get leads for authenticated agent
     * GET /api/leads
     */
    public function index(Request $request)
    {
        try {
            $agentId = auth('api')->user()->id ?? null;

            if (!$agentId) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $filters = [
                'status' => $request->input('status'),
                'property_id' => $request->input('property_id'),
                'source' => $request->input('source'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
                'per_page' => $request->input('per_page', 15),
            ];

            $result = $this->leadService->getLeadsByAgent($agentId, $filters);

            return response()->json([
                'error' => false,
                'leads' => $result['leads'],
                'statistics' => $result['statistics'],
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching leads', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error fetching leads',
            ], 500);
        }
    }

    /**
     * Get single lead
     * GET /api/leads/{id}
     */
    public function show($id)
    {
        try {
            $lead = Lead::with('property', 'agent')->find($id);

            if (!$lead) {
                return response()->json([
                    'error' => true,
                    'message' => 'Lead not found',
                ], 404);
            }

            // Check authorization
            $agentId = auth('api')->user()->id ?? null;
            if ($lead->agent_id !== $agentId && auth('api')->user()->type != 0) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 403);
            }

            return response()->json([
                'error' => false,
                'lead' => $lead,
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching lead', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error fetching lead',
            ], 500);
        }
    }

    /**
     * Update lead status
     * PUT /api/leads/{id}/status
     */
    public function updateStatus($id, Request $request)
    {
        try {
            $lead = Lead::find($id);

            if (!$lead) {
                return response()->json([
                    'error' => true,
                    'message' => 'Lead not found',
                ], 404);
            }

            // Check authorization
            $agentId = auth('api')->user()->id ?? null;
            if ($lead->agent_id !== $agentId && auth('api')->user()->type != 0) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $request->validate([
                'status' => 'required|in:new,contacted,interested,rejected,converted',
                'notes' => 'nullable|string',
            ]);

            $lead = $this->leadService->updateStatus(
                $lead,
                $request->input('status'),
                $request->input('notes')
            );

            return response()->json([
                'error' => false,
                'message' => 'Lead status updated successfully',
                'lead' => $lead,
            ]);

        } catch (Exception $e) {
            Log::error('Error updating lead status', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error updating lead status',
            ], 500);
        }
    }

    /**
     * Add note to lead
     * POST /api/leads/{id}/notes
     */
    public function addNote($id, Request $request)
    {
        try {
            $lead = Lead::find($id);

            if (!$lead) {
                return response()->json([
                    'error' => true,
                    'message' => 'Lead not found',
                ], 404);
            }

            // Check authorization
            $agentId = auth('api')->user()->id ?? null;
            if ($lead->agent_id !== $agentId && auth('api')->user()->type != 0) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $request->validate([
                'note' => 'required|string|min:5',
            ]);

            $lead = $this->leadService->addNote($lead, $request->input('note'));

            return response()->json([
                'error' => false,
                'message' => 'Note added successfully',
                'lead' => $lead,
            ]);

        } catch (Exception $e) {
            Log::error('Error adding note', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error adding note',
            ], 500);
        }
    }

    /**
     * Get leads by property
     * GET /api/properties/{propertyId}/leads
     */
    public function getByProperty($propertyId)
    {
        try {
            $result = $this->leadService->getLeadsByProperty($propertyId);

            return response()->json([
                'error' => false,
                'leads' => $result['leads'],
                'statistics' => $result['statistics'],
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching leads by property', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error fetching leads',
            ], 500);
        }
    }

    /**
     * Get conversion metrics
     * GET /api/leads/metrics/conversion
     */
    public function getConversionMetrics(Request $request)
    {
        try {
            $agentId = auth('api')->user()->id ?? null;
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            $metrics = $this->leadService->getConversionMetrics($agentId, $startDate, $endDate);

            return response()->json([
                'error' => false,
                'metrics' => $metrics,
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching metrics', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error fetching metrics',
            ], 500);
        }
    }

    /**
     * Delete lead
     * DELETE /api/leads/{id}
     */
    public function destroy($id)
    {
        try {
            $lead = Lead::find($id);

            if (!$lead) {
                return response()->json([
                    'error' => true,
                    'message' => 'Lead not found',
                ], 404);
            }

            // Check authorization (only admin or agent owner)
            $agentId = auth('api')->user()->id ?? null;
            if ($lead->agent_id !== $agentId && auth('api')->user()->type != 0) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $this->leadService->deleteLead($lead);

            return response()->json([
                'error' => false,
                'message' => 'Lead deleted successfully',
            ]);

        } catch (Exception $e) {
            Log::error('Error deleting lead', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error deleting lead',
            ], 500);
        }
    }

    // ============================================
    // ADMIN ROUTES - Full CRUD for Administrators
    // ============================================

    /**
     * Get all leads (Admin only)
     * GET /api/admin/leads
     */
    public function indexAll(Request $request)
    {
        try {
            // Verify admin access
            if (!$this->isAdmin()) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized - Admin access required',
                ], 403);
            }

            $filters = [
                'agent_id' => $request->input('agent_id'),
                'status' => $request->input('status'),
                'property_id' => $request->input('property_id'),
                'source' => $request->input('source'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
                'per_page' => $request->input('per_page', 25),
            ];

            $result = $this->leadService->getAllLeads($filters);

            return response()->json([
                'error' => false,
                'leads' => $result['leads'],
                'statistics' => $result['statistics'],
                'total' => $result['total'],
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching all leads', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error fetching leads',
            ], 500);
        }
    }

    /**
     * Update lead (Admin only)
     * PUT /api/admin/leads/{id}
     */
    public function updateAsAdmin($id, Request $request)
    {
        try {
            // Verify admin access
            if (!$this->isAdmin()) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized - Admin access required',
                ], 403);
            }

            $lead = Lead::find($id);

            if (!$lead) {
                return response()->json([
                    'error' => true,
                    'message' => 'Lead not found',
                ], 404);
            }

            $request->validate([
                'first_name' => 'sometimes|string|min:2',
                'last_name' => 'sometimes|string',
                'email' => 'sometimes|email',
                'phone' => 'sometimes|string|max:20',
                'country' => 'sometimes|string',
                'status' => 'sometimes|in:new,contacted,interested,rejected,converted',
                'property_id' => 'sometimes|exists:properties,id',
                'agent_id' => 'sometimes|exists:customers,id',
                'notes' => 'sometimes|string',
            ]);

            $lead = $this->leadService->updateLeadAsAdmin($lead, $request->all());

            return response()->json([
                'error' => false,
                'message' => 'Lead updated successfully',
                'lead' => $lead,
            ]);

        } catch (Exception $e) {
            Log::error('Error updating lead as admin', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error updating lead: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete lead (Admin only)
     * DELETE /api/admin/leads/{id}
     */
    public function destroyAsAdmin($id)
    {
        try {
            // Verify admin access
            if (!$this->isAdmin()) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized - Admin access required',
                ], 403);
            }

            $lead = Lead::find($id);

            if (!$lead) {
                return response()->json([
                    'error' => true,
                    'message' => 'Lead not found',
                ], 404);
            }

            $this->leadService->deleteLead($lead);

            Log::info('Lead deleted by admin', [
                'lead_id' => $id,
                'admin_id' => auth('api')->user()->id,
            ]);

            return response()->json([
                'error' => false,
                'message' => 'Lead deleted successfully',
            ]);

        } catch (Exception $e) {
            Log::error('Error deleting lead as admin', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error deleting lead',
            ], 500);
        }
    }

    /**
     * Reassign lead to another agent (Admin only)
     * PUT /api/admin/leads/{id}/assign
     */
    public function assignToAgentAsAdmin($id, Request $request)
    {
        try {
            // Verify admin access
            if (!$this->isAdmin()) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized - Admin access required',
                ], 403);
            }

            $request->validate([
                'agent_id' => 'required|exists:customers,id',
            ]);

            $lead = Lead::find($id);

            if (!$lead) {
                return response()->json([
                    'error' => true,
                    'message' => 'Lead not found',
                ], 404);
            }

            $lead = $this->leadService->assignToAgent($lead, $request->input('agent_id'));

            Log::info('Lead reassigned by admin', [
                'lead_id' => $id,
                'new_agent_id' => $request->input('agent_id'),
                'admin_id' => auth('api')->user()->id,
            ]);

            return response()->json([
                'error' => false,
                'message' => 'Lead reassigned successfully',
                'lead' => $lead,
            ]);

        } catch (Exception $e) {
            Log::error('Error reassigning lead', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error reassigning lead',
            ], 500);
        }
    }

    /**
     * Get leads statistics (Admin only)
     * GET /api/admin/leads/stats
     */
    public function getStatsAsAdmin(Request $request)
    {
        try {
            // Verify admin access
            if (!$this->isAdmin()) {
                return response()->json([
                    'error' => true,
                    'message' => 'Unauthorized - Admin access required',
                ], 403);
            }

            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            $stats = $this->leadService->getAdminStats($startDate, $endDate);

            return response()->json([
                'error' => false,
                'stats' => $stats,
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching admin stats', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Error fetching statistics',
            ], 500);
        }
    }

    /**
     * Verify Meta signature using agent's credentials
     * 
     * @param AgentMetaCredential $credential
     * @param string $payload
     * @param string $signature
     * @return bool
     */
    private function verifyMetaSignature($credential, $payload, $signature)
    {
        return $credential->verifyWebhookSignature($payload, $signature);
    }

    /**
     * Check if user is admin
     * 
     * @return bool
     */
    private function isAdmin()
    {
        $user = auth('api')->user();
        return $user && ($user->type == 0 || $user->is_admin); // type 0 = admin or has is_admin flag
    }
}
