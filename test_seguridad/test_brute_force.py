"""
TEST DE SEGURIDAD: BRUTE FORCE ATTACK
Simula un ataque de fuerza bruta al sistema de login
"""

import requests
from colorama import Fore, Style, init
import time

init(autoreset=True)

BASE_URL = "http://127.0.0.1:5000"

print(f"\n{Fore.CYAN}{'='*60}")
print(f"{Fore.CYAN}💥 TEST 2: BRUTE FORCE ATTACK")
print(f"{Fore.CYAN}{'='*60}\n")

# Contraseñas comunes para probar
common_passwords = [
    "123456", "password", "123456789", "12345678", "12345",
    "1234567", "password1", "admin", "123123", "qwerty",
    "abc123", "letmein", "monkey", "1234567890", "dragon",
    "111111", "baseball", "iloveyou", "master", "sunshine"
]

def test_brute_force_login():
    """Simula ataque de fuerza bruta al login"""
    print(f"{Fore.YELLOW}📌 Simulando ataque de fuerza bruta...")
    print(f"{Fore.YELLOW}   Email objetivo: admin@test.com")
    print(f"{Fore.YELLOW}   Intentos: {len(common_passwords)}\n")
    
    intentos_exitosos = 0
    intentos_bloqueados = 0
    tiempo_inicio = time.time()
    
    for i, password in enumerate(common_passwords, 1):
        data = {
            'Email_sesion': 'admin@test.com',
            'Password_sesion': password
        }
        
        try:
            response = requests.post(f"{BASE_URL}/login", data=data, allow_redirects=False)
            
            if response.status_code == 302 and '/punto_venta' in response.headers.get('Location', ''):
                print(f"{Fore.RED}❌ ACCESO EXITOSO con contraseña: '{password}'")
                intentos_exitosos += 1
                break
            elif response.status_code == 429:  # Too Many Requests
                print(f"{Fore.GREEN}✅ BLOQUEADO: Sistema detectó múltiples intentos")
                intentos_bloqueados += 1
                break
            else:
                print(f"{Fore.YELLOW}[{i}/{len(common_passwords)}] Intentando: {password:<15} - Fallido")
            
            # Pequeña pausa para no saturar (en ataque real no habría pausa)
            time.sleep(0.1)
            
        except Exception as e:
            print(f"{Fore.RED}Error: {e}")
            break
    
    tiempo_total = time.time() - tiempo_inicio
    
    return intentos_exitosos, intentos_bloqueados, tiempo_total, len(common_passwords)

def test_multiple_users():
    """Prueba fuerza bruta contra múltiples usuarios"""
    print(f"\n{Fore.YELLOW}📌 Probando contra múltiples cuentas...")
    
    emails_objetivo = [
        'admin@blancos.com',
        'empleado@blancos.com', 
        'test@test.com',
        'usuario@gmail.com'
    ]
    
    for email in emails_objetivo:
        data = {
            'Email_sesion': email,
            'Password_sesion': '123456'  # Contraseña más común
        }
        
        try:
            response = requests.post(f"{BASE_URL}/login", data=data, allow_redirects=False)
            
            if response.status_code == 302 and '/punto_venta' in response.headers.get('Location', ''):
                print(f"{Fore.RED}❌ VULNERABLE: {email} tiene contraseña débil")
            else:
                print(f"{Fore.GREEN}✅ {email} - Contraseña no es '123456'")
                
        except Exception as e:
            print(f"{Fore.YELLOW}Error con {email}: {e}")

# Ejecutar pruebas
if __name__ == "__main__":
    exitosos, bloqueados, tiempo, total_intentos = test_brute_force_login()
    test_multiple_users()
    
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}📊 RESUMEN DE BRUTE FORCE")
    print(f"{Fore.CYAN}{'='*60}")
    print(f"Total de intentos: {total_intentos}")
    print(f"Tiempo total: {tiempo:.2f} segundos")
    print(f"Velocidad: {total_intentos/tiempo:.1f} intentos/segundo")
    
    if exitosos > 0:
        print(f"{Fore.RED}❌ CRÍTICO: Se obtuvo acceso con contraseña común")
        print(f"{Fore.YELLOW}   Recomendación: Política de contraseñas fuertes")
    elif bloqueados > 0:
        print(f"{Fore.GREEN}✅ PROTEGIDO: Sistema bloqueó intentos múltiples")
    else:
        print(f"{Fore.YELLOW}⚠️ SIN PROTECCIÓN: No hay límite de intentos")
        print(f"{Fore.YELLOW}   Recomendación: Implementar:")
        print(f"{Fore.YELLOW}   - Límite de intentos por IP")
        print(f"{Fore.YELLOW}   - Bloqueo temporal después de X fallos")
        print(f"{Fore.YELLOW}   - CAPTCHA después de 3 intentos")
        print(f"{Fore.YELLOW}   - Rate limiting")
    
    print(f"{Fore.CYAN}{'='*60}\n")
