#ifndef HOSPITAL_HPP
#define HOSPITAL_HPP

#include <iostream>
#include <string>
#include <memory>
#include <queue>
#include <fstream>
#include <sstream>

using namespace std;

struct Patient
{
    int id;
    string name;
    int age;
    string disease;
    string contact;

    unique_ptr<Patient> next;  // OWNS the next node (linked list owns memory)
    Patient* left;             // non-owning — AVL tree just references existing nodes
    Patient* right;            // non-owning
    int height;

    Patient(int i, string n, int a, string d, string c);
};

struct Appointment
{
    int patientId;
    string time;
    string date;

    Appointment(int id, string t, string d);
};

class HospitalManagementSystem
{
private:
    unique_ptr<Patient> head;  // owns the entire chain of patients
    Patient* root;             // non-owning pointer into the same nodes (AVL tree)
    queue<Appointment> appointments;
    int totalPatients;

    Patient* insertAVL(Patient* node, Patient* newPatient);
    Patient* rightRotate(Patient* y);
    Patient* leftRotate(Patient* x);
    Patient* searchAVL(Patient* root, int id);
    Patient* deleteAVL(Patient* node, int id);
    Patient* findMin(Patient* node);
    void inorderTraversal(Patient* root);
    void displayPatient(Patient* patient);
    void removeFromLinkedList(Patient* target);
    int heightOf(Patient* node);

public:
    HospitalManagementSystem();

    void addPatient(string name, int age, string disease, string contact, bool silent = false);
    void searchPatient(int id);
    void deletePatient(int id, bool silent = false);
    void updatePatient(int id);
    bool updatePatientSilent(int id, string name, int age, string disease, string contact); // for benchmarking, no cin/cout

    int getTreeHeight();       // for benchmarking: returns current AVL tree height
    bool exists(int id);       // for benchmarking: silent search, no console output

    void scheduleAppointment(int patientId, string time, string date);
    void displayNextAppointment();
    void completeAppointment();

    void displayAllPatients();
    void saveToFile();
    void loadFromFile();

    // No custom destructor needed — unique_ptr chain cleans up automatically (RAII)
};

#endif