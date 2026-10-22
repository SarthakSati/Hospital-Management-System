#include<bits/stdc++.h>
#include "hospital.hpp"
using namespace std;

int main() 
{
    HospitalManagementSystem hospital;
    int choice;

    do 
    {
        cout << "\n=== Hospital Management System ===";
        cout << "\n1. Add New Patient";
        cout << "\n2. Search Patient";
        cout << "\n3. Update Patient";
        cout << "\n4. Delete Patient";
        cout << "\n5. Schedule Appointment";
        cout << "\n6. Display Next Appointment";
        cout << "\n7. Complete Current Appointment";
        cout << "\n8. Display All Patients";
        cout << "\n9. Save Data to File";
        cout << "\n10. Exit";
        cout << "\nEnter your choice: ";
        cin >> choice;

        switch (choice) 
        {
            case 1: 
            {
                string name, disease, contact;
                int age;
                cout << "\nEnter patient details:";
                cout << "\nName: ";
                cin.ignore();
                getline(cin, name);
                cout << "Age: ";
                cin >> age;
                cout << "Disease: ";
                cin.ignore();
                getline(cin, disease);
                cout << "Contact: ";
                getline(cin, contact);
                hospital.addPatient(name, age, disease, contact);
                break;
            }
            case 2: 
            {
                int id;
                cout << "\nEnter Patient ID: ";
                cin >> id;
                hospital.searchPatient(id);
                break;
            }
            case 3:
            {
                int id;
                cout << "\nEnter Patient ID to update: ";
                cin >> id;
                hospital.updatePatient(id);
                break;
            }
            case 4:
            {
                int id;
                cout << "\nEnter Patient ID to delete: ";
                cin >> id;
                hospital.deletePatient(id);
                break;
            }
            case 5: 
            {
                int id;
                string time, date;
                cout << "\nEnter Patient ID: ";
                cin >> id;
                cout << "Enter Time (HH:MM): ";
                cin >> time;
                cout << "Enter Date (DD/MM/YYYY): ";
                cin >> date;
                hospital.scheduleAppointment(id, time, date);
                break;
            }
            case 6:
                hospital.displayNextAppointment();
                break;
            case 7:
                hospital.completeAppointment();
                break;
            case 8:
                hospital.displayAllPatients();
                break;
            case 9:
                hospital.saveToFile();
                break;
            case 10:
                hospital.saveToFile(); // auto-save on exit so nothing is lost
                cout << "\nThank you for using Hospital Management System!\n";
                break;
            default:
                cout << "\nInvalid choice! Please try again.\n";
        }
    } while (choice != 10);

    return 0;
}