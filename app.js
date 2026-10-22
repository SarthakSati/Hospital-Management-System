/**
 * Hospital Management System — Interactive Simulation Engine
 * Port of C++ hospital.hpp / hospital.cpp algorithms
 * Architecture: Self-Balancing AVL Tree + FIFO Queue
 */

// ==========================================
// 1. DATA STRUCTURES (AVL & APPOINTMENT)
// ==========================================

class PatientNode {
  constructor(id, name, age, disease, contact) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.disease = disease;
    this.contact = contact;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

class HospitalSystem {
  constructor() {
    this.root = null;
    this.appointments = [];
    this.nextPatientId = 101;
    this.totalPatients = 0;
  }

  // Helper: Height
  getHeight(node) {
    return node ? node.height : 0;
  }

  // Helper: Balance Factor
  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  // Right Rotation (LL Case)
  rightRotate(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

    return x;
  }

  // Left Rotation (RR Case)
  leftRotate(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

    return y;
  }

  // Insert into AVL Tree
  insert(node, newPatient) {
    if (!node) {
      this.totalPatients++;
      return newPatient;
    }

    if (newPatient.id < node.id) {
      node.left = this.insert(node.left, newPatient);
    } else if (newPatient.id > node.id) {
      node.right = this.insert(node.right, newPatient);
    } else {
      return node; // Duplicate IDs not allowed
    }

    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    const balance = this.getBalance(node);

    // Left Left Case
    if (balance > 1 && newPatient.id < node.left.id) {
      return this.rightRotate(node);
    }

    // Right Right Case
    if (balance < -1 && newPatient.id > node.right.id) {
      return this.leftRotate(node);
    }

    // Left Right Case
    if (balance > 1 && newPatient.id > node.left.id) {
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }

    // Right Left Case
    if (balance < -1 && newPatient.id < node.right.id) {
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }

    return node;
  }

  addPatient(name, age, disease, contact, customId = null) {
    const id = customId !== null ? customId : this.nextPatientId++;
    const newPatient = new PatientNode(id, name, age, disease, contact);
    this.root = this.insert(this.root, newPatient);
    return newPatient;
  }

  // Search by ID with path tracking
  search(root, id, path = []) {
    if (!root) return { found: null, path };
    path.push(root.id);

    if (root.id === id) {
      return { found: root, path };
    }
    if (id < root.id) {
      return this.search(root.left, id, path);
    }
    return this.search(root.right, id, path);
  }

  // Delete Patient
  minValueNode(node) {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  deleteNode(root, id) {
    if (!root) return null;

    if (id < root.id) {
      root.left = this.deleteNode(root.left, id);
    } else if (id > root.id) {
      root.right = this.deleteNode(root.right, id);
    } else {
      // Node found
      if (!root.left || !root.right) {
        const temp = root.left ? root.left : root.right;
        if (!temp) {
          root = null;
        } else {
          root = temp;
        }
        this.totalPatients--;
      } else {
        const temp = this.minValueNode(root.right);
        root.id = temp.id;
        root.name = temp.name;
        root.age = temp.age;
        root.disease = temp.disease;
        root.contact = temp.contact;
        root.right = this.deleteNode(root.right, temp.id);
      }
    }

    if (!root) return null;

    root.height = 1 + Math.max(this.getHeight(root.left), this.getHeight(root.right));
    const balance = this.getBalance(root);

    // Rebalance
    if (balance > 1 && this.getBalance(root.left) >= 0) return this.rightRotate(root);
    if (balance > 1 && this.getBalance(root.left) < 0) {
      root.left = this.leftRotate(root.left);
      return this.rightRotate(root);
    }
    if (balance < -1 && this.getBalance(root.right) <= 0) return this.leftRotate(root);
    if (balance < -1 && this.getBalance(root.right) > 0) {
      root.right = this.rightRotate(root.right);
      return this.leftRotate(root);
    }

    return root;
  }

  // Inorder Traversal
  inorder(node = this.root, result = []) {
    if (node) {
      this.inorder(node.left, result);
      result.push(node);
      this.inorder(node.right, result);
    }
    return result;
  }

  // Queue Operations
  scheduleAppointment(patientId, time, date) {
    this.appointments.push({ patientId, time, date, timestamp: new Date() });
  }

  popAppointment() {
    return this.appointments.shift();
  }

  peekAppointment() {
    return this.appointments.length > 0 ? this.appointments[0] : null;
  }
}

// Instantiate System
const hospital = new HospitalSystem();

// ==========================================
// 2. CANVAS AVL TREE VISUALIZER
// ==========================================

const canvas = document.getElementById('avl-canvas');
const ctx = canvas.getContext('2d');
let highlightedPath = [];

function resizeCanvas() {
  const wrapper = canvas.parentElement;
  canvas.width = wrapper.clientWidth * window.devicePixelRatio;
  canvas.height = Math.max(450, wrapper.clientHeight) * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  renderTree();
}

window.addEventListener('resize', resizeCanvas);

function getTreeDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
}

function renderTree() {
  const width = canvas.width / window.devicePixelRatio;
  const height = canvas.height / window.devicePixelRatio;
  ctx.clearRect(0, 0, width, height);

  if (!hospital.root) {
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AVL Tree is empty. Add a patient or click "Load Sample Data" to visualize.', width / 2, height / 2);
    return;
  }

  const depth = getTreeDepth(hospital.root);
  const startY = 45;
  const levelHeight = Math.min(85, (height - 90) / Math.max(depth, 1));

  drawNodeRecursive(hospital.root, width / 2, startY, width / 4, levelHeight);
}

function drawNodeRecursive(node, x, y, offset, levelHeight) {
  if (!node) return;

  const isHighlighted = highlightedPath.includes(node.id);
  const radius = 22;

  // Draw lines to children
  if (node.left) {
    const nextX = x - offset;
    const nextY = y + levelHeight;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nextX, nextY);
    ctx.strokeStyle = highlightedPath.includes(node.id) && highlightedPath.includes(node.left.id) ? '#f59e0b' : '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    drawNodeRecursive(node.left, nextX, nextY, offset / 2, levelHeight);
  }

  if (node.right) {
    const nextX = x + offset;
    const nextY = y + levelHeight;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nextX, nextY);
    ctx.strokeStyle = highlightedPath.includes(node.id) && highlightedPath.includes(node.right.id) ? '#f59e0b' : '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    drawNodeRecursive(node.right, nextX, nextY, offset / 2, levelHeight);
  }

  // Draw Node Circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = isHighlighted ? '#f59e0b' : '#0ea5e9';
  ctx.shadowColor = isHighlighted ? 'rgba(245, 158, 11, 0.6)' : 'rgba(14, 165, 233, 0.4)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw Node Text (ID)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Fira Code, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.id, x, y - 2);

  // Draw Label below (Name)
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText(node.name.length > 8 ? node.name.slice(0, 8) + '..' : node.name, x, y + radius + 12);
}

// Update Top Metric Badges
function updateStats(lastLatency = '< 0.05 ms') {
  document.getElementById('stat-total').innerText = hospital.totalPatients;
  document.getElementById('stat-height').innerText = hospital.getHeight(hospital.root);
  document.getElementById('stat-queue').innerText = hospital.appointments.length;
  document.getElementById('stat-latency').innerText = lastLatency;
  updateQueueUI();
  updatePatientsTable();
}

function updateQueueUI() {
  const container = document.getElementById('queue-items');
  if (hospital.appointments.length === 0) {
    container.innerHTML = '<span class="empty-text">No pending appointments in queue.</span>';
    return;
  }

  container.innerHTML = hospital.appointments.map((appt, idx) => `
    <div class="queue-node">
      <strong>#${idx + 1} Patient ID: ${appt.patientId}</strong>
      <span>🕒 ${appt.time} • ${appt.date}</span>
    </div>
  `).join('');
}

function updatePatientsTable() {
  const tbody = document.getElementById('patients-tbody');
  const allPatients = hospital.inorder();

  if (allPatients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No patients found. Add some from the visualizer!</td></tr>';
    return;
  }

  tbody.innerHTML = allPatients.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>${p.name}</td>
      <td>${p.age}</td>
      <td><span class="badge-blue">${p.disease}</span></td>
      <td>${p.contact}</td>
      <td>
        <button class="btn btn-xs btn-danger" onclick="handleDeletePatient(${p.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

window.handleDeletePatient = function(id) {
  const t0 = performance.now();
  hospital.root = hospital.deleteNode(hospital.root, id);
  const t1 = performance.now();
  highlightedPath = [];
  renderTree();
  updateStats(`${(t1 - t0).toFixed(2)} ms`);
};

// ==========================================
// 3. EVENT LISTENERS
// ==========================================

// Add Patient Form
document.getElementById('add-patient-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('patient-name').value;
  const age = parseInt(document.getElementById('patient-age').value);
  const disease = document.getElementById('patient-disease').value;
  const contact = document.getElementById('patient-contact').value;

  const t0 = performance.now();
  hospital.addPatient(name, age, disease, contact);
  const t1 = performance.now();

  highlightedPath = [];
  renderTree();
  updateStats(`${(t1 - t0).toFixed(2)} ms`);

  document.getElementById('patient-name').value = '';
  document.getElementById('patient-disease').value = '';
});

// Search Patient
document.getElementById('btn-search').addEventListener('click', () => {
  const searchId = parseInt(document.getElementById('search-id').value);
  const resultBox = document.getElementById('search-result-box');

  if (isNaN(searchId)) {
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = '<span style="color: #f87171;">Please enter a valid Patient ID</span>';
    return;
  }

  const t0 = performance.now();
  const { found, path } = hospital.search(hospital.root, searchId);
  const t1 = performance.now();

  highlightedPath = path;
  renderTree();

  resultBox.classList.remove('hidden');
  if (found) {
    resultBox.innerHTML = `
      <div style="color: #38bdf8; font-weight: 600;">✅ Patient Found (in ${path.length} hops):</div>
      <div><strong>Name:</strong> ${found.name} | <strong>Age:</strong> ${found.age}</div>
      <div><strong>Condition:</strong> ${found.disease}</div>
      <div><strong>Contact:</strong> ${found.contact}</div>
    `;
  } else {
    resultBox.innerHTML = `<span style="color: #f87171;">❌ Patient ID ${searchId} not found in AVL tree.</span>`;
  }

  updateStats(`${(t1 - t0).toFixed(2)} ms`);
});

// Schedule Appointment
document.getElementById('btn-schedule-appt').addEventListener('click', () => {
  const id = parseInt(document.getElementById('appt-id').value);
  const time = document.getElementById('appt-time').value || '11:00 AM';
  const date = document.getElementById('appt-date').value || 'Today';

  if (isNaN(id)) {
    alert('Please enter a valid Patient ID');
    return;
  }

  hospital.scheduleAppointment(id, time, date);
  updateStats();
  document.getElementById('appt-id').value = '';
});

// Dequeue Appointment
document.getElementById('btn-pop-next').addEventListener('click', () => {
  const appt = hospital.popAppointment();
  if (appt) {
    alert(`Attending Appointment:\nPatient ID: ${appt.patientId}\nScheduled: ${appt.time} (${appt.date})`);
  } else {
    alert('Appointment queue is empty!');
  }
  updateStats();
});

document.getElementById('btn-view-next').addEventListener('click', () => {
  const appt = hospital.peekAppointment();
  if (appt) {
    alert(`Next in Line:\nPatient ID: ${appt.patientId}\nTime: ${appt.time} (${appt.date})`);
  } else {
    alert('No appointments currently queued.');
  }
});

// Load Sample Data (Seeds realistic tree)
document.getElementById('btn-seed').addEventListener('click', () => {
  const sample = [
    { id: 104, name: 'Alice Smith', age: 34, disease: 'Hypertension', contact: '9876543210' },
    { id: 102, name: 'Bob Johnson', age: 45, disease: 'Diabetes', contact: '9876543211' },
    { id: 106, name: 'Charlie Ray', age: 29, disease: 'Asthma', contact: '9876543212' },
    { id: 101, name: 'David Miller', age: 52, disease: 'Cardiology Check', contact: '9876543213' },
    { id: 103, name: 'Emma Wilson', age: 22, disease: 'Migraine', contact: '9876543214' },
    { id: 105, name: 'Frank Moore', age: 61, disease: 'Arthritis', contact: '9876543215' },
    { id: 107, name: 'Grace Taylor', age: 38, disease: 'Allergy', contact: '9876543216' }
  ];

  sample.forEach(s => hospital.addPatient(s.name, s.age, s.disease, s.contact, s.id));
  hospital.scheduleAppointment(101, '09:30 AM', 'Today');
  hospital.scheduleAppointment(104, '11:15 AM', 'Today');
  hospital.scheduleAppointment(106, '02:00 PM', 'Tomorrow');

  highlightedPath = [];
  renderTree();
  updateStats();
});

// Clear All
document.getElementById('btn-clear').addEventListener('click', () => {
  hospital.root = null;
  hospital.totalPatients = 0;
  hospital.appointments = [];
  highlightedPath = [];
  renderTree();
  updateStats();
});

// Tabs Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const tabId = 'tab-' + btn.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');

    if (btn.getAttribute('data-tab') === 'visualizer') {
      setTimeout(resizeCanvas, 50);
    }
  });
});

// ==========================================
// 4. INTERACTIVE C++ TERMINAL (main.cpp EMULATOR)
// ==========================================

const terminalScreen = document.getElementById('terminal-screen');
const terminalInput = document.getElementById('terminal-input');

let terminalState = 'MENU'; // 'MENU' or specific prompt state
let tempPatient = {};

function printTerminal(text, isInput = false) {
  const line = document.createElement('div');
  line.innerText = text;
  if (isInput) line.style.color = '#34d399';
  terminalScreen.appendChild(line);
  terminalScreen.scrollTop = terminalScreen.scrollHeight;
}

function showMainMenu() {
  printTerminal(`
=== Hospital Management System (C++ main.cpp) ===
1. Add New Patient
2. Search Patient
3. Update Patient
4. Delete Patient
5. Schedule Appointment
6. Display Next Appointment
7. Complete Current Appointment
8. Display All Patients
9. Save Data to File
10. Exit
`);
}

showMainMenu();

terminalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = terminalInput.value.trim();
    terminalInput.value = '';
    printTerminal(`> ${val}`, true);

    handleTerminalInput(val);
  }
});

function handleTerminalInput(val) {
  if (terminalState === 'MENU') {
    switch (val) {
      case '1':
        terminalState = 'ADD_NAME';
        printTerminal('Enter Patient Name:');
        break;
      case '2':
        terminalState = 'SEARCH_ID';
        printTerminal('Enter Patient ID:');
        break;
      case '4':
        terminalState = 'DELETE_ID';
        printTerminal('Enter Patient ID to delete:');
        break;
      case '5':
        terminalState = 'APPT_ID';
        printTerminal('Enter Patient ID for appointment:');
        break;
      case '6':
        const next = hospital.peekAppointment();
        if (next) {
          printTerminal(`Next Appointment: Patient ID ${next.patientId} at ${next.time} (${next.date})`);
        } else {
          printTerminal('No appointments scheduled.');
        }
        showMainMenu();
        break;
      case '7':
        const done = hospital.popAppointment();
        if (done) {
          printTerminal(`Completed Appointment for Patient ID ${done.patientId}!`);
          updateStats();
        } else {
          printTerminal('No appointment to complete.');
        }
        showMainMenu();
        break;
      case '8':
        const all = hospital.inorder();
        printTerminal('--- Patient Records (Inorder Traversal) ---');
        if (all.length === 0) {
          printTerminal('No records in database.');
        } else {
          all.forEach(p => printTerminal(`ID: ${p.id} | ${p.name} | Age: ${p.age} | ${p.disease} | Tel: ${p.contact}`));
        }
        showMainMenu();
        break;
      case '9':
        printTerminal('Simulated: Serialized patient records to hospital_data.txt successfully.');
        showMainMenu();
        break;
      case '10':
        printTerminal('Exiting program. All dynamic unique_ptr memory cleared via RAII.');
        break;
      default:
        printTerminal('Invalid choice! Please select 1-10.');
        showMainMenu();
    }
  } else if (terminalState === 'ADD_NAME') {
    tempPatient.name = val;
    terminalState = 'ADD_AGE';
    printTerminal('Enter Age:');
  } else if (terminalState === 'ADD_AGE') {
    tempPatient.age = parseInt(val) || 25;
    terminalState = 'ADD_DISEASE';
    printTerminal('Enter Disease:');
  } else if (terminalState === 'ADD_DISEASE') {
    tempPatient.disease = val;
    terminalState = 'ADD_CONTACT';
    printTerminal('Enter Contact:');
  } else if (terminalState === 'ADD_CONTACT') {
    tempPatient.contact = val;
    const added = hospital.addPatient(tempPatient.name, tempPatient.age, tempPatient.disease, tempPatient.contact);
    printTerminal(`Patient added successfully with ID: ${added.id}`);
    renderTree();
    updateStats();
    terminalState = 'MENU';
    showMainMenu();
  } else if (terminalState === 'SEARCH_ID') {
    const id = parseInt(val);
    const { found } = hospital.search(hospital.root, id);
    if (found) {
      printTerminal(`Patient Found! ID: ${found.id}, Name: ${found.name}, Condition: ${found.disease}`);
    } else {
      printTerminal(`Patient ID ${id} not found.`);
    }
    terminalState = 'MENU';
    showMainMenu();
  } else if (terminalState === 'DELETE_ID') {
    const id = parseInt(val);
    hospital.root = hospital.deleteNode(hospital.root, id);
    printTerminal(`Deleted Patient ID ${id} (if existed). AVL balanced.`);
    renderTree();
    updateStats();
    terminalState = 'MENU';
    showMainMenu();
  } else if (terminalState === 'APPT_ID') {
    tempPatient.apptId = parseInt(val);
    terminalState = 'APPT_TIME';
    printTerminal('Enter Time (e.g. 10:00 AM):');
  } else if (terminalState === 'APPT_TIME') {
    hospital.scheduleAppointment(tempPatient.apptId, val, 'Today');
    printTerminal('Appointment scheduled successfully in FIFO queue.');
    updateStats();
    terminalState = 'MENU';
    showMainMenu();
  }
}

// ==========================================
// 5. BENCHMARK SUITE
// ==========================================

document.getElementById('btn-run-benchmark').addEventListener('click', () => {
  const benchBtn = document.getElementById('btn-run-benchmark');
  benchBtn.innerText = 'Running Benchmark...';
  benchBtn.disabled = true;

  setTimeout(() => {
    const benchHospital = new HospitalSystem();
    const N = 10000;

    const t0 = performance.now();
    for (let i = 1; i <= N; i++) {
      benchHospital.addPatient(`P${i}`, 20 + (i % 60), 'Condition', '1234567890', i);
    }
    const t1 = performance.now();
    const timeMs = (t1 - t0).toFixed(2);
    const height = benchHospital.getHeight(benchHospital.root);

    document.getElementById('bench-time').innerText = `${timeMs} ms`;
    document.getElementById('bench-height').innerText = height;
    document.getElementById('benchmark-results').style.display = 'block';

    benchBtn.innerText = '🚀 Run 10,000 Operations Benchmark';
    benchBtn.disabled = false;
  }, 100);
});

// Initial Setup
resizeCanvas();
updateStats();
