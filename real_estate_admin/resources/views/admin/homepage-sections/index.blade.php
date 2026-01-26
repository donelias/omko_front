@extends('layouts.main')

@section('title')
    {{ __('Homepage Sections') }}
@endsection

@section('content')
<div class="section">
    <div class="row mb-3">
        <div class="col-md-8">
            <h1 class="dashboard_title">{{ __('Homepage Sections') }}</h1>
        </div>
        <div class="col-md-4 text-end">
            <a href="{{ route('homepage-sections.create') }}" class="btn btn-primary">
                <i class="fas fa-plus"></i> {{ __('Add Section') }}
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
            <table class="table table-hover mb-0 sortable-table">
                <thead>
                    <tr>
                        <th>{{ __('Order') }}</th>
                        <th>{{ __('Title') }}</th>
                        <th>{{ __('Type') }}</th>
                        <th>{{ __('Active') }}</th>
                        <th>{{ __('Actions') }}</th>
                    </tr>
                </thead>
                <tbody class="sortable">
                    @forelse ($sections as $section)
                        <tr data-id="{{ $section->id }}">
                            <td>
                                <span class="drag-handle" title="{{ __('Drag to reorder') }}">
                                    <i class="fas fa-grip-vertical"></i>
                                </span>
                                <span class="order-number">{{ $section->order }}</span>
                            </td>
                            <td>{{ $section->title }}</td>
                            <td>{{ ucfirst($section->type) }}</td>
                            <td>
                                <span class="badge {{ $section->is_active ? 'bg-success' : 'bg-danger' }}">
                                    {{ $section->is_active ? __('Active') : __('Inactive') }}
                                </span>
                            </td>
                            <td>
                                <a href="{{ route('homepage-sections.show', $section->id) }}" class="btn btn-sm btn-info" title="{{ __('View') }}">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="{{ route('homepage-sections.edit', $section->id) }}" class="btn btn-sm btn-warning" title="{{ __('Edit') }}">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form method="POST" action="{{ route('homepage-sections.destroy', $section->id) }}" style="display: inline;">
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
                            <td colspan="5" class="text-center text-muted">{{ __('No sections found') }}</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    @if ($sections instanceof \Illuminate\Pagination\Paginator || method_exists($sections, 'links'))
        <div class="d-flex justify-content-center mt-3">
            {{ $sections->links() }}
        </div>
    @endif
</div>

<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const sortable = document.querySelector('.sortable');
    if (sortable) {
        Sortable.create(sortable, {
            animation: 150,
            ghostClass: 'bg-light',
            dragClass: 'dragging',
            onEnd: function(evt) {
                const items = Array.from(document.querySelectorAll('tbody tr[data-id]'));
                const order = items.map((item, index) => ({
                    id: item.dataset.id,
                    order: index + 1
                }));
                
                fetch('{{ route("homepage-sections.reorder") }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ sections: order })
                }).catch(error => console.error('Error:', error));
            }
        });
    }
});
</script>

<style>
.drag-handle {
    cursor: move;
    color: #6c757d;
    margin-right: 0.5rem;
}
.dragging {
    opacity: 0.5;
}
</style>
@endsection
