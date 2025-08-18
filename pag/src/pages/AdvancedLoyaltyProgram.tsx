import React, { useState } from 'react';
import { Star, Crown, Gift, TrendingUp, Award, Plus, Edit } from 'lucide-react';
import type { LoyaltyProgramDisplay, LoyaltyLevel, PointTransactionDisplay, CustomerDisplay } from '../types';

const AdvancedLoyaltyProgram: React.FC = () => {
  const [loyaltyProgram] = useState<LoyaltyProgramDisplay>({
    id: '1',
    name: 'Club VIP Licorería',
    description: 'Programa de fidelización con beneficios exclusivos',
    pointsPerDollar: 1,
    minimumPurchase: 10,
    rewardLevels: [
      {
        id: '1',
        name: 'Bronce',
        minPoints: 0,
        benefits: ['1% descuento', 'Ofertas especiales'],
        discountPercentage: 1,
        color: '#CD7F32'
      },
      {
        id: '2', 
        name: 'Plata',
        minPoints: 500,
        benefits: ['3% descuento', 'Envío gratis', 'Acceso prioritario'],
        discountPercentage: 3,
        color: '#C0C0C0'
      },
      {
        id: '3',
        name: 'Oro',
        minPoints: 1500,
        benefits: ['5% descuento', 'Cata gratuita', 'Atención VIP'],
        discountPercentage: 5,
        color: '#D4AA7D'
      },
      {
        id: '4',
        name: 'Platino',
        minPoints: 3000,
        benefits: ['8% descuento', 'Productos exclusivos', 'Eventos privados'],
        discountPercentage: 8,
        color: '#272727'
      }
    ],
    isActive: true,
    createdAt: new Date('2024-01-01')
  });

  const [recentTransactions] = useState<PointTransactionDisplay[]>([
    {
      id: '1',
      customerId: 'c1',
      type: 'earned',
      points: 150,
      description: 'Compra de whisky premium',
      date: new Date('2024-08-05'),
      orderId: 'ORD-001'
    },
    {
      id: '2',
      customerId: 'c2',
      type: 'redeemed',
      points: -200,
      description: 'Canje por descuento 10%',
      date: new Date('2024-08-04')
    },
    {
      id: '3',
      customerId: 'c1',
      type: 'earned',
      points: 75,
      description: 'Compra múltiple',
      date: new Date('2024-08-03'),
      orderId: 'ORD-002'
    }
  ]);

  const [topCustomers] = useState<CustomerDisplay[]>([
    {
      id: 'c1',
      name: 'María González',
      email: 'maria@email.com',
      phone: '+1234567890',
      address: 'Calle Principal 123',
      loyaltyPoints: 2850,
      totalPurchases: 0,
      membershipLevel: 'oro',
      isVip: true,
      registrationDate: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'c2',
      name: 'Carlos López',
      email: 'carlos@email.com',
      phone: '+1234567891',
      address: 'Avenida Central 456',
      loyaltyPoints: 1650,
      totalPurchases: 0,
      membershipLevel: 'plata',
      isVip: true,
      registrationDate: new Date('2024-02-20'),
      createdAt: new Date('2024-02-20')
    }
  ]);

  const getLoyaltyLevel = (points: number): LoyaltyLevel => {
    const level = loyaltyProgram.rewardLevels
      .slice()
      .reverse()
      .find(level => points >= level.minPoints);
    return level || loyaltyProgram.rewardLevels[0];
  };

  const getProgressToNextLevel = (points: number): { current: LoyaltyLevel, next: LoyaltyLevel | null, progress: number } => {
    const current = getLoyaltyLevel(points);
    const currentIndex = loyaltyProgram.rewardLevels.findIndex(l => l.id === current.id);
    const next = currentIndex < loyaltyProgram.rewardLevels.length - 1 
      ? loyaltyProgram.rewardLevels[currentIndex + 1] 
      : null;
    
    const progress = next 
      ? ((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100
      : 100;

    return { current, next, progress };
  };

  return (
    <div className="advanced-loyalty-program">
      <div className="page-header">
        <h1 className="page-title">
          <Crown size={28} />
          Programa de Fidelización Avanzado
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline">
            <Edit size={16} />
            Configurar Programa
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            Nuevo Nivel
          </button>
        </div>
      </div>

      {/* Estadísticas del Programa */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{loyaltyProgram.rewardLevels.length}</div>
          <div className="stat-label">Niveles de Recompensa</div>
          <div className="stat-growth positive">
            <TrendingUp size={16} />
            Programa activo
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{topCustomers.filter(c => c.isVip).length}</div>
          <div className="stat-label">Miembros VIP</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{loyaltyProgram.pointsPerDollar}x</div>
          <div className="stat-label">Puntos por Dólar</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {topCustomers.reduce((sum, customer) => sum + customer.loyaltyPoints, 0).toLocaleString()}
          </div>
          <div className="stat-label">Puntos Totales Activos</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Niveles de Fidelización */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Niveles del Programa</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loyaltyProgram.rewardLevels.map((level, index) => (
              <div key={level.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: level.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  color: level.color === '#D4AA7D' || level.color === '#C0C0C0' ? '#000' : '#fff'
                }}>
                  {index === 0 && <Award size={20} />}
                  {index === 1 && <Star size={20} />}
                  {index === 2 && <Crown size={20} />}
                  {index === 3 && <Gift size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: '0', color: level.color, fontWeight: '600' }}>{level.name}</h4>
                    <span className="badge badge-secondary">{level.discountPercentage}% descuento</span>
                  </div>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
                    Desde {level.minPoints.toLocaleString()} puntos
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {level.benefits.map((benefit, idx) => (
                      <span key={idx} className="badge badge-outline" style={{ fontSize: '0.75rem' }}>
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clientes VIP */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Clientes VIP</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topCustomers.map((customer, index) => {
              const { current, next, progress } = getProgressToNextLevel(customer.loyaltyPoints);
              return (
                <div key={customer.id} style={{
                  padding: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: current.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      color: current.color === '#D4AA7D' || current.color === '#C0C0C0' ? '#000' : '#fff'
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{customer.name}</div>
                      <div style={{ fontSize: '0.75rem', color: current.color }}>{current.name}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span>{customer.loyaltyPoints.toLocaleString()} puntos</span>
                      {next && <span>Próximo: {next.name}</span>}
                    </div>
                    {next && (
                      <div style={{
                        height: '4px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        marginTop: '0.25rem'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: next.color,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transacciones Recientes */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Transacciones de Puntos Recientes</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Puntos</th>
                <th>Descripción</th>
                <th>Orden</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{new Intl.DateTimeFormat('es-ES').format(transaction.date)}</td>
                  <td>
                    {topCustomers.find(c => c.id === transaction.customerId)?.name || 'Cliente'}
                  </td>
                  <td>
                    <span className={`badge ${
                      transaction.type === 'earned' ? 'badge-success' :
                      transaction.type === 'redeemed' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {transaction.type === 'earned' ? 'Ganados' :
                       transaction.type === 'redeemed' ? 'Canjeados' : 'Expirados'}
                    </span>
                  </td>
                  <td style={{ 
                    fontWeight: '600',
                    color: transaction.points > 0 ? '#28a745' : '#dc3545'
                  }}>
                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                  </td>
                  <td>{transaction.description}</td>
                  <td>
                    {transaction.orderId && (
                      <span className="badge badge-outline">{transaction.orderId}</span>
                    )}
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

export default AdvancedLoyaltyProgram;
