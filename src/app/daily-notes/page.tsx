"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import Dashboard from "../../components/Dashboard";

export default function DailyNotesPage() {
  return (
    <ProtectedRoute>
      <Dashboard>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Daily Notes</h1>
          <p className="text-gray-600">DailyNotesPage component working</p>
        </div>
      </Dashboard>
    </ProtectedRoute>
  );
}
