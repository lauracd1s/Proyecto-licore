
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

// Endpoint para aplicar descuentos dinámicos a productos próximos a caducar
app.post('/api/aplicar-descuentos-caducidad', async (req, res) => {
  try {
    // Buscar lotes que vencen en los próximos 30 días y están activos
    const lotes = await pool.query(`
      SELECT l.id_lote, l.id_producto, l.fecha_vencimiento, l.precio_costo_unitario, p.precio_venta
      FROM lote l
      JOIN producto p ON p.id_producto = l.id_producto
      WHERE l.estado = 'activo'
        AND l.fecha_vencimiento IS NOT NULL
        AND l.fecha_vencimiento >= CURRENT_DATE
        AND l.fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
    `);

    let actualizados = [];
    for (const lote of lotes.rows) {
      const dias_restantes = Math.ceil((new Date(lote.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
      // Descuento: 10% si faltan 30-21 días, 20% si 20-11 días, 30% si 10-1 días
      let descuento = 0;
      if (dias_restantes <= 10) descuento = 0.3;
      else if (dias_restantes <= 20) descuento = 0.2;
      else descuento = 0.1;
      const precio_descuento = Math.max(
        Number(lote.precio_costo_unitario),
        Number(lote.precio_venta) * (1 - descuento)
      );
      // Solo actualiza si el precio de venta baja y sigue siendo mayor al costo
      if (precio_descuento < Number(lote.precio_venta)) {
        await pool.query(
          'UPDATE producto SET precio_venta = $1 WHERE id_producto = $2',
          [precio_descuento, lote.id_producto]
        );
        actualizados.push({
          id_producto: lote.id_producto,
          id_lote: lote.id_lote,
          precio_venta: precio_descuento,
          descuento: descuento,
          dias_restantes
        });
      }
    }
    res.json({ actualizados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al aplicar descuentos por caducidad' });
  }
});

// Endpoint para obtener productos en oferta por caducidad
app.get('/api/ofertas-caducidad', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id_producto, p.nombre, p.marca, p.precio_venta, l.fecha_vencimiento, l.precio_costo_unitario,
        (CASE 
          WHEN l.fecha_vencimiento <= CURRENT_DATE + INTERVAL '10 days' THEN 30
          WHEN l.fecha_vencimiento <= CURRENT_DATE + INTERVAL '20 days' THEN 20
          ELSE 10
        END) AS descuento_porcentaje,
        l.id_lote
      FROM lote l
      JOIN producto p ON p.id_producto = l.id_producto
      WHERE l.estado = 'activo'
        AND l.fecha_vencimiento IS NOT NULL
        AND l.fecha_vencimiento >= CURRENT_DATE
        AND l.fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY l.fecha_vencimiento ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos en oferta por caducidad' });
  }
});


// Endpoint para registrar una venta y actualizar el stock
app.post('/api/ventas', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      customerId,
      items,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod,
      status,
      completedAt,
      cashierId,
      createdAt,
      appliedOffers
    } = req.body;

    // Crear factura
    const facturaRes = await client.query(
      `INSERT INTO factura (
        id_cliente,
        id_empleado,
        id_forma_pago,
        numero_factura,
        fecha_factura,
        subtotal,
        total_descuentos,
        impuesto,
        total_factura,
        estado
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING id_factura`,
      [
        customerId ? Number(customerId) : null,
        1, // id_empleado fijo (puedes cambiarlo)
        1, // id_forma_pago fijo (puedes mapearlo según paymentMethod)
        'F-' + Date.now(),
        new Date(),
        subtotal,
        discount,
        tax,
        total,
        status || 'completada'
      ]
    );
    const id_factura = facturaRes.rows[0].id_factura;

    // Insertar detalle_factura y actualizar stock
    for (const item of items) {
      // Insertar detalle
      await client.query(
        `INSERT INTO detalle_factura (
          id_factura,
          id_producto,
          cantidad,
          precio_unitario,
          costo_unitario,
          descuento_unitario,
          subtotal_linea
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          id_factura,
          Number(item.productId),
          item.quantity,
          item.unitPrice,
          0, // costo_unitario (puedes obtenerlo si lo necesitas)
          item.discount,
          item.total
        ]
      );

      // Actualizar stock en lote_inventario (restar cantidad vendida)
      // Buscar lote activo más reciente para el producto
      const loteRes = await client.query(
        `SELECT l.id_lote FROM lote l
         JOIN lote_inventario li ON li.id_lote = l.id_lote
         WHERE l.id_producto = $1 AND l.estado = 'activo'
         ORDER BY l.fecha_vencimiento ASC LIMIT 1`,
        [Number(item.productId)]
      );
      if (loteRes.rows.length > 0) {
        const id_lote = loteRes.rows[0].id_lote;
        await client.query(
          `UPDATE lote_inventario SET stock_actual = stock_actual - $1 WHERE id_lote = $2`,
          [item.quantity, id_lote]
        );
      }
    }

    // Registrar ofertas aplicadas si vienen en la solicitud
    if (Array.isArray(appliedOffers) && appliedOffers.length > 0) {
      for (const ao of appliedOffers) {
        const offerId = ao.offerId ? Number(ao.offerId) : null;
        if (!offerId) continue;
        const valor_descuento_aplicado = Number(ao.discountAmount) || 0;
        const productos_gratis_otorgados = Number(ao.freeProducts || 0);
        await client.query(
          `INSERT INTO oferta_aplicada (
            id_oferta,
            id_factura,
            id_cliente,
            valor_descuento_aplicado,
            productos_gratis_otorgados
          ) VALUES ($1,$2,$3,$4,$5)`,
          [
            offerId,
            id_factura,
            customerId ? Number(customerId) : null,
            valor_descuento_aplicado,
            productos_gratis_otorgados
          ]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, id_factura });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la venta' });
  } finally {
    client.release();
  }
});

app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});
  // Endpoint para crear una oferta y sus productos relacionados
// Endpoint para obtener todas las ofertas
app.get('/api/ofertas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id_oferta,
        o.nombre,
        o.descripcion,
        o.fecha_inicio,
        o.fecha_fin,
        o.estado,
        o.descuento_porcentaje,
        o.descuento_valor_fijo,
        o.productos_gratis,
        o.se_combina_con_otras,
        o.prioridad,
        o.id_tipo_oferta,
        o.id_temporada,
        t.nombre AS tipo_oferta,
        s.nombre AS temporada
      FROM oferta o
      LEFT JOIN tipo_oferta t ON o.id_tipo_oferta = t.id_tipo_oferta
      LEFT JOIN temporada s ON o.id_temporada = s.id_temporada
      ORDER BY o.fecha_inicio DESC, o.prioridad DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ofertas' });
  }
});

// Endpoint para obtener una oferta por id
app.get('/api/ofertas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener datos principales de la oferta
    const ofertaRes = await pool.query(`
      SELECT 
        o.id_oferta,
        o.nombre,
        o.descripcion,
        o.fecha_inicio,
        o.fecha_fin,
        o.estado,
        o.descuento_porcentaje,
        o.descuento_valor_fijo,
        o.productos_gratis,
        o.se_combina_con_otras,
        o.prioridad,
        o.id_tipo_oferta,
        o.id_temporada,
        o.cantidad_minima,
        o.valor_compra_minima,
        o.limite_usos_por_cliente,
        o.limite_usos_total,
        o.requiere_codigo,
        o.codigo_promocional,
        t.nombre AS tipo_oferta,
        s.nombre AS temporada
      FROM oferta o
      LEFT JOIN tipo_oferta t ON o.id_tipo_oferta = t.id_tipo_oferta
      LEFT JOIN temporada s ON o.id_temporada = s.id_temporada
      WHERE o.id_oferta = $1
      LIMIT 1
    `, [id]);
    if (ofertaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }
    const oferta = ofertaRes.rows[0];

    // Obtener aplicaciones de la oferta
    const aplicacionesRes = await pool.query(
      `SELECT * FROM oferta_aplicacion WHERE id_oferta = $1`, [id]
    );
    oferta.aplicaciones = aplicacionesRes.rows;

    // Obtener criterios de la oferta
    const criteriosRes = await pool.query(
      `SELECT * FROM oferta_criterio WHERE id_oferta = $1`, [id]
    );
    oferta.criterios = criteriosRes.rows;

    res.json(oferta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener oferta' });
  }
});

// Endpoint para el POS: ofertas normalizadas con productos objetivos
app.get('/api/ofertas-para-pos', async (req, res) => {
  try {
    // Traer ofertas activas dentro de rango de fechas
    const ofertasRes = await pool.query(`
      SELECT 
        o.id_oferta,
        o.nombre,
        o.descripcion,
        o.fecha_inicio,
        o.fecha_fin,
        o.estado,
        o.descuento_porcentaje,
        o.descuento_valor_fijo,
        o.productos_gratis,
        t.nombre AS tipo_oferta
      FROM oferta o
      JOIN tipo_oferta t ON t.id_tipo_oferta = o.id_tipo_oferta
      WHERE o.estado = 'activa' AND o.fecha_inicio <= NOW() AND o.fecha_fin >= NOW()
      ORDER BY o.prioridad DESC, o.fecha_inicio DESC
    `);

    const ofertas = ofertasRes.rows;
    const ids = ofertas.map(o => o.id_oferta);
    let aplicaciones = [];
    if (ids.length > 0) {
      const appsRes = await pool.query(
        `SELECT id_oferta, tipo_aplicacion, id_producto, id_categoria, id_cliente, marca 
         FROM oferta_aplicacion 
         WHERE id_oferta = ANY($1::bigint[]) AND estado = 'activo'`,
        [ids]
      );
      aplicaciones = appsRes.rows;
    }

    // Traer catálogo básico de productos activos para expandir por categoría/marca
    const productosRes = await pool.query(
      `SELECT id_producto, id_categoria, COALESCE(marca, '') AS marca 
       FROM producto 
       WHERE estado = 'activo'`
    );
    const productos = productosRes.rows;

    // Normalizar a estructura esperada por el POS
    const normalized = ofertas.map(o => {
      const apps = aplicaciones.filter(a => a.id_oferta === o.id_oferta);
      const productIdSet = new Set();

      // Aplicación directa por producto
      apps
        .filter(a => a.tipo_aplicacion === 'producto' && a.id_producto)
        .forEach(a => productIdSet.add(String(a.id_producto)));

      // Aplicación por categoría
      apps
        .filter(a => a.tipo_aplicacion === 'categoria' && a.id_categoria)
        .forEach(a => {
          productos
            .filter(p => Number(p.id_categoria) === Number(a.id_categoria))
            .forEach(p => productIdSet.add(String(p.id_producto)));
        });

      // Aplicación por marca
      apps
        .filter(a => a.tipo_aplicacion === 'marca' && a.marca)
        .forEach(a => {
          const target = String(a.marca).trim().toLowerCase();
          productos
            .filter(p => String(p.marca).trim().toLowerCase() === target)
            .forEach(p => productIdSet.add(String(p.id_producto)));
        });

      // Aplicación para todos
      if (apps.some(a => a.tipo_aplicacion === 'todos')) {
        productos.forEach(p => productIdSet.add(String(p.id_producto)));
      }

      const productIds = Array.from(productIdSet);

      // Mapear tipo_oferta a tipos del POS
      let type = 'descuento';
      const tipoLower = (o.tipo_oferta || '').toLowerCase();
      if (tipoLower.includes('2x1')) type = '2x1';
      else if (tipoLower.includes('3x2')) type = '3x2';
      else if (tipoLower.includes('combo')) type = 'combo';
      else if (tipoLower.includes('precio')) type = 'precio_especial';

      // Determinar discountType/discountValue
      const hasPct = o.descuento_porcentaje !== null && o.descuento_porcentaje !== undefined;
      const hasFixed = o.descuento_valor_fijo !== null && o.descuento_valor_fijo !== undefined;

      let discountType = hasPct ? 'percentage' : 'fixed';
      let discountValue = hasPct ? Number(o.descuento_porcentaje) : Number(o.descuento_valor_fijo || 0);

      // Si el tipo dice precio especial pero viene porcentaje, tratar como descuento
      if (type === 'precio_especial' && hasPct) {
        type = 'descuento';
        discountType = 'percentage';
        discountValue = Number(o.descuento_porcentaje);
      }

      return {
        id: String(o.id_oferta),
        title: o.nombre,
        description: o.descripcion || '',
        type,
        discount: discountValue,
        discountType,
        discountValue,
        productIds,
        startDate: o.fecha_inicio,
        endDate: o.fecha_fin,
        isActive: true,
        image: '',
        terms: '',
        conditions: '',
        targetAudience: 'general',
        maxRedemptions: null,
        currentRedemptions: 0,
        createdAt: o.fecha_inicio
      };
    });

    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ofertas para POS' });
  }
});
// Endpoint para métricas del dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    // Ventas del mes actual
    const ventasMesRes = await pool.query(`
      SELECT COALESCE(SUM(total_factura),0) AS total
      FROM factura
      WHERE EXTRACT(MONTH FROM fecha_factura) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM fecha_factura) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND estado = 'pagada'
    `);
    const totalSales = Number(ventasMesRes.rows[0].total);

    // Ventas del mes anterior
    const ventasMesAntRes = await pool.query(`
      SELECT COALESCE(SUM(total_factura),0) AS total
      FROM factura
      WHERE fecha_factura >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
        AND fecha_factura < date_trunc('month', CURRENT_DATE)
        AND estado = 'pagada'
    `);
    const totalSalesPrev = Number(ventasMesAntRes.rows[0].total);
    const salesGrowth = totalSalesPrev > 0 ? (((totalSales - totalSalesPrev) / totalSalesPrev) * 100).toFixed(1) : 0;

    // Total productos en catálogo
    const productosRes = await pool.query(`SELECT COUNT(*) AS total FROM producto WHERE estado = 'activo'`);
    const totalProducts = Number(productosRes.rows[0].total);

    // Alertas de stock bajo
    const stockAlertRes = await pool.query(`
      SELECT COUNT(*) AS total
      FROM configuracion_inventario ci
      JOIN producto p ON p.id_producto = ci.id_producto
      LEFT JOIN lote l ON l.id_producto = p.id_producto
      LEFT JOIN lote_inventario li ON li.id_lote = l.id_lote
      WHERE p.estado = 'activo'
        AND COALESCE(li.stock_actual,0) <= ci.stock_minimo
    `);
    const lowStockAlerts = Number(stockAlertRes.rows[0].total);

    // Ofertas activas
    const ofertasRes = await pool.query(`SELECT COUNT(*) AS total FROM oferta WHERE estado = 'activa'`);
    const activeOffers = Number(ofertasRes.rows[0].total);

    // Clientes registrados
    const clientesRes = await pool.query(`SELECT COUNT(*) AS total FROM cliente WHERE estado = 'activo'`);
    const totalCustomers = Number(clientesRes.rows[0].total);

    // Miembros de lealtad (VIP)
    const loyaltyRes = await pool.query(`SELECT COUNT(*) AS total FROM cliente WHERE estado = 'activo' AND es_vip = true`);
    const loyaltyMembers = Number(loyaltyRes.rows[0].total);

    // Ingresos mensuales últimos 6 meses
    const monthlyRevenueRes = await pool.query(`
      SELECT TO_CHAR(fecha_factura, 'Mon YYYY') AS month, SUM(total_factura) AS revenue
      FROM factura
      WHERE estado = 'pagada'
        AND fecha_factura >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY month, date_trunc('month', fecha_factura)
      ORDER BY date_trunc('month', fecha_factura)
    `);
    const monthlyRevenue = monthlyRevenueRes.rows.map(r => ({ month: r.month, revenue: Number(r.revenue) }));

    // Ventas por categoría
    const salesByCategoryRes = await pool.query(`
      SELECT c.nombre AS category, COALESCE(SUM(df.subtotal_linea),0) AS amount
      FROM detalle_factura df
      JOIN producto p ON p.id_producto = df.id_producto
      JOIN categoria_producto c ON c.id_categoria = p.id_categoria
      GROUP BY c.nombre
      ORDER BY amount DESC
    `);
    const totalCategorySales = salesByCategoryRes.rows.reduce((acc, r) => acc + Number(r.amount), 0);
    const salesByCategory = salesByCategoryRes.rows.map(r => ({
      category: r.category,
      amount: Number(r.amount),
      percentage: totalCategorySales > 0 ? ((Number(r.amount) / totalCategorySales) * 100).toFixed(1) : 0
    }));

    // Productos más vendidos (top 5)
    const topProductsRes = await pool.query(`
      SELECT p.id_producto, p.nombre, p.marca, c.nombre AS category, SUM(df.cantidad) AS quantity, SUM(df.subtotal_linea) AS revenue
      FROM detalle_factura df
      JOIN producto p ON p.id_producto = df.id_producto
      JOIN categoria_producto c ON c.id_categoria = p.id_categoria
      GROUP BY p.id_producto, p.nombre, p.marca, c.nombre
      ORDER BY revenue DESC
      LIMIT 5
    `);
    const topSellingProducts = topProductsRes.rows.map(r => ({
      product: {
        id: r.id_producto,
        name: r.nombre,
        brand: r.marca,
        category: r.category
      },
      quantity: Number(r.quantity),
      revenue: Number(r.revenue)
    }));

    res.json({
      totalSales,
      salesGrowth,
      totalProducts,
      lowStockAlerts,
      activeOffers,
      totalCustomers,
      loyaltyMembers,
      monthlyRevenue,
      salesByCategory,
      topSellingProducts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener métricas del dashboard' });
  }
});
