
import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

const PromotionCalendar: React.FC = () => {
  // Ofertas y temporadas desde el backend
  const [offers, setOffers] = React.useState<any[]>([]);
  const [seasons, setSeasons] = React.useState<any[]>([]);
  const [currentDate, setCurrentDate] = React.useState(new Date());

  React.useEffect(() => {
    // Obtener ofertas
    fetch('http://localhost:3001/api/ofertas')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((o: any) => ({
          id: o.id_oferta,
          title: o.nombre,
          description: o.descripcion,
          startDate: o.fecha_inicio ? new Date(o.fecha_inicio) : undefined,
          endDate: o.fecha_fin ? new Date(o.fecha_fin) : undefined,
          isActive: o.estado === 'activa',
          temporada: o.temporada,
          id_temporada: o.id_temporada
        }));
        setOffers(mapped);
      });
    // Obtener temporadas
    fetch('http://localhost:3001/api/temporadas')
      .then(res => res.json())
      .then(data => {
        setSeasons(data);
      });
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Buscar temporada por id
  const getSeasonById = (id: number) => seasons.find((s: any) => s.id_temporada === id);

  // Ofertas activas para un día
  const getOffersForDate = (date: Date) => {
    return offers.filter(offer =>
      offer.isActive &&
      offer.startDate && offer.endDate &&
      date >= offer.startDate &&
      date <= offer.endDate
    );
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  return (
    <div className="promotion-calendar">
      <div className="page-header">
        <h1 className="page-title">
          <CalendarIcon size={28} />
          Calendario de Promociones
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={prevMonth} className="btn btn-outline">
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ minWidth: '200px', textAlign: 'center', color: '#8B4513' }}>
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={nextMonth} className="btn btn-outline">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
          {/* Headers de días */}
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} style={{
              padding: '1rem',
              backgroundColor: '#D4AA7D',
              color: 'white',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {day}
            </div>
          ))}

          {/* Días del calendario */}
          {monthDays.map(day => {
            const dayOffers = getOffersForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div key={day.toISOString()} style={{
                minHeight: '120px',
                padding: '0.5rem',
                backgroundColor: isCurrentMonth ? 'white' : '#f9f9f9',
                border: isToday ? '2px solid #DAA520' : '1px solid #E0E0E0',
                position: 'relative'
              }}>
                <div style={{
                  fontWeight: isToday ? '700' : '500',
                  color: isCurrentMonth ? '#2C2C2C' : '#999',
                  marginBottom: '0.5rem'
                }}>
                  {format(day, 'd')}
                </div>

                {dayOffers.map((offer) => {
                  const season = offer.id_temporada ? getSeasonById(offer.id_temporada) : null;
                  return (
                    <div key={offer.id} style={{
                      fontSize: '0.7rem',
                      backgroundColor: season ? season.color_tema : '#8B4513',
                      color: 'white',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}>
                      {offer.title} {season ? `(${season.nombre})` : ''}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda de ofertas activas */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Ofertas Activas Este Mes</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {offers.filter(offer => offer.isActive).map(offer => {
            const season = offer.id_temporada ? getSeasonById(offer.id_temporada) : null;
            return (
              <div key={offer.id} style={{
                padding: '1rem',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                backgroundColor: season ? season.color_tema + '22' : '#f9f9f9'
              }}>
                <h4 style={{ color: season ? season.color_tema : '#8B4513', marginBottom: '0.5rem' }}>{offer.title}</h4>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                  {offer.description}
                </p>
                {season && (
                  <p style={{ fontSize: '0.8rem', color: season.color_tema }}>
                    {season.nombre}: {season.descripcion}
                  </p>
                )}
                <p style={{ fontSize: '0.8rem', color: season ? season.color_tema : '#8B4513' }}>
                  {format(offer.startDate, 'dd/MM/yyyy')} - {format(offer.endDate, 'dd/MM/yyyy')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PromotionCalendar;
