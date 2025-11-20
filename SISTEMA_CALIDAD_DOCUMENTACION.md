# DOCUMENTACION DEL SISTEMA DE CALIDAD

## Requisito de Calidad

**Especificacion:** El sistema debe tener como maximo 1 error por cada 500 transacciones.

**Tasa de error maxima permitida:** 0.2% (1/500 = 0.002)

## Archivos del Sistema

### 1. quality_monitor.py
Monitor de calidad que registra todas las transacciones y errores.

**Funciones principales:**
- `registrar_transaccion(tipo, exitosa)` - Registra una transaccion
- `get_tasa_error()` - Calcula la tasa de error actual
- `cumple_requisito()` - Verifica si se cumple el requisito
- `get_reporte()` - Genera reporte completo

### 2. test_calidad_500.py
Script de prueba que ejecuta 500 transacciones automaticamente.

**Que hace:**
- Ejecuta 500 transacciones de diferentes tipos
- Registra exitosas y con errores
- Genera reporte de cumplimiento
- Guarda resultados en reporte_calidad.txt

**Uso:**
```bash
python test_calidad_500.py
```

### 3. ver_calidad.py
Dashboard que muestra las metricas actuales.

**Uso:**
```bash
python ver_calidad.py
```

### 4. quality_metrics.json
Archivo JSON que almacena las metricas.

**Estructura:**
```json
{
    "total_transacciones": 500,
    "total_errores": 1,
    "transacciones_por_tipo": {},
    "errores_por_tipo": {},
    "ultima_actualizacion": "2025-11-12T..."
}
```

## Como Usar el Sistema

### Ejecutar Prueba Completa
```bash
# 1. Asegurate de que la aplicacion este corriendo
python app.py

# 2. En otra terminal, ejecuta la prueba
python test_calidad_500.py
```

### Ver Estado Actual
```bash
python ver_calidad.py
```

### Integrar con la Aplicacion (Opcional)

Para registrar transacciones en produccion, agregar a app.py:

```python
from quality_monitor import registrar_transaccion_exitosa, registrar_transaccion_error

@app.route('/api/registrar_venta', methods=['POST'])
def registrar_venta():
    try:
        # ... codigo existente ...
        registrar_transaccion_exitosa('venta')
        return jsonify({'message': 'Venta registrada exitosamente'}), 200
    except Exception as e:
        registrar_transaccion_error('venta')
        return jsonify({'message': 'Error al registrar la venta'}), 500
```

## Interpretacion de Resultados

### Estado: APROBADO
El sistema cumple con el requisito de calidad.
- Tasa de error <= 0.2%
- Maximo 1 error por cada 500 transacciones

### Estado: NO CUMPLE
El sistema NO cumple con el requisito.
- Tasa de error > 0.2%
- Mas de 1 error por cada 500 transacciones
- Requiere optimizacion

## Tipos de Transacciones Probadas

1. **consulta_productos** - GET /api/productos
2. **busqueda_productos** - GET /api/buscar_productos?q=...
3. **acceso_rutas** - GET /, /sesion, /punto_venta, /almacen
4. **login_valido** - POST /login (credenciales correctas)
5. **login_invalido** - POST /login (credenciales incorrectas)

## Que se Considera un Error

- Status code 500 (Internal Server Error)
- Timeout de peticion (>5 segundos)
- Excepciones no manejadas
- Errores de conexion a base de datos

## Que NO se Considera un Error

- Login fallido por credenciales incorrectas (status 302/401)
- Redireccion por falta de autenticacion (status 302)
- Validaciones de negocio (status 400)

## Metricas Calculadas

1. **Total de transacciones**: Suma de todas las transacciones ejecutadas
2. **Total de errores**: Suma de transacciones con error
3. **Tasa de error**: errores / transacciones
4. **Errores permitidos**: transacciones / 500
5. **Errores restantes**: errores_permitidos - errores_encontrados

## Ejemplo de Reporte

```
Total de transacciones: 500
Total de errores: 1
Tasa de error actual: 0.2000%
Tasa maxima permitida: 0.2000%
Errores permitidos: 1.00
Errores encontrados: 1

RESULTADO: APROBADO
El sistema CUMPLE con el requisito de calidad
```

## Reiniciar Metricas

Para empezar una nueva prueba desde cero:

```python
from quality_monitor import QualityMonitor

monitor = QualityMonitor()
monitor.reset_metrics()
```

O cuando ejecutes test_calidad_500.py, responde "S" cuando pregunte si deseas resetear.

## Archivos Generados

- `quality_metrics.json` - Metricas acumuladas
- `reporte_calidad.txt` - Ultimo reporte generado

## Notas Importantes

1. Las metricas son acumulativas (se suman entre ejecuciones)
2. Puedes resetear en cualquier momento
3. El sistema registra por tipo de transaccion
4. Los reportes se guardan automaticamente
5. Puedes integrar el monitor en produccion

## Para tu Tarea Universitaria

### Evidencia a Incluir

1. Captura de pantalla de la ejecucion de test_calidad_500.py
2. Archivo reporte_calidad.txt completo
3. Captura del dashboard (ver_calidad.py)
4. Archivo quality_metrics.json
5. Explicacion del cumplimiento del requisito

### Estructura del Reporte

```
1. Requisito de Calidad
   - Especificacion: Max 1 error / 500 transacciones
   - Formula: Tasa <= 0.2%

2. Metodologia de Prueba
   - 500 transacciones automatizadas
   - 5 tipos de transacciones diferentes
   - Registro automatico de errores

3. Resultados
   - Total transacciones: X
   - Total errores: Y
   - Tasa de error: Z%
   - Estado: APROBADO/NO CUMPLE

4. Evidencia
   - Capturas de pantalla
   - Archivos de reporte
   - Logs del sistema

5. Conclusion
   - Cumplimiento del requisito
   - Areas de mejora
   - Recomendaciones
```
