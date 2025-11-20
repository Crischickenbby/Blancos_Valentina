"""
SISTEMA DE MEDICIÓN DE CALIDAD DEL SOFTWARE
Requisito: Máximo 1 error por cada 500 transacciones

Este sistema registra y analiza todas las transacciones para verificar
el cumplimiento del requisito de calidad.
"""

import psycopg2
from datetime import datetime
import json
import os

class QualityMonitor:
    """Monitor de calidad del software"""
    
    def __init__(self):
        self.log_file = "quality_metrics.json"
        self.metrics = self.load_metrics()
    
    def load_metrics(self):
        """Carga métricas existentes"""
        if os.path.exists(self.log_file):
            with open(self.log_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            'total_transacciones': 0,
            'total_errores': 0,
            'transacciones_por_tipo': {},
            'errores_por_tipo': {},
            'ultima_actualizacion': None
        }
    
    def save_metrics(self):
        """Guarda métricas"""
        self.metrics['ultima_actualizacion'] = datetime.now().isoformat()
        with open(self.log_file, 'w', encoding='utf-8') as f:
            json.dump(self.metrics, f, indent=4, ensure_ascii=False)
    
    def registrar_transaccion(self, tipo_transaccion, exitosa=True):
        """
        Registra una transacción
        tipo_transaccion: 'venta', 'devolucion', 'apartado', 'login', etc.
        exitosa: True si fue exitosa, False si hubo error
        """
        self.metrics['total_transacciones'] += 1
        
        if tipo_transaccion not in self.metrics['transacciones_por_tipo']:
            self.metrics['transacciones_por_tipo'][tipo_transaccion] = 0
            self.metrics['errores_por_tipo'][tipo_transaccion] = 0
        
        self.metrics['transacciones_por_tipo'][tipo_transaccion] += 1
        
        if not exitosa:
            self.metrics['total_errores'] += 1
            self.metrics['errores_por_tipo'][tipo_transaccion] += 1
        
        self.save_metrics()
    
    def get_tasa_error(self):
        """Calcula la tasa de error"""
        if self.metrics['total_transacciones'] == 0:
            return 0
        return self.metrics['total_errores'] / self.metrics['total_transacciones']
    
    def cumple_requisito(self):
        """
        Verifica si se cumple el requisito de calidad
        Requisito: Máximo 1 error por cada 500 transacciones (0.002 = 0.2%)
        """
        tasa = self.get_tasa_error()
        tasa_maxima = 1 / 500  # 0.002 = 0.2%
        return tasa <= tasa_maxima
    
    def get_reporte(self):
        """Genera reporte de calidad"""
        total_trans = self.metrics['total_transacciones']
        total_err = self.metrics['total_errores']
        tasa = self.get_tasa_error()
        tasa_maxima = 1 / 500
        
        # Calcular errores esperados vs reales
        errores_permitidos = total_trans / 500
        
        cumple = self.cumple_requisito()
        
        reporte = {
            'total_transacciones': total_trans,
            'total_errores': total_err,
            'tasa_error_actual': f"{tasa * 100:.4f}%",
            'tasa_error_maxima': f"{tasa_maxima * 100:.4f}%",
            'errores_permitidos': round(errores_permitidos, 2),
            'errores_restantes': round(errores_permitidos - total_err, 2),
            'cumple_requisito': cumple,
            'estado': 'APROBADO' if cumple else 'NO CUMPLE',
            'transacciones_por_tipo': self.metrics['transacciones_por_tipo'],
            'errores_por_tipo': self.metrics['errores_por_tipo'],
            'ultima_actualizacion': self.metrics['ultima_actualizacion']
        }
        
        return reporte
    
    def reset_metrics(self):
        """Reinicia las métricas"""
        self.metrics = {
            'total_transacciones': 0,
            'total_errores': 0,
            'transacciones_por_tipo': {},
            'errores_por_tipo': {},
            'ultima_actualizacion': None
        }
        self.save_metrics()

# Instancia global del monitor
quality_monitor = QualityMonitor()

def registrar_transaccion_exitosa(tipo):
    """Wrapper para registrar transacción exitosa"""
    quality_monitor.registrar_transaccion(tipo, exitosa=True)

def registrar_transaccion_error(tipo):
    """Wrapper para registrar transacción con error"""
    quality_monitor.registrar_transaccion(tipo, exitosa=False)

def obtener_reporte_calidad():
    """Obtiene el reporte de calidad actual"""
    return quality_monitor.get_reporte()

def cumple_requisito_calidad():
    """Verifica si se cumple el requisito de calidad"""
    return quality_monitor.cumple_requisito()
