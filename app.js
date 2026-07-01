"use strict";

const SEPARATOR = ";";

function normalizeItem(itemText) {
  return String(itemText || "").replace(/\s+/g, " ").trim();
}

function parseItemsFromText(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/, ""))
    .map(normalizeItem)
    .filter(Boolean);
}

function plainTextList(items) {
  return items.map(normalizeItem).filter(Boolean).join("\n");
}

function markdownChecklist(items) {
  return items
    .map(normalizeItem)
    .filter(Boolean)
    .map((item) => `- [ ] ${item}`)
    .join("\n");
}

function encodeList(items) {
  const cleanItems = items.map(normalizeItem).filter(Boolean);
  if (!cleanItems.length) {
    return "";
  }
  return cleanItems.map((item) => encodeURIComponent(item)).join(SEPARATOR) + SEPARATOR;
}

function decodeHash(hash) {
  const rawHash = String(hash || "").replace(/^#/, "");
  if (!rawHash) {
    return [];
  }
  return rawHash
    .split(SEPARATOR)
    .filter(Boolean)
    .map((item) => {
      try {
        return decodeURIComponent(item);
      } catch (_error) {
        return item;
      }
    })
    .map(normalizeItem)
    .filter(Boolean);
}

function listUrl(items) {
  const url = new URL(window.location.href);
  url.hash = encodeList(items);
  return url.toString();
}

function setHash(items) {
  const encoded = encodeList(items);
  if (window.location.hash.replace(/^#/, "") !== encoded) {
    window.location.hash = encoded;
  }
}

function buildMailLink(url) {
  const subject = encodeURIComponent("Meine Liste");
  const body = encodeURIComponent(`Findest Du hier: ${url}`);
  return `mailto:?subject=${subject}&body=${body}`;
}

function renderList(state) {
  state.listElement.replaceChildren();

  if (!state.items.length) {
    const empty = document.createElement("li");
    empty.className = "list-group-item empty-state";
    empty.textContent = "Noch keine Eintraege. Tippen, Return druecken, Link teilen.";
    state.listElement.appendChild(empty);
  }

  state.items.forEach((itemText, index) => {
    const row = document.createElement("li");
    row.className = "list-group-item list-row";

    const label = document.createElement("span");
    label.textContent = itemText;
    row.appendChild(label);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-sm btn-outline-danger";
    removeButton.textContent = "Entfernen";
    removeButton.setAttribute("aria-label", `${itemText} entfernen`);
    removeButton.addEventListener("click", () => {
      state.items.splice(index, 1);
      setHash(state.items);
      renderList(state);
    });
    row.appendChild(removeButton);
    state.listElement.appendChild(row);
  });

  const url = listUrl(state.items);
  state.urlElement.textContent = url;
  state.urlElement.href = url;
  state.mailElement.href = buildMailLink(url);
  state.countElement.textContent = state.items.length.toLocaleString("de-DE");
  state.lengthElement.textContent = url.length.toLocaleString("de-DE");
  state.clearButton.disabled = state.items.length === 0;
  state.sortButton.disabled = state.items.length < 2;
  state.copyTextButton.disabled = state.items.length === 0;
  state.copyMarkdownButton.disabled = state.items.length === 0;
}

function syncFromHash(state) {
  state.items = decodeHash(window.location.hash);
  renderList(state);
}

async function copyLink(state) {
  const url = listUrl(state.items);
  await copyText(url, state, "Link kopiert.");
}

async function copyText(text, state, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    state.feedbackElement.textContent = successMessage;
  } catch (_error) {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.value = text;
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    state.feedbackElement.textContent = successMessage;
  }
  window.setTimeout(() => {
    state.feedbackElement.textContent = "";
  }, 1600);
}

async function copyPlainText(state) {
  await copyText(plainTextList(state.items), state, "Text kopiert.");
}

async function copyMarkdown(state) {
  await copyText(markdownChecklist(state.items), state, "Markdown kopiert.");
}

function initListApp() {
  const state = {
    items: [],
    listElement: document.getElementById("list"),
    urlElement: document.getElementById("myurl"),
    mailElement: document.getElementById("mailurl"),
    countElement: document.getElementById("item-count"),
    lengthElement: document.getElementById("url-length"),
    feedbackElement: document.getElementById("copy-feedback"),
    clearButton: document.getElementById("clear-list"),
    sortButton: document.getElementById("sort-list"),
    importElement: document.getElementById("bulk-items"),
    importButton: document.getElementById("import-items"),
    copyTextButton: document.getElementById("copy-text"),
    copyMarkdownButton: document.getElementById("copy-markdown"),
  };
  const listForm = document.querySelector("form");

  syncFromHash(state);
  window.addEventListener("hashchange", () => syncFromHash(state));

  listForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const newItem = normalizeItem(listForm.elements.eintrag.value);
    if (!newItem) {
      listForm.elements.eintrag.focus();
      return;
    }
    state.items.push(newItem);
    setHash(state.items);
    renderList(state);
    listForm.reset();
    listForm.elements.eintrag.focus();
  });

  document.getElementById("copy-link").addEventListener("click", () => copyLink(state));
  state.copyTextButton.addEventListener("click", () => copyPlainText(state));
  state.copyMarkdownButton.addEventListener("click", () => copyMarkdown(state));
  state.importButton.addEventListener("click", () => {
    const importedItems = parseItemsFromText(state.importElement.value);
    if (!importedItems.length) {
      state.importElement.focus();
      return;
    }
    state.items.push(...importedItems);
    setHash(state.items);
    renderList(state);
    state.importElement.value = "";
  });
  state.clearButton.addEventListener("click", () => {
    state.items = [];
    setHash(state.items);
    renderList(state);
  });
  state.sortButton.addEventListener("click", () => {
    state.items.sort((a, b) => a.localeCompare(b, "de"));
    setHash(state.items);
    renderList(state);
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initListApp);
}

if (typeof module !== "undefined") {
  module.exports = {
    decodeHash,
    encodeList,
    normalizeItem,
    parseItemsFromText,
    markdownChecklist,
    plainTextList,
  };
}
