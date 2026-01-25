<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    use HasFactory;
    protected $fillable = [
        'question',
        'answer',
        'contents',
        'status'
    ];

    protected $casts = [
        'contents' => 'json',
    ];

    public function getLocalizedQuestion($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        if (!$this->contents) {
            return $this->attributes['question'] ?? '';
        }
        $key = "question_" . $locale;
        return $this->contents[$key] ?? $this->contents['question_en'] ?? $this->attributes['question'] ?? '';
    }

    public function getLocalizedAnswer($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        if (!$this->contents) {
            return $this->attributes['answer'] ?? '';
        }
        $key = "answer_" . $locale;
        return $this->contents[$key] ?? $this->contents['answer_en'] ?? $this->attributes['answer'] ?? '';
    }

    public function getQuestionAttribute($value)
    {
        return $this->getLocalizedQuestion();
    }

    public function getAnswerAttribute($value)
    {
        return $this->getLocalizedAnswer();
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['question'] = $this->getLocalizedQuestion();
        $array['answer'] = $this->getLocalizedAnswer();
        return $array;
    }
}
