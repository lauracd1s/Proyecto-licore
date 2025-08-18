import React from 'react';
import { Star, Gift, Trophy, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LoyaltyProgram: React.FC = () => {
  const { customers } = useApp();

  const loyaltyLevels = [
    { name: 'Bronce', minPurchases: 0, benefits: ['5% descuento en cumpleaños', 'Puntos básicos'], icon: Trophy, color: '#CD7F32' },
    { name: 'Plata', minPurchases: 500, benefits: ['10% descuento permanente', '2x puntos en ofertas'], icon: Star, color: '#C0C0C0' },
    { name: 'Oro', minPurchases: 1500, benefits: ['15% descuento', 'Ofertas exclusivas', 'Envío gratis'], icon: Gift, color: '#FFD700' },
    { name: 'Premium', minPurchases: 3000, benefits: ['20% descuento', 'Acceso VIP', 'Productos exclusivos'], icon: Crown, color: '#8B0000' }
  ];

  return (
    <div className="loyalty-program">
      <div className="page-header">
        <h1 className="page-title">
          <Star size={28} />
          Programa de Fidelización
        </h1>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Niveles de Membresía</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {loyaltyLevels.map((level) => {
            const Icon = level.icon;
            const membersCount = customers.filter(c => c.membershipLevel === level.name.toLowerCase()).length;
            
            return (
              <div key={level.name} style={{
                padding: '2rem',
                border: `3px solid ${level.color}`,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${level.color}15, ${level.color}05)`,
                textAlign: 'center'
              }}>
                <Icon size={48} color={level.color} />
                <h3 style={{ marginTop: '1rem', color: level.color, fontSize: '1.5rem' }}>
                  {level.name}
                </h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  Compras mínimas: ${level.minPurchases}
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ 
                    background: level.color, 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {membersCount} miembros
                  </span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: level.color }}>Beneficios:</h4>
                  <ul style={{ color: '#666', fontSize: '0.9rem' }}>
                    {level.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Estadísticas del Programa</h3>
        </div>
        
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-value">
              {((customers.filter(c => c.loyaltyPoints > 0).length / customers.length) * 100).toFixed(1)}%
            </div>
            <div className="stat-label">Participación</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {(customers.reduce((sum, c) => sum + c.loyaltyPoints, 0) / customers.length || 0).toFixed(0)}
            </div>
            <div className="stat-label">Puntos Promedio</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {customers.filter(c => ['oro', 'premium'].includes(c.membershipLevel)).length}
            </div>
            <div className="stat-label">Clientes VIP</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ${(customers.filter(c => c.membershipLevel === 'premium').reduce((sum, c) => sum + c.totalPurchases, 0) || 0).toFixed(0)}
            </div>
            <div className="stat-label">Ingresos Premium</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top 10 Clientes por Puntos</h3>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Cliente</th>
                <th>Puntos</th>
                <th>Nivel</th>
                <th>Total Compras</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
                .slice(0, 10)
                .map((customer, index) => (
                  <tr key={customer.id}>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: index < 3 ? '#FFD700' : '#8B4513',
                        color: 'white',
                        fontWeight: '700'
                      }}>
                        {index + 1}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600' }}>{customer.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{customer.email}</div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={16} color="#FFD700" />
                        {customer.loyaltyPoints} puntos
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${
                        customer.membershipLevel === 'premium' ? 'danger' :
                        customer.membershipLevel === 'oro' ? 'warning' :
                        customer.membershipLevel === 'plata' ? 'info' : 'success'
                      }`}>
                        {customer.membershipLevel.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      ${customer.totalPurchases.toFixed(2)}
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

export default LoyaltyProgram;
