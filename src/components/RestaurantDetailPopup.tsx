'use client';
import { Organization } from "@/app/page";

export default function RestaurantDetailPopup({ restaurant }: { restaurant: Organization }) {
  return (
    <div className="p-8 w-[350px]">
      <div className="h-32 bg-gray-300 mb-4 rounded-lg" />
      <h2 className="text-lg text-black font-semibold">{restaurant.name}</h2>
      <p className="text-xs text-black">Meal Maker Resturant · {restaurant.borough}</p>
      <p className="text-xs text-black">{restaurant.street_address}, {restaurant.state}, {restaurant.zip} </p>
        
        <div className="flex flex-wrap gap-2 mt-3">
         {/* Placeholder tags */}
        <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
        Halal
      </span>
        <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
        Afghan
        </span>
        <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
        Hot food
        </span>
        </div>

        <div className="mt-6">
  <h2 className="text-lg text-black font-semibold mb-4">Support My Distribution Partners</h2>

  <div className="space-y-4 text-black">
    {[
      { name: "Community Center A", meals: 500, needed: 250 },
      { name: "Community Center B", meals: 500, needed: 250 },
      {name: "Community Center C", meals: 500, needed: 250 }
    ].map((partner) => (
      <div
        key={partner.name}
        className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition"
      >
        {/* Partner Name */}
        <h3 className="text-base font-semibold mb-2">{partner.name}</h3>

        {/* Meals + Donation Info */}
        <div className="flex justify-between items-center mb-1">
          <div>
            <p className="text-xl font-bold">{partner.meals}</p>
            <p className="text-xs text-gray-500">meals needed / week</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">${partner.needed}</p>
            <p className="text-xs text-gray-500">still needed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-3">
          <div
            className="bg-gray-600 h-2 rounded-full"
            style={{ width: "50%" }} // adjust as needed
          ></div>
        </div>

        {/* About Button */}
        <button className="text-sm font-semibold text-gray-700 hover:text-gray-800 flex items-center">
          About {partner.name} →
        </button>
        </div>
        ))}
        </div>
        </div>

      
    </div>
    
  );
}
