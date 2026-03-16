import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setWhatsAppMessages,
  addWhatsAppMessage,
  setLoading,
  setError,
  setSuccess,
  clearError,
  clearSuccess,
} from '@/redux/slices/metaIntegrationSlice';
import {
  sendMetaMessageApi,
} from '@/api/apiRoutes';
import { BiSend, BiCheckCircle, BiXCircle, BiPaperclip } from 'react-icons/bi';

export default function WhatsAppMessageReceiver({ agentId }) {
  const dispatch = useDispatch();
  const {
    whatsapp: { messages, selectedCredential },
    loading,
    error,
    success,
  } = useSelector((state) => state.metaIntegration);

  // Message state
  const [newMessage, setNewMessage] = useState({
    recipient_id: '',
    message_text: '',
  });

  const [filter, setFilter] = useState('all'); // all, sent, received, pending
  const [searchTerm, setSearchTerm] = useState('');

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
    setNewMessage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.recipient_id || !newMessage.message_text.trim()) {
      dispatch(setError('Por favor completa el destinatario y el mensaje'));
      return;
    }

    if (!selectedCredential) {
      dispatch(setError('Por favor selecciona una credencial de WhatsApp'));
      return;
    }

    try {
      dispatch(setLoading(true));

      const messageData = {
        ...newMessage,
        credential_id: selectedCredential,
      };

      const response = await sendMetaMessageApi(messageData);

      if (response.data) {
        dispatch(addWhatsAppMessage(response.data));
        dispatch(setSuccess(true));
        setNewMessage({
          recipient_id: '',
          message_text: '',
        });
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message || 'Error al enviar mensaje'));
    }
  };

  const filteredMessages = messages
    .filter((msg) => {
      if (filter === 'sent') return msg.direction === 'sent' || msg.tipo === 'enviado';
      if (filter === 'received') return msg.direction === 'received' || msg.tipo === 'recibido';
      if (filter === 'pending') return msg.estado === 'pendiente';
      return true;
    })
    .filter((msg) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (msg.recipient_phone && msg.recipient_phone.toLowerCase().includes(searchLower)) ||
        (msg.message_text && msg.message_text.toLowerCase().includes(searchLower)) ||
        (msg.sender_phone && msg.sender_phone.toLowerCase().includes(searchLower))
      );
    });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageStatus = (message) => {
    if (message.estado === 'entregado') return { icon: '✓✓', color: 'text-blue-600' };
    if (message.estado === 'leído') return { icon: '✓✓', color: 'text-blue-800' };
    if (message.estado === 'fallido') return { icon: '✗', color: 'text-red-600' };
    if (message.estado === 'pendiente') return { icon: '⏳', color: 'text-yellow-600' };
    return { icon: '○', color: 'text-gray-600' };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Mensajes WhatsApp</h2>
        <p className="text-sm text-gray-600 mt-1">Envía y recibe mensajes a través de WhatsApp Business API</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <BiCheckCircle className="text-green-600 text-2xl" />
          <p className="text-green-800">Mensaje enviado exitosamente</p>
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
            ⚠️ Debes seleccionar una credencial de WhatsApp antes de enviar mensajes
          </p>
        </div>
      )}

      {/* Send Message Form */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enviar Mensaje</h3>
        
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Destinatario *
              </label>
              <input
                type="tel"
                name="recipient_id"
                value={newMessage.recipient_id}
                onChange={handleInputChange}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">Teléfono con código de país</p>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mensaje *
              </label>
              <div className="flex gap-2">
                <textarea
                  name="message_text"
                  value={newMessage.message_text}
                  onChange={handleInputChange}
                  placeholder="Escribe tu mensaje aquí..."
                  rows="2"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  maxLength="4096"
                />
                <button
                  type="submit"
                  disabled={loading || !selectedCredential}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <BiSend className="text-lg" />
                  <span>Enviar</span>
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {newMessage.message_text.length}/4096 caracteres
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'sent', label: 'Enviados' },
              { key: 'received', label: 'Recibidos' },
              { key: 'pending', label: 'Pendientes' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === option.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Buscar por teléfono o contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Messages Timeline */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">
          Historial ({filteredMessages.length})
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No hay mensajes que mostrar</p>
            </div>
          ) : (
            filteredMessages.map((message) => {
              const status = getMessageStatus(message);
              const isSent = message.direction === 'sent' || message.tipo === 'enviado';

              return (
                <div
                  key={message.id}
                  className={`rounded-lg p-4 border ${
                    isSent
                      ? 'bg-green-50 border-green-200 ml-12'
                      : 'bg-gray-50 border-gray-200 mr-12'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {isSent ? message.recipient_phone : message.sender_phone}
                      </p>
                      <p className="text-xs text-gray-600">{formatDate(message.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${status.color}`}>{status.icon}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        message.estado === 'entregado' || message.estado === 'leído'
                          ? 'bg-blue-100 text-blue-800'
                          : message.estado === 'fallido'
                          ? 'bg-red-100 text-red-800'
                          : message.estado === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.estado || 'Enviado'}
                      </span>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-white rounded p-3 border border-gray-200 mb-2">
                    <p className="text-gray-900 whitespace-pre-wrap break-words">{message.message_text}</p>
                  </div>

                  {/* Media if exists */}
                  {message.media_url && (
                    <div className="mb-2">
                      <a
                        href={message.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 font-semibold text-sm flex items-center gap-1"
                      >
                        <BiPaperclip />
                        Ver adjunto
                      </a>
                    </div>
                  )}

                  {/* Footer Info */}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{isSent ? 'Enviado' : 'Recibido'}</span>
                    {message.error_message && (
                      <span className="text-red-600">Error: {message.error_message}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">📱 Información de Mensajería</h4>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Los mensajes se sincronizar automáticamente cada 5 minutos</li>
          <li>Máximo 4096 caracteres por mensaje</li>
          <li>Se requiere el número de teléfono con código de país (ej: +1234567890)</li>
          <li>El estado "leído" indica que el destinatario abrió el mensaje</li>
          <li>Los mensajes fallidos se reintentan automáticamente</li>
        </ul>
      </div>
    </div>
  );
}
