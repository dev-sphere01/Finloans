import React from 'react'
import { PermissionGuard } from '@/components/permissions'

const Settings = () => {
  return (
    <PermissionGuard module="settings" showMessage>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-gray-600">Application settings and configuration options will be available here.</p>
      </div>
    </PermissionGuard>
  )
}

export default Settings