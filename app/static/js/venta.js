document.addEventListener('DOMContentLoaded', () => {
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
        if (seleccionados.length === 0) {
            alert('No puedes realizar una venta sin productos seleccionados.');
            return; // Detiene la ejecución si no hay productos seleccionados
        }

        const metodoPago = metodoPagoSelect.value;

        const venta = {
            productos: seleccionados,
            total: parseFloat(totalVenta.textContent),
            metodo_pago: parseInt(metodoPago)
        };

        console.log({
            productos: seleccionados,
            total: parseFloat(totalVenta.textContent),
            metodo_pago: parseInt(metodoPago)
        });

        const response = await fetch('/api/registrar_venta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(venta)
        });

        if (response.ok) {
            alert('Venta registrada con éxito');
            location.reload(); // Recarga la página después de registrar la venta
        } else {
            const error = await response.json();
            alert(`Error al registrar la venta: ${error.message}`);
        }
    });

    cargarProductos();
});