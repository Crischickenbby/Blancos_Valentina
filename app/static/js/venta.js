// --- BLOQUEO REGISTRO VENTA SI CARRITO VACÍO (directo y simple) ---
document.addEventListener('DOMContentLoaded', function () {
    const btnRegistrarVenta = document.getElementById('registrar-venta');
    const carritoTbody = document.getElementById('productos-seleccionados');
    if (btnRegistrarVenta && carritoTbody) {
        btnRegistrarVenta.addEventListener('click', function (e) {
            if (carritoTbody.children.length === 0) {
                e.preventDefault();
                mostrarFlash("No puedes registrar una venta sin productos en el carrito", "error");
                return;
            }
        });
    }
});

// Fallback mostrarFlash por si el JS principal falla o no carga a tiempo
if (!window.mostrarFlash) {
    window.mostrarFlash = function(mensaje, tipo = "info") {
        const anterior = document.getElementById('flash-float');
        if (anterior) anterior.remove();
        const div = document.createElement('div');
            div.id = 'flash-float';
            div.className = 'fixed top-8 right-8 z-[9999] bg-gradient-to-r from-pink-500 to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-base font-semibold opacity-95 transition-all';
        let icono = '';
        if (tipo === 'error') {
            icono = '<i class="fas fa-times-circle"></i>';
        } else if (tipo === 'success') {
            icono = '<i class="fas fa-check-circle"></i>';
        } else {
            icono = '<i class="fas fa-info-circle"></i>';
        }
        div.innerHTML = icono + '<span>' + mensaje + '</span>';
        document.body.appendChild(div);
        setTimeout(() => {
            div.style.opacity = '0';
            setTimeout(() => div.remove(), 400);
        }, 2500);
    }
}
// --- FLASH BONITO ---
function mostrarFlash(mensaje, tipo = "info") {
    console.log('[mostrarFlash]', mensaje, tipo);
    window.mostrarFlash = mostrarFlash;
        const anterior = document.getElementById('flash-float');
        if (anterior) anterior.remove();
        const div = document.createElement('div');
            div.id = 'flash-float';
            div.className = 'fixed top-8 right-8 z-[9999] bg-gradient-to-r from-pink-500 to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-base font-semibold opacity-95 transition-all';
        let icono = '';
        if (tipo === 'error') {
            icono = '<i class="fas fa-times-circle"></i>';
        } else if (tipo === 'success') {
            icono = '<i class="fas fa-check-circle"></i>';
        } else {
            icono = '<i class="fas fa-info-circle"></i>';
        }
        div.innerHTML = icono + '<span>' + mensaje + '</span>';
        document.body.appendChild(div);
        setTimeout(() => {
            div.style.opacity = '0';
            setTimeout(() => div.remove(), 400);
        }, 2500);
}

// --- MENSAJE SI CARRITO VACÍO ---
document.addEventListener('DOMContentLoaded', function() {
    const tbody = document.getElementById('productos-seleccionados');
    const mensaje = document.getElementById('mensaje-carrito-vacio');
    function mostrarMensajeCarritoVacio() {
        if (!tbody || !mensaje) return;
        setTimeout(() => {
            if (tbody.children.length === 0) {
                mensaje.classList.remove('hidden');
            } else {
                mensaje.classList.add('hidden');
            }
        }, 100);
    }
    const observer = new MutationObserver(mostrarMensajeCarritoVacio);
    observer.observe(tbody, { childList: true });
    mostrarMensajeCarritoVacio();
});

// --- CATEGORÍAS COMO CARDS Y MODAL ---
document.addEventListener('DOMContentLoaded', function() {
    let categoriasGlobal = [];
    const cont = document.getElementById('categorias-contenido');
    const buscador = document.getElementById('buscador-categorias');
    const modal = document.getElementById('modal-productos-categoria');
    const cerrarModal = document.getElementById('cerrar-modal-categoria');
    const nombreCategoriaModal = document.getElementById('nombre-categoria-modal');
    const listaProductosModal = document.getElementById('lista-productos-modal');

    fetch('/api/categorias')
        .then(r => r.json())
        .then(categorias => {
            categoriasGlobal = categorias;
            renderizarCategorias(categorias);
        });

    function renderizarCategorias(categorias) {
        if (!cont) return;
        if (categorias.length === 0) {
            cont.innerHTML = '<span class="text-gray-500">No hay categorías registradas.</span>';
            return;
        }
        cont.innerHTML = '';
            categorias.forEach(cat => {
                const card = document.createElement('div');
                card.className = `categoria-card cursor-pointer bg-white border-2 border-pink-400 rounded-3xl shadow-xl p-8 flex flex-col items-center gap-4 transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-purple-400`;
                card.innerHTML = `
                    <div class="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-purple-600 shadow-lg mb-4 border-4 border-white">
                        <i class="fas fa-tag text-4xl text-white drop-shadow"></i>
                    </div>
                    <span class="font-black text-xs tracking-widest text-gray-700 text-center uppercase">${cat.nombre}</span>
                `;
                card.onclick = function() {
                    abrirModalCategoria(cat.id, cat.nombre);
                };
                cont.appendChild(card);
            });
    }

    buscador.addEventListener('input', function() {
        const filtro = buscador.value.toLowerCase();
        const filtradas = categoriasGlobal.filter(cat => cat.nombre.toLowerCase().includes(filtro));
        renderizarCategorias(filtradas);
    });

    function abrirModalCategoria(idCategoria, nombreCategoria) {
        nombreCategoriaModal.textContent = nombreCategoria;
        listaProductosModal.innerHTML = '<div class="text-gray-400">Cargando productos...</div>';
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        fetch(`/api/productos`)
            .then(r => r.json())
            .then(productos => {
                const filtrados = productos.filter(p => p.id_categoria === idCategoria || p.idCategoria === idCategoria);
                listaProductosModal.innerHTML = '';
                if (filtrados.length === 0) {
                    listaProductosModal.innerHTML = '<span class="text-gray-500">No hay productos en esta categoría.</span>';
                } else {
                    filtrados.forEach(prod => {
                        const card = document.createElement('div');
                        card.className = 'p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow flex flex-col gap-2';
                        card.innerHTML = `
                            <div class="font-bold text-lg text-purple-700">${prod.nombre || prod.name}</div>
                            <div class="text-gray-600 text-sm mb-1">${prod.descripcion || ''}</div>
                            <div class="text-pink-700 font-semibold">$${prod.precio ? prod.precio.toFixed(2) : (prod.price ? prod.price.toFixed(2) : '')}</div>
                            <div class="text-xs text-gray-400">Stock: ${prod.stock ?? ''}</div>
                        `;
                        listaProductosModal.appendChild(card);
                    });
                }
            });
    }

    cerrarModal.addEventListener('click', function() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. BLOQUEO SI NO HAY CAJA ABIERTA ---
    function mostrarOverlayCajaCerrada() {
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
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }

    function ocultarOverlayCajaCerrada() {
        const old = document.getElementById('overlay-caja-cerrada');
        if (old) old.remove();
        document.body.style.overflow = '';
    }

    function verificarCajaAbierta() {
        fetch('/api/caja/estado')
            .then(r => r.json())
            .then(data => {
                if (!data.abierta) {
                    mostrarOverlayCajaCerrada();
                } else {
                    ocultarOverlayCajaCerrada();
                }
            })
            .catch(() => {
                mostrarOverlayCajaCerrada();
            });
    }

    // --- 2. VARIABLES GLOBALES Y ELEMENTOS ---
    const buscador = document.getElementById('buscador');
    const tablaProductos = document.getElementById('tabla-productos');
    const productosSeleccionados = document.getElementById('productos-seleccionados');
    const totalVenta = document.getElementById('total-venta');
    const registrarVentaBtn = document.getElementById('registrar-venta');
    const metodoPagoSelect = document.getElementById('metodo-pago');
    let productos = [];
    let seleccionados = [];

    // --- 3. UTILIDADES ---
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- 4. FUNCIONES DE PRODUCTOS ---
    async function cargarProductos() {
        const response = await fetch('/api/productos');
        productos = await response.json();
        renderProductos(productos);
    }

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

    // --- 5. EVENTOS Y LISTENERS ---
    buscador.addEventListener('input', () => {
        const filtro = buscador.value.toLowerCase();
        const productosFiltrados = productos.filter(producto =>
            producto.nombre.toLowerCase().includes(filtro)
        );
        renderProductos(productosFiltrados);
    });

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

    registrarVentaBtn.addEventListener('click', async () => {
        if (registrarVentaBtn.disabled) return; // Evita doble click rápido
        if (seleccionados.length === 0) {
            console.log('INTENTO DE VENTA SIN PRODUCTOS: mostrarFlash debe ejecutarse');
            mostrarFlash('No puedes realizar una venta sin productos en el carrito.', 'error');
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
                mostrarFlash('Venta registrada con éxito', 'success');
                setTimeout(() => location.reload(), 1200); // Recarga la página tras mostrar mensaje
            } else {
                const error = await response.json();
                mostrarFlash(`Error al registrar la venta: ${error.message}`, 'error');
                registrarVentaBtn.disabled = false;
                registrarVentaBtn.classList.remove('opacity-60', 'cursor-not-allowed');
            }
        } catch (e) {
            mostrarFlash('Error de red al registrar la venta.', 'error');
            registrarVentaBtn.disabled = false;
            registrarVentaBtn.classList.remove('opacity-60', 'cursor-not-allowed');
        }
    });
    // --- 6. INICIALIZACIÓN ---
    verificarCajaAbierta();
    cargarProductos();
});