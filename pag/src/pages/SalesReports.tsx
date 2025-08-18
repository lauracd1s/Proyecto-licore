import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, DollarSign, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useApp } from '../context/AppContext';

// Definir interfaces para tipos específicos
interface MonthData {
  month: string;
  year: number;
  revenue: number;
}

interface ProcessedData {
  dailySales: { day: string; sales: number; orders: number; }[];
  paymentMethods: { method: string; count: number; percentage: number; }[];
  monthlyTrend: { month: string; revenue: number; }[];
  salesByCategory: { category: string; amount: number; orders: number; items: number; percentage: number; }[];
  totalRevenue: number;
  averageTicket: number;
  completedOrders: number;
  totalOrdersThisMonth: number;
  periodUsed: string;
}

const SalesReports: React.FC = () => {
  const { sales } = useApp();

  // Procesar datos reales para las gráficas
  const processedData = useMemo((): ProcessedData => {
    // Ventas por día de la semana
    const dailySalesData = () => {
      const daysMap: { [key: number]: string } = {
        0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 
        4: 'Jue', 5: 'Vie', 6: 'Sáb'
      };
      
      const salesByDay = sales.reduce((acc, sale) => {
        if (sale.status === 'completada') {
          const day = new Date(sale.createdAt).getDay();
          const dayName = daysMap[day];
          
          if (!acc[dayName]) {
            acc[dayName] = { day: dayName, sales: 0, orders: 0 };
          }
          
          acc[dayName].sales += sale.total;
          acc[dayName].orders += 1;
        }
        return acc;
      }, {} as Record<string, { day: string; sales: number; orders: number }>);
      
      // Asegurar que todos los días estén presentes
      const allDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      return allDays.map(day => salesByDay[day] || { day, sales: 0, orders: 0 });
    };

    // Métodos de pago
    const paymentMethodsData = () => {
      const completedSales = sales.filter(s => s.status === 'completada');
      const methodCounts = completedSales.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return ['efectivo', 'tarjeta', 'transferencia'].map(method => ({
        method,
        count: methodCounts[method] || 0,
        percentage: completedSales.length > 0 ? 
          ((methodCounts[method] || 0) / completedSales.length) * 100 : 0
      }));
    };

    // Tendencia mensual (últimos 6 meses)
    const monthlyTrendData = () => {
      const monthsMap: { [key: number]: string } = {
        0: 'Ene', 1: 'Feb', 2: 'Mar', 3: 'Abr', 4: 'May', 5: 'Jun',
        6: 'Jul', 7: 'Ago', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic'
      };

      const now = new Date();
      const months: MonthData[] = [];
      
      // Generar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: monthsMap[date.getMonth()],
          year: date.getFullYear(),
          revenue: 0
        });
      }

      // Calcular ingresos por mes
      sales.forEach(sale => {
        if (sale.status === 'completada') {
          const saleDate = new Date(sale.createdAt);
          const monthIndex = months.findIndex(m => 
            m.month === monthsMap[saleDate.getMonth()] && 
            m.year === saleDate.getFullYear()
          );
          
          if (monthIndex !== -1) {
            months[monthIndex].revenue += sale.total;
          }
        }
      });

      return months.map(m => ({ month: m.month, revenue: m.revenue }));
    };

    // Ventas por categoría
    const salesByCategoryData = () => {
      const completedSales = sales.filter(s => s.status === 'completada');
      const categoryTotals = {} as Record<string, { amount: number; orders: number; items: number }>;
      
      completedSales.forEach(sale => {
        sale.items.forEach(item => {
          const categoryName = item.product?.categoria?.nombre || 'otros';
          if (!categoryTotals[categoryName]) {
            categoryTotals[categoryName] = { amount: 0, orders: 0, items: 0 };
          }
          categoryTotals[categoryName].amount += item.total;
          categoryTotals[categoryName].items += item.quantity;
        });
      });

      // Contar órdenes únicas por categoría
      completedSales.forEach(sale => {
        const categoriesInSale = new Set();
        sale.items.forEach(item => {
          const categoryName = item.product?.categoria?.nombre || 'otros';
          categoriesInSale.add(categoryName);
        });
        categoriesInSale.forEach(categoryName => {
          if (categoryTotals[categoryName as string]) {
            categoryTotals[categoryName as string].orders += 1;
          }
        });
      });

      const totalCategoryRevenue = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0);

      return Object.entries(categoryTotals).map(([categoryName, data]) => ({
        category: categoryName,
        amount: data.amount,
        orders: data.orders,
        items: data.items,
        percentage: totalCategoryRevenue > 0 ? (data.amount / totalCategoryRevenue) * 100 : 0
      })).sort((a, b) => b.amount - a.amount);
    };

    // Calcular métricas adicionales
    const completedSales = sales.filter(s => s.status === 'completada');
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

    // Calcular órdenes del mes actual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const totalOrdersThisMonth = sales.filter(sale => {
      let saleDate: Date;
      if (sale.completedAt instanceof Date) {
        saleDate = sale.completedAt;
      } else if (typeof sale.completedAt === 'string') {
        saleDate = new Date(sale.completedAt);
      } else {
        return false;
      }
      return saleDate.getMonth() === currentMonth && 
             saleDate.getFullYear() === currentYear;
    }).length;

    return {
      dailySales: dailySalesData(),
      paymentMethods: paymentMethodsData(),
      monthlyTrend: monthlyTrendData(),
      salesByCategory: salesByCategoryData(),
      totalRevenue,
      averageTicket,
      completedOrders: completedSales.length,
      totalOrdersThisMonth,
      periodUsed: 'mes_actual' // Valor por defecto
    };
  }, [sales]);

  // Función para exportar el reporte
  const exportReport = () => {
    try {
      // Crear el contenido del reporte
      const reportData = {
        fecha_generacion: new Date().toLocaleString('es-ES'),
        resumen_ejecutivo: {
          total_ingresos: processedData.totalRevenue,
          ordenes_del_mes: processedData.totalOrdersThisMonth,
          ordenes_completadas: processedData.completedOrders,
          ticket_promedio: processedData.averageTicket,
          crecimiento_mensual: `${salesGrowth.toFixed(1)}%`
        },
        ventas_por_dia: processedData.dailySales,
        metodos_pago: processedData.paymentMethods,
        tendencia_mensual: processedData.monthlyTrend,
        ventas_por_categoria: processedData.salesByCategory
      };

      // Generar CSV para descarga
      const generateCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Encabezado del reporte
        csvContent += "REPORTE DE VENTAS\n";
        csvContent += `Fecha de generación: ${reportData.fecha_generacion}\n\n`;
        
        // Resumen ejecutivo
        csvContent += "RESUMEN EJECUTIVO\n";
        csvContent += "Métrica,Valor\n";
        csvContent += `Total Ingresos,${reportData.resumen_ejecutivo.total_ingresos.toLocaleString()}\n`;
        csvContent += `Órdenes del Mes,${reportData.resumen_ejecutivo.ordenes_del_mes}\n`;
        csvContent += `Órdenes Completadas,${reportData.resumen_ejecutivo.ordenes_completadas}\n`;
        csvContent += `Ticket Promedio,${reportData.resumen_ejecutivo.ticket_promedio.toFixed(2)}\n`;
        csvContent += `Crecimiento Mensual,${reportData.resumen_ejecutivo.crecimiento_mensual}\n\n`;
        
        // Ventas por día
        csvContent += "VENTAS POR DIA DE LA SEMANA\n";
        csvContent += "Día,Ventas ($),Órdenes\n";
        reportData.ventas_por_dia.forEach(day => {
          csvContent += `${day.day},${day.sales.toLocaleString()},${day.orders}\n`;
        });
        csvContent += "\n";
        
        // Métodos de pago
        csvContent += "MÉTODOS DE PAGO\n";
        csvContent += "Método,Cantidad,Porcentaje\n";
        reportData.metodos_pago.forEach(method => {
          csvContent += `${method.method},${method.count},${method.percentage.toFixed(1)}%\n`;
        });
        csvContent += "\n";
        
        // Ventas por categoría
        csvContent += "VENTAS POR CATEGORÍA\n";
        csvContent += "Categoría,Ingresos ($),Porcentaje,Órdenes\n";
        reportData.ventas_por_categoria.forEach(cat => {
          csvContent += `${cat.category},${cat.amount.toLocaleString()},${cat.percentage.toFixed(1)}%,${cat.orders}\n`;
        });
        
        return csvContent;
      };

      // Crear y descargar el archivo
      const csvData = generateCSV();
      const encodedUri = encodeURI(csvData);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      
      const fechaHoy = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `reporte_ventas_${fechaHoy}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mostrar mensaje de éxito (opcional)
      alert('Reporte exportado exitosamente');
      
    } catch (error) {
      console.error('Error al exportar el reporte:', error);
      alert('Error al exportar el reporte. Por favor, inténtelo de nuevo.');
    }
  };

  // Calcular crecimiento (comparar con mes anterior)
  const salesGrowth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthSales = sales.filter(sale => {
      if (!sale.completedAt) return false;
      const saleDate = typeof sale.completedAt === 'string' ? new Date(sale.completedAt) : sale.completedAt;
      return sale.status === 'completada' && 
             saleDate.getMonth() === currentMonth && 
             saleDate.getFullYear() === currentYear;
    }).reduce((sum, sale) => sum + sale.total, 0);

    const lastMonthSales = sales.filter(sale => {
      if (!sale.completedAt) return false;
      const saleDate = typeof sale.completedAt === 'string' ? new Date(sale.completedAt) : sale.completedAt;
      return sale.status === 'completada' && 
             saleDate.getMonth() === lastMonth && 
             saleDate.getFullYear() === lastMonthYear;
    }).reduce((sum, sale) => sum + sale.total, 0);

    return lastMonthSales > 0 ? 
      ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0;
  }, [sales]);

  return (
    <div className="sales-reports">
      <div className="page-header">
        <h1 className="page-title">
          <BarChart3 size={28} />
          Reportes de Ventas
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline">
            <Calendar size={20} />
            Filtrar por Fecha
          </button>
          <button className="btn btn-primary" onClick={exportReport}>
            <Download size={20} />
            Exportar Reporte
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">${processedData.totalRevenue.toLocaleString()}</div>
          <div className="stat-label">
            {processedData.periodUsed === 'mes_actual' ? 'Ingresos del Mes Actual' : 
             processedData.periodUsed === 'ultimos_30_dias' ? 'Ingresos Últimos 30 Días' : 
             'Ingresos Totales'}
          </div>
          <div className={`stat-growth ${salesGrowth >= 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={16} />
            {salesGrowth >= 0 ? '+' : ''}{salesGrowth.toFixed(1)}% vs mes anterior
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{processedData.totalOrdersThisMonth}</div>
          <div className="stat-label">
            {processedData.periodUsed === 'mes_actual' ? 'Órdenes del Mes' : 
             processedData.periodUsed === 'ultimos_30_dias' ? 'Órdenes (30 días)' : 
             'Total Órdenes'}
          </div>
          <div className="stat-sublabel" style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
            ({processedData.completedOrders} completadas)
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${processedData.averageTicket.toFixed(2)}</div>
          <div className="stat-label">Ticket Promedio</div>
          <div className="stat-sublabel" style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
            {processedData.periodUsed === 'mes_actual' ? 'Del mes actual' : 
             processedData.periodUsed === 'ultimos_30_dias' ? 'Últimos 30 días' : 
             'General'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{processedData.completedOrders}</div>
          <div className="stat-label">Ventas Completadas</div>
          <div className="stat-sublabel" style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
            {processedData.periodUsed === 'mes_actual' ? 'Este mes' : 
             processedData.periodUsed === 'ultimos_30_dias' ? 'Últimos 30 días' : 
             'Todas'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ventas por Día de la Semana</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData.dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'sales' ? `$${value.toLocaleString()}` : `${value} órdenes`,
                name === 'sales' ? 'Ventas' : 'Órdenes'
              ]} />
              <Bar dataKey="sales" fill="#8B4513" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Métodos de Pago</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {processedData.paymentMethods.map(({ method, count, percentage }) => (
              <div key={method}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ textTransform: 'capitalize' }}>{method}</span>
                  <span>{count} ({percentage.toFixed(1)}%)</span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#E0E0E0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    backgroundColor: '#8B4513',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tendencia de Ingresos Mensuales</h3>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={processedData.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#8B4513" 
              strokeWidth={3}
              dot={{ fill: '#DAA520', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Ventas por Categoría</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Ingresos</th>
                <th>% del Total</th>
                <th>Órdenes</th>
              </tr>
            </thead>
            <tbody>
              {processedData.salesByCategory.map(category => (
                <tr key={category.category}>
                  <td style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                    {category.category}
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    <DollarSign size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    ${category.amount.toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '60px',
                        height: '8px',
                        backgroundColor: '#E0E0E0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${category.percentage}%`,
                          height: '100%',
                          backgroundColor: '#8B4513'
                        }} />
                      </div>
                      {category.percentage.toFixed(1)}%
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {category.orders} órdenes
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

export default SalesReports;