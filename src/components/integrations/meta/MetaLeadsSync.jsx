import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMetaLeads,
  addMetaLead,
  updateMetaLead,
  deleteMetaLead,
  setLoading,
  setError,
  setSuccess,
  clearError,
  clearSuccess,
} from '@/redux/slices/metaIntegrationSlice';
import {
  BiSearch,
  BiDownload,
  BiXCircle,
  BiCheckCircle,
  BiTrash2,
  BiEdit3,
  BiFilter,
} from 'react-icons/bi';

export default function MetaLeadsSync({ agentId }) {
  const dispatch = useDispatch();
  const {
    meta: { leads, campaigns },
    loading,
    error,
    success,
  } = useSelector((state) => state.metaIntegration);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Clear alerts
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error, dispatch]);

  // Filter leads
  const filteredLeads = leads
    .filter((lead) => {
      if (selectedCampaign !== 'all' && lead.campaign_id !== parseInt(selectedCampaign)) {
        return false;
      }
      if (selectedStatus !== 'all' && lead.status !== selectedStatus) {
        return false;
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          (lead.name && lead.name.toLowerCase().includes(search)) ||
          (lead.email && lead.email.toLowerCase().includes(search)) ||
          (lead.phone && lead.phone.toLowerCase().includes(search)) ||
          (lead.company && lead.company.toLowerCase().includes(search))
        );
      }
      return true;
    });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportLeads = () => {
    const csv = convertLeadsToCSV(filteredLeads);
    downloadCSV(csv, 'meta-leads.csv');
  };

  const convertLeadsToCSV = (leadsData) => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Empresa', 'Estado', 'Campaña', 'Fecha de Creación'];
    const rows = leadsData.map((lead) => [
      lead.name,
      lead.email,
      lead.phone,
      lead.company,
      lead.status,
      lead.campaign?.name || 'N/A',
      lead.created_at,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell || ''}"`).join(','))
      .join('\n');
    return csv;
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'nuevo':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Nuevo' };
      case 'contactado':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Contactado' };
      case 'calificado':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Calificado' };
      case 'no-interesado':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'No Interesado' };
      case 'duplicado':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Duplicado' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    }
  };

  const calculateStats = () => {
    return {
      total: leads.length,
      nuevo: leads.filter((l) => l.status === 'nuevo').length,
      contactado: leads.filter((l) => l.status === 'contactado').length,
      calificado: leads.filter((l) => l.status === 'calificado').length,
      duplicado: leads.filter((l) => l.status === 'duplicado').length,
    };
  };

  const stats = calculateStats();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads de Meta</h2>
          <p className="text-sm text-gray-600 mt-1">Gestiona y organiza todos tus leads generados desde campañas</p>
        </div>
        <button
          onClick={handleExportLeads}
          disabled={filteredLeads.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
        >
          <BiDownload />
          Descargar CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold uppercase">Total</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold uppercase">Nuevos</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.nuevo}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 font-semibold uppercase">Contactados</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.contactado}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold uppercase">Calificados</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.calificado}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-yellow-600 font-semibold uppercase">Duplicados</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.duplicado}</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <BiCheckCircle className="text-green-600 text-2xl" />
          <p className="text-green-800">Operación completada exitosamente</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <BiXCircle className="text-red-600 text-2xl" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <BiSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Campaign Filter */}
          <select
            value={selectedCampaign}
            onChange={(e) => {
              setSelectedCampaign(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las Campañas</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los Estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="calificado">Calificado</option>
            <option value="no-interesado">No Interesado</option>
            <option value="duplicado">Duplicado</option>
          </select>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600">
          Mostrando {paginatedLeads.length} de {filteredLeads.length} leads
        </p>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Teléfono</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Empresa</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Campaña</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Fecha</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-600">
                  No hay leads que mostrar
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const statusBadge = getStatusBadge(lead.status);
                return (
                  <tr key={lead.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">{lead.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs break-all">
                      {lead.email || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">{lead.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-700">{lead.company || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">
                      {lead.campaign?.name || 'Sin campaña'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          title="Editar"
                          className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                        >
                          <BiEdit3 className="text-lg" />
                        </button>
                        <button
                          title="Eliminar"
                          className="p-2 hover:bg-red-100 rounded transition text-red-600"
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de eliminar este lead?')) {
                              dispatch(deleteMetaLead(lead.id));
                            }
                          }}
                        >
                          <BiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 items-center">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 5) return true;
                if (page === 1 || page === totalPages) return true;
                return Math.abs(page - currentPage) <= 1;
              })
              .map((page, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== page - 1) {
                  return (
                    <span key={`dots-${page}`} className="text-gray-600">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded font-semibold transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Información</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Los leads se crean automáticamente desde tus campañas de Meta</li>
          <li>Puedes filtrar por campaña, estado, o buscar por datos específicos</li>
          <li>Los leads duplicados se detectan automáticamente en la sincronización</li>
          <li>Descarga todos los leads en formato CSV para análisis externo</li>
          <li>El estado se actualiza a medida que interactúas con cada lead</li>
        </ul>
      </div>
    </div>
  );
}
