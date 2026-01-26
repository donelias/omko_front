@extends('layouts.main')

@section('title')
    {{ __('View Banner') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">{{ $adBanner->title }}</h1>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('ad-banners.edit', $adBanner->id) }}" class="btn btn-primary">
                <i class="fas fa-edit"></i> {{ __('Edit') }}
            </a>
            <a href="{{ route('ad-banners.index') }}" class="btn btn-secondary">
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
                        <p>{{ $adBanner->title }}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Platform') }}</strong></label>
                        <p><span class="badge bg-info">{{ ucfirst($adBanner->platform) }}</span></p>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Priority') }}</strong></label>
                        <p>{{ $adBanner->priority }}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Status') }}</strong></label>
                        <p>
                            <span class="badge {{ $adBanner->is_active ? 'bg-success' : 'bg-danger' }}">
                                {{ $adBanner->is_active ? __('Active') : __('Inactive') }}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            @if ($adBanner->description)
                <div class="mb-3">
                    <label class="form-label"><strong>{{ __('Description') }}</strong></label>
                    <p>{{ $adBanner->description }}</p>
                </div>
            @endif

            @if ($adBanner->image_path)
                <div class="mb-3">
                    <label class="form-label"><strong>{{ __('Image') }}</strong></label>
                    <div>
                        <img src="{{ asset('storage/' . $adBanner->image_path) }}" alt="{{ $adBanner->title }}" class="img-thumbnail" style="max-width: 300px;">
                    </div>
                </div>
            @endif

            @if ($adBanner->link_url)
                <div class="mb-3">
                    <label class="form-label"><strong>{{ __('Link URL') }}</strong></label>
                    <p><a href="{{ $adBanner->link_url }}" target="_blank">{{ $adBanner->link_url }}</a></p>
                </div>
            @endif

            <div class="d-flex gap-2 mt-4">
                <form method="POST" action="{{ route('ad-banners.destroy', $adBanner->id) }}" style="display: inline;">
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
