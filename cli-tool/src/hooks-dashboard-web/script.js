// ===== State Management =====
const state = {
  installedHooks: [],
  availableHooks: [],
  filteredHooks: [],
  currentTab: "installed",
  currentView: "grid",
  filters: {
    type: "",
    source: "",
    event: "",
    category: "",
    search: "",
  },
};

// ===== DOM Elements =====
const elements = {
  // Stats
  statTotalInstalled: document.getElementById("statTotalInstalled"),
  statTotalAvailable: document.getElementById("statTotalAvailable"),
  statEventTypes: document.getElementById("statEventTypes"),
  statSources: document.getElementById("statSources"),

  // Filters
  filterType: document.getElementById("filterType"),
  filterSource: document.getElementById("filterSource"),
  filterEvent: document.getElementById("filterEvent"),
  filterCategory: document.getElementById("filterCategory"),
  clearFilters: document.getElementById("clearFilters"),

  // View
  viewGrid: document.getElementById("viewGrid"),
  viewList: document.getElementById("viewList"),

  // Search
  searchInput: document.getElementById("searchInput"),

  // Tabs
  tabBtns: document.querySelectorAll(".tab-btn"),
  installedCount: document.getElementById("installedCount"),
  availableCount: document.getElementById("availableCount"),

  // Content
  hooksContainer: document.getElementById("hooksContainer"),
  refreshBtn: document.getElementById("refreshBtn"),

  // Modal
  hookModal: document.getElementById("hookModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalBody: document.getElementById("modalBody"),
  modalClose: document.querySelector(".modal-close"),
};

// ===== API Functions =====
function getCurrentScope() {
  const params = new URLSearchParams(window.location.search);
  return params.get("scope") || "all";
}

async function fetchInstalledHooks() {
  try {
    const scope = getCurrentScope();
    const url =
      scope && scope !== "all" ? `/api/hooks?scope=${scope}` : "/api/hooks";
    const response = await fetch(url);
    const data = await response.json();
    return data.hooks || [];
  } catch (error) {
    console.error("Error fetching installed hooks:", error);
    return [];
  }
}

async function fetchAvailableHooks() {
  try {
    const response = await fetch("/api/hooks/available");
    const data = await response.json();
    return data.hooks || [];
  } catch (error) {
    console.error("Error fetching available hooks:", error);
    return [];
  }
}

async function fetchSummary() {
  try {
    const response = await fetch("/api/summary");
    return await response.json();
  } catch (error) {
    console.error("Error fetching summary:", error);
    return null;
  }
}

// ===== Data Loading =====
async function loadAllData() {
  showLoading();

  const [installed, available, summary] = await Promise.all([
    fetchInstalledHooks(),
    fetchAvailableHooks(),
    fetchSummary(),
  ]);

  state.installedHooks = installed;
  state.availableHooks = available;

  updateStats(summary);
  populateFilters();
  applyFilters();

  hideLoading();
}

function showLoading() {
  elements.hooksContainer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading hooks...</p>
    </div>
  `;
}

function hideLoading() {
  // Loading will be replaced by renderHooks()
}

// ===== Stats Update =====
function updateStats(summary) {
  if (!summary) {
    return;
  }

  elements.statTotalInstalled.textContent = summary.totalInstalled || 0;
  elements.statTotalAvailable.textContent = summary.totalAvailable || 0;
  elements.statEventTypes.textContent = summary.eventTypes || 0;
  elements.statSources.textContent = summary.sources || 0;

  elements.installedCount.textContent = summary.totalInstalled || 0;
  elements.availableCount.textContent = summary.totalAvailable || 0;
}

// ===== Filter Population =====
function populateFilters() {
  // Populate event types
  const eventTypes = new Set();
  state.installedHooks.forEach((hook) => {
    if (hook.eventType) eventTypes.add(hook.eventType);
  });
  state.availableHooks.forEach((hook) => {
    if (hook.events) hook.events.forEach((event) => eventTypes.add(event));
  });

  elements.filterEvent.innerHTML = '<option value="">All Events</option>';
  Array.from(eventTypes)
    .sort()
    .forEach((event) => {
      const option = document.createElement("option");
      option.value = event;
      option.textContent = event;
      elements.filterEvent.appendChild(option);
    });

  // Populate categories
  const categories = new Set();
  state.availableHooks.forEach((hook) => {
    if (hook.category) categories.add(hook.category);
  });

  elements.filterCategory.innerHTML =
    '<option value="">All Categories</option>';
  Array.from(categories)
    .sort()
    .forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      elements.filterCategory.appendChild(option);
    });
}

// ===== Filtering Logic =====
function applyFilters() {
  const hooks =
    state.currentTab === "installed"
      ? state.installedHooks
      : state.availableHooks;

  state.filteredHooks = hooks.filter((hook) => {
    // Type filter (installed/available)
    if (state.filters.type) {
      const isInstalled = state.currentTab === "installed";
      if (state.filters.type === "installed" && !isInstalled) return false;
      if (state.filters.type === "available" && isInstalled) return false;
    }

    // Source filter
    if (state.filters.source && hook.source !== state.filters.source) {
      return false;
    }

    // Event type filter
    if (state.filters.event) {
      if (state.currentTab === "installed") {
        if (hook.eventType !== state.filters.event) return false;
      } else {
        if (!hook.events || !hook.events.includes(state.filters.event))
          return false;
      }
    }

    // Category filter
    if (state.filters.category && hook.category !== state.filters.category) {
      return false;
    }

    // Search filter
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      const name = (hook.name || "").toLowerCase();
      const description = (hook.description || "").toLowerCase();
      const eventType = (hook.eventType || "").toLowerCase();
      const category = (hook.category || "").toLowerCase();

      const matches =
        name.includes(searchLower) ||
        description.includes(searchLower) ||
        eventType.includes(searchLower) ||
        category.includes(searchLower);

      if (!matches) return false;
    }

    return true;
  });

  renderHooks();
}

// ===== Rendering =====
function renderHooks() {
  if (state.filteredHooks.length === 0) {
    renderEmptyState();
    return;
  }

  const containerClass =
    state.currentView === "grid" ? "hooks-grid" : "hooks-list";

  const hooksHTML = state.filteredHooks
    .map((hook) =>
      state.currentTab === "installed"
        ? renderInstalledHook(hook)
        : renderAvailableHook(hook),
    )
    .join("");

  elements.hooksContainer.innerHTML = `
    <div class="${containerClass}">
      ${hooksHTML}
    </div>
  `;

  // Add click listeners
  document.querySelectorAll(".hook-card").forEach((card, index) => {
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("hook-install-btn")) {
        showHookDetails(state.filteredHooks[index]);
      }
    });
  });
}

function renderInstalledHook(hook) {
  return `
    <div class="hook-card">
      <div class="hook-header">
        <div class="hook-name">${escapeHtml(hook.id || "Unknown")}</div>
        <span class="hook-source ${hook.source || "project"}">${hook.source || "project"}</span>
      </div>
      <div class="hook-description">
        ${hook.type === "bash" ? "Command: " : "Prompt: "}${escapeHtml(hook.command || hook.prompt || "No description")}
      </div>
      <div class="hook-meta">
        <span class="hook-tag event">📌 ${escapeHtml(hook.eventType || "Unknown")}</span>
        <span class="hook-tag">🎯 ${escapeHtml(hook.matcher || "*")}</span>
        <span class="hook-tag">⚡ ${hook.type || "bash"}</span>
      </div>
    </div>
  `;
}

function renderAvailableHook(hook) {
  const events = hook.events || [];
  const eventsHTML = events
    .slice(0, 3)
    .map((event) => `<span class="hook-tag event">${escapeHtml(event)}</span>`)
    .join("");

  const moreEvents =
    events.length > 3
      ? `<span class="hook-tag">+${events.length - 3} more</span>`
      : "";

  return `
    <div class="hook-card available">
      <div class="hook-header">
        <div class="hook-name">${escapeHtml(hook.name || "Unknown")}</div>
        <button class="hook-install-btn" onclick="installHook('${escapeHtml(hook.id)}')">
          Install
        </button>
      </div>
      <div class="hook-description">
        ${escapeHtml(hook.description || "No description available")}
      </div>
      <div class="hook-meta">
        ${hook.category ? `<span class="hook-tag category">📁 ${escapeHtml(hook.category)}</span>` : ""}
        <div class="hook-events">
          ${eventsHTML}
          ${moreEvents}
        </div>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  const message =
    state.filters.search || Object.values(state.filters).some((f) => f)
      ? "No hooks match your filters"
      : state.currentTab === "installed"
        ? "No hooks installed yet"
        : "No hooks available";

  elements.hooksContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">🪝</div>
      <h3>${message}</h3>
      <p>Try adjusting your filters or search query</p>
    </div>
  `;
}

// ===== Modal Functions =====
function showHookDetails(hook) {
  const isInstalled = state.currentTab === "installed";

  elements.modalTitle.textContent = hook.name || hook.id || "Hook Details";

  if (isInstalled) {
    elements.modalBody.innerHTML = `
      <div class="modal-section">
        <h3>Basic Information</h3>
        <ul class="modal-list">
          <li><strong>ID:</strong> ${escapeHtml(hook.id)}</li>
          <li><strong>Event Type:</strong> ${escapeHtml(hook.eventType)}</li>
          <li><strong>Matcher:</strong> ${escapeHtml(hook.matcher)}</li>
          <li><strong>Type:</strong> ${escapeHtml(hook.type)}</li>
          <li><strong>Source:</strong> ${escapeHtml(hook.source)}</li>
        </ul>
      </div>

      ${
        hook.command
          ? `
        <div class="modal-section">
          <h3>Command</h3>
          <div class="modal-code">${escapeHtml(hook.command)}</div>
        </div>
      `
          : ""
      }

      ${
        hook.prompt
          ? `
        <div class="modal-section">
          <h3>Prompt</h3>
          <div class="modal-code">${escapeHtml(hook.prompt)}</div>
        </div>
      `
          : ""
      }

      <div class="modal-section">
        <h3>Configuration File</h3>
        <p>${escapeHtml(hook.settingsPath)}</p>
      </div>
    `;
  } else {
    elements.modalBody.innerHTML = `
      <div class="modal-section">
        <h3>Description</h3>
        <p>${escapeHtml(hook.description || "No description available")}</p>
      </div>

      ${
        hook.category
          ? `
        <div class="modal-section">
          <h3>Category</h3>
          <p>${escapeHtml(hook.category)}</p>
        </div>
      `
          : ""
      }

      ${
        hook.events && hook.events.length > 0
          ? `
        <div class="modal-section">
          <h3>Supported Events</h3>
          <ul class="modal-list">
            ${hook.events.map((event) => `<li>${escapeHtml(event)}</li>`).join("")}
          </ul>
        </div>
      `
          : ""
      }

      <div class="modal-section">
        <h3>Installation</h3>
        <div class="modal-code">npx claude-code-templates@latest --hook ${escapeHtml(hook.id)}</div>
      </div>
    `;
  }

  elements.hookModal.classList.add("active");
}

function hideModal() {
  elements.hookModal.classList.remove("active");
}

// ===== Event Handlers =====
function setupEventListeners() {
  // Refresh button
  elements.refreshBtn.addEventListener("click", loadAllData);

  // Filters
  elements.filterType.addEventListener("change", (e) => {
    state.filters.type = e.target.value;
    applyFilters();
  });

  elements.filterSource.addEventListener("change", (e) => {
    state.filters.source = e.target.value;
    applyFilters();
  });

  elements.filterEvent.addEventListener("change", (e) => {
    state.filters.event = e.target.value;
    applyFilters();
  });

  elements.filterCategory.addEventListener("change", (e) => {
    state.filters.category = e.target.value;
    applyFilters();
  });

  elements.clearFilters.addEventListener("click", () => {
    state.filters = {
      type: "",
      source: "",
      event: "",
      category: "",
      search: "",
    };
    elements.filterType.value = "";
    elements.filterSource.value = "";
    elements.filterEvent.value = "";
    elements.filterCategory.value = "";
    elements.searchInput.value = "";
    applyFilters();
  });

  // Search
  elements.searchInput.addEventListener("input", (e) => {
    state.filters.search = e.target.value;
    applyFilters();
  });

  // View toggle
  elements.viewGrid.addEventListener("click", () => {
    state.currentView = "grid";
    elements.viewGrid.classList.add("active");
    elements.viewList.classList.remove("active");
    renderHooks();
  });

  elements.viewList.addEventListener("click", () => {
    state.currentView = "list";
    elements.viewList.classList.add("active");
    elements.viewGrid.classList.remove("active");
    renderHooks();
  });

  // Tabs
  elements.tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      state.currentTab = tab;

      elements.tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      applyFilters();
    });
  });

  // Modal close
  elements.modalClose.addEventListener("click", hideModal);
  elements.hookModal.addEventListener("click", (e) => {
    if (e.target === elements.hookModal) {
      hideModal();
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideModal();
    }
    if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      elements.searchInput.focus();
    }
  });
}

// ===== Utility Functions =====
function escapeHtml(text) {
  if (typeof text !== "string") return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Installation Function (placeholder) =====
window.installHook = function (hookId) {
  alert(
    `To install this hook, run:\n\nnpx claude-code-templates@latest --hook ${hookId}`,
  );
};

// ===== Initialization =====
async function init() {
  setupEventListeners();
  await loadAllData();

  // Listen for scope changes from universal navigation
  window.addEventListener("scopeChanged", async (e) => {
    console.log("Scope changed to:", e.detail.scope);
    await loadAllData();
  });
}

// Export for universal navigation
window.loadAllData = loadAllData;
window.reloadDashboard = loadAllData;

// Start the app
init();
