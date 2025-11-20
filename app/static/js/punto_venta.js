
document.addEventListener("DOMContentLoaded", () => {
    // Estado actual del sidebar (expandido o contraído)
    let isManuallyCollapsed = false;
    // Elementos principales
    let sidebar = document.querySelector(".sidebar"); // Sidebar lateral
    let closeBtn = document.querySelector("#btn");   // Botón para contraer/expandir
    const mainContent = document.querySelector(".ml-20, .lg\\:ml-64"); // Contenido principal

    // Función para mostrar/ocultar el sidebar manualmente
    function toggleSidebar() {
        // Elementos que cambian al expandir/contraer
        const logoName = document.querySelector(".logo_name"); // Texto del logo
        const subtitle = document.getElementById("sidebarSubtitle"); // Subtítulo
        const linksNames = document.querySelectorAll(".links_name"); // Nombres de los links
        const navLinks = document.querySelectorAll(".nav-list a"); // Links de navegación
        const headerFlex = document.querySelector(".w-full.flex.flex-row.items-center"); // Header del sidebar
        const centrar_logo = document.querySelectorAll(".centrar_logo"); // Contenedor logo y botón

        if (!isManuallyCollapsed) {
            // Contraer sidebar
            sidebar.classList.remove("lg:w-64");
            sidebar.classList.add("w-20");
            closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");

            // Ocultar textos del logo y subtítulo
            if (logoName) {
                logoName.classList.remove("lg:block");
                logoName.classList.add("hidden");
            }
            if (subtitle) {
                subtitle.classList.remove("lg:block");
                subtitle.classList.add("hidden");
            }
            // Ocultar nombres de los links
            linksNames.forEach(link => {
                link.classList.remove("lg:inline");
                link.classList.add("hidden");
            });

            // Centrar iconos de navegación
            navLinks.forEach(link => {
                link.classList.remove("lg:p-3", "lg:justify-start");
                link.classList.add("p-2", "justify-center");
            });

            // Centrar logo y botón en el header
            if (headerFlex) {
                headerFlex.classList.remove("lg:justify-between");
                headerFlex.classList.add("justify-center");
            }
            // Centrar el contenedor del logo y botón
            centrar_logo.forEach(element => {
                element.classList.remove("justify-between");
                element.classList.add("justify-center");
            });

            // Ajustar margen del contenido principal
            if (mainContent) {
                mainContent.classList.remove("lg:ml-64");
                mainContent.classList.add("ml-20");
            }

            isManuallyCollapsed = true; // Guardar estado contraído

        } else {
            // Expandir sidebar (restaurar estado original)
            sidebar.classList.remove("w-20");
            sidebar.classList.add("lg:w-64");
            closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");

            // Mostrar textos del logo y subtítulo
            if (logoName) {
                logoName.classList.remove("hidden");
                logoName.classList.add("lg:block");
            }
            if (subtitle) {
                subtitle.classList.remove("hidden");
                subtitle.classList.add("lg:block");
            }
            // Mostrar nombres de los links
            linksNames.forEach(link => {
                link.classList.remove("hidden");
                link.classList.add("lg:inline");
            });

            // Restaurar iconos y alineación de navegación
            navLinks.forEach(link => {
                link.classList.remove("p-2", "justify-center");
                link.classList.add("lg:p-3", "lg:justify-start");
            });

            // Restaurar el contenedor del logo y botón
            centrar_logo.forEach(element => {
                element.classList.remove("justify-center");
                element.classList.add("justify-between");
            });

            // Restaurar separación en el header
            if (headerFlex) {
                headerFlex.classList.remove("justify-center");
                headerFlex.classList.add("lg:justify-between"); // Solo en pantallas grandes
            }

            // Restaurar margen del contenido principal
            if (mainContent) {
                mainContent.classList.remove("ml-20");
                mainContent.classList.add("lg:ml-64");
            }

            isManuallyCollapsed = false; // Guardar estado expandido
        }
    }

    // Asignar evento al botón para mostrar/ocultar sidebar
    if (closeBtn) {
        closeBtn.addEventListener("click", toggleSidebar);
    }
});