import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Package } from 'lucide-react';


const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
  name: '',
  category: '',
  unidadMedida: '',
    brand: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    description: '',
    alcoholContent: 0,
    volume: 750,
    barcode: '',
    isActive: true
    , expirationDate: ''
  });


  // Si editando, cargar datos del producto desde el backend
  useEffect(() => {
    if (isEdit && id) {
      fetch(`http://localhost:3001/api/productos/${id}`)
        .then(res => res.json())
        .then(product => {
          let expirationDate = '';
          if (product.fecha_vencimiento) {
            const d = new Date(product.fecha_vencimiento);
            expirationDate = d.toISOString().slice(0, 10);
          }
          setFormData({
            name: product.producto || '',
            category: product.categoria || '',
            unidadMedida: product.id_unidad_medida ? String(product.id_unidad_medida) : '',
            brand: product.marca || '',
            price: product.precio || 0,
            cost: product.precio_costo_unitario || 0,
            stock: product.stock || 0,
            minStock: product.stock_minimo || 0,
            description: product.descripcion || '',
            alcoholContent: product.graduacion_alcoholica || 0,
            volume: product.contenido || 0,
            barcode: product.codigo_barras || '',
            isActive: product.estado === 'activo',
            expirationDate
          });
        });
    }
  }, [isEdit, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      nombre: formData.name,
      marca: formData.brand,
      precio_venta: formData.price,
      descripcion: formData.description,
      codigo_barras: formData.barcode,
      id_categoria: categories.find(c => c.nombre === formData.category)?.id,
      id_unidad_medida: formData.unidadMedida,
      graduacion_alcoholica: formData.alcoholContent,
      contenido: formData.volume,
      fecha_vencimiento: formData.expirationDate,
      stock: formData.stock,
      minStock: formData.minStock,
      cost: formData.cost,
      price: formData.price
    };
    const url = isEdit && id
      ? `http://localhost:3001/api/productos/${id}`
      : 'http://localhost:3001/api/productos';
    const method = isEdit && id ? 'PUT' : 'POST';
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al guardar producto');
        return res.json();
      })
      .then(() => {
        navigate('/products');
      })
      .catch(() => {
        alert('Error al guardar producto');
      });
  };

  // Estado para categorías desde la base de datos
  // Estado para unidades de medida desde la base de datos
  const [units, setUnits] = useState<{ id: number; nombre: string; abreviacion: string }[]>([]);

  // Cargar unidades de medida desde el backend
  useEffect(() => {
    fetch('http://localhost:3001/api/unidades')
      .then(res => res.json())
      .then(data => setUnits(data))
      .catch(() => setUnits([]));
  }, []);
  const [categories, setCategories] = useState<{ id: number; nombre: string }[]>([]);

  // Cargar categorías desde el backend
  useEffect(() => {
    fetch('http://localhost:3001/api/categorias')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="product-form">
      <div className="page-header">
        <h1 className="page-title">
          <Package size={28} />
          {isEdit ? 'Editar Producto' : 'Agregar Producto'}
        </h1>
        <button onClick={() => navigate('/products')} className="btn btn-outline">
          <ArrowLeft size={20} />
          Volver
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#8B4513' }}>Información Básica</h3>
              
              <div className="form-group">
                <label className="form-label">Nombre del Producto *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Categoría *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Unidad de medida *</label>
                  <select
                    className="form-select"
                    value={formData.unidadMedida}
                    onChange={(e) => setFormData(prev => ({ ...prev, unidadMedida: e.target.value }))}
                    required
                  >
                    <option value="">Seleccione una unidad</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.nombre} ({unit.abreviacion})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Marca *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Código de Barras</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                />
              </div>

                <div className="form-group">
                  <label className="form-label">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                  />
                </div>

              <div className="form-group">
                {/* URL de Imagen eliminado */}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span className="form-label" style={{ marginBottom: 0 }}>Producto activo</span>
                </label>
                <small style={{ color: '#666', fontSize: '0.8rem', marginLeft: '1.5rem' }}>
                  Solo los productos activos aparecen en el catálogo
                </small>
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#8B4513' }}>Precios e Inventario</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Precio de Venta *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Costo *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Stock Actual *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Mínimo *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.minStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <h3 style={{ margin: '2rem 0 1.5rem', color: '#8B4513' }}>Especificaciones</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Volumen (ml) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.volume}
                    onChange={(e) => setFormData(prev => ({ ...prev, volume: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Graduación Alcohólica (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formData.alcoholContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, alcoholContent: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div style={{ 
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#F5F5DC',
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#8B4513', marginBottom: '0.5rem' }}>Margen de Ganancia</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8B4513' }}>
                  {formData.price && formData.cost 
                    ? `${(((formData.price - formData.cost) / formData.cost) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Ganancia por unidad: ${(formData.price - formData.cost).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #E0E0E0'
          }}>
            <button 
              type="button" 
              onClick={() => navigate('/products')}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={20} />
              {isEdit ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
