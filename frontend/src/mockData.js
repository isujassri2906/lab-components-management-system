export const mockComponents = [
  // Batteries
  {
    id: 'BAT-001',
    code: 'B9V-100',
    name: '9V Battery',
    category: 'Batteries',
    description: 'Standard 9-volt alkaline battery for small electronics and projects.',
    totalQuantity: 50,
    availableQuantity: 45,
    status: 'Available'
  },
  {
    id: 'BAT-002',
    code: 'BAA-200',
    name: 'AA Battery',
    category: 'Batteries',
    description: '1.5V AA alkaline battery, commonly used for remote controls and toys.',
    totalQuantity: 200,
    availableQuantity: 180,
    status: 'Available'
  },
  {
    id: 'BAT-003',
    code: 'BLI-300',
    name: 'Lithium Polymer Battery (3.7V)',
    category: 'Batteries',
    description: 'Rechargeable 3.7V Li-Po battery suitable for portable electronics.',
    totalQuantity: 30,
    availableQuantity: 2,
    status: 'Low Stock'
  },

  // Microcontrollers
  {
    id: 'MCU-001',
    code: 'ARD-UNO-R3',
    name: 'Arduino Uno R3',
    category: 'Microcontrollers',
    description: 'ATmega328P based microcontroller board. Highly versatile for electronics prototyping.',
    totalQuantity: 40,
    availableQuantity: 15,
    status: 'Available'
  },
  {
    id: 'MCU-002',
    code: 'ESP-32-WROOM',
    name: 'ESP32 Development Board',
    category: 'Microcontrollers',
    description: 'Powerful Wi-Fi + Bluetooth/BLE MCU module targeting IoT applications.',
    totalQuantity: 25,
    availableQuantity: 0,
    status: 'Out of Stock'
  },
  {
    id: 'MCU-003',
    code: 'MCU-NODE-8266',
    name: 'NodeMCU ESP8266',
    category: 'Microcontrollers',
    description: 'Low-cost open source IoT platform based on the ESP8266.',
    totalQuantity: 15,
    availableQuantity: 8,
    status: 'Available'
  },

  // Motors
  {
    id: 'MOT-001',
    code: 'MTR-DC-3V',
    name: 'DC Motor (3V-6V)',
    category: 'Motors',
    description: 'Small DC motors convert electrical energy into mechanical rotation. Commonly used in robotics.',
    totalQuantity: 100,
    availableQuantity: 82,
    status: 'Available'
  },
  {
    id: 'MOT-002',
    code: 'MTR-SRV-SG90',
    name: 'Servo Motor (SG90)',
    category: 'Motors',
    description: 'Lightweight micro servo motor for precise angular positioning.',
    totalQuantity: 50,
    availableQuantity: 12,
    status: 'Available'
  },
  {
    id: 'MOT-003',
    code: 'MTR-STP-28BYJ',
    name: 'Stepper Motor with Driver',
    category: 'Motors',
    description: '5V stepper motor paired with a ULN2003 driver board.',
    totalQuantity: 20,
    availableQuantity: 3,
    status: 'Low Stock'
  },

  // Sensors
  {
    id: 'SEN-001',
    code: 'SNR-PIR-HC',
    name: 'PIR Motion Sensor (HC-SR501)',
    category: 'Sensors',
    description: 'Passive Infrared sensor to detect motion of humans or animals.',
    totalQuantity: 60,
    availableQuantity: 55,
    status: 'Available'
  },
  {
    id: 'SEN-002',
    code: 'SNR-ULT-HC04',
    name: 'Ultrasonic Sensor (HC-SR04)',
    category: 'Sensors',
    description: 'Measures distance using ultrasonic waves (2cm - 400cm).',
    totalQuantity: 40,
    availableQuantity: 20,
    status: 'Available'
  },
  {
    id: 'SEN-003',
    code: 'SNR-IR-MOD',
    name: 'IR Obstacle Avoidance Sensor',
    category: 'Sensors',
    description: 'Emits and detects infrared light to determine the presence of obstacles.',
    totalQuantity: 35,
    availableQuantity: 0,
    status: 'Out of Stock'
  }
];

export const mockRequests = [
  {
    id: 'REQ-001',
    componentId: 'MCU-001',
    componentName: 'Arduino Uno R3',
    componentCode: 'ARD-UNO-R3',
    category: 'Microcontrollers',
    requestDate: '2026-09-27T10:30:00Z',
    queuePosition: null,
    availableFrom: '2026-09-28',
    status: 'Approved',
    description: 'Needed for final year IoT project.'
  },
  {
    id: 'REQ-002',
    componentId: 'SEN-002',
    componentName: 'Ultrasonic Sensor (HC-SR04)',
    componentCode: 'SNR-ULT-HC04',
    category: 'Sensors',
    requestDate: '2026-09-28T08:15:00Z',
    queuePosition: 2,
    availableFrom: null,
    status: 'Pending',
    description: 'Required for obstacle avoidance robot.'
  },
  {
    id: 'REQ-003',
    componentId: 'MOT-001',
    componentName: 'DC Motor (3V-6V)',
    componentCode: 'MTR-DC-3V',
    category: 'Motors',
    requestDate: '2026-09-26T14:45:00Z',
    queuePosition: null,
    availableFrom: null,
    status: 'Rejected',
    description: 'Need for testing.'
  },
  {
    id: 'REQ-004',
    componentId: 'BAT-001',
    componentName: '9V Battery',
    componentCode: 'B9V-100',
    category: 'Batteries',
    requestDate: '2026-09-28T11:20:00Z',
    queuePosition: 1,
    availableFrom: null,
    status: 'Pending',
    description: 'Power source for the sensors.'
  }
];

export const mockBorrowed = [
  {
    id: 'BOR-001',
    componentId: 'MCU-003',
    componentName: 'NodeMCU ESP8266',
    componentCode: 'MCU-NODE-8266',
    category: 'Microcontrollers',
    issueDate: '2026-09-20T10:00:00Z',
    dueDate: '2026-09-27T17:00:00Z',
    returnDate: null,
    status: 'Overdue',
    fineAmount: 10,
    description: 'Issued for IoT Workshop.'
  },
  {
    id: 'BOR-002',
    componentId: 'MOT-002',
    componentName: 'Servo Motor (SG90)',
    componentCode: 'MTR-SRV-SG90',
    category: 'Motors',
    issueDate: '2026-09-25T14:30:00Z',
    dueDate: '2026-10-02T17:00:00Z',
    returnDate: null,
    status: 'Issued',
    fineAmount: 0,
    description: 'For robotics arm project.'
  },
  {
    id: 'BOR-003',
    componentId: 'SEN-001',
    componentName: 'PIR Motion Sensor (HC-SR501)',
    componentCode: 'SNR-PIR-HC',
    category: 'Sensors',
    issueDate: '2026-09-10T09:15:00Z',
    dueDate: '2026-09-17T17:00:00Z',
    returnDate: '2026-09-16T15:45:00Z',
    status: 'Returned',
    fineAmount: 0,
    description: 'Used for security alarm prototype.'
  },
  {
    id: 'BOR-004',
    componentId: 'BAT-002',
    componentName: 'AA Battery',
    componentCode: 'BAA-200',
    category: 'Batteries',
    issueDate: '2026-09-27T11:20:00Z',
    dueDate: '2026-09-29T17:00:00Z',
    returnDate: null,
    status: 'Issued',
    fineAmount: 0,
    description: 'Powering the servo.'
  }
];

export const mockReservations = [
  {
    id: 'RSV-001',
    componentId: 'MCU-001',
    componentName: 'Arduino Uno R3',
    componentCode: 'ARD-UNO-R3',
    category: 'Microcontrollers',
    reservationDate: '2026-09-27T08:00:00Z',
    requiredFrom: '2026-10-05T00:00:00Z',
    requiredUntil: '2026-10-10T00:00:00Z',
    status: 'Confirmed',
    description: 'Needed for the final electronics exam.'
  },
  {
    id: 'RSV-002',
    componentId: 'SEN-002',
    componentName: 'Ultrasonic Sensor (HC-SR04)',
    componentCode: 'SNR-ULT-HC04',
    category: 'Sensors',
    reservationDate: '2026-09-28T09:15:00Z',
    requiredFrom: '2026-10-12T00:00:00Z',
    requiredUntil: '2026-10-15T00:00:00Z',
    status: 'Pending',
    description: 'For my upcoming robotics project.'
  },
  {
    id: 'RSV-003',
    componentId: 'MOT-001',
    componentName: 'DC Motor (3V-6V)',
    componentCode: 'MTR-DC-3V',
    category: 'Motors',
    reservationDate: '2026-09-25T11:20:00Z',
    requiredFrom: '2026-09-28T00:00:00Z',
    requiredUntil: '2026-10-01T00:00:00Z',
    status: 'Available',
    description: 'Reserved for prototyping.'
  },
  {
    id: 'RSV-004',
    componentId: 'BAT-001',
    componentName: '9V Battery',
    componentCode: 'B9V-100',
    category: 'Batteries',
    reservationDate: '2026-09-10T14:30:00Z',
    requiredFrom: '2026-09-15T00:00:00Z',
    requiredUntil: '2026-09-16T00:00:00Z',
    status: 'Completed',
    description: 'Short term reservation.'
  },
  {
    id: 'RSV-005',
    componentId: 'MCU-002',
    componentName: 'ESP32 Development Board',
    componentCode: 'ESP-32-WROOM',
    category: 'Microcontrollers',
    reservationDate: '2026-09-26T16:45:00Z',
    requiredFrom: '2026-10-20T00:00:00Z',
    requiredUntil: '2026-10-30T00:00:00Z',
    status: 'Cancelled',
    description: 'No longer needed.'
  }
];

export const mockNotifications = [
  {
    id: 'NOT-001',
    title: 'Request Approved',
    message: 'Your request for Arduino Uno R3 has been approved.',
    type: 'Request',
    createdAt: '2026-09-28T10:30:00Z',
    isRead: false
  },
  {
    id: 'NOT-002',
    title: 'Reservation Confirmed',
    message: 'Your reservation for ESP32 Development Board has been confirmed.',
    type: 'Reservation',
    createdAt: '2026-09-27T14:15:00Z',
    isRead: true
  },
  {
    id: 'NOT-003',
    title: 'Component Due Soon',
    message: 'Your borrowed NodeMCU ESP8266 is due for return soon.',
    type: 'Borrowed',
    createdAt: '2026-09-26T09:00:00Z',
    isRead: false
  },
  {
    id: 'NOT-004',
    title: 'Component Returned',
    message: 'Your PIR Motion Sensor (HC-SR501) has been successfully marked as returned.',
    type: 'Return',
    createdAt: '2026-09-16T16:00:00Z',
    isRead: true
  },
  {
    id: 'NOT-005',
    title: 'Lab Update',
    message: 'The lab component inventory has been updated with new sensors.',
    type: 'System',
    createdAt: '2026-09-25T11:00:00Z',
    isRead: false
  }
];

export const mockDamageRecords = [
  {
    id: 1,
    componentId: 3,
    componentName: 'ESP32 Development Board',
    componentCode: 'MC-003',
    category: 'Microcontrollers',
    issueId: 12,
    damageDescription: 'USB port damaged',
    damageDate: '2026-09-20',
    quantityDamaged: 1,
    status: 'Reported'
  },
  {
    id: 2,
    componentId: 10,
    componentName: 'Servo Motor (SG90)',
    componentCode: 'MTR-SRV-SG90',
    category: 'Motors',
    issueId: 15,
    damageDescription: 'Gears stripped during operation',
    damageDate: '2026-09-25',
    quantityDamaged: 1,
    status: 'Resolved'
  }
];

export const mockComplaints = [
  {
    id: 1,
    componentId: 3,
    componentName: 'ESP32 Development Board',
    componentCode: 'MC-003',
    category: 'Microcontrollers',
    description: 'The board is not powering on.',
    status: 'open'
  },
  {
    id: 2,
    componentId: 7,
    componentName: 'PIR Motion Sensor (HC-SR501)',
    componentCode: 'SNR-PIR-HC',
    category: 'Sensors',
    description: 'Sensor consistently gives false positives.',
    status: 'resolved'
  }
];
