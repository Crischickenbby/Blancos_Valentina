# 🔐 PRUEBAS DE SEGURIDAD - BLANCOS VALENTINA

## 📋 Índice de Pruebas

Este conjunto de pruebas simula ataques comunes para evaluar la seguridad de la aplicación.

### 1. SQL Injection (Inyección SQL)
**Archivo**: `test_sql_injection.py`
- Intenta inyectar código SQL malicioso en formularios
- Prueba campos de login, búsqueda y registro

### 2. Fuerza Bruta (Brute Force)
**Archivo**: `test_brute_force.py`
- Intenta múltiples combinaciones de contraseñas
- Simula ataque de fuerza bruta al login

### 3. XSS (Cross-Site Scripting)
**Archivo**: `test_xss.py`
- Intenta inyectar scripts maliciosos en campos de texto
- Prueba almacenamiento de datos peligrosos

### 4. CSRF (Cross-Site Request Forgery)
**Archivo**: `test_csrf.py`
- Simula peticiones falsificadas desde otro sitio

### 5. Carga Masiva (DoS - Denial of Service)
**Archivo**: `test_dos.py`
- Envía múltiples peticiones simultáneas
- Prueba resistencia del servidor

### 6. Sesiones y Autenticación
**Archivo**: `test_sesiones.py`
- Intenta acceder sin autenticación
- Prueba robo de sesiones

---

## 🚀 Cómo Ejecutar las Pruebas

### Preparación:
```powershell
# 1. Asegúrate de tener el entorno virtual activo
.\venv\Scripts\Activate.ps1

# 2. Instala dependencias necesarias
pip install requests colorama

# 3. Asegúrate de que tu aplicación esté corriendo
python app.py
```

### Ejecución (en otra terminal):
```powershell
# Ejecutar todas las pruebas
python test_seguridad\ejecutar_todos.py

# O ejecutar pruebas individuales
python test_seguridad\test_sql_injection.py
python test_seguridad\test_brute_force.py
python test_seguridad\test_xss.py
python test_seguridad\test_csrf.py
python test_seguridad\test_dos.py
python test_seguridad\test_sesiones.py
```

---

## 📊 Interpretación de Resultados

### ✅ SEGURO
- La aplicación bloquea o sanitiza el ataque
- Respuestas apropiadas (400, 401, 403)
- No se ejecuta código malicioso

### ⚠️ VULNERABLE
- El ataque tiene éxito parcial
- Necesita mejoras de seguridad
- Se requiere implementar protecciones

### ❌ CRÍTICO
- El ataque tiene éxito completo
- La aplicación está comprometida
- Requiere corrección inmediata

---

## 🛡️ Protecciones Recomendadas

### 1. Para SQL Injection:
- ✅ Ya usas consultas parametrizadas (`%s`)
- ✅ Ya usas psycopg2 que escapa caracteres

### 2. Para Fuerza Bruta:
- ⚠️ Implementar límite de intentos
- ⚠️ Bloqueo temporal después de X intentos
- ⚠️ CAPTCHA después de varios fallos

### 3. Para XSS:
- ⚠️ Sanitizar entradas de usuario
- ⚠️ Usar escape HTML en plantillas
- ✅ Flask ya escapa en Jinja2 por defecto

### 4. Para CSRF:
- ⚠️ Implementar tokens CSRF
- ⚠️ Usar Flask-WTF

### 5. Para DoS:
- ⚠️ Limitar tasa de peticiones (rate limiting)
- ⚠️ Usar Flask-Limiter

### 6. Para Sesiones:
- ✅ Ya usas `@login_required`
- ⚠️ Agregar timeout de sesión
- ⚠️ Regenerar session ID después de login

---

## 📝 Notas para tu Tarea

### Documentación del Reporte:
1. **Vulnerabilidades Encontradas**: Lista de ataques exitosos
2. **Protecciones Existentes**: Lo que ya funciona bien
3. **Mejoras Implementadas**: Soluciones aplicadas
4. **Resultados Antes/Después**: Comparación de resultados

### Estructura Sugerida del Reporte:
```
1. Introducción
2. Metodología de Pruebas
3. Resultados por Tipo de Ataque
4. Análisis de Vulnerabilidades
5. Soluciones Implementadas
6. Conclusiones y Recomendaciones
```

---

## ⚠️ ADVERTENCIA LEGAL

**IMPORTANTE**: Estas pruebas son SOLO para fines educativos en tu propia aplicación.
- ❌ NO uses estos scripts contra aplicaciones de terceros
- ❌ NO realices pruebas sin autorización
- ✅ SOLO para tu proyecto universitario
- ✅ Con tu propia base de datos de pruebas

---

## 🔄 Restaurar Base de Datos

Si algo sale mal durante las pruebas:
```powershell
# Restaurar desde tu backup
psql -U postgres -d Blancos_Valentina < backup.sql
```
