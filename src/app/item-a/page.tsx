'use client'

import ProtectedRoute from '../../components/ProtectedRoute'
import Dashboard from '../../components/Dashboard'

export default function ItemA() {
  return (
    <ProtectedRoute>
      <Dashboard>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item A</h1>
          <p className="text-gray-600">
            This is the content for Item A. You can add any content you need here.
          </p>
        </div>
      </Dashboard>
    </ProtectedRoute>
  )
}
