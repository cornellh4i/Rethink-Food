'use client'

import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import LogoutButton from '@/components/LogoutButton'


export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
        //TODO
    }

    getUser()
  }, [router])


  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-green-600">
          Login Successful!
        </h1>
        {email && <p className="text-gray-700">Welcome, {email}</p>}

        <LogoutButton/>
      </div>
    </div>
  )
}