import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMetaLogs,
  setLoading,
  setError,
} from '@/redux/slices/metaIntegrationSlice';
import {
  getMetaSyncLogsApi,
} from '@/api/apiRoutes';
import {
  BiCheckCircle,
  BiXCircle,
  BiSearchAlt,
  BiDownload,
  BiFilter,
} from 'react-icons/bi';

export default function IntegrationLogsViewer({ agentId }) {
  const dispatch = useDispatch();
  const { meta: { logs }, loading, error } = useSelector((state) => state.metaIntegration);

  const [displayLogs, setDisplayLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, completado, fallido

  // Fetch logs
  const fetchLogs = async (page = 1) => {
    try {
      dispatch(setLoading(true));
      const response = await getMetaSyncLogsApi({ page, per_page: 20 });

      if (response.data) {
        setDisplayLogs(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(page);
        dispatch(setMetaLogs(response.data.data || []));
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Error al cargar logs'));
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = () => {
    fetchLogs(currentPage);
  };

  const handleExportLogs = () => {
    const csv = convertLogsToCSV(displayLogs);
    downloadCSV(csv, 'integration-logs.csv');
  };

  const convertLogsToCSV = (logsData) => {
    const headers = ['ID', 'Estado', 'Tipo', 'Leads Sincronizados', 'Leads Procesados', 'Duplicados', 'Duración (s)', 'Fecha Inicio', 'Fecha Fin'];
    const rows = logsData.map((log) => [
      log.id,
      log.estado,
      log.tipo_sincronizacion,
      log.leads_sincronizados,
      log.leads_procesados,
      log.duplicados,
      log.duracion_segundos,
      log.fecha_inicio,
      log.fecha_fin,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
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

  const filteredLogs = displayLogs
    .filter((log) => {
      if (filterStatus === 'completado') return log.estado === 'completado';
      if (filterStatus === 'fallido') return log.estado === 'fallido';
      return true;
    })
    .filter((log) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        log.id.toString().includes(searchLower) ||
        log.tipo_sincronizacion?.toLowerCase().includes(searchLower) ||
        log.error_message?.toLowerCase().includes(searchLower)
      );
    });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const calculateStats = () => {
    return {
      total: displayLogs.length,
      successful: displayLogs.filter((l) => l.estado === 'completado').length,
      failed: displayLogs.filter((l) => l.estado === 'fallido').length,
      totalLeads: displayLogs.reduce((sum, l) => sum + (l.leads_sincronizados || 0), 0),
      totalDuplicates: displayLogs.reduce((sum, l) => sum + (l.duplicados || 0), 0),
    };
  };

  const stats = calculateStats();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registro de Auditoría</h2>
          <p className="text-sm text-gray-600 mt-1">Historial completo de sincronizaciones e integraciones</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
        >
          Actualizar
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold uppercase">Total</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 font-semibold uppercase">Exitosas</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.successful}</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-red-600 font-semibold uppercase">Fallidas</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.failed}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold uppercase">Leads</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.totalLeads}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-yellow-600 font-semibold uppercase">Duplicados</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.totalDuplicates}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <BiSearchAlt className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Buscar por ID, tipo o error..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'completado', label: 'Exitosas' },
              { key: 'fallido', label: 'Fallidas' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setFilterStatus(option.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  filterStatus === option.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <BiFilter />
                {option.label}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportLogs}
            disabled={displayLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
          >
            <BiDownload />
            Descargar CSV
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <BiXCircle className="text-red-600 text-2xl flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Tipo</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Leads</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Procesados</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Duplicados</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Duración</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-600">
                  No hay registros que mostrar
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 transition border-b border-gray-200"
                >
                  <td className="px-4 py-3 font-mono text-gray-900">#{log.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {log.estado === 'completado' ? (
                        <>
                          <BiCheckCircle className="text-green-600 text-lg" />
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                            Exitosa
                          </span>
                        </>
                      ) : (
                        <>
                          <BiXCircle className="text-red-600 text-lg" />
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                            Fallida
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{log.tipo_sincronizacion || 'Automática'}</td>
                  <td className="px-4 py-3 text-center font-semibold text-purple-600">
                    {log.leads_sincronizados}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{log.leads_procesados}</td>
                  <td className="px-4 py-3 text-center">
                    {log.duplicados > 0 ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                        {log.duplicados}
                      </span>
                    ) : (
                      <span className="text-gray-600">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {log.duracion_segundos}s
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <span className="text-xs">{formatDate(log.fecha_inicio)}</span>
                    {log.error_message && (
                      <div className="mt-1 text-xs text-red-600 truncate" title={log.error_message}>
                        {log.error_message}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 items-center">
          <button
            onClick={() => fetchLogs(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => fetchLogs(pageNum)}
                  disabled={loading}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => fetchLogs(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Información</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Este registro muestra todas las sincronizaciones de Meta y WhatsApp</li>
          <li>Cada fila representa una sesión de sincronización completa</li>
          <li>Los duplicados se detectan automáticamente y se registran</li>
          <li>Puedes descargar los registros en formato CSV para análisis</li>
          <li>Se mantienen los últimos 90 días de registros</li>
        </ul>
      </div>
    </div>
  );
}
