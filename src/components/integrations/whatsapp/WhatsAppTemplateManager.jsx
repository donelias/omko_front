import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setWhatsAppTemplates,
  setLoading,
  setError,
  setSuccess,
  clearError,
  clearSuccess,
} from '@/redux/slices/metaIntegrationSlice';
import {
  BiPlus,
  BiEdit3,
  BiTrash2,
  BiCopy,
  BiCheckCircle,
  BiXCircle,
} from 'react-icons/bi';

export default function WhatsAppTemplateManager({ agentId }) {
  const dispatch = useDispatch();
  const {
    whatsapp: { templates, selectedCredential },
    loading,
    error,
    success,
  } = useSelector((state) => state.metaIntegration);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'marketing', // marketing, utility, authentication
    language: 'es',
    content: '',
    sample_params: [],
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedTemplate, setCopiedTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const handleAddParameter = () => {
    setFormData((prev) => ({
      ...prev,
      sample_params: [...prev.sample_params, ''],
    }));
  };

  const handleParameterChange = (idx, value) => {
    setFormData((prev) => {
      const newParams = [...prev.sample_params];
      newParams[idx] = value;
      return {
        ...prev,
        sample_params: newParams,
      };
    });
  };

  const handleRemoveParameter = (idx) => {
    setFormData((prev) => ({
      ...prev,
      sample_params: prev.sample_params.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.content) {
      dispatch(setError('Por favor completa el nombre y contenido de la plantilla'));
      return;
    }

    // Placeholder: In real app, would call API
    try {
      dispatch(setLoading(true));
      
      const template = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString(),
        status: 'draft',
      };

      dispatch(setSuccess(true));
      setFormData({
        name: '',
        category: 'marketing',
        language: 'es',
        content: '',
        sample_params: [],
      });
      setShowForm(false);
    } catch (err) {
      dispatch(setError('Error al crear plantilla'));
    }
  };

  const copyTemplateContent = (content) => {
    navigator.clipboard.writeText(content);
    setCopiedTemplate(content);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'marketing':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Marketing' };
      case 'utility':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Utilidad' };
      case 'authentication':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Autenticación' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: category };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', label: 'Aprobada' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: '✗', label: 'Rechazada' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'Pendiente' };
      case 'draft':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '○', label: 'Borrador' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '○', label: status };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plantillas de WhatsApp</h2>
          <p className="text-sm text-gray-600 mt-1">Crea y administra plantillas de mensajes predefinidas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            showForm
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <BiPlus />
          {showForm ? 'Cancelar' : 'Nueva Plantilla'}
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
            ⚠️ Debes seleccionar una credencial de WhatsApp antes de crear plantillas
          </p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la Plantilla *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Bienvenida Cliente"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="marketing">Marketing</option>
                <option value="utility">Utilidad</option>
                <option value="authentication">Autenticación</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Idioma
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contenido del Mensaje *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Escribe tu plantilla aquí. Usa {{1}}, {{2}}, etc. para parámetros dinámicos"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-2">
              Máximo 1024 caracteres. Usa {'{'}{'{'}'1{'}'}{'}'}, {'{'}{'{'}'2{'}'}{'}'}, etc. para valores dinámicos.
            </p>
          </div>

          {/* Dynamic Parameters */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Parámetros Dinámicos (Ejemplos)
              </label>
              <button
                type="button"
                onClick={handleAddParameter}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold"
              >
                + Agregar
              </button>
            </div>

            <div className="space-y-2">
              {formData.sample_params.map((param, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={param}
                    onChange={(e) => handleParameterChange(idx, e.target.value)}
                    placeholder={`Ejemplo para {{${idx + 1}}}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveParameter(idx)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded transition"
                  >
                    <BiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedCredential}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Creando...' : 'Crear Plantilla'}
          </button>
        </form>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'marketing', label: 'Marketing' },
          { key: 'utility', label: 'Utilidad' },
          { key: 'authentication', label: 'Autenticación' },
        ].map((option) => (
          <button
            key={option.key}
            onClick={() => setSelectedCategory(option.key)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedCategory === option.key
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No hay plantillas en esta categoría</p>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const categoryBadge = getCategoryBadge(template.category);
            const statusBadge = getStatusBadge(template.status);

            return (
              <div
                key={template.id}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-green-300 transition"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${categoryBadge.bg} ${categoryBadge.text}`}>
                        {categoryBadge.label}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {template.language.toUpperCase()} • Creada {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyTemplateContent(template.content)}
                      className={`flex items-center gap-1 px-3 py-2 rounded transition text-sm font-semibold ${
                        copiedTemplate === template.content
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <BiCopy />
                      {copiedTemplate === template.content ? 'Copiado' : 'Copiar'}
                    </button>
                    <button className="p-2 hover:bg-blue-100 rounded transition text-blue-600">
                      <BiEdit3 className="text-lg" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded transition text-red-600">
                      <BiTrash2 className="text-lg" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded p-4 border border-gray-200 mb-4">
                  <p className="text-gray-900 whitespace-pre-wrap break-words">{template.content}</p>
                </div>

                {/* Sample Parameters */}
                {template.sample_params && template.sample_params.length > 0 && (
                  <div className="bg-blue-50 rounded p-4 border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold uppercase mb-2">Parámetros Dinámicos</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {template.sample_params.map((param, idx) => {
                        const paramNumber = `{{${idx + 1}}}`;
                        return (
                          <div key={idx} className="bg-white rounded p-2 border border-blue-200">
                            <p className="text-xs text-blue-600 font-semibold">{paramNumber}</p>
                            <p className="text-sm text-gray-900 font-mono">{param}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Information Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">📝 Información sobre Plantillas</h4>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Las plantillas deben ser aprobadas por Meta antes de usarlas</li>
          <li>Usa {'{'}{'{'}'1{'}'}{'}'}, {'{'}{'{'}'2{'}'}{'}'}, etc. para insertar valores dinámicos</li>
          <li>El proceso de aprobación suele tardar 2-24 horas</li>
          <li>Las plantillas rechazadas pueden editarse y resubmitirse</li>
          <li>Máximo 1024 caracteres por plantilla</li>
        </ul>
      </div>
    </div>
  );
}
