'use client'
import React, { useState, useEffect } from 'react';
import { useFilter } from '@/context/FilterContext';
import { Organization } from '@/app/page';

export default function OrgList({
  onOrganizationSelect,
}: {
  onOrganizationSelect: (org: Organization) => void;
}) {
  const { filteredDestinations } = useFilter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (filteredDestinations !== undefined) {
      setLoading(false);
    }
  }, [filteredDestinations]);

  if (loading) {
    return <p className="text-gray-500 text-sm px-2">Loading organizations...</p>;
  }

  if (!Array.isArray(filteredDestinations) || filteredDestinations.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4 text-sm">
        No organizations found
      </p>
    );
  }

  return (
    <div className="space-y-3 max-h-full overflow-y-auto pr-2">
      {filteredDestinations.map((org: Organization) => (
        <button
          key={org.id}
          className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onOrganizationSelect(org)}
        >
          <h3 className="text-base text-gray-800 font-semibold mb-1">
            {org.name}
          </h3>

          <div className="flex gap-2 mb-2 text-xs text-gray-700 flex-wrap">
            {org.org_type && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                <span className="block w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      org.org_type === "restaurant" ? "#1e453e" : "#00D100",
                  }}
                />
                <span>{org.org_type}</span>
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

          <div className="text-gray-600 text-xs leading-relaxed">
            {org.street_address && (
              <p>{org.street_address}</p>
            )}
            {(org.city || org.state || org.zip) && (
              <p>
                {org.city}, {org.state} {org.zip}
              </p>
            )}
          </div>

          {org.website && (
            <p className="text-green-600 text-xs font-medium mt-2 underline">
              Visit website →
            </p>
          )}
        </button>
      ))}
    </div>
  );
}
