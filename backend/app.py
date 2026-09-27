import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Allowed domain for students
ALLOWED_STUDENT_DOMAIN = "smvec.ac.in"

def get_db_connection():
    """Establish and return a connection to the PostgreSQL database."""
    conn = psycopg2.connect(
        dbname=os.environ.get('DB_NAME', 'lab_components_db'),
        user=os.environ.get('DB_USER', 'postgres'),
        password=os.environ.get('DB_PASSWORD', 'postgres'),
        host=os.environ.get('DB_HOST', 'localhost'),
        port=os.environ.get('DB_PORT', '5432')
    )
    return conn

def is_valid_student_email(email):
    """Verify if the email belongs to the allowed college domain."""
    regex = r'^[\w\.-]+@([\w\.-]+)$'
    match = re.match(regex, email)
    if match:
        domain = match.group(1)
        return domain == ALLOWED_STUDENT_DOMAIN
    return False

@app.route('/api/setup-password', methods=['POST'])
def setup_password():
    """
    Endpoint for a student to set their password for the first time.
    Expects: email, new_password, confirm_password
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request format"}), 400

    email = data.get('email')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')

    # 1. Validate required fields
    if not all([email, new_password, confirm_password]):
        return jsonify({"error": "Email, new password, and confirm password are required"}), 400

    # 2. Validate email format & allowed domain
    if not is_valid_student_email(email):
        return jsonify({"error": f"Unauthorized email domain. Must be @{ALLOWED_STUDENT_DOMAIN}"}), 403

    # 3. Verify passwords match
    if new_password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # 4. Check whether student exists in users table
            cursor.execute("SELECT id, role FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user:
                return jsonify({"error": "Student not found in the system"}), 404
            
            if user['role'] != 'student':
                return jsonify({"error": "Only students can use this password setup endpoint"}), 403

            # 5 & 6 & 7. Hash the password securely and store in users.password_hash
            hashed_password = generate_password_hash(new_password)

            cursor.execute(
                "UPDATE users SET password_hash = %s WHERE email = %s",
                (hashed_password, email)
            )
            conn.commit()

            return jsonify({"message": "Password setup successfully"}), 200
            
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    """
    Endpoint for students and faculty to login.
    Expects: email, password, role
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request format"}), 400

    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not all([email, password, role]):
        return jsonify({"error": "Email, password, and role are required"}), 400
    
    if role not in ['student', 'faculty']:
        return jsonify({"error": "Invalid role specified"}), 400

    # Student-specific checks
    if role == 'student':
        if not is_valid_student_email(email):
            return jsonify({"error": f"Unauthorized student email domain. Must be @{ALLOWED_STUDENT_DOMAIN}"}), 403

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Find the registered user based on email and specific role
            # This ensures a student cannot login as faculty and vice versa
            cursor.execute("SELECT id, email, password_hash, role FROM users WHERE email = %s AND role = %s", (email, role))
            user = cursor.fetchone()

            if not user:
                return jsonify({"error": "Invalid credentials or unauthorized role"}), 401
            
            if not user['password_hash']:
                return jsonify({"error": "Password not set. Please set up your password first."}), 401

            # IMPORTANT PASSWORD NOTE: Reject placeholder dummy hashes safely
            if user['password_hash'].startswith('demo_hash_'):
                return jsonify({"error": "Please set up a secure password. Demo passwords cannot be used for login."}), 401

            # Verify the password hash
            if not check_password_hash(user['password_hash'], password):
                return jsonify({"error": "Invalid credentials"}), 401

            # Do not return password_hash in response
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "role": user['role']
                }
            }), 200
            
    except Exception as e:
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/components', methods=['GET'])
def get_components():
    """
    Retrieve all components from the database.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT id, component_name, category, quantity, available_quantity, status, description 
                FROM components
            """)
            components = cursor.fetchall()
            return jsonify(components), 200
    except Exception as e:
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/components/<int:id>', methods=['GET'])
def get_component(id):
    """
    Retrieve a specific component by its ID.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT id, component_name, category, quantity, available_quantity, status, description 
                FROM components 
                WHERE id = %s
            """, (id,))
            component = cursor.fetchone()
            
            if not component:
                return jsonify({"error": f"Component with ID {id} not found"}), 404
                
            return jsonify(component), 200
    except Exception as e:
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/requests', methods=['POST'])
def create_request():
    """
    Student requests a component.
    Expects: student_id, component_id
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request format"}), 400

    student_id = data.get('student_id')
    component_id = data.get('component_id')

    if not all([student_id, component_id]):
        return jsonify({"error": "student_id and component_id are required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # 1. Validate student exists
            cursor.execute("SELECT id, role FROM users WHERE id = %s AND role = 'student'", (student_id,))
            student = cursor.fetchone()
            if not student:
                return jsonify({"error": "Student not found or invalid ID"}), 404

            # 2. Validate component exists, is active, and is available
            cursor.execute("SELECT id, status, available_quantity FROM components WHERE id = %s", (component_id,))
            component = cursor.fetchone()
            if not component:
                return jsonify({"error": "Component not found"}), 404
            
            # Assuming 'status' means active/inactive or available/unavailable
            if component['status'].lower() not in ['active', 'available', 'working']:
                return jsonify({"error": "Component is inactive or unavailable"}), 400
                
            if component['available_quantity'] <= 0:
                return jsonify({"error": "Requested component is currently out of stock"}), 400

            # 3. Create a new component request
            cursor.execute("""
                INSERT INTO component_requests (student_id, component_id, status, request_date)
                VALUES (%s, %s, 'pending', CURRENT_TIMESTAMP)
                RETURNING id, student_id, component_id, status, request_date
            """, (student_id, component_id))
            
            new_request = cursor.fetchone()
            conn.commit()

            return jsonify({
                "message": "Component request created successfully",
                "request": new_request
            }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/requests/student/<int:student_id>', methods=['GET'])
def get_student_requests(student_id):
    """
    View requests for a specific student.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Validate student exists
            cursor.execute("SELECT id FROM users WHERE id = %s AND role = 'student'", (student_id,))
            if not cursor.fetchone():
                return jsonify({"error": "Student not found"}), 404

            # Fetch requests with component details
            cursor.execute("""
                SELECT cr.id AS request_id, cr.status, cr.request_date,
                       c.id AS component_id, c.component_name, c.category
                FROM component_requests cr
                JOIN components c ON cr.component_id = c.id
                WHERE cr.student_id = %s
                ORDER BY cr.request_date DESC
            """, (student_id,))
            requests = cursor.fetchall()

            return jsonify(requests), 200

    except Exception as e:
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/requests/pending', methods=['GET'])
def get_pending_requests():
    """
    View all pending requests for faculty dashboard.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT cr.id AS request_id, cr.status, cr.request_date,
                       u.id AS student_id, u.email AS student_email,
                       c.id AS component_id, c.component_name
                FROM component_requests cr
                JOIN users u ON cr.student_id = u.id
                JOIN components c ON cr.component_id = c.id
                WHERE cr.status = 'pending'
                ORDER BY cr.request_date ASC
            """)
            requests = cursor.fetchall()

            return jsonify(requests), 200

    except Exception as e:
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/requests/<int:request_id>/approve', methods=['PUT'])
def approve_request(request_id):
    """
    Faculty approves a pending request.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # 1. Find request and verify it exists & is pending
            cursor.execute("SELECT id, status FROM component_requests WHERE id = %s", (request_id,))
            comp_req = cursor.fetchone()

            if not comp_req:
                return jsonify({"error": "Request not found"}), 404
            
            if comp_req['status'] == 'approved':
                return jsonify({"error": "Request is already approved"}), 400
                
            if comp_req['status'] == 'rejected':
                return jsonify({"error": "Request is already rejected"}), 400

            if comp_req['status'] != 'pending':
                return jsonify({"error": f"Cannot approve request with status: {comp_req['status']}"}), 400

            # 2. Change status to approved (Do NOT reduce component quantity here)
            cursor.execute("""
                UPDATE component_requests 
                SET status = 'approved' 
                WHERE id = %s 
                RETURNING id, status
            """, (request_id,))
            
            updated_req = cursor.fetchone()
            conn.commit()

            return jsonify({
                "message": "Request approved successfully",
                "request": updated_req
            }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/requests/<int:request_id>/reject', methods=['PUT'])
def reject_request(request_id):
    """
    Faculty rejects a pending request.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # 1. Find request and verify it exists & is pending
            cursor.execute("SELECT id, status FROM component_requests WHERE id = %s", (request_id,))
            comp_req = cursor.fetchone()

            if not comp_req:
                return jsonify({"error": "Request not found"}), 404
                
            if comp_req['status'] == 'approved':
                return jsonify({"error": "Request is already approved"}), 400
                
            if comp_req['status'] == 'rejected':
                return jsonify({"error": "Request is already rejected"}), 400

            if comp_req['status'] != 'pending':
                return jsonify({"error": f"Cannot reject request with status: {comp_req['status']}"}), 400

            # 2. Change status to rejected
            cursor.execute("""
                UPDATE component_requests 
                SET status = 'rejected' 
                WHERE id = %s 
                RETURNING id, status
            """, (request_id,))
            
            updated_req = cursor.fetchone()
            conn.commit()

            return jsonify({
                "message": "Request rejected successfully",
                "request": updated_req
            }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
