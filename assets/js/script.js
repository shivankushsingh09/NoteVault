const notifySound = new Audio("assets/audio/notify.mp3");
notifySound.volume = 0.6;

const DRAFT_TITLE_KEY = "noteDraftTitle";
const DRAFT_DESC_KEY = "noteDraftDesc";

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
    const filtered = history.filter(h => h.toLowerCase().includes(query)).slice(0, 5);

    if (filtered.length) {
      searchSuggestions.innerHTML = filtered.map(h => `
        <div class="search-suggestion-item" onclick="applySuggestion('${escapeHtml(h)}')">
          <i class="bi bi-clock-history me-2"></i>${escapeHtml(h)}
        </div>
      `).join("");
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

  // Keyboard shortcut Ctrl+N for Add Note modal
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      openAddNoteModal();
    }
  });

  // Modal Enter key support
  document.getElementById("modalNoteInput")?.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      addNoteFromModal();
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
    if (currentDeleteIndex !== null && deleteTitleInput.value.trim() === currentDeleteTitle) {
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

function renderNoteCard(n, i, { truncate = true } = {}) {
  const note = normalizeNote(n);
  const rawTitle = note.title.trim();
  const rawDesc = note.description;

  const title = rawTitle || "Untitled";
  const descPreview = truncate
    ? rawDesc.length > 140
      ? `${rawDesc.substring(0, 140)}...`
      : rawDesc
    : rawDesc;

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
            <div class="note-title" title="${escapeHtml(title)}">${escapeHtml(title)}</div>
          </div>

          <div class="note-desc">${escapeHtml(descPreview)}</div>
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
function openAddNoteModal() {
  // Clear modal inputs
  document.getElementById("modalNoteTitleInput").value = "";
  document.getElementById("modalNoteInput").value = "";
  // Open modal
  new bootstrap.Modal(addNoteModal).show();
  // Focus title input
  setTimeout(() => {
    document.getElementById("modalNoteTitleInput").focus();
  }, 200);
}

function addNoteFromModal() {
  const title = document.getElementById("modalNoteTitleInput").value.trim();
  const description = document.getElementById("modalNoteInput").value.trim();
  if (!title && !description) return showToast("Note cannot be empty!");

  // Check for duplicate title
  if (title) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const duplicate = notes.find(n => normalizeNote(n).title.trim().toLowerCase() === title.toLowerCase());
    if (duplicate) {
      showToast("Title already exists. Use a unique title.");
      document.getElementById("modalNoteTitleInput").focus();
      document.getElementById("modalNoteTitleInput").select();
      return;
    }
  }

  showSpinner();
  setTimeout(() => {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push({
      title,
      description,
      date: new Date().toLocaleString(),
    });

    localStorage.setItem("notes", JSON.stringify(notes));
    bootstrap.Modal.getInstance(addNoteModal).hide();
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
    const newTitle = editNoteTitle.value.trim();
    const newDescription = editNoteText.value;

    // Check for duplicate title (excluding current note)
    if (newTitle) {
      const duplicate = notes.find((n, idx) => {
        if (idx === i) return false; // Skip current note
        return normalizeNote(n).title.trim().toLowerCase() === newTitle.toLowerCase();
      });
      if (duplicate) {
        hideSpinner();
        showToast("Title already exists. Use a unique title.");
        editNoteTitle.focus();
        editNoteTitle.select();
        return;
      }
    }

    notes[i] = {
      ...notes[i],
      title: newTitle,
      description: newDescription,
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
      triggerDownload(new Blob([content], { type: "text/plain" }), `${base}.txt`);
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
      triggerDownload(new Blob([json], { type: "application/json" }), `${base}.json`);
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
  const text = `${title}\n\n${String(note.description || "")}\n\n${String(note.date || "")}`;
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
      navigator.share({
        title,
        text,
      }).finally(() => hideSpinner());
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
  const q = searchInput.value.toLowerCase();
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  notesContainer.innerHTML = "";

  const results = notes
    .map((n, i) => ({ ...n, _index: i }))
    .filter((n) => {
      const note = normalizeNote(n);
      return (
        String(note.title).toLowerCase().includes(q) ||
        String(note.description).toLowerCase().includes(q)
      );
    });

  if (!results.length) {
    renderEmptyState(q ? "No matching notes" : "No notes yet");
    return;
  }

  results.forEach((n) => {
    notesContainer.innerHTML += renderNoteCard(n, n._index, { truncate: false });
  });
}

/* ---------- Theme ---------- */
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  const themeIcon = document.getElementById("themeIcon");
  if (themeIcon) {
    themeIcon.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    themeIcon.parentElement.title = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
  }
}

function loadTheme() {
  const isDark = localStorage.getItem("theme") === "dark";
  if (isDark) {
    document.body.classList.add("dark-mode");
  }
  updateThemeIcon(isDark);
}
