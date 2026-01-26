<?php

namespace App\Traits;

use App\Models\Translation;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\SoftDeletes;

trait ManageTranslations
{
    /**
     * Boot the trait
     */
    public static function bootManageTranslations()
    {
        // Handle hard deletes (when not using soft deletes)
        static::deleting(function ($model) {
            // Only clean up translations if this is a hard delete
            // or if the model doesn't use soft deletes
            if (!$model->usesSoftDeletes() || (method_exists($model, 'isForceDeleting') && $model->isForceDeleting())) {
                if (method_exists($model, 'translations')) {
                    $model->translations()->delete();
                }
            }
        });

        // Handle force deletes (when using soft deletes)
        // Only register this event if the model actually uses soft deletes
        if (in_array(SoftDeletes::class, class_uses_recursive(static::class))) {
            static::forceDeleting(function ($model) {
                if (method_exists($model, 'translations')) {
                    $model->translations()->delete();
                }
            });
        }
    }

    /**
     * Check if model uses soft deletes
     */
    protected function usesSoftDeletes(): bool
    {
        return in_array(SoftDeletes::class, class_uses_recursive(get_class($this)));
    }
}
