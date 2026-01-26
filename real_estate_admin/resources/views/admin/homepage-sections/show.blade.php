@extends('layouts.main')

@section('title')
    {{ __('View Section') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">{{ $section->title }}</h1>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('homepage-sections.edit', $section->id) }}" class="btn btn-primary">
                <i class="fas fa-edit"></i> {{ __('Edit') }}
            </a>
            <a href="{{ route('homepage-sections.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> {{ __('Back') }}
            </a>
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Title') }}</strong></label>
                        <p>{{ $section->title }}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Type') }}</strong></label>
                        <p><span class="badge bg-info">{{ ucfirst($section->type) }}</span></p>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Order') }}</strong></label>
                        <p>{{ $section->order }}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Status') }}</strong></label>
                        <p>
                            <span class="badge {{ $section->is_active ? 'bg-success' : 'bg-danger' }}">
                                {{ $section->is_active ? __('Active') : __('Inactive') }}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label"><strong>{{ __('Content') }}</strong></label>
                <div class="p-3 border rounded">
                    {!! $section->content !!}
                </div>
            </div>

            @if ($section->background_color)
                <div class="mb-3">
                    <label class="form-label"><strong>{{ __('Background Color') }}</strong></label>
                    <div>
                        <div style="width: 100px; height: 100px; background-color: {{ $section->background_color }}; border: 1px solid #ddd; border-radius: 5px;"></div>
                        <p class="mt-2">{{ $section->background_color }}</p>
                    </div>
                </div>
            @endif

            <div class="d-flex gap-2 mt-4">
                <form method="POST" action="{{ route('homepage-sections.destroy', $section->id) }}" style="display: inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn btn-danger" onclick="return confirm('{{ __('Are you sure?') }}')">
                        <i class="fas fa-trash"></i> {{ __('Delete') }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
