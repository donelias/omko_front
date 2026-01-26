@extends('layouts.main')

@section('title')
    {{ __('Feature Details') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">{{ $feature->name }}</h1>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('package-features.edit', $feature->id) }}" class="btn btn-primary">
                <i class="fas fa-edit"></i> {{ __('Edit') }}
            </a>
            <a href="{{ route('package-features.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> {{ __('Back') }}
            </a>
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Feature Name') }}</strong></label>
                        <p>{{ $feature->name }}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Package') }}</strong></label>
                        <p>{{ $feature->package ? $feature->package->name : '-' }}</p>
                    </div>
                </div>
            </div>

            @if ($feature->description)
                <div class="mb-3">
                    <label class="form-label"><strong>{{ __('Description') }}</strong></label>
                    <p>{{ $feature->description }}</p>
                </div>
            @endif

            <div class="mb-3">
                <label class="form-label"><strong>{{ __('Included') }}</strong></label>
                <p>
                    <span class="badge {{ $feature->is_included ? 'bg-success' : 'bg-secondary' }}">
                        {{ $feature->is_included ? __('Yes') : __('No') }}
                    </span>
                </p>
            </div>

            <div class="d-flex gap-2 mt-4">
                <form method="POST" action="{{ route('package-features.destroy', $feature->id) }}" style="display: inline;">
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
