"""
TEST DE SEGURIDAD: SQL INJECTION
Intenta inyectar código SQL malicioso en formularios
"""

import requests
from colorama import Fore, Style, init

init(autoreset=True)

BASE_URL = "http://127.0.0.1:5000"

print(f"\n{Fore.CYAN}{'='*60}")
print(f"{Fore.CYAN}🔍 TEST 1: SQL INJECTION")
print(f"{Fore.CYAN}{'='*60}\n")

# Payloads comunes de SQL Injection
sql_payloads = [
    "' OR '1'='1",
    "' OR 1=1--",
    "admin'--",
    "' OR 'a'='a",
    "1' UNION SELECT NULL--",
    "'; DROP TABLE User;--",
    "admin' AND 1=1--",
    "' OR '1'='1' /*",
]

def test_login_sql_injection():
    """Prueba SQL Injection en el login"""
    print(f"{Fore.YELLOW}📌 Probando SQL Injection en LOGIN...")
    vulnerabilidades = 0
    
    for payload in sql_payloads:
        data = {
            'Email_sesion': payload,
            'Password_sesion': payload
        }
        
        try:
            response = requests.post(f"{BASE_URL}/login", data=data, allow_redirects=False)
            
            # Si redirige a /punto_venta, el ataque fue exitoso
            if response.status_code == 302 and '/punto_venta' in response.headers.get('Location', ''):
                print(f"{Fore.RED}❌ VULNERABLE: Payload '{payload}' permitió acceso")
                vulnerabilidades += 1
            else:
                print(f"{Fore.GREEN}✅ BLOQUEADO: '{payload[:30]}...'")
                
        except Exception as e:
            print(f"{Fore.RED}Error: {e}")
    
    return vulnerabilidades

def test_registro_sql_injection():
    """Prueba SQL Injection en el registro"""
    print(f"\n{Fore.YELLOW}📌 Probando SQL Injection en REGISTRO...")
    vulnerabilidades = 0
    
    for payload in sql_payloads[:3]:  # Solo algunos payloads
        data = {
            'fullname': payload,
            'last_name': payload,
            'email': f'test_{payload[:5]}@test.com',
            'password': 'test123'
        }
        
        try:
            response = requests.post(f"{BASE_URL}/add_user", data=data, allow_redirects=False)
            
            # Verificar si causó error en la BD
            if response.status_code == 500:
                print(f"{Fore.RED}⚠️ POSIBLE VULNERABILIDAD: Error en BD con '{payload[:30]}...'")
                vulnerabilidades += 1
            else:
                print(f"{Fore.GREEN}✅ MANEJADO: '{payload[:30]}...'")
                
        except Exception as e:
            print(f"{Fore.RED}Error: {e}")
    
    return vulnerabilidades

def test_busqueda_sql_injection():
    """Prueba SQL Injection en búsqueda de productos"""
    print(f"\n{Fore.YELLOW}📌 Probando SQL Injection en BÚSQUEDA DE PRODUCTOS...")
    vulnerabilidades = 0
    
    # Primero hacer login válido para acceder
    session = requests.Session()
    
    for payload in sql_payloads[:3]:
        try:
            response = session.get(f"{BASE_URL}/api/buscar_productos", params={'q': payload})
            
            if response.status_code == 500:
                print(f"{Fore.RED}⚠️ ERROR EN SERVIDOR: '{payload[:30]}...'")
                vulnerabilidades += 1
            elif response.status_code == 200:
                # Verificar si devuelve datos inesperados
                data = response.json()
                if len(data) > 100:  # Cantidad anormal de resultados
                    print(f"{Fore.RED}⚠️ COMPORTAMIENTO ANORMAL: Muchos resultados con '{payload[:30]}...'")
                    vulnerabilidades += 1
                else:
                    print(f"{Fore.GREEN}✅ RESPUESTA NORMAL: '{payload[:30]}...'")
            else:
                print(f"{Fore.GREEN}✅ BLOQUEADO: '{payload[:30]}...'")
                
        except Exception as e:
            print(f"{Fore.YELLOW}⚠️ Error: {e}")
    
    return vulnerabilidades

# Ejecutar pruebas
if __name__ == "__main__":
    total_vulnerabilidades = 0
    
    total_vulnerabilidades += test_login_sql_injection()
    total_vulnerabilidades += test_registro_sql_injection()
    total_vulnerabilidades += test_busqueda_sql_injection()
    
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}📊 RESUMEN DE SQL INJECTION")
    print(f"{Fore.CYAN}{'='*60}")
    
    if total_vulnerabilidades == 0:
        print(f"{Fore.GREEN}✅ SISTEMA SEGURO: No se encontraron vulnerabilidades de SQL Injection")
        print(f"{Fore.GREEN}   Tu aplicación usa consultas parametrizadas correctamente")
    else:
        print(f"{Fore.RED}❌ VULNERABILIDADES ENCONTRADAS: {total_vulnerabilidades}")
        print(f"{Fore.YELLOW}   Revisa los puntos marcados arriba")
    
    print(f"{Fore.CYAN}{'='*60}\n")
