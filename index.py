
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime
import json
import uuid


# =========================================
# APPLICATION STATE
# =========================================

phone_book = {}


# =========================================
# CONSTANTS
# =========================================

HOST = "127.0.0.1"
PORT = 8000

API_PREFIX = "/api"
CONTACTS_ENDPOINT = "/api/contacts"


# =========================================
# ID / TIME HELPERS
# =========================================

def generate_id():
    """Generate a unique identifier for a contact."""
    return str(uuid.uuid4())


def current_timestamp():
    """Return the current timestamp in ISO format."""
    return datetime.now().isoformat()


# =========================================
# HTTP RESPONSE HELPERS
# =========================================

def send_json(handler, payload, status=200):
    """Send a JSON response to the client."""

    body = json.dumps(
        payload,
        ensure_ascii=False
    ).encode("utf-8")

    handler.send_response(status)

    handler.send_header(
        "Content-Type",
        "application/json; charset=utf-8"
    )

    handler.send_header(
        "Content-Length",
        str(len(body))
    )

    handler.send_header(
        "Access-Control-Allow-Origin",
        "*"
    )

    handler.send_header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    )

    handler.send_header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    )

    handler.end_headers()

    handler.wfile.write(body)


def send_error_response(handler, message, status=400):
    """Send a consistent API error response."""

    send_json(
        handler,
        {
            "success": False,
            "message": message
        },
        status
    )


# =========================================
# REQUEST BODY
# =========================================

def read_json(handler):
    """Read and decode a JSON request body."""

    try:
        content_length = int(
            handler.headers.get(
                "Content-Length",
                0
            )
        )
    except (TypeError, ValueError):
        return None

    if content_length <= 0:
        return {}

    try:
        body = handler.rfile.read(
            content_length
        )

        if not body:
            return {}

        return json.loads(
            body.decode("utf-8")
        )

    except (
        UnicodeDecodeError,
        json.JSONDecodeError
    ):
        return None


# =========================================
# DATA HELPERS
# =========================================

def normalize_phone(phone):
    """Keep only numeric characters from a phone number."""

    return "".join(
        character
        for character in str(phone)
        if character.isdigit()
    )


def validate_phone(phone):
    """Validate a phone number using its digits."""

    digits = normalize_phone(phone)

    return (
        len(digits) >= 7 and
        len(digits) <= 15
    )


def normalize_text(value):
    """Convert a value into clean text."""

    return str(value or "").strip()


def find_contact(contact_id):
    """Return a contact by ID."""

    return phone_book.get(contact_id)


def phone_exists(phone, exclude_id=None):
    """Check whether a phone number is already registered."""

    target = normalize_phone(phone)

    for contact_id, contact in phone_book.items():

        if exclude_id and contact_id == exclude_id:
            continue

        existing = normalize_phone(
            contact.get("phone", "")
        )

        if existing == target:
            return True

    return False


def build_contact(data, existing=None):
    """Create or update contact data."""

    contact = existing or {
        "id": generate_id(),
        "favorite": False,
        "createdAt": current_timestamp()
    }

    contact["name"] = normalize_text(
        data.get("name")
    )

    contact["phone"] = normalize_text(
        data.get("phone")
    )

    contact["email"] = normalize_text(
        data.get("email")
    )

    contact["category"] = (
        normalize_text(
            data.get("category")
        )
        or "Other"
    )

    contact["notes"] = normalize_text(
        data.get("notes")
    )

    return contact


# =========================================
# REQUEST HANDLER
# =========================================

class PhoneBookHandler(
    SimpleHTTPRequestHandler
):

    # -----------------------------------------
    # CORS
    # -----------------------------------------

    def do_OPTIONS(self):
        self.send_response(204)

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.end_headers()


    # -----------------------------------------
    # GET
    # -----------------------------------------

    def do_GET(self):

        parsed_url = urlparse(self.path)

        path = parsed_url.path
        query = parse_qs(
            parsed_url.query
        )


        # GET /api
        if path == API_PREFIX:

            send_json(
                self,
                {
                    "success": True,
                    "message": "Phone Book API is running",
                    "storage": "Python Dictionary",
                    "contacts": len(phone_book)
                }
            )

            return


        # GET /api/contacts
        if path == CONTACTS_ENDPOINT:

            send_json(
                self,
                {
                    "success": True,
                    "contacts": list(
                        phone_book.values()
                    )
                }
            )

            return


        # GET /api/stats
        if path == "/api/stats":

            send_json(
                self,
                get_statistics()
            )

            return


        # GET /api/search?q=value
        if path == "/api/search":

            search_value = normalize_text(
                query.get(
                    "q",
                    [""]
                )[0]
            ).lower()

            results = search_contacts(
                search_value
            )

            send_json(
                self,
                {
                    "success": True,
                    "contacts": results
                }
            )

            return


        # GET /api/contacts/favorites
        if path == "/api/contacts/favorites":

            favorites = [
                contact
                for contact in phone_book.values()
                if contact.get("favorite", False)
            ]

            send_json(
                self,
                {
                    "success": True,
                    "contacts": favorites
                }
            )

            return


        # GET /api/contacts/<id>
        if path.startswith(
            f"{CONTACTS_ENDPOINT}/"
        ):

            contact_id = path[
                len(CONTACTS_ENDPOINT) + 1:
            ]

            contact = find_contact(
                contact_id
            )

            if contact is None:
                send_error_response(
                    self,
                    "Contact not found",
                    404
                )
                return

            send_json(
                self,
                {
                    "success": True,
                    "contact": contact
                }
            )

            return


        # Static files
        SimpleHTTPRequestHandler.do_GET(
            self
        )


    # -----------------------------------------
    # POST
    # -----------------------------------------

    def do_POST(self):

        if self.path != CONTACTS_ENDPOINT:
            send_error_response(
                self,
                "Endpoint not found",
                404
            )
            return

        data = read_json(self)

        if data is None:
            send_error_response(
                self,
                "Invalid JSON request body",
                400
            )
            return

        name = normalize_text(
            data.get("name")
        )

        phone = normalize_text(
            data.get("phone")
        )

        if not name:
            send_error_response(
                self,
                "Name is required",
                400
            )
            return

        if len(name) < 2:
            send_error_response(
                self,
                "Name must contain at least 2 characters",
                400
            )
            return

        if not phone:
            send_error_response(
                self,
                "Phone number is required",
                400
            )
            return

        if not validate_phone(phone):
            send_error_response(
                self,
                "Invalid phone number",
                400
            )
            return

        if phone_exists(phone):
            send_error_response(
                self,
                "Phone number already exists",
                409
            )
            return

        contact = build_contact(
            data
        )

        phone_book[
            contact["id"]
        ] = contact

        send_json(
            self,
            {
                "success": True,
                "message": "Contact added successfully",
                "contact": contact
            },
            201
        )


    # -----------------------------------------
    # PUT
    # -----------------------------------------

    def do_PUT(self):

        contact_id = extract_contact_id(
            self.path
        )

        if not contact_id:
            send_error_response(
                self,
                "Endpoint not found",
                404
            )
            return

        contact = find_contact(
            contact_id
        )

        if contact is None:
            send_error_response(
                self,
                "Contact not found",
                404
            )
            return

        data = read_json(self)

        if data is None:
            send_error_response(
                self,
                "Invalid JSON request body",
                400
            )
            return

        name = normalize_text(
            data.get("name")
        )

        phone = normalize_text(
            data.get("phone")
        )

        if not name:
            send_error_response(
                self,
                "Name is required",
                400
            )
            return

        if len(name) < 2:
            send_error_response(
                self,
                "Name must contain at least 2 characters",
                400
            )
            return

        if not phone:
            send_error_response(
                self,
                "Phone number is required",
                400
            )
            return

        if not validate_phone(phone):
            send_error_response(
                self,
                "Invalid phone number",
                400
            )
            return

        if phone_exists(
            phone,
            exclude_id=contact_id
        ):
            send_error_response(
                self,
                "Phone number already exists",
                409
            )
            return

        build_contact(
            data,
            existing=contact
        )

        contact["updatedAt"] = (
            current_timestamp()
        )

        if "favorite" in data:
            contact["favorite"] = bool(
                data["favorite"]
            )

        send_json(
            self,
            {
                "success": True,
                "message": "Contact updated successfully",
                "contact": contact
            }
        )


    # -----------------------------------------
    # PATCH
    # -----------------------------------------

    def do_PATCH(self):

        favorite_suffix = "/favorite"

        if not self.path.startswith(
            f"{CONTACTS_ENDPOINT}/"
        ) or not self.path.endswith(
            favorite_suffix
        ):
            send_error_response(
                self,
                "Endpoint not found",
                404
            )
            return

        contact_id = self.path[
            len(CONTACTS_ENDPOINT) + 1:
            -len(favorite_suffix)
        ]

        contact = find_contact(
            contact_id
        )

        if contact is None:
            send_error_response(
                self,
                "Contact not found",
                404
            )
            return

        contact["favorite"] = not contact.get(
            "favorite",
            False
        )

        contact["updatedAt"] = (
            current_timestamp()
        )

        message = (
            "Added to favorites"
            if contact["favorite"]
            else "Removed from favorites"
        )

        send_json(
            self,
            {
                "success": True,
                "message": message,
                "contact": contact
            }
        )


    # -----------------------------------------
    # DELETE
    # -----------------------------------------

    def do_DELETE(self):

        # DELETE /api/contacts
        if self.path == CONTACTS_ENDPOINT:

            deleted_count = len(
                phone_book
            )

            phone_book.clear()

            send_json(
                self,
                {
                    "success": True,
                    "message": "All contacts deleted",
                    "deleted": deleted_count
                }
            )

            return


        # DELETE /api/contacts/<id>
        contact_id = extract_contact_id(
            self.path
        )

        if not contact_id:
            send_error_response(
                self,
                "Endpoint not found",
                404
            )
            return

        contact = find_contact(
            contact_id
        )

        if contact is None:
            send_error_response(
                self,
                "Contact not found",
                404
            )
            return

        deleted_contact = phone_book.pop(
            contact_id
        )

        send_json(
            self,
            {
                "success": True,
                "message": "Contact deleted successfully",
                "contact": deleted_contact
            }
        )


# =========================================
# CONTACT ROUTING HELPERS
# =========================================

def extract_contact_id(path):
    """
    Extract the contact ID from:
    /api/contacts/<id>
    """

    prefix = f"{CONTACTS_ENDPOINT}/"

    if not path.startswith(prefix):
        return None

    contact_id = path[
        len(prefix):
    ]

    if not contact_id:
        return None

    return contact_id


# =========================================
# SEARCH / STATISTICS
# =========================================

def search_contacts(search_value):
    """Search contacts across common contact fields."""

    if not search_value:
        return list(
            phone_book.values()
        )

    results = []

    for contact in phone_book.values():

        searchable_text = " ".join([
            normalize_text(
                contact.get("name")
            ),
            normalize_text(
                contact.get("phone")
            ),
            normalize_text(
                contact.get("email")
            ),
            normalize_text(
                contact.get("category")
            ),
            normalize_text(
                contact.get("notes")
            )
        ]).lower()

        if search_value in searchable_text:
            results.append(contact)

    return results


def get_statistics():
    """Build dashboard statistics."""

    total_contacts = len(
        phone_book
    )

    favorite_contacts = sum(
        1
        for contact in phone_book.values()
        if contact.get("favorite", False)
    )

    categories = {
        contact.get(
            "category",
            "Other"
        )
        for contact in phone_book.values()
    }

    return {
        "success": True,
        "totalContacts": total_contacts,
        "favoriteContacts": favorite_contacts,
        "totalCategories": len(categories)
    }


# =========================================
# SERVER STARTUP
# =========================================

def start_server():
    """Create and start the HTTP server."""

    server = HTTPServer(
        (HOST, PORT),
        PhoneBookHandler
    )

    print("=" * 60)
    print("               PHONE BOOK SYSTEM")
    print("=" * 60)
    print(f"Host:        {HOST}")
    print(f"Port:        {PORT}")
    print(f"Application: http://{HOST}:{PORT}")
    print(f"API:         http://{HOST}:{PORT}/api")
    print("Backend:     Python HTTP Server")
    print("Storage:     In-Memory Dictionary")
    print("Status:      Running")
    print("=" * 60)
    print("Press CTRL+C to stop the server.")
    print()

    try:
        server.serve_forever()

    except KeyboardInterrupt:
        print("\nStopping server...")

    finally:
        server.server_close()
        print("Server stopped.")


# =========================================
# APPLICATION ENTRY POINT
# =========================================

if __name__ == "__main__":
    start_server()
