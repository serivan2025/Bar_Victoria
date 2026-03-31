/* =========================================
   INÍCIO: Configuração global
========================================= */
const order = [];
const whatsappNumber = "258845355993";
let parallaxTicking = false;
/* =========================================
   FIM: Configuração global
========================================= */


/* =========================================
   INÍCIO: Seletores principais
========================================= */
const body = document.body;

const siteLoader = document.getElementById("siteLoader");

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

const menuGrid = document.getElementById("menuGrid");
const eventsGrid = document.getElementById("eventsGrid");
const galleryGrid = document.getElementById("galleryGrid");

const orderItemsContainer = document.getElementById("orderItems");
const orderTotalElement = document.getElementById("orderTotal");
const orderCountBadge = document.getElementById("orderCountBadge");
const clearOrderBtn = document.getElementById("clearOrderBtn");

const orderForm = document.getElementById("orderForm");
const reservationForm = document.getElementById("reservationForm");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
/* =========================================
   FIM: Seletores principais
========================================= */


/* =========================================
   INÍCIO: Função para formatar preço
========================================= */
function formatPrice(value) {
  const numberValue = Number(value) || 0;
  return `${numberValue.toFixed(0)} MT`;
}
/* =========================================
   FIM: Função para formatar preço
========================================= */


/* =========================================
   INÍCIO: Função para escapar texto HTML
========================================= */
function escapeHtml(text) {
  if (text === null || text === undefined) return "";

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
/* =========================================
   FIM: Função para escapar texto HTML
========================================= */


/* =========================================
   INÍCIO: Loader
========================================= */
function hideLoader() {
  if (!siteLoader) return;

  setTimeout(() => {
    siteLoader.classList.add("hidden");
  }, 700);
}
/* =========================================
   FIM: Loader
========================================= */


/* =========================================
   INÍCIO: Menu mobile
========================================= */
function toggleMobileMenu() {
  if (!mobileMenu) return;

  mobileMenu.classList.toggle("active");
  body.classList.toggle("menu-open", mobileMenu.classList.contains("active"));
}

function closeMobileMenu() {
  if (!mobileMenu) return;

  mobileMenu.classList.remove("active");
  body.classList.remove("menu-open");
}

function closeMobileMenuOnLinkClick() {
  if (!mobileMenu) return;

  const mobileLinks = mobileMenu.querySelectorAll("a");

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });
}

function closeMenuWhenClickOutside(event) {
  if (!mobileMenu || !menuToggle) return;

  const clickedInsideMenu = mobileMenu.contains(event.target);
  const clickedToggle = menuToggle.contains(event.target);

  if (!clickedInsideMenu && !clickedToggle) {
    closeMobileMenu();
  }
}
/* =========================================
   FIM: Menu mobile
========================================= */


/* =========================================
   INÍCIO: Funções do pedido
========================================= */
function addItemToOrder(name, price) {
  const existingItem = order.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    order.push({
      name,
      price: Number(price),
      quantity: 1,
    });
  }

  renderOrder();
}

function increaseItemQuantity(name) {
  const item = order.find((orderItem) => orderItem.name === name);

  if (!item) return;

  item.quantity += 1;
  renderOrder();
}

function decreaseItemQuantity(name) {
  const item = order.find((orderItem) => orderItem.name === name);

  if (!item) return;

  item.quantity -= 1;

  if (item.quantity <= 0) {
    removeItemFromOrder(name);
    return;
  }

  renderOrder();
}

function removeItemFromOrder(name) {
  const itemIndex = order.findIndex((item) => item.name === name);

  if (itemIndex === -1) return;

  order.splice(itemIndex, 1);
  renderOrder();
}

function clearOrder() {
  order.length = 0;
  renderOrder();
}

function calculateOrderTotal() {
  return order.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

function calculateOrderItemCount() {
  return order.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}

function updateOrderBadge() {
  if (!orderCountBadge) return;

  const count = calculateOrderItemCount();
  orderCountBadge.textContent = `${count} ${count === 1 ? "item" : "itens"}`;
}

function bindOrderActionButtons() {
  if (!orderItemsContainer) return;

  const actionButtons = orderItemsContainer.querySelectorAll("[data-action]");

  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      const name = button.dataset.name;

      if (action === "increase") {
        increaseItemQuantity(name);
      }

      if (action === "decrease") {
        decreaseItemQuantity(name);
      }

      if (action === "remove") {
        removeItemFromOrder(name);
      }
    });
  });
}

function renderOrder() {
  if (!orderItemsContainer || !orderTotalElement) return;

  orderItemsContainer.innerHTML = "";

  if (order.length === 0) {
    orderItemsContainer.innerHTML =
      '<p class="empty-order">Nenhum item adicionado ainda.</p>';
    orderTotalElement.textContent = "0 MT";
    updateOrderBadge();
    return;
  }

  order.forEach((item) => {
    const orderItemElement = document.createElement("div");
    orderItemElement.className = "order-item";

    orderItemElement.innerHTML = `
      <div class="order-item-top">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <p>Preço unitário: ${formatPrice(item.price)}</p>
        </div>
        <div>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
        </div>
      </div>

      <div class="order-item-controls">
        <button class="qty-btn" type="button" data-action="decrease" data-name="${escapeHtml(item.name)}">−</button>
        <span class="order-qty-label">${item.quantity}x</span>
        <button class="qty-btn" type="button" data-action="increase" data-name="${escapeHtml(item.name)}">+</button>
        <button class="remove-btn" type="button" data-action="remove" data-name="${escapeHtml(item.name)}">Remover</button>
      </div>
    `;

    orderItemsContainer.appendChild(orderItemElement);
  });

  orderTotalElement.textContent = formatPrice(calculateOrderTotal());
  updateOrderBadge();
  bindOrderActionButtons();
}
/* =========================================
   FIM: Funções do pedido
========================================= */


/* =========================================
   INÍCIO: Funções do WhatsApp
========================================= */
function generateOrderMessage() {
  const customerName = document.getElementById("customerName")?.value.trim();
  const customerPhone = document.getElementById("customerPhone")?.value.trim();
  const customerLocation = document.getElementById("customerLocation")?.value.trim();
  const customerNotes = document.getElementById("customerNotes")?.value.trim();

  if (!customerName || !customerPhone) {
    alert("Preencha nome e telefone.");
    return null;
  }

  if (order.length === 0) {
    alert("Adicione pelo menos 1 item ao pedido.");
    return null;
  }

  let itemsText = "";

  order.forEach((item, index) => {
    itemsText += `${index + 1}. ${item.name} - ${item.quantity}x - ${formatPrice(item.price * item.quantity)}\n`;
  });

  const message =
`Olá, quero fazer este pedido no Bar Da Victoria:

${itemsText}
Total estimado: ${formatPrice(calculateOrderTotal())}

Nome: ${customerName}
Telefone: ${customerPhone}
Mesa ou local: ${customerLocation || "Não informado"}
Observação: ${customerNotes || "Nenhuma"}`;

  return message;
}

function sendOrderToWhatsApp(event) {
  event.preventDefault();

  const message = generateOrderMessage();

  if (!message) return;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

function generateReservationMessage() {
  const reserveName = document.getElementById("reserveName")?.value.trim();
  const reservePhone = document.getElementById("reservePhone")?.value.trim();
  const reserveDate = document.getElementById("reserveDate")?.value;
  const reserveTime = document.getElementById("reserveTime")?.value;
  const reservePeople = document.getElementById("reservePeople")?.value;
  const reserveNotes = document.getElementById("reserveNotes")?.value.trim();

  if (!reserveName || !reservePhone || !reserveDate || !reserveTime || !reservePeople) {
    alert("Preencha todos os campos obrigatórios da reserva.");
    return null;
  }

  return `Olá, quero fazer uma reserva no Bar Da Victoria.

Nome: ${reserveName}
Telefone: ${reservePhone}
Data: ${reserveDate}
Hora: ${reserveTime}
Pessoas: ${reservePeople}
Observação: ${reserveNotes || "Nenhuma"}`;
}

function sendReservationToWhatsApp(event) {
  event.preventDefault();

  const message = generateReservationMessage();

  if (!message) return;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}
/* =========================================
   FIM: Funções do WhatsApp
========================================= */


/* =========================================
   INÍCIO: Função para mostrar erro em grid
========================================= */
function renderGridError(container, message) {
  if (!container) return;
  container.innerHTML = `<p class="empty-order">${escapeHtml(message)}</p>`;
}
/* =========================================
   FIM: Função para mostrar erro em grid
========================================= */


/* =========================================
   INÍCIO: Função para validar Supabase
========================================= */
function validateSupabaseClient() {
  if (typeof supabaseClient === "undefined") {
    console.error("supabaseClient não foi encontrado. Verifica o ficheiro supabase.js");
    return false;
  }

  return true;
}
/* =========================================
   FIM: Função para validar Supabase
========================================= */


/* =========================================
   INÍCIO: Carregar menu do Supabase
========================================= */
async function loadMenuItems() {
  if (!menuGrid) return;
  if (!validateSupabaseClient()) {
    renderGridError(menuGrid, "Supabase não configurado.");
    return;
  }

  menuGrid.innerHTML = '<p class="empty-order">Carregando menu...</p>';

  const { data, error } = await supabaseClient
    .from("menu_items")
    .select("*")
    .eq("available", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao carregar menu:", error);
    renderGridError(menuGrid, "Erro ao carregar menu.");
    return;
  }

  if (!data || data.length === 0) {
    renderGridError(menuGrid, "Nenhum item disponível no menu.");
    return;
  }

  menuGrid.innerHTML = data
    .map((item) => {
      const name = escapeHtml(item.name);
      const description = escapeHtml(item.description || "");
      const badge = item.badge ? `<span class="menu-badge">${escapeHtml(item.badge)}</span>` : "";
      const imageUrl = escapeHtml(item.image_url || "");

      return `
        <article class="menu-card glass-card">
          <div class="menu-card-image">
            <img src="${imageUrl}" alt="${name}">
            ${badge}
          </div>

          <div class="menu-card-body">
            <div class="menu-card-top">
              <h3>${name}</h3>
              <span>${formatPrice(item.price)}</span>
            </div>

            <p>${description}</p>

            <button
              class="btn btn-small btn-outline add-to-order"
              data-name="${name}"
              data-price="${Number(item.price) || 0}"
            >
              Adicionar ao pedido
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  bindDynamicAddToOrderButtons();
}
/* =========================================
   FIM: Carregar menu do Supabase
========================================= */


/* =========================================
   INÍCIO: Carregar eventos do Supabase
========================================= */
async function loadEvents() {
  if (!eventsGrid) return;
  if (!validateSupabaseClient()) {
    renderGridError(eventsGrid, "Supabase não configurado.");
    return;
  }

  eventsGrid.innerHTML = '<p class="empty-order">Carregando eventos...</p>';

  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao carregar eventos:", error);
    renderGridError(eventsGrid, "Erro ao carregar eventos.");
    return;
  }

  if (!data || data.length === 0) {
    renderGridError(eventsGrid, "Nenhum evento disponível.");
    return;
  }

  eventsGrid.innerHTML = data
    .map((eventItem) => {
      const title = escapeHtml(eventItem.title);
      const description = escapeHtml(eventItem.description || "");
      const dateLabel = escapeHtml(eventItem.event_date_label || "");
      const imageUrl = escapeHtml(eventItem.image_url || "");
      const whatsappText =
        eventItem.whatsapp_text || `Olá, quero reservar para ${eventItem.title} no Bar Da Victoria.`;

      return `
        <article class="event-card glass-card">
          <div class="event-image-wrap">
            <img src="${imageUrl}" alt="${title}">
          </div>

          <div class="event-card-body">
            <span class="event-date">${dateLabel}</span>
            <h3>${title}</h3>
            <p>${description}</p>

            <a
              href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}"
              target="_blank"
              class="btn btn-small btn-outline"
            >
              Reservar
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}
/* =========================================
   FIM: Carregar eventos do Supabase
========================================= */


/* =========================================
   INÍCIO: Carregar galeria do Supabase
========================================= */
async function loadGallery() {
  if (!galleryGrid) return;
  if (!validateSupabaseClient()) {
    renderGridError(galleryGrid, "Supabase não configurado.");
    return;
  }

  galleryGrid.innerHTML = '<p class="empty-order">Carregando galeria...</p>';

  const { data, error } = await supabaseClient
    .from("gallery")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao carregar galeria:", error);
    renderGridError(galleryGrid, "Erro ao carregar galeria.");
    return;
  }

  if (!data || data.length === 0) {
    renderGridError(galleryGrid, "Nenhuma imagem disponível.");
    return;
  }

  galleryGrid.innerHTML = data
    .map((imageItem) => {
      const title = escapeHtml(imageItem.title || "Imagem da galeria");
      const description = escapeHtml(imageItem.description || "");
      const imageUrl = escapeHtml(imageItem.image_url);

      return `
        <article class="gallery-item glass-card">
          <div class="gallery-image-box">
            <img
              class="gallery-image"
              src="${imageUrl}"
              alt="${title}"
            />
          </div>

          <div class="gallery-item-body">
            <h3>${title}</h3>
            <p>${description}</p>
          </div>
        </article>
      `;
    })
    .join("");

  initLightbox();
}
/* =========================================
   FIM: Carregar galeria do Supabase
========================================= */


/* =========================================
   INÍCIO: Bind dos botões do menu dinâmico
========================================= */
function bindDynamicAddToOrderButtons() {
  const dynamicButtons = document.querySelectorAll(".add-to-order");

  dynamicButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.name;
      const price = button.dataset.price;

      addItemToOrder(name, price);

      button.textContent = "Adicionado ✓";
      button.disabled = true;

      setTimeout(() => {
        button.textContent = "Adicionar ao pedido";
        button.disabled = false;
      }, 900);
    });
  });
}
/* =========================================
   FIM: Bind dos botões do menu dinâmico
========================================= */


/* =========================================
   INÍCIO: Lightbox
========================================= */
function initLightbox() {
  const galleryImages = document.querySelectorAll(".gallery-image");

  if (!galleryImages.length || !lightbox || !lightboxImage || !lightboxClose) return;

  galleryImages.forEach((image) => {
    image.onclick = () => {
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightbox.classList.add("active");
      body.classList.add("lightbox-open");
    };
  });

  lightboxClose.onclick = closeLightbox;

  lightbox.onclick = (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  };
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove("active");
  body.classList.remove("lightbox-open");
}
/* =========================================
   FIM: Lightbox
========================================= */


/* =========================================
   INÍCIO: Reveal animation
========================================= */
function initRevealAnimation() {
  const revealElements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.14 }
  );

  revealElements.forEach((element) => observer.observe(element));
}
/* =========================================
   FIM: Reveal animation
========================================= */


/* =========================================
   INÍCIO: Parallax
========================================= */
function applyParallax() {
  const parallaxElements = document.querySelectorAll("[data-parallax]");

  if (!parallaxElements.length) return;

  const isMobile = window.innerWidth <= 860;

  parallaxElements.forEach((element) => {
    if (isMobile) {
      element.style.setProperty("--parallax-y", "0px");
      return;
    }

    const rect = element.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;
    const distanceFromCenter = elementCenter - viewportCenter;

    const speed = Number(element.dataset.parallax) || 0.08;
    const offset = distanceFromCenter * speed * -0.18;

    element.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
  });
}

function initParallaxEffect() {
  applyParallax();

  window.addEventListener("scroll", () => {
    if (parallaxTicking) return;

    parallaxTicking = true;

    window.requestAnimationFrame(() => {
      applyParallax();
      parallaxTicking = false;
    });
  });

  window.addEventListener("resize", applyParallax);
}
/* =========================================
   FIM: Parallax
========================================= */


/* =========================================
   INÍCIO: Outros binds
========================================= */
function bindEscapeKey() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
      closeMobileMenu();
    }
  });
}

function bindClearOrderButton() {
  if (!clearOrderBtn) return;

  clearOrderBtn.addEventListener("click", () => {
    clearOrder();
  });
}
/* =========================================
   FIM: Outros binds
========================================= */


/* =========================================
   INÍCIO: Inicialização geral
========================================= */
async function initApp() {
  hideLoader();

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMobileMenu);
  }

  document.addEventListener("click", closeMenuWhenClickOutside);

  closeMobileMenuOnLinkClick();
  bindClearOrderButton();

  if (orderForm) {
    orderForm.addEventListener("submit", sendOrderToWhatsApp);
  }

  if (reservationForm) {
    reservationForm.addEventListener("submit", sendReservationToWhatsApp);
  }

  initRevealAnimation();
  initParallaxEffect();
  bindEscapeKey();
  renderOrder();

  await Promise.all([
    loadMenuItems(),
    loadEvents(),
    loadGallery()
  ]);
}

document.addEventListener("DOMContentLoaded", initApp);
/* =========================================
   FIM: Inicialização geral
========================================= */