@extends('layouts.main')

@section('title')
    {{ __('Appointment Details') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">{{ __('Appointment') }} #{{ $appointment->id }}</h1>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('appointments.edit', $appointment->id) }}" class="btn btn-primary">
                <i class="fas fa-edit"></i> {{ __('Edit') }}
            </a>
            <a href="{{ route('appointments.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> {{ __('Back') }}
            </a>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5>{{ __('Appointment Information') }}</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Status') }}</strong></label>
                        <p>
                            <span class="badge badge-{{ 
                                $appointment->status == 'confirmed' ? 'success' : 
                                ($appointment->status == 'pending' ? 'warning' : 
                                ($appointment->status == 'completed' ? 'info' : 'danger')) 
                            }}">
                                {{ ucfirst($appointment->status) }}
                            </span>
                        </p>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Date') }}</strong></label>
                        <p>{{ $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : '-' }}</p>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Time') }}</strong></label>
                        <p>{{ $appointment->appointment_time ?? '-' }}</p>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><strong>{{ __('Duration') }}</strong></label>
                        <p>{{ $appointment->duration ?? '-' }} {{ __('minutes') }}</p>
                    </div>
                    @if ($appointment->notes)
                        <div class="mb-3">
                            <label class="form-label"><strong>{{ __('Notes') }}</strong></label>
                            <p>{{ $appointment->notes }}</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5>{{ __('User & Property') }}</h5>
                </div>
                <div class="card-body">
                    @if ($appointment->user)
                        <div class="mb-3">
                            <label class="form-label"><strong>{{ __('User') }}</strong></label>
                            <p>
                                <a href="{{ route('users.show', $appointment->user->id) }}">
                                    {{ $appointment->user->first_name }} {{ $appointment->user->last_name }}
                                </a>
                            </p>
                        </div>
                        <div class="mb-3">
                            <label class="form-label"><strong>{{ __('Email') }}</strong></label>
                            <p>{{ $appointment->user->email }}</p>
                        </div>
                        <div class="mb-3">
                            <label class="form-label"><strong>{{ __('Phone') }}</strong></label>
                            <p>{{ $appointment->user->phone ?? '-' }}</p>
                        </div>
                    @endif
                    @if ($appointment->property)
                        <div class="mb-3">
                            <label class="form-label"><strong>{{ __('Property') }}</strong></label>
                            <p>
                                <a href="{{ route('property.show', $appointment->property->id) }}">
                                    {{ $appointment->property->name }}
                                </a>
                            </p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <div class="card mt-3">
        <div class="card-header">
            <h5>{{ __('Actions') }}</h5>
        </div>
        <div class="card-body">
            <form method="POST" action="{{ route('appointments.update', $appointment->id) }}" class="d-inline">
                @csrf
                @method('PUT')
                <select class="form-select form-select-sm d-inline-block" style="width: auto;" name="status" id="statusSelect">
                    <option value="pending" {{ $appointment->status == 'pending' ? 'selected' : '' }}>{{ __('Pending') }}</option>
                    <option value="confirmed" {{ $appointment->status == 'confirmed' ? 'selected' : '' }}>{{ __('Confirmed') }}</option>
                    <option value="completed" {{ $appointment->status == 'completed' ? 'selected' : '' }}>{{ __('Completed') }}</option>
                    <option value="cancelled" {{ $appointment->status == 'cancelled' ? 'selected' : '' }}>{{ __('Cancelled') }}</option>
                </select>
                <button type="submit" class="btn btn-sm btn-primary">{{ __('Update Status') }}</button>
            </form>
        </div>
    </div>
</div>
@endsection
