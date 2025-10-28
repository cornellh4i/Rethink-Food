'use client'
import { Organization } from "@/app/page";
import { X } from "lucide-react";

export default function OrganizationDetailPopup({
  org,
  onClose,
}: {
  org: Organization;
  onClose: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 relative max-h-[60vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      <h2 className="text-lg font-semibold text-gray-900 pr-6">
        {org.name}
      </h2>

      <div className="flex flex-wrap gap-2 text-xs text-gray-700 mt-2">
        {org.org_type && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
            <span
              className="block w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  org.org_type === "restaurant" ? "#1e453e" : "#00D100",
              }}
            />
            <span className="capitalize">{org.org_type}</span>
          </span>
        )}

        {org.borough && (
          <span className="px-2 py-1 bg-gray-100 rounded">
            {org.borough}
          </span>
        )}

        {org.area && (
          <span className="px-2 py-1 bg-gray-100 rounded">
            {org.area}
          </span>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-700 leading-relaxed">
        {org.street_address && (
          <p className="font-medium text-gray-800">
            {org.street_address}
          </p>
        )}
        {(org.city || org.state || org.zip) && (
          <p>
            {org.city}, {org.state} {org.zip}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
        {org.number_of_meals !== undefined && (
          <div>
            <p className="text-xs text-gray-500">Meals</p>
            <p className="font-medium text-gray-900">
              {org.number_of_meals}
            </p>
          </div>
        )}

        {org.updated_at && (
          <div>
            <p className="text-xs text-gray-500">Last updated</p>
            <p className="font-medium text-gray-900">
              {new Date(org.updated_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {org.website && (
        <div className="mt-6">
          <a
            href={org.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg px-4 py-2 transition-colors"
          >
            Visit Website
          </a>
        </div>
      )}
    </div>
  );
}
