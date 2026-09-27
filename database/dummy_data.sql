-- ============================================================
-- LAB COMPONENTS AVAILABILITY PORTAL
-- COMPLETE DUMMY DATA
-- ============================================================


-- ============================================================
-- 1. USERS
-- 5 Students + 2 Faculty
-- ============================================================

INSERT INTO users
(name, enrollment_number, register_number, department, email, password_hash, role)
VALUES
('Sujassri', 'ENR001', 'IT001', 'Information Technology',
 'sujassri@student.com', 'demo_hash_001', 'student'),

('Ananya', 'ENR002', 'IT002', 'Information Technology',
 'ananya@student.com', 'demo_hash_002', 'student'),

('Rahul', 'ENR003', 'IT003', 'Information Technology',
 'rahul@student.com', 'demo_hash_003', 'student'),

('Kavin', 'ENR004', 'IT004', 'Information Technology',
 'kavin@student.com', 'demo_hash_004', 'student'),

('Priya', 'ENR005', 'IT005', 'Information Technology',
 'priya@student.com', 'demo_hash_005', 'student'),

('Dr. Kumar', NULL, NULL, 'Information Technology',
 'kumar@faculty.com', 'demo_hash_101', 'faculty'),

('Ms. Divya', NULL, NULL, 'Information Technology',
 'divya@faculty.com', 'demo_hash_102', 'faculty');


-- ============================================================
-- 2. COMPONENTS
-- 15 Lab Components
-- ============================================================

INSERT INTO components
(component_code, name, category, total_quantity,
 available_quantity, description, status)
VALUES

('ARD-001', 'Arduino Uno', 'Microcontroller',
 20, 15,
 'Arduino Uno development board used for embedded systems and IoT experiments.',
 'active'),

('ARD-002', 'Arduino Mega', 'Microcontroller',
 10, 8,
 'Arduino Mega development board with multiple digital and analog pins.',
 'active'),

('RPI-001', 'Raspberry Pi 4', 'Single Board Computer',
 8, 5,
 'Raspberry Pi 4 used for IoT, networking and Linux-based projects.',
 'active'),

('BRD-001', 'Breadboard', 'Electronic Board',
 30, 25,
 'Solderless breadboard used for electronic circuit prototyping.',
 'active'),

('JMP-001', 'Jumper Wires', 'Accessories',
 100, 80,
 'Jumper wires used for connecting electronic components.',
 'active'),

('LED-001', 'LED Pack', 'Electronic Component',
 100, 90,
 'LEDs of different colors used for circuit experiments.',
 'active'),

('RES-001', 'Resistor Kit', 'Electronic Component',
 50, 42,
 'Resistor collection containing commonly used resistance values.',
 'active'),

('SNS-001', 'Ultrasonic Sensor', 'Sensor',
 15, 10,
 'HC-SR04 ultrasonic distance sensor used for distance measurement.',
 'active'),

('SNS-002', 'Temperature Sensor', 'Sensor',
 15, 12,
 'Temperature sensor used for environmental monitoring experiments.',
 'active'),

('BAT-001', '9V Battery', 'Power Supply',
 25, 20,
 '9V batteries used for powering electronic circuits.',
 'active'),

('LCD-001', '16x2 LCD Display', 'Display',
 12, 9,
 '16x2 character LCD display for microcontroller projects.',
 'active'),

('MOT-001', 'DC Motor', 'Actuator',
 20, 16,
 'Small DC motor used for robotics and automation experiments.',
 'active'),

('SER-001', 'Servo Motor', 'Actuator',
 15, 11,
 'Servo motor used for controlled rotational movement.',
 'active'),

('ESP-001', 'ESP32 Development Board', 'Microcontroller',
 12, 7,
 'ESP32 development board with Wi-Fi and Bluetooth support.',
 'active'),

('PIR-001', 'PIR Motion Sensor', 'Sensor',
 10, 8,
 'Passive infrared sensor used for motion detection.',
 'active');


-- ============================================================
-- 3. COMPONENT REQUESTS
-- Contains pending, approved and rejected requests
-- ============================================================

INSERT INTO component_requests
(component_id, student_id, request_date, queue_position,
 available_from, status, approved_by, approved_at)
VALUES

-- Approved request
(1, 1, '2026-09-26 09:00:00', 1,
 '2026-09-27', 'approved', 6, '2026-09-26 10:00:00'),

-- Pending request
(1, 2, '2026-09-26 09:05:00', 2,
 '2026-09-27', 'pending', NULL, NULL),

-- Approved request
(8, 3, '2026-09-26 09:15:00', 1,
 '2026-09-27', 'approved', 7, '2026-09-26 10:30:00'),

-- Rejected request
(3, 4, '2026-09-26 09:30:00', 1,
 '2026-09-28', 'rejected', 6, '2026-09-26 11:00:00'),

-- Pending request
(14, 5, '2026-09-26 09:45:00', 1,
 '2026-09-27', 'pending', NULL, NULL),

-- Another rejected request
(10, 2, '2026-09-26 10:00:00', 1,
 '2026-09-29', 'rejected', 7, '2026-09-26 11:30:00');


-- ============================================================
-- 4. ISSUE RECORDS
-- Contains issued and returned components
-- ============================================================

INSERT INTO issue_records
(component_id, student_id, request_id,
 issue_date, due_date, return_date,
 fine_amount, status)
VALUES

-- Currently issued
(1, 1, 1,
 '2026-09-26', '2026-09-29', NULL,
 0.00, 'issued'),

-- Returned on time
(8, 3, 3,
 '2026-09-20', '2026-09-23', '2026-09-23',
 0.00, 'returned'),

-- Returned late with fine
(3, 2, NULL,
 '2026-09-15', '2026-09-18', '2026-09-21',
 30.00, 'returned'),

-- Currently issued
(14, 4, NULL,
 '2026-09-25', '2026-09-28', NULL,
 0.00, 'issued');


-- ============================================================
-- 5. DAMAGE RECORDS
-- Contains damaged component history
-- ============================================================

INSERT INTO damage_records
(component_id, student_id, issue_id,
 damage_description, damage_date, quantity_damaged)
VALUES

-- Damage related to returned ultrasonic sensor
(8, 3, 2,
 'Ultrasonic sensor casing was cracked during laboratory use.',
 '2026-09-23', 1),

-- Damage related to Raspberry Pi
(3, 2, 3,
 'Power connector was damaged during use.',
 '2026-09-21', 1);


-- ============================================================
-- 6. COMPLAINTS
-- Contains open and resolved complaints
-- ============================================================

INSERT INTO complaints
(student_id, component_id, description, status)
VALUES

-- Open complaint
(2, 1,
 'Arduino Uno was not working when received.',
 'open'),

-- Resolved complaint
(1, 8,
 'Ultrasonic sensor was giving incorrect distance readings.',
 'resolved'),

-- Another open complaint
(4, 14,
 'ESP32 board is not powering on.',
 'open');