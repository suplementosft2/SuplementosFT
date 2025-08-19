console.log("Hola desde archivo externo");

// Objeto carrito: { productoId: {nombre, precio, cantidad, imagen, sabor} }
let carrito = JSON.parse(localStorage.getItem("carrito")) || {};

// Actualiza el contador del carrito en el header
function actualizarContador() {
    const cantidad = Object.values(carrito).reduce((acc, item) => acc + item.cantidad, 0);
    const contador = document.getElementById("carrito-cantidad");
    if (contador) contador.textContent = cantidad;
}

// Agrega un producto al carrito
function agregarAlCarrito(id, nombre, precio, imagen, sabor) {
    const key = id + "-" + (sabor || "");
    if (carrito[key]) {
        carrito[key].cantidad++;
    } else {
        carrito[key] = { nombre, precio, cantidad: 1, imagen, sabor };
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
    actualizarTotales();
}

// Capitaliza el nombre del sabor
function mostrarNombreSabor(sabor) {
    if (!sabor) return "";
    if (sabor.toLowerCase() === "cookies") return "Cookies & Cream";
    return sabor.charAt(0).toUpperCase() + sabor.slice(1).toLowerCase();
}

// Renderiza el carrito en la página
function renderizarCarrito() {
    const contenedor = document.querySelector(".carrito-contenido");
    const totalPrecio = document.getElementById("carrito-total-precio");
    if (!contenedor || !totalPrecio) return;

    contenedor.innerHTML = "";
    const productos = Object.entries(carrito);

    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div class="carrito-vacio">
                <p>Tu carrito está vacío.</p>
                <a href="catalogo.html" class="boton">Ver Catálogo</a>
            </div>
        `;
        totalPrecio.textContent = "$0";
        actualizarTotales();
        return;
    }

    productos.forEach(([id, prod]) => {
        contenedor.innerHTML += `
        <div class="carrito-producto">
            <img src="${prod.imagen}" alt="${prod.nombre}" />
            <div class="carrito-info">
                <h2>${prod.nombre}</h2>
                <span class="sabor-sticker">${mostrarNombreSabor(prod.sabor)}</span>
                <p class="carrito-precio">$${prod.precio * prod.cantidad}</p>
                <div class="carrito-cantidad">
                    <button onclick="cambiarCantidad('${id}', -1)">-</button>
                    <span>${prod.cantidad}</span>
                    <button onclick="cambiarCantidad('${id}', 1)">+</button>
                </div>
                <button class="carrito-eliminar" onclick="eliminarProducto('${id}')">Eliminar</button>
            </div>
        </div>
        `;
    });
    actualizarTotales();
}

// Cambia la cantidad de un producto
function cambiarCantidad(id, cambio) {
    if (carrito[id]) {
        carrito[id].cantidad += cambio;
        if (carrito[id].cantidad < 1) carrito[id].cantidad = 1;
        localStorage.setItem("carrito", JSON.stringify(carrito));
        renderizarCarrito();
        actualizarContador();
    }
}

// Elimina un producto del carrito
function eliminarProducto(id) {
    delete carrito[id];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContador();
    actualizarTotales();
}

// Obtiene el costo de envío (siempre 0, se acuerda con el vendedor)
function obtenerCostoEnvio() {
    return 0;
}

// Actualiza los totales en el carrito
function actualizarTotales() {
    const totalProductos = Object.values(carrito).reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);

    const totalPrecio = document.getElementById("carrito-total-precio");
    const envioPrecio = document.getElementById("carrito-envio-precio");
    const totalFinal = document.getElementById("carrito-total-final");

    if (totalPrecio) totalPrecio.textContent = `$${totalProductos}`;
    if (envioPrecio) envioPrecio.textContent = "-";
    if (totalFinal) totalFinal.textContent = `$${totalProductos}`;
}

// Finalizar compra: enviar pedido por WhatsApp
function finalizarCompraWhatsApp() {
    const productos = Object.values(carrito);
    if (productos.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    // Obtiene opción de envío y pago
    const envioSelect = document.getElementById("opcion-envio");
    const pagoSelect = document.getElementById("opcion-pago");
    const envioElegido = envioSelect ? envioSelect.options[envioSelect.selectedIndex].text : "";
    const pagoElegido = pagoSelect ? pagoSelect.options[pagoSelect.selectedIndex].text : "";

    // Validación: que elija ambas opciones
    if (!envioSelect || !envioSelect.value || !pagoSelect || !pagoSelect.value) {
        alert("Por favor, seleccioná el tipo de envío y el medio de pago antes de finalizar la compra.");
        return;
    }

    let mensaje = "¡Hola! Quiero hacer un pedido:\n";
    productos.forEach((prod) => {
        mensaje += `• ${prod.nombre} (${mostrarNombreSabor(prod.sabor)}) x${prod.cantidad} - $${prod.precio * prod.cantidad}\n`;
    });
    const total = productos.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);

    mensaje += `\nTipo de envío: ${envioElegido}`;
    mensaje += `\nMedio de pago: ${pagoElegido}`;
    mensaje += `\nTotal productos: $${total}`;
    mensaje += `\nEnvío: A coordinar con el vendedor`;
    mensaje += `\nTotal a pagar: $${total}`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    window.open(`https://wa.me/5491144029317?text=${mensajeCodificado}`, "_blank");
}

// Inicializa el render del carrito y eventos al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarContador();
    if (document.querySelector(".carrito-contenido")) {
        renderizarCarrito();
        const btnFinalizar = document.getElementById("finalizar-compra");
        if (btnFinalizar) {
            btnFinalizar.onclick = finalizarCompraWhatsApp;
        }
        actualizarTotales();

        const envioSelect = document.getElementById("opcion-envio");
        if (envioSelect) envioSelect.addEventListener("change", actualizarTotales);
        const pagoSelect = document.getElementById("opcion-pago");
        if (pagoSelect) pagoSelect.addEventListener("change", actualizarTotales);
    }
});

function seleccionarSaborCombo(elemento, comboId, sabor) {
    // Resalta el sabor seleccionado solo en este combo
    document.querySelectorAll(`.producto input[id="sabor-${comboId}"]`).forEach((input) => (input.value = ""));
    elemento.parentElement.querySelectorAll("li").forEach((li) => li.classList.remove("selected"));
    elemento.classList.add("selected");
    document.getElementById(`sabor-${comboId}`).value = sabor;

    // Habilita el botón y setea el onclick correcto
    const btn = document.getElementById(`btn${comboId.charAt(0).toUpperCase() + comboId.slice(1)}`);
    btn.disabled = false;
    if (comboId === "combo2") {
        btn.onclick = function () {
            agregarAlCarrito(
                "combo-creatina1kg-whey3kg",
                "Creatina 1kg Pote + Whey Protein Zipper Pack 3kg",
                109900,
                "img/combo-creatina1kg-whey3kg.png",
                sabor
            );
        };
    } else if (comboId === "combo3") {
        btn.onclick = function () {
            agregarAlCarrito(
                "combo-creatina-whey",
                "Creatina 300gr Doypack + Whey Protein Doypack 2 Lb",
                49900,
                "img/combo-creatina-whey.png",
                sabor
            );
        };
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".precio-producto").textContent = "$" + formatearPrecio(precioActual);
});
