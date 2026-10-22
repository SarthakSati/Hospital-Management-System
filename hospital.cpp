#include "hospital.hpp"

Patient::Patient(int i, string n, int a, string d, string c)
{
    id = i;
    name = n;
    age = a;
    disease = d;
    contact = c;
    next = nullptr;
    left = nullptr;
    right = nullptr;
    height = 1;
}

Appointment::Appointment(int id, string t, string d)
{
    patientId = id;
    time = t;
    date = d;
}

HospitalManagementSystem::HospitalManagementSystem()
{
    head = nullptr;
    root = nullptr;
    totalPatients = 0;
    loadFromFile();   // restore data from disk on startup
}

// ---------- Small helper to safely read a node's height ----------
int HospitalManagementSystem::heightOf(Patient* node)
{
    return node ? node->height : 0;
}

// ---------- Right rotation ----------
Patient* HospitalManagementSystem::rightRotate(Patient* y)
{
    Patient* x = y->left;
    Patient* T2 = x->right;

    x->right = y;
    y->left = T2;

    y->height = 1 + max(heightOf(y->left), heightOf(y->right));
    x->height = 1 + max(heightOf(x->left), heightOf(x->right));

    return x;
}

// ---------- Left rotation ----------
Patient* HospitalManagementSystem::leftRotate(Patient* x)
{
    Patient* y = x->right;
    Patient* T2 = y->left;

    y->left = x;
    x->right = T2;

    x->height = 1 + max(heightOf(x->left), heightOf(x->right));
    y->height = 1 + max(heightOf(y->left), heightOf(y->right));

    return y;
}

// ---------- AVL insertion with rebalancing ----------
Patient* HospitalManagementSystem::insertAVL(Patient* node, Patient* newPatient)
{
    if (node == nullptr)
        return newPatient;

    if (newPatient->id < node->id)
        node->left = insertAVL(node->left, newPatient);
    else if (newPatient->id > node->id)
        node->right = insertAVL(node->right, newPatient);
    else
        return node; // duplicate IDs not allowed

    node->height = 1 + max(heightOf(node->left), heightOf(node->right));

    int balance = heightOf(node->left) - heightOf(node->right);

    // Left Left Case
    if (balance > 1 && newPatient->id < node->left->id)
        return rightRotate(node);

    // Right Right Case
    if (balance < -1 && newPatient->id > node->right->id)
        return leftRotate(node);

    // Left Right Case
    if (balance > 1 && newPatient->id > node->left->id) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }

    // Right Left Case
    if (balance < -1 && newPatient->id < node->right->id) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }

    return node;
}

// ---------- Search ----------
Patient* HospitalManagementSystem::searchAVL(Patient* root, int id)
{
    if (root == nullptr || root->id == id)
        return root;
    if (id < root->id)
        return searchAVL(root->left, id);
    return searchAVL(root->right, id);
}

// ---------- Find smallest node in a subtree (in-order successor helper) ----------
Patient* HospitalManagementSystem::findMin(Patient* node)
{
    while (node->left != nullptr)
        node = node->left;
    return node;
}

// ---------- Remove a node from the owning linked list (this is what actually frees memory) ----------
// IMPORTANT: matches by POINTER ADDRESS, not by id. During two-children AVL deletion we
// copy the successor's id onto the node being kept, which can create a temporary duplicate
// id in the list. Matching by address (identity) avoids ever freeing the wrong node.
void HospitalManagementSystem::removeFromLinkedList(Patient* target)
{
    if (head == nullptr) return;

    if (head.get() == target) {
        head = move(head->next);   // old head's unique_ptr drops here -> memory freed
        return;
    }

    Patient* prev = head.get();
    while (prev->next != nullptr) {
        if (prev->next.get() == target) {
            prev->next = move(prev->next->next);  // splices out & frees the node
            return;
        }
        prev = prev->next.get();
    }
}

// ---------- AVL deletion with rebalancing ----------
Patient* HospitalManagementSystem::deleteAVL(Patient* node, int id)
{
    if (node == nullptr)
        return node;

    if (id < node->id)
        node->left = deleteAVL(node->left, id);
    else if (id > node->id)
        node->right = deleteAVL(node->right, id);
    else
    {
        // Node found
        if (node->left == nullptr || node->right == nullptr)
        {
            Patient* child = node->left ? node->left : node->right;
            removeFromLinkedList(node);       // remove by address (frees this exact node's memory)
            return child;                     // caller attaches this in node's place
        }
        else
        {
            // Two children: copy successor's DATA (not 'next') into this node
            Patient* successor = findMin(node->right);
            node->id = successor->id;
            node->name = successor->name;
            node->age = successor->age;
            node->disease = successor->disease;
            node->contact = successor->contact;

            // Delete the successor node from the right subtree
            node->right = deleteAVL(node->right, successor->id);
        }
    }

    node->height = 1 + max(heightOf(node->left), heightOf(node->right));

    int balance = heightOf(node->left) - heightOf(node->right);

    // Left Left Case
    if (balance > 1 && heightOf(node->left->left) >= heightOf(node->left->right))
        return rightRotate(node);

    // Left Right Case
    if (balance > 1) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }

    // Right Right Case
    if (balance < -1 && heightOf(node->right->right) >= heightOf(node->right->left))
        return leftRotate(node);

    // Right Left Case
    if (balance < -1) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }

    return node;
}

// ---------- Display helpers ----------
void HospitalManagementSystem::inorderTraversal(Patient* root)
{
    if (root != nullptr) {
        inorderTraversal(root->left);
        displayPatient(root);
        inorderTraversal(root->right);
    }
}

void HospitalManagementSystem::displayPatient(Patient* patient)
{
    cout << "\n--------------------------------";
    cout << "\nPatient ID: " << patient->id;
    cout << "\nName: " << patient->name;
    cout << "\nAge: " << patient->age;
    cout << "\nDisease: " << patient->disease;
    cout << "\nContact: " << patient->contact;
    cout << "\n--------------------------------\n";
}

// ---------- Add patient ----------
void HospitalManagementSystem::addPatient(string name, int age, string disease, string contact, bool silent)
{
    totalPatients++;
    int id = totalPatients;

    auto newPatient = make_unique<Patient>(id, name, age, disease, contact);
    Patient* rawPtr = newPatient.get();   // grab non-owning pointer BEFORE moving ownership

    if (head == nullptr) {
        head = move(newPatient);
    } else {
        Patient* temp = head.get();
        while (temp->next != nullptr)
            temp = temp->next.get();
        temp->next = move(newPatient);
    }

    root = insertAVL(root, rawPtr);   // tree references the same memory, doesn't own it

    if (!silent) {
        cout << "\nPatient added successfully!";
        cout << "\nAssigned Patient ID: " << id << endl;
    }
}

// ---------- Benchmark helper: current AVL tree height ----------
int HospitalManagementSystem::getTreeHeight()
{
    return heightOf(root);
}

// ---------- Benchmark helper: silent search, no console output ----------
bool HospitalManagementSystem::exists(int id)
{
    return searchAVL(root, id) != nullptr;
}

// ---------- Search patient ----------
void HospitalManagementSystem::searchPatient(int id)
{
    Patient* result = searchAVL(root, id);
    if (result != nullptr)
        displayPatient(result);
    else
        cout << "\nPatient not found!" << endl;
}

// ---------- Delete patient ----------
void HospitalManagementSystem::deletePatient(int id , bool silent)
{
    if (searchAVL(root, id) == nullptr) {
        cout << "\nPatient not found!" << endl;
        return;
    }
    root = deleteAVL(root, id);
    cout << "\nPatient deleted successfully!" << endl;
}

// ---------- Update patient ----------
void HospitalManagementSystem::updatePatient(int id)
{
    Patient* result = searchAVL(root, id);
    if (result == nullptr) {
        cout << "\nPatient not found!" << endl;
        return;
    }

    cout << "\nPatient found:";
    displayPatient(result);

    cin.ignore(); // clear leftover newline from previous cin >>

    cout << "\nEnter new Name: ";
    getline(cin, result->name);

    cout << "Enter new Age: ";
    cin >> result->age;
    cin.ignore();

    cout << "Enter new Disease: ";
    getline(cin, result->disease);

    cout << "Enter new Contact: ";
    getline(cin, result->contact);

    cout << "\nPatient record updated successfully!" << endl;
}

// ---------- Appointments ----------
void HospitalManagementSystem::scheduleAppointment(int patientId, string time, string date)
{
    if (searchAVL(root, patientId) != nullptr) {
        appointments.push(Appointment(patientId, time, date));
        cout << "\nAppointment scheduled successfully!" << endl;
    } else {
        cout << "\nPatient ID not found!" << endl;
    }
}

void HospitalManagementSystem::displayNextAppointment()
{
    if (!appointments.empty()) {
        Appointment next = appointments.front();
        cout << "\nNext Appointment:";
        cout << "\nPatient ID: " << next.patientId;
        cout << "\nTime: " << next.time;
        cout << "\nDate: " << next.date << endl;
    } else {
        cout << "\nNo appointments in queue!" << endl;
    }
}

void HospitalManagementSystem::completeAppointment()
{
    if (!appointments.empty()) {
        appointments.pop();
        cout << "\nAppointment marked as completed!" << endl;
    } else {
        cout << "\nNo appointments in queue!" << endl;
    }
}

// ---------- Display all ----------
void HospitalManagementSystem::displayAllPatients()
{
    cout << "\nAll Patients (Sorted by ID):";
    inorderTraversal(root);
}

// ---------- Persistence: save ----------
void HospitalManagementSystem::saveToFile()
{
    ofstream file("hospital_data.txt");
    Patient* temp = head.get();

    while (temp != nullptr) {
        file << temp->id << ","
             << temp->name << ","
             << temp->age << ","
             << temp->disease << ","
             << temp->contact << "\n";
        temp = temp->next.get();
    }

    file.close();
    cout << "\nData saved to file successfully!" << endl;
}

// ---------- Persistence: load ----------
void HospitalManagementSystem::loadFromFile()
{
    ifstream file("hospital_data.txt");
    if (!file.is_open()) {
        cout << "\nNo existing data file found. Starting fresh." << endl;
        return;
    }

    string line;
    int maxId = 0;

    while (getline(file, line))
    {
        if (line.empty()) continue;

        stringstream ss(line);
        string idStr, name, ageStr, disease, contact;

        getline(ss, idStr, ',');
        getline(ss, name, ',');
        getline(ss, ageStr, ',');
        getline(ss, disease, ',');
        getline(ss, contact, ',');

        int id = stoi(idStr);
        int age = stoi(ageStr);

        auto newPatient = make_unique<Patient>(id, name, age, disease, contact);
        Patient* rawPtr = newPatient.get();

        if (head == nullptr) {
            head = move(newPatient);
        } else {
            Patient* temp = head.get();
            while (temp->next != nullptr)
                temp = temp->next.get();
            temp->next = move(newPatient);
        }

        root = insertAVL(root, rawPtr);

        if (id > maxId)
            maxId = id;
    }

    totalPatients = maxId;
    file.close();
    cout << "\nLoaded existing patient records from file." << endl;
}

bool HospitalManagementSystem::updatePatientSilent(int id, string name, int age, string disease, string contact)
{
    Patient* result = searchAVL(root, id);
    if (result == nullptr) return false;

    result->name = name;
    result->age = age;
    result->disease = disease;
    result->contact = contact;
    return true;
}