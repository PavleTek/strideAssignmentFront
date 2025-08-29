"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import Dashboard from "../../components/Dashboard";

export default function SpacesPage() {
  return (
    <ProtectedRoute>
      <Dashboard>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Spaces</h1>
          <p className="text-gray-600">SpacesPage component working</p>
        </div>
      </Dashboard>
    </ProtectedRoute>
  );
}
