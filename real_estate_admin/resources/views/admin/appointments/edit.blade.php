@extends('layouts.main')

@section('title')
    {{ __('Edit Appointment') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">{{ __('Edit Appointment') }} #{{ $appointment->id }}</h1>
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
            <form action="{{ route('appointments.update', $appointment->id) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="status" class="form-label">{{ __('Status') }} <span class="text-danger">*</span></label>
                            <select class="form-select @error('status') is-invalid @enderror" id="status" name="status" required>
                                <option value="pending" {{ $appointment->status == 'pending' ? 'selected' : '' }}>{{ __('Pending') }}</option>
                                <option value="confirmed" {{ $appointment->status == 'confirmed' ? 'selected' : '' }}>{{ __('Confirmed') }}</option>
                                <option value="completed" {{ $appointment->status == 'completed' ? 'selected' : '' }}>{{ __('Completed') }}</option>
                                <option value="cancelled" {{ $appointment->status == 'cancelled' ? 'selected' : '' }}>{{ __('Cancelled') }}</option>
                            </select>
                            @error('status')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="appointment_date" class="form-label">{{ __('Date') }} <span class="text-danger">*</span></label>
                            <input type="date" class="form-control @error('appointment_date') is-invalid @enderror" id="appointment_date" name="appointment_date" value="{{ $appointment->appointment_date?->format('Y-m-d') }}" required>
                            @error('appointment_date')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="appointment_time" class="form-label">{{ __('Time') }} <span class="text-danger">*</span></label>
                            <input type="time" class="form-control @error('appointment_time') is-invalid @enderror" id="appointment_time" name="appointment_time" value="{{ $appointment->appointment_time }}" required>
                            @error('appointment_time')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="duration" class="form-label">{{ __('Duration') }} ({{ __('minutes') }})</label>
                            <input type="number" class="form-control @error('duration') is-invalid @enderror" id="duration" name="duration" value="{{ $appointment->duration ?? '30' }}" min="15" step="15">
                            @error('duration')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="notes" class="form-label">{{ __('Notes') }}</label>
                    <textarea class="form-control @error('notes') is-invalid @enderror" id="notes" name="notes" rows="4">{{ $appointment->notes }}</textarea>
                    @error('notes')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary">{{ __('Save') }}</button>
                    <a href="{{ route('appointments.show', $appointment->id) }}" class="btn btn-secondary">{{ __('Cancel') }}</a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
