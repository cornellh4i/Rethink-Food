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
          className="w-full text-left rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          style={{ backgroundColor: '#F5F5F5' }}
          onClick={() => onOrganizationSelect(org)}
        >
          <h3 className="text-black mb-1" style={{fontWeight: 600, fontSize: '18px', lineHeight: '140%' }}>
            {org.name}
          </h3>

          <p className="text-sm text-black mb-3">
            {org.org_type} · {org.borough}
          </p>

          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs text-black" style={{ backgroundColor: '#E6E6E6'}}>
              100+ meals weekly
            </span>
            <span className="px-3 py-1 rounded-full text-xs text-black" style={{ backgroundColor: '#E6E6E6'}}>
              Halal
            </span>
            <span className="px-3 py-1 rounded-full text-xs text-black" style={{ backgroundColor: '#E6E6E6'}}>
              Afghan
            </span>
            <span className="px-3 py-1 rounded-full text-xs text-black" style={{ backgroundColor: '#E6E6E6'}}>
              Hot Food
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}