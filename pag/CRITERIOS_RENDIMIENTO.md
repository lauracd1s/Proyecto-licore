# 📊 Criterios de Rendimiento - Sistema de Gestión Licore

## 1.1 Criterios de Tiempo de Respuesta
- Carga inicial de página: ≤ 2 segundos (incluyendo React/CSS/JS)
- Consultas AJAX de productos/ofertas: ≤ 1 segundo
- Validación y aplicación de ofertas: ≤ 500 milisegundos
- Consultas a base de datos PostgreSQL: ≤ 200 milisegundos
- Procesamiento de ventas (POS): ≤ 800 milisegundos
- Generación de reportes dinámicos: ≤ 8 segundos

## 1.2 Criterios de Capacidad Web
- Usuarios concurrentes: Soporte para 50 usuarios simultáneos
- Requests por segundo: Mínimo 100 requests/segundo al servidor Node.js
- Tamaño de base de datos: Soporte hasta 20GB de datos transaccionales
- Sessions JWT: Máximo 200 tokens activos simultáneos
- Archivos estáticos: Cache browser de 24 horas para CSS/JS/assets
- Transacciones POS: Hasta 100 ventas simultáneas

## 1.3. Criterios de Disponibilidad Web
- Uptime del servidor: 99.5% (máximo 3.6 horas downtime/mes)
- Tolerancia a errores Node.js: Manejo graceful de errores con restart automático
- Backup PostgreSQL: Respaldo diario automático con retención de 30 días
- Tiempo de recuperación: ≤ 15 minutos para restaurar servicio crítico (POS)
- Replicación de datos: Read replicas para consultas no críticas

## 1.4. Criterios de Escalabilidad Web
- Código modular: Componentes React reutilizables y arquitectura por módulos
- Base de datos: Estructura normalizada PostgreSQL con índices optimizados
- Assets: Optimización de imágenes (WebP, máximo 500KB)
- Paginación: Máximo 50 productos por página para performance
- Load balancing: Distribución de carga entre múltiples instancias Node.js
- CDN: Cloudflare para distribución global de assets estáticos

## 1.5. Criterios de Seguridad Web
- Validación: Sanitización de inputs TypeScript contra injection attacks
- Sessions: JWT con expiración automática después de 15 minutos inactividad
- HTTPS: Obligatorio para todas las páginas (TLS 1.3)
- Passwords: Hash con bcrypt usando salt rounds de 12
- Rate limiting: Máximo 100 requests por minuto por IP
- CORS: Configuración restrictiva solo para dominios autorizados
