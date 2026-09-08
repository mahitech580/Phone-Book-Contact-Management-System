Phone Book — Contact Management System

A modern, futuristic **3D Phone Book / Contact Management System** built with **HTML, CSS, JavaScript, and pure Python**.

The application provides an attractive 3D-style interface for managing personal contacts with features such as adding, editing, searching, categorizing, favoriting, and deleting contacts.

## 🚀 Live Demo

🔗 **[3D Phone Book](https://mahitech580.github.io/Phone-Book-Contact-Management-System/)**

> **Note:** The GitHub Pages version provides the frontend interface. The Python backend must be running locally for full contact-management functionality.

---

## ✨ Features

* 📇 Add new contacts
* ✏️ Edit existing contacts
* 🗑️ Delete contacts
* ⭐ Mark contacts as favorites
* 🔍 Search contacts instantly
* 🏷️ Categorize contacts

  * Family
  * Friends
  * Work
  * Other
* 📧 Store email addresses
* 📝 Add contact notes
* 📊 Real-time contact statistics
* 🔢 Contact count
* 🎨 Futuristic 3D interface
* 📱 Responsive design
* ⚡ Fast client-side interactions
* 🐍 Pure Python backend
* 💾 In-memory Python dictionary storage
* 🔌 REST-style API endpoints
* 🚫 No Flask
* 🚫 No external database
* 🚫 No external frontend framework

---

## 🛠️ Technologies Used

### Frontend

* **HTML5**
* **CSS3**
* **JavaScript (ES6+)**

### Backend

* **Python 3**
* `http.server`
* `json`
* `uuid`
* `datetime`

### Storage

Contacts are stored in a Python dictionary:

```python
phone_book = {}
```

No MySQL, MongoDB, PostgreSQL, Firebase, or other external database is required.

---

## 🏗️ Project Structure

```text
Phone-Book-Contact-Management-System/
│
├── index.html      # Main application interface
├── index.css       # 3D UI and responsive styling
├── index.js        # Frontend logic and API communication
├── index.py        # Python HTTP server and contact API
└── README.md       # Project documentation
```

---

## 🔄 How It Works

The project follows a simple architecture:

```text
┌──────────────────────┐
│      index.html      │
│     User Interface   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       index.css      │
│    3D / Responsive   │
│        Design        │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│       index.js       │
│  Application Logic   │
│     & API Calls      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       index.py       │
│   Python HTTP API    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Python Dictionary  │
│    Contact Storage   │
└──────────────────────┘
```

---

## ⚙️ Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/mahitech580/Phone-Book-Contact-Management-System.git
```

### 2. Open the project

```bash
cd Phone-Book-Contact-Management-System
```

### 3. Start the Python server

Make sure Python 3 is installed.

```bash
python index.py
```

You should see:

```text
=======================================================
              3D PHONE BOOK
=======================================================
Backend:    Plain Python
Storage:    Python Dictionary
Server:     http://127.0.0.1:8000
API:        http://127.0.0.1:8000/api
Contacts:   0
=======================================================
Press CTRL+C to stop the server.
```

### 4. Open the application

Open:

```text
http://127.0.0.1:8000
```

### ⚠️ Important

Do **not** open `index.html` directly using `file://`.

The application needs the Python HTTP server to communicate with the backend.

---

## 🔌 API Endpoints

The Python backend provides several endpoints.

| Method   | Endpoint                      | Purpose                |
| -------- | ----------------------------- | ---------------------- |
| `GET`    | `/api`                        | API information        |
| `GET`    | `/api/contacts`               | Get all contacts       |
| `GET`    | `/api/stats`                  | Get contact statistics |
| `GET`    | `/api/search?q=`              | Search contacts        |
| `GET`    | `/api/contacts/favorites`     | Get favorite contacts  |
| `GET`    | `/api/contacts/{id}`          | Get a specific contact |
| `POST`   | `/api/contacts`               | Create a contact       |
| `PUT`    | `/api/contacts/{id}`          | Update a contact       |
| `PATCH`  | `/api/contacts/{id}/favorite` | Toggle favorite        |
| `DELETE` | `/api/contacts/{id}`          | Delete a contact       |
| `DELETE` | `/api/contacts`               | Delete all contacts    |

---

## 📋 Contact Information

Each contact can contain:

```text
Name
Phone Number
Email
Category
Notes
Favorite Status
Created Date
Updated Date
```

---

## 🎨 UI Highlights

The interface includes:

* 🌌 Animated futuristic background
* 💎 Glassmorphism-style cards
* 📱 3D phone visualization
* ✨ Neon-style interface elements
* 🔎 Interactive search
* 🏷️ Category filters
* ⭐ Favorite system
* 🪟 Modal-based contact forms
* 🔔 Toast notifications
* 📱 Responsive mobile layout

---

## 💡 Why This Project?

This project demonstrates how a web frontend can communicate with a **custom Python HTTP server without using Flask or another backend framework**.

It combines:

* Frontend development
* JavaScript DOM manipulation
* REST-style API communication
* Python HTTP handling
* Dictionary-based data structures
* CRUD operations
* Responsive UI design

---

## ⚠️ Data Storage Limitation

The current version stores contacts in a Python dictionary:

```python
phone_book = {}
```

Therefore, contacts are stored **only while the Python server is running**.

If the Python server is stopped or restarted, the contacts are lost.

### Future improvement

Persistent storage could be added using:

* JSON file
* SQLite
* MySQL
* PostgreSQL

without changing the overall frontend architecture significantly.

---

## 🔮 Future Enhancements

Possible future improvements include:

* 🔐 User authentication
* 💾 Persistent contact storage
* 📤 Import contacts
* 📥 Export contacts
* 🖼️ Contact profile pictures
* 📞 One-click calling
* 📧 One-click email
* 🌙 Multiple themes
* 🔔 Contact reminders
* ☁️ Cloud synchronization
* 📱 Progressive Web App support
* 🤖 AI-powered contact organization

---

## 📸 Project Preview

### 3D Phone Book

🔗 **[Open Live Demo](https://mahitech580.github.io/Phone-Book-Contact-Management-System/)**

---

## 👨‍💻 Author

**Mahendra**

B.Tech — Computer Science & Engineering

GitHub: **[@mahitech580](https://github.com/mahitech580)**

---

## 📄 License

This project is open-source and available for learning, personal projects, and portfolio use.

---

⭐ If you find this project useful, consider giving the repository a star!
