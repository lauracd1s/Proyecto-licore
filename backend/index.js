





const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Configura aquí tu conexión a Postgres
const pool = new Pool({
  user: 'postgres', // Cambia esto por tu usuario de Postgres
  host: 'localhost',
  database: 'licoreria', // Cambia esto por el nombre de tu base de datos
  password: '12345', // Cambia esto por tu contraseña
  port: 5432,
});

// Endpoint para insertar un lote (con fecha de vencimiento)
app.post('/api/lotes', async (req, res) => {
  try {
    const {
      id_producto,
      id_proveedor,
      numero_lote,
      fecha_produccion,
      fecha_vencimiento,
      cantidad_inicial,
      precio_costo_unitario
    } = req.body;

    const result = await pool.query(
      `INSERT INTO lote (id_producto, id_proveedor, numero_lote, fecha_produccion, fecha_vencimiento, cantidad_inicial, precio_costo_unitario)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        id_producto,
        id_proveedor,
        numero_lote,
        fecha_produccion,
        fecha_vencimiento,
        cantidad_inicial,
        precio_costo_unitario
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al insertar lote' });
  }
});
// Endpoint para insertar un producto
app.post('/api/productos', async (req, res) => {
  try {
    const {
      nombre,
      marca,
      precio_venta,
      descripcion,
      codigo_barras,
      id_categoria,
      id_unidad_medida,
      graduacion_alcoholica,
      contenido,
      fecha_vencimiento,
      stock,
      minStock
    } = req.body;

    // 1. Insertar producto
    const result = await pool.query(
      `INSERT INTO producto (nombre, marca, precio_venta, descripcion, codigo_barras, id_categoria, id_unidad_medida, graduacion_alcoholica, contenido)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        nombre,
        marca,
        precio_venta,
        descripcion,
        codigo_barras,
        id_categoria,
        id_unidad_medida,
        graduacion_alcoholica,
        contenido
      ]
    );
    const producto = result.rows[0];
    const id_producto = producto.id_producto;


    // 2. Insertar lote (id_proveedor=1, numero_lote puede ser generado, cantidad_inicial=stock, fecha_vencimiento, precio_costo_unitario=cost, precio_venta_sugerido=price)
    let lote = null;
    if (stock !== undefined && fecha_vencimiento) {
      const loteResult = await pool.query(
        `INSERT INTO lote (id_producto, id_proveedor, numero_lote, fecha_produccion, fecha_vencimiento, cantidad_inicial, precio_costo_unitario, precio_venta_sugerido)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          id_producto,
          1, // id_proveedor fijo
          'L-' + Date.now(), // numero_lote generado
          null, // fecha_produccion
          fecha_vencimiento,
          stock,
          req.body.cost,
          req.body.price
        ]
      );
      lote = loteResult.rows[0];

      // 3. Insertar lote_inventario (stock_actual)
      await pool.query(
        `INSERT INTO lote_inventario (id_lote, stock_actual) VALUES ($1, $2)`,
        [lote.id_lote, stock]
      );
    }

    // 4. Insertar configuracion_inventario (stock_minimo)
    if (minStock !== undefined) {
      await pool.query(
        `INSERT INTO configuracion_inventario (id_producto, stock_minimo) VALUES ($1, $2)`,
        [id_producto, minStock]
      );
    }

    res.status(201).json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al insertar producto y datos relacionados' });
  }
});

// Endpoint para obtener unidades de medida
app.get('/api/unidades', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_unidad_medida AS id, nombre, abreviacion FROM unidad_medida WHERE estado = \'activa\' ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener unidades de medida' });
  }
});

// Endpoint para obtener categorías de producto
app.get('/api/categorias', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_categoria AS id, nombre FROM categoria_producto WHERE estado = \'activa\' ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});
// Endpoint para obtener productos con información completa para el catálogo
app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id_producto AS id,
        p.nombre AS producto,
        c.nombre AS categoria,
        p.precio_venta AS precio,
        COALESCE(li.stock_actual, 0) AS stock,
        p.estado,
        co.stock_minimo
      FROM producto p
      LEFT JOIN categoria_producto c ON p.id_categoria = c.id_categoria
      LEFT JOIN lote l ON l.id_producto = p.id_producto
      LEFT JOIN lote_inventario li ON li.id_lote = l.id_lote
      LEFT JOIN configuracion_inventario co ON co.id_producto = p.id_producto
      ORDER BY p.id_producto DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});
// Endpoint para obtener un producto por id con toda la información relevante
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT
        p.id_producto AS id,
        p.nombre AS producto,
        c.nombre AS categoria,
        p.id_unidad_medida,
        p.marca,
        p.precio_venta AS precio,
        p.descripcion,
        p.estado,
        p.codigo_barras,
        p.graduacion_alcoholica,
        p.contenido,
        (
          SELECT l.fecha_vencimiento
          FROM lote l
          WHERE l.id_producto = p.id_producto
          ORDER BY l.fecha_vencimiento DESC NULLS LAST
          LIMIT 1
        ) AS fecha_vencimiento,
        (
          SELECT l.precio_costo_unitario
          FROM lote l
          WHERE l.id_producto = p.id_producto
          ORDER BY l.fecha_vencimiento DESC NULLS LAST
          LIMIT 1
        ) AS precio_costo_unitario,
        co.stock_minimo,
        (
          SELECT li.stock_actual
          FROM lote_inventario li
          JOIN lote l ON li.id_lote = l.id_lote
          WHERE l.id_producto = p.id_producto
          ORDER BY l.fecha_vencimiento DESC NULLS LAST
          LIMIT 1
        ) AS stock
      FROM producto p
      LEFT JOIN categoria_producto c ON p.id_categoria = c.id_categoria
      LEFT JOIN configuracion_inventario co ON co.id_producto = p.id_producto
      WHERE p.id_producto = $1
      LIMIT 1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});
// Endpoint para actualizar un producto por id
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      marca,
      precio_venta,
      descripcion,
      codigo_barras,
      id_categoria,
      id_unidad_medida,
      graduacion_alcoholica,
      contenido,
      fecha_vencimiento,
      stock,
      minStock,
      cost,
      price
    } = req.body;

    // Actualizar producto principal
    await pool.query(
      `UPDATE producto SET nombre=$1, marca=$2, precio_venta=$3, descripcion=$4, codigo_barras=$5, id_categoria=$6, id_unidad_medida=$7, graduacion_alcoholica=$8, contenido=$9 WHERE id_producto=$10`,
      [
        nombre,
        marca,
        precio_venta,
        descripcion,
        codigo_barras,
        id_categoria,
        id_unidad_medida,
        graduacion_alcoholica,
        contenido,
        id
      ]
    );

    // Actualizar lote más reciente (si existe)
    const loteRes = await pool.query(
      `SELECT id_lote FROM lote WHERE id_producto=$1 ORDER BY fecha_vencimiento DESC NULLS LAST LIMIT 1`,
      [id]
    );
    if (loteRes.rows.length > 0) {
      const id_lote = loteRes.rows[0].id_lote;
      await pool.query(
        `UPDATE lote SET fecha_vencimiento=$1, cantidad_inicial=$2, precio_costo_unitario=$3, precio_venta_sugerido=$4 WHERE id_lote=$5`,
        [fecha_vencimiento, stock, cost, price, id_lote]
      );
      await pool.query(
        `UPDATE lote_inventario SET stock_actual=$1 WHERE id_lote=$2`,
        [stock, id_lote]
      );
    }

    // Actualizar configuración de inventario
    await pool.query(
      `UPDATE configuracion_inventario SET stock_minimo=$1 WHERE id_producto=$2`,
      [minStock, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});
  // Endpoint para crear una oferta y sus productos relacionados
  app.post('/api/ofertas', async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        title,
        description,
        type,
        discount,
        discountType,
        targetAudience,
        conditions,
        maxRedemptions,
        productIds,
        startDate,
        endDate,
        isActive,
        terms
      } = req.body;

      // Mapear type a id_tipo_oferta (ejemplo: puedes hacer una consulta para obtener el id)
      const tipoResult = await pool.query('SELECT id_tipo_oferta FROM tipo_oferta WHERE nombre = $1 LIMIT 1', [type]);
      const id_tipo_oferta = tipoResult.rows[0]?.id_tipo_oferta || null;

      // Estado
      const estado = isActive ? 'activa' : 'inactiva';

      // Insertar oferta principal
      const ofertaResult = await client.query(
        `INSERT INTO oferta (
          id_tipo_oferta, nombre, descripcion, fecha_inicio, fecha_fin, limite_usos_por_cliente, estado, valor_compra_minima, prioridad
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_oferta`,
        [
          id_tipo_oferta,
          title,
          description + (terms ? ('\nTérminos: ' + terms) : ''),
          startDate,
          endDate,
          maxRedemptions || null,
          estado,
          discount,
          1 // prioridad por defecto
        ]
      );
      const id_oferta = ofertaResult.rows[0].id_oferta;

      // Insertar productos relacionados en oferta_productos
      if (productIds && productIds.length > 0) {
        for (const pid of productIds) {
          await client.query(
            `INSERT INTO oferta_productos (id_oferta, id_producto, descuento_especifico, valor_descuento_especifico, cantidad_minima)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              id_oferta,
              pid,
              discountType === 'percentage' ? discount : null,
              discountType === 'fixed' ? discount : null,
              1 // cantidad mínima por defecto
            ]
          );
        }
      }

      res.status(201).json({ id_oferta });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear la oferta' });
    } finally {
      client.release();
    }
  });

app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});
