// Función para obtener el ícono correcto según el método de pago
function getMetodoPagoIcon(metodoPago) {
    switch(metodoPago) {
        case 'Efectivo':
            return '<i class="fas fa-money-bill-wave mr-1 text-green-500"></i>';
        case 'Transferencia':
            return '<i class="fas fa-exchange-alt mr-1 text-blue-500"></i>';
        case 'Tarjeta':
            return '<i class="fas fa-credit-card mr-1 text-purple-500"></i>';
        default:
            return '<i class="fas fa-money-bill-wave mr-1 text-gray-500"></i>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const inputBusqueda = document.getElementById('buscador-producto');
    const tablaProductos = document.getElementById('tabla-productos');
    const cuerpoTabla = document.getElementById('cuerpo-tabla-productos');
    const idProducto = document.getElementById('id-producto');
    const productoSeleccionado = document.getElementById('producto-seleccionado');
    const modal = document.getElementById('modal-apartado');
    const botonAbrir = document.getElementById('nuevo-apartado');
    const botonCerrar = document.getElementById('cerrar-modal');
    const formApartado = document.getElementById('form-apartado');
    const modalAcciones = document.getElementById('modal-acciones-apartado');
    const infoApartado = document.getElementById('info-apartado');
    const cerrarModalAcciones = document.getElementById('cerrar-modal-acciones');
    const buscadorApartados = document.getElementById('buscador-apartado');
    const listaApartados = document.getElementById('lista-apartados');
    
    let currentApartado = null;

    // Función para verificar si hay caja abierta
    async function verificarCajaAbierta() {
        try {
            const response = await fetch('/api/caja/estado');
            const data = await response.json();
            return data.caja_abierta || data.abierta;
        } catch (error) {
            console.error('Error al verificar estado de caja:', error);
            return false;
        }
    }

    // Abrir modal nuevo apartado
    botonAbrir.addEventListener('click', async () => {
        const cajaAbierta = await verificarCajaAbierta();
        
        if (!cajaAbierta) {
            alert('⚠️ No se puede crear un apartado sin tener la caja abierta.\n\nPor favor, abra la caja desde el módulo de "Corte de Caja" antes de continuar.');
            return;
        }

        modal.classList.remove('hidden');
        formApartado.reset();
        productoSeleccionado.textContent = '';
        productoSeleccionado.classList.add('hidden');
        idProducto.value = '';
        tablaProductos.classList.add('hidden');
        inputBusqueda.value = '';
        cuerpoTabla.innerHTML = '';
        // Auto-foco en el campo de nombre
        setTimeout(() => {
            document.getElementById('nombre-cliente').focus();
        }, 100);
    });

    // Cerrar modal nuevo apartado
    botonCerrar.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Cerrar modal de acciones
    cerrarModalAcciones.addEventListener('click', () => {
        modalAcciones.classList.add('hidden');
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
        if (e.target === modalAcciones) {
            modalAcciones.classList.add('hidden');
        }
    });

    // Buscar productos para apartado
    inputBusqueda.addEventListener('input', debounce(() => {
        const query = inputBusqueda.value.trim();
        if (query.length === 0) {
            tablaProductos.classList.add('hidden');
            cuerpoTabla.innerHTML = '';
            return;
        }

        fetch(`/api/buscar_productos?q=${encodeURIComponent(query)}`)
            .then(res => {
                if (!res.ok) throw new Error('Error en la búsqueda');
                return res.json();
            })
            .then(data => {
                cuerpoTabla.innerHTML = '';
                if (data.length > 0) {
                    tablaProductos.classList.remove('hidden');
                    data.forEach(producto => {
                        const fila = document.createElement('tr');
                        fila.classList.add('hover:bg-gray-50', 'cursor-pointer');
                        fila.innerHTML = `
                            <td class="px-4 py-2">${producto.nombre}</td>
                            <td class="px-4 py-2">${producto.descripcion || '-'}</td>
                            <td class="px-4 py-2">${producto.categoria || '-'}</td>
                        `;
                        fila.addEventListener('click', () => {
                            productoSeleccionado.innerHTML = `<i class="fas fa-check mr-2"></i>Seleccionado: ${producto.nombre} - Precio: $${producto.precio || 'N/A'}`;
                            productoSeleccionado.classList.remove('hidden');
                            idProducto.value = producto.id;
                            tablaProductos.classList.add('hidden');
                            inputBusqueda.value = `${producto.nombre} - $${producto.precio || 'N/A'}`;
                        });
                        cuerpoTabla.appendChild(fila);
                    });
                } else {
                    tablaProductos.classList.add('hidden');
                }
            })
            .catch(err => {
                console.error('Error al buscar productos:', err);
                alert('Error al buscar productos');
            });
    }, 300));

    // Buscar apartados por nombre/apellido
    buscadorApartados.addEventListener('input', debounce(() => {
        const query = buscadorApartados.value.trim().toLowerCase();
        const cards = listaApartados.querySelectorAll('.apartado-card');
        
        cards.forEach(card => {
            const nombreCompleto = card.dataset.nombre.toLowerCase();
            if (nombreCompleto.includes(query)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }, 300));

    // Guardar nuevo apartado
    formApartado.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Verificar caja abierta antes de proceder
        const cajaAbierta = await verificarCajaAbierta();
        if (!cajaAbierta) {
            alert('⚠️ No se puede crear un apartado sin tener la caja abierta.\n\nPor favor, abra la caja desde el módulo de "Corte de Caja" antes de continuar.');
            return;
        }
        
        const nombre = document.getElementById('nombre-cliente').value.trim();
        const apellido = document.getElementById('apellido-cliente').value.trim();
        const telefono = document.getElementById('telefono-cliente').value.trim();
        const productoId = idProducto.value;
        const montoInicial = parseFloat(document.getElementById('monto-inicial').value);
        const metodoPago = document.getElementById('metodo-pago').value;

        // Validaciones
        if (!nombre || !apellido || !telefono) {
            alert('Por favor complete todos los campos del cliente');
            return;
        }

        if (!productoId) {
            alert('Debe seleccionar un producto');
            return;
        }

        if (isNaN(montoInicial) || montoInicial <= 0) {
            alert('Ingrese un monto válido');
            return;
        }

        // Validar que el teléfono tenga al menos 8 dígitos
        if (telefono.length < 8 || !/^\d+$/.test(telefono)) {
            alert('El teléfono debe tener al menos 8 dígitos y solo números');
            return;
        }

        const datos = { 
            nombre, 
            apellido, 
            telefono, 
            id_producto: productoId, 
            abono_inicial: montoInicial.toFixed(2),
            metodo_pago: metodoPago
        };

        try {
            const response = await fetch('/api/crear_apartado', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al guardar el apartado');
            }

            if (data.success) {
                alert('Apartado guardado exitosamente');
                modal.classList.add('hidden');
                location.reload();
            } else {
                alert(data.message || 'Error al guardar el apartado');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Manejar clics en tarjetas de apartado
    listaApartados.addEventListener('click', async (e) => {
        const card = e.target.closest('.apartado-card');
        if (!card) return;

        const nombre = card.dataset.nombre;
        const id = card.dataset.id;
        
        // Extraer datos del HTML con Tailwind CSS
        const spans = card.querySelectorAll('span.text-sm');
        let fecha = '', vence = '', producto = '', precio = '';
        
        if (spans.length >= 4) {
            fecha = spans[0].textContent.replace('Fecha: ', '');
            vence = spans[1].textContent.replace('Vence: ', '');
            producto = spans[2].textContent.replace('Producto: ', '');
            precio = spans[3].textContent.replace('Precio: ', '');
        }
        
        // Obtener el monto pendiente
        const pendienteElement = card.querySelector('span.text-red-600');
        const pendienteTexto = pendienteElement ? pendienteElement.textContent : '0';
        const pendiente = parseFloat(pendienteTexto.replace(/[^\d.]/g, ''));

        currentApartado = {
            id, nombre, fecha, vence, producto, precio, pendiente
        };

        // Obtener historial de pagos
        let historialPagos = [];
        try {
            const response = await fetch(`/api/historial_pagos_apartado?id_layaway=${id}`);
            if (response.ok) {
                const data = await response.json();
                historialPagos = data.pagos || [];
            }
        } catch (error) {
            console.error('Error al obtener historial de pagos:', error);
        }

        // Generar HTML del historial de pagos
        let historialHTML = '';
        if (historialPagos.length > 0) {
            historialHTML = `
                <div class="mt-6 pt-4 border-t border-gray-200">
                    <h4 class="text-md font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-history mr-2 text-green-600"></i>
                        Historial de Pagos
                    </h4>
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                        ${historialPagos.map((pago, index) => `
                            <div class="bg-gray-50 p-3 rounded-lg border-l-4 border-green-500">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-gray-800">
                                            <i class="fas fa-calendar-alt mr-1 text-blue-500"></i>
                                            ${pago.fecha || 'Fecha no disponible'}
                                        </p>
                                        <p class="text-sm text-gray-600 mt-1">
                                            ${getMetodoPagoIcon(pago.metodo_pago)}
                                            ${pago.metodo_pago || 'Método no especificado'}
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-lg font-bold text-green-600">
                                            $${parseFloat(pago.monto || 0).toFixed(2)}
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            Pago #${index + 1}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-3 pt-2 border-t border-gray-100">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium text-gray-700">Total Pagado:</span>
                            <span class="text-lg font-bold text-blue-600">
                                $${historialPagos.reduce((total, pago) => total + parseFloat(pago.monto || 0), 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            historialHTML = `
                <div class="mt-6 pt-4 border-t border-gray-200">
                    <h4 class="text-md font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-history mr-2 text-gray-400"></i>
                        Historial de Pagos
                    </h4>
                    <div class="text-center py-4">
                        <i class="fas fa-receipt text-3xl text-gray-300 mb-2"></i>
                        <p class="text-gray-500 text-sm">No hay pagos registrados aún</p>
                        <p class="text-gray-400 text-xs">Los pagos aparecerán aquí una vez realizados</p>
                    </div>
                </div>
            `;
        }

        infoApartado.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-info-circle mr-2 text-blue-600"></i>
                Información del Apartado
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p><strong class="text-gray-800">Cliente:</strong> <span class="text-blue-700">${nombre}</span></p>
                <p><strong class="text-gray-800">Fecha:</strong> <span class="text-blue-700">${fecha}</span></p>
                <p><strong class="text-gray-800">Vence:</strong> <span class="text-blue-700">${vence}</span></p>
                <p><strong class="text-gray-800">Producto:</strong> <span class="text-blue-700">${producto}</span></p>
                <p><strong class="text-gray-800">Precio Total:</strong> <span class="text-purple-600 font-semibold">${precio}</span></p>
                <p><strong class="text-gray-800">Pendiente:</strong> <span class="text-red-600 font-bold text-lg">$${pendiente.toFixed(2)}</span></p>
            </div>
            ${historialHTML}
        `;

        document.getElementById('monto-pago').value = '';
        document.getElementById('monto-pago').max = pendiente.toFixed(2);
        modalAcciones.classList.remove('hidden');
    });

    // Pagar parcialmente
    document.getElementById('btn-pagar-parcial').addEventListener('click', async () => {
        // Verificar caja abierta antes de proceder
        const cajaAbierta = await verificarCajaAbierta();
        if (!cajaAbierta) {
            alert('⚠️ No se puede realizar el pago sin tener la caja abierta.\n\nPor favor, abra la caja desde el módulo de "Corte de Caja" antes de continuar.');
            return;
        }

        const monto = parseFloat(document.getElementById('monto-pago').value);
        const metodoPago = document.getElementById('metodo-pago-pago').value;

        if (!currentApartado) return;

        if (isNaN(monto) ){
            alert('Ingrese un monto válido');
            return;
        }

        if (monto <= 0) {
            alert('El monto debe ser mayor a cero');
            return;
        }

        if (monto > currentApartado.pendiente) {
            alert('No puede pagar más del monto pendiente');
            return;
        }

        try {
            const response = await fetch('/api/realizar_pago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_layaway: currentApartado.id, 
                    monto: monto.toFixed(2),
                    metodo_pago: metodoPago
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al realizar el pago');
            }

            if (data.success) {
                alert('Pago realizado exitosamente');
                modalAcciones.classList.add('hidden');
                location.reload();
            } else {
                alert(data.message || 'Error al realizar el pago');
            }
        } catch (error) {
            console.error('Error al realizar el pago:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Pagar todo
    document.getElementById('btn-pagar-todo').addEventListener('click', async () => {
        if (!currentApartado) return;

        // Verificar caja abierta antes de proceder
        const cajaAbierta = await verificarCajaAbierta();
        if (!cajaAbierta) {
            alert('⚠️ No se puede realizar el pago sin tener la caja abierta.\n\nPor favor, abra la caja desde el módulo de "Corte de Caja" antes de continuar.');
            return;
        }

        const confirmacion = confirm(`¿Está seguro que desea pagar el total pendiente de $${currentApartado.pendiente.toFixed(2)}?`);
        if (!confirmacion) return;

        const metodoPago = document.getElementById('metodo-pago-pago').value;

        try {
            const response = await fetch('/api/realizar_pago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_layaway: currentApartado.id, 
                    monto: currentApartado.pendiente.toFixed(2),
                    metodo_pago: metodoPago
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al realizar el pago completo');
            }

            if (data.success) {
                alert('Pago completo realizado exitosamente');
                modalAcciones.classList.add('hidden');
                location.reload();
            } else {
                alert(data.message || 'Error al realizar el pago completo');
            }
        } catch (error) {
            console.error('Error al pagar todo:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Cancelar apartado
    document.getElementById('btn-cancelar-apartado').addEventListener('click', async () => {
        if (!currentApartado) return;

        // Verificar caja abierta antes de proceder con la cancelación
        const cajaAbierta = await verificarCajaAbierta();
        if (!cajaAbierta) {
            alert('⚠️ No se puede cancelar el apartado sin tener la caja abierta.\n\nLa cancelación requiere reintegrar dinero al cliente, por lo que necesita tener la caja operativa.\n\nPor favor, abra la caja desde el módulo de "Corte de Caja" antes de continuar.');
            return;
        }

        // Calcular total pagado por el cliente
        const precioProd = parseFloat(currentApartado.precio.replace(/[^\d.]/g, ''));
        const totalPagado = precioProd - currentApartado.pendiente;

        if (totalPagado <= 0) {
            const confirmacion = confirm(`¿Está seguro que desea cancelar este apartado?\n\nCliente: ${currentApartado.nombre}\nProducto: ${currentApartado.producto}\nPrecio del producto: ${currentApartado.precio}\n\nNo hay dinero que devolver al cliente (apartado sin pagos).`);
            if (!confirmacion) return;
            
            // Proceder con cancelación sin reembolso
            procesarCancelacion(1); // Efectivo por defecto, pero no importa
            return;
        }

        // Mostrar opciones de reembolso
        const metodoReembolso = prompt(`CANCELACIÓN DE APARTADO\n\nCliente: ${currentApartado.nombre}\nProducto: ${currentApartado.producto}\nTotal a devolver: $${totalPagado.toFixed(2)}\n\n¿Cómo desea devolver el dinero?\n\n1 = Efectivo\n2 = Transferencia\n\nEscriba 1 o 2:`);

        if (metodoReembolso === null) return; // Usuario canceló

        const metodo = parseInt(metodoReembolso);
        if (metodo !== 1 && metodo !== 2) {
            alert('Método inválido. Debe ser 1 (Efectivo) o 2 (Transferencia)');
            return;
        }

        const metodoTexto = metodo === 1 ? 'Efectivo' : 'Transferencia';
        const confirmacion = confirm(`CONFIRMAR CANCELACIÓN\n\nCliente: ${currentApartado.nombre}\nMonto a devolver: $${totalPagado.toFixed(2)}\nMétodo de devolución: ${metodoTexto}\n\nEsta acción NO se puede deshacer.\n\n¿Continuar?`);
        if (!confirmacion) return;

        // Procesar cancelación
        procesarCancelacion(metodo);
    });

    // Función auxiliar para procesar la cancelación
    async function procesarCancelacion(metodoReembolso) {
        try {
            const response = await fetch('/api/cancelar_apartado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_layaway: currentApartado.id,
                    metodo_reembolso: metodoReembolso
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cancelar el apartado');
            }

            if (data.success) {
                const metodoTexto = metodoReembolso === 1 ? 'efectivo' : 'transferencia';
                alert(`Apartado cancelado correctamente.\nReembolso procesado por ${metodoTexto}.`);
                modalAcciones.classList.add('hidden');
                location.reload();
            } else {
                alert(data.message || 'Error al cancelar el apartado');
            }
        } catch (error) {
            console.error('Error al cancelar apartado:', error);
            alert(`Error: ${error.message}`);
        }
    }

    // Función debounce para mejor performance en búsquedas
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    // Añadir funcionalidad de teclado para cerrar modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
            if (!modalAcciones.classList.contains('hidden')) {
                modalAcciones.classList.add('hidden');
            }
        }
    });
});