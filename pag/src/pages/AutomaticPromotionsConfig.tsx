import React, { useState } from 'react';
import { Clock, Target, Settings, Plus, Play, Pause, Edit3, Zap } from 'lucide-react';
import type { Promotion } from '../types';

const AutomaticPromotionsConfig: React.FC = () => {
  const [promotions] = useState<Promotion[]>([
    {
      id: '1',
      name: 'Happy Hour Viernes',
      type: 'happy_hour',
      schedule: {
        days: ['viernes'],
        startTime: '17:00',
        endTime: '20:00'
      },
      isActive: true,
      productIds: ['p1', 'p3'],
      discountPercentage: 25,
      createdAt: new Date('2024-07-01')
    },
    {
      id: '2', 
      name: 'Combo Fin de Semana',
      type: 'combo',
      schedule: {
        days: ['sábado', 'domingo'],
        startTime: '00:00',
        endTime: '23:59'
      },
      isActive: true,
      productIds: ['p2', 'p4'],
      discountPercentage: 15,
      createdAt: new Date('2024-07-10')
    },
    {
      id: '3',
      name: 'Descuento Premium Miércoles',
      type: 'descuento',
      schedule: {
        days: ['miércoles'],
        startTime: '12:00',
        endTime: '18:00'
      },
      isActive: false,
      productIds: ['p1'],
      discountPercentage: 20,
      createdAt: new Date('2024-06-15')
    }
  ]);

  // Configuraciones automáticas adicionales
  const [automaticRules] = useState([
    {
      id: '1',
      name: 'Activación por Stock Bajo',
      trigger: 'low_stock',
      condition: 'stock < 15%',
      action: 'activate_discount',
      discount: 10,
      products: ['p1', 'p2'],
      isActive: true,
      description: 'Activa descuento cuando el stock esté por debajo del 15%'
    },
    {
      id: '2',
      name: 'Promoción Cliente VIP',
      trigger: 'customer_tier',
      condition: 'tier = premium',
      action: 'special_pricing',
      discount: 20,
      products: ['p1', 'p3'],
      isActive: true,
      description: 'Descuentos exclusivos para clientes premium'
    },
    {
      id: '3',
      name: 'Promoción por Temporada',
      trigger: 'seasonal',
      condition: 'season = winter',
      action: 'bundle_offer',
      discount: 25,
      products: ['p2', 'p4'],
      isActive: false,
      description: 'Ofertas especiales durante temporada de invierno'
    }
  ]);

  const getRulePriority = (trigger: string): 'high' | 'medium' | 'low' => {
    if (trigger === 'low_stock') return 'high';
    if (trigger === 'customer_tier') return 'medium';
    return 'low';
  };

  const formatSchedule = (schedule: Promotion['schedule']): string => {
    const days = schedule.days.join(', ');
    return `${days} de ${schedule.startTime} a ${schedule.endTime}`;
  };

  const getPromotionStatus = (promotion: Promotion): 'active' | 'scheduled' | 'inactive' => {
    if (!promotion.isActive) return 'inactive';
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('es-ES', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    const isToday = promotion.schedule.days.includes(currentDay);
    const isInTimeRange = currentTime >= promotion.schedule.startTime && currentTime <= promotion.schedule.endTime;
    
    if (isToday && isInTimeRange) return 'active';
    return 'scheduled';
  };

  return (
    <div className="automatic-promotions-config">
      <div className="page-header">
        <h1 className="page-title">
          <Zap size={28} />
          Promociones Automáticas
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-outline"
          >
            <Plus size={16} />
            Nueva Promoción
          </button>
          <button className="btn btn-primary">
            <Settings size={16} />
            Configurar Reglas
          </button>
        </div>
      </div>

      {/* Estadísticas de Promociones */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">
            {promotions.filter(p => getPromotionStatus(p) === 'active').length}
          </div>
          <div className="stat-label">Activas Ahora</div>
          <div className="stat-growth positive">
            <Play size={16} />
            En ejecución
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {promotions.filter(p => p.isActive).length}
          </div>
          <div className="stat-label">Total Programadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {automaticRules.filter(r => r.isActive).length}
          </div>
          <div className="stat-label">Reglas Automáticas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">15.2%</div>
          <div className="stat-label">Incremento Ventas</div>
          <div className="stat-growth positive">
            <Target size={16} />
            vs mes anterior
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Promociones Programadas */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Promociones Programadas</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {promotions.map(promotion => {
              const status = getPromotionStatus(promotion);
              return (
                <div 
                  key={promotion.id}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    backgroundColor: status === 'active' ? '#f8fff9' : '#ffffff',
                    borderLeft: `4px solid ${status === 'active' ? '#28a745' : status === 'scheduled' ? '#17a2b8' : '#6c757d'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ color: '#272727', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                          {promotion.name}
                        </h4>
                        <span className={`badge ${
                          status === 'active' ? 'badge-success' :
                          status === 'scheduled' ? 'badge-info' : 'badge-secondary'
                        }`}>
                          {status === 'active' ? 'Activa' :
                           status === 'scheduled' ? 'Programada' : 'Inactiva'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Clock size={14} color="#666" />
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {formatSchedule(promotion.schedule)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Target size={14} color="#666" />
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          Descuento {promotion.discountPercentage}% • {promotion.productIds.length} productos
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm btn-outline">
                        <Edit3 size={14} />
                      </button>
                      <button className={`btn btn-sm ${promotion.isActive ? 'btn-warning' : 'btn-success'}`}>
                        {promotion.isActive ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Detalles del tipo de promoción */}
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <span style={{ color: '#666', fontWeight: '600' }}>Tipo:</span>
                        <div style={{ textTransform: 'capitalize' }}>{promotion.type.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span style={{ color: '#666', fontWeight: '600' }}>Productos:</span>
                        <div>{promotion.productIds.length} seleccionados</div>
                      </div>
                      <div>
                        <span style={{ color: '#666', fontWeight: '600' }}>Creada:</span>
                        <div>{new Intl.DateTimeFormat('es-ES').format(promotion.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendario de Activaciones */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Próximas Activaciones</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { day: 'Hoy', time: '17:00', promo: 'Happy Hour Viernes', status: 'pending' },
              { day: 'Mañana', time: '00:00', promo: 'Combo Fin de Semana', status: 'scheduled' },
              { day: 'Sábado', time: '12:00', promo: 'Promoción Weekend', status: 'scheduled' },
              { day: 'Domingo', time: '18:00', promo: 'Cierre Domingo', status: 'scheduled' }
            ].map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                backgroundColor: item.status === 'pending' ? '#fff3cd' : '#f8f9fa',
                borderRadius: '6px',
                border: `1px solid ${item.status === 'pending' ? '#ffc107' : '#e9ecef'}`
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: item.status === 'pending' ? '#ffc107' : '#6c757d'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#272727' }}>
                    {item.promo}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {item.day} a las {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reglas Automáticas */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Reglas de Activación Automática</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {automaticRules.map(rule => {
            const priority = getRulePriority(rule.trigger);
            return (
              <div key={rule.id} style={{
                padding: '1.5rem',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                backgroundColor: rule.isActive ? '#ffffff' : '#f8f9fa',
                borderLeft: `4px solid ${
                  priority === 'high' ? '#dc3545' :
                  priority === 'medium' ? '#ffc107' : '#28a745'
                }`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#272727', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                      {rule.name}
                    </h4>
                    <span className={`badge badge-${priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'success'}`}>
                      Prioridad {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                  <span className={`badge ${rule.isActive ? 'badge-success' : 'badge-secondary'}`}>
                    {rule.isActive ? 'Activa' : 'Pausada'}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                    {rule.description}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#666', fontWeight: '600' }}>Condición:</span>
                    <div style={{ color: '#272727', fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: '0.25rem 0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                      {rule.condition}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontWeight: '600' }}>Acción:</span>
                    <div style={{ color: '#272727', marginTop: '0.25rem' }}>
                      {rule.action.replace('_', ' ')} {rule.discount}%
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontWeight: '600' }}>Productos:</span>
                    <div style={{ color: '#272727', marginTop: '0.25rem' }}>
                      {rule.products.length} seleccionados
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontWeight: '600' }}>Trigger:</span>
                    <div style={{ color: '#272727', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                      {rule.trigger.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance de Promociones Automáticas */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Performance de Promociones Automáticas</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Promoción</th>
                <th>Activaciones</th>
                <th>Conversión</th>
                <th>Revenue</th>
                <th>ROI</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Happy Hour Viernes', activations: 12, conversion: 18.5, revenue: 2450.00, roi: 340, active: true },
                { name: 'Combo Fin de Semana', activations: 8, conversion: 12.3, revenue: 1876.50, roi: 280, active: true },
                { name: 'Stock Bajo Auto', activations: 15, conversion: 8.7, revenue: 945.20, roi: 190, active: true },
                { name: 'Cliente VIP', activations: 25, conversion: 22.1, revenue: 3120.75, roi: 420, active: true }
              ].map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: '600' }}>{item.name}</td>
                  <td>{item.activations}</td>
                  <td style={{ fontWeight: '600' }}>{item.conversion}%</td>
                  <td style={{ fontWeight: '600', color: '#D4AA7D' }}>
                    ${item.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ 
                    fontWeight: '600', 
                    color: item.roi >= 300 ? '#28a745' : item.roi >= 200 ? '#ffc107' : '#dc3545'
                  }}>
                    {item.roi}%
                  </td>
                  <td>
                    <span className={`badge ${item.active ? 'badge-success' : 'badge-secondary'}`}>
                      {item.active ? 'Activa' : 'Pausada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AutomaticPromotionsConfig;
