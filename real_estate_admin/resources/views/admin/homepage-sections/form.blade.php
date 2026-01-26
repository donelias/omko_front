@extends('layouts.main')

@section('title')
    {{ isset($section) ? __('Edit Section') : __('Create Section') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">
                {{ isset($section) ? __('Edit Section') : __('Create Section') }}
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
            <form action="{{ isset($section) ? route('homepage-sections.update', $section->id) : route('homepage-sections.store') }}" method="POST">
                @csrf
                @if (isset($section))
                    @method('PUT')
                @endif

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="title" class="form-label">{{ __('Title') }} <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('title') is-invalid @enderror" id="title" name="title" value="{{ $section->title ?? old('title') }}" required>
                            @error('title')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="type" class="form-label">{{ __('Type') }} <span class="text-danger">*</span></label>
                            <select class="form-select @error('type') is-invalid @enderror" id="type" name="type" required>
                                <option value="">{{ __('Select Type') }}</option>
                                <option value="banner" {{ ($section->type ?? old('type')) == 'banner' ? 'selected' : '' }}>{{ __('Banner') }}</option>
                                <option value="featured" {{ ($section->type ?? old('type')) == 'featured' ? 'selected' : '' }}>{{ __('Featured') }}</option>
                                <option value="testimonials" {{ ($section->type ?? old('type')) == 'testimonials' ? 'selected' : '' }}>{{ __('Testimonials') }}</option>
                                <option value="cta" {{ ($section->type ?? old('type')) == 'cta' ? 'selected' : '' }}>{{ __('Call to Action') }}</option>
                            </select>
                            @error('type')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="content" class="form-label">{{ __('Content') }} <span class="text-danger">*</span></label>
                    <textarea class="form-control @error('content') is-invalid @enderror" id="content" name="content" rows="5" required>{{ $section->content ?? old('content') }}</textarea>
                    @error('content')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="order" class="form-label">{{ __('Order') }}</label>
                            <input type="number" class="form-control @error('order') is-invalid @enderror" id="order" name="order" value="{{ $section->order ?? old('order', 0) }}" min="0">
                            @error('order')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="background_color" class="form-label">{{ __('Background Color') }}</label>
                            <input type="color" class="form-control form-control-color @error('background_color') is-invalid @enderror" id="background_color" name="background_color" value="{{ $section->background_color ?? old('background_color', '#ffffff') }}">
                            @error('background_color')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="is_active" name="is_active" value="1" {{ ($section->is_active ?? old('is_active')) ? 'checked' : '' }}>
                        <label class="form-check-label" for="is_active">
                            {{ __('Active') }}
                        </label>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary">{{ __('Save') }}</button>
                    <a href="{{ route('homepage-sections.index') }}" class="btn btn-secondary">{{ __('Cancel') }}</a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
