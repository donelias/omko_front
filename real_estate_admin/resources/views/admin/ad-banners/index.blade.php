@extends('layouts.main')

@section('title')
    {{ __('Ad Banners') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">{{ __('Ad Banners') }}</h1>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('ad-banners.create') }}" class="btn btn-primary">
                <i class="fas fa-plus"></i> {{ __('Add Banner') }}
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
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>{{ __('Title') }}</th>
                        <th>{{ __('Platform') }}</th>
                        <th>{{ __('Active') }}</th>
                        <th>{{ __('Priority') }}</th>
                        <th>{{ __('Actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($banners as $banner)
                        <tr>
                            <td>{{ $banner->title }}</td>
                            <td>{{ ucfirst($banner->platform) }}</td>
                            <td>
                                <span class="badge {{ $banner->is_active ? 'bg-success' : 'bg-danger' }}">
                                    {{ $banner->is_active ? __('Active') : __('Inactive') }}
                                </span>
                            </td>
                            <td>{{ $banner->priority }}</td>
                            <td>
                                <a href="{{ route('ad-banners.show', $banner->id) }}" class="btn btn-sm btn-info" title="{{ __('View') }}">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="{{ route('ad-banners.edit', $banner->id) }}" class="btn btn-sm btn-warning" title="{{ __('Edit') }}">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form method="POST" action="{{ route('ad-banners.destroy', $banner->id) }}" style="display: inline;">
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
                            <td colspan="5" class="text-center text-muted">{{ __('No banners found') }}</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    @if ($banners instanceof \Illuminate\Pagination\Paginator || method_exists($banners, 'links'))
        <div class="d-flex justify-content-center mt-3">
            {{ $banners->links() }}
        </div>
    @endif
</div>
@endsection
