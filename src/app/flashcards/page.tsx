'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import Dashboard from '../../components/Dashboard';

export default function FlashcardsPage() {
  return (
    <ProtectedRoute>
      <Dashboard>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Flashcards</h1>
          <p className="text-gray-600">FlashcardsPage component working</p>
        </div>
      </Dashboard>
    </ProtectedRoute>
  );
}
