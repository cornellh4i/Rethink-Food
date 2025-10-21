'use client'
import Map from "../components/Map";
import OrgList from "../components/OrgList";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-screen">
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
          <button
            onClick={() => router.push('/login')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Login
          </button>
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
  );
}