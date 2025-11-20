document.addEventListener('DOMContentLoaded', function () {
    const btnBuscarVenta = document.getElementById('btn-buscar-venta');
    const buscarVentaInput = document.getElementById('buscar-venta');
    const infoVentaDiv = document.getElementById('info-venta');
    const ventaIdSpan = document.getElementById('venta-id');
    const ventaFechaSpan = document.getElementById('venta-fecha');
    const ventaTotalSpan = document.getElementById('venta-total');
    const tablaProductosVenta = document.getElementById('tabla-productos-venta');
    const confirmarDevolucionBtn = document.getElementById('confirmar-devolucion');
    const reintegrarStockSelect = document.getElementById('reintegrar-stock');
    const metodoReembolsoSelect = document.getElementById('metodo-reembolso');
    const mensajeDevolucion = document.getElementById('mensaje-devolucion');
    const observacionesInput = document.getElementById('observaciones');

    const modal = document.getElementById('modal-devolucion');
    const modalContent = document.getElementById('detalle-devolucion-content');
    const cerrarModal = document.getElementById('cerrar-modal');

    // Modal de selección de ventas
    const modalSeleccionVentas = document.getElementById('modal-seleccion-ventas');
    const listaVentasContent = document.getElementById('lista-ventas-content');
    const fechaSeleccionada = document.getElementById('fecha-seleccionada');
    const cerrarModalVentas = document.getElementById('cerrar-modal-ventas');
    const cancelarSeleccion = document.getElementById('cancelar-seleccion');

    let ventaActual = null;

    const buscarFechaInput = document.getElementById('buscar-fecha');
    
    // Elementos de tabs
    const tabId = document.getElementById('tab-id');
    const tabFecha = document.getElementById('tab-fecha');
    const btnBuscarFecha = document.getElementById('btn-buscar-fecha');

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

    // Cambiar entre tabs
    tabId.addEventListener('click', function() {
        const campoId = document.getElementById('campo-id');
        const campoFecha = document.getElementById('campo-fecha');
        
        campoId.style.display = 'block';
        campoFecha.style.display = 'none';
        
        // Actualizar estilos de tabs
        tabId.className = 'flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg';
        tabFecha.className = 'flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 bg-white text-gray-600 border-2 border-gray-300 hover:border-purple-400 hover:shadow-md';
    });
    
    tabFecha.addEventListener('click', function() {
        const campoId = document.getElementById('campo-id');
        const campoFecha = document.getElementById('campo-fecha');
        
        campoId.style.display = 'none';
        campoFecha.style.display = 'block';
        
        // Actualizar estilos de tabs
        tabFecha.className = 'flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg';
        tabId.className = 'flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 bg-white text-gray-600 border-2 border-gray-300 hover:border-purple-400 hover:shadow-md';
    });

    // Inicializar el estado (por defecto: buscar por ID)
    const campoId = document.getElementById('campo-id');
    const campoFecha = document.getElementById('campo-fecha');
    campoId.style.display = 'block';
    campoFecha.style.display = 'none';

    btnBuscarVenta.addEventListener('click', function () {
        const valorBusqueda = buscarVentaInput.value.trim();
        if (!valorBusqueda) {
            alert('Por favor, ingresa un ID de venta.');
            return;
        }

        const url = `/api/buscar_venta?buscar=${valorBusqueda}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.venta) {
                    ventaActual = data.venta;
                    mostrarVenta(data.venta);
                } else {
                    alert(data.message || 'No se encontró la venta con ese ID.');
                }
            })
            .catch(error => {
                console.error('Error detallado al obtener venta:', error);
                alert('Error al buscar la venta. Por favor, verifica que el servidor esté ejecutándose.');
            });
    });
    
    // Evento para buscar por fecha
    btnBuscarFecha.addEventListener('click', function() {
        const valorBusqueda = buscarFechaInput.value;
        if (!valorBusqueda) {
            alert('Por favor, selecciona una fecha.');
            return;
        }

        const url = `/api/buscar_venta?fecha=${valorBusqueda}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.ventas && data.ventas.length > 0) {
                    mostrarVentasPorFecha(data.ventas);
                } else {
                    alert(data.message || 'No se encontraron ventas para esa fecha.');
                }
            })
            .catch(error => {
                console.error('Error detallado al obtener venta:', error);
                alert('Error al buscar ventas. Por favor, verifica que el servidor esté ejecutándose.');
            });
    });

    function mostrarVentasPorFecha(ventas) {
        // Mostrar fecha seleccionada en el modal
        const fechaBusqueda = buscarFechaInput.value;
        fechaSeleccionada.textContent = `Ventas encontradas para ${fechaBusqueda}`;
        
        // Limpiar contenido anterior
        listaVentasContent.innerHTML = '';
        
        // Crear tarjetas para cada venta
        ventas.forEach((venta, index) => {
            const tarjetaVenta = document.createElement('div');
            tarjetaVenta.className = 'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-105';
            tarjetaVenta.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                            ${index + 1}
                        </div>
                        <div>
                            <div class="flex items-center text-blue-800 font-semibold text-lg">
                                <i class="fas fa-hashtag mr-2"></i>
                                ID: ${venta.id_sale}
                            </div>
                            <div class="text-blue-600 text-sm">
                                <i class="fas fa-calendar mr-1"></i>
                                ${venta.date}
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                            $${parseFloat(venta.total_amount).toFixed(2)}
                        </div>
                        <div class="text-blue-600 text-sm mt-1">
                            <i class="fas fa-mouse-pointer mr-1"></i>
                            Clic para seleccionar
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar evento de clic
            tarjetaVenta.addEventListener('click', () => {
                seleccionarVenta(venta);
            });
            
            listaVentasContent.appendChild(tarjetaVenta);
        });
        
        // Mostrar modal
        modalSeleccionVentas.style.display = 'flex';
    }
    
    function seleccionarVenta(ventaSeleccionada) {
        // Cerrar modal de selección
        modalSeleccionVentas.style.display = 'none';
        
        // Obtener detalles completos de la venta seleccionada
        fetch(`/api/buscar_venta?buscar=${ventaSeleccionada.id_sale}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.venta) {
                ventaActual = data.venta;
                mostrarVenta(data.venta);
            } else {
                alert(data.message || 'Error al cargar la venta seleccionada.');
            }
        })
        .catch(error => {
            console.error('Error al obtener detalles de venta:', error);
            alert(`Error al cargar los detalles de la venta: ${error.message}`);
        });
    }

    function mostrarVenta(venta) {
        infoVentaDiv.classList.remove('hidden');
        infoVentaDiv.style.display = 'block';
        ventaIdSpan.textContent = venta.id_sale;
        ventaFechaSpan.textContent = venta.date;
        ventaTotalSpan.textContent = `$${parseFloat(venta.total_amount).toFixed(2)}`;

        tablaProductosVenta.innerHTML = '';

        // Mostrar mensaje si ya tiene devoluciones
        if (venta.devoluciones && venta.devoluciones.length > 0) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-4';
            warningDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                    <strong>Advertencia:</strong> Esta venta ya tiene devoluciones registradas.
                </div>
            `;
            mensajeDevolucion.innerHTML = '';
            mensajeDevolucion.appendChild(warningDiv);

            // Botón para ver detalles de devoluciones
            const btnVerDetalles = document.createElement('button');
            btnVerDetalles.textContent = 'Ver detalles de devoluciones anteriores';
            btnVerDetalles.className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-2 transition-colors';
            btnVerDetalles.addEventListener('click', () => mostrarDetallesModal(venta.devoluciones));
            mensajeDevolucion.appendChild(btnVerDetalles);
        } else {
            mensajeDevolucion.innerHTML = '';
        }

        venta.productos.forEach(producto => {
            // Calcular la cantidad ya devuelta
            const cantidadDevuelta = venta.devoluciones
                ? venta.devoluciones.reduce((sum, devolucion) => {
                      const detalle = devolucion.productos.find(p => p.id === producto.id);
                      return sum + (detalle ? detalle.quantity : 0);
                  }, 0)
                : 0;

            const cantidadDisponible = producto.quantity - cantidadDevuelta;

            const fila = document.createElement('tr');
            fila.className = 'hover:bg-gray-50 transition-colors';
            
            // Crear celdas individuales
            const celdaProducto = document.createElement('td');
            celdaProducto.className = 'px-6 py-4 text-gray-800 font-medium';
            celdaProducto.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-box text-gray-500 mr-2"></i>
                    ${producto.name}
                </div>
            `;

            const celdaCantidad = document.createElement('td');
            celdaCantidad.className = 'px-6 py-4 text-center';
            celdaCantidad.innerHTML = `
                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ${producto.quantity}
                </span>
            `;

            const celdaPrecio = document.createElement('td');
            celdaPrecio.className = 'px-6 py-4 text-center font-semibold text-green-600';
            celdaPrecio.textContent = producto.precio !== undefined && producto.precio !== null ? 
                `$${parseFloat(producto.precio).toFixed(2)}` : 'N/A';

            const celdaCheckbox = document.createElement('td');
            celdaCheckbox.className = 'px-6 py-4 text-center';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'producto-devolver w-5 h-5 text-pink-600 rounded focus:ring-pink-500';
            if (cantidadDisponible <= 0) {
                checkbox.disabled = true;
            }
            celdaCheckbox.appendChild(checkbox);

            const celdaInput = document.createElement('td');
            celdaInput.className = 'px-6 py-4 text-center';
            const inputCantidad = document.createElement('input');
            inputCantidad.type = 'number';
            inputCantidad.className = 'cantidad-devolver w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-center';
            inputCantidad.min = '1';
            inputCantidad.max = cantidadDisponible.toString();
            inputCantidad.value = '0';
            inputCantidad.disabled = true;
            celdaInput.appendChild(inputCantidad);

            fila.appendChild(celdaProducto);
            fila.appendChild(celdaCantidad);
            fila.appendChild(celdaPrecio);
            fila.appendChild(celdaCheckbox);
            fila.appendChild(celdaInput);

            tablaProductosVenta.appendChild(fila);
        });

        const checkboxes = tablaProductosVenta.querySelectorAll('.producto-devolver');
        const cantidades = tablaProductosVenta.querySelectorAll('.cantidad-devolver');

        checkboxes.forEach((checkbox, i) => {
            checkbox.addEventListener('change', () => {
                cantidades[i].disabled = !checkbox.checked;
                if (!checkbox.checked) {
                    cantidades[i].value = 0;
                } else {
                    cantidades[i].value = 1;
                }
            });
            
            // Validar la cantidad ingresada
            cantidades[i].addEventListener('input', function() {
                const maxCantidad = parseInt(this.max);
                const valorIngresado = parseInt(this.value);
                
                if (valorIngresado > maxCantidad) {
                    this.value = maxCantidad;
                    alert(`⚠️ La cantidad máxima disponible para devolver es ${maxCantidad}`);
                }
                
                if (valorIngresado < 1 && this.value !== '') {
                    this.value = 1;
                }
            });
            
            // Validar al perder el foco
            cantidades[i].addEventListener('blur', function() {
                if (this.value === '' || parseInt(this.value) < 1) {
                    this.value = checkbox.checked ? 1 : 0;
                }
            });
        });

        ventaActual = venta;
    }

    confirmarDevolucionBtn.addEventListener('click', async function () {
        if (!ventaActual) {
            alert('No hay una venta seleccionada.');
            return;
        }

        // Verificar caja abierta
        const cajaAbierta = await verificarCajaAbierta();
        if (!cajaAbierta) {
            alert('⚠️ No se puede procesar una devolución sin tener la caja abierta.\n\nPor favor, abra la caja desde el módulo de "Corte de Caja" antes de continuar.');
            return;
        }

        const checkboxes = tablaProductosVenta.querySelectorAll('.producto-devolver');
        const cantidades = tablaProductosVenta.querySelectorAll('.cantidad-devolver');
        const productosDevolver = [];

        let hayProductosSeleccionados = false;

        checkboxes.forEach((checkbox, i) => {
            if (checkbox.checked) {
                const cantidad = parseInt(cantidades[i].value);
                if (cantidad > 0) {
                    const producto = ventaActual.productos[i];
                    productosDevolver.push({
                        id_producto: producto.id,
                        cantidad: cantidad,
                        precio: producto.precio
                    });
                    hayProductosSeleccionados = true;
                }
            }
        });

        if (!hayProductosSeleccionados) {
            alert('Debe seleccionar al menos un producto para devolver.');
            return;
        }

        const datosDevolucion = {
            id_venta: ventaActual.id_sale,
            productos: productosDevolver,
            reintegrar_stock: parseInt(reintegrarStockSelect.value),
            metodo_reembolso: parseInt(metodoReembolsoSelect.value),
            observaciones: observacionesInput.value.trim()
        };

        try {
            const response = await fetch('/api/registrar_devolucion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosDevolucion)
            });

            const resultado = await response.json();

            if (response.ok && resultado.success) {
                let mensaje = '✅ Devolución procesada exitosamente.';
                
                if (resultado.id_return) {
                    mensaje += `\n\n📋 ID de devolución: ${resultado.id_return}`;
                }
                
                if (resultado.total_refund) {
                    mensaje += `\n💰 Total devuelto: $${parseFloat(resultado.total_refund).toFixed(2)}`;
                }
                
                alert(mensaje);
                location.reload(); // Recargar para limpiar el formulario
            } else {
                console.error('Error del servidor:', resultado);
                alert(`❌ Error al procesar la devolución:\n\n${resultado.message || 'Error desconocido del servidor'}`);
            }
        } catch (error) {
            console.error('Error al registrar devolución:', error);
            alert('Ocurrió un error al registrar la devolución.');
        }
    });

    cerrarModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Event listeners para el modal de selección de ventas
    cerrarModalVentas.addEventListener('click', () => {
        modalSeleccionVentas.style.display = 'none';
    });

    cancelarSeleccion.addEventListener('click', () => {
        modalSeleccionVentas.style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera de él
    modalSeleccionVentas.addEventListener('click', (e) => {
        if (e.target === modalSeleccionVentas) {
            modalSeleccionVentas.style.display = 'none';
        }
    });

    function mostrarDetallesModal(devoluciones) {
        const detallesHTML = devoluciones.map((devolucion, index) => {
            const metodoTexto = devolucion.payment_method === 1 ? 'Efectivo' : 
                              devolucion.payment_method === 2 ? 'Transferencia Bancaria' : 'Tarjeta de Crédito/Débito';
            
            const metodoIcono = devolucion.payment_method === 1 ? 'fa-money-bill-wave' : 
                               devolucion.payment_method === 2 ? 'fa-university' : 'fa-credit-card';
            
            const metodoColor = devolucion.payment_method === 1 ? 'green' : 
                               devolucion.payment_method === 2 ? 'blue' : 'purple';
            
            const productosHTML = devolucion.productos.map(p => 
                `<div class="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-md">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="bg-purple-600 rounded-lg p-2 mr-3 shadow-md">
                                <i class="fas fa-box text-white"></i>
                            </div>
                            <span class="font-bold text-gray-800 text-lg">${p.name}</span>
                        </div>
                        <span class="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                            ${p.quantity} ${p.quantity === 1 ? 'unidad' : 'unidades'}
                        </span>
                    </div>
                </div>`
            ).join('');

            return `
                <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 shadow-lg mb-4 last:mb-0">
                    ${devoluciones.length > 1 ? `<div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg inline-block mb-4 font-bold shadow-md">
                        <i class="fas fa-layer-group mr-2"></i>Devolución #${index + 1}
                    </div>` : ''}
                    
                    <!-- Información principal en tarjetas -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200 shadow-sm">
                            <div class="flex items-center mb-2">
                                <div class="bg-blue-600 rounded-lg p-2 mr-3 shadow-md">
                                    <i class="fas fa-hashtag text-white text-sm"></i>
                                </div>
                                <span class="text-sm font-bold text-blue-700 uppercase tracking-wide">ID Devolución</span>
                            </div>
                            <p class="text-2xl font-bold text-blue-900 ml-11">${devolucion.id_return}</p>
                        </div>
                        
                        <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200 shadow-sm">
                            <div class="flex items-center mb-2">
                                <div class="bg-green-600 rounded-lg p-2 mr-3 shadow-md">
                                    <i class="fas fa-calendar-alt text-white text-sm"></i>
                                </div>
                                <span class="text-sm font-bold text-green-700 uppercase tracking-wide">Fecha</span>
                            </div>
                            <p class="text-lg font-bold text-green-900 ml-11">${devolucion.date_return}</p>
                        </div>
                        
                        <div class="bg-gradient-to-br from-${metodoColor}-50 to-${metodoColor}-100 p-4 rounded-xl border-2 border-${metodoColor}-200 shadow-sm">
                            <div class="flex items-center mb-2">
                                <div class="bg-${metodoColor}-600 rounded-lg p-2 mr-3 shadow-md">
                                    <i class="fas ${metodoIcono} text-white text-sm"></i>
                                </div>
                                <span class="text-sm font-bold text-${metodoColor}-700 uppercase tracking-wide">Método de Reembolso</span>
                            </div>
                            <p class="text-lg font-bold text-${metodoColor}-900 ml-11">${metodoTexto}</p>
                        </div>
                        
                        <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200 shadow-sm">
                            <div class="flex items-center mb-2">
                                <div class="bg-orange-600 rounded-lg p-2 mr-3 shadow-md">
                                    <i class="fas fa-dollar-sign text-white text-sm"></i>
                                </div>
                                <span class="text-sm font-bold text-orange-700 uppercase tracking-wide">Total Devuelto</span>
                            </div>
                            <p class="text-2xl font-bold text-orange-900 ml-11">$${parseFloat(devolucion.total_refund).toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <!-- Observaciones -->
                    <div class="mb-6">
                        <div class="flex items-center mb-3">
                            <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-2 mr-3 shadow-md">
                                <i class="fas fa-comment-alt text-white"></i>
                            </div>
                            <h4 class="text-lg font-bold text-gray-800">Observaciones</h4>
                        </div>
                        <div class="bg-white p-4 rounded-xl border-2 border-gray-300 shadow-sm">
                            <p class="text-gray-700 font-medium">${devolucion.observations || '<em class="text-gray-400">Ninguna observación registrada</em>'}</p>
                        </div>
                    </div>
                    
                    <!-- Productos devueltos -->
                    <div>
                        <div class="flex items-center mb-4">
                            <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-2 mr-3 shadow-md">
                                <i class="fas fa-boxes text-white"></i>
                            </div>
                            <h4 class="text-lg font-bold text-gray-800">Productos Devueltos</h4>
                        </div>
                        <div class="space-y-3">
                            ${productosHTML}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        modalContent.innerHTML = detallesHTML;
        modal.style.display = 'flex';
    }
});