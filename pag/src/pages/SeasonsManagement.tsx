import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Palette } from 'lucide-react';
import type { SeasonDisplay } from '../types';

const SeasonsManagement: React.FC = () => {
  const [seasons, setSeasons] = useState<SeasonDisplay[]>([
    {
      id: '1',
      name: 'Navidad y Año Nuevo',
      description: 'Temporada festiva de fin de año',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2025-01-07'),
      isActive: true,
      color: '#D4AA7D'
    },
    {
      id: '2', 
      name: 'Verano',
      description: 'Temporada de calor y vacaciones',
      startDate: new Date('2024-06-21'),
      endDate: new Date('2024-09-21'),
      isActive: false,
      color: '#EFD09F'
    },
    {
      id: '3',
      name: 'Día de San Valentín',
      description: 'Promociones románticas',
      startDate: new Date('2024-02-10'),
      endDate: new Date('2024-02-18'),
      isActive: false,
      color: '#272727'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState<SeasonDisplay | null>(null);

  const handleEdit = (season: SeasonDisplay) => {
    setEditingSeason(season);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta temporada?')) {
      setSeasons(seasons.filter(s => s.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setSeasons(seasons.map(season => 
      season.id === id ? { ...season, isActive: !season.isActive } : season
    ));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="seasons-management">
      <div className="page-header">
        <h1 className="page-title">
          <Calendar size={28} />
          Gestión de Temporadas
        </h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          Nueva Temporada
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{seasons.filter(s => s.isActive).length}</div>
          <div className="stat-label">Temporadas Activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{seasons.length}</div>
          <div className="stat-label">Total Temporadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {seasons.filter(s => getDaysRemaining(s.endDate) > 0 && getDaysRemaining(s.endDate) <= 30).length}
          </div>
          <div className="stat-label">Próximas a Vencer</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Lista de Temporadas</h3>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Temporada</th>
                <th>Período</th>
                <th>Duración</th>
                <th>Estado</th>
                <th>Días Restantes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map(season => {
                const daysRemaining = getDaysRemaining(season.endDate);
                return (
                  <tr key={season.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div 
                          style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: season.color,
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 0 0 1px #ddd'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: '600' }}>{season.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            {season.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ fontSize: '0.9rem' }}>
                          <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                          {formatDate(season.startDate)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          hasta {formatDate(season.endDate)}
                        </div>
                      </div>
                    </td>
                    <td>
                      {Math.ceil((season.endDate.getTime() - season.startDate.getTime()) / (1000 * 60 * 60 * 24))} días
                    </td>
                    <td>
                      <button
                        className={`badge ${season.isActive ? 'badge-success' : 'badge-secondary'}`}
                        onClick={() => toggleStatus(season.id)}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {season.isActive ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${
                        daysRemaining < 0 ? 'badge-danger' :
                        daysRemaining <= 7 ? 'badge-warning' :
                        daysRemaining <= 30 ? 'badge-info' : 'badge-secondary'
                      }`}>
                        {daysRemaining < 0 ? 'Vencida' :
                         daysRemaining === 0 ? 'Hoy' :
                         `${daysRemaining} días`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => handleEdit(season)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(season.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingSeason ? 'Editar Temporada' : 'Nueva Temporada'}</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingSeason(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre de la Temporada</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Ej: Navidad y Año Nuevo"
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  className="form-control"
                  placeholder="Descripción de la temporada"
                  rows={3}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input type="date" className="form-control" />
                </div>
                <div className="form-group">
                  <label>Fecha de Fin</label>
                  <input type="date" className="form-control" />
                </div>
              </div>
              <div className="form-group">
                <label>Color de Identificación</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Palette size={16} color="#666" />
                  <input type="color" className="form-control" style={{ width: '60px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    Selecciona un color para identificar la temporada
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                  Activar temporada inmediatamente
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary">
                {editingSeason ? 'Actualizar' : 'Crear'} Temporada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonsManagement;
