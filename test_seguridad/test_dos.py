"""
TEST DE SEGURIDAD: DoS (Denial of Service)
Simula carga masiva para probar resistencia del servidor
"""

import requests
from colorama import Fore, Style, init
import time
import threading
from concurrent.futures import ThreadPoolExecutor

init(autoreset=True)

BASE_URL = "http://127.0.0.1:5000"

print(f"\n{Fore.CYAN}{'='*60}")
print(f"{Fore.CYAN}💣 TEST 5: DoS (DENIAL OF SERVICE)")
print(f"{Fore.CYAN}{'='*60}\n")
print(f"{Fore.YELLOW}⚠️ ADVERTENCIA: Este test puede hacer lento el servidor")
print(f"{Fore.YELLOW}   durante su ejecución\n")

resultados = {
    'exitosas': 0,
    'fallidas': 0,
    'errores': 0,
    'tiempos': []
}

def hacer_peticion(url, numero):
    """Realiza una petición y registra el resultado"""
    try:
        inicio = time.time()
        response = requests.get(url, timeout=5)
        tiempo = time.time() - inicio
        
        if response.status_code == 200:
            resultados['exitosas'] += 1
            resultados['tiempos'].append(tiempo)
        else:
            resultados['fallidas'] += 1
            
    except requests.exceptions.Timeout:
        resultados['errores'] += 1
        print(f"{Fore.RED}⏱️ Timeout en petición #{numero}")
    except Exception as e:
        resultados['errores'] += 1

def test_carga_simultanea():
    """Prueba con múltiples peticiones simultáneas"""
    print(f"{Fore.YELLOW}📌 Probando carga simultánea...")
    print(f"{Fore.YELLOW}   Enviando 50 peticiones simultáneas...\n")
    
    inicio_total = time.time()
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(hacer_peticion, f"{BASE_URL}/", i) for i in range(50)]
        for future in futures:
            future.result()
    
    tiempo_total = time.time() - inicio_total
    
    print(f"\n{Fore.CYAN}Resultados:")
    print(f"  Exitosas: {resultados['exitosas']}")
    print(f"  Fallidas: {resultados['fallidas']}")
    print(f"  Errores/Timeouts: {resultados['errores']}")
    print(f"  Tiempo total: {tiempo_total:.2f}s")
    
    if resultados['tiempos']:
        tiempo_promedio = sum(resultados['tiempos']) / len(resultados['tiempos'])
        tiempo_max = max(resultados['tiempos'])
        print(f"  Tiempo promedio: {tiempo_promedio:.3f}s")
        print(f"  Tiempo máximo: {tiempo_max:.3f}s")
    
    return resultados['errores']

def test_peticiones_rapidas():
    """Prueba peticiones rápidas secuenciales"""
    print(f"\n{Fore.YELLOW}📌 Probando peticiones rápidas secuenciales...")
    print(f"{Fore.YELLOW}   Enviando 100 peticiones sin pausa...\n")
    
    bloqueado = False
    inicio = time.time()
    
    for i in range(100):
        try:
            response = requests.get(f"{BASE_URL}/", timeout=2)
            
            if response.status_code == 429:  # Too Many Requests
                print(f"{Fore.GREEN}✅ PROTECCIÓN ACTIVA: Rate limiting detectado en petición #{i+1}")
                bloqueado = True
                break
            elif i % 20 == 0:
                print(f"{Fore.YELLOW}   Petición #{i+1} - OK")
                
        except Exception as e:
            if i < 10:  # Solo mostrar primeros errores
                print(f"{Fore.YELLOW}   Error en #{i+1}: {type(e).__name__}")
    
    tiempo_total = time.time() - inicio
    print(f"\n  Completadas en: {tiempo_total:.2f}s")
    print(f"  Velocidad: {100/tiempo_total:.1f} peticiones/segundo")
    
    return bloqueado

def test_carga_api_critica():
    """Prueba carga en API crítica (registro de ventas)"""
    print(f"\n{Fore.YELLOW}📌 Probando carga en API crítica...")
    
    errores = 0
    data = {
        'productos': [{'id': 1, 'cantidad': 1, 'precio': 100}],
        'total': 100,
        'metodo_pago': 1
    }
    
    for i in range(10):
        try:
            response = requests.post(
                f"{BASE_URL}/api/registrar_venta",
                json=data,
                timeout=3
            )
            
            if response.status_code == 500:
                errores += 1
                
        except Exception as e:
            errores += 1
    
    if errores > 0:
        print(f"{Fore.YELLOW}⚠️ {errores}/10 peticiones fallaron bajo carga")
    else:
        print(f"{Fore.GREEN}✅ API manejó la carga correctamente")
    
    return errores

# Ejecutar pruebas
if __name__ == "__main__":
    vulnerabilidades = 0
    
    vulnerabilidades += test_carga_simultanea()
    rate_limit = test_peticiones_rapidas()
    vulnerabilidades += test_carga_api_critica()
    
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}📊 RESUMEN DE DoS")
    print(f"{Fore.CYAN}{'='*60}")
    
    if rate_limit:
        print(f"{Fore.GREEN}✅ PROTEGIDO: Sistema tiene rate limiting")
    else:
        print(f"{Fore.YELLOW}⚠️ SIN PROTECCIÓN: No se detectó rate limiting")
        print(f"{Fore.YELLOW}   Recomendaciones:")
        print(f"{Fore.YELLOW}   - Implementar Flask-Limiter")
        print(f"{Fore.YELLOW}   - Limitar peticiones por IP")
        print(f"{Fore.YELLOW}   - Usar NGINX como proxy reverso")
        print(f"{Fore.YELLOW}   - Implementar Cloudflare o similar")
    
    if vulnerabilidades > 5:
        print(f"{Fore.RED}❌ SERVIDOR VULNERABLE: {vulnerabilidades} errores bajo carga")
    elif vulnerabilidades > 0:
        print(f"{Fore.YELLOW}⚠️ RENDIMIENTO MEJORABLE: {vulnerabilidades} problemas")
    else:
        print(f"{Fore.GREEN}✅ BUEN RENDIMIENTO: Maneja bien la carga")
    
    print(f"{Fore.CYAN}{'='*60}\n")
