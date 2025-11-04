'use client';
import { useState } from "react";
import { Organization } from "@/app/page";

export default function CBODetailPopup({ cbo }: { cbo: Organization }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-2.5 w-[300px]">
   
      <div className="h-32 bg-gray-300 mb-4 rounded-lg" />

      <h2 className="text-xl text-black font-semibold">{cbo.name}</h2>
      <p className="text-xs text-black"> Community Based Organization · {cbo.borough}</p>

        <div className="flex flex-wrap gap-2 mt-3">
         {/* Placeholder tags */}
        <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
        Halal
      </span>
        <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
        Open Distribution
        </span>
        <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
        Serves Minors
        </span>
        </div>

        

      

      <div className="mt-4 flex justify-between text-sm">
        <div>
          <p className="text-gray-500 text-xs">500</p>
          <p className="font-medium text-gray-800">meals needed / year</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">$250 </p>
          <p className="font-medium text-gray-800">still needed</p>
        </div>
      </div>

      <button className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg">
        Give to this organization
      </button>

   
      <div className="mt-6 flex border-b border-gray-200">
        {["overview", "demographics", "about"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 capitalize ${
              activeTab === tab
                ? "border-b-2 border-gray-600 text-gray-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

    
      <div className="mt-4 text-xs text-gray-700 leading-relaxed">
        {activeTab === "overview" && <p>Service overview dummy text.</p>}
        {activeTab === "demographics" && (
            <div className="space-y-2">
                <p className = "font-medium text-xs text-gray-800" > Age</p>
                <p className = "font-medium text-xs text-gray-800" >Poverty Line</p>
                <p className = "font-medium text-xs text-gray-800" > Race</p>
            </div>
            )}
        {activeTab === "about" && <p>About this CBO dummy text</p>}
      </div>
    </div>
  );
}
