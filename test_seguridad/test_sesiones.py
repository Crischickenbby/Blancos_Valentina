"""
TEST DE SEGURIDAD: SESIONES Y AUTENTICACIÓN
Prueba vulnerabilidades en manejo de sesiones
"""

import requests
from colorama import Fore, Style, init

init(autoreset=True)

BASE_URL = "http://127.0.0.1:5000"

print(f"\n{Fore.CYAN}{'='*60}")
print(f"{Fore.CYAN}🔑 TEST 4: SESIONES Y AUTENTICACIÓN")
print(f"{Fore.CYAN}{'='*60}\n")

def test_acceso_sin_autenticacion():
    """Intenta acceder a páginas protegidas sin login"""
    print(f"{Fore.YELLOW}📌 Probando acceso sin autenticación...")
    
    rutas_protegidas = [
        '/punto_venta',
        '/almacen',
        '/empleado',
        '/venta',
        '/devolucion',
        '/apartado',
        '/corte'
    ]
    
    vulnerabilidades = 0
    
    for ruta in rutas_protegidas:
        try:
            response = requests.get(f"{BASE_URL}{ruta}", allow_redirects=False)
            
            if response.status_code == 200:
                print(f"{Fore.RED}❌ VULNERABLE: {ruta} - Accesible sin login")
                vulnerabilidades += 1
            elif response.status_code == 302:
                location = response.headers.get('Location', '')
                if '/sesion' in location or '/login' in location:
                    print(f"{Fore.GREEN}✅ PROTEGIDO: {ruta} - Redirige a login")
                else:
                    print(f"{Fore.YELLOW}⚠️ {ruta} - Redirige a: {location}")
            else:
                print(f"{Fore.YELLOW}? {ruta} - Status: {response.status_code}")
                
        except Exception as e:
            print(f"{Fore.RED}Error con {ruta}: {e}")
    
    return vulnerabilidades

def test_session_fixation():
    """Prueba si se regenera el session ID después del login"""
    print(f"\n{Fore.YELLOW}📌 Probando Session Fixation...")
    
    session = requests.Session()
    
    # Obtener cookie inicial
    response1 = session.get(f"{BASE_URL}/sesion")
    cookie_antes = session.cookies.get('session')
    
    # Hacer login (con credenciales de prueba - ajusta según necesites)
    login_data = {
        'Email_sesion': 'test@test.com',
        'Password_sesion': 'test123'
    }
    response2 = session.post(f"{BASE_URL}/login", data=login_data)
    cookie_despues = session.cookies.get('session')
    
    if cookie_antes == cookie_despues:
        print(f"{Fore.YELLOW}⚠️ POSIBLE VULNERABILIDAD: Session ID no cambia después del login")
        print(f"{Fore.YELLOW}   Cookie antes: {cookie_antes[:20] if cookie_antes else 'None'}...")
        print(f"{Fore.YELLOW}   Cookie después: {cookie_despues[:20] if cookie_despues else 'None'}...")
        return 1
    else:
        print(f"{Fore.GREEN}✅ SEGURO: Session ID se regenera después del login")
        return 0

def test_apis_sin_autenticacion():
    """Prueba APIs que podrían no requerir autenticación"""
    print(f"\n{Fore.YELLOW}📌 Probando APIs sin autenticación...")
    
    apis = [
        '/api/productos',
        '/api/registrar_venta',
        '/api/buscar_productos',
        '/api/buscar_venta'
    ]
    
    vulnerabilidades = 0
    
    for api in apis:
        try:
            if 'POST' in api or 'registrar' in api:
                response = requests.post(f"{BASE_URL}{api}", json={})
            else:
                response = requests.get(f"{BASE_URL}{api}")
            
            if response.status_code == 200:
                print(f"{Fore.YELLOW}⚠️ {api} - Accesible sin autenticación")
                vulnerabilidades += 1
            elif response.status_code in [401, 403]:
                print(f"{Fore.GREEN}✅ {api} - Requiere autenticación")
            else:
                print(f"{Fore.YELLOW}? {api} - Status: {response.status_code}")
                
        except Exception as e:
            print(f"{Fore.YELLOW}Error: {e}")
    
    return vulnerabilidades

def test_cookie_security():
    """Verifica la configuración de cookies"""
    print(f"\n{Fore.YELLOW}📌 Analizando configuración de cookies...")
    
    session = requests.Session()
    response = session.get(f"{BASE_URL}/sesion")
    
    cookie = session.cookies.get('session', domain='.127.0.0.1')
    
    problemas = 0
    
    if cookie:
        # Verificar flags de seguridad
        cookie_obj = session.cookies._cookies.get('127.0.0.1', {}).get('/', {}).get('session')
        
        if cookie_obj:
            if not cookie_obj.secure:
                print(f"{Fore.YELLOW}⚠️ Cookie sin flag 'Secure' (OK para desarrollo local)")
            else:
                print(f"{Fore.GREEN}✅ Cookie tiene flag 'Secure'")
            
            if not cookie_obj.has_nonstandard_attr('HttpOnly'):
                print(f"{Fore.YELLOW}⚠️ Cookie sin flag 'HttpOnly'")
                problemas += 1
            else:
                print(f"{Fore.GREEN}✅ Cookie tiene flag 'HttpOnly'")
    else:
        print(f"{Fore.YELLOW}⚠️ No se pudo analizar la cookie")
    
    return problemas

# Ejecutar pruebas
if __name__ == "__main__":
    total_vulnerabilidades = 0
    
    total_vulnerabilidades += test_acceso_sin_autenticacion()
    total_vulnerabilidades += test_session_fixation()
    total_vulnerabilidades += test_apis_sin_autenticacion()
    total_vulnerabilidades += test_cookie_security()
    
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}📊 RESUMEN DE SESIONES")
    print(f"{Fore.CYAN}{'='*60}")
    
    if total_vulnerabilidades == 0:
        print(f"{Fore.GREEN}✅ SISTEMA SEGURO: Buen manejo de sesiones")
    elif total_vulnerabilidades <= 2:
        print(f"{Fore.YELLOW}⚠️ MEJORAS NECESARIAS: {total_vulnerabilidades} problemas menores")
        print(f"{Fore.YELLOW}   Recomendaciones:")
        print(f"{Fore.YELLOW}   - Implementar timeout de sesión")
        print(f"{Fore.YELLOW}   - Regenerar session ID después de login")
        print(f"{Fore.YELLOW}   - Configurar cookies HttpOnly y Secure")
    else:
        print(f"{Fore.RED}❌ VULNERABILIDADES CRÍTICAS: {total_vulnerabilidades}")
        print(f"{Fore.YELLOW}   Acción requerida inmediata")
    
    print(f"{Fore.CYAN}{'='*60}\n")
