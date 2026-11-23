

document.addEventListener("DOMContentLoaded", function () {
    const whatsappWidget = document.getElementById("zw-wa");
    const whatsappBubble = document.getElementById("zw-wa-bubble");
    const whatsappClose = document.getElementById("zw-wa-close");

    if (whatsappWidget && whatsappBubble && whatsappClose) {
        let closed = false;

        try {
            closed = sessionStorage.getItem("zw-wa-closed") === "1";
        } catch (error) {
            closed = false;
        }

        if (!closed) {
            window.setTimeout(() => {
                whatsappBubble.hidden = false;
            }, 4000);
        }

        whatsappClose.addEventListener("click", function () {
            whatsappBubble.hidden = true;

            try {
                sessionStorage.setItem("zw-wa-closed", "1");
            } catch (error) {
                return;
            }
        });
    }

    const navbar = document.getElementById("navbar-principal");
    const enlacesMenu = document.querySelectorAll(".page-scroll");
    const secciones = document.querySelectorAll("section[id]");
    const menuColapsable = document.getElementById("navbarSupportedContent");

    function actualizarMenu() {
        const scrollActual = window.scrollY;

        if (navbar) {
            navbar.classList.toggle("sticky", scrollActual > 50);
        }

        secciones.forEach(seccion => {
            const alturaSeccion = seccion.offsetHeight;
            const topeSeccion = seccion.offsetTop - 110;
            const idSeccion = seccion.getAttribute("id");
            const enlaceCorrespondiente = document.querySelector(`#nav a[href="#${idSeccion}"]`);

            if (enlaceCorrespondiente && scrollActual >= topeSeccion && scrollActual < topeSeccion + alturaSeccion) {
                document.querySelectorAll("#nav .nav-item").forEach(item => item.classList.remove("active"));
                enlaceCorrespondiente.parentElement.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", actualizarMenu);
    actualizarMenu();

    enlacesMenu.forEach(enlace => {
        enlace.addEventListener("click", function (e) {
            const destinoId = this.getAttribute("href");
            if (!destinoId || !destinoId.startsWith("#") || destinoId.length <= 1) return;

            const elementoDestino = document.querySelector(destinoId);
            if (elementoDestino) {
                e.preventDefault();
                const posicionDestino = elementoDestino.offsetTop - 75;

                window.scrollTo({
                    top: posicionDestino,
                    behavior: "smooth"
                });

                if (menuColapsable && menuColapsable.classList.contains("show") && typeof $ !== "undefined") {
                    $(menuColapsable).collapse("hide");
                }
            }
        });
    });

    const mapaContenedor = document.getElementById("mapa-cobertura");
    const cajaResultado = document.getElementById("resultado-zona");
    const formBuscador = document.getElementById("form-buscador");
    const inputLugar = document.getElementById("input-lugar");
    const btnBuscar = document.getElementById("btn-buscar");
    const btnLimpiar = document.getElementById("btn-limpiar");

    if (!mapaContenedor || typeof L === "undefined") {
        if (cajaResultado) {
            cajaResultado.classList.remove("d-none");
            cajaResultado.classList.add("alerta_no_disponible");
            cajaResultado.textContent = "No se pudo cargar el mapa. Verifica tu conexión a internet.";
        }
        return;
    }

const BASE_LAT = 9.353863;
    const BASE_LNG = -83.6746481;
    const centroPZ = [BASE_LAT, BASE_LNG];

    const RADIO_GRATIS_KM = 5;
    const RADIO_EXTRA_KM = 12;
    const TARIFA_EXTRA_COLONES = 2500;

    const BARRIOS_PZ = {
        "san isidro": { lat: 9.3738, lng: -83.7042, nombre: "San Isidro de El General" },
        "daniel flores": { lat: 9.3496, lng: -83.6793, nombre: "Daniel Flores" },
        "palmares": { lat: 9.3275, lng: -83.6669, nombre: "Palmares" },
        "quebradas": { lat: 9.4214, lng: -83.7086, nombre: "Quebradas" },
        "rivas": { lat: 9.4239, lng: -83.6631, nombre: "Rivas" },
        "general viejo": { lat: 9.3761, lng: -83.6497, nombre: "General Viejo" },
        "pedregoso": { lat: 9.3831, lng: -83.7336, nombre: "Pedregoso" },
        "morazan": { lat: 9.4064, lng: -83.7239, nombre: "Morazán" },
        "sinai": { lat: 9.3853, lng: -83.6947, nombre: "Barrio Sinaí" },
        "boston": { lat: 9.3692, lng: -83.7075, nombre: "Barrio Boston" },
        "las americas": { lat: 9.3655, lng: -83.6980, nombre: "Barrio Las Américas" },
        "cooperativa": { lat: 9.3760, lng: -83.6950, nombre: "Barrio Cooperativa" },
        "villa ligia": { lat: 9.3585, lng: -83.6920, nombre: "Villa Ligia" },
        "la palma": { lat: 9.3358, lng: -83.6753, nombre: "La Palma" },
        "pejibaye": { lat: 9.1772, lng: -83.5758, nombre: "Pejibaye" },
        "platanares": { lat: 9.2167, lng: -83.6333, nombre: "Platanares" },
        "cajon": { lat: 9.3106, lng: -83.5889, nombre: "Cajón" },
        "san pedro": { lat: 9.2861, lng: -83.5536, nombre: "San Pedro" }
    };

    const mapa = L.map("mapa-cobertura", {
        center: centroPZ,
        zoom: 12,
        minZoom: 11,
        maxZoom: 18
    });

    const capaEsri = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; OpenStreetMap contributors",
        maxZoom: 19
    });

    const capaCarto = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19
    });

    capaEsri.addTo(mapa);

    capaEsri.on("tileerror", () => {
        if (!mapa.hasLayer(capaCarto)) {
            mapa.removeLayer(capaEsri);
            capaCarto.addTo(mapa);
        }
    });

    setTimeout(() => {
        mapa.invalidateSize();
    }, 250);

    function crearPinColor(colorHex) {
        return L.divIcon({
            className: "pin-personalizado",
            html: `<div style="
                background-color: ${colorHex};
                width: 22px;
                height: 22px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid #ffffff;
                box-shadow: 0 2px 5px rgba(0,0,0,0.4);
            "></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 22],
            popupAnchor: [0, -22]
        });
    }

    L.marker(centroPZ, { icon: crearPinColor("#035388") })
        .addTo(mapa)
        .bindPopup("<b>Base CleanCars</b><br>Lourdes, Daniel Flores");

    L.circle(centroPZ, {
        radius: RADIO_EXTRA_KM * 1000,
        color: "#e6b800",
        weight: 2,
        fillColor: "#ffd000",
        fillOpacity: 0.22,
        interactive: false
    }).addTo(mapa);

    L.circle(centroPZ, {
        radius: RADIO_GRATIS_KM * 1400,
        color: "#008a00",
        weight: 2,
        fillColor: "#008a00",
        fillOpacity: 0.25,
        interactive: false
    }).addTo(mapa);

    let marcadorCliente = null;
    let lineaRuta = null;

    function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function normalizarTexto(texto) {
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function limpiarSeleccion() {
        if (marcadorCliente) {
            mapa.removeLayer(marcadorCliente);
            marcadorCliente = null;
        }
        if (lineaRuta) {
            mapa.removeLayer(lineaRuta);
            lineaRuta = null;
        }
        if (cajaResultado) {
            cajaResultado.classList.add("d-none");
            cajaResultado.innerHTML = "";
        }
        mapa.setView(centroPZ, 12);
    }

    function mostrarMensajeError(texto) {
        if (!cajaResultado) return;
        cajaResultado.classList.remove("d-none", "alerta_gratis", "alerta_extra");
        cajaResultado.classList.add("alerta_no_disponible");
        cajaResultado.innerHTML = texto;
    }

    function evaluarUbicacion(lat, lng, nombreLugar = "Ubicación seleccionada") {
        const distanciaKmNum = calcularDistanciaKm(BASE_LAT, BASE_LNG, lat, lng);
        const distanciaTexto = distanciaKmNum.toFixed(1);

        if (marcadorCliente) mapa.removeLayer(marcadorCliente);
        if (lineaRuta) mapa.removeLayer(lineaRuta);

        let colorZona = "#008a00";
        let claseAlerta = "alerta_gratis";
        let mensajeAlerta = "";
        let etiquetaPopup = "";

        if (distanciaKmNum <= RADIO_GRATIS_KM) {
            colorZona = "#008a00";
            claseAlerta = "alerta_gratis";
            mensajeAlerta = `🟢 <strong>${nombreLugar}</strong> (${distanciaTexto} km): ¡Tienes <strong>Transporte Gratis</strong>!`;
            etiquetaPopup = `<span style="color:#008a00; font-weight:bold;">● Transporte gratis</span>`;
        } else if (distanciaKmNum <= RADIO_EXTRA_KM) {
            colorZona = "#d4ac00";
            claseAlerta = "alerta_extra";
            mensajeAlerta = `🟡 <strong>${nombreLugar}</strong> (${distanciaTexto} km): Aplica <strong>Tarifa Extra</strong> de ₡${TARIFA_EXTRA_COLONES.toLocaleString()}.`;
            etiquetaPopup = `<span style="color:#b38f00; font-weight:bold;">● Tarifa extra (₡${TARIFA_EXTRA_COLONES.toLocaleString()})</span>`;
        } else {
            colorZona = "#8b1e00";
            claseAlerta = "alerta_no_disponible";
            mensajeAlerta = `🔴 <strong>${nombreLugar}</strong> (${distanciaTexto} km): Lo sentimos, esta zona aparece como <strong>No disponible</strong>.`;
            etiquetaPopup = `<span style="color:#8b1e00; font-weight:bold;">● No disponible</span>`;
        }

        if (cajaResultado) {
            cajaResultado.classList.remove("d-none", "alerta_gratis", "alerta_extra", "alerta_no_disponible");
            cajaResultado.classList.add(claseAlerta);
            cajaResultado.innerHTML = mensajeAlerta;
        }

        marcadorCliente = L.marker([lat, lng], { icon: crearPinColor(colorZona) })
            .addTo(mapa)
            .bindPopup(`<b>${nombreLugar}</b><br>Distancia: ${distanciaTexto} km<br>${etiquetaPopup}`)
            .openPopup();

        lineaRuta = L.polyline([centroPZ, [lat, lng]], {
            color: colorZona,
            weight: 4,
            dashArray: "6, 6"
        }).addTo(mapa);

        if (btnLimpiar) {
            btnLimpiar.classList.remove("d-none");
        }
    }

    mapa.on("click", function (e) {
        evaluarUbicacion(e.latlng.lat, e.latlng.lng, "Punto seleccionado en el mapa");
    });

    if (btnLimpiar && inputLugar) {
        btnLimpiar.addEventListener("click", function () {
            inputLugar.value = "";
            btnLimpiar.classList.add("d-none");
            limpiarSeleccion();
        });

        inputLugar.addEventListener("input", function () {
            if (!inputLugar.value.trim()) {
                btnLimpiar.classList.add("d-none");
                limpiarSeleccion();
            }
        });
    }

    if (formBuscador && inputLugar) {
        formBuscador.addEventListener("submit", async function (e) {
            e.preventDefault();
            const textoBusqueda = inputLugar.value.trim();
            if (!textoBusqueda) return;

            const claveLimpia = normalizarTexto(textoBusqueda);

            for (const key in BARRIOS_PZ) {
                if (claveLimpia.includes(normalizarTexto(key))) {
                    const lugar = BARRIOS_PZ[key];
                    evaluarUbicacion(lugar.lat, lugar.lng, lugar.nombre);
                    return;
                }
            }

            if (btnBuscar) {
                btnBuscar.textContent = "Buscando...";
                btnBuscar.disabled = true;
            }

            try {
                const query = encodeURIComponent(`${textoBusqueda}, Pérez Zeledón, San José, Costa Rica`);
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

                const respuesta = await fetch(url);
                const datos = await respuesta.json();

                if (datos && datos.length > 0) {
                    const lugar = datos[0];
                    const nombreCorto = lugar.display_name.split(",")[0];
                    evaluarUbicacion(parseFloat(lugar.lat), parseFloat(lugar.lon), nombreCorto);
                } else {
                    mostrarMensajeError(`No encontramos "<strong>${textoBusqueda}</strong>". Selecciona una zona de la lista o haz clic directo en el mapa.`);
                }
            } catch (error) {
                mostrarMensajeError("Selecciona una zona de la lista desplegable o toca tu ubicación en el mapa.");
            } finally {
                if (btnBuscar) {
                    btnBuscar.textContent = "Buscar";
                    btnBuscar.disabled = false;
                }
            }
        });
    }
});

//TESTIMONIOS

(function initializeReviews() {
    const testimonialsStorageKey = "cleancars-testimonials";
    const initialTestimonials = [
        {
            name: "Amanda Ríos",
            comment: "Buen servicio y ahorro tiempo en transporte",
            rating: 5
        },
        {
            name: "Luis Mendoza",
            comment: "Dejaron el auto impecable por dentro y por fuera",
            rating: 5
        },
        {
            name: "Valeria Solís",
            comment: "Muy puntuales y responsables con el cuidado del vehículo",
            rating: 5
        },
        {
            name: "Diego Brenes",
            comment: "Excelente relación calidad-precio, volveré a usar el servicio",
            rating: 4
        }
    ];

    const marqueeWrapper = document.getElementById("marqueeWrapper");
    const marqueeTrack = document.getElementById("marqueeTrack");
    const openModalBtn = document.getElementById("openModalBtn");
    const ratingModal = document.getElementById("ratingModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const ratingForm = document.getElementById("ratingForm");
    const starButtons = Array.from(document.querySelectorAll("#starRating .reviews-star-btn"));
    const ratingValueInput = document.getElementById("ratingValue");
    const clientNameInput = document.getElementById("clientName");
    const clientCommentInput = document.getElementById("clientComment");
    const nameError = document.getElementById("nameError");
    const commentError = document.getElementById("commentError");
    const storageError = document.getElementById("reviewsStorageError");

    if (
        !marqueeWrapper ||
        !marqueeTrack ||
        !openModalBtn ||
        !ratingModal ||
        !closeModalBtn ||
        !cancelModalBtn ||
        !ratingForm ||
        !ratingValueInput ||
        !clientNameInput ||
        !clientCommentInput ||
        !nameError ||
        !commentError ||
        !storageError
    ) {
        return;
    }

    let savedTestimonials = [];
    try {
        const storedTestimonials = window.localStorage.getItem(testimonialsStorageKey);
        if (storedTestimonials !== null) {
            const parsedTestimonials = JSON.parse(storedTestimonials);
            if (
                !Array.isArray(parsedTestimonials) ||
                parsedTestimonials.some((item) =>
                    !item ||
                    typeof item.name !== "string" ||
                    typeof item.comment !== "string" ||
                    !Number.isInteger(item.rating) ||
                    item.rating < 1 ||
                    item.rating > 5
                )
            ) {
                throw new Error("Los testimonios guardados tienen un formato inválido.");
            }
            savedTestimonials = parsedTestimonials;
        }
    } catch (error) {
        console.error("No se pudieron cargar los testimonios guardados.", error);
        storageError.textContent = "No se pudieron cargar las opiniones guardadas en este navegador.";
    }

    let testimonials = [...savedTestimonials, ...initialTestimonials.map((item) => ({ ...item }))];
    let scrollPosition = 0;
    let isPaused = false;
    let animationFrameId = null;
    let autoScrollEnabled = false;
    let previousBodyOverflow = "";
    const desktopQuery = window.matchMedia("(min-width: 992px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scrollSpeed = 0.65;

    function escapeHTML(value) {
        const element = document.createElement("div");
        element.textContent = value;
        return element.innerHTML;
    }

    function renderStars(rating) {
        const safeRating = Math.max(1, Math.min(5, Number(rating) || 5));
        return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
    }

    function createCardElement(item, isDuplicate) {
        const card = document.createElement("article");
        const rating = Math.max(1, Math.min(5, Number(item.rating) || 5));
        card.className = "reviews-card";
        card.setAttribute("aria-label", `Testimonio de ${item.name}, ${rating} de 5 estrellas`);
        if (isDuplicate) card.setAttribute("aria-hidden", "true");
        card.innerHTML = `
            <div>
                <p class="reviews-comment">${escapeHTML(item.comment)}</p>
                <p class="reviews-author">${escapeHTML(item.name)}</p>
            </div>
            <div class="reviews-stars" aria-hidden="true">${renderStars(rating)}</div>
        `;
        return card;
    }

    function renderCarousel() {
        marqueeTrack.replaceChildren();
        const copies = autoScrollEnabled ? 2 : 1;

        for (let copyIndex = 0; copyIndex < copies; copyIndex++) {
            testimonials.forEach((item) => {
                marqueeTrack.appendChild(createCardElement(item, copyIndex > 0));
            });
        }

        scrollPosition = 0;
        marqueeTrack.style.transform = "translateX(0px)";
        marqueeWrapper.scrollLeft = 0;
    }

    function canAutoScroll() {
        return autoScrollEnabled && !isPaused && ratingModal.hidden && !document.hidden;
    }

    function stopAutoScroll() {
        if (animationFrameId !== null) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function animateMarquee() {
        animationFrameId = null;
        if (!canAutoScroll()) return;

        const secondCopy = marqueeTrack.children[testimonials.length];
        const loopWidth = secondCopy ? secondCopy.offsetLeft : 0;
        if (loopWidth > 0) {
            scrollPosition = (scrollPosition + scrollSpeed) % loopWidth;
            marqueeTrack.style.transform = `translateX(-${scrollPosition}px)`;
        }

        animationFrameId = window.requestAnimationFrame(animateMarquee);
    }

    function updateAutoScroll() {
        const nextAutoScroll = desktopQuery.matches && !reducedMotionQuery.matches;
        if (nextAutoScroll !== autoScrollEnabled) {
            stopAutoScroll();
            autoScrollEnabled = nextAutoScroll;
            marqueeWrapper.classList.toggle("is-autoplay", autoScrollEnabled);
            renderCarousel();
        }

        if (canAutoScroll()) {
            if (animationFrameId === null) {
                animationFrameId = window.requestAnimationFrame(animateMarquee);
            }
        } else {
            stopAutoScroll();
        }
    }

    function updateStarUI(selectedValue) {
        ratingValueInput.value = String(selectedValue);
        starButtons.forEach((button) => {
            const value = Number(button.dataset.value);
            const selected = value === selectedValue;
            button.classList.toggle("active", value <= selectedValue);
            button.setAttribute("aria-checked", String(selected));
            button.tabIndex = selected ? 0 : -1;
        });
    }

    function resetForm() {
        ratingForm.reset();
        updateStarUI(5);
        nameError.textContent = "";
        commentError.textContent = "";
    }

    function openModal() {
        isPaused = true;
        stopAutoScroll();
        previousBodyOverflow = document.body.style.overflow;
        ratingModal.hidden = false;
        document.body.style.overflow = "hidden";
        clientNameInput.focus();
    }

    function closeModal() {
        ratingModal.hidden = true;
        resetForm();
        document.body.style.overflow = previousBodyOverflow;
        openModalBtn.focus();
        isPaused = marqueeWrapper.matches(":hover") || marqueeWrapper.contains(document.activeElement);
        updateAutoScroll();
    }

    function resumeAfterInteraction() {
        if (ratingModal.hidden) {
            isPaused = marqueeWrapper.matches(":hover") || marqueeWrapper.contains(document.activeElement);
            updateAutoScroll();
        }
    }

    starButtons.forEach((button) => {
        button.addEventListener("click", () => {
            updateStarUI(Number(button.dataset.value));
        });

        button.addEventListener("keydown", (event) => {
            const currentValue = Number(button.dataset.value);
            let nextValue = currentValue;
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                nextValue = currentValue === 5 ? 1 : currentValue + 1;
            } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                nextValue = currentValue === 1 ? 5 : currentValue - 1;
            } else {
                return;
            }
            event.preventDefault();
            updateStarUI(nextValue);
            starButtons[nextValue - 1].focus();
        });
    });

    openModalBtn.addEventListener("click", openModal);
    closeModalBtn.addEventListener("click", closeModal);
    cancelModalBtn.addEventListener("click", closeModal);

    ratingModal.addEventListener("click", (event) => {
        if (event.target === ratingModal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !ratingModal.hidden) closeModal();
    });

    document.addEventListener("visibilitychange", updateAutoScroll);
    window.addEventListener("resize", updateAutoScroll);
    marqueeWrapper.addEventListener("mouseenter", () => {
        isPaused = true;
        updateAutoScroll();
    });
    marqueeWrapper.addEventListener("mouseleave", resumeAfterInteraction);
    marqueeWrapper.addEventListener("focusin", () => {
        isPaused = true;
        updateAutoScroll();
    });
    marqueeWrapper.addEventListener("focusout", resumeAfterInteraction);

    if (typeof desktopQuery.addEventListener === "function") {
        desktopQuery.addEventListener("change", updateAutoScroll);
        reducedMotionQuery.addEventListener("change", updateAutoScroll);
    } else {
        desktopQuery.addListener(updateAutoScroll);
        reducedMotionQuery.addListener(updateAutoScroll);
    }

    ratingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = clientNameInput.value.trim();
        const comment = clientCommentInput.value.trim();
        const rating = Number(ratingValueInput.value);
        nameError.textContent = name ? "" : "Por favor escribe tu nombre.";
        commentError.textContent = comment ? "" : "Por favor escribe tu testimonio.";
        if (!name || !comment || rating < 1 || rating > 5) return;

        const newTestimonial = { name, comment, rating };
        const nextSavedTestimonials = [newTestimonial, ...savedTestimonials];
        try {
            window.localStorage.setItem(testimonialsStorageKey, JSON.stringify(nextSavedTestimonials));
        } catch (error) {
            console.error("No se pudo guardar el testimonio.", error);
            storageError.textContent = "No se pudo guardar tu opinión. Revisa el almacenamiento disponible en el navegador e inténtalo de nuevo.";
            return;
        }

        savedTestimonials = nextSavedTestimonials;
        testimonials = [newTestimonial, ...testimonials];
        storageError.textContent = "";
        renderCarousel();
        closeModal();
    });

    ratingModal.hidden = true;
    updateStarUI(5);
    autoScrollEnabled = desktopQuery.matches && !reducedMotionQuery.matches;
    marqueeWrapper.classList.toggle("is-autoplay", autoScrollEnabled);
    renderCarousel();
    updateAutoScroll();
})();
