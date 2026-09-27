 ============================================================
-- LAB COMPONENTS AVAILABILITY PORTAL
-- COMPLETE DATABASE SCHEMA
-- ============================================================


-- ============================================================
-- 1. USERS TABLE
-- Stores students and faculty
-- ============================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,

    enrollment_number VARCHAR(50) UNIQUE,

    register_number VARCHAR(50) UNIQUE,

    department VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('student', 'faculty')),

    is_active BOOLEAN DEFAULT TRUE
);


-- ============================================================
-- 2. COMPONENTS TABLE
-- Stores all lab components
-- ============================================================

CREATE TABLE components (
    id SERIAL PRIMARY KEY,

    component_code VARCHAR(50) UNIQUE NOT NULL,

    name VARCHAR(100) NOT NULL,

    category VARCHAR(100) NOT NULL,

    total_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (total_quantity >= 0),

    available_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (available_quantity >= 0),

    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 3. COMPONENT REQUESTS TABLE
-- Students request components.
-- Faculty approves or rejects requests.
-- ============================================================

CREATE TABLE component_requests (
    id SERIAL PRIMARY KEY,

    component_id INTEGER NOT NULL,

    student_id INTEGER NOT NULL,

    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    queue_position INTEGER,

    available_from DATE,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),

    approved_by INTEGER,

    approved_at TIMESTAMP,

    CONSTRAINT fk_request_component
        FOREIGN KEY (component_id)
        REFERENCES components(id),

    CONSTRAINT fk_request_student
        FOREIGN KEY (student_id)
        REFERENCES users(id),

    CONSTRAINT fk_request_approved_by
        FOREIGN KEY (approved_by)
        REFERENCES users(id)
);


-- ============================================================
-- 4. ISSUE RECORDS TABLE
-- Stores borrowing and returning history.
-- ============================================================

CREATE TABLE issue_records (
    id SERIAL PRIMARY KEY,

    component_id INTEGER NOT NULL,

    student_id INTEGER NOT NULL,

    request_id INTEGER,

    issue_date DATE NOT NULL,

    due_date DATE NOT NULL,

    return_date DATE,

    fine_amount DECIMAL(10,2) DEFAULT 0
        CHECK (fine_amount >= 0),

    status VARCHAR(20) NOT NULL DEFAULT 'issued'
        CHECK (status IN ('issued', 'returned')),

    CONSTRAINT fk_issue_component
        FOREIGN KEY (component_id)
        REFERENCES components(id),

    CONSTRAINT fk_issue_student
        FOREIGN KEY (student_id)
        REFERENCES users(id),

    CONSTRAINT fk_issue_request
        FOREIGN KEY (request_id)
        REFERENCES component_requests(id)
);


-- ============================================================
-- 5. DAMAGE RECORDS TABLE
-- Stores damaged component history.
-- ============================================================

CREATE TABLE damage_records (
    id SERIAL PRIMARY KEY,

    component_id INTEGER NOT NULL,

    student_id INTEGER NOT NULL,

    issue_id INTEGER,

    damage_description TEXT NOT NULL,

    damage_date DATE NOT NULL,

    quantity_damaged INTEGER NOT NULL DEFAULT 1
        CHECK (quantity_damaged > 0),

    CONSTRAINT fk_damage_component
        FOREIGN KEY (component_id)
        REFERENCES components(id),

    CONSTRAINT fk_damage_student
        FOREIGN KEY (student_id)
        REFERENCES users(id),

    CONSTRAINT fk_damage_issue
        FOREIGN KEY (issue_id)
        REFERENCES issue_records(id)
);


-- ============================================================
-- 6. COMPLAINTS TABLE
-- Stores complaints raised by students.
-- ============================================================

CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    component_id INTEGER,

    description TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'resolved')),

    CONSTRAINT fk_complaint_student
        FOREIGN KEY (student_id)
        REFERENCES users(id),

    CONSTRAINT fk_complaint_component
        FOREIGN KEY (component_id)
        REFERENCES components(id)
);