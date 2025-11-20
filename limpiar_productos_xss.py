"""
Script para limpiar productos con contenido XSS de la base de datos
Ejecutar después de las pruebas de seguridad
"""

from config import get_db_connection

def limpiar_productos_xss():
    """Elimina productos que contienen código XSS"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Patrones XSS comunes a buscar
        patrones_xss = [
            '<script',
            'javascript:',
            'onerror=',
            'onload=',
            '<iframe',
            '<svg',
            '<img src=x'
        ]
        
        # Contar productos afectados (sin importar el estado)
        query_count = '''
            SELECT COUNT(*) FROM "Product" 
            WHERE "Name" LIKE %s OR "Description" LIKE %s
        '''
        
        total_afectados = 0
        for patron in patrones_xss:
            cur.execute(query_count, (f'%{patron}%', f'%{patron}%'))
            count = cur.fetchone()[0]
            if count > 0:
                print(f"Productos con '{patron}': {count}")
                total_afectados += count
        
        if total_afectados == 0:
            print("\nNo se encontraron productos con contenido XSS")
            return
        
        print(f"\nTotal de productos afectados: {total_afectados}")
        confirmacion = input("\n¿Deseas eliminar estos productos? (S/N): ")
        
        if confirmacion.upper() == 'S':
            # ELIMINAR PERMANENTEMENTE productos con XSS
            for patron in patrones_xss:
                query_delete = '''
                    DELETE FROM "Product"
                    WHERE "Name" LIKE %s OR "Description" LIKE %s
                '''
                cur.execute(query_delete, (f'%{patron}%', f'%{patron}%'))
            
            conn.commit()
            print(f"\n✓ {total_afectados} productos eliminados permanentemente")
            print("Los productos con contenido XSS han sido eliminados de la base de datos")
        else:
            print("\nOperación cancelada")
        
        # Mostrar productos activos restantes
        cur.execute('SELECT COUNT(*) FROM "Product" WHERE "ID_Product_Status" = 1')
        productos_activos = cur.fetchone()[0]
        print(f"\nProductos activos restantes: {productos_activos}")
        
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("="*60)
    print("LIMPIEZA DE PRODUCTOS CON CONTENIDO XSS")
    print("="*60)
    print("\nEste script eliminará productos creados durante las pruebas")
    print("de seguridad que contienen código malicioso.\n")
    
    limpiar_productos_xss()
