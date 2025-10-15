'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
        return
      }

      router.push('/login')
    } catch (err) {
      setError('Failed to log out. Please try again.')
      console.error('Logout error:', err)

    }
  } 

  return (
    <div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        {'Logout'}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
