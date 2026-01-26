@extends('layouts.main')

@section('title')
    {{ isset($feature) ? __('Edit Feature') : __('Create Feature') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">
                {{ isset($feature) ? __('Edit Feature') : __('Create Feature') }}
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
            <form action="{{ isset($feature) ? route('package-features.update', $feature->id) : route('package-features.store') }}" method="POST">
                @csrf
                @if (isset($feature))
                    @method('PUT')
                @endif

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="name" class="form-label">{{ __('Feature Name') }} <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ $feature->name ?? old('name') }}" required>
                            @error('name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="package_id" class="form-label">{{ __('Package') }} <span class="text-danger">*</span></label>
                            <select class="form-select @error('package_id') is-invalid @enderror" id="package_id" name="package_id" required>
                                <option value="">{{ __('Select Package') }}</option>
                                @foreach ($packages as $package)
                                    <option value="{{ $package->id }}" {{ ($feature->package_id ?? old('package_id')) == $package->id ? 'selected' : '' }}>
                                        {{ $package->name }}
                                    </option>
                                @endforeach
                            </select>
                            @error('package_id')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="description" class="form-label">{{ __('Description') }}</label>
                    <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description" rows="3">{{ $feature->description ?? old('description') }}</textarea>
                    @error('description')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="is_included" name="is_included" value="1" {{ ($feature->is_included ?? old('is_included')) ? 'checked' : '' }}>
                        <label class="form-check-label" for="is_included">
                            {{ __('Include in Package') }}
                        </label>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary">{{ __('Save') }}</button>
                    <a href="{{ route('package-features.index') }}" class="btn btn-secondary">{{ __('Cancel') }}</a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
