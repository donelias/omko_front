@extends('layouts.main')

@section('title')
    {{ __('Package Features') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">{{ __('Package Features') }}</h1>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('package-features.create') }}" class="btn btn-primary">
                <i class="fas fa-plus"></i> {{ __('Add Feature') }}
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
        <div class="card-body mb-3">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#bulkActions">
                <i class="fas fa-cog"></i> {{ __('Bulk Actions') }}
            </button>
        </div>
        <div id="bulkActions" class="collapse">
            <div class="card-body border-top">
                <form id="bulkForm" method="POST" action="{{ route('package-features.bulk-action') }}">
                    @csrf
                    <div class="row">
                        <div class="col-md-4">
                            <select class="form-select form-select-sm" name="action" required>
                                <option value="">{{ __('Select Action') }}</option>
                                <option value="delete">{{ __('Delete') }}</option>
                                <option value="activate">{{ __('Activate') }}</option>
                                <option value="deactivate">{{ __('Deactivate') }}</option>
                            </select>
                        </div>
                        <div class="col-md-8">
                            <button type="submit" class="btn btn-sm btn-primary" onclick="return confirm('{{ __('Are you sure?') }}')">
                                {{ __('Apply') }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th><input type="checkbox" id="selectAll" class="form-check-input"></th>
                        <th>{{ __('Name') }}</th>
                        <th>{{ __('Package') }}</th>
                        <th>{{ __('Included') }}</th>
                        <th>{{ __('Actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($features as $feature)
                        <tr>
                            <td>
                                <input type="checkbox" class="form-check-input feature-checkbox" name="ids[]" value="{{ $feature->id }}" form="bulkForm">
                            </td>
                            <td>{{ $feature->name }}</td>
                            <td>{{ $feature->package ? $feature->package->name : '-' }}</td>
                            <td>
                                <span class="badge {{ $feature->is_included ? 'bg-success' : 'bg-secondary' }}">
                                    {{ $feature->is_included ? __('Yes') : __('No') }}
                                </span>
                            </td>
                            <td>
                                <a href="{{ route('package-features.edit', $feature->id) }}" class="btn btn-sm btn-warning" title="{{ __('Edit') }}">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form method="POST" action="{{ route('package-features.destroy', $feature->id) }}" style="display: inline;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('{{ __('Are you sure?') }}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center text-muted">{{ __('No features found') }}</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    @if ($features instanceof \Illuminate\Pagination\Paginator || method_exists($features, 'links'))
        <div class="d-flex justify-content-center mt-3">
            {{ $features->links() }}
        </div>
    @endif
</div>

<script>
document.getElementById('selectAll').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.feature-checkbox');
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
});
</script>
@endsection
