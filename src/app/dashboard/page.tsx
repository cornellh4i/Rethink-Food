'use client'

import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
        //TODO
    }

    getUser()
  }, [router])

  const handleLogout = async () => {
    //TODO
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-green-600">
          Login Successful!
        </h1>
        {email && <p className="text-gray-700">Welcome, {email}</p>}

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  )
}