const API = "http://192.168.15.6:8000";

let allItems = [];
let genres = [];
let selectedGenreIds = new Set();
let editingId = null;

async function init() {
  await Promise.all([loadGenres(), loadItems()]);
}

async function loadItems() {
  const res = await fetch(API + "/items");
  allItems = await res.json();
  applyFilters();
  updateStats();
}

async function loadGenres() {
  const res = await fetch(API + "/genres");
  genres = await res.json();
  refreshGenreFilter();
  renderGenrePicker([]);
}

// atualiza o select de filtro sem duplicar opções
function refreshGenreFilter() {
  const filterSel = document.getElementById("filter-genre");
  const current = filterSel.value;
  filterSel.innerHTML = '<option value="">Todos os gêneros</option>';
  genres.forEach((g) => {
    filterSel.innerHTML += `<option value="${g.id}">${g.name}</option>`;
  });
  filterSel.value = current;
}

// ── GENRE PICKER ──────────────────────────────────
function renderGenrePicker(selectedIds) {
  selectedGenreIds = new Set(selectedIds);
  const picker = document.getElementById("genre-picker");
  picker.innerHTML = genres
    .map(
      (g) => `
          <span class="genre-chip ${selectedGenreIds.has(g.id) ? "selected" : ""}"
                onclick="toggleGenre(${g.id})">${g.name}</span>
        `,
    )
    .join("");
}

function toggleGenre(id) {
  if (selectedGenreIds.has(id)) {
    selectedGenreIds.delete(id);
  } else {
    selectedGenreIds.add(id);
  }
  document.querySelectorAll(".genre-chip").forEach((chip, i) => {
    chip.classList.toggle("selected", selectedGenreIds.has(genres[i].id));
  });
}

// ── GENRE MODAL ───────────────────────────────────
function openGenreModal() {
  renderGenreList();
  document.getElementById("new-genre-input").value = "";
  document.getElementById("genre-overlay").classList.add("open");
}

function closeGenreModal() {
  document.getElementById("genre-overlay").classList.remove("open");
}

function closeGenreModalOutside(e) {
  if (e.target === document.getElementById("genre-overlay")) closeGenreModal();
}

function renderGenreList() {
  const list = document.getElementById("genre-list");
  if (genres.length === 0) {
    list.innerHTML = `<div style="color:var(--muted);font-size:0.85rem;padding:0.5rem 0">Nenhum gênero cadastrado.</div>`;
    return;
  }
  list.innerHTML = genres
    .map(
      (g) => `
          <div class="genre-list-item">
            <span>${g.name}</span>
            <button class="btn btn-danger" onclick="deleteGenre(${g.id})">✕</button>
          </div>
        `,
    )
    .join("");
}

async function createGenre() {
  const input = document.getElementById("new-genre-input");
  const name = input.value.trim();
  if (!name) {
    toast("Informe o nome do gênero", true);
    return;
  }

  const res = await fetch(API + "/genres", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (res.ok) {
    input.value = "";
    await loadGenres();
    renderGenreList();
    renderGenrePicker([...selectedGenreIds]);
    toast("Gênero adicionado");
  } else {
    toast("Erro ao adicionar gênero", true);
  }
}

async function deleteGenre(id) {
  if (!confirm("Remover este gênero? Ele será desassociado de todos os itens."))
    return;
  const res = await fetch(`${API}/genres/${id}`, { method: "DELETE" });
  if (res.ok) {
    await loadGenres();
    await loadItems();
    renderGenreList();
    renderGenrePicker([...selectedGenreIds].filter((gid) => gid !== id));
    toast("Gênero removido");
  } else {
    toast("Erro ao remover gênero", true);
  }
}

// ── FILTERS ───────────────────────────────────────
function applyFilters() {
  const type = document.getElementById("filter-type").value;
  const status = document.getElementById("filter-status").value;
  const genre = document.getElementById("filter-genre").value;

  let filtered = allItems;
  if (type) filtered = filtered.filter((i) => i.type === type);
  if (status) filtered = filtered.filter((i) => i.status === status);
  if (genre)
    filtered = filtered.filter(
      (i) => i.genres && i.genres.some((g) => g.id == genre),
    );

  renderGrid(filtered);
}

// ── RENDER ────────────────────────────────────────
function renderGrid(items) {
  const grid = document.getElementById("grid");
  document.getElementById("count-badge").textContent = items.length;

  if (items.length === 0) {
    grid.innerHTML = `
            <div class="empty" style="grid-column:1/-1">
              <div class="empty-icon">◻</div>
              <div>Nenhum título encontrado</div>
            </div>`;
    return;
  }

  const statusLabel = {
    quero: "Quero",
    "em andamento": "Em andamento",
    concluido: "Concluído",
    dropei: "Dropei",
  };

  grid.innerHTML = items
    .map((item) => {
      const date = item.created_at
        ? new Date(item.created_at).toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";

      const genreTags =
        item.genres && item.genres.length
          ? item.genres
              .map((g) => `<span class="card-genre-tag">${g.name}</span>`)
              .join("")
          : "";

      const statusKey = item.status.replace(" ", "-");

      return `
            <div class="card">
              <div class="card-top">
                <div class="card-title">${item.title}</div>
                <span class="badge badge-${item.type}">${item.type}</span>
              </div>
              <div class="card-meta">
                <span class="status-dot dot-${statusKey}"></span>
                <span>${statusLabel[item.status] || item.status}</span>
                ${item.rating ? `<span class="rating">${item.rating}<span>/10</span></span>` : ""}
              </div>
              ${genreTags ? `<div class="card-genres">${genreTags}</div>` : ""}
              <div class="card-footer">
                <span class="card-date">${date}</span>
                <div style="display:flex;align-items:center;gap:0.5rem">
                  <button class="btn btn-danger" onclick="editItem(${item.id})">editar</button>
                  <button class="btn btn-danger" onclick="deleteItem(${item.id})">✕</button>
                </div>
              </div>
            </div>`;
    })
    .join("");
}

// ── STATS ─────────────────────────────────────────
function updateStats() {
  document.getElementById("stat-total").textContent = allItems.length;
  document.getElementById("stat-concluido").textContent = allItems.filter(
    (i) => i.status === "concluido",
  ).length;
  document.getElementById("stat-andamento").textContent = allItems.filter(
    (i) => i.status === "em andamento",
  ).length;
}

// ── MODAL ITEM ────────────────────────────────────
function openModal(item = null) {
  editingId = item ? item.id : null;
  document.getElementById("modal-title").textContent = item
    ? "Editar Título"
    : "Novo Título";
  document.getElementById("f-title").value = item ? item.title : "";
  document.getElementById("f-type").value = item ? item.type : "filme";
  document.getElementById("f-status").value = item ? item.status : "quero";
  document.getElementById("f-rating").value = item ? item.rating || "" : "";

  const selectedIds = item && item.genres ? item.genres.map((g) => g.id) : [];
  renderGenrePicker(selectedIds);

  document.getElementById("overlay").classList.add("open");
}

function closeModal() {
  document.getElementById("overlay").classList.remove("open");
  editingId = null;
  selectedGenreIds = new Set();
}

function closeModalOutside(e) {
  if (e.target === document.getElementById("overlay")) closeModal();
}

function editItem(id) {
  const item = allItems.find((i) => i.id === id);
  if (item) openModal(item);
}

// ── SAVE ──────────────────────────────────────────
async function saveItem() {
  const title = document.getElementById("f-title").value.trim();
  if (!title) {
    toast("Informe o título", true);
    return;
  }

  const payload = {
    title,
    type: document.getElementById("f-type").value,
    status: document.getElementById("f-status").value,
    rating: document.getElementById("f-rating").value
      ? parseInt(document.getElementById("f-rating").value)
      : null,
    genres: [...selectedGenreIds],
  };

  const url = editingId ? `${API}/items/${editingId}` : `${API}/items`;
  const method = editingId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    closeModal();
    await loadItems();
    toast(editingId ? "Título atualizado" : "Título adicionado");
  } else {
    toast("Erro ao salvar", true);
  }
}

// ── DELETE ITEM ───────────────────────────────────
async function deleteItem(id) {
  if (!confirm("Remover este título?")) return;
  const res = await fetch(`${API}/items/${id}`, { method: "DELETE" });
  if (res.ok) {
    await loadItems();
    toast("Título removido");
  }
}

// ── TOAST ─────────────────────────────────────────
function toast(msg, error = false) {
  const t = document.createElement("div");
  t.className = "toast" + (error ? " error" : "");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

init();
