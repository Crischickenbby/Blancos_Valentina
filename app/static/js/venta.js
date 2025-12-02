// Mostrar flash de notificaciones
function mostrarFlash(mensaje, tipo = "info") {
    console.log('[mostrarFlash]', mensaje, tipo);
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

// Variables globales
window.seleccionados = [];
window.categoriasGlobal = [];

// Elementos del DOM (globales)
let productosSeleccionados;
let totalVenta;
let registrarVentaBtn;
let metodoPagoSelect;
let categoriasCont;
let buscadorCategorias;
let modalProductos;
let cerrarModalProductos;
let nombreCategoriaModal;
let listaProductosModal;

// Función para actualizar el carrito
function actualizarSeleccionados() {
    productosSeleccionados.innerHTML = '';
    let total = 0;
    window.seleccionados.forEach(producto => {
        const subtotal = producto.cantidad * producto.precio;
        total += subtotal;
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        
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

// Función para mostrar modal de cantidad
function mostrarModalCantidad(prod, maxStock) {
    console.log('[mostrarModalCantidad] Abriendo modal para producto:', prod);
    let modalCantidad = document.getElementById('modal-cantidad-producto');
    if (modalCantidad) modalCantidad.remove();
    
    modalCantidad = document.createElement('div');
    modalCantidad.id = 'modal-cantidad-producto';
    modalCantidad.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40';
    modalCantidad.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full border-4 border-pink-200 flex flex-col items-center animate-fade-in">
            <h3 class="text-xl font-bold text-purple-700 mb-2 text-center">¿Cuántas unidades deseas agregar?</h3>
            <div class="text-gray-500 text-sm mb-4">Stock disponible: <span class="font-semibold text-pink-600">${maxStock}</span></div>
            <input id="input-cantidad-modal" type="number" min="1" max="${maxStock}" value="1" class="w-24 text-center border-2 border-purple-200 rounded-lg py-2 px-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4" />
            <div class="flex gap-4 w-full">
                <button id="btn-cantidad-aceptar" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-2 rounded-lg transition-all">Agregar</button>
                <button id="btn-cantidad-cancelar" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-lg transition-all">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalCantidad);
    document.body.style.overflow = 'hidden';

    const input = document.getElementById('input-cantidad-modal');
    input.focus();
    input.select();

    // Cerrar modal
    function cerrar() {
        modalCantidad.remove();
        document.body.style.overflow = '';
    }
    
    document.getElementById('btn-cantidad-cancelar').onclick = cerrar;
    modalCantidad.onclick = function(e) { 
        if (e.target === modalCantidad) cerrar(); 
    };

    // Validar input
    input.addEventListener('input', function() {
        if (input.value === '') return;
        let val = parseInt(input.value);
        if (isNaN(val) || val < 1) {
            input.value = 1;
        } else if (val > maxStock) {
            input.value = maxStock;
        }
    });

    // Agregar al carrito
    document.getElementById('btn-cantidad-aceptar').onclick = function() {
        console.log('[btn-cantidad-aceptar] Click detectado');
        let cantidad = parseInt(input.value);
        console.log('[btn-cantidad-aceptar] Cantidad:', cantidad);
        
        if (isNaN(cantidad) || cantidad <= 0) {
            mostrarFlash('Cantidad inválida.', 'error');
            return;
        }
        if (cantidad > maxStock) {
            cantidad = maxStock;
        }
        
        console.log('[btn-cantidad-aceptar] Producto:', prod);
        console.log('[btn-cantidad-aceptar] Seleccionados antes:', window.seleccionados);
        
        let existente = window.seleccionados.find(p => p.id === prod.id);
        if (existente) {
            if (existente.cantidad + cantidad > maxStock) {
                mostrarFlash('No puedes agregar más de las que hay en stock.', 'error');
                return;
            }
            existente.cantidad += cantidad;
        } else {
            window.seleccionados.push({ ...prod, cantidad });
        }
        
        console.log('[btn-cantidad-aceptar] Seleccionados después:', window.seleccionados);
        actualizarSeleccionados();
        mostrarFlash('Producto agregado al carrito.', 'success');
        cerrar();
        
        // Cerrar modal de categoría también
        if (modalProductos) {
            modalProductos.classList.add('hidden');
            modalProductos.classList.remove('flex');
        }
        
        // Desplazarse hasta arriba de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Enter para aceptar
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('btn-cantidad-aceptar').click();
        }
    });
}

// Función para renderizar categorías
function renderizarCategorias(categorias) {
    if (!categoriasCont) return;
    if (categorias.length === 0) {
        categoriasCont.innerHTML = '<span class="text-gray-500">No hay categorías registradas.</span>';
        return;
    }
    categoriasCont.innerHTML = '';
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
        categoriasCont.appendChild(card);
    });
}

// Función para abrir modal de categoría
function abrirModalCategoria(idCategoria, nombreCategoria) {
    console.log('[abrirModalCategoria] Abriendo modal para categoría:', nombreCategoria);
    nombreCategoriaModal.textContent = nombreCategoria;
    listaProductosModal.innerHTML = '<div class="text-gray-400">Cargando productos...</div>';
    modalProductos.classList.remove('hidden');
    modalProductos.classList.add('flex');
    
    fetch(`/api/productos`)
        .then(r => r.json())
        .then(productos => {
            console.log('[abrirModalCategoria] Productos cargados:', productos);
            const filtrados = productos.filter(p => p.id_categoria === idCategoria || p.idCategoria === idCategoria);
            console.log('[abrirModalCategoria] Productos filtrados:', filtrados);
            
            listaProductosModal.innerHTML = '';
            if (filtrados.length === 0) {
                listaProductosModal.innerHTML = '<span class="text-gray-500">No hay productos en esta categoría.</span>';
            } else {
                filtrados.forEach(prod => {
                    const card = document.createElement('div');
                    card.className = 'p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow flex flex-col gap-2 cursor-pointer hover:shadow-xl hover:border-pink-400 transition-all';
                    card.innerHTML = `
                        <div class="font-bold text-lg text-purple-700">${prod.nombre || prod.name}</div>
                        <div class="text-gray-600 text-sm mb-1">${prod.descripcion || ''}</div>
                        <div class="text-pink-700 font-semibold">$${prod.precio ? prod.precio.toFixed(2) : (prod.price ? prod.price.toFixed(2) : '')}</div>
                        <div class="text-xs text-gray-400">Stock: ${prod.stock ?? ''}</div>
                    `;
                    card.addEventListener('click', function() {
                        console.log('[card-click] Producto clickeado:', prod);
                        let maxStock = prod.stock ?? 0;
                        if (maxStock <= 0) {
                            mostrarFlash('No hay stock disponible de este producto.', 'error');
                            return;
                        }
                        mostrarModalCantidad(prod, maxStock);
                    });
                    listaProductosModal.appendChild(card);
                });
            }
        })
        .catch(err => {
            console.error('[abrirModalCategoria] Error:', err);
            listaProductosModal.innerHTML = '<span class="text-red-500">Error al cargar productos.</span>';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[init] Inicializando venta.js');
    
    // Asignar elementos del DOM
    productosSeleccionados = document.getElementById('productos-seleccionados');
    totalVenta = document.getElementById('total-venta');
    registrarVentaBtn = document.getElementById('registrar-venta');
    metodoPagoSelect = document.getElementById('metodo-pago');
    
    // Elementos de categorías
    categoriasCont = document.getElementById('categorias-contenido');
    buscadorCategorias = document.getElementById('buscador-categorias');
    modalProductos = document.getElementById('modal-productos-categoria');
    cerrarModalProductos = document.getElementById('cerrar-modal-categoria');
    nombreCategoriaModal = document.getElementById('nombre-categoria-modal');
    listaProductosModal = document.getElementById('lista-productos-modal');

    // Cargar categorías al iniciar
    console.log('[init] Cargando categorías...');
    fetch('/api/categorias')
        .then(r => r.json())
        .then(categorias => {
            console.log('[init] Categorías cargadas:', categorias);
            window.categoriasGlobal = categorias;
            renderizarCategorias(categorias);
        })
        .catch(err => console.error('[init] Error:', err));

    // Buscador de categorías
    if (buscadorCategorias) {
        buscadorCategorias.addEventListener('input', function() {
            const filtro = buscadorCategorias.value.toLowerCase();
            let filtradas = [];
            
            if (filtro === '') {
                // Si está vacío, mostrar todas
                filtradas = window.categoriasGlobal;
            } else {
                // Buscar coincidencias
                filtradas = window.categoriasGlobal.filter(cat => 
                    cat.nombre.toLowerCase().includes(filtro)
                );
            }
            
            renderizarCategorias(filtradas);
            
            // Mostrar mensaje si no hay resultados
            if (filtradas.length === 0 && filtro !== '') {
                categoriasCont.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <i class="fas fa-search text-4xl text-gray-300 mb-3 block"></i>
                        <p class="text-gray-500 text-lg">No se encontraron categorías con "<strong>${filtro}</strong>"</p>
                        <p class="text-gray-400 text-sm mt-2">Intenta con otro término de búsqueda</p>
                    </div>
                `;
            }
        });
        
        // Limpiar buscador cuando se hace focus
        buscadorCategorias.addEventListener('focus', function() {
            if (buscadorCategorias.value === '') {
                buscadorCategorias.placeholder = 'Escribe para buscar...';
            }
        });
    }

    // Cerrar modal de productos
    if (cerrarModalProductos) {
        cerrarModalProductos.addEventListener('click', function() {
            modalProductos.classList.add('hidden');
            modalProductos.classList.remove('flex');
        });
    }
    if (modalProductos) {
        modalProductos.addEventListener('click', function(e) {
            if (e.target === modalProductos) {
                modalProductos.classList.add('hidden');
                modalProductos.classList.remove('flex');
            }
        });
    }

    // Quitar productos del carrito
    if (productosSeleccionados) {
        productosSeleccionados.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-quitar');
            if (btn) {
                const id = parseInt(btn.dataset.id);
                const index = window.seleccionados.findIndex(p => p.id === id);
                if (index !== -1) {
                    window.seleccionados.splice(index, 1);
                    actualizarSeleccionados();
                    mostrarFlash('Producto eliminado del carrito', 'success');
                }
            }
        });
    }

    // Registrar venta
    if (registrarVentaBtn) {
        registrarVentaBtn.addEventListener('click', async () => {
            if (registrarVentaBtn.disabled) return;
            if (window.seleccionados.length === 0) {
                mostrarFlash('No puedes realizar una venta sin productos en el carrito.', 'error');
                return;
            }
            
            registrarVentaBtn.disabled = true;
            registrarVentaBtn.classList.add('opacity-60', 'cursor-not-allowed');
            
            const metodoPago = metodoPagoSelect.value;
            const venta = {
                productos: window.seleccionados,
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
                    setTimeout(() => location.reload(), 1200);
                } else {
                    const error = await response.json();
                    mostrarFlash(`Error: ${error.message}`, 'error');
                    registrarVentaBtn.disabled = false;
                    registrarVentaBtn.classList.remove('opacity-60', 'cursor-not-allowed');
                }
            } catch (e) {
                mostrarFlash('Error de red.', 'error');
                registrarVentaBtn.disabled = false;
                registrarVentaBtn.classList.remove('opacity-60', 'cursor-not-allowed');
            }
        });
    }

    console.log('[init] Inicialización completada');
});
