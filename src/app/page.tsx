'use client';

import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../components/Dashboard';

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Stride App</h1>
          <p className="text-gray-600">This is your dashboard. Use the sidebar to navigate between Item A and Item B.</p>
        </div>
      </Dashboard>
    </ProtectedRoute>
  );
}
