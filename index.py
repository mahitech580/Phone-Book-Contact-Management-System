from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import uuid
from datetime import datetime

phone_book = {}


def make_id():
    return str(uuid.uuid4())


def send_json(handler, data, status=200):
    response = json.dumps(data).encode("utf-8")

    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(response)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    )
    handler.send_header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    )
    handler.end_headers()
    handler.wfile.write(response)


def read_json(handler):
    try:
        length = int(handler.headers.get("Content-Length", 0))
        body = handler.rfile.read(length)

        if not body:
            return {}

        return json.loads(body.decode("utf-8"))
    except (ValueError, json.JSONDecodeError):
        return {}


class PhoneBookHandler(SimpleHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        )
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/api/contacts":
            send_json(self, {
                "success": True,
                "contacts": list(phone_book.values())
            })
            return

        if path == "/api/stats":
            favorites = sum(
                1
                for contact in phone_book.values()
                if contact.get("favorite", False)
            )

            categories = {
                contact.get("category", "Other")
                for contact in phone_book.values()
            }

            send_json(self, {
                "success": True,
                "totalContacts": len(phone_book),
                "favoriteContacts": favorites,
                "totalCategories": len(categories)
            })
            return

        if path == "/api/search":
            value = query.get("q", [""])[0].strip().lower()

            if not value:
                results = list(phone_book.values())
            else:
                results = []

                for contact in phone_book.values():
                    searchable = " ".join([
                        contact.get("name", ""),
                        contact.get("phone", ""),
                        contact.get("email", ""),
                        contact.get("category", ""),
                        contact.get("notes", "")
                    ]).lower()

                    if value in searchable:
                        results.append(contact)

            send_json(self, {
                "success": True,
                "contacts": results
            })
            return

        if path == "/api/contacts/favorites":
            results = [
                contact
                for contact in phone_book.values()
                if contact.get("favorite", False)
            ]

            send_json(self, {
                "success": True,
                "contacts": results
            })
            return

        if path.startswith("/api/contacts/"):
            contact_id = path.split("/")[-1]
            contact = phone_book.get(contact_id)

            if contact is None:
                send_json(self, {
                    "success": False,
                    "message": "Contact not found"
                }, 404)
                return

            send_json(self, {
                "success": True,
                "contact": contact
            })
            return

        if path == "/api":
            send_json(self, {
                "success": True,
                "message": "3D Phone Book API",
                "storage": "Python Dictionary",
                "contacts": len(phone_book)
            })
            return

        SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path != "/api/contacts":
            send_json(self, {
                "success": False,
                "message": "Endpoint not found"
            }, 404)
            return

        data = read_json(self)

        name = str(data.get("name", "")).strip()
        phone = str(data.get("phone", "")).strip()
        email = str(data.get("email", "")).strip()
        category = str(data.get("category", "Other")).strip()
        notes = str(data.get("notes", "")).strip()

        if not name:
            send_json(self, {
                "success": False,
                "message": "Name is required"
            }, 400)
            return

        if not phone:
            send_json(self, {
                "success": False,
                "message": "Phone number is required"
            }, 400)
            return

        digits = "".join(
            character
            for character in phone
            if character.isdigit()
        )

        if len(digits) < 7 or len(digits) > 15:
            send_json(self, {
                "success": False,
                "message": "Invalid phone number"
            }, 400)
            return

        for contact in phone_book.values():
            existing = "".join(
                character
                for character in contact["phone"]
                if character.isdigit()
            )

            if existing == digits:
                send_json(self, {
                    "success": False,
                    "message": "Phone number already exists"
                }, 409)
                return

        contact_id = make_id()

        contact = {
            "id": contact_id,
            "name": name,
            "phone": phone,
            "email": email,
            "category": category,
            "notes": notes,
            "favorite": False,
            "createdAt": datetime.now().isoformat()
        }

        phone_book[contact_id] = contact

        send_json(self, {
            "success": True,
            "message": "Contact added successfully",
            "contact": contact
        }, 201)

    def do_PUT(self):
        prefix = "/api/contacts/"

        if not self.path.startswith(prefix):
            send_json(self, {
                "success": False,
                "message": "Endpoint not found"
            }, 404)
            return

        contact_id = self.path[len(prefix):]
        contact = phone_book.get(contact_id)

        if contact is None:
            send_json(self, {
                "success": False,
                "message": "Contact not found"
            }, 404)
            return

        data = read_json(self)

        name = str(data.get("name", "")).strip()
        phone = str(data.get("phone", "")).strip()
        email = str(data.get("email", "")).strip()
        category = str(data.get("category", "Other")).strip()
        notes = str(data.get("notes", "")).strip()

        if not name or not phone:
            send_json(self, {
                "success": False,
                "message": "Name and phone are required"
            }, 400)
            return

        digits = "".join(
            character
            for character in phone
            if character.isdigit()
        )

        if len(digits) < 7 or len(digits) > 15:
            send_json(self, {
                "success": False,
                "message": "Invalid phone number"
            }, 400)
            return

        for other_id, other in phone_book.items():
            if other_id == contact_id:
                continue

            existing = "".join(
                character
                for character in other["phone"]
                if character.isdigit()
            )

            if existing == digits:
                send_json(self, {
                    "success": False,
                    "message": "Phone number already exists"
                }, 409)
                return

        contact["name"] = name
        contact["phone"] = phone
        contact["email"] = email
        contact["category"] = category
        contact["notes"] = notes
        contact["updatedAt"] = datetime.now().isoformat()

        if "favorite" in data:
            contact["favorite"] = bool(data["favorite"])

        send_json(self, {
            "success": True,
            "message": "Contact updated successfully",
            "contact": contact
        })

    def do_PATCH(self):
        suffix = "/favorite"

        if not self.path.endswith(suffix):
            send_json(self, {
                "success": False,
                "message": "Endpoint not found"
            }, 404)
            return

        contact_id = self.path[
            len("/api/contacts/"):
            -len(suffix)
        ]

        contact = phone_book.get(contact_id)

        if contact is None:
            send_json(self, {
                "success": False,
                "message": "Contact not found"
            }, 404)
            return

        contact["favorite"] = not contact.get("favorite", False)

        send_json(self, {
            "success": True,
            "message": "Favorite status updated",
            "contact": contact
        })

    def do_DELETE(self):
        prefix = "/api/contacts/"

        if self.path == "/api/contacts":
            phone_book.clear()

            send_json(self, {
                "success": True,
                "message": "All contacts deleted"
            })
            return

        if not self.path.startswith(prefix):
            send_json(self, {
                "success": False,
                "message": "Endpoint not found"
            }, 404)
            return

        contact_id = self.path[len(prefix):]

        if contact_id not in phone_book:
            send_json(self, {
                "success": False,
                "message": "Contact not found"
            }, 404)
            return

        deleted = phone_book.pop(contact_id)

        send_json(self, {
            "success": True,
            "message": "Contact deleted successfully",
            "contact": deleted
        })


if __name__ == "__main__":
    server = HTTPServer(
        ("127.0.0.1", 8000),
        PhoneBookHandler
    )

    print("=" * 55)
    print("              3D PHONE BOOK")
    print("=" * 55)
    print("Backend:    Plain Python")
    print("Storage:    Python Dictionary")
    print("Server:     http://127.0.0.1:8000")
    print("API:        http://127.0.0.1:8000/api")
    print("Contacts:   0")
    print("=" * 55)
    print("Press CTRL+C to stop the server.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
        print("\nServer stopped.")
