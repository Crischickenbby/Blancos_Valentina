document.addEventListener('DOMContentLoaded', () => {
    // --- BLOQUEO SI NO HAY CAJA ABIERTA ---
    const overlay = document.createElement('div');
    overlay.id = 'overlay-caja-cerrada';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(255,255,255,0.92)';
    overlay.style.zIndex = 9999;
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.innerHTML = `
        <div style="background: white; border-radius: 1.5rem; box-shadow: 0 8px 32px rgba(0,0,0,0.18); padding: 2.5rem 2rem; border: 2px solid #e11d48; max-width: 95vw;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem;">
                <i class="fas fa-lock text-4xl" style="color: #e11d48;"></i>
                <span style="font-size: 2rem; font-weight: bold; color: #e11d48;">Caja cerrada</span>
            </div>
            <p style="font-size: 1.2rem; color: #444; margin-bottom: 0.5rem;">No puedes realizar ventas porque la caja está cerrada.</p>
            <button style="background: #e11d48; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.75rem; font-size: 1rem; cursor: pointer;" onclick="location.href='/corte'">
                Abrir Caja
            </button>
        </div>
    `;
    fetch('/api/caja/estado')
        .then(r => r.json())
        .then(data => {
            if (!data.abierta) {
                document.body.appendChild(overlay);
                document.body.style.overflow = 'hidden';
            } else {
                const old = document.getElementById('overlay-caja-cerrada');
                if (old) old.remove();
                document.body.style.overflow = '';
            }
        })
        .catch(() => {
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
        });
    const buscador = document.getElementById('buscador');
    const tablaProductos = document.getElementById('tabla-productos');
    const productosSeleccionados = document.getElementById('productos-seleccionados');
    const totalVenta = document.getElementById('total-venta');
    const registrarVentaBtn = document.getElementById('registrar-venta');
    const metodoPagoSelect = document.getElementById('metodo-pago');

    let productos = [];
    let seleccionados = [];

    // Función para escapar HTML y prevenir XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Cargar productos desde el servidor
    async function cargarProductos() {
        const response = await fetch('/api/productos');
        productos = await response.json();
        renderProductos(productos);
    }

    // Renderizar productos en la tabla
    function renderProductos(productosFiltrados) {
        tablaProductos.innerHTML = '';
        productosFiltrados.forEach(producto => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors';
            
            // Crear celdas de forma segura
            const tdNombre = document.createElement('td');
            tdNombre.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700';
            tdNombre.textContent = producto.nombre;
            
            const tdDescripcion = document.createElement('td');
            tdDescripcion.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700';
            tdDescripcion.textContent = producto.descripcion;
            
            const tdStock = document.createElement('td');
            tdStock.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700';
            tdStock.textContent = producto.stock;
            
            const tdPrecio = document.createElement('td');
            tdPrecio.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700';
            tdPrecio.textContent = `$${producto.precio.toFixed(2)}`;
            
            const tdAccion = document.createElement('td');
            tdAccion.className = 'px-6 py-4 text-start whitespace-nowrap text-sm text-gray-700';
            
            const btnAgregar = document.createElement('button');
            btnAgregar.className = 'btn-agregar bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-1';
            btnAgregar.dataset.id = producto.id;
            btnAgregar.innerHTML = '<i class="fas fa-plus"></i> Agregar';
            
            tdAccion.appendChild(btnAgregar);
            
            row.appendChild(tdNombre);
            row.appendChild(tdDescripcion);
            row.appendChild(tdStock);
            row.appendChild(tdPrecio);
            row.appendChild(tdAccion);
            
            tablaProductos.appendChild(row);
        });
    }

    // Filtrar productos en tiempo real
    buscador.addEventListener('input', () => {
        const filtro = buscador.value.toLowerCase();
        const productosFiltrados = productos.filter(producto =>
            producto.nombre.toLowerCase().includes(filtro)
        );
        renderProductos(productosFiltrados);
    });

    // Agregar producto al contenedor de seleccionados
    tablaProductos.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-agregar')) {
            const id = parseInt(e.target.dataset.id);
            const producto = productos.find(p => p.id === id);

            if (producto && producto.stock > 0) {
                const existente = seleccionados.find(p => p.id === id);
                if (existente) {
                    existente.cantidad++;
                } else {
                    seleccionados.push({ ...producto, cantidad: 1 });
                }
                producto.stock--;
                actualizarSeleccionados();
                renderProductos(productos);
            }
        }
    });

    // Actualizar contenedor de productos seleccionados
    function actualizarSeleccionados() {
        productosSeleccionados.innerHTML = '';
        let total = 0;

        seleccionados.forEach(producto => {
            const subtotal = producto.cantidad * producto.precio;
            total += subtotal;

            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors';
            
            // Crear celdas de forma segura
            const tdNombre = document.createElement('td');
            tdNombre.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900';
            tdNombre.textContent = producto.nombre;
            
            const tdDescripcion = document.createElement('td');
            tdDescripcion.className = 'px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700';
            tdDescripcion.textContent = producto.descripcion;
            
            const tdCantidad = document.createElement('td');
            tdCantidad.className = 'px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700';
            tdCantidad.textContent = producto.cantidad;
            
            const tdPrecio = document.createElement('td');
            tdPrecio.className = 'px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700';
            tdPrecio.textContent = `$${producto.precio.toFixed(2)}`;
            
            const tdSubtotal = document.createElement('td');
            tdSubtotal.className = 'px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700';
            tdSubtotal.textContent = `$${subtotal.toFixed(2)}`;
            
            const tdAccion = document.createElement('td');
            tdAccion.className = 'px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700';
            
            const btnQuitar = document.createElement('button');
            btnQuitar.className = 'btn-quitar bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-1';
            btnQuitar.dataset.id = producto.id;
            btnQuitar.innerHTML = '<i class="fas fa-trash"></i> Quitar';
            
            tdAccion.appendChild(btnQuitar);
            
            row.appendChild(tdNombre);
            row.appendChild(tdDescripcion);
            row.appendChild(tdCantidad);
            row.appendChild(tdPrecio);
            row.appendChild(tdSubtotal);
            row.appendChild(tdAccion);
            
            productosSeleccionados.appendChild(row);
        });

        totalVenta.textContent = total.toFixed(2);
    }

    // Quitar producto del contenedor de seleccionados
    productosSeleccionados.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-quitar')) {
            const id = parseInt(e.target.dataset.id);
            const index = seleccionados.findIndex(p => p.id === id);
            if (index !== -1) {
                const producto = seleccionados[index];
                productos.find(p => p.id === id).stock += producto.cantidad;
                seleccionados.splice(index, 1);
                actualizarSeleccionados();
                renderProductos(productos);
            }
        }
    });

    // Registrar venta
    registrarVentaBtn.addEventListener('click', async () => {
        if (registrarVentaBtn.disabled) return; // Evita doble click rápido
        if (seleccionados.length === 0) {
            showFlashMessage('No puedes realizar una venta sin productos seleccionados.', 'error');
            return; // Detiene la ejecución si no hay productos seleccionados
        }

        registrarVentaBtn.disabled = true;
        registrarVentaBtn.classList.add('opacity-60', 'cursor-not-allowed');

        const metodoPago = metodoPagoSelect.value;

        const venta = {
            productos: seleccionados,
            total: parseFloat(totalVenta.textContent),
            metodo_pago: parseInt(metodoPago)
        };

        try {
            const response = await fetch('/api/registrar_venta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(venta)
            });

            if (response.ok) {
                showFlashMessage('Venta registrada con éxito', 'success');
                setTimeout(() => location.reload(), 1200); // Recarga la página tras mostrar mensaje
            } else {
                const error = await response.json();
                showFlashMessage(`Error al registrar la venta: ${error.message}`, 'error');
                registrarVentaBtn.disabled = false;
                registrarVentaBtn.classList.remove('opacity-60', 'cursor-not-allowed');
            }
        } catch (e) {
            showFlashMessage('Error de red al registrar la venta.', 'error');
            registrarVentaBtn.disabled = false;
            registrarVentaBtn.classList.remove('opacity-60', 'cursor-not-allowed');
        }
    });

    cargarProductos();
});