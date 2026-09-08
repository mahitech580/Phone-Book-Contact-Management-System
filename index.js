"use strict";

const API = "http://127.0.0.1:8000/api";

let contacts = [];
let currentFilter = "all";
let deleteContactId = null;
let toastTimer = null;

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
    setupButtons();
    setupForm();
    setupKeyboard();
    loadContacts();
});

function setupButtons() {
    document.querySelectorAll(".primary-button").forEach(button => {
        button.addEventListener("click", event => {
            const text = button.textContent.toLowerCase();

            if (text.includes("add")) {
                event.preventDefault();
                openContactModal();
            }
        });
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", () => {
            const modal = overlay.closest(".modal");

            if (modal && modal.id === "contactModal") {
                closeContactModal();
            }

            if (modal && modal.id === "deleteModal") {
                closeDeleteModal();
            }
        });
    });
}

function setupForm() {
    const form = $("contactForm");

    if (form) {
        form.addEventListener("submit", handleContactSubmit);
    }
}

function setupKeyboard() {
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeContactModal();
            closeDeleteModal();
        }
    });
}

async function loadContacts() {
    try {
        const response = await fetch(`${API}/contacts`);

        if (!response.ok) {
            throw new Error("Python server is not running");
        }

        const data = await response.json();
        contacts = Array.isArray(data.contacts) ? data.contacts : [];

        renderContacts();
        updateStatistics();
    } catch (error) {
        contacts = [];
        renderContacts();
        updateStatistics();
        showToast("Python server is not connected", "error");
    }
}

function openContactModal(id = null) {
    const modal = $("contactModal");

    if (!modal) {
        alert("contactModal not found in index.html");
        return;
    }

    resetContactForm();

    if (id) {
        const contact = contacts.find(item => item.id === id);

        if (!contact) {
            showToast("Contact not found", "error");
            return;
        }

        $("modalTitle").textContent = "Edit Contact";
        $("editId").value = contact.id;
        $("name").value = contact.name || "";
        $("phone").value = contact.phone || "";
        $("category").value = contact.category || "Other";
        $("email").value = contact.email || "";
        $("notes").value = contact.notes || "";
    } else {
        $("modalTitle").textContent = "Add New Contact";
    }

    modal.classList.add("active");
    document.body.classList.add("modal-open");

    setTimeout(() => {
        $("name")?.focus();
    }, 100);
}

function closeContactModal() {
    const modal = $("contactModal");

    if (modal) {
        modal.classList.remove("active");
    }

    document.body.classList.remove("modal-open");
}

function resetContactForm() {
    const form = $("contactForm");

    if (form) {
        form.reset();
    }

    if ($("editId")) {
        $("editId").value = "";
    }

    if ($("category")) {
        $("category").value = "Other";
    }
}

async function handleContactSubmit(event) {
    event.preventDefault();

    const name = $("name").value.trim();
    const phone = $("phone").value.trim();
    const category = $("category").value;
    const email = $("email").value.trim();
    const notes = $("notes").value.trim();
    const id = $("editId").value;

    if (!name) {
        showToast("Name is required", "error");
        $("name").focus();
        return;
    }

    if (!phone) {
        showToast("Phone number is required", "error");
        $("phone").focus();
        return;
    }

    if (!isValidPhone(phone)) {
        showToast("Enter a valid phone number", "error");
        $("phone").focus();
        return;
    }

    if (email && !isValidEmail(email)) {
        showToast("Enter a valid email", "error");
        $("email").focus();
        return;
    }

    const duplicate = contacts.find(contact =>
        normalizePhone(contact.phone) === normalizePhone(phone) &&
        contact.id !== id
    );

    if (duplicate) {
        showToast("Phone number already exists", "error");
        return;
    }

    const contact = {
        name,
        phone,
        category,
        email,
        notes
    };

    try {
        const response = await fetch(
            id ? `${API}/contacts/${id}` : `${API}/contacts`,
            {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(contact)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to save contact");
        }

        closeContactModal();
        showToast(data.message, "success");
        await loadContacts();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function renderContacts() {
    const grid = $("contactsGrid");

    if (!grid) {
        return;
    }

    const search = $("searchInput")?.value.trim().toLowerCase() || "";

    const filtered = contacts.filter(contact => {
        const categoryMatch =
            currentFilter === "all" ||
            String(contact.category).toLowerCase() ===
            currentFilter.toLowerCase();

        const text = [
            contact.name,
            contact.phone,
            contact.email,
            contact.category,
            contact.notes
        ].join(" ").toLowerCase();

        return categoryMatch && text.includes(search);
    });

    grid.innerHTML = "";

    filtered.forEach(contact => {
        grid.appendChild(createContactCard(contact));
    });

    if ($("visibleCount")) {
        $("visibleCount").textContent = filtered.length;
    }

    if (filtered.length === 0) {
        showEmptyState();
    } else {
        hideEmptyState();
    }
}

function createContactCard(contact) {
    const card = document.createElement("article");
    card.className = "contact-card";

    const top = document.createElement("div");
    top.className = "contact-top";

    const avatar = document.createElement("div");
    avatar.className = "contact-avatar";
    avatar.textContent = getInitials(contact.name);

    const info = document.createElement("div");
    info.className = "contact-info";

    const name = document.createElement("h3");
    name.className = "contact-name";
    name.textContent = contact.name;

    const phone = document.createElement("p");
    phone.className = "contact-phone";
    phone.textContent = formatPhone(contact.phone);

    info.append(name, phone);

    if (contact.email) {
        const email = document.createElement("p");
        email.className = "contact-email";
        email.textContent = contact.email;
        info.appendChild(email);
    }

    const actions = document.createElement("div");
    actions.className = "contact-actions";

    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "icon-button favorite-button";
    favorite.textContent = contact.favorite ? "★" : "☆";

    favorite.addEventListener("click", () => {
        toggleFavorite(contact.id);
    });

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "icon-button";
    edit.textContent = "✎";

    edit.addEventListener("click", () => {
        openContactModal(contact.id);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-button delete-button";
    remove.textContent = "×";

    remove.addEventListener("click", () => {
        openDeleteModal(contact.id);
    });

    actions.append(favorite, edit, remove);
    top.append(avatar, info, actions);

    const category = document.createElement("span");
    category.className = "contact-category";
    category.textContent = contact.category || "Other";

    card.append(top, category);

    if (contact.notes) {
        const notes = document.createElement("p");
        notes.className = "contact-notes";
        notes.textContent = contact.notes;
        card.appendChild(notes);
    }

    return card;
}

async function toggleFavorite(id) {
    try {
        const response = await fetch(`${API}/contacts/${id}/favorite`, {
            method: "PATCH"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        await loadContacts();
        showToast(data.message, "success");
    } catch (error) {
        showToast(error.message || "Unable to update favorite", "error");
    }
}

function openDeleteModal(id) {
    const contact = contacts.find(item => item.id === id);

    if (!contact) {
        return;
    }

    deleteContactId = id;

    if ($("deleteName")) {
        $("deleteName").textContent = contact.name;
    }

    $("deleteModal")?.classList.add("active");
    document.body.classList.add("modal-open");
}

function closeDeleteModal() {
    $("deleteModal")?.classList.remove("active");
    document.body.classList.remove("modal-open");
    deleteContactId = null;
}

async function confirmDelete() {
    if (!deleteContactId) {
        return;
    }

    try {
        const response = await fetch(
            `${API}/contacts/${deleteContactId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        closeDeleteModal();
        await loadContacts();
        showToast(data.message, "success");
    } catch (error) {
        showToast(error.message || "Unable to delete contact", "error");
    }
}

function searchContacts() {
    renderContacts();
}

function clearSearch() {
    if ($("searchInput")) {
        $("searchInput").value = "";
        renderContacts();
        $("searchInput").focus();
    }
}

function filterContacts(category, button) {
    currentFilter = category;

    document.querySelectorAll(".filter").forEach(item => {
        item.classList.remove("active");
    });

    button?.classList.add("active");

    renderContacts();
}

function updateStatistics() {
    if ($("totalContacts")) {
        $("totalContacts").textContent = contacts.length;
    }

    if ($("favoriteContacts")) {
        $("favoriteContacts").textContent =
            contacts.filter(contact => contact.favorite).length;
    }

    if ($("totalCategories")) {
        $("totalCategories").textContent =
            new Set(contacts.map(contact => contact.category || "Other")).size;
    }
}

function showEmptyState() {
    if ($("emptyState")) {
        $("emptyState").style.display = "block";
    }

    if ($("contactsGrid")) {
        $("contactsGrid").style.display = "none";
    }
}

function hideEmptyState() {
    if ($("emptyState")) {
        $("emptyState").style.display = "none";
    }

    if ($("contactsGrid")) {
        $("contactsGrid").style.display = "grid";
    }
}

function getInitials(name) {
    const words = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return "?";
    }

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}

function formatPhone(phone) {
    const digits = normalizePhone(phone);

    if (digits.length === 10) {
        return `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
    }

    return phone;
}

function normalizePhone(phone) {
    return String(phone || "").replace(/\D/g, "");
}

function isValidPhone(phone) {
    const digits = normalizePhone(phone);
    return digits.length >= 7 && digits.length <= 15;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showToast(message, type = "success") {
    if (!$("toast")) {
        return;
    }

    clearTimeout(toastTimer);

    $("toastMessage").textContent = message;
    $("toastIcon").textContent = type === "error" ? "!" : "✓";

    $("toast").classList.remove("success", "error");
    $("toast").classList.add(type, "show");

    toastTimer = setTimeout(() => {
        $("toast").classList.remove("show");
    }, 3000);
}

window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.searchContacts = searchContacts;
window.clearSearch = clearSearch;
window.filterContacts = filterContacts;
window.editContact = openContactModal;
window.toggleFavorite = toggleFavorite;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;