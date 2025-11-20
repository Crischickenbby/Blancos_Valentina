"""
EJECUTOR DE TODAS LAS PRUEBAS DE SEGURIDAD
Ejecuta todos los tests de seguridad y genera un resumen
"""

import subprocess
import sys
from colorama import Fore, Style, init
import time

init(autoreset=True)

print(f"{Fore.CYAN}{'='*60}")
print(f"{Fore.CYAN}🛡️  SUITE COMPLETA DE PRUEBAS DE SEGURIDAD")
print(f"{Fore.CYAN}    Blancos Valentina - Test Universitario")
print(f"{Fore.CYAN}{'='*60}\n")

pruebas = [
    ("test_sql_injection.py", "SQL Injection"),
    ("test_brute_force.py", "Brute Force"),
    ("test_xss.py", "XSS (Cross-Site Scripting)"),
    ("test_sesiones.py", "Sesiones y Autenticación"),
    ("test_dos.py", "DoS (Denial of Service)"),
]

resultados = []

print(f"{Fore.YELLOW}⚠️ IMPORTANTE:")
print(f"{Fore.YELLOW}   Asegúrate de que tu aplicación esté corriendo")
print(f"{Fore.YELLOW}   en http://127.0.0.1:5000\n")

input(f"{Fore.CYAN}Presiona ENTER para comenzar...")

inicio_total = time.time()

for archivo, nombre in pruebas:
    print(f"\n{Fore.MAGENTA}{'='*60}")
    print(f"{Fore.MAGENTA}▶️  Ejecutando: {nombre}")
    print(f"{Fore.MAGENTA}{'='*60}\n")
    
    try:
        inicio = time.time()
        resultado = subprocess.run(
            [sys.executable, f"test_seguridad\\{archivo}"],
            capture_output=False,
            text=True
        )
        tiempo = time.time() - inicio
        
        resultados.append({
            'nombre': nombre,
            'exitoso': resultado.returncode == 0,
            'tiempo': tiempo
        })
        
        time.sleep(1)  # Pausa entre pruebas
        
    except Exception as e:
        print(f"{Fore.RED}❌ Error ejecutando {nombre}: {e}")
        resultados.append({
            'nombre': nombre,
            'exitoso': False,
            'tiempo': 0
        })

tiempo_total = time.time() - inicio_total

# Resumen final
print(f"\n{Fore.CYAN}{'='*60}")
print(f"{Fore.CYAN}📊 RESUMEN GENERAL DE TODAS LAS PRUEBAS")
print(f"{Fore.CYAN}{'='*60}\n")

for res in resultados:
    estado = f"{Fore.GREEN}✅ COMPLETADO" if res['exitoso'] else f"{Fore.RED}❌ ERROR"
    print(f"{estado} - {res['nombre']:<30} ({res['tiempo']:.1f}s)")

print(f"\n{Fore.CYAN}Tiempo total: {tiempo_total:.1f} segundos")

exitosas = sum(1 for r in resultados if r['exitoso'])
print(f"\n{Fore.CYAN}Pruebas completadas: {exitosas}/{len(pruebas)}")

print(f"\n{Fore.CYAN}{'='*60}")
print(f"{Fore.CYAN}📝 SIGUIENTE PASO:")
print(f"{Fore.CYAN}{'='*60}")
print(f"{Fore.YELLOW}1. Revisa los resultados arriba")
print(f"{Fore.YELLOW}2. Identifica las vulnerabilidades encontradas")
print(f"{Fore.YELLOW}3. Implementa las soluciones recomendadas")
print(f"{Fore.YELLOW}4. Vuelve a ejecutar las pruebas")
print(f"{Fore.YELLOW}5. Documenta todo para tu reporte universitario")
print(f"{Fore.CYAN}{'='*60}\n")
