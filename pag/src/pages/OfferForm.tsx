import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Tag } from 'lucide-react';
import type { OfferDisplay } from '../types';

const OfferForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  // Leer ofertas desde localStorage
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('offers');
    if (stored) {
      const parsed = JSON.parse(stored).map((o: any) => ({
        ...o,
        startDate: o.startDate ? new Date(o.startDate) : undefined,
        endDate: o.endDate ? new Date(o.endDate) : undefined
      }));
      setOffers(parsed);
    }
  }, []);
  // Leer productos desde localStorage
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('products');
    if (stored) {
      const parsed = JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: p.createdAt ? new Date(p.createdAt) : undefined
      }));
      setProducts(parsed);
    }
  }, []);
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'descuento' as OfferDisplay['type'],
    discount: 0,
    discountType: 'percentage' as OfferDisplay['discountType'],
    targetAudience: 'general' as OfferDisplay['targetAudience'],
    conditions: '',
    maxRedemptions: undefined as number | undefined,
    productIds: [] as string[],
    startDate: '',
    endDate: '',
    isActive: true,
    image: '',
    terms: ''
  });

  useEffect(() => {
    if (isEdit && id && offers.length) {
      const offer = offers.find(o => o.id === id);
      if (offer) {
        setFormData({
          title: offer.title,
          description: offer.description,
          type: offer.type,
          discount: offer.discount,
          discountType: offer.discountType,
          targetAudience: offer.targetAudience,
          conditions: offer.conditions,
          maxRedemptions: offer.maxRedemptions,
          productIds: offer.productIds,
          startDate: offer.startDate ? offer.startDate.toISOString().split('T')[0] : '',
          endDate: offer.endDate ? offer.endDate.toISOString().split('T')[0] : '',
          isActive: offer.isActive,
          image: offer.image,
          terms: offer.terms
        });
      }
    }
  }, [isEdit, id, offers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const offerData = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      discountValue: formData.discount,
      conditions: formData.conditions || 'Sin condiciones especiales',
      currentRedemptions: 0,
      id: isEdit && id ? id : Date.now().toString()
    };
    let updatedOffers = [...offers];
    if (isEdit && id) {
      // Actualizar oferta existente
      updatedOffers = updatedOffers.map(o =>
        o.id === id ? { ...o, ...offerData } : o
      );
    } else {
      // Agregar nueva oferta
      updatedOffers.push(offerData);
    }
    localStorage.setItem('offers', JSON.stringify(updatedOffers));
    setOffers(updatedOffers);
    navigate('/offers');
  };

  const handleProductChange = (productId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      productIds: checked
        ? [...prev.productIds, productId]
        : prev.productIds.filter(id => id !== productId)
    }));
  };

  return (
    <div className="offer-form">
      <div className="page-header">
        <h1 className="page-title">
          <Tag size={28} />
          {isEdit ? 'Editar Oferta' : 'Nueva Oferta'}
        </h1>
        <button 
          onClick={() => navigate('/offers')} 
          className="btn btn-outline"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* InformaciÃ³n bÃ¡sica */}
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#8B4513' }}>InformaciÃ³n BÃ¡sica</h3>
              
              <div className="form-group">
                <label className="form-label">TÃ­tulo de la Oferta *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Happy Hour Whisky"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">DescripciÃ³n *</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe los detalles de la oferta..."
                  rows={3}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Oferta *</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as OfferDisplay['type'] }))}
                    required
                  >
                    <option value="descuento">Descuento</option>
                    <option value="2x1">2x1</option>
                    <option value="3x2">3x2</option>
                    <option value="combo">Combo</option>
                    <option value="precio_especial">Precio Especial</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Descuento *</label>
                  <select
                    className="form-select"
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as OfferDisplay['discountType'] }))}
                    required
                  >
                    <option value="percentage">Porcentaje</option>
                    <option value="fixed">Monto Fijo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    {formData.discountType === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'} *
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                    min="1"
                    max={formData.discountType === 'percentage' ? "100" : undefined}
                    step={formData.discountType === 'percentage' ? "1" : "0.01"}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Audiencia Objetivo *</label>
                  <select
                    className="form-select"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value as OfferDisplay['targetAudience'] }))}
                    required
                  >
                    <option value="general">General</option>
                    <option value="premium">Premium</option>
                    <option value="loyalty">Programa de Lealtad</option>
                    <option value="new">Clientes Nuevos</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">MÃ¡ximo de Redenciones</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.maxRedemptions || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxRedemptions: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    min="1"
                    placeholder="Sin lÃ­mite"
                  />
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>
                    Deja vacÃ­o para sin lÃ­mite
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Condiciones Especiales</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.conditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                    placeholder="Ej: Solo fines de semana"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Fecha de Inicio *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha de Fin *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>


              <div className="form-group">
                <label className="form-label">TÃ©rminos y Condiciones</label>
                <textarea
                  className="form-textarea"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="TÃ©rminos y condiciones de la oferta..."
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span className="form-label" style={{ marginBottom: 0 }}>Oferta activa</span>
                </label>
              </div>
            </div>

            {/* SelecciÃ³n de productos */}
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#8B4513' }}>Productos Incluidos</h3>
              
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto', 
                border: '2px solid #E0E0E0', 
                borderRadius: '8px', 
                padding: '1rem' 
              }}>
                {products.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center' }}>
                    No hay productos disponibles
                  </p>
                ) : (
                  products.map(product => (
                    <div key={product.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      border: '1px solid #F0F0F0',
                      borderRadius: '8px',
                      marginBottom: '0.5rem'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.productIds.includes(product.id)}
                        onChange={(e) => handleProductChange(product.id, e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {product.brand} - ${product.price} - Stock: {product.stock}
                        </div>
                        <span className={`badge badge-info`} style={{ fontSize: '0.7rem' }}>
                          {product.category}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {formData.productIds.length > 0 && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#F9F9F9', 
                  borderRadius: '8px' 
                }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#8B4513' }}>Productos Seleccionados:</h4>
                  <p style={{ color: '#666' }}>{formData.productIds.length} productos incluidos en esta oferta</p>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acciÃ³n */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #E0E0E0'
          }}>
            <button 
              type="button" 
              onClick={() => navigate('/offers')}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={20} />
              {isEdit ? 'Actualizar Oferta' : 'Crear Oferta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferForm;