import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const OffersManagement: React.FC = () => {
  // Leer ofertas y productos, mezclar ofertas automáticas
  const [offers, setOffers] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const [dbOffers, products] = await Promise.all([
          fetch('http://localhost:3001/api/ofertas').then(r => r.json()),
          fetch('http://localhost:3001/api/productos').then(r => r.json())
        ]);

        const typeFromNombre = (nombre?: string) => {
          if (!nombre) return 'descuento';
          const n = String(nombre).toLowerCase();
          if (n.includes('2x1')) return '2x1';
          if (n.includes('3x2')) return '3x2';
          if (n.includes('combo')) return 'combo';
          if (n.includes('precio')) return 'precio_especial';
          if (n.includes('descu')) return 'descuento';
          return 'descuento';
        };

        const mappedDbOffers = (dbOffers || []).map((o: any) => ({
          id: String(o.id_oferta),
          title: o.nombre,
          description: o.descripcion || '',
          type: typeFromNombre(o.tipo_oferta?.nombre),
          discount: o.descuento_porcentaje || 0,
          discountType: 'percentage',
          discountValue: o.descuento_porcentaje || 0,
          productIds: [],
          startDate: o.fecha_inicio ? new Date(o.fecha_inicio) : new Date(),
          endDate: o.fecha_fin ? new Date(o.fecha_fin) : new Date(),
          isActive: o.estado === 'activa',
          image: '',
          terms: '',
          conditions: '',
          targetAudience: 'general',
          currentRedemptions: o.usos_actuales || 0,
          createdAt: o.fecha_creacion ? new Date(o.fecha_creacion) : new Date()
        }));

        // Ofertas automáticas por vencimiento (30 días)
        const today = new Date();
        const autoOffers: any[] = [];
        (products || []).forEach((p: any) => {
          if (p.fecha_vencimiento) {
            const expDate = new Date(p.fecha_vencimiento);
            const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays > 0 && diffDays <= 30 && p.estado === 'activo') {
              // Descuento lineal creciente: ~5% a 30 días hasta ~60% a 1 día
              let discount = Math.round(5 + ((30 - diffDays) * (55 / 29)));
              // Asegurar que el precio con descuento no sea menor que el costo
              const priceWithDiscount = Number(p.precio) * (1 - discount / 100);
              const cost = Number(p.precio_costo_unitario || 0);
              if (cost > 0 && priceWithDiscount < cost) {
                const maxDiscount = Math.round((1 - (cost / Number(p.precio))) * 100);
                discount = Math.max(0, maxDiscount);
              }
              if (discount > 0) {
                autoOffers.push({
                  id: `auto-${p.id}`,
                  title: `¡Oferta por vencimiento! ${p.producto}`,
                  description: `Descuento especial porque este producto vence en ${diffDays} días.`,
                  type: 'automatico',
                  discount,
                  discountType: 'percentage',
                  discountValue: discount,
                  productIds: [String(p.id)],
                  startDate: today,
                  endDate: expDate,
                  isActive: true,
                  image: '',
                  terms: 'Oferta automática por vencimiento',
                  conditions: 'Válido hasta agotar existencias o fecha de vencimiento',
                  targetAudience: 'general',
                  currentRedemptions: 0,
                  createdAt: today
                });
              }
            }
          }
        });

        setOffers([...mappedDbOffers, ...autoOffers]);
      } catch (e) {
        console.error(e);
        // fallback a localStorage previo
        const stored = localStorage.getItem('offers');
        let parsedOffers: any[] = [];
        if (stored) {
          parsedOffers = JSON.parse(stored).map((o: any) => ({
            ...o,
            startDate: o.startDate ? new Date(o.startDate) : undefined,
            endDate: o.endDate ? new Date(o.endDate) : undefined
          }));
        }
        setOffers(parsedOffers);
      }
    };
    load();
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
      const updated = offers.filter(o => o.id !== id);
      localStorage.setItem('offers', JSON.stringify(updated));
      setOffers(updated);
    }
  };

  const getOfferTypeLabel = (type: string) => {
    const types = {
      'descuento': 'Descuento',
      '2x1': '2x1',
      '3x2': '3x2',
      'combo': 'Combo',
      'precio_especial': 'Precio Especial',
      'automatico': 'Automático'
    };
    return types[type as keyof typeof types] || type;
  };

  const getOfferTypeColor = (type: string) => {
    const colors = {
      'descuento': 'success',
      '2x1': 'warning',
      '3x2': 'info',
      'combo': 'danger',
      'precio_especial': 'success',
      'automatico': 'primary'
    };
    return colors[type as keyof typeof colors] || 'info';
  };

  return (
    <div className="offers-management">
      <div className="page-header">
        <h1 className="page-title">
          <Tag size={28} />
          Gestión de Ofertas
        </h1>
        <Link to="/offers/new" className="btn btn-primary">
          <Plus size={20} />
          Nueva Oferta
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-value">{offers.length}</div>
          <div className="stat-label">Total Ofertas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{offers.filter(o => o.isActive).length}</div>
          <div className="stat-label">Ofertas Activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {offers.filter(o => o.endDate > new Date()).length}
          </div>
          <div className="stat-label">Ofertas Vigentes</div>
        </div>
      </div>

      {/* Lista de ofertas */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Ofertas Registradas</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/calendar" className="btn btn-outline">
              <Calendar size={16} />
              Ver Calendario
            </Link>
          </div>
        </div>

        {offers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <Tag size={64} style={{ marginBottom: '1rem', color: '#ccc' }} />
            <h3>No hay ofertas registradas</h3>
            <p>Crea tu primera oferta para empezar a promocionar productos</p>
            <Link to="/offers/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <Plus size={20} />
              Crear Primera Oferta
            </Link>
          </div>
        ) : (
          <div className="offers-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {offers.map(offer => (
              <div key={offer.id} className="offer-card" style={{
                border: '2px solid #E0E0E0',
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: 'white',
                position: 'relative'
              }}>
                {/* Status badge */}
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <span className={`badge badge-${getOfferTypeColor(offer.type)}`}>
                    {getOfferTypeLabel(offer.type)}
                  </span>
                  {offer.isActive ? (
                    <span className="badge badge-success">Activa</span>
                  ) : (
                    <span className="badge badge-danger">Inactiva</span>
                  )}
                </div>

                {/* Imagen de la oferta */}
                <div style={{
                  width: '100%',
                  height: '120px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <Tag size={40} color="#8B4513" />
                </div>

                {/* Contenido de la oferta */}
                <h4 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: '#8B4513'
                }}>
                  {offer.title}
                </h4>
                
                <p style={{ 
                  color: '#666', 
                  fontSize: '0.9rem', 
                  marginBottom: '1rem',
                  lineHeight: '1.4'
                }}>
                  {offer.description}
                </p>

                {/* Descuento */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: '#8B4513' 
                  }}>
                    {offer.discount}%
                  </span>
                  <span style={{ color: '#666' }}>de descuento</span>
                </div>

                {/* Fechas */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '6px'
                }}>
                  <Clock size={16} color="#666" />
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    {format(offer.startDate, 'dd/MM/yyyy')} - {format(offer.endDate, 'dd/MM/yyyy')}
                  </span>
                </div>

                {/* Acciones */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  justifyContent: 'flex-end'
                }}>
                  <Link 
                    to={`/offers/edit/${offer.id}`} 
                    className="btn btn-outline"
                    style={{ padding: '0.5rem' }}
                  >
                    <Edit size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(offer.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.5rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersManagement;
