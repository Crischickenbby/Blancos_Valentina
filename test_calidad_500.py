"""
PRUEBA AUTOMATIZADA DE CALIDAD DEL SOFTWARE
Ejecuta 500 transacciones y verifica el requisito de calidad
"""

import requests
import random
import time
from colorama import Fore, Style, init
from quality_monitor import QualityMonitor

init(autoreset=True)

BASE_URL = "http://127.0.0.1:5000"

print(f"\n{Fore.CYAN}{'='*70}")
print(f"{Fore.CYAN}PRUEBA DE CALIDAD DEL SOFTWARE")
print(f"{Fore.CYAN}Requisito: Maximo 1 error por cada 500 transacciones (0.2%)")
print(f"{Fore.CYAN}{'='*70}\n")

# Crear instancia del monitor
monitor = QualityMonitor()

# Preguntar si resetear métricas
print(f"{Fore.YELLOW}Metricas actuales:")
reporte = monitor.get_reporte()
print(f"  Transacciones: {reporte['total_transacciones']}")
print(f"  Errores: {reporte['total_errores']}")
print(f"  Tasa de error: {reporte['tasa_error_actual']}\n")

resetear = input(f"{Fore.YELLOW}Deseas resetear las metricas y empezar desde cero? (S/N): ")
if resetear.upper() == 'S':
    monitor.reset_metrics()
    print(f"{Fore.GREEN}Metricas reseteadas\n")

print(f"{Fore.CYAN}Iniciando prueba de 500 transacciones...")
print(f"{Fore.YELLOW}Esto puede tomar varios minutos...\n")

# Contador de transacciones
transacciones_exitosas = 0
transacciones_error = 0

# Tipos de transacciones a probar
tipos_transacciones = [
    'consulta_productos',
    'busqueda_productos', 
    'acceso_rutas',
    'login_valido',
    'login_invalido'
]

inicio = time.time()

for i in range(500):
    tipo = random.choice(tipos_transacciones)
    exitosa = True
    
    try:
        if tipo == 'consulta_productos':
            # Consultar productos disponibles
            response = requests.get(f"{BASE_URL}/api/productos", timeout=5)
            exitosa = response.status_code == 200
            
        elif tipo == 'busqueda_productos':
            # Buscar productos
            query = random.choice(['camisa', 'pantalon', 'blusa', 'vestido', ''])
            response = requests.get(f"{BASE_URL}/api/buscar_productos", 
                                   params={'q': query}, timeout=5)
            exitosa = response.status_code == 200
            
        elif tipo == 'acceso_rutas':
            # Acceder a diferentes rutas
            ruta = random.choice(['/', '/sesion', '/punto_venta', '/almacen'])
            response = requests.get(f"{BASE_URL}{ruta}", timeout=5)
            # Se considera exitosa si no es error 500
            exitosa = response.status_code != 500
            
        elif tipo == 'login_valido':
            # Intentar login con credenciales válidas de prueba
            data = {
                'Email_sesion': 'test@test.com',
                'Password_sesion': 'test123'
            }
            response = requests.post(f"{BASE_URL}/login", data=data, timeout=5)
            # No importa si es 302 (redireccion) o 401, solo que no sea error 500
            exitosa = response.status_code != 500
            
        elif tipo == 'login_invalido':
            # Login con credenciales inválidas (esperado que falle el login, pero no la transacción)
            data = {
                'Email_sesion': f'user{i}@test.com',
                'Password_sesion': 'wrongpass'
            }
            response = requests.post(f"{BASE_URL}/login", data=data, timeout=5)
            # Se considera exitosa si responde correctamente (aunque sea login fallido)
            exitosa = response.status_code != 500
        
        # Registrar transacción
        if exitosa:
            monitor.registrar_transaccion(tipo, exitosa=True)
            transacciones_exitosas += 1
        else:
            monitor.registrar_transaccion(tipo, exitosa=False)
            transacciones_error += 1
            print(f"{Fore.RED}[{i+1}/500] ERROR en {tipo} - Status: {response.status_code}")
        
        # Mostrar progreso cada 50 transacciones
        if (i + 1) % 50 == 0:
            progreso = ((i + 1) / 500) * 100
            print(f"{Fore.CYAN}[{i+1}/500] Progreso: {progreso:.0f}% - Exitosas: {transacciones_exitosas}, Errores: {transacciones_error}")
    
    except requests.exceptions.Timeout:
        monitor.registrar_transaccion(tipo, exitosa=False)
        transacciones_error += 1
        print(f"{Fore.RED}[{i+1}/500] TIMEOUT en {tipo}")
    
    except Exception as e:
        monitor.registrar_transaccion(tipo, exitosa=False)
        transacciones_error += 1
        if transacciones_error <= 5:  # Solo mostrar primeros 5 errores
            print(f"{Fore.RED}[{i+1}/500] EXCEPCION en {tipo}: {str(e)[:50]}")
    
    # Pequeña pausa para no saturar
    time.sleep(0.01)

tiempo_total = time.time() - inicio

# Generar reporte final
print(f"\n{Fore.CYAN}{'='*70}")
print(f"{Fore.CYAN}RESULTADOS DE LA PRUEBA")
print(f"{Fore.CYAN}{'='*70}\n")

reporte = monitor.get_reporte()

print(f"{Fore.WHITE}Total de transacciones ejecutadas: {Fore.CYAN}{reporte['total_transacciones']}")
print(f"{Fore.WHITE}Transacciones exitosas: {Fore.GREEN}{transacciones_exitosas}")
print(f"{Fore.WHITE}Transacciones con error: {Fore.RED}{reporte['total_errores']}")
print(f"{Fore.WHITE}Tiempo total: {Fore.YELLOW}{tiempo_total:.2f} segundos")
print(f"{Fore.WHITE}Velocidad promedio: {Fore.YELLOW}{500/tiempo_total:.1f} transacciones/segundo\n")

print(f"{Fore.CYAN}ANALISIS DE CALIDAD:")
print(f"{Fore.WHITE}Tasa de error actual: {Fore.YELLOW}{reporte['tasa_error_actual']}")
print(f"{Fore.WHITE}Tasa de error maxima permitida: {Fore.YELLOW}{reporte['tasa_error_maxima']}")
print(f"{Fore.WHITE}Errores permitidos en {reporte['total_transacciones']} transacciones: {Fore.YELLOW}{reporte['errores_permitidos']:.2f}")
print(f"{Fore.WHITE}Errores encontrados: {Fore.YELLOW}{reporte['total_errores']}")

if reporte['errores_restantes'] > 0:
    print(f"{Fore.WHITE}Margen restante: {Fore.GREEN}{reporte['errores_restantes']:.2f} errores\n")
else:
    print(f"{Fore.WHITE}Excedente de errores: {Fore.RED}{abs(reporte['errores_restantes']):.2f}\n")

# Resultado final
print(f"{Fore.CYAN}{'='*70}")
if reporte['cumple_requisito']:
    print(f"{Fore.GREEN}RESULTADO: {reporte['estado']}")
    print(f"{Fore.GREEN}El sistema CUMPLE con el requisito de calidad")
    print(f"{Fore.GREEN}(Maximo 1 error por cada 500 transacciones)")
else:
    print(f"{Fore.RED}RESULTADO: {reporte['estado']}")
    print(f"{Fore.RED}El sistema NO CUMPLE con el requisito de calidad")
    print(f"{Fore.RED}Se requiere optimizacion para reducir errores")
print(f"{Fore.CYAN}{'='*70}\n")

# Detalle por tipo de transacción
print(f"{Fore.CYAN}DETALLE POR TIPO DE TRANSACCION:")
print(f"{Fore.CYAN}{'-'*70}")
for tipo in reporte['transacciones_por_tipo']:
    total = reporte['transacciones_por_tipo'][tipo]
    errores = reporte['errores_por_tipo'].get(tipo, 0)
    tasa = (errores / total * 100) if total > 0 else 0
    print(f"{Fore.WHITE}{tipo:25} | Total: {total:4} | Errores: {errores:2} | Tasa: {tasa:5.2f}%")

print(f"{Fore.CYAN}{'='*70}\n")

# Guardar reporte en archivo
with open('reporte_calidad.txt', 'w', encoding='utf-8') as f:
    f.write("="*70 + "\n")
    f.write("REPORTE DE CALIDAD DEL SOFTWARE\n")
    f.write(f"Fecha: {reporte['ultima_actualizacion']}\n")
    f.write("="*70 + "\n\n")
    
    f.write(f"Total de transacciones: {reporte['total_transacciones']}\n")
    f.write(f"Total de errores: {reporte['total_errores']}\n")
    f.write(f"Tasa de error: {reporte['tasa_error_actual']}\n")
    f.write(f"Tasa maxima permitida: {reporte['tasa_error_maxima']}\n")
    f.write(f"Estado: {reporte['estado']}\n\n")
    
    f.write("Detalle por tipo:\n")
    f.write("-"*70 + "\n")
    for tipo in reporte['transacciones_por_tipo']:
        total = reporte['transacciones_por_tipo'][tipo]
        errores = reporte['errores_por_tipo'].get(tipo, 0)
        tasa = (errores / total * 100) if total > 0 else 0
        f.write(f"{tipo:25} | Total: {total:4} | Errores: {errores:2} | Tasa: {tasa:5.2f}%\n")

print(f"{Fore.GREEN}Reporte guardado en: reporte_calidad.txt\n")
