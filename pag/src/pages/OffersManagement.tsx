import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';


const OffersManagement: React.FC = () => {
  // Leer ofertas desde el backend
  const [offers, setOffers] = React.useState<any[]>([]);
  // Ofertas por caducidad
  const [expiryOffers, setExpiryOffers] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:3001/api/ofertas')
      .then(res => res.json())
      .then(data => {
        // Adaptar los datos para la interfaz
        const mapped = data.map((o: any) => ({
          id: o.id_oferta,
          title: o.nombre,
          description: o.descripcion,
          type: o.tipo_oferta || 'descuento',
          discount: o.descuento_porcentaje || o.descuento_valor_fijo || 0,
          startDate: o.fecha_inicio ? new Date(o.fecha_inicio) : undefined,
          endDate: o.fecha_fin ? new Date(o.fecha_fin) : undefined,
          isActive: o.estado === 'activa',
          temporada: o.temporada,
          prioridad: o.prioridad
        }));
        setOffers(mapped);
      })
      .catch(() => {
        setOffers([]);
      });

    // Obtener productos en oferta por caducidad
    fetch('http://localhost:3001/api/ofertas-caducidad')
      .then(res => res.json())
      .then(data => {
        setExpiryOffers(data);
      })
      .catch(() => {
        setExpiryOffers([]);
      });
  }, []);

  // Eliminar solo del estado (no elimina en la base de datos)
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
      return;
    }

    const previous = offers;
    // Optimista
    setOffers(offers.filter(o => String(o.id) !== String(id)));

    try {
      const res = await fetch(`http://localhost:3001/api/ofertas/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Error al eliminar en el servidor');
      }
    } catch (err) {
      // Revertir si falla
      setOffers(previous);
      alert('No se pudo eliminar la oferta. Inténtalo nuevamente.');
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

      {/* Panel de ofertas por caducidad */}
      <div className="card" style={{ marginBottom: '2rem', border: '2px solid #FFD700', background: '#FFFBEA' }}>
        <div className="card-header" style={{ background: '#FFF3CD' }}>
          <h3 className="card-title" style={{ color: '#B8860B' }}>
            <Clock size={20} style={{ marginRight: 8 }} />
            Productos en Oferta por Caducidad
          </h3>
        </div>
        {expiryOffers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#B8860B' }}>
            <Clock size={48} style={{ marginBottom: '1rem' }} />
            <h4>No hay productos próximos a caducar en oferta</h4>
          </div>
        ) : (
          <div className="offers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {expiryOffers.map((prod: any) => (
              <div key={prod.id_lote} className="offer-card" style={{ border: '2px solid #FFD700', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#FFFBEA', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <span className="badge badge-warning">Oferta Caducidad</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#B8860B', marginBottom: '0.5rem' }}>{prod.nombre} <span style={{ fontSize: '0.9rem', color: '#666' }}>({prod.marca})</span></h4>
                <div style={{ marginBottom: '0.5rem', color: '#666' }}>
                  <strong>Precio Oferta:</strong> ${Number(prod.precio_venta).toFixed(2)} <br />
                  <strong>Descuento:</strong> {prod.descuento_porcentaje}% <br />
                  <strong>Vence:</strong> {format(new Date(prod.fecha_vencimiento), 'dd/MM/yyyy')}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                  <strong>Precio Costo:</strong> ${Number(prod.precio_costo_unitario).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
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
