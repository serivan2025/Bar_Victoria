/* =========================================
   INÍCIO: Seletores principais
========================================= */
const authScreen = document.getElementById("authScreen");
const dashboard = document.getElementById("dashboard");
const authMessage = document.getElementById("authMessage");
const loggedUser = document.getElementById("loggedUser");
const globalMessage = document.getElementById("globalMessage");

const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

const menuForm = document.getElementById("menuForm");
const menuFormTitle = document.getElementById("menuFormTitle");
const menuCancelBtn = document.getElementById("menuCancelBtn");
const menuList = document.getElementById("menuList");

const eventForm = document.getElementById("eventForm");
const eventFormTitle = document.getElementById("eventFormTitle");
const eventCancelBtn = document.getElementById("eventCancelBtn");
const eventsList = document.getElementById("eventsList");

const galleryForm = document.getElementById("galleryForm");
const galleryFormTitle = document.getElementById("galleryFormTitle");
const galleryCancelBtn = document.getElementById("galleryCancelBtn");
const galleryList = document.getElementById("galleryList");
/* =========================================
   FIM: Seletores principais
========================================= */


/* =========================================
   INÍCIO: Configuração storage
========================================= */
const STORAGE_BUCKET = "bar-images";
/* =========================================
   FIM: Configuração storage
========================================= */


/* =========================================
   INÍCIO: Utilitários
========================================= */
function showToast(message) {
  if (!globalMessage) return;

  globalMessage.textContent = message;
  globalMessage.classList.add("show");

  setTimeout(() => {
    globalMessage.classList.remove("show");
  }, 2600);
}

function escapeHtml(text) {
  if (text === null || text === undefined) return "";

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value) {
  const numberValue = Number(value) || 0;
  return `${numberValue.toFixed(0)} MT`;
}

function setAuthMessage(message) {
  if (!authMessage) return;
  authMessage.textContent = message;
}

function getFileExtension(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
}

function filePathFromPublicUrl(publicUrl) {
  if (!publicUrl) return null;

  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  return publicUrl.substring(index + marker.length);
}

function setButtonLoading(button, loadingText, isLoading) {
  if (!button) return;

  if (isLoading) {
    button.dataset.originalText = button.dataset.originalText || button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
    return;
  }

  button.textContent = button.dataset.originalText || button.textContent;
  button.disabled = false;
}

function setFieldStatus(elementId, message, isError = false) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = message;
  element.classList.toggle("error", isError);
}

function updateImagePreview(previewId, imageUrl) {
  const preview = document.getElementById(previewId);
  if (!preview) return;

  if (imageUrl) {
    preview.src = imageUrl;
    preview.classList.remove("hidden");
  } else {
    preview.removeAttribute("src");
    preview.classList.add("hidden");
  }
}

function bindFilePreview(inputId, previewId, statusId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener("change", () => {
    const file = input.files?.[0];

    if (!file) {
      setFieldStatus(statusId, "Nenhuma imagem selecionada.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFieldStatus(statusId, "Seleciona apenas ficheiros de imagem.", true);
      input.value = "";
      updateImagePreview(previewId, "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateImagePreview(previewId, reader.result);
      setFieldStatus(statusId, `Imagem pronta: ${file.name}`);
    };
    reader.readAsDataURL(file);
  });
}

function validateTextField(value, label, minLength = 2, maxLength = 180) {
  const cleanValue = String(value || "").trim();

  if (cleanValue.length < minLength) {
    throw new Error(`${label} precisa ter pelo menos ${minLength} caracteres.`);
  }

  if (cleanValue.length > maxLength) {
    throw new Error(`${label} não pode passar de ${maxLength} caracteres.`);
  }

  return cleanValue;
}

function validateOptionalTextField(value, label, maxLength = 500) {
  const cleanValue = String(value || "").trim();

  if (cleanValue.length > maxLength) {
    throw new Error(`${label} não pode passar de ${maxLength} caracteres.`);
  }

  return cleanValue;
}

function validatePriceField(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new Error("Preço inválido.");
  }

  return numberValue;
}

function validateImageRequirement(imageUrl) {
  if (!imageUrl) {
    throw new Error("Seleciona ou mantém uma imagem antes de salvar.");
  }

  return imageUrl;
}

/* =========================================
   FIM: Utilitários
========================================= */


/* =========================================
   INÍCIO: Upload de imagem
========================================= */
async function uploadImage(file, folderName) {
  if (!file) return null;

  const ext = getFileExtension(file.name);
  const fileName = `${folderName}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabaseClient.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabaseClient.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}
/* =========================================
   FIM: Upload de imagem
========================================= */


/* =========================================
   INÍCIO: Apagar imagem do storage
========================================= */
async function deleteImageByPublicUrl(publicUrl) {
  const filePath = filePathFromPublicUrl(publicUrl);
  if (!filePath) return;

  const { error } = await supabaseClient.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error("Erro ao apagar imagem do storage:", error);
  }
}
/* =========================================
   FIM: Apagar imagem do storage
========================================= */


/* =========================================
   INÍCIO: Verificar sessão
========================================= */
async function checkSession() {
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error(error);
    return;
  }

  if (session?.user) {
    showDashboard(session.user);
    await loadAllData();
  } else {
    showLogin();
  }
}
/* =========================================
   FIM: Verificar sessão
========================================= */


/* =========================================
   INÍCIO: Mostrar login/dashboard
========================================= */
function showLogin() {
  authScreen.classList.remove("hidden");
  dashboard.classList.add("hidden");
}

function showDashboard(user) {
  authScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");

  if (loggedUser) {
    loggedUser.textContent = user.email || "Admin";
  }
}
/* =========================================
   FIM: Mostrar login/dashboard
========================================= */


/* =========================================
   INÍCIO: Login / Logout
========================================= */
async function handleLogin(event) {
  event.preventDefault();
  setAuthMessage("Entrando...");

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error);
    setAuthMessage("Erro ao entrar. Verifica email e senha.");
    return;
  }

  setAuthMessage("");
  showDashboard(data.user);
  await loadAllData();
  showToast("Login feito com sucesso.");
}

async function handleLogout() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
    showToast("Erro ao sair.");
    return;
  }

  showLogin();
  showToast("Sessão terminada.");
}
/* =========================================
   FIM: Login / Logout
========================================= */


/* =========================================
   INÍCIO: Tabs
========================================= */
function switchTab(tabId) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

function bindTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button.dataset.tab);
    });
  });
}
/* =========================================
   FIM: Tabs
========================================= */


/* =========================================
   INÍCIO: Reset forms
========================================= */
function resetMenuForm() {
  menuForm.reset();
  document.getElementById("menuId").value = "";
  document.getElementById("menuImageUrl").value = "";
  document.getElementById("menuAvailable").checked = true;
  document.getElementById("menuSortOrder").value = 0;
  menuFormTitle.textContent = "Novo item do menu";
  updateImagePreview("menuImagePreview", "");
  setFieldStatus("menuImageStatus", "Nenhuma imagem selecionada.");
}

function resetEventForm() {
  eventForm.reset();
  document.getElementById("eventId").value = "";
  document.getElementById("eventImageUrl").value = "";
  document.getElementById("eventActive").checked = true;
  document.getElementById("eventSortOrder").value = 0;
  eventFormTitle.textContent = "Novo evento";
  updateImagePreview("eventImagePreview", "");
  setFieldStatus("eventImageStatus", "Nenhuma imagem selecionada.");
}

function resetGalleryForm() {
  galleryForm.reset();
  document.getElementById("galleryId").value = "";
  document.getElementById("galleryImageUrl").value = "";
  document.getElementById("gallerySortOrder").value = 0;
  galleryFormTitle.textContent = "Nova imagem";
  updateImagePreview("galleryImagePreview", "");
  setFieldStatus("galleryImageStatus", "Nenhuma imagem selecionada.");
}
/* =========================================
   FIM: Reset forms
========================================= */


/* =========================================
   INÍCIO: Carregar menu
========================================= */
async function loadMenuItemsAdmin() {
  const { data, error } = await supabaseClient
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    menuList.innerHTML = `<p>Erro ao carregar menu.</p>`;
    return;
  }

  if (!data || data.length === 0) {
    menuList.innerHTML = `<p>Nenhum item cadastrado.</p>`;
    return;
  }

  menuList.innerHTML = data.map((item) => `
    <div class="admin-item">
      <div class="admin-item-top">
        <div>
          <h5>${escapeHtml(item.name)}</h5>
          <p>${escapeHtml(item.description || "")}</p>
          <div class="admin-item-meta">
            ${formatPrice(item.price)} • ${item.available ? "Disponível" : "Indisponível"} • Ordem ${item.sort_order}
          </div>
        </div>
      </div>

      <div class="admin-item-actions">
        <button class="btn btn-outline menu-edit-btn" data-id="${item.id}">Editar</button>
        <button class="btn btn-outline menu-delete-btn" data-id="${item.id}">Apagar</button>
      </div>
    </div>
  `).join("");

  bindMenuActionButtons(data);
}
/* =========================================
   FIM: Carregar menu
========================================= */


/* =========================================
   INÍCIO: Carregar eventos
========================================= */
async function loadEventsAdmin() {
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    eventsList.innerHTML = `<p>Erro ao carregar eventos.</p>`;
    return;
  }

  if (!data || data.length === 0) {
    eventsList.innerHTML = `<p>Nenhum evento cadastrado.</p>`;
    return;
  }

  eventsList.innerHTML = data.map((item) => `
    <div class="admin-item">
      <div class="admin-item-top">
        <div>
          <h5>${escapeHtml(item.title)}</h5>
          <p>${escapeHtml(item.description || "")}</p>
          <div class="admin-item-meta">
            ${escapeHtml(item.event_date_label || "")} • ${item.active ? "Ativo" : "Inativo"} • Ordem ${item.sort_order}
          </div>
        </div>
      </div>

      <div class="admin-item-actions">
        <button class="btn btn-outline event-edit-btn" data-id="${item.id}">Editar</button>
        <button class="btn btn-outline event-delete-btn" data-id="${item.id}">Apagar</button>
      </div>
    </div>
  `).join("");

  bindEventActionButtons(data);
}
/* =========================================
   FIM: Carregar eventos
========================================= */


/* =========================================
   INÍCIO: Carregar galeria
========================================= */
async function loadGalleryAdmin() {
  const { data, error } = await supabaseClient
    .from("gallery")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    galleryList.innerHTML = `<p>Erro ao carregar galeria.</p>`;
    return;
  }

  if (!data || data.length === 0) {
    galleryList.innerHTML = `<p>Nenhuma imagem cadastrada.</p>`;
    return;
  }

  galleryList.innerHTML = data.map((item) => `
    <div class="admin-item">
      <div class="admin-item-top">
        <div class="admin-item-content">
          <img class="admin-thumb" src="${escapeHtml(item.image_url || "")}" alt="${escapeHtml(item.title || "Imagem")}" />
          <div>
            <h5>${escapeHtml(item.title || "Sem título")}</h5>
            <p>${escapeHtml(item.description || "Sem descrição.")}</p>
            <div class="admin-item-meta">
              Ordem ${item.sort_order}
            </div>
          </div>
        </div>
      </div>

      <div class="admin-item-actions">
        <button class="btn btn-outline gallery-edit-btn" data-id="${item.id}">Editar</button>
        <button class="btn btn-outline gallery-delete-btn" data-id="${item.id}">Apagar</button>
      </div>
    </div>
  `).join("");

  bindGalleryActionButtons(data);
}
/* =========================================
   FIM: Carregar galeria
========================================= */


/* =========================================
   INÍCIO: Carregar tudo
========================================= */
async function loadAllData() {
  await Promise.all([
    loadMenuItemsAdmin(),
    loadEventsAdmin(),
    loadGalleryAdmin()
  ]);
}
/* =========================================
   FIM: Carregar tudo
========================================= */


/* =========================================
   INÍCIO: Bind ações menu
========================================= */
function bindMenuActionButtons(items) {
  document.querySelectorAll(".menu-edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const item = items.find((row) => String(row.id) === String(button.dataset.id));
      if (!item) return;

      document.getElementById("menuId").value = item.id;
      document.getElementById("menuName").value = item.name || "";
      document.getElementById("menuDescription").value = item.description || "";
      document.getElementById("menuPrice").value = item.price || 0;
      document.getElementById("menuImageUrl").value = item.image_url || "";
      document.getElementById("menuBadge").value = item.badge || "";
      document.getElementById("menuSortOrder").value = item.sort_order || 0;
      document.getElementById("menuAvailable").checked = !!item.available;
      menuFormTitle.textContent = "Editar item do menu";
      updateImagePreview("menuImagePreview", item.image_url || "");
      setFieldStatus("menuImageStatus", item.image_url ? "Imagem atual carregada." : "Nenhuma imagem selecionada.");
      switchTab("menuTab");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".menu-delete-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = items.find((row) => String(row.id) === String(button.dataset.id));
      const confirmed = confirm("Tens certeza que queres apagar este item do menu?");
      if (!confirmed) return;

      const { error } = await supabaseClient
        .from("menu_items")
        .delete()
        .eq("id", button.dataset.id);

      if (error) {
        console.error(error);
        showToast("Erro ao apagar item do menu.");
        return;
      }

      if (item?.image_url) {
        await deleteImageByPublicUrl(item.image_url);
      }

      showToast("Item do menu apagado.");
      await loadAllData();
      resetMenuForm();
    });
  });
}
/* =========================================
   FIM: Bind ações menu
========================================= */


/* =========================================
   INÍCIO: Bind ações eventos
========================================= */
function bindEventActionButtons(items) {
  document.querySelectorAll(".event-edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const item = items.find((row) => String(row.id) === String(button.dataset.id));
      if (!item) return;

      document.getElementById("eventId").value = item.id;
      document.getElementById("eventTitle").value = item.title || "";
      document.getElementById("eventDescription").value = item.description || "";
      document.getElementById("eventDateLabel").value = item.event_date_label || "";
      document.getElementById("eventImageUrl").value = item.image_url || "";
      document.getElementById("eventWhatsappText").value = item.whatsapp_text || "";
      document.getElementById("eventSortOrder").value = item.sort_order || 0;
      document.getElementById("eventActive").checked = !!item.active;
      eventFormTitle.textContent = "Editar evento";
      updateImagePreview("eventImagePreview", item.image_url || "");
      setFieldStatus("eventImageStatus", item.image_url ? "Imagem atual carregada." : "Nenhuma imagem selecionada.");
      switchTab("eventsTab");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".event-delete-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = items.find((row) => String(row.id) === String(button.dataset.id));
      const confirmed = confirm("Tens certeza que queres apagar este evento?");
      if (!confirmed) return;

      const { error } = await supabaseClient
        .from("events")
        .delete()
        .eq("id", button.dataset.id);

      if (error) {
        console.error(error);
        showToast("Erro ao apagar evento.");
        return;
      }

      if (item?.image_url) {
        await deleteImageByPublicUrl(item.image_url);
      }

      showToast("Evento apagado.");
      await loadAllData();
      resetEventForm();
    });
  });
}
/* =========================================
   FIM: Bind ações eventos
========================================= */


/* =========================================
   INÍCIO: Bind ações galeria
========================================= */
function bindGalleryActionButtons(items) {
  document.querySelectorAll(".gallery-edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const item = items.find((row) => String(row.id) === String(button.dataset.id));
      if (!item) return;

      document.getElementById("galleryId").value = item.id;
      document.getElementById("galleryTitle").value = item.title || "";
      document.getElementById("galleryDescription").value = item.description || "";
      document.getElementById("galleryImageUrl").value = item.image_url || "";
      document.getElementById("gallerySortOrder").value = item.sort_order || 0;
      galleryFormTitle.textContent = "Editar imagem";
      updateImagePreview("galleryImagePreview", item.image_url || "");
      setFieldStatus("galleryImageStatus", item.image_url ? "Imagem atual carregada." : "Nenhuma imagem selecionada.");
      switchTab("galleryTab");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".gallery-delete-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = items.find((row) => String(row.id) === String(button.dataset.id));
      const confirmed = confirm("Tens certeza que queres apagar esta imagem?");
      if (!confirmed) return;

      const { error } = await supabaseClient
        .from("gallery")
        .delete()
        .eq("id", button.dataset.id);

      if (error) {
        console.error(error);
        showToast("Erro ao apagar imagem.");
        return;
      }

      if (item?.image_url) {
        await deleteImageByPublicUrl(item.image_url);
      }

      showToast("Imagem apagada.");
      await loadAllData();
      resetGalleryForm();
    });
  });
}
/* =========================================
   FIM: Bind ações galeria
========================================= */


/* =========================================
   INÍCIO: Salvar menu
========================================= */
async function handleMenuSubmit(event) {
  event.preventDefault();

  const submitButton = menuForm.querySelector('button[type="submit"]');
  const id = document.getElementById("menuId").value;
  const currentImageUrl = document.getElementById("menuImageUrl").value.trim();
  const imageFile = document.getElementById("menuImageFile").files[0];

  let finalImageUrl = currentImageUrl;

  try {
    setButtonLoading(submitButton, "Salvando...", true);

    if (imageFile) {
      setFieldStatus("menuImageStatus", "A enviar imagem...");
      finalImageUrl = await uploadImage(imageFile, "menu");

      if (id && currentImageUrl && currentImageUrl !== finalImageUrl) {
        await deleteImageByPublicUrl(currentImageUrl);
      }

      document.getElementById("menuImageUrl").value = finalImageUrl;
      setFieldStatus("menuImageStatus", "Imagem enviada com sucesso.");
    }

    const payload = {
      name: validateTextField(document.getElementById("menuName").value, "Nome", 2, 100),
      description: validateOptionalTextField(document.getElementById("menuDescription").value, "Descrição", 400),
      price: validatePriceField(document.getElementById("menuPrice").value),
      image_url: validateImageRequirement(finalImageUrl),
      badge: validateOptionalTextField(document.getElementById("menuBadge").value, "Badge", 40),
      sort_order: Number(document.getElementById("menuSortOrder").value || 0),
      available: document.getElementById("menuAvailable").checked,
    };

    let error = null;

    if (id) {
      ({ error } = await supabaseClient.from("menu_items").update(payload).eq("id", id));
    } else {
      ({ error } = await supabaseClient.from("menu_items").insert(payload));
    }

    if (error) throw error;

    showToast(id ? "Item do menu atualizado." : "Item do menu criado.");
    resetMenuForm();
    await loadAllData();
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao salvar item do menu.");
    setFieldStatus("menuImageStatus", error.message || "Erro ao processar imagem.", true);
  } finally {
    setButtonLoading(submitButton, "Salvando...", false);
  }
}
/* =========================================
   FIM: Salvar menu
========================================= */


/* =========================================
   INÍCIO: Salvar evento
========================================= */
async function handleEventSubmit(event) {
  event.preventDefault();

  const submitButton = eventForm.querySelector('button[type="submit"]');
  const id = document.getElementById("eventId").value;
  const currentImageUrl = document.getElementById("eventImageUrl").value.trim();
  const imageFile = document.getElementById("eventImageFile").files[0];

  let finalImageUrl = currentImageUrl;

  try {
    setButtonLoading(submitButton, "Salvando...", true);

    if (imageFile) {
      setFieldStatus("eventImageStatus", "A enviar imagem...");
      finalImageUrl = await uploadImage(imageFile, "events");

      if (id && currentImageUrl && currentImageUrl !== finalImageUrl) {
        await deleteImageByPublicUrl(currentImageUrl);
      }

      document.getElementById("eventImageUrl").value = finalImageUrl;
      setFieldStatus("eventImageStatus", "Imagem enviada com sucesso.");
    }

    const payload = {
      title: validateTextField(document.getElementById("eventTitle").value, "Título", 2, 120),
      description: validateOptionalTextField(document.getElementById("eventDescription").value, "Descrição", 500),
      event_date_label: validateOptionalTextField(document.getElementById("eventDateLabel").value, "Texto da data", 80),
      image_url: validateImageRequirement(finalImageUrl),
      whatsapp_text: validateOptionalTextField(document.getElementById("eventWhatsappText").value, "Texto do WhatsApp", 500),
      sort_order: Number(document.getElementById("eventSortOrder").value || 0),
      active: document.getElementById("eventActive").checked,
    };

    let error = null;

    if (id) {
      ({ error } = await supabaseClient.from("events").update(payload).eq("id", id));
    } else {
      ({ error } = await supabaseClient.from("events").insert(payload));
    }

    if (error) throw error;

    showToast(id ? "Evento atualizado." : "Evento criado.");
    resetEventForm();
    await loadAllData();
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao salvar evento.");
    setFieldStatus("eventImageStatus", error.message || "Erro ao processar imagem.", true);
  } finally {
    setButtonLoading(submitButton, "Salvando...", false);
  }
}
/* =========================================
   FIM: Salvar evento
========================================= */


/* =========================================
   INÍCIO: Salvar galeria
========================================= */
async function handleGallerySubmit(event) {
  event.preventDefault();

  const submitButton = galleryForm.querySelector('button[type="submit"]');
  const id = document.getElementById("galleryId").value;
  const currentImageUrl = document.getElementById("galleryImageUrl").value.trim();
  const imageFile = document.getElementById("galleryImageFile").files[0];

  let finalImageUrl = currentImageUrl;

  try {
    setButtonLoading(submitButton, "Salvando...", true);

    if (imageFile) {
      setFieldStatus("galleryImageStatus", "A enviar imagem...");
      finalImageUrl = await uploadImage(imageFile, "gallery");

      if (id && currentImageUrl && currentImageUrl !== finalImageUrl) {
        await deleteImageByPublicUrl(currentImageUrl);
      }

      document.getElementById("galleryImageUrl").value = finalImageUrl;
      setFieldStatus("galleryImageStatus", "Imagem enviada com sucesso.");
    }

    const payload = {
      title: validateOptionalTextField(document.getElementById("galleryTitle").value, "Título", 120),
      description: validateOptionalTextField(document.getElementById("galleryDescription").value, "Descrição", 500),
      image_url: validateImageRequirement(finalImageUrl),
      sort_order: Number(document.getElementById("gallerySortOrder").value || 0),
    };

    let error = null;

    if (id) {
      ({ error } = await supabaseClient.from("gallery").update(payload).eq("id", id));
    } else {
      ({ error } = await supabaseClient.from("gallery").insert(payload));
    }

    if (error) throw error;

    showToast(id ? "Imagem atualizada." : "Imagem criada.");
    resetGalleryForm();
    await loadAllData();
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao salvar imagem.");
    setFieldStatus("galleryImageStatus", error.message || "Erro ao processar imagem.", true);
  } finally {
    setButtonLoading(submitButton, "Salvando...", false);
  }
}
/* =========================================
   FIM: Salvar galeria
========================================= */


/* =========================================
   INÍCIO: Bind formulários
========================================= */
function bindForms() {
  loginForm.addEventListener("submit", handleLogin);
  logoutBtn.addEventListener("click", handleLogout);

  menuForm.addEventListener("submit", handleMenuSubmit);
  eventForm.addEventListener("submit", handleEventSubmit);
  galleryForm.addEventListener("submit", handleGallerySubmit);

  bindFilePreview("menuImageFile", "menuImagePreview", "menuImageStatus");
  bindFilePreview("eventImageFile", "eventImagePreview", "eventImageStatus");
  bindFilePreview("galleryImageFile", "galleryImagePreview", "galleryImageStatus");

  menuCancelBtn.addEventListener("click", resetMenuForm);
  eventCancelBtn.addEventListener("click", resetEventForm);
  galleryCancelBtn.addEventListener("click", resetGalleryForm);
}
/* =========================================
   FIM: Bind formulários
========================================= */


/* =========================================
   INÍCIO: Listener auth
========================================= */
function bindAuthListener() {
  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      showDashboard(session.user);
    } else {
      showLogin();
    }
  });
}
/* =========================================
   FIM: Listener auth
========================================= */


/* =========================================
   INÍCIO: Inicialização
========================================= */
async function initAdmin() {
  bindForms();
  bindTabs();
  bindAuthListener();
  resetMenuForm();
  resetEventForm();
  resetGalleryForm();
  await checkSession();
}

document.addEventListener("DOMContentLoaded", initAdmin);
/* =========================================
   FIM: Inicialização
========================================= */