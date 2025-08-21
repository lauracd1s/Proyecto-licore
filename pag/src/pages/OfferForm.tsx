import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Tag, Plus, Trash2 } from 'lucide-react';
import type { OfferDisplay } from '../types';

const OfferForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Catálogos desde backend
  const [tiposOferta, setTiposOferta] = useState<any[]>([]);
  const [temporadas, setTemporadas] = useState<any[]>([]);
  const [catalogoProductos, setCatalogoProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [tOf, temps, prods, cats, cls] = await Promise.all([
          fetch('http://localhost:3001/api/tipos-oferta').then(r => r.json()),
          fetch('http://localhost:3001/api/temporadas').then(r => r.json()),
          fetch('http://localhost:3001/api/productos').then(r => r.json()),
          fetch('http://localhost:3001/api/categorias').then(r => r.json()),
          fetch('http://localhost:3001/api/clientes').then(r => r.json()),
        ]);
        setTiposOferta(tOf || []);
        setTemporadas(temps || []);
        setCatalogoProductos(prods || []);
        setCategorias(cats || []);
        setClientes(cls || []);
      } catch (e) {
        console.error('Error cargando catálogos', e);
      }
    };
    fetchCatalogos();
  }, []);

  // Estado del formulario (legacy + nuevos campos)
  const [formData, setFormData] = useState({
    // Legacy UI
    title: '',
    description: '',
    type: 'descuento' as OfferDisplay['type'],
    discount: 0,
    discountType: 'percentage' as OfferDisplay['discountType'],
    targetAudience: 'general' as OfferDisplay['targetAudience'],
    conditions: '',
    startDate: '',
    endDate: '',
    isActive: true,
    image: '',
    terms: '',
    // Nuevos
    id_tipo_oferta: undefined as number | undefined,
    id_temporada: undefined as number | undefined,
    cantidad_minima: 1,
    valor_compra_minima: 0,
    limite_usos_por_cliente: undefined as number | undefined,
    limite_usos_total: undefined as number | undefined,
    requiere_codigo: false,
    codigo_promocional: '',
    descuento_porcentaje: undefined as number | undefined,
    descuento_valor_fijo: undefined as number | undefined,
    se_combina_con_otras: false,
    prioridad: 1,
    aplicaciones: [] as any[],
    criterios: [] as any[]
  });

  // Carga de datos de edición desde el backend
  useEffect(() => {
    if (isEdit && id) {
      fetch(`http://localhost:3001/api/ofertas/${id}`)
        .then(res => res.json())
        .then((offer: any) => {
          setFormData(prev => ({
            ...prev,
            title: offer.nombre || '',
            description: offer.descripcion || '',
            type: offer.tipo_oferta || 'descuento',
            discount: offer.descuento_porcentaje || offer.descuento_valor_fijo || 0,
            discountType: offer.descuento_porcentaje ? 'percentage' : 'fixed',
            targetAudience: 'general', // Ajusta si tienes este dato
            conditions: '', // Ajusta si tienes este dato
            startDate: offer.fecha_inicio ? new Date(offer.fecha_inicio).toISOString().split('T')[0] : '',
            endDate: offer.fecha_fin ? new Date(offer.fecha_fin).toISOString().split('T')[0] : '',
            isActive: offer.estado === 'activa',
            image: '',
            terms: '',
            id_tipo_oferta: offer.id_tipo_oferta,
            id_temporada: offer.id_temporada,
            cantidad_minima: offer.cantidad_minima || 1,
            valor_compra_minima: offer.valor_compra_minima || 0,
            limite_usos_por_cliente: offer.limite_usos_por_cliente,
            limite_usos_total: offer.limite_usos_total,
            requiere_codigo: offer.requiere_codigo,
            codigo_promocional: offer.codigo_promocional || '',
            descuento_porcentaje: offer.descuento_porcentaje,
            descuento_valor_fijo: offer.descuento_valor_fijo,
            se_combina_con_otras: offer.se_combina_con_otras,
            prioridad: offer.prioridad || 1,
            aplicaciones: offer.aplicaciones || [],
            criterios: offer.criterios || []
          }));
        })
        .catch(() => {
          // Si falla, no modifica el formData
        });
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      id_tipo_oferta: formData.id_tipo_oferta,
      id_temporada: formData.id_temporada || null,
      id_empleado_creador: 1,
      nombre: formData.title,
      descripcion: formData.description + (formData.terms ? ('\nTérminos: ' + formData.terms) : ''),
      fecha_inicio: formData.startDate,
      fecha_fin: formData.endDate,
      cantidad_minima: formData.cantidad_minima,
      valor_compra_minima: formData.valor_compra_minima,
    limite_usos_por_cliente: formData.limite_usos_por_cliente ?? null,
      limite_usos_total: formData.limite_usos_total ?? null,
      requiere_codigo: formData.requiere_codigo,
      codigo_promocional: formData.codigo_promocional || null,
      descuento_porcentaje: formData.discountType === 'percentage' ? formData.discount : formData.descuento_porcentaje ?? null,
      descuento_valor_fijo: formData.discountType === 'fixed' ? formData.discount : formData.descuento_valor_fijo ?? null,
      se_combina_con_otras: formData.se_combina_con_otras,
      prioridad: formData.prioridad,
      estado: formData.isActive ? 'activa' : 'inactiva',
      aplicaciones: formData.aplicaciones,
      criterios: formData.criterios,
    };

    try {
      const res = await fetch('http://localhost:3001/api/ofertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al guardar la oferta');
      navigate('/offers');
    } catch (err) {
      console.error(err);
      alert('No se pudo guardar la oferta');
    }
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
            {/* Información básica */}
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#8B4513' }}>Información Básica</h3>

              <div className="form-group">
                <label className="form-label">Título de la Oferta *</label>
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
                <label className="form-label">Descripción *</label>
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
                    value={formData.id_tipo_oferta || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, id_tipo_oferta: e.target.value ? Number(e.target.value) : undefined }))}
                    required
                  >
                    <option value="">Seleccione…</option>
                    {tiposOferta.map(t => (
                      <option key={t.id_tipo_oferta} value={t.id_tipo_oferta}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Descuento *</label>
                  <select
                    className="form-select"
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as OfferDisplay['discountType'], descuento_porcentaje: undefined, descuento_valor_fijo: undefined }))}
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
                    min={formData.discountType === 'percentage' ? 1 : 0}
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    step={formData.discountType === 'percentage' ? 1 : 0.01}
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

              {/* Condiciones de la oferta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Cantidad mínima</label>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    value={formData.cantidad_minima}
                    onChange={(e) => setFormData(prev => ({ ...prev, cantidad_minima: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Valor compra mínima</label>
                  <input
                    type="number"
                    className="form-input"
                    step={0.01}
                    min={0}
                    value={formData.valor_compra_minima}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_compra_minima: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Límite de usos total</label>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    value={formData.limite_usos_total || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, limite_usos_total: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Sin límite"
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
                <label className="form-label">Términos y Condiciones</label>
                <textarea
                  className="form-textarea"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Términos y condiciones de la oferta..."
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

              {/* Temporada y prioridad */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Temporada</label>
                  <select
                    className="form-select"
                    value={formData.id_temporada || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, id_temporada: e.target.value ? Number(e.target.value) : undefined }))}
                  >
                    <option value="">Sin temporada</option>
                    {temporadas.map(t => (
                      <option key={t.id_temporada} value={t.id_temporada}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prioridad</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.prioridad}
                    min={1}
                    onChange={(e) => setFormData(prev => ({ ...prev, prioridad: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Código promocional y combinación */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Requiere código</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.requiere_codigo}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiere_codigo: e.target.checked }))}
                    />
                    <span className="form-label" style={{ marginBottom: 0 }}>Sí</span>
                  </label>
                  {formData.requiere_codigo && (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Código promocional"
                      value={formData.codigo_promocional}
                      onChange={(e) => setFormData(prev => ({ ...prev, codigo_promocional: e.target.value }))}
                    />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Combina con otras</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.se_combina_con_otras}
                      onChange={(e) => setFormData(prev => ({ ...prev, se_combina_con_otras: e.target.checked }))}
                    />
                    <span className="form-label" style={{ marginBottom: 0 }}>Permitir combinación</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Aplicación de la oferta */}
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#8B4513' }}>Aplicación de la Oferta</h3>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setFormData(prev => ({ ...prev, aplicaciones: [...prev.aplicaciones, { tipo_aplicacion: 'producto', cantidad_minima: 1 }] }))}>
                  <Plus size={16} /> Producto
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setFormData(prev => ({ ...prev, aplicaciones: [...prev.aplicaciones, { tipo_aplicacion: 'categoria', cantidad_minima: 1 }] }))}>
                  <Plus size={16} /> Categoría
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setFormData(prev => ({ ...prev, aplicaciones: [...prev.aplicaciones, { tipo_aplicacion: 'cliente', cantidad_minima: 1 }] }))}>
                  <Plus size={16} /> Cliente
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setFormData(prev => ({ ...prev, aplicaciones: [...prev.aplicaciones, { tipo_aplicacion: 'marca', cantidad_minima: 1 }] }))}>
                  <Plus size={16} /> Marca
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setFormData(prev => ({ ...prev, aplicaciones: [...prev.aplicaciones, { tipo_aplicacion: 'todos', cantidad_minima: 1 }] }))}>
                  <Plus size={16} /> Todos
                </button>
              </div>

              {formData.aplicaciones.length === 0 ? (
                <p style={{ color: '#666' }}>Agrega al menos una aplicación para definir dónde aplica la oferta.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.aplicaciones.map((ap, idx) => (
                    <div key={idx} style={{ border: '1px solid #E0E0E0', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                        <strong>{ap.tipo_aplicacion.toUpperCase()}</strong>
                        <button type="button" className="btn btn-danger" onClick={() => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.filter((_, i) => i !== idx) }))}>
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Selector por tipo */}
                      {ap.tipo_aplicacion === 'producto' && (
                        <>
                          <select className="form-select" value={ap.id_producto || ''} onChange={(e) => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, id_producto: e.target.value ? Number(e.target.value) : undefined } : x) }))}>
                            <option value="">Seleccione producto…</option>
                            {catalogoProductos.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.producto} - ${p.precio}</option>
                            ))}
                          </select>
                          {/* Nuevo campo para producto gratis */}
                          <div className="form-group" style={{ marginTop: '0.5rem' }}>
                            <label className="form-label">Producto gratis (opcional)</label>
                            <select className="form-select" value={ap.id_producto_gratis || ''} onChange={(e) => setFormData(prev => ({
                              ...prev,
                              aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, id_producto_gratis: e.target.value ? Number(e.target.value) : undefined } : x)
                            }))}>
                              <option value="">Sin producto gratis</option>
                              {catalogoProductos.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.producto} - ${p.precio}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                      {ap.tipo_aplicacion === 'categoria' && (
                        <select className="form-select" value={ap.id_categoria || ''} onChange={(e) => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, id_categoria: e.target.value ? Number(e.target.value) : undefined } : x) }))}>
                          <option value="">Seleccione categoría…</option>
                          {categorias.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </select>
                      )}
                      {ap.tipo_aplicacion === 'cliente' && (
                        <select className="form-select" value={ap.id_cliente || ''} onChange={(e) => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, id_cliente: e.target.value ? Number(e.target.value) : undefined } : x) }))}>
                          <option value="">Seleccione cliente…</option>
                          {clientes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.nombre} {c.apellido} - {c.cedula}</option>
                          ))}
                        </select>
                      )}
                      {ap.tipo_aplicacion === 'marca' && (
                        <input className="form-input" placeholder="Marca" value={ap.marca || ''} onChange={(e) => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, marca: e.target.value } : x) }))} />
                      )}

                      {/* Parámetros comunes por aplicación */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <div className="form-group">
                          <label className="form-label">Cant. mínima</label>
                          <input type="number" className="form-input" value={ap.cantidad_minima || 1} min={1} onChange={(e) => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, cantidad_minima: Number(e.target.value) } : x) }))} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Unidades gratis</label>
                          <input type="number" className="form-input" value={ap.unidades_gratis || 0} min={0} onChange={(e) => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, unidades_gratis: Number(e.target.value) } : x) }))} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Exclusivo</label>
                          <input type="checkbox" checked={ap.es_exclusivo || false} onChange={(e) => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, es_exclusivo: e.target.checked } : x) }))} />
                        </div>
                      </div>

                      {/* Ofertas por unidades */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <div className="form-group">
                          <label className="form-label">Unidades compradas</label>
                          <input type="number" className="form-input" value={ap.unidades_compradas || 0} min={0} onChange={(e) => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, unidades_compradas: Number(e.target.value) } : x) }))} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Unidades otorgadas</label>
                          <input type="number" className="form-input" value={ap.unidades_otorgadas || 0} min={0} onChange={(e) => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, unidades_otorgadas: Number(e.target.value) } : x) }))} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Aplica por cada múltiplo</label>
                          <input type="checkbox" checked={ap.aplica_por_cada || false} onChange={(e) => setFormData(prev => ({ ...prev, aplicaciones: prev.aplicaciones.map((x, i) => i === idx ? { ...x, aplica_por_cada: e.target.checked } : x) }))} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Criterios adicionales */}
            </div>
          </div>

          {/* Botones de acción */}
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