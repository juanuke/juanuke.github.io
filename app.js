// Lógica principal de interacción para las Guías de JuanUke

// Estado de la aplicación
const AppState = {
  isSubscribed: false,
  selectedPlan: "mensual_pro",
  activeCategory: "todas",
  searchQuery: "",
  currentViewingGuide: null,
};

// Inicialización cuando carga el DOM
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar iconos lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Renderizar componentes
  renderGuidesGrid();
  renderPricingCards();
  renderTestimonials();
  setupEventListeners();
  setupCardInputFormatting();
});

// Renderizar tarjetas de guías
function renderGuidesGrid() {
  const container = document.getElementById("guidesContainer");
  if (!container) return;

  const filteredGuides = GUIA_DATA.filter((guia) => {
    const matchesCategory =
      AppState.activeCategory === "todas" || guia.category === AppState.activeCategory;
    const matchesSearch =
      guia.title.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      guia.author.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      guia.excerpt.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      guia.topics.some((t) => t.toLowerCase().includes(AppState.searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (filteredGuides.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-16">
        <div class="inline-flex p-4 rounded-full bg-slate-800/80 text-purple-400 mb-4">
          <i data-lucide="search-x" class="w-10 h-10"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">No se encontraron guías</h3>
        <p class="text-slate-400 max-w-md mx-auto">No hay guías de JuanUke que coincidan con tu búsqueda. Intenta con otra palabra clave o selecciona 'Todas'.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = filteredGuides
    .map((guia) => {
      return `
      <div class="glass-card rounded-2xl overflow-hidden flex flex-col group relative border border-slate-800 hover:border-purple-500/50 transition-all duration-300">
        <!-- Badge de suscripción requerida o desbloqueado -->
        <div class="absolute top-4 right-4 z-10">
          ${
            AppState.isSubscribed
              ? `<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-lg backdrop-blur-md">
                  <i data-lucide="unlock" class="w-3.5 h-3.5"></i> Desbloqueado
                </span>`
              : `<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-lg backdrop-blur-md animate-pulse">
                  <i data-lucide="lock" class="w-3.5 h-3.5"></i> Pago por Mes
                </span>`
          }
        </div>

        <!-- Banner Header de la Tarjeta -->
        <div class="p-6 bg-gradient-to-br ${guia.color} relative overflow-hidden">
          <div class="absolute -right-4 -bottom-4 opacity-15 text-white">
            <i data-lucide="${guia.icon}" class="w-32 h-32"></i>
          </div>
          <span class="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-black/40 text-white backdrop-blur-sm mb-3">
            ${guia.badge}
          </span>
          <h3 class="text-2xl font-bold text-white leading-tight font-display drop-shadow-sm mb-1">
            ${guia.title}
          </h3>
          <p class="text-xs text-white/80 font-medium flex items-center gap-1.5 mt-2">
            <i data-lucide="award" class="w-3.5 h-3.5"></i> ${guia.author}
          </p>
        </div>

        <!-- Contenido de la Tarjeta -->
        <div class="p-6 flex-1 flex flex-col justify-between bg-slate-900/60">
          <div>
            <!-- Metadatos de la guía -->
            <div class="flex items-center gap-4 text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
              <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5 text-purple-400"></i> ${guia.readTime}</span>
              <span class="flex items-center gap-1"><i data-lucide="bar-chart-2" class="w-3.5 h-3.5 text-cyan-400"></i> ${guia.difficulty}</span>
              <span class="flex items-center gap-1 text-amber-400"><i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i> ${guia.rating}</span>
            </div>

            <!-- Temas / Temario Clave de la Guía (Más detallado) -->
            <div class="mb-4">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <i data-lucide="list-checks" class="w-3.5 h-3.5 text-purple-400"></i> Temario incluido:
              </span>
              <div class="flex flex-wrap gap-1.5">
                ${guia.topics
                  .map(
                    (t) =>
                      `<span class="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/90 text-purple-200 border border-slate-700/80 font-medium">${t}</span>`
                  )
                  .join("")}
              </div>
            </div>

            <!-- Previsualización extendida de la guía -->
            <div class="relative rounded-xl p-4 bg-slate-950/70 border border-slate-800 mb-5 overflow-hidden">
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-[11px] text-slate-400">
                <span class="font-semibold text-slate-300 flex items-center gap-1">
                  <i data-lucide="file-text" class="w-3.5 h-3.5 text-cyan-400"></i> Muestra del contenido
                </span>
                <span class="text-[10px] text-purple-400 font-mono">Vista preliminar</span>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line line-clamp-3">
                ${guia.excerpt}
              </p>
              ${
                !AppState.isSubscribed
                  ? `<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent flex flex-col items-center justify-end pb-2">
                      <span class="text-[11px] text-amber-300 font-bold flex items-center gap-1.5 bg-slate-900/95 px-3 py-1 rounded-full border border-amber-500/40 shadow-lg">
                        <i data-lucide="lock" class="w-3.5 h-3.5 text-amber-400"></i> Resto bloqueado • Requiere pago mensual
                      </span>
                    </div>`
                  : ""
              }
            </div>
          </div>

          <!-- Botón de Ver Guía -->
          <div>
            ${
              AppState.isSubscribed
                ? `
              <button onclick="openGuideReader('${guia.id}')" class="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 group-hover:scale-[1.01] transition-transform">
                <i data-lucide="book-open" class="w-4 h-4"></i> Ver Guía Completa
              </button>
            `
                : `
              <button onclick="handleGuideClick('${guia.id}')" class="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 group-hover:scale-[1.01] transition-transform">
                <i data-lucide="eye" class="w-4 h-4"></i> Ver Guía
              </button>
            `
            }
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Clic al intentar acceder a una guía
function handleGuideClick(guideId) {
  if (AppState.isSubscribed) {
    openGuideReader(guideId);
  } else {
    // Abre el menú de pago por mes
    AppState.currentViewingGuide = guideId;
    openPaymentModal(guideId);
  }
}

// Abrir el Menú de Pago Mensual (El Paywall de Broma pero Bonito)
function openPaymentModal(guideId = null) {
  const modal = document.getElementById("paymentModal");
  if (!modal) return;

  if (guideId) {
    const guia = GUIA_DATA.find((g) => g.id === guideId);
    if (guia) {
      document.getElementById("targetGuideNotice").innerHTML = `
        <div class="flex items-center gap-2 p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-200 text-xs mb-4">
          <i data-lucide="info" class="w-4 h-4 text-purple-400 shrink-0"></i>
          <span>Intentas acceder a: <strong class="text-white">${guia.title}</strong></span>
        </div>
      `;
    }
  } else {
    document.getElementById("targetGuideNotice").innerHTML = "";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  if (window.lucide) lucide.createIcons();
}

// Cerrar el Modal de Pago
function closePaymentModal() {
  const modal = document.getElementById("paymentModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "auto";
}

// Renderizar tarjetas de precios en la sección de planes
function renderPricingCards() {
  const container = document.getElementById("pricingContainer");
  if (!container) return;

  container.innerHTML = PLANES_PAGO.map((plan) => {
    return `
      <div class="relative glass-card rounded-3xl p-8 flex flex-col justify-between border ${
        plan.popular ? "border-purple-500 shadow-2xl shadow-purple-900/30 scale-105 z-10 bg-slate-900/90" : "border-slate-800"
      }">
        ${
          plan.popular
            ? `<div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                ${plan.badgePopular}
              </div>`
            : plan.badgePopular
            ? `<div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                ${plan.badgePopular}
              </div>`
            : ""
        }

        <div>
          <div class="mb-6">
            <h4 class="text-xl font-bold text-white mb-1 font-display">${plan.nombre}</h4>
            <p class="text-xs text-slate-400">${plan.descripcion}</p>
          </div>

          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-4xl font-extrabold text-white tracking-tight font-display">$${plan.precio}</span>
            <span class="text-sm font-semibold text-slate-400">USD ${plan.periodo}</span>
          </div>
          <div class="text-xs text-purple-300 font-medium mb-6">
            O aprox. ${plan.precioMXN} al mes
          </div>

          <ul class="space-y-3 mb-8">
            ${plan.beneficios
              .map(
                (ben) => `
              <li class="flex items-start gap-2.5 text-xs text-slate-300">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
                <span>${ben}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>

        <button onclick="selectPlanAndOpenCheckout('${plan.id}')" class="w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
      plan.popular
        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white shadow-xl shadow-purple-900/40 hover:scale-[1.02]"
        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
    }">
          ${plan.botonTexto}
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

// Seleccionar plan y abrir menú de pago
function selectPlanAndOpenCheckout(planId) {
  AppState.selectedPlan = planId;
  const radio = document.querySelector(`input[name="modalPlanRadio"][value="${planId}"]`);
  if (radio) radio.checked = true;
  updateModalPriceDisplay();
  openPaymentModal();
}

// Actualizar precio en el modal de pago según el plan seleccionado
function updateModalPriceDisplay() {
  const selectedRadio = document.querySelector('input[name="modalPlanRadio"]:checked');
  const planId = selectedRadio ? selectedRadio.value : AppState.selectedPlan;
  const plan = PLANES_PAGO.find((p) => p.id === planId) || PLANES_PAGO[1];

  const amountDisplay = document.getElementById("modalAmountDisplay");
  const payBtnText = document.getElementById("payButtonText");

  if (amountDisplay) amountDisplay.textContent = `$${plan.precio} USD ${plan.periodo}`;
  if (payBtnText) payBtnText.textContent = `Pagar $${plan.precio} USD y Desbloquear`;
}

// Simular el pago mensual (¡Totalmente de broma / simulado!)
function processSimulatedPayment(e) {
  if (e) e.preventDefault();

  const payBtn = document.getElementById("submitPayButton");
  const originalHTML = payBtn.innerHTML;

  // Estado de carga realista
  payBtn.disabled = true;
  payBtn.innerHTML = `
    <span class="inline-block animate-spin mr-2">
      <i data-lucide="loader-2" class="w-5 h-5"></i>
    </span>
    Procesando suscripción mensual segura con JuanUke Pay...
  `;
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    // Éxito simulado
    AppState.isSubscribed = true;
    closePaymentModal();
    updateSubscriptionUI();
    renderGuidesGrid();

    // Disparar confeti de celebración
    triggerCelebrationConfetti();

    // Notificación toast de éxito
    showToast("🎉 ¡Suscripción mensual activada con éxito! Acceso VIP concedido a todas las guías de JuanUke.");

    // Restaurar botón
    payBtn.disabled = false;
    payBtn.innerHTML = originalHTML;

    // Si venía de una guía específica, ábrela de inmediato
    if (AppState.currentViewingGuide) {
      setTimeout(() => {
        openGuideReader(AppState.currentViewingGuide);
        AppState.currentViewingGuide = null;
      }, 500);
    }
  }, 1400);
}

// Aplicar cupón de descuento / broma
function applyPromoCode() {
  const input = document.getElementById("promoCodeInput");
  const msg = document.getElementById("promoMessage");
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();

  if (code === "JUANUKE" || code === "PASARELEXAMEN" || code === "BROMITA" || code === "PROMO100") {
    msg.className = "text-xs text-emerald-400 font-semibold mt-1.5 flex items-center gap-1";
    msg.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i> ¡Cupón 100% de descuento aplicado! Acceso gratis activado.`;
    document.getElementById("modalAmountDisplay").textContent = "$0.00 USD (Pase Broma 100% OFF)";
    document.getElementById("payButtonText").textContent = "Activar JuanPass Gratis Ahora";
    if (window.lucide) lucide.createIcons();
  } else if (code === "") {
    msg.className = "text-xs text-slate-400 mt-1.5";
    msg.textContent = "Ingresa un código (Prueba: JUANUKE)";
  } else {
    msg.className = "text-xs text-pink-400 font-semibold mt-1.5 flex items-center gap-1";
    msg.innerHTML = `<i data-lucide="alert-circle" class="w-3.5 h-3.5"></i> Cupón no reconocido. Prueba con: JUANUKE`;
    if (window.lucide) lucide.createIcons();
  }
}

// Abrir lector de guías completas
function openGuideReader(guideId) {
  const guia = GUIA_DATA.find((g) => g.id === guideId);
  if (!guia) return;

  const readerModal = document.getElementById("readerModal");
  if (!readerModal) return;

  document.getElementById("readerGuideTitle").textContent = guia.title;
  document.getElementById("readerGuideAuthor").textContent = `Escrita con cariño por ${guia.author}`;
  document.getElementById("readerGuideBadge").textContent = guia.badge;

  // Convertir markdown básico a HTML
  const contentHTML = convertSimpleMarkdownToHTML(guia.content);
  document.getElementById("readerBodyContent").innerHTML = contentHTML;

  readerModal.classList.remove("hidden");
  readerModal.classList.add("flex");
  document.body.style.overflow = "hidden";
  if (window.lucide) lucide.createIcons();
}

// Cerrar lector de guías
function closeGuideReader() {
  const readerModal = document.getElementById("readerModal");
  if (!readerModal) return;
  readerModal.classList.add("hidden");
  readerModal.classList.remove("flex");
  document.body.style.overflow = "auto";
}

// Convertidor básico de Markdown a HTML para la lectura
function convertSimpleMarkdownToHTML(md) {
  let html = md;

  // Encabezados
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-purple-300 mt-6 mb-3">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold text-slate-200 mt-4 mb-2">$1</h4>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold text-white mt-4 mb-2 pb-2 border-b border-purple-500/30">$1</h1>');
  
  // Énfasis e itálicas
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-bold">$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em class="text-purple-300 italic">$1</em>');

  // Separadores
  html = html.replace(/^---$/gim, '<hr class="border-slate-800 my-6">');

  // Fórmulas matemáticas sencillas
  html = html.replace(/\$\$(.*?)\$\$/gim, '<div class="p-3 my-3 rounded-lg bg-purple-950/40 border border-purple-800/50 text-purple-200 font-mono text-center text-sm shadow-inner">$1</div>');

  // Listas con viñetas
  html = html.replace(/^\- (.*$)/gim, '<li class="text-slate-300 leading-relaxed mb-1.5 ml-4 list-disc">$1</li>');

  // Párrafos
  html = html
    .split("\n\n")
    .map((paragraph) => {
      if (paragraph.startsWith("<h") || paragraph.startsWith("<div") || paragraph.startsWith("<hr") || paragraph.startsWith("<li")) {
        return paragraph;
      }
      return `<p class="text-slate-300 leading-relaxed mb-3">${paragraph}</p>`;
    })
    .join("");

  return html;
}

// Actualizar barra de navegación e indicadores según suscripción
function updateSubscriptionUI() {
  const statusBadge = document.getElementById("navSubscriptionBadge");
  const navActionBtn = document.getElementById("navActionBtn");
  const bannerNotice = document.getElementById("subscriptionAlertBanner");

  if (AppState.isSubscribed) {
    if (statusBadge) {
      statusBadge.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          JuanPass VIP Activo
        </span>
      `;
    }
    if (navActionBtn) {
      navActionBtn.innerHTML = `
        <i data-lucide="sparkles" class="w-4 h-4 text-emerald-400"></i> Mi Cuenta VIP
      `;
      navActionBtn.onclick = () => {
        showToast("Tu JuanPass Mensual está 100% activo. ¡A estudiar sin límites!");
      };
    }
    if (bannerNotice) {
      bannerNotice.classList.add("hidden");
    }
  } else {
    if (statusBadge) {
      statusBadge.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
          Sin Suscripción
        </span>
      `;
    }
    if (navActionBtn) {
      navActionBtn.innerHTML = `
        <i data-lucide="crown" class="w-4 h-4 text-amber-400"></i> Suscríbete por Mes
      `;
      navActionBtn.onclick = () => openPaymentModal();
    }
  }

  if (window.lucide) lucide.createIcons();
}

// Cambiar estado a bloqueado (para que el usuario pueda volver a probar el paywall)
function toggleSubscriptionForTesting() {
  AppState.isSubscribed = !AppState.isSubscribed;
  updateSubscriptionUI();
  renderGuidesGrid();
  if (AppState.isSubscribed) {
    triggerCelebrationConfetti();
    showToast("✅ Suscripción de prueba activada");
  } else {
    showToast("🔒 Guías bloqueadas. Ahora verás el menú de pago al hacer clic.");
  }
}

// Renderizar testimonios
function renderTestimonials() {
  const container = document.getElementById("testimonialsContainer");
  if (!container) return;

  container.innerHTML = TESTIMONIOS.map((t) => {
    return `
      <div class="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-1 text-amber-400">
              ${Array(t.estrellas)
                .fill(0)
                .map(() => '<i data-lucide="star" class="w-4 h-4 fill-current"></i>')
                .join("")}
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40">
              ${t.guia}
            </span>
          </div>
          <p class="text-xs text-slate-300 italic mb-5 leading-relaxed">
            "${t.comentario}"
          </p>
        </div>
        <div class="flex items-center gap-3 pt-3 border-t border-slate-800/80">
          <!-- Avatar con inicial estilizada (Sin foto) -->
          <div class="w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
            ${t.inicial}
          </div>
          <div>
            <h5 class="text-sm font-bold text-white flex items-center gap-1.5">
              ${t.nombre}
              <span class="text-emerald-400" title="Alumna Verificada"><i data-lucide="badge-check" class="w-3.5 h-3.5"></i></span>
            </h5>
            <p class="text-[11px] text-slate-400">${t.carrera}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}


// Configurar inputs de tarjeta con formateo en tiempo real
function setupCardInputFormatting() {
  const numInput = document.getElementById("cardNumber");
  const expInput = document.getElementById("cardExpiry");
  const cvcInput = document.getElementById("cardCvc");

  if (numInput) {
    numInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").substring(0, 16);
      val = val !== "" ? val.match(/.{1,4}/g).join(" ") : "";
      e.target.value = val;
    });
  }

  if (expInput) {
    expInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").substring(0, 4);
      if (val.length >= 2) {
        val = val.substring(0, 2) + "/" + val.substring(2);
      }
      e.target.value = val;
    });
  }

  if (cvcInput) {
    cvcInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").substring(0, 4);
    });
  }
}

// Configurar listeners de categorías y búsqueda
function setupEventListeners() {
  // Filtros de categoría
  const categoryButtons = document.querySelectorAll(".category-btn");
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach((b) => {
        b.classList.remove("bg-purple-600", "text-white", "shadow-lg", "shadow-purple-900/50");
        b.classList.add("bg-slate-800/80", "text-slate-400");
      });
      btn.classList.add("bg-purple-600", "text-white", "shadow-lg", "shadow-purple-900/50");
      btn.classList.remove("bg-slate-800/80", "text-slate-400");

      AppState.activeCategory = btn.getAttribute("data-category");
      renderGuidesGrid();
    });
  });

  // Buscador
  const searchInput = document.getElementById("searchGuidesInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      renderGuidesGrid();
    });
  }

  // Radios de plan en modal
  const planRadios = document.querySelectorAll('input[name="modalPlanRadio"]');
  planRadios.forEach((r) => {
    r.addEventListener("change", (e) => {
      AppState.selectedPlan = e.target.value;
      updateModalPriceDisplay();
    });
  });

  // Métodos de pago tabs (Tarjeta, PayPal, MercadoPago)
  const tabBtns = document.querySelectorAll(".payment-tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => {
        b.classList.remove("border-purple-500", "bg-purple-950/40", "text-white");
        b.classList.add("border-slate-800", "text-slate-400");
      });
      btn.classList.add("border-purple-500", "bg-purple-950/40", "text-white");
      btn.classList.remove("border-slate-800", "text-slate-400");

      const method = btn.getAttribute("data-method");
      document.querySelectorAll(".payment-panel").forEach((p) => p.classList.add("hidden"));
      const targetPanel = document.getElementById(`panel-${method}`);
      if (targetPanel) targetPanel.classList.remove("hidden");
    });
  });
}

// Confetti de celebración
function triggerCelebrationConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"],
    });
  }
}

// Toast de notificación simple y elegante
function showToast(message) {
  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl bg-slate-900/95 border border-purple-500/50 text-white text-sm font-semibold shadow-2xl shadow-purple-950 flex items-center gap-3 backdrop-blur-md animate-fade-in transition-all duration-300";
  toast.innerHTML = `
    <span class="p-1 rounded-full bg-purple-500/20 text-purple-300">
      <i data-lucide="check" class="w-4 h-4"></i>
    </span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
