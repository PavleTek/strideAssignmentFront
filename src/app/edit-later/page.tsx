'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import Dashboard from '../../components/Dashboard';

export default function EditLaterPage() {
  return (
    <ProtectedRoute>
      <Dashboard>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Later</h1>
          <p className="text-gray-600">EditLaterPage comopnent working</p>
        </div>
      </Dashboard>
    </ProtectedRoute>
  );
}
