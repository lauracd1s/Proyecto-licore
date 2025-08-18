import React, { useState } from 'react';
import { TrendingUp, BarChart3, Users, DollarSign, Target, Award, Download } from 'lucide-react';
import type { OfferDisplay } from '../types';

const AdvancedOfferAnalytics: React.FC = () => {
  const [offers] = useState<OfferDisplay[]>([
    {
      id: '1',
      title: 'Descuento 20% Whisky Premium',
      description: 'Descuento especial en whiskies seleccionados',
      type: 'descuento',
      discount: 20,
      discountType: 'percentage',
      discountValue: 20,
      productIds: ['p1'],
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-08-15'),
      isActive: true,
      image: '/offer1.jpg',
      terms: 'Términos y condiciones',
      conditions: 'Compra mínima $100',
      targetAudience: 'premium',
      maxRedemptions: 100,
      currentRedemptions: 85,
      createdAt: new Date('2024-07-25')
    },
    {
      id: '2',
      title: '2x1 en Cervezas',
      description: 'Llevate 2 cervezas por el precio de 1',
      type: '2x1',
      discount: 50,
      discountType: 'fixed',
      discountValue: 8.50,
      productIds: ['p2'],
      startDate: new Date('2024-08-05'),
      endDate: new Date('2024-08-20'),
      isActive: true,
      image: '/offer2.jpg',
      terms: 'Términos y condiciones',
      conditions: 'Aplica solo fines de semana',
      targetAudience: 'general',
      maxRedemptions: 200,
      currentRedemptions: 45,
      createdAt: new Date('2024-07-30')
    },
    {
      id: '3',
      title: 'Happy Hour Gin & Tonic',
      description: '30% descuento en ginebras premium',
      type: 'descuento',
      discount: 30,
      discountType: 'percentage',
      discountValue: 30,
      productIds: ['p3'],
      startDate: new Date('2024-07-20'),
      endDate: new Date('2024-07-31'),
      isActive: false,
      image: '/offer3.jpg',
      terms: 'Términos y condiciones',
      conditions: 'De 5pm a 8pm',
      targetAudience: 'premium',
      maxRedemptions: 50,
      currentRedemptions: 50,
      createdAt: new Date('2024-07-15')
    }
  ]);

  // Datos simulados de ventas relacionadas con ofertas
  const offerSales = [
    { offerId: '1', revenue: 4250.00, units: 85, conversionRate: 12.5, avgTicket: 50.00 },
    { offerId: '2', revenue: 382.50, units: 45, conversionRate: 8.2, avgTicket: 8.50 },
    { offerId: '3', revenue: 1875.00, units: 50, conversionRate: 18.7, avgTicket: 37.50 }
  ];

  // Métricas de performance por categoría de audiencia
  const audienceMetrics = [
    { audience: 'premium', offers: 2, totalRevenue: 6125.00, avgConversion: 15.6, customerCount: 65 },
    { audience: 'general', offers: 1, totalRevenue: 382.50, avgConversion: 8.2, customerCount: 45 }
  ];

  // ROI y efectividad por tipo de descuento
  const discountTypeAnalysis = [
    { type: 'percentage', offers: 2, avgROI: 340, avgConversion: 15.6, totalRevenue: 6125.00 },
    { type: 'fixed', offers: 1, avgROI: 280, avgConversion: 8.2, totalRevenue: 382.50 }
  ];

  const getOfferPerformance = (offer: OfferDisplay) => {
    const performance = offerSales.find(s => s.offerId === offer.id);
    return performance || { revenue: 0, units: 0, conversionRate: 0, avgTicket: 0 };
  };

  const getCompletionRate = (offer: OfferDisplay): number => {
    if (!offer.maxRedemptions) return 0;
    return (offer.currentRedemptions / offer.maxRedemptions) * 100;
  };

  const getEffectivenessLevel = (conversionRate: number): 'low' | 'medium' | 'high' => {
    if (conversionRate >= 15) return 'high';
    if (conversionRate >= 10) return 'medium';
    return 'low';
  };

  const totalRevenue = offerSales.reduce((sum, sale) => sum + sale.revenue, 0);
  const totalUnits = offerSales.reduce((sum, sale) => sum + sale.units, 0);
  const avgConversionRate = offerSales.reduce((sum, sale) => sum + sale.conversionRate, 0) / offerSales.length;

  const [dateRange, setDateRange] = useState('current');
  const [audienceFilter, setAudienceFilter] = useState('all');

  return (
    <div className="advanced-offer-analytics">
      <div className="page-header">
        <h1 className="page-title">
          <BarChart3 size={28} />
          Análisis Avanzado de Ofertas
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            className="form-control"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="current">Ofertas Actuales</option>
            <option value="last30">Últimos 30 días</option>
            <option value="last60">Últimos 60 días</option>
            <option value="quarter">Este Trimestre</option>
          </select>
          <select 
            className="form-control"
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="all">Todas las Audiencias</option>
            <option value="premium">Premium</option>
            <option value="general">General</option>
            <option value="loyalty">Fidelización</option>
          </select>
          <button className="btn btn-outline">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">${totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
          <div className="stat-label">Revenue Total</div>
          <div className="stat-growth positive">
            <TrendingUp size={16} />
            +24.5% vs mes anterior
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalUnits.toLocaleString()}</div>
          <div className="stat-label">Unidades Vendidas</div>
          <div className="stat-growth positive">
            <TrendingUp size={16} />
            +18.2% vs mes anterior
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgConversionRate.toFixed(1)}%</div>
          <div className="stat-label">Tasa Conversión Prom.</div>
          <div className="stat-growth positive">
            <TrendingUp size={16} />
            +3.1% vs mes anterior
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{offers.filter(o => o.isActive).length}</div>
          <div className="stat-label">Ofertas Activas</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Performance por Oferta */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Performance por Oferta</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Oferta</th>
                  <th>Estado</th>
                  <th>Conversión</th>
                  <th>Revenue</th>
                  <th>Unidades</th>
                  <th>Completion Rate</th>
                  <th>Efectividad</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(offer => {
                  const performance = getOfferPerformance(offer);
                  const completionRate = getCompletionRate(offer);
                  const effectiveness = getEffectivenessLevel(performance.conversionRate);
                  
                  return (
                    <tr key={offer.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: '600', color: '#272727' }}>{offer.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            {offer.targetAudience} • {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${offer.isActive ? 'badge-success' : 'badge-secondary'}`}>
                          {offer.isActive ? 'Activa' : 'Finalizada'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {performance.conversionRate.toFixed(1)}%
                      </td>
                      <td style={{ fontWeight: '600', color: '#D4AA7D' }}>
                        ${performance.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{performance.units}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '60px',
                            height: '6px',
                            backgroundColor: '#e9ecef',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${Math.min(completionRate, 100)}%`,
                              height: '100%',
                              backgroundColor: completionRate >= 90 ? '#28a745' : completionRate >= 70 ? '#ffc107' : '#17a2b8',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                            {completionRate.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          effectiveness === 'high' ? 'badge-success' :
                          effectiveness === 'medium' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {effectiveness === 'high' ? 'Alta' :
                           effectiveness === 'medium' ? 'Media' : 'Baja'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Análisis por Audiencia */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Performance por Audiencia</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {audienceMetrics.map(metric => (
              <div key={metric.audience} style={{
                padding: '1.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ 
                    textTransform: 'capitalize', 
                    color: '#272727',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    {metric.audience}
                  </h4>
                  <span className="badge badge-outline">
                    {metric.offers} ofertas
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                      Revenue Total
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#D4AA7D' }}>
                      ${metric.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                      Conversión Promedio
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#272727' }}>
                      {metric.avgConversion.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={14} color="#666" />
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>
                      {metric.customerCount} clientes únicos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Análisis por Tipo de Descuento */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Análisis por Tipo de Descuento</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {discountTypeAnalysis.map(analysis => (
            <div key={analysis.type} style={{
              padding: '2rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '2px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: analysis.type === 'percentage' ? '#D4AA7D' : '#EFD09F',
                  borderRadius: '8px'
                }}>
                  <Target size={24} color="#272727" />
                </div>
                <div>
                  <h4 style={{ color: '#272727', fontSize: '1.1rem', fontWeight: '600' }}>
                    {analysis.type === 'percentage' ? 'Descuento Porcentual' : 'Descuento Fijo'}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                    {analysis.offers} ofertas activas
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                    ROI Promedio
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#28a745' }}>
                    {analysis.avgROI}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                    Conversión
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#272727' }}>
                    {analysis.avgConversion.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={14} color="#666" />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    Revenue: ${analysis.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={14} color="#666" />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    Efectividad: {analysis.avgConversion >= 15 ? 'Alta' : analysis.avgConversion >= 10 ? 'Media' : 'Baja'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones de Optimización */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recomendaciones de Optimización</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            border: '1px solid #b3d9ff'
          }}>
            <h4 style={{ color: '#0056b3', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              Mejores Performers
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#004085', marginBottom: '1rem' }}>
              Las ofertas premium tienen 90% más conversión. Considera aumentar el presupuesto en este segmento.
            </p>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              Basado en análisis de últimos 60 días
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffc107'
          }}>
            <h4 style={{ color: '#856404', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              Oportunidades de Mejora
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#856404', marginBottom: '1rem' }}>
              Ofertas 2x1 tienen baja conversión los días laborables. Prueba restricciones temporales.
            </p>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              Sugerencia: Horario peak 5-8pm
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#d1ecf1',
            borderRadius: '8px',
            border: '1px solid #bee5eb'
          }}>
            <h4 style={{ color: '#0c5460', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              Nuevas Oportunidades
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#0c5460', marginBottom: '1rem' }}>
              Considera ofertas estacionales para vodkas. Histórico muestra +40% demanda en invierno.
            </p>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              Temporada ideal: Junio - Agosto
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedOfferAnalytics;
