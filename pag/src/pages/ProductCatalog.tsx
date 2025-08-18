import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

const ProductCatalog: React.FC = () => {
  const navigate = useNavigate();
  // Leer productos desde el backend
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');

  // Cargar productos al montar
  React.useEffect(() => {
    fetch('http://localhost:3001/api/productos')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.producto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'todos' || product.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['todos', ...Array.from(new Set(products.map(p => p.categoria)))];

  const handleDelete = () => {
    alert('Funcionalidad de eliminar pendiente de implementar en backend');
  };

  return (
    <div className="product-catalog">
      <div className="page-header">
        <h1 className="page-title">
          <Package size={28} />
          Catálogo de Productos
        </h1>
        <Link to="/products/new" className="btn btn-primary">
          <Plus size={20} />
          Agregar Producto
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Total Productos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{products.filter(p => Number(p.stock) > Number(p.stock_minimo || 0)).length}</div>
          <div className="stat-label">Stock Saludable</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{products.filter(p => Number(p.stock) <= Number(p.stock_minimo || 0) && Number(p.stock) > 0).length}</div>
          <div className="stat-label">Stock Bajo</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{products.filter(p => Number(p.stock) === 0).length}</div>
          <div className="stat-label">Sin Stock</div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: '1' }}>
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
              placeholder="Buscar productos por nombre o marca..."
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={20} color="#8B4513" />
            <select
              className="form-select"
              style={{ minWidth: '150px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'todos' ? 'Todas las categorías' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <Package size={48} color="#ccc" />
                    <p style={{ marginTop: '1rem', color: '#666' }}>
                      {searchTerm || categoryFilter !== 'todos' 
                        ? 'No se encontraron productos con los filtros aplicados'
                        : 'No hay productos registrados'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {product.producto}
                        </div>
                        {/* Si tienes marca, volumen, alcoholContent en el endpoint, puedes mostrarlo aquí */}
                        {/* <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {product.marca} - {product.volume}ml - {product.alcoholContent}%
                        </div> */}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {product.categoria}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      ${Number(product.precio).toFixed(2)}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{product.stock} unidades</div>
                    </td>
                    <td>
                      <span className={`badge badge-${product.estado === 'activo' ? 'success' : 'danger'}`}>
                        {product.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.5rem' }}
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={handleDelete}
                          className="btn btn-danger"
                          style={{ padding: '0.5rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enlaces relacionados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <Link to="/inventory" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
          <Package size={32} color="#8B4513" />
          <h3 style={{ marginTop: '1rem', color: '#8B4513' }}>Control de Inventario</h3>
          <p style={{ color: '#666' }}>Gestiona el stock y movimientos</p>
        </Link>
        <Link to="/alerts" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
          <Package size={32} color="#8B4513" />
          <h3 style={{ marginTop: '1rem', color: '#8B4513' }}>Alertas de Stock</h3>
          <p style={{ color: '#666' }}>Productos que requieren atención</p>
        </Link>
      </div>
    </div>
  );
};

export default ProductCatalog;
