import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPriceSuggestionApi } from '@/api/apiRoutes';
import { setPriceSuggestion, setPriceLoading, setPriceError } from '@/redux/slices/priceIntelligenceSlice';
import { formatCurrency } from '@/utils/helperFunction';
import { HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineSparkles } from 'react-icons/hi2';

const PriceSuggestionCard = ({ propertyId, currentPrice, onShowAnalysis }) => {
  const dispatch = useDispatch();
  const { suggestions, loading } = useSelector(state => state.priceIntelligence);
  const suggestion = suggestions[propertyId];
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (propertyId && !suggestion) {
      fetchSuggestion();
    }
  }, [propertyId]);

  const fetchSuggestion = async () => {
    try {
      dispatch(setPriceLoading(true));
      const response = await getPriceSuggestionApi({
        propertyId,
        force_refresh: false,
      });
      dispatch(setPriceSuggestion({
        propertyId,
        data: response.data || response,
      }));
    } catch (error) {
      dispatch(setPriceError(error.message || 'Error fetching price suggestion'));
    }
  };

  if (loading && !suggestion) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 animate-pulse">
        <div className="h-4 bg-blue-200 rounded w-1/3 mb-3"></div>
        <div className="h-6 bg-blue-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <p className="text-sm text-yellow-800">No hay sugerencia de precio disponible</p>
      </div>
    );
  }

  const priceChange = suggestion.suggested_price - (currentPrice || suggestion.current_price);
  const percentChange = suggestion.price_change_percentage || 0;
  const isRecommendedDecrease = suggestion.recommendation === 'decrease';
  const isRecommendedIncrease = suggestion.recommendation === 'increase';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900">Sugerencia de Precio IA</span>
        </div>
        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          Confianza: {suggestion.confidence_score}%
        </div>
      </div>

      {/* Current vs Suggested */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded p-3">
          <p className="text-xs text-gray-500 mb-1">Precio Actual</p>
          <p className="font-bold text-gray-900">
            {formatCurrency(currentPrice || suggestion.current_price)}
          </p>
        </div>
        <div className="bg-white rounded p-3">
          <p className="text-xs text-gray-500 mb-1">Precio Sugerido</p>
          <p className={`font-bold ${isRecommendedDecrease ? 'text-red-600' : isRecommendedIncrease ? 'text-green-600' : 'text-blue-600'}`}>
            {formatCurrency(suggestion.suggested_price)}
          </p>
        </div>
      </div>

      {/* Change Indicator */}
      <div className={`flex items-center gap-2 p-2 rounded ${
        percentChange < 0 ? 'bg-red-100' : 'bg-green-100'
      }`}>
        {percentChange < 0 ? (
          <HiOutlineTrendingDown className="w-5 h-5 text-red-600" />
        ) : (
          <HiOutlineTrendingUp className="w-5 h-5 text-green-600" />
        )}
        <span className={`font-semibold ${percentChange < 0 ? 'text-red-700' : 'text-green-700'}`}>
          {percentChange > 0 ? '+' : ''}{percentChange}%
        </span>
        <span className={`text-sm ${percentChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {percentChange < 0 ? 'Reducir' : 'Aumentar'} precio para mejor venta
        </span>
      </div>

      {/* Price Range */}
      <div className="bg-white rounded p-3">
        <p className="text-xs text-gray-500 mb-2">Rango de Precio Recomendado</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Mínimo</p>
            <p className="font-semibold text-red-600">
              {formatCurrency(suggestion.minimum_price)}
            </p>
          </div>
          <div className="text-center">
            <div className="w-24 h-1 bg-gradient-to-r from-red-400 via-blue-400 to-green-400 rounded"></div>
          </div>
          <div>
            <p className="text-xs text-gray-600">Máximo</p>
            <p className="font-semibold text-green-600">
              {formatCurrency(suggestion.maximum_price)}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded p-2">
          <p className="text-xs text-gray-500">Precio por m²</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(suggestion.suggested_price_per_sqm)}/m²
          </p>
        </div>
        <div className="bg-white rounded p-2">
          <p className="text-xs text-gray-500">Probabilidad Venta</p>
          <p className="font-semibold text-blue-600">
            {suggestion.estimated_sales_probability}%
          </p>
        </div>
      </div>

      {/* Comparables */}
      <div className="bg-white rounded p-2">
        <p className="text-xs text-gray-500">Comparables Analizadas</p>
        <p className="font-semibold text-gray-900">
          {suggestion.comparable_properties_count} propiedades
        </p>
      </div>

      {/* Reasoning */}
      {suggestion.reasoning && (
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Ver análisis detallado
          </summary>
          <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border border-gray-200">
            {suggestion.reasoning.substring(0, 200)}...
          </p>
        </details>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onShowAnalysis && onShowAnalysis(propertyId)}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
        >
          Ver Análisis Completo
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm font-medium transition-colors"
        >
          {showDetails ? 'Ocultar' : 'Más'}
        </button>
      </div>

      {/* Expiration */}
      {suggestion.expires_at && (
        <p className="text-xs text-gray-500 text-center">
          Válida hasta: {new Date(suggestion.expires_at).toLocaleDateString('es-DO')}
        </p>
      )}
    </div>
  );
};

export default PriceSuggestionCard;
