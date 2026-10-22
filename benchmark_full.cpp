#include "hospital.hpp"
#include <chrono>
#include <random>
#include <algorithm>
#include <vector>
#include <cstdio>

using namespace std;
using namespace std::chrono;

int main()
{
    remove("hospital_data.txt");
    HospitalManagementSystem hospital;

    const int N = 10000;

    // ---------------- INSERTION ----------------
    cout << "=== INSERTION ===\n";
    auto t1 = high_resolution_clock::now();
    for (int i = 1; i <= N; i++) {
        hospital.addPatient("Patient" + to_string(i), 20 + (i % 60), "Condition", "0000000000", true);
    }
    auto t2 = high_resolution_clock::now();
    double insertMicros = duration<double, micro>(t2 - t1).count();

    cout << "Inserted " << N << " patients (sequential IDs) in " << insertMicros << " microseconds\n";
    cout << "Average insert time: " << (insertMicros / N) << " microseconds per patient\n";
    cout << "AVL tree height: " << hospital.getTreeHeight()
         << "  (unbalanced BST for same input would be height " << N << ")\n";

    // ---------------- SEARCH ----------------
    cout << "\n=== SEARCH ===\n";
    mt19937 rng(42);
    uniform_int_distribution<int> dist(1, N);
    const int searches = 100000;

    auto t3 = high_resolution_clock::now();
    for (int i = 0; i < searches; i++) {
        volatile bool found = hospital.exists(dist(rng));
        (void)found;
    }
    auto t4 = high_resolution_clock::now();
    double searchMicros = duration<double, micro>(t4 - t3).count();

    cout << "Performed " << searches << " random ID lookups in " << searchMicros << " microseconds\n";
    cout << "Average search time: " << (searchMicros / searches) << " microseconds per search\n";

    // ---------------- UPDATE ----------------
    cout << "\n=== UPDATE ===\n";
    const int updates = 10000;

    auto t5 = high_resolution_clock::now();
    for (int i = 0; i < updates; i++) {
        int id = dist(rng);
        hospital.updatePatientSilent(id, "UpdatedName", 50, "UpdatedCondition", "1111111111");
    }
    auto t6 = high_resolution_clock::now();
    double updateMicros = duration<double, micro>(t6 - t5).count();

    cout << "Performed " << updates << " random updates in " << updateMicros << " microseconds\n";
    cout << "Average update time: " << (updateMicros / updates) << " microseconds per update\n";

    // ---------------- DELETE ----------------
    cout << "\n=== DELETE ===\n";
    const int deletes = N / 2; // delete half the patients (5000), in random order

    vector<int> idsToDelete;
    for (int i = 1; i <= N; i++) idsToDelete.push_back(i);
    shuffle(idsToDelete.begin(), idsToDelete.end(), rng);
    idsToDelete.resize(deletes);

    auto t7 = high_resolution_clock::now();
    for (int id : idsToDelete) {
        hospital.deletePatient(id, true);
    }
    auto t8 = high_resolution_clock::now();
    double deleteMicros = duration<double, micro>(t8 - t7).count();

    cout << "Deleted " << deletes << " patients (random order) in " << deleteMicros << " microseconds\n";
    cout << "Average delete time: " << (deleteMicros / deletes) << " microseconds per delete\n";
    cout << "AVL tree height after deleting " << deletes << " of " << N
         << " patients: " << hospital.getTreeHeight() << " (still balanced)\n";

    remove("hospital_data.txt");
    return 0;
}