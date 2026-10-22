# 🏥 Hospital Management System (High-Performance C++)

A high-performance Hospital Management System implemented in modern C++ utilizing a **hybrid data structure architecture** (AVL Tree + Owning Linked List via `std::unique_ptr` + FIFO Queue) to provide logarithmic record lookups, deterministic memory management, and file persistence.

---

## ⚡ Architecture & Design Highlights

- **🌲 Self-Balancing AVL Tree Indexing:** Guarantees strict $O(\log n)$ worst-case time complexity for patient search, insertion, and deletion by performing automatic LL, RR, LR, and RL rotations.
- **🛡️ RAII & Modern Smart Pointer Ownership:** The linked list chain exclusively owns memory lifecycles through `std::unique_ptr<Patient>`, while the AVL tree maintains non-owning fast lookup pointers, eliminating raw pointer leaks and dangling references.
- **⏱️ Appointment Scheduling Queue:** Uses a FIFO `std::queue<Appointment>` to model real-world patient appointment workflows.
- **💾 File Persistence:** Built-in serialization and deserialization engine saving system state to `hospital_data.txt` across executions.
- **📊 Benchmark Suite:** Includes `benchmark_full.cpp` measuring microsecond-level performance across 10,000+ insertions and 100,000 random ID lookups.

---

## 📈 Time & Space Complexity Analysis

| Operation | Hybrid AVL Implementation | Unbalanced BST / Linked List |
| :--- | :---: | :---: |
| **Search Patient by ID** | **$O(\log n)$** | $O(n)$ |
| **Insert Patient** | **$O(\log n)$** | $O(n)$ |
| **Delete Patient** | **$O(\log n)$** | $O(n)$ |
| **Schedule Appointment** | **$O(1)$** | $O(1)$ |
| **Memory Space** | **$O(n)$** | $O(n)$ |

---

## 📁 Repository Structure

```text
hospital-management-system/
│
├── hospital.hpp        # Class declarations, Patient & Appointment structs, AVL prototypes
├── hospital.cpp        # AVL balancing logic, rotations, CRUD, and file I/O operations
├── main.cpp            # Interactive CLI menu application
├── benchmark_full.cpp  # High-resolution benchmark suite (10k insertions, 100k queries)
├── .gitignore          # Git ignore rules for compiled binaries & data
└── README.md           # Documentation & architecture breakdown
```

---

## 🛠️ Build & Run Instructions

### 1. Compile the Main Application
Using **GCC / g++**:
```bash
g++ -std=c++14 main.cpp hospital.cpp -o hospital_app
./hospital_app
```

On Windows (Command Prompt / PowerShell):
```cmd
g++ -std=c++14 main.cpp hospital.cpp -o hospital_app.exe
.\hospital_app.exe
```

---

### 2. Run the Performance Benchmark Suite
To test AVL self-balancing performance with 10,000 patients and 100,000 queries:
```bash
g++ -std=c++14 -O3 benchmark_full.cpp hospital.cpp -o benchmark
./benchmark
```

---

## 👤 Author

- **Sarthak Sati** ([@SarthakSati](https://github.com/SarthakSati))
