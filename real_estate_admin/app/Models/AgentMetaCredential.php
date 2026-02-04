<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class AgentMetaCredential extends Model
{
    use HasFactory;

    protected $table = 'agent_meta_credentials';

    protected $fillable = [
        'agent_id',
        'meta_app_id',
        'meta_app_secret',
        'meta_pixel_id',
        'meta_conversion_api_token',
        'meta_webhook_token',
        'meta_business_account_id',
        'meta_lead_form_id',
        'meta_page_id',
        'is_active',
        'notes',
        'verified_by',
    ];

    protected $hidden = [
        'meta_app_secret',
        'meta_conversion_api_token',
        'meta_webhook_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'verified_at' => 'datetime',
        'last_webhook_received_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con Agent (Customer)
     */
    public function agent()
    {
        return $this->belongsTo(Customer::class, 'agent_id', 'id');
    }

    /**
     * Mutator: Encriptar credenciales sensibles al guardar
     */
    public function setMetaAppSecretAttribute($value)
    {
        if ($value) {
            $this->attributes['meta_app_secret'] = Crypt::encryptString($value);
        }
    }

    public function setMetaConversionApiTokenAttribute($value)
    {
        if ($value) {
            $this->attributes['meta_conversion_api_token'] = Crypt::encryptString($value);
        }
    }

    public function setMetaWebhookTokenAttribute($value)
    {
        if ($value) {
            $this->attributes['meta_webhook_token'] = Crypt::encryptString($value);
        }
    }

    public function setMetaAppIdAttribute($value)
    {
        if ($value) {
            $this->attributes['meta_app_id'] = Crypt::encryptString($value);
        }
    }

    public function setMetaPixelIdAttribute($value)
    {
        if ($value) {
            $this->attributes['meta_pixel_id'] = Crypt::encryptString($value);
        }
    }

    /**
     * Accessor: Desencriptar credenciales al acceder
     */
    public function getMetaAppSecretAttribute($value)
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public function getMetaConversionApiTokenAttribute($value)
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public function getMetaWebhookTokenAttribute($value)
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public function getMetaAppIdAttribute($value)
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public function getMetaPixelIdAttribute($value)
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    /**
     * Verificar que las credenciales están completas
     */
    public function isComplete(): bool
    {
        return !empty($this->meta_app_id) 
            && !empty($this->meta_app_secret) 
            && !empty($this->meta_webhook_token);
    }

    /**
     * Scope: Credenciales activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Por agente
     */
    public function scopeByAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    /**
     * Scope: Verificadas
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    /**
     * Marcar credenciales como verificadas
     */
    public function markAsVerified($verifiedBy = null)
    {
        $this->update([
            'verified_at' => now(),
            'verified_by' => $verifiedBy,
        ]);
        
        return $this;
    }

    /**
     * Actualizar estadísticas de webhook recibido
     */
    public function recordWebhookReceived()
    {
        $this->increment('webhook_received_count');
        $this->update(['last_webhook_received_at' => now()]);
    }

    /**
     * Obtener credenciales de Meta sin encriptación (interno)
     */
    public function getDecryptedCredentials(): array
    {
        return [
            'app_id' => $this->meta_app_id,
            'app_secret' => $this->meta_app_secret,
            'pixel_id' => $this->meta_pixel_id,
            'conversion_api_token' => $this->meta_conversion_api_token,
            'webhook_token' => $this->meta_webhook_token,
            'business_account_id' => $this->meta_business_account_id,
        ];
    }

    /**
     * Validar si webhook viene de Meta correcto (verificar firma)
     */
    public function verifyWebhookSignature($payload, $signature): bool
    {
        if (!$this->meta_app_secret) {
            return false;
        }

        $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $this->meta_app_secret);
        return hash_equals($expectedSignature, $signature ?? '');
    }

    /**
     * Validar token de verificación del webhook
     */
    public function verifyWebhookToken($token): bool
    {
        return hash_equals($this->meta_webhook_token ?? '', $token ?? '');
    }
}
