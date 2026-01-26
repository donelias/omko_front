@extends('layouts.main')

@section('title')
    {{ __('Admin Appointments') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-6">
            <h1 class="dashboard_title">{{ __('Admin Appointments') }}</h1>
        </div>
        <div class="col-md-6 text-end">
            <a href="{{ route('appointments.export-csv') }}" class="btn btn-success">
                <i class="fas fa-download"></i> {{ __('Export CSV') }}
            </a>
        </div>
    </div>

    @if ($message = Session::get('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ $message }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="card">
        <div class="card-header">
            <form method="GET" class="row g-2">
                <div class="col-md-3">
                    <input type="date" class="form-control form-control-sm" name="date_from" value="{{ request('date_from') }}" placeholder="{{ __('From Date') }}">
                </div>
                <div class="col-md-3">
                    <input type="date" class="form-control form-control-sm" name="date_to" value="{{ request('date_to') }}" placeholder="{{ __('To Date') }}">
                </div>
                <div class="col-md-3">
                    <select class="form-select form-select-sm" name="status">
                        <option value="">{{ __('All Status') }}</option>
                        <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>{{ __('Pending') }}</option>
                        <option value="confirmed" {{ request('status') == 'confirmed' ? 'selected' : '' }}>{{ __('Confirmed') }}</option>
                        <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>{{ __('Completed') }}</option>
                        <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>{{ __('Cancelled') }}</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <button type="submit" class="btn btn-sm btn-primary w-100">{{ __('Filter') }}</button>
                </div>
            </form>
        </div>

        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>{{ __('ID') }}</th>
                        <th>{{ __('User') }}</th>
                        <th>{{ __('Property') }}</th>
                        <th>{{ __('Date') }}</th>
                        <th>{{ __('Time') }}</th>
                        <th>{{ __('Status') }}</th>
                        <th>{{ __('Actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($appointments as $appointment)
                        <tr>
                            <td>#{{ $appointment->id }}</td>
                            <td>{{ $appointment->user ? $appointment->user->first_name . ' ' . $appointment->user->last_name : '-' }}</td>
                            <td>{{ $appointment->property ? $appointment->property->name : '-' }}</td>
                            <td>{{ $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : '-' }}</td>
                            <td>{{ $appointment->appointment_time ?? '-' }}</td>
                            <td>
                                <span class="badge badge-{{ 
                                    $appointment->status == 'confirmed' ? 'success' : 
                                    ($appointment->status == 'pending' ? 'warning' : 
                                    ($appointment->status == 'completed' ? 'info' : 'danger')) 
                                }}">
                                    {{ ucfirst($appointment->status) }}
                                </span>
                            </td>
                            <td>
                                <a href="{{ route('appointments.show', $appointment->id) }}" class="btn btn-sm btn-info" title="{{ __('View') }}">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="{{ route('appointments.edit', $appointment->id) }}" class="btn btn-sm btn-warning" title="{{ __('Edit') }}">
                                    <i class="fas fa-edit"></i>
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-muted">{{ __('No appointments found') }}</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    @if ($appointments instanceof \Illuminate\Pagination\Paginator || method_exists($appointments, 'links'))
        <div class="d-flex justify-content-center mt-3">
            {{ $appointments->links() }}
        </div>
    @endif
</div>
@endsection
