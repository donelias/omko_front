<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'appointments';

    protected $fillable = [
        'user_id',
        'agent_id',
        'property_id',
        'project_id',
        'appointment_date',
        'appointment_time',
        'title',
        'contents',
        'status',
        'notes',
        'meeting_type',
        'location',
        'duration_minutes',
        'is_virtual',
        'video_call_link',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime',
        'contents' => 'json',
        'is_virtual' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = ['localized_title', 'localized_contents'];

    /**
     * Estados posibles de una cita
     */
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_NO_SHOW = 'no_show';
    const STATUS_RESCHEDULED = 'rescheduled';

    /**
     * Tipos de reunión
     */
    const TYPE_PROPERTY_VIEWING = 'property_viewing';
    const TYPE_CONSULTATION = 'consultation';
    const TYPE_DOCUMENT_REVIEW = 'document_review';
    const TYPE_PAYMENT_DISCUSSION = 'payment_discussion';
    const TYPE_PROJECT_TOUR = 'project_tour';

    // ============================================
    // RELACIONES
    // ============================================

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id')->withTrashed();
    }

    public function project()
    {
        return $this->belongsTo(ProjectPlans::class, 'project_id')->withTrashed();
    }

    public function cancellation()
    {
        return $this->hasOne(AppointmentCancellation::class, 'appointment_id');
    }

    public function reschedules()
    {
        return $this->hasMany(AppointmentReschedule::class, 'appointment_id');
    }

    // ============================================
    // ACCESORIOS Y MUTADORES (Accessors)
    // ============================================

    /**
     * Obtener título localizado según idioma actual
     */
    public function getLocalizedTitleAttribute()
    {
        $locale = app()->getLocale();
        
        if (!isset($this->contents[$locale])) {
            return $this->title ?? '';
        }

        return $this->contents[$locale]['title'] ?? $this->title ?? '';
    }

    public function getLocalizedTitle($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        
        if (!isset($this->contents[$locale])) {
            return $this->title ?? '';
        }

        return $this->contents[$locale]['title'] ?? $this->title ?? '';
    }

    /**
     * Obtener contenidos localizados según idioma actual
     */
    public function getLocalizedContentsAttribute()
    {
        $locale = app()->getLocale();
        
        if (!isset($this->contents[$locale])) {
            return [
                'title' => $this->title ?? '',
                'description' => '',
            ];
        }

        return $this->contents[$locale];
    }

    public function getLocalizedContents($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        
        if (!isset($this->contents[$locale])) {
            return [
                'title' => $this->title ?? '',
                'description' => '',
            ];
        }

        return $this->contents[$locale];
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('appointment_date', '>=', now()->toDateString())
                     ->whereIn('status', [self::STATUS_SCHEDULED, self::STATUS_CONFIRMED]);
    }

    public function scopePast($query)
    {
        return $query->where('appointment_date', '<', now()->toDateString());
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    public function scopeForProperty($query, $propertyId)
    {
        return $query->where('property_id', $propertyId);
    }

    public function scopeForProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeVirtual($query)
    {
        return $query->where('is_virtual', true);
    }

    public function scopeInPerson($query)
    {
        return $query->where('is_virtual', false);
    }

    // ============================================
    // MÉTODOS DE ESTADO
    // ============================================

    public function confirm()
    {
        $this->update(['status' => self::STATUS_CONFIRMED]);
        return $this;
    }

    public function complete()
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
        return $this;
    }

    public function cancel($reason = null, $cancelledBy = null)
    {
        $this->update(['status' => self::STATUS_CANCELLED]);

        if ($reason || $cancelledBy) {
            AppointmentCancellation::create([
                'appointment_id' => $this->id,
                'reason' => $reason,
                'cancelled_by' => $cancelledBy,
                'cancelled_at' => now(),
            ]);
        }

        return $this;
    }

    public function markNoShow()
    {
        $this->update(['status' => self::STATUS_NO_SHOW]);
        return $this;
    }

    // ============================================
    // MÉTODOS DE VALIDACIÓN
    // ============================================

    public function isUpcoming()
    {
        return $this->appointment_date >= now()->toDateString() &&
               in_array($this->status, [self::STATUS_SCHEDULED, self::STATUS_CONFIRMED]);
    }

    public function isPast()
    {
        return $this->appointment_date < now()->toDateString();
    }

    public function isCancelled()
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function canBeCancelled()
    {
        return in_array($this->status, [
            self::STATUS_SCHEDULED,
            self::STATUS_CONFIRMED,
        ]) && $this->isUpcoming();
    }

    public function canBeRescheduled()
    {
        return in_array($this->status, [
            self::STATUS_SCHEDULED,
            self::STATUS_CONFIRMED,
        ]) && $this->isUpcoming();
    }

    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================

    public function getStatusLabel()
    {
        $labels = [
            self::STATUS_SCHEDULED => 'Agendada',
            self::STATUS_CONFIRMED => 'Confirmada',
            self::STATUS_COMPLETED => 'Completada',
            self::STATUS_CANCELLED => 'Cancelada',
            self::STATUS_NO_SHOW => 'No Comparecida',
            self::STATUS_RESCHEDULED => 'Reprogramada',
        ];

        return $labels[$this->status] ?? $this->status;
    }

    public function getMeetingTypeLabel()
    {
        $labels = [
            self::TYPE_PROPERTY_VIEWING => 'Visualización de Propiedad',
            self::TYPE_CONSULTATION => 'Consulta',
            self::TYPE_DOCUMENT_REVIEW => 'Revisión de Documentos',
            self::TYPE_PAYMENT_DISCUSSION => 'Discusión de Pago',
            self::TYPE_PROJECT_TOUR => 'Tour del Proyecto',
        ];

        return $labels[$this->meeting_type] ?? $this->meeting_type;
    }

    public function getDurationLabel()
    {
        if ($this->duration_minutes < 60) {
            return "{$this->duration_minutes} minutos";
        }

        $hours = intval($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;

        if ($minutes == 0) {
            return "{$hours}h";
        }

        return "{$hours}h {$minutes}m";
    }

    public function toArray()
    {
        $array = parent::toArray();
        
        $array['status_label'] = $this->getStatusLabel();
        $array['meeting_type_label'] = $this->getMeetingTypeLabel();
        $array['is_upcoming'] = $this->isUpcoming();
        $array['is_cancelled'] = $this->isCancelled();
        $array['is_completed'] = $this->isCompleted();

        return $array;
    }
}
