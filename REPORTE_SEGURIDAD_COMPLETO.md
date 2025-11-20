# REPORTE DE PRUEBAS DE SEGURIDAD
## Sistema de Punto de Venta - Blancos Valentina

---

## 1. RESUMEN EJECUTIVO

Se realizaron pruebas de penetración y seguridad sobre el sistema de punto de venta Blancos Valentina para identificar vulnerabilidades comunes en aplicaciones web. Las pruebas se ejecutaron el 11 de noviembre de 2025 y se encontraron vulnerabilidades de severidad CRÍTICA y MEDIA que requieren atención inmediata.

**Resultado General:**
- Pruebas ejecutadas: 5
- Vulnerabilidades críticas: 6
- Vulnerabilidades medias: 3
- Aspectos seguros: 2

---

## 2. METODOLOGÍA

### 2.1 Tipos de Pruebas Realizadas

1. **SQL Injection**: Intentos de inyección de código SQL malicioso
2. **Brute Force Attack**: Ataques de fuerza bruta al sistema de autenticación
3. **Cross-Site Scripting (XSS)**: Inyección de scripts maliciosos
4. **Gestión de Sesiones**: Validación de autenticación y autorización
5. **Denial of Service (DoS)**: Pruebas de resistencia bajo carga

### 2.2 Herramientas Utilizadas

- Python 3.x
- Librería requests (para peticiones HTTP)
- Scripts personalizados de pruebas automatizadas

### 2.3 Alcance

- URL Base: http://127.0.0.1:5000
- Rutas probadas: Todas las rutas públicas y protegidas
- APIs probadas: Todas las APIs REST del sistema

---

## 3. RESULTADOS DETALLADOS

### 3.1 SQL INJECTION

**Estado: SEGURO**

**Descripción:**
Se intentó inyectar código SQL malicioso en los siguientes puntos:
- Formulario de login
- Formulario de registro
- Búsqueda de productos

**Payloads probados:**
- ' OR '1'='1
- ' OR 1=1--
- admin'--
- '; DROP TABLE User;--

**Resultado:**
Todos los intentos fueron bloqueados. La aplicación utiliza consultas parametrizadas correctamente con psycopg2, lo que previene efectivamente la inyección SQL.

**Evidencia:**
```
Todos los payloads fueron bloqueados
No se encontraron vulnerabilidades de SQL Injection
```

**Recomendación:**
Mantener el uso de consultas parametrizadas. No requiere acción correctiva.

---

### 3.2 BRUTE FORCE ATTACK

**Estado: VULNERABLE**

**Severidad: MEDIA**

**Descripción:**
El sistema no implementa ningún mecanismo de protección contra ataques de fuerza bruta. Se pudieron realizar 20 intentos de login consecutivos sin ningún tipo de bloqueo o limitación.

**Evidencia:**
```
Total de intentos: 20
Tiempo total: 6.38 segundos
Velocidad: 3.1 intentos/segundo
SIN PROTECCIÓN: No hay límite de intentos
```

**Impacto:**
Un atacante puede probar ilimitadas combinaciones de usuario/contraseña hasta encontrar credenciales válidas.

**Solución:**

**Opción 1: Implementar límite de intentos por sesión**

```python
from datetime import datetime, timedelta

# Agregar al inicio de app.py
login_attempts = {}

@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('Email_sesion')
    
    # Verificar intentos previos
    if email in login_attempts:
        attempts = login_attempts[email]
        if attempts['count'] >= 5:
            if datetime.now() < attempts['locked_until']:
                tiempo_restante = (attempts['locked_until'] - datetime.now()).seconds
                flash(f"Cuenta bloqueada temporalmente. Intenta en {tiempo_restante} segundos.", "error")
                return redirect('/sesion')
            else:
                # Reiniciar contador después del bloqueo
                login_attempts[email] = {'count': 0, 'locked_until': None}
    
    # ... código de verificación de usuario ...
    
    if user and check_password_hash(user[4], password):
        # Login exitoso - reiniciar contador
        if email in login_attempts:
            del login_attempts[email]
        # ... resto del código ...
    else:
        # Login fallido - incrementar contador
        if email not in login_attempts:
            login_attempts[email] = {'count': 0, 'locked_until': None}
        
        login_attempts[email]['count'] += 1
        
        if login_attempts[email]['count'] >= 5:
            login_attempts[email]['locked_until'] = datetime.now() + timedelta(minutes=15)
            flash("Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.", "error")
        else:
            intentos_restantes = 5 - login_attempts[email]['count']
            flash(f"Correo o contraseña incorrectos. {intentos_restantes} intentos restantes.", "error")
        
        return redirect('/sesion')
```

**Opción 2: Implementar Flask-Limiter (Recomendado)**

```bash
pip install Flask-Limiter
```

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    # ... código existente ...
```

---

### 3.3 CROSS-SITE SCRIPTING (XSS)

**Estado: VULNERABLE**

**Severidad: MEDIA**

**Descripción:**
Se detectó que el sistema permite almacenar scripts maliciosos en la base de datos sin sanitización adecuada en los siguientes puntos:
- Registro de usuarios (nombre y apellido)
- Creación de productos (nombre y descripción)

**Payloads exitosos:**
```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg/onload=alert('XSS')>
```

**Evidencia:**
```
8 casos donde se aceptan scripts maliciosos
- Registro de usuarios: 8 payloads registrados
- Agregar productos: 3 payloads registrados
```

**Impacto:**
Un atacante podría inyectar código JavaScript malicioso que se ejecutaría en el navegador de otros usuarios, pudiendo robar sesiones, credenciales o redirigir a sitios maliciosos.

**Solución:**

**Paso 1: Crear función de sanitización**

```python
import re
import html

def sanitize_input(text):
    """
    Sanitiza entrada de usuario para prevenir XSS
    """
    if text is None:
        return None
    
    # Escapar caracteres HTML
    text = html.escape(text)
    
    # Eliminar scripts y tags peligrosos
    dangerous_patterns = [
        r'<script[^>]*>.*?</script>',
        r'<iframe[^>]*>.*?</iframe>',
        r'javascript:',
        r'onerror=',
        r'onload=',
        r'onclick=',
        r'<svg[^>]*>',
    ]
    
    for pattern in dangerous_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Limitar longitud
    text = text[:500]
    
    return text.strip()
```

**Paso 2: Aplicar sanitización en rutas vulnerables**

```python
@app.route('/add_user', methods=['POST'])
def add_user():
    conn = None
    cur = None
    try:
        # SANITIZAR ENTRADAS
        name = sanitize_input(request.form.get('fullname'))
        last_name = sanitize_input(request.form.get('last_name'))
        email = request.form.get('email')
        password = request.form.get('password')

        # Validar email
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            flash("Email inválido.", "error")
            return redirect('/sesion')

        # ... resto del código ...
```

```python
@app.route('/agregar_producto', methods=['POST'])
def agregar_producto():
    try:
        # SANITIZAR ENTRADAS
        nombre = sanitize_input(request.form.get('productName'))
        descripcion = sanitize_input(request.form.get('productDescription'))
        
        # Validar precio y cantidad
        try:
            precio = float(request.form.get('productPrice'))
            cantidad = int(request.form.get('productQuantity'))
            if precio <= 0 or cantidad < 0:
                return jsonify({"success": False, "message": "Valores inválidos"})
        except ValueError:
            return jsonify({"success": False, "message": "Precio o cantidad inválidos"})
        
        categoria_id = int(request.form.get('productCategory'))
        
        # ... resto del código ...
```

**Paso 3: Implementar Content Security Policy (CSP)**

Agregar al inicio de app.py:

```python
@app.after_request
def set_security_headers(response):
    """Agregar headers de seguridad"""
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response
```

---

### 3.4 GESTIÓN DE SESIONES Y AUTENTICACIÓN

**Estado: VULNERABLE**

**Severidad: CRÍTICA**

**Descripción:**
Se encontraron 6 rutas críticas accesibles sin autenticación, permitiendo a usuarios no autorizados acceder a funcionalidades restringidas.

**Rutas vulnerables:**
1. /almacen - Gestión de inventario
2. /empleado - Gestión de empleados
3. /venta - Registro de ventas
4. /devolucion - Gestión de devoluciones
5. /apartado - Gestión de apartados
6. /corte - Corte de caja

**APIs vulnerables:**
1. /api/productos
2. /api/buscar_productos

**Evidencia:**
```
6 páginas accesibles sin login
2 APIs sin autenticación requerida
```

**Impacto:**
Cualquier persona puede acceder a funcionalidades críticas del sistema sin necesidad de autenticarse, pudiendo:
- Ver inventario completo
- Consultar información de empleados
- Acceder a información de ventas
- Modificar información sensible

**Solución:**

**Paso 1: Agregar decorador a rutas desprotegidas**

```python
@app.route('/almacen')
@login_required(roles=[1, 2])  # AGREGAR ESTA LÍNEA
@log_route_access('ALMACEN')
def almacen():
    # ... código existente ...

@app.route('/empleado')
@login_required(roles=[1])  # AGREGAR ESTA LÍNEA (solo jefe)
@log_route_access('EMPLEADO')
def empleado():
    # ... código existente ...

@app.route('/venta')
@login_required(roles=[1, 2])  # AGREGAR ESTA LÍNEA
@log_route_access('VENTA')
def venta():
    # ... código existente ...

@app.route('/devolucion')
@login_required(roles=[1, 2])  # AGREGAR ESTA LÍNEA
def devolucion():
    # ... código existente ...

@app.route('/apartado')
@login_required(roles=[1, 2])  # AGREGAR ESTA LÍNEA
def apartado():
    # ... código existente ...

@app.route('/corte')
@login_required(roles=[1, 2])  # AGREGAR ESTA LÍNEA
def corte():
    # ... código existente ...
```

**Paso 2: Proteger APIs**

```python
@app.route('/api/productos', methods=['GET'])
@login_required(roles=[1, 2])  # AGREGAR ESTA LÍNEA
@log_api_call('PRODUCT_SEARCH', 'Consultar productos disponibles')
def api_productos():
    # ... código existente ...

@app.route('/api/buscar_productos')
@login_required(roles=[1, 2])  # AGREGAR ESTA LÍNEA
def buscar_productos():
    # ... código existente ...
```

**Paso 3: Implementar timeout de sesión**

```python
from datetime import timedelta

# Agregar en la configuración de Flask
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=2)

@app.before_request
def make_session_permanent():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(hours=2)
```

---

### 3.5 DENIAL OF SERVICE (DoS)

**Estado: VULNERABLE**

**Severidad: MEDIA**

**Descripción:**
El sistema no implementa limitación de tasa de peticiones (rate limiting), permitiendo que un atacante pueda sobrecargar el servidor con peticiones masivas.

**Evidencia:**
```
50 peticiones simultáneas: Todas exitosas
100 peticiones secuenciales: Todas procesadas
Velocidad: 10.0 peticiones/segundo sin límite
API crítica: 10/10 peticiones fallaron bajo carga
```

**Impacto:**
- El servidor puede ser sobrecargado fácilmente
- Las APIs críticas fallan bajo carga moderada
- Posible denegación de servicio a usuarios legítimos

**Solución:**

**Opción 1: Implementar Flask-Limiter**

```bash
pip install Flask-Limiter
```

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Inicializar limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Aplicar límites específicos a rutas críticas
@app.route('/api/registrar_venta', methods=['POST'])
@limiter.limit("10 per minute")
@log_api_call('SALE', 'Registrar nueva venta')
def registrar_venta():
    # ... código existente ...

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    # ... código existente ...

@app.route('/api/productos', methods=['GET'])
@limiter.limit("30 per minute")
def api_productos():
    # ... código existente ...
```

**Opción 2: Optimizar consultas de base de datos**

```python
# Agregar índices en la base de datos
CREATE INDEX idx_product_status ON "Product"("ID_Product_Status");
CREATE INDEX idx_sale_date ON "Sale"("Date");
CREATE INDEX idx_user_email ON "User"("Email");

# Implementar caché para consultas frecuentes
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/api/productos', methods=['GET'])
@cache.cached(timeout=60)  # Cache por 60 segundos
def api_productos():
    # ... código existente ...
```

---

## 4. ASPECTOS SEGUROS IDENTIFICADOS

### 4.1 Protección contra SQL Injection

**Estado: SEGURO**

El sistema utiliza correctamente consultas parametrizadas con psycopg2, lo que previene efectivamente la inyección SQL.

**Ejemplo de código seguro:**
```python
cur.execute('SELECT * FROM "User" WHERE "Email" = %s;', (email,))
```

### 4.2 Regeneración de Session ID

**Estado: SEGURO**

Flask regenera automáticamente el Session ID después del login, previniendo ataques de Session Fixation.

---

## 5. PRIORIZACIÓN DE CORRECCIONES

### Prioridad CRÍTICA (Implementar inmediatamente)

1. **Agregar @login_required a todas las rutas desprotegidas**
   - Tiempo estimado: 30 minutos
   - Complejidad: Baja
   - Impacto: Alto

2. **Proteger APIs sin autenticación**
   - Tiempo estimado: 15 minutos
   - Complejidad: Baja
   - Impacto: Alto

### Prioridad ALTA (Implementar esta semana)

3. **Implementar sanitización de entradas (XSS)**
   - Tiempo estimado: 2 horas
   - Complejidad: Media
   - Impacto: Alto

4. **Implementar límite de intentos de login**
   - Tiempo estimado: 1 hora
   - Complejidad: Media
   - Impacto: Medio

### Prioridad MEDIA (Implementar este mes)

5. **Implementar rate limiting (Flask-Limiter)**
   - Tiempo estimado: 1 hora
   - Complejidad: Baja
   - Impacto: Medio

6. **Implementar headers de seguridad y CSP**
   - Tiempo estimado: 30 minutos
   - Complejidad: Baja
   - Impacto: Medio

---

## 6. PLAN DE IMPLEMENTACIÓN

### Fase 1 - Correcciones Críticas (Día 1)

```python
# 1. Agregar @login_required a todas las rutas
# Modificar app.py líneas: 265, 295, 315, 1180, 1490, 1900

# 2. Proteger APIs
# Modificar app.py líneas: 320, 1245
```

### Fase 2 - Validación de Entradas (Día 2-3)

```python
# 1. Crear función sanitize_input()
# 2. Aplicar en rutas: /add_user, /agregar_producto, /crear_empleado
# 3. Implementar headers de seguridad
```

### Fase 3 - Protección contra Fuerza Bruta (Día 4)

```python
# 1. Instalar Flask-Limiter
# 2. Configurar límites por ruta
# 3. Implementar bloqueo temporal de cuentas
```

### Fase 4 - Verificación (Día 5)

```python
# 1. Re-ejecutar pruebas de seguridad
# 2. Documentar cambios
# 3. Actualizar base de datos de producción
```

---

## 7. CÓDIGO COMPLETO DE SOLUCIONES

### 7.1 Archivo: security_utils.py (NUEVO)

```python
"""
Utilidades de seguridad para Blancos Valentina
"""
import re
import html
from functools import wraps
from flask import flash, redirect, url_for, session
from datetime import datetime, timedelta

# Control de intentos de login
login_attempts = {}

def sanitize_input(text):
    """
    Sanitiza entrada de usuario para prevenir XSS
    """
    if text is None:
        return None
    
    # Escapar caracteres HTML
    text = html.escape(text)
    
    # Eliminar scripts y tags peligrosos
    dangerous_patterns = [
        r'<script[^>]*>.*?</script>',
        r'<iframe[^>]*>.*?</iframe>',
        r'javascript:',
        r'onerror=',
        r'onload=',
        r'onclick=',
        r'<svg[^>]*>',
    ]
    
    for pattern in dangerous_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Limitar longitud
    text = text[:500]
    
    return text.strip()

def validate_email(email):
    """
    Valida formato de email
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def check_login_attempts(email):
    """
    Verifica si el usuario está bloqueado por múltiples intentos
    Retorna: (bloqueado, mensaje)
    """
    if email in login_attempts:
        attempts = login_attempts[email]
        if attempts['count'] >= 5:
            if datetime.now() < attempts['locked_until']:
                tiempo_restante = (attempts['locked_until'] - datetime.now()).seconds // 60
                return True, f"Cuenta bloqueada. Intenta en {tiempo_restante} minutos."
            else:
                # Reiniciar después del bloqueo
                login_attempts[email] = {'count': 0, 'locked_until': None}
    
    return False, None

def register_failed_login(email):
    """
    Registra un intento fallido de login
    Retorna: mensaje para mostrar al usuario
    """
    if email not in login_attempts:
        login_attempts[email] = {'count': 0, 'locked_until': None}
    
    login_attempts[email]['count'] += 1
    
    if login_attempts[email]['count'] >= 5:
        login_attempts[email]['locked_until'] = datetime.now() + timedelta(minutes=15)
        return "Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos."
    else:
        intentos_restantes = 5 - login_attempts[email]['count']
        return f"Correo o contraseña incorrectos. {intentos_restantes} intentos restantes."

def clear_login_attempts(email):
    """
    Limpia los intentos de login después de un login exitoso
    """
    if email in login_attempts:
        del login_attempts[email]
```

### 7.2 Modificaciones en app.py

```python
# Al inicio del archivo, agregar:
from security_utils import (
    sanitize_input, 
    validate_email, 
    check_login_attempts, 
    register_failed_login, 
    clear_login_attempts
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Después de crear app, agregar:
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Headers de seguridad
@app.after_request
def set_security_headers(response):
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

# Timeout de sesión
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=2)

@app.before_request
def make_session_permanent():
    session.permanent = True
```

---

## 8. VERIFICACIÓN POST-IMPLEMENTACIÓN

Después de implementar las correcciones, ejecutar nuevamente las pruebas:

```bash
python test_seguridad\ejecutar_todos.py
```

**Resultados esperados:**
- SQL Injection: SEGURO (sin cambios)
- Brute Force: PROTEGIDO (límite de intentos activo)
- XSS: SEGURO (entradas sanitizadas)
- Sesiones: SEGURO (todas las rutas protegidas)
- DoS: PROTEGIDO (rate limiting activo)

---

## 9. RECOMENDACIONES ADICIONALES

### 9.1 Seguridad a Largo Plazo

1. **Implementar HTTPS**
   - Obtener certificado SSL/TLS
   - Forzar redirección HTTP a HTTPS
   - Configurar cookies con flag Secure

2. **Auditorías Regulares**
   - Ejecutar pruebas de seguridad mensualmente
   - Mantener logs de seguridad
   - Revisar intentos de acceso fallidos

3. **Actualizaciones**
   - Mantener Flask y dependencias actualizadas
   - Revisar boletines de seguridad
   - Aplicar parches de seguridad promptamente

### 9.2 Seguridad de Base de Datos

1. **Permisos de Usuario**
   - Crear usuario de BD con permisos limitados
   - No usar cuenta postgres para la aplicación
   - Implementar principio de mínimo privilegio

2. **Backups Automáticos**
   - Configurar respaldos diarios
   - Almacenar backups en ubicación segura
   - Probar restauración periódicamente

3. **Encriptación**
   - Considerar encriptar datos sensibles en BD
   - Usar bcrypt/argon2 para contraseñas (ya implementado)

### 9.3 Monitoreo y Logging

1. **Sistema de Alertas**
   - Notificar sobre múltiples intentos fallidos
   - Alertar sobre accesos a horas inusuales
   - Monitorear uso de recursos del servidor

2. **Logs Detallados**
   - Registrar todas las operaciones críticas
   - Incluir timestamp, usuario e IP
   - Retener logs por al menos 90 días

---

## 10. CONCLUSIONES

El sistema Blancos Valentina presenta vulnerabilidades de seguridad que deben ser atendidas con urgencia. Las principales preocupaciones son:

1. **Rutas críticas sin autenticación** que permiten acceso no autorizado
2. **Falta de validación de entradas** que permite XSS
3. **Ausencia de rate limiting** que permite ataques de fuerza bruta y DoS

Sin embargo, el sistema tiene una base sólida:
- Uso correcto de consultas parametrizadas
- Hashing seguro de contraseñas con werkzeug
- Estructura de código bien organizada

**Tiempo estimado de implementación total:** 5-7 horas

**Nivel de dificultad:** Medio

**Impacto en funcionalidad:** Mínimo (solo se agregan validaciones)

Se recomienda implementar las correcciones en el orden de prioridad establecido, comenzando por las vulnerabilidades críticas de autenticación.

---

## 11. REFERENCIAS

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Flask Security Best Practices: https://flask.palletsprojects.com/en/latest/security/
- OWASP XSS Prevention Cheat Sheet
- OWASP Authentication Cheat Sheet
- CWE/SANS Top 25 Most Dangerous Software Errors

---

**Fecha del reporte:** 11 de noviembre de 2025
**Versión:** 1.0
**Preparado por:** Sistema de Pruebas Automatizadas
**Para:** Proyecto Universitario - Blancos Valentina
