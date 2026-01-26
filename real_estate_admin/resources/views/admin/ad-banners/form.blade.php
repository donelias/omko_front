@extends('layouts.main')

@section('title')
    {{ isset($banner) ? __('Edit Banner') : __('Create Banner') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">
                {{ isset($banner) ? __('Edit Banner') : __('Create Banner') }}
            </h1>
        </div>
    </div>

    @if ($errors->any())
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>{{ __('Error!') }}</strong>
            <ul class="mb-0">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="card">
        <div class="card-body">
            <form action="{{ isset($banner) ? route('ad-banners.update', $banner->id) : route('ad-banners.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                @if (isset($banner))
                    @method('PUT')
                @endif

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="title" class="form-label">{{ __('Title') }} <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('title') is-invalid @enderror" id="title" name="title" value="{{ $banner->title ?? old('title') }}" required>
                            @error('title')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="platform" class="form-label">{{ __('Platform') }} <span class="text-danger">*</span></label>
                            <select class="form-select @error('platform') is-invalid @enderror" id="platform" name="platform" required>
                                <option value="">{{ __('Select Platform') }}</option>
                                <option value="web" {{ ($banner->platform ?? old('platform')) == 'web' ? 'selected' : '' }}>{{ __('Web') }}</option>
                                <option value="mobile" {{ ($banner->platform ?? old('platform')) == 'mobile' ? 'selected' : '' }}>{{ __('Mobile') }}</option>
                                <option value="email" {{ ($banner->platform ?? old('platform')) == 'email' ? 'selected' : '' }}>{{ __('Email') }}</option>
                            </select>
                            @error('platform')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="description" class="form-label">{{ __('Description') }}</label>
                    <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description" rows="3">{{ $banner->description ?? old('description') }}</textarea>
                    @error('description')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="image_path" class="form-label">{{ __('Image') }}</label>
                            <input type="file" class="form-control @error('image_path') is-invalid @enderror" id="image_path" name="image_path" accept="image/*">
                            @if (isset($banner) && $banner->image_path)
                                <small class="text-muted">{{ __('Current image') }}: {{ basename($banner->image_path) }}</small>
                            @endif
                            @error('image_path')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="priority" class="form-label">{{ __('Priority') }}</label>
                            <input type="number" class="form-control @error('priority') is-invalid @enderror" id="priority" name="priority" value="{{ $banner->priority ?? old('priority', 0) }}" min="0">
                            @error('priority')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="link_url" class="form-label">{{ __('Link URL') }}</label>
                    <input type="url" class="form-control @error('link_url') is-invalid @enderror" id="link_url" name="link_url" value="{{ $banner->link_url ?? old('link_url') }}">
                    @error('link_url')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="is_active" name="is_active" value="1" {{ ($banner->is_active ?? old('is_active')) ? 'checked' : '' }}>
                        <label class="form-check-label" for="is_active">
                            {{ __('Active') }}
                        </label>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary">{{ __('Save') }}</button>
                    <a href="{{ route('ad-banners.index') }}" class="btn btn-secondary">{{ __('Cancel') }}</a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
