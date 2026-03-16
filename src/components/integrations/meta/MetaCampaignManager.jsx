import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMetaCampaigns,
  addMetaCampaign,
  updateMetaCampaign,
  setMetaLeads,
  setLoading,
  setError,
  setSuccess,
  clearError,
  clearSuccess,
} from '@/redux/slices/metaIntegrationSlice';
import {
  createMetaCampaignApi,
  getMetaCampaignLeadsApi,
  updateMetaCampaignApi,
} from '@/api/apiRoutes';
import { BiPlus, BiEdit3, BiChevronDown, BiCheckCircle, BiXCircle } from 'react-icons/bi';

export default function MetaCampaignManager({ agentId }) {
  const dispatch = useDispatch();
  const {
    meta: { campaigns, leads, selectedCredential },
    loading,
    error,
    success,
  } = useSelector((state) => state.metaIntegration);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    target_audience: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedCampaignId, setExpandedCampaignId] = useState(null);
  const [campaignLeads, setCampaignLeads] = useState({});

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.start_date || !formData.end_date) {
      dispatch(setError('Por favor completa los campos requeridos'));
      return;
    }

    // Validate dates
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      dispatch(setError('La fecha de inicio debe ser anterior a la fecha de fin'));
      return;
    }

    if (!selectedCredential) {
      dispatch(setError('Por favor selecciona una credencial de Meta'));
      return;
    }

    try {
      dispatch(setLoading(true));
      
      const campaignData = {
        ...formData,
        credential_id: selectedCredential,
      };

      const response = await createMetaCampaignApi(campaignData);

      if (response.data) {
        dispatch(addMetaCampaign(response.data));
        dispatch(setSuccess(true));
        setFormData({
          name: '',
          description: '',
          start_date: '',
          end_date: '',
          target_audience: '',
        });
        setShowForm(false);
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message || 'Error al crear campaña'));
    }
  };

  const handleLoadCampaignLeads = async (campaignId) => {
    try {
      dispatch(setLoading(true));
      const response = await getMetaCampaignLeadsApi(campaignId);

      if (response.data) {
        setCampaignLeads((prev) => ({
          ...prev,
          [campaignId]: response.data,
        }));
        setExpandedCampaignId(expandedCampaignId === campaignId ? null : campaignId);
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Error al cargar leads'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCampaignStatus = (campaign) => {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);

    if (now < start) return { status: 'Próxima', color: 'yellow' };
    if (now <= end) return { status: 'Activa', color: 'green' };
    return { status: 'Finalizada', color: 'gray' };
  };

  const getLeadsCount = (campaign) => {
    return campaign.leads?.length || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campañas de Meta</h2>
          <p className="text-sm text-gray-600 mt-1">Crea y gestiona campañas de publicidad en Meta</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            showForm
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <BiPlus />
          {showForm ? 'Cancelar' : 'Nueva Campaña'}
        </button>
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

      {/* Warning - No Credential Selected */}
      {!selectedCredential && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            ⚠️ Debes seleccionar una credencial de Meta antes de crear campañas
          </p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la Campaña *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Mi Campaña de Verano"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe los objetivos de la campaña..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Fin *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Audiencia Objetivo
              </label>
              <textarea
                name="target_audience"
                value={formData.target_audience}
                onChange={handleInputChange}
                placeholder="Define tu audiencia: edad, ubicación, intereses, etc."
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedCredential}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Creando...' : 'Crear Campaña'}
          </button>
        </form>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No hay campañas creadas aún</p>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const status = getCampaignStatus(campaign);
            const leadsCount = getLeadsCount(campaign);
            const isExpanded = expandedCampaignId === campaign.id;
            const leadsData = campaignLeads[campaign.id] || [];

            return (
              <div
                key={campaign.id}
                className="bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition overflow-hidden"
              >
                {/* Campaign Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            status.color === 'green'
                              ? 'bg-green-100 text-green-800'
                              : status.color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {status.status}
                        </span>
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-gray-600 mt-2">{campaign.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded p-3">
                      <p className="text-xs text-gray-600 font-semibold uppercase">Período</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                      </p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="text-xs text-gray-600 font-semibold uppercase">Leads</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{leadsCount}</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="text-xs text-gray-600 font-semibold uppercase">Creada</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatDate(campaign.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Target Audience */}
                  {campaign.target_audience && (
                    <div className="bg-blue-50 rounded p-4 mb-4">
                      <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Audiencia Objetivo</p>
                      <p className="text-sm text-blue-900">{campaign.target_audience}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadCampaignLeads(campaign.id)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition text-sm"
                    >
                      <BiChevronDown
                        className={`text-lg transform transition ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                      {isExpanded ? 'Ocultar' : 'Ver'} Leads ({leadsCount})
                    </button>
                  </div>
                </div>

                {/* Expanded Leads Section */}
                {isExpanded && (
                  <div className="bg-white border-t border-gray-200 p-6 space-y-4">
                    <h4 className="font-semibold text-gray-900">Leads de la Campaña</h4>

                    {leadsData.length === 0 ? (
                      <p className="text-gray-600 text-sm">No hay leads asociados a esta campaña</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {leadsData.map((lead, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded p-4 border border-gray-200"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Nombre</p>
                                <p className="text-gray-900 font-semibold mt-1">{lead.name || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Email</p>
                                <p className="text-gray-900 font-mono mt-1">{lead.email || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Teléfono</p>
                                <p className="text-gray-900 font-mono mt-1">{lead.phone || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Estado</p>
                                <p className="text-gray-900 font-semibold mt-1">{lead.status || 'Nuevo'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📝 Tips de Campañas</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Define claramente tu audiencia objetivo para mejores resultados</li>
          <li>Las fechas deben ser coherentes: inicio menor que fin</li>
          <li>Puedes ver todos los leads generados por cada campaña</li>
          <li>Las campañas activas se sincronizar automáticamente</li>
        </ul>
      </div>
    </div>
  );
}
