import React, { useState } from 'react';
import { Users, Plus, Edit, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CustomerManagement: React.FC = () => {
  const { customers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMembershipColor = (level: string) => {
    const colors = {
      'bronce': 'warning',
      'plata': 'info',
      'oro': 'success',
      'premium': 'danger'
    };
    return colors[level as keyof typeof colors] || 'info';
  };

  return (
    <div className="customer-management">
      <div className="page-header">
        <h1 className="page-title">
          <Users size={28} />
          Gestión de Clientes
        </h1>
        <button className="btn btn-primary">
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-value">{customers.length}</div>
          <div className="stat-label">Total Clientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{customers.filter(c => c.membershipLevel === 'premium').length}</div>
          <div className="stat-label">Clientes Premium</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{customers.filter(c => c.membershipLevel === 'oro').length}</div>
          <div className="stat-label">Clientes Oro</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            ${(customers.reduce((sum, c) => sum + c.totalPurchases, 0) / customers.length || 0).toFixed(2)}
          </div>
          <div className="stat-label">Compra Promedio</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Lista de Clientes</h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#666' 
            }} />
            <input
              type="text"
              className="form-input"
              placeholder="Buscar clientes..."
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Nivel de Membresía</th>
                <th>Puntos Lealtad</th>
                <th>Total Compras</th>
                <th>Última Compra</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600' }}>{customer.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {customer.email}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${getMembershipColor(customer.membershipLevel)}`}>
                      {customer.membershipLevel.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    {customer.loyaltyPoints} puntos
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    ${customer.totalPurchases.toFixed(2)}
                  </td>
                  <td>
                    {customer.lastPurchase 
                      ? customer.lastPurchase.toLocaleDateString()
                      : 'Sin compras'
                    }
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '0.5rem' }}>
                      <Edit size={16} />
                    </button>
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

export default CustomerManagement;
