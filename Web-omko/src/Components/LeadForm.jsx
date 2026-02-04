import React, { useState } from 'react';
import axios from 'axios';

const LeadForm = ({ propertyId, propertyTitle, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        ...formData,
        property_id: propertyId,
        source: 'website',
      };

      const response = await axios.post('/api/leads', data);

      if (!response.data.error) {
        setSuccess('¡Gracias por tu interés! Nos pondremos en contacto pronto.');
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          country: '',
        });

        // Track conversion on Meta Pixel if available
        if (window.fbq) {
          window.fbq('track', 'Lead', {
            value: 0.00,
            currency: 'USD',
          });
        }

        // Call callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess(response.data.lead);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
        'Ocurrió un error al enviar el formulario. Por favor intenta de nuevo.';
      setError(errorMessage);
      console.error('Lead form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-form-container">
      <div className="lead-form">
        <h3 className="lead-form-title">
          ¿Interesado en esta propiedad?
        </h3>
        <p className="lead-form-subtitle">
          Completa el formulario y un agente se pondrá en contacto contigo.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="needs-validation">
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="first_name">Nombre *</label>
              <input
                type="text"
                className="form-control"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
              />
            </div>

            <div className="form-group col-md-6">
              <label htmlFor="last_name">Apellido</label>
              <input
                type="text"
                className="form-control"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group col-md-6">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="country">País</label>
            <select
              className="form-control"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            >
              <option value="">Selecciona un país</option>
              <option value="Republica Dominicana">República Dominicana</option>
              <option value="United States">Estados Unidos</option>
              <option value="Puerto Rico">Puerto Rico</option>
              <option value="Spain">España</option>
              <option value="Mexico">México</option>
              <option value="Colombia">Colombia</option>
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
              <option value="Peru">Perú</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Other">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <small className="form-text text-muted">
              Los datos que proporciones serán utilizados únicamente para contactarte 
              respecto a esta propiedad.
            </small>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                Enviando...
              </>
            ) : (
              'Enviar Solicitud de Información'
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        .lead-form-container {
          max-width: 400px;
          margin: 20px auto;
          padding: 0;
        }

        .lead-form {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .lead-form-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }

        .lead-form-subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          font-weight: 500;
          font-size: 14px;
          color: #333;
          margin-bottom: 6px;
          display: block;
        }

        .form-control {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px 12px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          border-color: #007bff;
          outline: none;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 576px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .btn-block {
          width: 100%;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .alert-danger {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .alert-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .spinner-border {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </div>
  );
};

export default LeadForm;
