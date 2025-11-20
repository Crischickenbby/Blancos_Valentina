"""
DASHBOARD DE CALIDAD
Muestra las métricas de calidad en tiempo real
"""

from quality_monitor import QualityMonitor
from colorama import Fore, Style, init
import json

init(autoreset=True)

monitor = QualityMonitor()
reporte = monitor.get_reporte()

print(f"\n{Fore.CYAN}{'='*70}")
print(f"{Fore.CYAN}DASHBOARD DE CALIDAD DEL SOFTWARE")
print(f"{Fore.CYAN}{'='*70}\n")

# Métricas principales
print(f"{Fore.WHITE}METRICAS PRINCIPALES:")
print(f"{Fore.CYAN}{'-'*70}")
print(f"{Fore.WHITE}Total de transacciones: {Fore.YELLOW}{reporte['total_transacciones']}")
print(f"{Fore.WHITE}Total de errores: {Fore.YELLOW}{reporte['total_errores']}")
print(f"{Fore.WHITE}Tasa de error actual: {Fore.YELLOW}{reporte['tasa_error_actual']}")
print(f"{Fore.WHITE}Tasa maxima permitida: {Fore.YELLOW}{reporte['tasa_error_maxima']}")
print(f"{Fore.WHITE}Ultima actualizacion: {Fore.YELLOW}{reporte['ultima_actualizacion'] or 'N/A'}\n")

# Análisis de cumplimiento
print(f"{Fore.WHITE}ANALISIS DE CUMPLIMIENTO:")
print(f"{Fore.CYAN}{'-'*70}")
print(f"{Fore.WHITE}Errores permitidos: {Fore.YELLOW}{reporte['errores_permitidos']:.2f}")
print(f"{Fore.WHITE}Errores encontrados: {Fore.YELLOW}{reporte['total_errores']}")

if reporte['errores_restantes'] > 0:
    print(f"{Fore.WHITE}Margen restante: {Fore.GREEN}{reporte['errores_restantes']:.2f} errores")
else:
    print(f"{Fore.WHITE}Excedente de errores: {Fore.RED}{abs(reporte['errores_restantes']):.2f}")

print()

# Estado
if reporte['cumple_requisito']:
    print(f"{Fore.GREEN}ESTADO: {reporte['estado']}")
    print(f"{Fore.GREEN}El sistema CUMPLE con el requisito de calidad\n")
else:
    print(f"{Fore.RED}ESTADO: {reporte['estado']}")
    print(f"{Fore.RED}El sistema NO CUMPLE con el requisito de calidad\n")

# Detalle por tipo
if reporte['transacciones_por_tipo']:
    print(f"{Fore.WHITE}DETALLE POR TIPO DE TRANSACCION:")
    print(f"{Fore.CYAN}{'-'*70}")
    
    for tipo in sorted(reporte['transacciones_por_tipo'].keys()):
        total = reporte['transacciones_por_tipo'][tipo]
        errores = reporte['errores_por_tipo'].get(tipo, 0)
        tasa = (errores / total * 100) if total > 0 else 0
        
        color = Fore.GREEN if tasa < 0.2 else Fore.YELLOW if tasa < 0.5 else Fore.RED
        print(f"{Fore.WHITE}{tipo:25} | Total: {total:4} | Errores: {errores:2} | Tasa: {color}{tasa:5.2f}%")
    
    print()
else:
    print(f"{Fore.YELLOW}No hay transacciones registradas aun\n")

# Barra de progreso visual
if reporte['total_transacciones'] > 0:
    print(f"{Fore.WHITE}PROGRESO HACIA 500 TRANSACCIONES:")
    print(f"{Fore.CYAN}{'-'*70}")
    
    progreso = min(reporte['total_transacciones'] / 500 * 100, 100)
    barra_llena = int(progreso / 2)
    barra_vacia = 50 - barra_llena
    
    barra = f"[{Fore.GREEN}{'█' * barra_llena}{Fore.WHITE}{'░' * barra_vacia}] {progreso:.1f}%"
    print(barra)
    print(f"{Fore.WHITE}Transacciones: {reporte['total_transacciones']}/500\n")

print(f"{Fore.CYAN}{'='*70}\n")

# Recomendaciones
if not reporte['cumple_requisito'] and reporte['total_transacciones'] > 100:
    print(f"{Fore.YELLOW}RECOMENDACIONES:")
    print(f"{Fore.YELLOW}{'-'*70}")
    print(f"{Fore.YELLOW}1. Revisar los tipos de transacciones con mayor tasa de error")
    print(f"{Fore.YELLOW}2. Implementar manejo de excepciones mas robusto")
    print(f"{Fore.YELLOW}3. Optimizar consultas a la base de datos")
    print(f"{Fore.YELLOW}4. Agregar validacion de datos de entrada")
    print(f"{Fore.YELLOW}5. Implementar logs detallados para debugging\n")
