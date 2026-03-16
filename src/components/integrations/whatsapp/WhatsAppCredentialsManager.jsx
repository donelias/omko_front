import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setWhatsAppCredentials,
  addWhatsAppCredential,
  deleteWhatsAppCredential,
  setLoading,
  setError,
  setSuccess,
  clearError,
  clearSuccess,
} from '@/redux/slices/metaIntegrationSlice';
import {
  getWhatsAppCredentialsApi,
  createWhatsAppCredentialApi,
  deleteWhatsAppCredentialApi,
  renewWhatsAppTokenApi,
} from '@/api/apiRoutes';
import { BiTrash, BiRefresh, BiCheckCircle, BiXCircle, BiCopy } from 'react-icons/bi';

export default function WhatsAppCredentialsManager({ agentId }) {
  const dispatch = useDispatch();
  const { credentials, loading, error, success } = useSelector((state) => state.metaIntegration);
  const whatsappCredentials = credentials.whatsapp || [];

  // Form state
  const [formData, setFormData] = useState({
    phone_number_id: '',
    business_account_id: '',
    access_token: '',
    phone_number: '',
    nombre_cuenta: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  // Fetch credentials on mount
  useEffect(() => {
    fetchCredentials();
  }, []);

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

  const fetchCredentials = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getWhatsAppCredentialsApi();
      const credentials = response.data || [];
      dispatch(setWhatsAppCredentials(credentials));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to fetch credentials'));
    }
  };

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
    if (!formData.phone_number_id || !formData.business_account_id || !formData.access_token) {
      dispatch(setError('Por favor completa los campos requeridos'));
      return;
    }

    try {
      dispatch(setLoading(true));
      const response = await createWhatsAppCredentialApi(formData);

      if (response.data) {
        dispatch(addWhatsAppCredential(response.data));
        dispatch(setSuccess(true));
        setFormData({
          phone_number_id: '',
          business_account_id: '',
          access_token: '',
          phone_number: '',
          nombre_cuenta: '',
        });
        setShowForm(false);
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message || 'Error al crear credencial'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar esta credencial?')) {
      return;
    }

    try {
      dispatch(setLoading(true));
      await deleteWhatsAppCredentialApi(id);
      dispatch(deleteWhatsAppCredential(id));
      dispatch(setSuccess(true));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Error al eliminar credencial'));
    }
  };

  const handleRenewToken = async (id) => {
    try {
      dispatch(setLoading(true));
      const response = await renewWhatsAppTokenApi(id);

      if (response.data) {
        dispatch(setSuccess(true));
        fetchCredentials(); // Refresh list
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Error al renovar token'));
    }
  };

  const copyToClipboard = (text, tokenId) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenId);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const isTokenExpiring = (expiryDate) => {
    if (!expiryDate) return false;
    const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 7 && days > 0;
  };

  const isTokenExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Credenciales WhatsApp</h2>
          <p className="text-sm text-gray-600 mt-1">Gestiona tus conexiones con WhatsApp Business API</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            showForm
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {showForm ? 'Cancelar' : '+ Agregar Credencial'}
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

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number ID *
              </label>
              <input
                type="text"
                name="phone_number_id"
                value={formData.phone_number_id}
                onChange={handleInputChange}
                placeholder="123456789..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">ID del número de teléfono en WhatsApp Business</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Account ID *
              </label>
              <input
                type="text"
                name="business_account_id"
                value={formData.business_account_id}
                onChange={handleInputChange}
                placeholder="987654321..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">Business Account ID desde Meta</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Access Token *
              </label>
              <input
                type="password"
                name="access_token"
                value={formData.access_token}
                onChange={handleInputChange}
                placeholder="••••••••••••••••••••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Teléfono
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de Cuenta
              </label>
              <input
                type="text"
                name="nombre_cuenta"
                value={formData.nombre_cuenta}
                onChange={handleInputChange}
                placeholder="Mi Cuenta WhatsApp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Guardando...' : 'Guardar Credencial'}
          </button>
        </form>
      )}

      {/* Credentials List */}
      <div className="space-y-4">
        {whatsappCredentials.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No hay credenciales de WhatsApp configuradas</p>
          </div>
        ) : (
          whatsappCredentials.map((credential) => (
            <div
              key={credential.id}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-green-300 transition"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {credential.nombre_cuenta || 'Credencial Sin Nombre'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {credential.phone_number || 'Sin número'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isTokenExpired(credential.fecha_expiracion_token) && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                      Token Expirado
                    </span>
                  )}
                  {isTokenExpiring(credential.fecha_expiracion_token) && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      Expira Pronto
                    </span>
                  )}
                  {!isTokenExpired(credential.fecha_expiracion_token) &&
                    !isTokenExpiring(credential.fecha_expiracion_token) && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Activo
                      </span>
                    )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">Phone ID</p>
                  <p className="text-sm text-gray-900 font-mono">{credential.phone_number_id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">Negocio ID</p>
                  <p className="text-sm text-gray-900 font-mono">{credential.business_account_id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">Estado</p>
                  <p className="text-sm text-gray-900 font-mono">{credential.estado || 'Activo'}</p>
                </div>
              </div>

              {/* Webhook Token */}
              {credential.webhook_verify_token && (
                <div className="bg-white rounded p-4 mb-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Webhook Verify Token</p>
                      <p className="text-sm text-gray-900 font-mono break-all">
                        {credential.webhook_verify_token}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(credential.webhook_verify_token, credential.id)}
                      className={`px-3 py-2 rounded transition ${
                        copiedToken === credential.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <BiCopy className="text-lg" />
                    </button>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div>
                  <p className="text-gray-600 font-semibold">Conectado</p>
                  <p className="text-gray-900">
                    {new Date(credential.fecha_conexion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Expira</p>
                  <p className={credential.fecha_expiracion_token ? 'text-gray-900' : 'text-gray-500'}>
                    {credential.fecha_expiracion_token
                      ? new Date(credential.fecha_expiracion_token).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'No establecida'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleRenewToken(credential.id)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition text-sm"
                >
                  <BiRefresh className="text-lg" />
                  Renovar Token
                </button>
                <button
                  onClick={() => handleDelete(credential.id)}
                  disabled={loading}
                  className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
                >
                  <BiTrash className="text-lg" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">📝 Cómo configurar WhatsApp:</h4>
        <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
          <li>Ve a <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">business.facebook.com</a></li>
          <li>Crea una cuenta de WhatsApp Business</li>
          <li>Obtén tu Phone Number ID y Business Account ID</li>
          <li>Genera un Access Token con permisos de WhatsApp</li>
          <li>Pega los valores en el formulario arriba</li>
          <li>Configura los webhooks en Meta: <code className="bg-white px-2 py-1 rounded">https://tudominio.com/api/webhooks/whatsapp</code></li>
        </ol>
      </div>
    </div>
  );
}
