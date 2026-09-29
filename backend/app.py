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

def init_db():
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notifications (
                    notification_id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    message TEXT NOT NULL,
                    notification_type VARCHAR(50),
                    related_request_id INTEGER,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
        conn.commit()
    except Exception as e:
        print("Database initialization error:", e)
    finally:
        if conn:
            conn.close()

def create_notification(user_id, message, notification_type, related_request_id=None):
    """
    Helper function to create a notification for a user.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO notifications (user_id, message, notification_type, related_request_id)
                VALUES (%s, %s, %s, %s)
            """, (user_id, message, notification_type, related_request_id))
            conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Failed to create notification: {e}")
    finally:
        if conn:
            conn.close()

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
                SELECT id, component_code, name AS component_name, category, 
                       total_quantity AS quantity, available_quantity, status, description 
                FROM components
            """)
            components = cursor.fetchall()
            return jsonify(components), 200
    except psycopg2.Error as e:
        return jsonify({"error": "Database connection or query error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500
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
                SELECT id, component_code, name AS component_name, category, 
                       total_quantity AS quantity, available_quantity, status, description 
                FROM components 
                WHERE id = %s
            """, (id,))
            component = cursor.fetchone()
            
            if not component:
                return jsonify({"error": "Component not found"}), 404
                
            return jsonify(component), 200
    except psycopg2.Error as e:
        return jsonify({"error": "Database connection or query error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500
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

            # Trigger notifications
            try:
                # Notify the student
                create_notification(
                    user_id=student_id,
                    message="Your component request has been submitted successfully.",
                    notification_type="request_submitted",
                    related_request_id=new_request['id']
                )

                # Notify all faculty members
                cursor.execute("SELECT id FROM users WHERE role = 'faculty'")
                faculty_users = cursor.fetchall()
                for faculty in faculty_users:
                    create_notification(
                        user_id=faculty['id'],
                        message=f"A new component request was submitted by student ID {student_id}.",
                        notification_type="new_request",
                        related_request_id=new_request['id']
                    )
            except Exception as e:
                print(f"Error creating notifications: {e}")

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
                SELECT cr.id, cr.status, cr.request_date,
                       c.id AS component_id, c.name AS component_name, c.component_code, c.category
                FROM component_requests cr
                JOIN components c ON cr.component_id = c.id
                WHERE cr.student_id = %s
                ORDER BY cr.request_date DESC
            """, (student_id,))
            requests = cursor.fetchall()

            return jsonify(requests), 200

    except psycopg2.Error as e:
        return jsonify({"error": "Database connection or query error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500
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
            cursor.execute("SELECT id, status, student_id FROM component_requests WHERE id = %s", (request_id,))
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

            # Notify the student
            try:
                create_notification(
                    user_id=comp_req['student_id'],
                    message=f"Your component request (ID: {request_id}) has been approved.",
                    notification_type="request_approved",
                    related_request_id=request_id
                )
            except Exception as e:
                print(f"Error creating approval notification: {e}")

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
            cursor.execute("SELECT id, status, student_id FROM component_requests WHERE id = %s", (request_id,))
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

            # Notify the student
            try:
                create_notification(
                    user_id=comp_req['student_id'],
                    message=f"Your component request (ID: {request_id}) has been rejected.",
                    notification_type="request_rejected",
                    related_request_id=request_id
                )
            except Exception as e:
                print(f"Error creating rejection notification: {e}")

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

@app.route('/api/borrowed/<int:student_id>', methods=['GET'])
def get_borrowed_components(student_id):
    """
    Retrieve borrowed/issued components for a specific student.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # 1. Validate student exists
            cursor.execute("SELECT id FROM users WHERE id = %s AND role = 'student'", (student_id,))
            if not cursor.fetchone():
                return jsonify({"error": "Student not found"}), 404

            # 2. Fetch issue records with component details
            cursor.execute("""
                SELECT ir.id, 
                       c.id AS component_id, 
                       c.name AS component_name, 
                       c.component_code, 
                       c.category, 
                       c.description,
                       ir.issue_date, 
                       ir.due_date, 
                       ir.return_date, 
                       ir.fine_amount, 
                       ir.status
                FROM issue_records ir
                JOIN components c ON ir.component_id = c.id
                WHERE ir.student_id = %s
                ORDER BY ir.issue_date DESC
            """, (student_id,))
            records = cursor.fetchall()

            return jsonify(records), 200

    except psycopg2.Error as e:
        return jsonify({"error": "Database connection or query error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/damage/student/<int:user_id>', methods=['GET'])
def get_student_damage_records(user_id):
    """
    Retrieve damage records for a specific student.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Check if student exists
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": "Student not found"}), 404

            cursor.execute("""
                SELECT dr.id, dr.component_id, c.name AS component_name, c.category,
                       dr.issue_id, dr.damage_description, dr.damage_date, dr.quantity_damaged
                FROM damage_records dr
                JOIN components c ON dr.component_id = c.id
                WHERE dr.student_id = %s
                ORDER BY dr.damage_date DESC
            """, (user_id,))
            records = cursor.fetchall()
            
            # Format dates if necessary
            for record in records:
                if hasattr(record['damage_date'], 'strftime'):
                    record['damage_date'] = record['damage_date'].strftime('%Y-%m-%d')
                    
            return jsonify({"damage_records": records}), 200

    except psycopg2.Error as e:
        return jsonify({"error": "Database connection or query error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/damage', methods=['POST'])
def create_damage_report():
    """
    Submit a new damage report.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request format"}), 400

    student_id = data.get('student_id')
    component_id = data.get('component_id')
    issue_id = data.get('issue_id')
    damage_description = data.get('damage_description')
    damage_date = data.get('damage_date')
    quantity_damaged = data.get('quantity_damaged')

    if not all([student_id, component_id, damage_description, damage_date, quantity_damaged]):
        return jsonify({"error": "student_id, component_id, damage_description, damage_date, and quantity_damaged are required"}), 400

    try:
        quantity_damaged = int(quantity_damaged)
        if quantity_damaged <= 0:
            return jsonify({"error": "quantity_damaged must be a positive integer"}), 400
    except ValueError:
        return jsonify({"error": "quantity_damaged must be an integer"}), 400

    # Basic date format validation
    if not re.match(r'^\d{4}-\d{2}-\d{2}$', str(damage_date)):
        return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 400

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # 1. Validate student
            cursor.execute("SELECT id FROM users WHERE id = %s", (student_id,))
            if not cursor.fetchone():
                return jsonify({"error": "Student not found"}), 404

            # 2. Validate component
            cursor.execute("SELECT id FROM components WHERE id = %s", (component_id,))
            if not cursor.fetchone():
                return jsonify({"error": "Component not found"}), 404

            # 3. Validate issue_id if provided
            if issue_id is not None:
                cursor.execute("SELECT id FROM issue_records WHERE id = %s", (issue_id,))
                if not cursor.fetchone():
                    return jsonify({"error": "Issue record not found"}), 404

            # 4. Insert damage record
            cursor.execute("""
                INSERT INTO damage_records (component_id, student_id, issue_id, damage_description, damage_date, quantity_damaged)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, component_id, student_id, issue_id, damage_description, damage_date, quantity_damaged
            """, (component_id, student_id, issue_id, damage_description, damage_date, quantity_damaged))
            
            new_record = cursor.fetchone()
            conn.commit()

            if hasattr(new_record['damage_date'], 'strftime'):
                new_record['damage_date'] = new_record['damage_date'].strftime('%Y-%m-%d')

            return jsonify({
                "message": "Damage report submitted successfully",
                "damage_record": new_record
            }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/ai/component-insights', methods=['GET'])
def get_component_insights():
    """
    Provide aggregated, read-only component insights for the AI Assistant prototype.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Query components with aggregated counts
            cursor.execute("""
                SELECT 
                    c.id AS component_id,
                    c.name AS component_name,
                    c.category,
                    c.total_quantity,
                    c.available_quantity,
                    COALESCE(cr.request_count, 0) AS request_count,
                    COALESCE(ir.issue_count, 0) AS issue_count,
                    COALESCE(dr.damage_count, 0) AS damage_count
                FROM components c
                LEFT JOIN (
                    SELECT component_id, COUNT(id) AS request_count 
                    FROM component_requests 
                    GROUP BY component_id
                ) cr ON c.id = cr.component_id
                LEFT JOIN (
                    SELECT component_id, COUNT(id) AS issue_count 
                    FROM issue_records 
                    GROUP BY component_id
                ) ir ON c.id = ir.component_id
                LEFT JOIN (
                    SELECT component_id, COUNT(id) AS damage_count 
                    FROM damage_records 
                    GROUP BY component_id
                ) dr ON c.id = dr.component_id
            """)
            components_data = cursor.fetchall()
            
            # Apply simple rule-based demand classification
            for comp in components_data:
                req_count = comp['request_count']
                if req_count == 0:
                    comp['sample_demand_level'] = "insufficient_data"
                elif req_count >= 10:
                    comp['sample_demand_level'] = "high"
                elif req_count >= 5:
                    comp['sample_demand_level'] = "medium"
                else:
                    comp['sample_demand_level'] = "normal"
            
            return jsonify({"components": components_data}), 200

    except Exception as e:
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/ai/component-insights/<int:component_id>', methods=['GET'])
def get_single_component_insight(component_id):
    """
    Provide aggregated, read-only insight for a single component.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT 
                    c.id AS component_id,
                    c.name AS component_name,
                    c.category,
                    c.total_quantity,
                    c.available_quantity,
                    COALESCE(cr.request_count, 0) AS request_count,
                    COALESCE(ir.issue_count, 0) AS issue_count,
                    COALESCE(dr.damage_count, 0) AS damage_count
                FROM components c
                LEFT JOIN (
                    SELECT component_id, COUNT(id) AS request_count 
                    FROM component_requests 
                    WHERE component_id = %s
                    GROUP BY component_id
                ) cr ON c.id = cr.component_id
                LEFT JOIN (
                    SELECT component_id, COUNT(id) AS issue_count 
                    FROM issue_records 
                    WHERE component_id = %s
                    GROUP BY component_id
                ) ir ON c.id = ir.component_id
                LEFT JOIN (
                    SELECT component_id, COUNT(id) AS damage_count 
                    FROM damage_records 
                    WHERE component_id = %s
                    GROUP BY component_id
                ) dr ON c.id = dr.component_id
                WHERE c.id = %s
            """, (component_id, component_id, component_id, component_id))
            comp = cursor.fetchone()
            
            if not comp:
                return jsonify({"error": "Component not found"}), 404
                
            # Apply simple rule-based demand classification
            req_count = comp['request_count']
            if req_count == 0:
                comp['sample_demand_level'] = "insufficient_data"
            elif req_count >= 10:
                comp['sample_demand_level'] = "high"
            elif req_count >= 5:
                comp['sample_demand_level'] = "medium"
            else:
                comp['sample_demand_level'] = "normal"
                
            return jsonify(comp), 200

    except Exception as e:
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/notifications/<int:user_id>', methods=['GET'])
def get_user_notifications(user_id):
    """
    Retrieve notifications for a specific user, newest first.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Validate user
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": "User not found"}), 404

            cursor.execute("""
                SELECT notification_id, message, notification_type, related_request_id, is_read, created_at
                FROM notifications
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))
            notifications = cursor.fetchall()
            
            return jsonify({"notifications": notifications}), 200

    except Exception as e:
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/notifications/<int:user_id>/unread', methods=['GET'])
def get_unread_notifications(user_id):
    """
    Retrieve unread notifications for a specific user.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Validate user
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": "User not found"}), 404

            cursor.execute("""
                SELECT notification_id, message, notification_type, related_request_id, is_read, created_at
                FROM notifications
                WHERE user_id = %s AND is_read = FALSE
                ORDER BY created_at DESC
            """, (user_id,))
            notifications = cursor.fetchall()
            
            return jsonify({
                "unread_count": len(notifications),
                "notifications": notifications
            }), 200

    except Exception as e:
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT', 'PATCH'])
def mark_notification_read(notification_id):
    """
    Mark a specific notification as read.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                UPDATE notifications
                SET is_read = TRUE
                WHERE notification_id = %s
                RETURNING notification_id, is_read
            """, (notification_id,))
            
            updated_notif = cursor.fetchone()
            
            if not updated_notif:
                return jsonify({"error": "Notification not found"}), 404
                
            conn.commit()
            return jsonify({"message": "Notification marked as read"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/notifications/<int:user_id>/read-all', methods=['PUT', 'PATCH'])
def mark_all_notifications_read(user_id):
    """
    Mark all notifications for a specific user as read.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Validate user
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": "User not found"}), 404

            cursor.execute("""
                UPDATE notifications
                SET is_read = TRUE
                WHERE user_id = %s AND is_read = FALSE
            """, (user_id,))
            
            conn.commit()
            return jsonify({"message": "All notifications marked as read"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

# =========================================================
# TEMPORARY ROUTE FOR TESTING (Added for Backend Verification)
# =========================================================
@app.route('/api/test-backend', methods=['GET'])
def test_backend():
    """
    TEMPORARY ROUTE: Verifies Flask started and lists all registered routes.
    Does NOT require a database connection.
    To remove this, simply delete this function.
    """
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append(f"{rule.methods} {rule.rule}")
    
    return jsonify({
        "status": "Flask backend is running successfully!",
        "message": "Database connection is not required for this endpoint.",
        "registered_routes": sorted(list(set(routes)))
    }), 200
# =========================================================

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
