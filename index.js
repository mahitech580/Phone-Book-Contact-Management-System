```javascript
"use strict";

/*
 * Phone Book Contact Management System
 * Frontend controller
 */

const API_BASE_URL = "http://127.0.0.1:8000/api";

const state = {
    contacts: [],
    activeFilter: "all",
    pendingDeleteId: null,
    toastTimer: null
};


/* =========================================
   DOM HELPERS
========================================= */

const $ = id => document.getElementById(id);

const $$ = selector =>
    Array.from(document.querySelectorAll(selector));


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
    bindFormEvents();
    bindModalEvents();
    bindKeyboardEvents();

    loadContacts();
}


/* =========================================
   FORM EVENTS
========================================= */

function bindFormEvents() {
    const contactForm = $("contactForm");

    if (!contactForm) {
        console.warn("contactForm was not found.");
        return;
    }

    contactForm.addEventListener("submit", handleContactSubmit);
}


/* =========================================
   MODAL EVENTS
========================================= */

function bindModalEvents() {
    $$(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", () => {
            const modal = overlay.closest(".modal");

            if (!modal) {
                return;
            }

            if (modal.id === "contactModal") {
                closeContactModal();
            }

            if (modal.id === "deleteModal") {
                closeDeleteModal();
            }
        });
    });
}


/* =========================================
   KEYBOARD EVENTS
========================================= */

function bindKeyboardEvents() {
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") {
            return;
        }

        closeContactModal();
        closeDeleteModal();
    });
}


/* =========================================
   API REQUEST HELPER
========================================= */

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...(options.headers || {})
        }
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
}


/* =========================================
   LOAD CONTACTS
========================================= */

async function loadContacts() {
    try {
        const data = await apiRequest("/contacts");

        state.contacts = Array.isArray(data.contacts)
            ? data.contacts
            : [];

        renderContacts();
        updateStatistics();
    } catch (error) {
        state.contacts = [];

        renderContacts();
        updateStatistics();

        showToast(
            "Unable to connect to the Python server",
            "error"
        );

        console.error("Load contacts error:", error);
    }
}


/* =========================================
   CONTACT MODAL
========================================= */

function openContactModal(id = null) {
    const modal = $("contactModal");

    if (!modal) {
        console.error("contactModal was not found.");
        return;
    }

    resetContactForm();

    if (id !== null && id !== "") {
        const contact = findContactById(id);

        if (!contact) {
            showToast("Contact not found", "error");
            return;
        }

        populateContactForm(contact);

        $("modalTitle").textContent = "Edit Contact";
    } else {
        $("modalTitle").textContent = "Add New Contact";
    }

    modal.classList.add("active");
    document.body.classList.add("modal-open");

    window.setTimeout(() => {
        $("name")?.focus();
    }, 100);
}


function closeContactModal() {
    $("contactModal")?.classList.remove("active");

    updateBodyModalState();
}


function resetContactForm() {
    const form = $("contactForm");

    form?.reset();

    if ($("editId")) {
        $("editId").value = "";
    }

    if ($("category")) {
        $("category").value = "Other";
    }
}


function populateContactForm(contact) {
    $("editId").value = contact.id ?? "";
    $("name").value = contact.name ?? "";
    $("phone").value = contact.phone ?? "";
    $("category").value = contact.category || "Other";
    $("email").value = contact.email ?? "";
    $("notes").value = contact.notes ?? "";
}


/* =========================================
   SAVE / UPDATE CONTACT
========================================= */

async function handleContactSubmit(event) {
    event.preventDefault();

    const formData = getContactFormData();
    const editingId = $("editId")?.value || "";

    const validationError = validateContact(formData, editingId);

    if (validationError) {
        showToast(validationError.message, "error");
        validationError.element?.focus();
        return;
    }

    const isEditing = Boolean(editingId);

    try {
        const endpoint = isEditing
            ? `/contacts/${editingId}`
            : "/contacts";

        const method = isEditing
            ? "PUT"
            : "POST";

        const data = await apiRequest(endpoint, {
            method,
            body: JSON.stringify(formData)
        });

        closeContactModal();

        showToast(
            data.message ||
            (isEditing
                ? "Contact updated successfully"
                : "Contact added successfully"),
            "success"
        );

        await loadContacts();
    } catch (error) {
        showToast(
            error.message || "Unable to save contact",
            "error"
        );

        console.error("Save contact error:", error);
    }
}


function getContactFormData() {
    return {
        name: $("name")?.value.trim() || "",
        phone: $("phone")?.value.trim() || "",
        category: $("category")?.value || "Other",
        email: $("email")?.value.trim() || "",
        notes: $("notes")?.value.trim() || ""
    };
}


function validateContact(contact, editingId = "") {
    if (!contact.name) {
        return {
            message: "Name is required",
            element: $("name")
        };
    }

    if (contact.name.length < 2) {
        return {
            message: "Name must contain at least 2 characters",
            element: $("name")
        };
    }

    if (!contact.phone) {
        return {
            message: "Phone number is required",
            element: $("phone")
        };
    }

    if (!isValidPhone(contact.phone)) {
        return {
            message: "Enter a valid phone number",
            element: $("phone")
        };
    }

    if (
        contact.email &&
        !isValidEmail(contact.email)
    ) {
        return {
            message: "Enter a valid email address",
            element: $("email")
        };
    }

    const duplicate = state.contacts.find(existing => {
        return (
            normalizePhone(existing.phone) ===
                normalizePhone(contact.phone) &&
            String(existing.id) !== String(editingId)
        );
    });

    if (duplicate) {
        return {
            message: "This phone number already exists",
            element: $("phone")
        };
    }

    return null;
}


/* =========================================
   RENDER CONTACTS
========================================= */

function renderContacts() {
    const grid = $("contactsGrid");

    if (!grid) {
        return;
    }

    const searchTerm =
        $("searchInput")?.value
            .trim()
            .toLowerCase() || "";

    const visibleContacts = getVisibleContacts(searchTerm);

    grid.replaceChildren();

    visibleContacts.forEach(contact => {
        grid.appendChild(createContactCard(contact));
    });

    if ($("visibleCount")) {
        $("visibleCount").textContent =
            visibleContacts.length;
    }

    visibleContacts.length === 0
        ? showEmptyState()
        : hideEmptyState();
}


function getVisibleContacts(searchTerm = "") {
    return state.contacts.filter(contact => {
        const categoryMatches =
            state.activeFilter === "all" ||
            String(contact.category || "")
                .toLowerCase() ===
            state.activeFilter.toLowerCase();

        if (!categoryMatches) {
            return false;
        }

        if (!searchTerm) {
            return true;
        }

        const searchableText = [
            contact.name,
            contact.phone,
            contact.email,
            contact.category,
            contact.notes
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(searchTerm);
    });
}


/* =========================================
   CONTACT CARD
========================================= */

function createContactCard(contact) {
    const card = document.createElement("article");
    card.className = "contact-card";

    const topSection = document.createElement("div");
    topSection.className = "contact-top";

    const avatar = createElement(
        "div",
        "contact-avatar",
        getInitials(contact.name)
    );

    const information = document.createElement("div");
    information.className = "contact-info";

    const name = createElement(
        "h3",
        "contact-name",
        contact.name || "Unnamed Contact"
    );

    const phone = createElement(
        "p",
        "contact-phone",
        formatPhone(contact.phone)
    );

    information.append(name, phone);

    if (contact.email) {
        information.appendChild(
            createElement(
                "p",
                "contact-email",
                contact.email
            )
        );
    }

    const actions = createContactActions(contact);

    topSection.append(
        avatar,
        information,
        actions
    );

    const category = createElement(
        "span",
        "contact-category",
        contact.category || "Other"
    );

    card.append(
        topSection,
        category
    );

    if (contact.notes) {
        card.appendChild(
            createElement(
                "p",
                "contact-notes",
                contact.notes
            )
        );
    }

    return card;
}


function createContactActions(contact) {
    const actions = document.createElement("div");
    actions.className = "contact-actions";

    const favoriteButton = createActionButton(
        contact.favorite ? "★" : "☆",
        "favorite-button",
        contact.favorite
            ? "Remove from favorites"
            : "Add to favorites",
        () => toggleFavorite(contact.id)
    );

    const editButton = createActionButton(
        "✎",
        "",
        "Edit contact",
        () => openContactModal(contact.id)
    );

    const deleteButton = createActionButton(
        "×",
        "delete-button",
        "Delete contact",
        () => openDeleteModal(contact.id)
    );

    actions.append(
        favoriteButton,
        editButton,
        deleteButton
    );

    return actions;
}


function createActionButton(
    text,
    className,
    ariaLabel,
    handler
) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = `icon-button ${className}`.trim();
    button.textContent = text;
    button.setAttribute("aria-label", ariaLabel);

    button.addEventListener("click", handler);

    return button;
}


function createElement(tag, className, text) {
    const element = document.createElement(tag);

    element.className = className;
    element.textContent = text;

    return element;
}


/* =========================================
   FAVORITES
========================================= */

async function toggleFavorite(id) {
    try {
        const data = await apiRequest(
            `/contacts/${id}/favorite`,
            {
                method: "PATCH"
            }
        );

        await loadContacts();

        showToast(
            data.message || "Favorite updated",
            "success"
        );
    } catch (error) {
        showToast(
            error.message ||
            "Unable to update favorite",
            "error"
        );

        console.error(
            "Favorite update error:",
            error
        );
    }
}


/* =========================================
   DELETE CONTACT
========================================= */

function openDeleteModal(id) {
    const contact = findContactById(id);

    if (!contact) {
        showToast("Contact not found", "error");
        return;
    }

    state.pendingDeleteId = id;

    if ($("deleteName")) {
        $("deleteName").textContent =
            contact.name;
    }

    $("deleteModal")?.classList.add("active");

    document.body.classList.add("modal-open");
}


function closeDeleteModal() {
    $("deleteModal")?.classList.remove("active");

    state.pendingDeleteId = null;

    updateBodyModalState();
}


async function confirmDelete() {
    const id = state.pendingDeleteId;

    if (id === null || id === undefined) {
        return;
    }

    try {
        const data = await apiRequest(
            `/contacts/${id}`,
            {
                method: "DELETE"
            }
        );

        closeDeleteModal();

        showToast(
            data.message ||
            "Contact deleted successfully",
            "success"
        );

        await loadContacts();
    } catch (error) {
        showToast(
            error.message ||
            "Unable to delete contact",
            "error"
        );

        console.error(
            "Delete contact error:",
            error
        );
    }
}


/* =========================================
   SEARCH
========================================= */

function searchContacts() {
    renderContacts();
}


function clearSearch() {
    const searchInput = $("searchInput");

    if (!searchInput) {
        return;
    }

    searchInput.value = "";

    renderContacts();

    searchInput.focus();
}


/* =========================================
   CATEGORY FILTER
========================================= */

function filterContacts(category, button) {
    state.activeFilter = category;

    $$(".filter").forEach(filterButton => {
        filterButton.classList.remove("active");
    });

    button?.classList.add("active");

    renderContacts();
}


/* =========================================
   STATISTICS
========================================= */

function updateStatistics() {
    const total =
        state.contacts.length;

    const favorites =
        state.contacts.filter(
            contact => contact.favorite
        ).length;

    const categories =
        new Set(
            state.contacts.map(
                contact =>
                    contact.category || "Other"
            )
        ).size;

    if ($("totalContacts")) {
        $("totalContacts").textContent = total;
    }

    if ($("favoriteContacts")) {
        $("favoriteContacts").textContent =
            favorites;
    }

    if ($("totalCategories")) {
        $("totalCategories").textContent =
            categories;
    }
}


/* =========================================
   EMPTY STATE
========================================= */

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


/* =========================================
   CONTACT HELPERS
========================================= */

function findContactById(id) {
    return state.contacts.find(
        contact =>
            String(contact.id) === String(id)
    );
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
        return words[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


function normalizePhone(phone) {
    return String(phone || "")
        .replace(/\D/g, "");
}


function formatPhone(phone) {
    const digits = normalizePhone(phone);

    if (digits.length === 10) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }

    return phone || "No phone number";
}


/* =========================================
   VALIDATION HELPERS
========================================= */

function isValidPhone(phone) {
    const digits = normalizePhone(phone);

    return (
        digits.length >= 7 &&
        digits.length <= 15
    );
}


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );
}


/* =========================================
   MODAL BODY STATE
========================================= */

function updateBodyModalState() {
    const contactModalOpen =
        $("contactModal")?.classList.contains("active");

    const deleteModalOpen =
        $("deleteModal")?.classList.contains("active");

    document.body.classList.toggle(
        "modal-open",
        Boolean(
            contactModalOpen ||
            deleteModalOpen
        )
    );
}


/* =========================================
   TOAST
========================================= */

function showToast(
    message,
    type = "success"
) {
    const toast = $("toast");

    if (!toast) {
        return;
    }

    clearTimeout(state.toastTimer);

    if ($("toastMessage")) {
        $("toastMessage").textContent =
            message;
    }

    if ($("toastIcon")) {
        $("toastIcon").textContent =
            type === "error"
                ? "!"
                : "✓";
    }

    toast.classList.remove(
        "success",
        "error"
    );

    toast.classList.add(
        type,
        "show"
    );

    state.toastTimer =
        window.setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
}


/* =========================================
   GLOBAL FUNCTIONS
   Required by HTML onclick attributes
========================================= */

window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;

window.searchContacts = searchContacts;
window.clearSearch = clearSearch;

window.filterContacts = filterContacts;

window.toggleFavorite = toggleFavorite;

window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
```
