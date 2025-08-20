





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
        co.stock_minimo,
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
        ) AS precio_costo_unitario
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
      await client.query('BEGIN');

      const {
        // Campos de oferta (tabla principal)
        id_tipo_oferta,
        id_temporada = null,
        id_empleado_creador = 1, // fallback por ahora
        nombre,
        descripcion = null,
        fecha_inicio,
        fecha_fin,
        cantidad_minima = 1,
        valor_compra_minima = 0,
        limite_usos_por_cliente = null,
        limite_usos_total = null,
        requiere_codigo = false,
        codigo_promocional = null,
        descuento_porcentaje = null,
        descuento_valor_fijo = null,
        productos_gratis = 0,
        se_combina_con_otras = false,
        prioridad = 1,
        estado = 'activa',

        // Tablas hijas
        aplicaciones = [],
        criterios = []
      } = req.body;

      if (requiere_codigo && !codigo_promocional) {
        return res.status(400).json({ error: 'El código promocional es requerido cuando requiere_codigo es true' });
      }

      const ofertaInsert = await client.query(
        `INSERT INTO oferta (
          id_tipo_oferta,
          id_temporada,
          id_empleado_creador,
          nombre,
          descripcion,
          fecha_inicio,
          fecha_fin,
          cantidad_minima,
          valor_compra_minima,
          limite_usos_por_cliente,
          limite_usos_total,
          requiere_codigo,
          codigo_promocional,
          descuento_porcentaje,
          descuento_valor_fijo,
          productos_gratis,
          se_combina_con_otras,
          prioridad,
          estado
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
        ) RETURNING id_oferta`,
        [
          id_tipo_oferta,
          id_temporada,
          id_empleado_creador,
          nombre,
          descripcion,
          fecha_inicio,
          fecha_fin,
          cantidad_minima,
          valor_compra_minima,
          limite_usos_por_cliente,
          limite_usos_total,
          requiere_codigo,
          codigo_promocional,
          descuento_porcentaje,
          descuento_valor_fijo,
          productos_gratis,
          se_combina_con_otras,
          prioridad,
          estado
        ]
      );

      const id_oferta = ofertaInsert.rows[0].id_oferta;

      // Insertar aplicaciones
      if (Array.isArray(aplicaciones)) {
        for (const a of aplicaciones) {
          const {
            tipo_aplicacion,
            id_producto = null,
            id_categoria = null,
            id_cliente = null,
            marca = null,
            cantidad_minima: app_cantidad_minima = 1,
            cantidad_maxima = null,
            descuento_adicional = 0,
            unidades_gratis = 0,
            es_exclusivo = false,
            unidades_compradas = 0,
            unidades_otorgadas = 0,
            aplica_por_cada = false,
            estado: app_estado = 'activo'
          } = a;

          await client.query(
            `INSERT INTO oferta_aplicacion (
              id_oferta,
              tipo_aplicacion,
              id_producto,
              id_categoria,
              id_cliente,
              marca,
              cantidad_minima,
              cantidad_maxima,
              descuento_adicional,
              unidades_gratis,
              es_exclusivo,
              unidades_compradas,
              unidades_otorgadas,
              aplica_por_cada,
              estado
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
            )`,
            [
              id_oferta,
              tipo_aplicacion,
              id_producto,
              id_categoria,
              id_cliente,
              marca,
              app_cantidad_minima,
              cantidad_maxima,
              descuento_adicional,
              unidades_gratis,
              es_exclusivo,
              unidades_compradas,
              unidades_otorgadas,
              aplica_por_cada,
              app_estado
            ]
          );
        }
      }

      // Insertar criterios
      if (Array.isArray(criterios)) {
        for (const c of criterios) {
          const {
            tipo_criterio,
            operador,
            valor,
            es_obligatorio = true,
            estado: crit_estado = 'activo'
          } = c;

          await client.query(
            `INSERT INTO oferta_criterio (
              id_oferta,
              tipo_criterio,
              operador,
              valor,
              es_obligatorio,
              estado
            ) VALUES ($1,$2,$3,$4,$5,$6)`,
            [id_oferta, tipo_criterio, operador, valor, es_obligatorio, crit_estado]
          );
        }
      }

      await client.query('COMMIT');
      return res.status(201).json({ id_oferta });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      return res.status(500).json({ error: 'Error al crear la oferta' });
    } finally {
      client.release();
    }
  });

// Obtener ofertas simples desde tabla oferta
app.get('/api/ofertas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_oferta, id_tipo_oferta, id_temporada, id_empleado_creador, nombre, descripcion,
              fecha_inicio, fecha_fin, cantidad_minima, valor_compra_minima, limite_usos_por_cliente,
              limite_usos_total, usos_actuales, requiere_codigo, codigo_promocional, descuento_porcentaje,
              descuento_valor_fijo, productos_gratis, se_combina_con_otras, prioridad, estado, fecha_creacion
       FROM oferta
       ORDER BY fecha_creacion DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ofertas' });
  }
});

// Tipos de oferta activos
app.get('/api/tipos-oferta', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_tipo_oferta, nombre, descripcion, permite_porcentaje, permite_valor_fijo, permite_productos_gratis, permite_combinacion, estado
       FROM tipo_oferta
       WHERE estado = 'activo'
       ORDER BY nombre`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tipos de oferta' });
  }
});

// Temporadas activas
app.get('/api/temporadas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_temporada, nombre, descripcion, fecha_inicio, fecha_fin, es_recurrente, color_tema, icono, prioridad, estado
       FROM temporada
       WHERE estado = 'activa'
       ORDER BY prioridad DESC, fecha_inicio DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener temporadas' });
  }
});

// Clientes activos (para aplicar ofertas por cliente)
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id_cliente AS id, p.nombre, p.apellido, p.cedula
       FROM cliente c
       JOIN persona p ON p.id_persona = c.id_persona
       WHERE c.estado = 'activo'
       ORDER BY p.nombre, p.apellido`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});
