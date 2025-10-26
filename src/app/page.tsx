'use client'
import { useEffect, useState } from "react";
import Map from "../components/Map";
import OrgList from "../components/OrgList";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { FilterProvider } from "../context/FilterContext";
import MetricBar from "@/components/MetricBar";
import FilterBar from "@/components/FilterBar";

export default function Home() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserEmail(session?.user?.email || null)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserEmail(null)
  }

  return (
    <FilterProvider>
    <div className="flex flex-col h-screen">
      <MetricBar />
      <div className="bg-white border-b border-gray-200 px-4 py-3 mt-[20px]">
        <FilterBar />
      </div>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Find a partner"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Filter by Category
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Filter by Area
          </button>
          {userEmail ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/5 border-r border-gray-300 overflow-y-auto bg-gray-50">
          <div className="p-4">
            <OrgList />
          </div>
        </div>

        <div className="w-3/5">
          <Map />
        </div>
      </div>
    </div>
    </FilterProvider>
  );
}