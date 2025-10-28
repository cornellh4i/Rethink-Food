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
        
        <div className="flex flex-1 overflow-hidden mt-[32px]">
          <div className="w-2/5 border-r border-gray-300 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <OrgList />
            </div>
          </div>

          <div className="w-3/5 relative">
            <Map />
            <FilterBar />
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}