//

const notifySound = new Audio("assets/audio/notify.mp3");
notifySound.volume = 0.6;

const DRAFT_TITLE_KEY = "noteDraftTitle";
const DRAFT_DESC_KEY = "noteDraftDesc";
const SEARCH_HISTORY_KEY = "searchHistory";
const MAX_SEARCH_HISTORY = 10;

function normalizeNote(n) {
  if (!n) return { title: "", description: "", date: "" };
  if (typeof n.title === "string" || typeof n.description === "string") {
    return {
      title: typeof n.title === "string" ? n.title : "",
      description: typeof n.description === "string" ? n.description : "",
      date: typeof n.date === "string" ? n.date : "",
    };
  }

  return {
    title: "",
    description: typeof n.content === "string" ? n.content : "",
    date: typeof n.date === "string" ? n.date : "",
  };
}

document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  showNotes();
  searchInput.addEventListener("input", searchNotes);

  // Search enhancements
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const searchSuggestions = document.getElementById("searchSuggestions");

  // Clear search button
  clearSearchBtn?.addEventListener("click", () => {
    searchInput.value = "";
    clearSearchBtn.classList.add("d-none");
    searchSuggestions.classList.add("d-none");
    showNotes();
    searchInput.focus();
  });

  // Show/hide clear button
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim()) {
      clearSearchBtn.classList.remove("d-none");
    } else {
      clearSearchBtn.classList.add("d-none");
      searchSuggestions.classList.add("d-none");
    }
  });

  // Keyboard shortcut Ctrl+K
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  // Search suggestions
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim().length >= 2) {
      showSearchSuggestions();
    }
  });

  searchInput.addEventListener("blur", () => {
    setTimeout(() => searchSuggestions.classList.add("d-none"), 200);
  });

  function showSearchSuggestions() {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
      searchSuggestions.classList.add("d-none");
      return;
    }

    const history = getSearchHistory();
    const filtered = history
      .filter((h) => h.toLowerCase().includes(query))
      .slice(0, 5);

    if (filtered.length) {
      searchSuggestions.innerHTML = filtered
        .map(
          (h) => `
        <div class="search-suggestion-item" onclick="applySuggestion('${escapeHtml(
          h
        )}')">
          <i class="bi bi-clock-history me-2"></i>${escapeHtml(h)}
        </div>
      `
        )
        .join("");
      searchSuggestions.classList.remove("d-none");
    } else {
      searchSuggestions.classList.add("d-none");
    }
  }

  window.applySuggestion = (suggestion) => {
    searchInput.value = suggestion;
    searchSuggestions.classList.add("d-none");
    searchNotes();
  };

  const savedTitle = localStorage.getItem(DRAFT_TITLE_KEY);
  const savedDesc = localStorage.getItem(DRAFT_DESC_KEY);
  if (savedTitle && noteTitleInput && !noteTitleInput.value) {
    noteTitleInput.value = savedTitle;
  }
  if (savedDesc && noteInput && !noteInput.value) {
    noteInput.value = savedDesc;
  }

  noteTitleInput?.addEventListener("input", () => {
    localStorage.setItem(DRAFT_TITLE_KEY, noteTitleInput.value);
  });

  noteInput?.addEventListener("input", () => {
    localStorage.setItem(DRAFT_DESC_KEY, noteInput.value);
  });

  noteInput?.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      addNote();
    }
  });

  // Delete confirm modal logic
  const deleteConfirmCheck = document.getElementById("deleteConfirmCheck");
  const deleteTitleSection = document.getElementById("deleteTitleSection");
  const deleteTitleInput = document.getElementById("deleteTitleInput");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  let currentDeleteIndex = null;
  let currentDeleteTitle = "";

  deleteConfirmCheck?.addEventListener("change", () => {
    if (deleteConfirmCheck.checked) {
      deleteTitleSection.classList.remove("d-none");
      deleteTitleInput.focus();
    } else {
      deleteTitleSection.classList.add("d-none");
      deleteTitleInput.value = "";
      confirmDeleteBtn.disabled = true;
    }
  });

  deleteTitleInput?.addEventListener("input", () => {
    const matches = deleteTitleInput.value.trim() === currentDeleteTitle;
    confirmDeleteBtn.disabled = !matches;
  });

  window.openDeleteConfirmModal = (i, title) => {
    currentDeleteIndex = i;
    currentDeleteTitle = title || "Untitled";
    deleteIndex.value = i;
    deleteConfirmCheck.checked = false;
    deleteTitleSection.classList.add("d-none");
    deleteTitleInput.value = "";
    confirmDeleteBtn.disabled = true;
    new bootstrap.Modal(deleteConfirmModal).show();
  };

  confirmDeleteBtn?.addEventListener("click", () => {
    if (
      currentDeleteIndex !== null &&
      deleteTitleInput.value.trim() === currentDeleteTitle
    ) {
      bootstrap.Modal.getInstance(deleteConfirmModal)?.hide();
      performDelete(currentDeleteIndex);
    }
  });
});

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------- Search Utilities ---------- */
function normalizeSearchText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  const normalizedQuery = normalizeSearchText(query);
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return escapeHtml(text).replace(
    regex,
    '<span class="search-highlight">$1</span>'
  );
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSearchQuery(query) {
  if (!query || query.trim().length < 2) return;
  const history = getSearchHistory();
  const filtered = history.filter(
    (h) => h.toLowerCase() !== query.toLowerCase()
  );
  filtered.unshift(query.trim());
  const limited = filtered.slice(0, MAX_SEARCH_HISTORY);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
}

function parseAdvancedSearch(query) {
  const result = {
    title: "",
    description: "",
    after: null,
    before: null,
    general: "",
  };

  if (!query) return result;

  const parts = query.split(/\s+/);
  let current = "general";
  let buffer = "";

  for (const part of parts) {
    if (part.startsWith("title:")) {
      if (buffer) result[current] += buffer + " ";
      current = "title";
      buffer = part.slice(6);
    } else if (part.startsWith("desc:")) {
      if (buffer) result[current] += buffer + " ";
      current = "description";
      buffer = part.slice(5);
    } else if (part.startsWith("after:")) {
      result.after = part.slice(6);
    } else if (part.startsWith("before:")) {
      result.before = part.slice(7);
    } else {
      buffer += (buffer ? " " : "") + part;
    }
  }

  if (buffer) result[current] += buffer;
  return result;
}

function renderNoteCard(n, i, { truncate = true, highlightQuery = "" } = {}) {
  const note = normalizeNote(n);
  const rawTitle = note.title.trim();
  const rawDesc = note.description;

  const title = rawTitle || "Untitled";
  const descPreview = truncate
    ? rawDesc.length > 140
      ? `${rawDesc.substring(0, 140)}...`
      : rawDesc
    : rawDesc;

  const displayTitle = highlightQuery
    ? highlightText(title, highlightQuery)
    : escapeHtml(title);
  const displayDesc = highlightQuery
    ? highlightText(descPreview, highlightQuery)
    : escapeHtml(descPreview);

  return `
      <div class="col-md-4">
        <div class="card note-card p-3">
          <div class="note-card-menu dropdown">
            <button
              class="icon-btn note-menu-btn"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Note options"
            >
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end note-menu">
              <li>
                <button class="dropdown-item" type="button" onclick="viewNote(${i})">
                  <i class="bi bi-eye me-2"></i>View
                </button>
              </li>
              <li>
                <button class="dropdown-item" type="button" onclick="openEditModal(${i})">
                  <i class="bi bi-pencil me-2"></i>Edit
                </button>
              </li>
              <li>
                <button class="dropdown-item text-danger" type="button" onclick="deleteNote(${i})">
                  <i class="bi bi-trash me-2"></i>Delete
                </button>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item" type="button" onclick="copyNote(${i})">
                  <i class="bi bi-clipboard me-2"></i>Copy
                </button>
              </li>
              <li>
                <button class="dropdown-item" type="button" onclick="openDownloadModal(${i})">
                  <i class="bi bi-download me-2"></i>Download
                </button>
              </li>
              <li>
                <button class="dropdown-item" type="button" onclick="shareNote(${i})">
                  <i class="bi bi-share me-2"></i>Share
                </button>
              </li>
            </ul>
          </div>

          <div class="note-card-header">
            <div class="note-title" title="${escapeHtml(
              title
            )}">${displayTitle}</div>
          </div>

          <div class="note-desc">${displayDesc}</div>
          <div class="note-meta">
            <small class="opacity-75">${escapeHtml(note.date || "")}</small>
          </div>
        </div>
      </div>`;
}

function renderEmptyState(message) {
  notesContainer.innerHTML = `
    <div class="col-12">
      <div class="card note-card p-4 empty-state">
        <div class="empty-state-title">${escapeHtml(message)}</div>
        <div class="empty-state-subtitle opacity-75">Create a note above to get started.</div>
      </div>
    </div>`;
}

/* ---------- Toast ---------- */
function showToast(msg) {
  const toast = document.getElementById("appToast");
  document.getElementById("toastMsg").innerText = msg;

  try {
    notifySound.currentTime = 0;
    notifySound.play();
  } catch {}

  new bootstrap.Toast(toast).show();
}

/* ---------- Spinner ---------- */
function showSpinner() {
  document.getElementById("spinnerOverlay").classList.remove("d-none");
}

function hideSpinner() {
  document.getElementById("spinnerOverlay").classList.add("d-none");
}

/* ---------- Notes ---------- */
function addNote() {
  const title = noteTitleInput.value.trim();
  const description = noteInput.value.trim();
  if (!title && !description) return showToast("Note cannot be empty!");

  showSpinner();
  setTimeout(() => {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push({
      title,
      description,
      date: new Date().toLocaleString(),
    });

    localStorage.setItem("notes", JSON.stringify(notes));
    noteTitleInput.value = "";
    noteInput.value = "";
    localStorage.removeItem(DRAFT_TITLE_KEY);
    localStorage.removeItem(DRAFT_DESC_KEY);
    showNotes();
    hideSpinner();
    showToast("Note added!");
  }, 300);
}

function showNotes() {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  notesContainer.innerHTML = "";

  if (!notes.length) {
    renderEmptyState("No notes yet");
    return;
  }

  notes.forEach((n, i) => {
    notesContainer.innerHTML += renderNoteCard(n, i, { truncate: true });
  });
}

function deleteNote(i) {
  const notes = JSON.parse(localStorage.getItem("notes"));
  const note = normalizeNote(notes[i]);
  openDeleteConfirmModal(i, note.title || "Untitled");
}

function performDelete(i) {
  showSpinner();
  setTimeout(() => {
    const notes = JSON.parse(localStorage.getItem("notes"));
    notes.splice(i, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    showNotes();
    hideSpinner();
    showToast("Note deleted!");
  }, 300);
}

/* ---------- Edit / View ---------- */
function openEditModal(i) {
  const notes = JSON.parse(localStorage.getItem("notes"));
  const n = normalizeNote(notes[i]);
  editNoteTitle.value = n.title;
  editNoteText.value = n.description;
  editIndex.value = i;
  new bootstrap.Modal(editModal).show();
}

function saveEdit() {
  showSpinner();
  setTimeout(() => {
    const notes = JSON.parse(localStorage.getItem("notes"));
    const i = Number(editIndex.value);
    const existing = normalizeNote(notes[i]);
    notes[i] = {
      ...notes[i],
      title: editNoteTitle.value.trim(),
      description: editNoteText.value,
      date: new Date().toLocaleString(),
      content: undefined,
    };
    if (!notes[i].title && !String(notes[i].description || "").trim()) {
      notes[i] = { ...existing, date: new Date().toLocaleString() };
    }
    localStorage.setItem("notes", JSON.stringify(notes));
    bootstrap.Modal.getInstance(editModal).hide();
    showNotes();
    hideSpinner();
    showToast("Note updated!");
  }, 300);
}

function viewNote(i) {
  const n = normalizeNote(JSON.parse(localStorage.getItem("notes"))?.[i]);
  viewNoteTitle.innerText = n.title || "Untitled";
  viewNoteContent.innerText = n.description;
  viewNoteDate.innerText = n.date;
  new bootstrap.Modal(viewModal).show();
}

function openDownloadModal(i) {
  downloadIndex.value = i;
  new bootstrap.Modal(downloadModal).show();
}

/* ---------- Download ---------- */
function getSafeFileBase(n) {
  const safeDate = String(n?.date || "")
    .replaceAll(":", "-")
    .replaceAll("/", "-")
    .replaceAll(",", "")
    .replaceAll(" ", "_")
    .trim();

  return safeDate ? `note_${safeDate}` : "note";
}

function triggerDownload(blob, filename) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function downloadNoteAs(format) {
  showSpinner();
  setTimeout(() => {
    const i = Number(downloadIndex.value);
    const n = JSON.parse(localStorage.getItem("notes"))?.[i];

    if (!n) {
      hideSpinner();
      showToast("Note not found!");
      return;
    }

    const note = normalizeNote(n);
    const base = getSafeFileBase(note);
    const title = note.title || "Untitled";
    const content = String(note.description || "");

    if (format === "pdf") {
      const jspdfNS = window.jspdf;
      const jsPDF = jspdfNS?.jsPDF;

      if (!jsPDF) {
        hideSpinner();
        showToast("PDF export not available!");
        return;
      }

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;

      doc.setFontSize(16);
      doc.text(title, margin, 55);

      doc.setFontSize(10);
      if (note.date) doc.text(String(note.date), margin, 75);

      doc.setFontSize(12);
      const maxWidth = pageWidth - margin * 2;
      const lines = doc.splitTextToSize(content, maxWidth);
      const lineHeight = 16;

      let y = 100;
      lines.forEach((line) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        doc.text(String(line), margin, y);
        y += lineHeight;
      });

      doc.save(`${base}.pdf`);
      bootstrap.Modal.getInstance(downloadModal)?.hide();
      hideSpinner();
      showToast("Note downloaded!");
      return;
    }

    if (format === "txt") {
      triggerDownload(
        new Blob([content], { type: "text/plain" }),
        `${base}.txt`
      );
      bootstrap.Modal.getInstance(downloadModal)?.hide();
      hideSpinner();
      showToast("Note downloaded!");
      return;
    }

    if (format === "md") {
      const md = `# ${title}\n\n${content}\n\n---\n${String(note.date || "")}`;
      triggerDownload(new Blob([md], { type: "text/markdown" }), `${base}.md`);
      bootstrap.Modal.getInstance(downloadModal)?.hide();
      hideSpinner();
      showToast("Note downloaded!");
      return;
    }

    if (format === "json") {
      const json = JSON.stringify(
        { title: note.title, description: note.description, date: note.date },
        null,
        2
      );
      triggerDownload(
        new Blob([json], { type: "application/json" }),
        `${base}.json`
      );
      bootstrap.Modal.getInstance(downloadModal)?.hide();
      hideSpinner();
      showToast("Note downloaded!");
      return;
    }

    hideSpinner();
    showToast("Unknown download format!");
  }, 300);
}

function downloadNote(i) {
  const n = JSON.parse(localStorage.getItem("notes"))?.[i];
  if (!n) return showToast("Note not found!");

  const note = normalizeNote(n);
  const base = getSafeFileBase(note);
  const title = note.title || "Untitled";
  const text = `${title}\n\n${String(note.description || "")}\n\n${String(
    note.date || ""
  )}`;
  triggerDownload(new Blob([text], { type: "text/plain" }), `${base}.txt`);
  showToast("Note downloaded!");
}

/* ---------- Copy ---------- */
function copyNote(i) {
  const n = normalizeNote(JSON.parse(localStorage.getItem("notes"))?.[i]);
  const title = n.title || "Untitled";
  const text = `${title}\n\n${String(n.description || "")}`;

  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("Note copied to clipboard!"))
      .catch(() => showToast("Copy not supported on this device!"));
  } else {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast("Note copied to clipboard!");
    } catch {
      showToast("Copy not supported on this device!");
    }
  }
}

/* ---------- Share ---------- */
function shareNote(i) {
  showSpinner();
  setTimeout(() => {
    const n = normalizeNote(JSON.parse(localStorage.getItem("notes"))?.[i]);

    const title = n.title || "My Note";
    const text = `${title}\n\n${String(n.description || "")}`;

    if (navigator.share) {
      navigator
        .share({
          title,
          text,
        })
        .finally(() => hideSpinner());
    } else {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            hideSpinner();
            showToast("Note copied to clipboard!");
          })
          .catch(() => {
            hideSpinner();
            showToast("Sharing not supported on this device!");
          });
        return;
      }

      try {
        prompt("Copy your note:", text);
      } catch {
        showToast("Sharing not supported on this device!");
      } finally {
        hideSpinner();
      }
    }
  }, 300);
}

/* ---------- Search ---------- */
function searchNotes() {
  const query = searchInput.value.trim();
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  notesContainer.innerHTML = "";

  if (!query) {
    showNotes();
    return;
  }

  // Save to search history
  saveSearchQuery(query);

  // Parse advanced search
  const search = parseAdvancedSearch(query);
  const highlightQuery = search.general || search.title || search.description;

  // Filter notes
  const results = notes
    .map((n, i) => ({ ...n, _index: i }))
    .filter((n) => {
      const note = normalizeNote(n);
      const titleMatch = search.title
        ? normalizeSearchText(note.title).includes(
            normalizeSearchText(search.title)
          )
        : true;
      const descMatch = search.description
        ? normalizeSearchText(note.description).includes(
            normalizeSearchText(search.description)
          )
        : true;
      const generalMatch = search.general
        ? normalizeSearchText(note.title).includes(
            normalizeSearchText(search.general)
          ) ||
          normalizeSearchText(note.description).includes(
            normalizeSearchText(search.general)
          )
        : true;

      // Date filtering
      let dateMatch = true;
      if (search.after || search.before) {
        const noteDate = new Date(note.date);
        if (search.after) {
          const afterDate = new Date(search.after);
          dateMatch = dateMatch && noteDate >= afterDate;
        }
        if (search.before) {
          const beforeDate = new Date(search.before);
          dateMatch = dateMatch && noteDate <= beforeDate;
        }
      }

      return titleMatch && descMatch && generalMatch && dateMatch;
    });

  // Show result count
  if (results.length) {
    notesContainer.innerHTML = `
      <div class="col-12">
        <div class="search-result-count">${results.length} result${
      results.length > 1 ? "s" : ""
    } for "${escapeHtml(query)}"</div>
      </div>
    `;
    results.forEach((n) => {
      notesContainer.innerHTML += renderNoteCard(n, n._index, {
        truncate: false,
        highlightQuery,
      });
    });
  } else {
    renderEmptyState(`No results for "${escapeHtml(query)}"`);
  }
}

/* ---------- Theme ---------- */
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
}

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
}
