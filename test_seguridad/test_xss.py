"""
TEST DE SEGURIDAD: XSS (Cross-Site Scripting)
Intenta inyectar scripts maliciosos en campos de texto
"""

import requests
from colorama import Fore, Style, init

init(autoreset=True)

BASE_URL = "http://127.0.0.1:5000"

print(f"\n{Fore.CYAN}{'='*60}")
print(f"{Fore.CYAN}🔓 TEST 3: XSS (CROSS-SITE SCRIPTING)")
print(f"{Fore.CYAN}{'='*60}\n")

# Payloads XSS comunes
xss_payloads = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg/onload=alert('XSS')>",
    "javascript:alert('XSS')",
    "<iframe src='javascript:alert(1)'>",
    "<body onload=alert('XSS')>",
    "<<SCRIPT>alert('XSS');//<</SCRIPT>",
    "<IMG SRC=\"javascript:alert('XSS');\">",
]

def test_xss_registro():
    """Prueba XSS en el registro de usuarios"""
    print(f"{Fore.YELLOW}📌 Probando XSS en REGISTRO DE USUARIOS...")
    vulnerabilidades = 0
    
    for i, payload in enumerate(xss_payloads, 1):
        data = {
            'fullname': payload,
            'last_name': 'Test',
            'email': f'xsstest{i}@test.com',
            'password': 'test123'
        }
        
        try:
            response = requests.post(f"{BASE_URL}/add_user", data=data, allow_redirects=False)
            
            if response.status_code == 302:
                print(f"{Fore.YELLOW}⚠️ REGISTRADO: '{payload[:40]}...' (verificar si se sanitiza)")
                vulnerabilidades += 1
            elif response.status_code == 400:
                print(f"{Fore.GREEN}✅ RECHAZADO: '{payload[:40]}...'")
            else:
                print(f"{Fore.YELLOW}? RESPUESTA {response.status_code}: '{payload[:40]}...'")
                
        except Exception as e:
            print(f"{Fore.RED}Error: {e}")
    
    return vulnerabilidades

def test_xss_productos():
    """Prueba XSS al agregar productos"""
    print(f"\n{Fore.YELLOW}📌 Probando XSS en AGREGAR PRODUCTOS...")
    
    session = requests.Session()
    
    for i, payload in enumerate(xss_payloads[:3], 1):
        data = {
            'productName': payload,
            'productDescription': payload,
            'productPrice': '100',
            'productQuantity': '10',
            'productCategory': '1'
        }
        
        try:
            response = session.post(f"{BASE_URL}/agregar_producto", data=data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"{Fore.YELLOW}⚠️ PRODUCTO CREADO: '{payload[:40]}...'")
                else:
                    print(f"{Fore.GREEN}✅ RECHAZADO: '{payload[:40]}...'")
            else:
                print(f"{Fore.GREEN}✅ BLOQUEADO: '{payload[:40]}...'")
                
        except Exception as e:
            print(f"{Fore.YELLOW}Error: {e}")

def test_xss_observaciones():
    """Prueba XSS en campo de observaciones (devoluciones)"""
    print(f"\n{Fore.YELLOW}📌 Probando XSS en OBSERVACIONES...")
    
    session = requests.Session()
    
    for payload in xss_payloads[:3]:
        data = {
            'id_venta': '1',
            'productos': [],
            'reintegrar_stock': '0',
            'metodo_reembolso': '1',
            'observaciones': payload
        }
        
        try:
            response = session.post(
                f"{BASE_URL}/api/registrar_devolucion",
                json=data
            )
            
            if response.status_code == 200:
                print(f"{Fore.YELLOW}⚠️ OBSERVACIÓN GUARDADA: '{payload[:40]}...'")
            else:
                print(f"{Fore.GREEN}✅ RECHAZADO: '{payload[:40]}...'")
                
        except Exception as e:
            print(f"{Fore.YELLOW}Info: {e}")

# Ejecutar pruebas
if __name__ == "__main__":
    total_vulnerabilidades = 0
    
    total_vulnerabilidades += test_xss_registro()
    test_xss_productos()
    test_xss_observaciones()
    
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}📊 RESUMEN DE XSS")
    print(f"{Fore.CYAN}{'='*60}")
    
    if total_vulnerabilidades == 0:
        print(f"{Fore.GREEN}✅ BUENA PROTECCIÓN: Flask escapa HTML por defecto")
        print(f"{Fore.GREEN}   Jinja2 protege contra XSS básico")
    else:
        print(f"{Fore.YELLOW}⚠️ POSIBLES VULNERABILIDADES: {total_vulnerabilidades}")
        print(f"{Fore.YELLOW}   Recomendaciones:")
        print(f"{Fore.YELLOW}   - Validar y sanitizar todas las entradas")
        print(f"{Fore.YELLOW}   - Usar |safe solo cuando sea necesario")
        print(f"{Fore.YELLOW}   - Implementar Content Security Policy (CSP)")
        print(f"{Fore.YELLOW}   - Validar tipos de datos en el backend")
    
    print(f"{Fore.CYAN}{'='*60}\n")
