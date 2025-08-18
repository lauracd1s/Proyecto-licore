import React, { useEffect, useState } from 'react';
import { Tag, TrendingUp, Eye, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
// ...existing code...

const OfferAnalytics: React.FC = () => {
  // ...existing code...
  // Función para exportar los datos de análisis como CSV
  const handleExport = () => {
    const headers = ['Oferta', 'Visualizaciones', 'Conversiones', 'Ingresos'];
    const rows = offerPerformance.map(offer => [
      offer.name,
      offer.views,
      offer.conversions,
      offer.revenue
    ]);
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'analisis_ofertas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // Leer ofertas desde localStorage
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const storedOffers = localStorage.getItem('offers');
    if (storedOffers) {
      try {
        setOffers(JSON.parse(storedOffers));
      } catch {
        setOffers([]);
      }
    } else {
      setOffers([]);
    }
  }, []);


  // Simulación de datos de rendimiento (puedes adaptar según tu estructura real)
  const offerPerformance = offers.map((offer: any) => ({
    name: offer.title,
    views: offer.views || Math.floor(Math.random() * 2000 + 500),
    conversions: offer.conversions || Math.floor(Math.random() * 150 + 10),
    revenue: offer.revenue || Math.floor(Math.random() * 3000 + 500)
  }));


  // Agrupar tipos de oferta
  const typeColors: Record<string, string> = {
    descuento: '#272727',
    '2x1': '#D4AA7D',
    combo: '#EFD09F',
    '3x2': '#666666',
    precio_especial: '#8884d8'
  };
  const offerTypes = Object.entries(
    offers.reduce((acc: any, offer: any) => {
      acc[offer.type] = (acc[offer.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({
    type,
    count,
    color: typeColors[type] || '#8884d8'
  }));

  return (
    <div className="offer-analytics">
      <div className="page-header">
        <h1 className="page-title">
          <Tag size={28} />
          Análisis de Ofertas Más Exitosas
        </h1>
          <button className="btn btn-primary" onClick={handleExport}>
            Exportar Análisis
          </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{offers.filter((o: any) => o.isActive).length}</div>
          <div className="stat-label">Ofertas Activas</div>
          <div className="stat-growth positive">
            <TrendingUp size={16} />
            Rendimiento alto
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            ${offerPerformance.reduce((acc, o) => acc + o.revenue, 0).toLocaleString()}
          </div>
          <div className="stat-label">Ingresos por Ofertas</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Rendimiento de Ofertas</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={offerPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#272727" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tipos de Ofertas</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={offerTypes}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={(entry) => entry.type}
              >
                {offerTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

  {/* Tabla de ofertas más exitosas eliminada */}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Insights y Recomendaciones</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderLeft: '4px solid #272727',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#272727', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              Mejor Rendimiento
            </h4>
            <p style={{ color: '#666', lineHeight: '1.5' }}>
              Las ofertas de "Happy Hour" tienen la mejor tasa de conversión. 
              Considera ampliar estos horarios especiales a más días de la semana.
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderLeft: '4px solid #D4AA7D',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#D4AA7D', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={20} />
              Oportunidad
            </h4>
            <p style={{ color: '#666', lineHeight: '1.5' }}>
              Los combos tienen alta visualización pero baja conversión. 
              Revisa el precio o los productos incluidos para mejorar el atractivo.
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderLeft: '4px solid #EFD09F',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#272727', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} />
              Recomendación
            </h4>
            <p style={{ color: '#666', lineHeight: '1.5' }}>
              Las ofertas 2x1 en vinos han sido muy exitosas. 
              Considera aplicar esta estrategia a otras categorías premium.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferAnalytics;
