# Phone Book — Contact Management System

A modern **3D Contact Management System** built with **HTML, CSS, JavaScript, and pure Python**.

The application provides a futuristic interface for managing contacts through a lightweight Python HTTP API. Users can add, update, search, categorize, favorite, and delete contacts without requiring Flask, Django, or an external database.

## 🚀 Live Demo

🔗 **[Open 3D Phone Book](https://mahitech580.github.io/Phone-Book-Contact-Management-System/)**

> **Note:** GitHub Pages hosts the frontend only. The Python backend must be running locally to perform contact-management operations.

---

## ✨ Features

* 📇 Add contacts
* ✏️ Edit existing contacts
* 🗑️ Delete contacts
* ⭐ Add or remove favorites
* 🔍 Search by name, phone, email, category, or notes
* 🏷️ Filter contacts by category

  * Family
  * Friends
  * Work
  * Other
* 📧 Store email addresses
* 📝 Add notes to contacts
* 📊 Display contact statistics
* 🔢 Show total visible contacts
* 🎨 Futuristic glass-style 3D interface
* 📱 Responsive layout for desktop, tablet, and mobile
* 🔔 Toast notifications
* 🪟 Modal-based forms
* ⌨️ Escape-key modal handling
* ✅ Client-side and server-side validation
* 🔌 REST-style Python API
* 🐍 Pure Python backend
* 💾 In-memory dictionary storage
* 🚫 No Flask
* 🚫 No external database
* 🚫 No frontend framework

---

## 🛠️ Technologies

### Frontend

* **HTML5**
* **CSS3**
* **JavaScript (ES6+)**
* Fetch API
* DOM manipulation
* Responsive CSS

### Backend

* **Python 3**
* `http.server`
* `json`
* `uuid`
* `datetime`
* `urllib.parse`

### Storage

Contacts are maintained in an in-memory Python dictionary:

```python
phone_book = {}
```

No MySQL, MongoDB, PostgreSQL, Firebase, or other external database is required.

---

## 🏗️ Project Structure

```text
Phone-Book-Contact-Management-System/
│
├── index.html      # Application interface
├── index.css       # Styling, 3D effects and responsive layout
├── index.js        # Frontend state, UI and API communication
├── index.py        # Python HTTP server and REST-style API
└── README.md       # Project documentation
```

---

## 🧩 Architecture

The application follows a simple frontend-to-backend architecture:

```text
┌──────────────────────────┐
│        index.html        │
│      UI Components       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│        index.css         │
│  Responsive 3D Styling   │
└──────────────────────────┘
             │
             ▼
┌──────────────────────────┐
│         index.js         │
│  State + DOM + Fetch API │
└────────────┬─────────────┘
             │
             │ HTTP / JSON
             ▼
┌──────────────────────────┐
│         index.py         │
│     Python HTTP API      │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     Python Dictionary    │
│      In-Memory Data      │
└──────────────────────────┘
```

---

## 🔄 Application Flow

### Adding a Contact

```text
User
 ↓
Contact Form
 ↓
JavaScript Validation
 ↓
POST /api/contacts
 ↓
Python API
 ↓
Dictionary Storage
 ↓
JSON Response
 ↓
UI Refresh
```

### Editing a Contact

```text
User
 ↓
Edit Contact
 ↓
PUT /api/contacts/{id}
 ↓
Python API
 ↓
Update Contact
 ↓
JSON Response
 ↓
UI Refresh
```

### Deleting a Contact

```text
User
 ↓
Delete Confirmation
 ↓
DELETE /api/contacts/{id}
 ↓
Python API
 ↓
Remove Contact
 ↓
UI Refresh
```

---

# ⚙️ Run Locally

## 1. Clone the repository

```bash
git clone https://github.com/mahitech580/Phone-Book-Contact-Management-System.git
```

## 2. Open the project

```bash
cd Phone-Book-Contact-Management-System
```

## 3. Start the Python server

Make sure Python 3 is installed.

```bash
python index.py
```

You should see something similar to:

```text
============================================================
               PHONE BOOK SYSTEM
============================================================
Host:        127.0.0.1
Port:        8000
Application: http://127.0.0.1:8000
API:         http://127.0.0.1:8000/api
Backend:     Python HTTP Server
Storage:     In-Memory Dictionary
Status:      Running
============================================================
Press CTRL+C to stop the server.
```

## 4. Open the application

Visit:

```text
http://127.0.0.1:8000
```

### ⚠️ Important

Do **not** open `index.html` directly with:

```text
file://
```

Run the Python server first so the frontend can communicate with the API.

---

# 🔌 API Endpoints

| Method   | Endpoint                      | Description                      |
| -------- | ----------------------------- | -------------------------------- |
| `GET`    | `/api`                        | API status and basic information |
| `GET`    | `/api/contacts`               | Get all contacts                 |
| `GET`    | `/api/contacts/{id}`          | Get one contact                  |
| `GET`    | `/api/stats`                  | Get contact statistics           |
| `GET`    | `/api/search?q=`              | Search contacts                  |
| `GET`    | `/api/contacts/favorites`     | Get favorite contacts            |
| `POST`   | `/api/contacts`               | Create a contact                 |
| `PUT`    | `/api/contacts/{id}`          | Update a contact                 |
| `PATCH`  | `/api/contacts/{id}/favorite` | Toggle favorite status           |
| `DELETE` | `/api/contacts/{id}`          | Delete one contact               |
| `DELETE` | `/api/contacts`               | Delete all contacts              |

---

# 📋 Contact Data

A contact can contain:

```text
ID
Name
Phone Number
Email
Category
Notes
Favorite Status
Created Date
Updated Date
```

Example:

```json
{
    "id": "contact-id",
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "category": "Friends",
    "notes": "College friend",
    "favorite": true,
    "createdAt": "2026-09-16T00:30:00",
    "updatedAt": "2026-09-16T00:35:00"
}
```

---

# ✅ Validation

The application performs validation on both the frontend and backend.

### Name

* Required
* Minimum 2 characters

### Phone Number

* Required
* 7–15 numeric digits
* Duplicate phone numbers are rejected

### Email

* Optional
* Basic email-format validation on the frontend

This prevents common invalid inputs before they are stored.

---

# 🎨 UI Highlights

The interface includes:

* 🌌 Animated background orbs
* 💎 Glassmorphism-style surfaces
* 📱 3D phone visualization
* ✨ Neon-inspired accents
* 🔎 Live contact search
* 🏷️ Category filters
* ⭐ Favorite contacts
* 🪟 Add/edit/delete modals
* 🔔 Toast notifications
* 📊 Live dashboard statistics
* 📱 Mobile-responsive layout
* ♿ Reduced-motion support

---

# 💡 What This Project Demonstrates

This project demonstrates how a frontend application can communicate with a custom Python HTTP server without relying on a backend framework.

It covers:

* HTML page structure
* Responsive CSS
* JavaScript state management
* DOM manipulation
* Fetch API
* JSON-based communication
* REST-style API design
* CRUD operations
* HTTP methods
* Request validation
* Error handling
* Python HTTP request handling
* UUID-based identifiers
* Dictionary-based data storage
* Responsive UI development

---

# ⚠️ Storage Limitation

The current implementation stores contacts in memory:

```python
phone_book = {}
```

This means contact data is lost whenever the Python server stops or restarts.

This is intentional for the current lightweight implementation.

## Future storage options

The backend can later be extended to use:

* JSON file storage
* SQLite
* MySQL
* PostgreSQL

The frontend API architecture can remain largely unchanged while replacing the storage layer.

---

# 🔮 Future Enhancements

Potential improvements include:

* 🔐 User authentication
* 💾 Persistent database storage
* 📤 CSV contact import
* 📥 CSV contact export
* 🖼️ Contact profile images
* 📞 One-click calling
* 📧 One-click email
* 🌙 Theme switching
* 🔔 Contact reminders
* ☁️ Cloud synchronization
* 📱 Progressive Web App support
* 🤖 AI-assisted contact organization
* 🧪 Automated API testing

---

# 📸 Project

### 3D Phone Book

🔗 **[View Live Demo](https://mahitech580.github.io/Phone-Book-Contact-Management-System/)**

---

# 👨‍💻 Author

**Mahendra Sai Kondaveeti**

B.Tech — Computer Science & Engineering

GitHub: **[@mahitech580](https://github.com/mahitech580)**

---

# 📄 License

This project is open-source and available for learning, personal projects, and portfolio use.

---

⭐ **If you find the project useful, consider starring the repository!**
