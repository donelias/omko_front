<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\Property;
use App\Models\Customer;
use App\Models\AgentMetaCredential;
use Exception;
use Illuminate\Support\Facades\Log;

class LeadService
{
    /**
     * Create a lead from Meta webhook data (per-agent)
     * 
     * @param int $agentId
     * @param array $data
     * @param AgentMetaCredential|null $credential
     * @return Lead
     */
    public function createFromMeta($agentId, array $data, ?AgentMetaCredential $credential = null): Lead
    {
        try {
            // If no credential provided, fetch it
            if (!$credential) {
                $credential = AgentMetaCredential::where('agent_id', $agentId)
                    ->active()
                    ->first();
                
                if (!$credential) {
                    throw new Exception("No active Meta credentials for agent {$agentId}");
                }
            }

            // Extract Meta lead data
            $leadData = [
                'first_name' => $data['field_data'][0]['value'] ?? 'Unknown',
                'last_name' => $data['field_data'][1]['value'] ?? null,
                'email' => $data['field_data'][2]['value'] ?? null,
                'phone' => $data['field_data'][3]['value'] ?? null,
                'country' => $data['field_data'][4]['value'] ?? null,
                'meta_lead_id' => $data['id'] ?? null,
                'meta_campaign_id' => $data['campaign_id'] ?? null,
                'meta_ad_id' => $data['ad_id'] ?? null,
                'meta_form_id' => $data['form_id'] ?? null,
                'source' => 'meta',
                'status' => 'new',
                'agent_id' => $agentId,
                'meta_data' => json_encode($data),
            ];

            // Try to associate with property
            $propertyId = $data['property_id'] ?? null;
            if ($propertyId) {
                $property = Property::where('id', $propertyId)
                    ->where('added_by', $agentId)
                    ->first();
                
                if ($property) {
                    $leadData['property_id'] = $property->id;
                }
            }

            $lead = Lead::create($leadData);

            Log::info('Lead created from Meta', [
                'lead_id' => $lead->id,
                'agent_id' => $agentId,
                'meta_lead_id' => $lead->meta_lead_id,
                'property_id' => $lead->property_id,
            ]);

            return $lead;

        } catch (Exception $e) {
            Log::error('Error creating lead from Meta', [
                'error' => $e->getMessage(),
                'agent_id' => $agentId,
                'data' => $data,
            ]);
            throw $e;
        }
    }

    /**
     * Create a lead manually from website
     */
    public function createFromWebsite(array $data): Lead
    {
        try {
            $leadData = [
                'first_name' => $data['first_name'] ?? 'Unknown',
                'last_name' => $data['last_name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'country' => $data['country'] ?? null,
                'property_id' => $data['property_id'] ?? null,
                'source' => 'website',
                'status' => 'new',
                'ip_address' => $data['ip_address'] ?? null,
                'user_agent' => $data['user_agent'] ?? null,
            ];

            // Find agent by property
            if ($data['property_id'] ?? null) {
                $property = Property::find($data['property_id']);
                if ($property) {
                    $leadData['agent_id'] = $property->added_by;
                }
            }

            $lead = Lead::create($leadData);

            Log::info('Lead created from website', [
                'lead_id' => $lead->id,
                'property_id' => $lead->property_id,
            ]);

            return $lead;

        } catch (Exception $e) {
            Log::error('Error creating lead from website', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);
            throw $e;
        }
    }

    /**
     * Update lead status
     */
    public function updateStatus(Lead $lead, string $status, string $notes = null): Lead
    {
        try {
            $lead->update([
                'status' => $status,
                'notes' => $notes ?? $lead->notes,
            ]);

            if ($status === 'contacted') {
                $lead->markAsContacted();
            } elseif ($status === 'converted') {
                $lead->markAsConverted();
            }

            Log::info('Lead status updated', [
                'lead_id' => $lead->id,
                'status' => $status,
            ]);

            return $lead;

        } catch (Exception $e) {
            Log::error('Error updating lead status', [
                'error' => $e->getMessage(),
                'lead_id' => $lead->id,
            ]);
            throw $e;
        }
    }

    /**
     * Assign lead to agent
     */
    public function assignToAgent(Lead $lead, int $agentId): Lead
    {
        try {
            $agent = Customer::find($agentId);
            
            if (!$agent) {
                throw new Exception("Agent not found");
            }

            $lead->update(['agent_id' => $agentId]);

            Log::info('Lead assigned to agent', [
                'lead_id' => $lead->id,
                'agent_id' => $agentId,
            ]);

            return $lead;

        } catch (Exception $e) {
            Log::error('Error assigning lead to agent', [
                'error' => $e->getMessage(),
                'lead_id' => $lead->id,
            ]);
            throw $e;
        }
    }

    /**
     * Get leads by agent with filters
     */
    public function getLeadsByAgent(int $agentId, array $filters = []): array
    {
        try {
            $query = Lead::where('agent_id', $agentId);

            // Status filter
            if ($filters['status'] ?? null) {
                $query->where('status', $filters['status']);
            }

            // Property filter
            if ($filters['property_id'] ?? null) {
                $query->where('property_id', $filters['property_id']);
            }

            // Date range filter
            if ($filters['start_date'] ?? null && $filters['end_date'] ?? null) {
                $query->byDateRange($filters['start_date'], $filters['end_date']);
            }

            // Source filter
            if ($filters['source'] ?? null) {
                $query->where('source', $filters['source']);
            }

            $leads = $query->with('property')
                ->orderBy('created_at', 'desc')
                ->paginate($filters['per_page'] ?? 15);

            return [
                'leads' => $leads,
                'statistics' => Lead::getStatistics($agentId),
            ];

        } catch (Exception $e) {
            Log::error('Error fetching leads', [
                'error' => $e->getMessage(),
                'agent_id' => $agentId,
            ]);
            throw $e;
        }
    }

    /**
     * Get leads by property
     */
    public function getLeadsByProperty(int $propertyId): array
    {
        try {
            $leads = Lead::where('property_id', $propertyId)
                ->with('agent')
                ->orderBy('created_at', 'desc')
                ->get();

            return [
                'leads' => $leads,
                'statistics' => Lead::getStatistics(null, $propertyId),
            ];

        } catch (Exception $e) {
            Log::error('Error fetching leads by property', [
                'error' => $e->getMessage(),
                'property_id' => $propertyId,
            ]);
            throw $e;
        }
    }

    /**
     * Add notes to lead
     */
    public function addNote(Lead $lead, string $note): Lead
    {
        try {
            $currentNotes = $lead->notes ? $lead->notes . "\n---\n" : '';
            $lead->update([
                'notes' => $currentNotes . "[" . now()->format('Y-m-d H:i:s') . "]\n" . $note,
            ]);

            return $lead;

        } catch (Exception $e) {
            Log::error('Error adding note to lead', [
                'error' => $e->getMessage(),
                'lead_id' => $lead->id,
            ]);
            throw $e;
        }
    }

    /**
     * Delete lead
     */
    public function deleteLead(Lead $lead): bool
    {
        try {
            return $lead->delete();
        } catch (Exception $e) {
            Log::error('Error deleting lead', [
                'error' => $e->getMessage(),
                'lead_id' => $lead->id,
            ]);
            throw $e;
        }
    }

    /**
     * Get lead conversion metrics
     */
    public function getConversionMetrics(int $agentId = null, $startDate = null, $endDate = null): array
    {
        try {
            $query = Lead::query();

            if ($agentId) {
                $query->where('agent_id', $agentId);
            }

            if ($startDate && $endDate) {
                $query->byDateRange($startDate, $endDate);
            }

            $totalLeads = $query->count();
            $convertedLeads = (clone $query)->where('status', 'converted')->count();
            $contactedLeads = (clone $query)->where('status', 'contacted')->count();
            $interestedLeads = (clone $query)->where('status', 'interested')->count();

            return [
                'total_leads' => $totalLeads,
                'converted_leads' => $convertedLeads,
                'contacted_leads' => $contactedLeads,
                'interested_leads' => $interestedLeads,
                'conversion_rate' => $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0,
                'contact_rate' => $totalLeads > 0 ? round(($contactedLeads / $totalLeads) * 100, 2) : 0,
                'interest_rate' => $totalLeads > 0 ? round(($interestedLeads / $totalLeads) * 100, 2) : 0,
            ];

        } catch (Exception $e) {
            Log::error('Error fetching conversion metrics', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get all leads (Admin - no filtering)
     */
    public function getAllLeads(array $filters = []): array
    {
        try {
            $query = Lead::with('property', 'agent');

            // Apply optional filters
            if (!empty($filters['agent_id'])) {
                $query->where('agent_id', $filters['agent_id']);
            }

            if (!empty($filters['property_id'])) {
                $query->where('property_id', $filters['property_id']);
            }

            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            if (!empty($filters['source'])) {
                $query->where('source', $filters['source']);
            }

            if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
                $query->byDateRange($filters['start_date'], $filters['end_date']);
            }

            $perPage = $filters['per_page'] ?? 25;
            $total = (clone $query)->count();
            $leads = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return [
                'leads' => $leads,
                'statistics' => $this->getAdminStats(
                    $filters['start_date'] ?? null,
                    $filters['end_date'] ?? null
                ),
                'total' => $total,
            ];

        } catch (Exception $e) {
            Log::error('Error fetching all leads', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Update lead as admin (full update allowed)
     */
    public function updateLeadAsAdmin(Lead $lead, array $data): Lead
    {
        try {
            $updateData = [];

            // Update allowed fields
            if (isset($data['first_name'])) {
                $updateData['first_name'] = $data['first_name'];
            }
            if (isset($data['last_name'])) {
                $updateData['last_name'] = $data['last_name'];
            }
            if (isset($data['email'])) {
                $updateData['email'] = $data['email'];
            }
            if (isset($data['phone'])) {
                $updateData['phone'] = $data['phone'];
            }
            if (isset($data['country'])) {
                $updateData['country'] = $data['country'];
            }
            if (isset($data['status'])) {
                $updateData['status'] = $data['status'];
            }
            if (isset($data['property_id'])) {
                $updateData['property_id'] = $data['property_id'];
            }
            if (isset($data['agent_id'])) {
                $updateData['agent_id'] = $data['agent_id'];
            }

            $lead->update($updateData);

            // Add note if provided
            if (isset($data['notes'])) {
                $this->addNote($lead, "[Admin Update] " . $data['notes']);
            }

            Log::info('Lead updated by admin', [
                'lead_id' => $lead->id,
                'updated_fields' => array_keys($updateData),
            ]);

            return $lead;

        } catch (Exception $e) {
            Log::error('Error updating lead as admin', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get admin statistics
     */
    public function getAdminStats($startDate = null, $endDate = null): array
    {
        try {
            $query = Lead::query();

            if ($startDate && $endDate) {
                $query->byDateRange($startDate, $endDate);
            }

            $totalLeads = $query->count();
            $byStatus = [
                'new' => (clone $query)->where('status', 'new')->count(),
                'contacted' => (clone $query)->where('status', 'contacted')->count(),
                'interested' => (clone $query)->where('status', 'interested')->count(),
                'rejected' => (clone $query)->where('status', 'rejected')->count(),
                'converted' => (clone $query)->where('status', 'converted')->count(),
            ];

            $bySource = [
                'meta' => (clone $query)->where('source', 'meta')->count(),
                'website' => (clone $query)->where('source', 'website')->count(),
            ];

            // Stats by agent (top 10)
            $byAgent = Lead::selectRaw('agent_id, COUNT(*) as total, SUM(CASE WHEN status = "converted" THEN 1 ELSE 0 END) as converted')
                ->groupBy('agent_id')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'agent_id' => $item->agent_id,
                        'agent_name' => $item->agent ? $item->agent->first_name . ' ' . $item->agent->last_name : 'Unknown',
                        'total_leads' => $item->total,
                        'converted' => $item->converted ?? 0,
                        'conversion_rate' => $item->total > 0 ? round(($item->converted / $item->total) * 100, 2) : 0,
                    ];
                })
                ->toArray();

            return [
                'total_leads' => $totalLeads,
                'by_status' => $byStatus,
                'by_source' => $bySource,
                'by_agent' => $byAgent,
                'conversion_rate' => $totalLeads > 0 ? round(($byStatus['converted'] / $totalLeads) * 100, 2) : 0,
                'contact_rate' => $totalLeads > 0 ? round(($byStatus['contacted'] / $totalLeads) * 100, 2) : 0,
            ];

        } catch (Exception $e) {
            Log::error('Error fetching admin stats', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Assign lead to agent
     */
    public function assignToAgent(Lead $lead, int $agentId): Lead
    {
        try {
            $agent = Customer::find($agentId);

            if (!$agent) {
                throw new Exception("Agent not found with ID: {$agentId}");
            }

            $oldAgentId = $lead->agent_id;
            $lead->update(['agent_id' => $agentId]);

            Log::info('Lead reassigned', [
                'lead_id' => $lead->id,
                'old_agent_id' => $oldAgentId,
                'new_agent_id' => $agentId,
            ]);

            $this->addNote($lead, "Lead reassigned from Agent {$oldAgentId} to Agent {$agentId}");

            return $lead;

        } catch (Exception $e) {
            Log::error('Error assigning lead to agent', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}

```
