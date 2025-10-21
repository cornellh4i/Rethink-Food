'use client'
import React from 'react';
import { useState, useEffect } from 'react';

type Organization = {
  id: number;
  name: string;
  org_type?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  area?: string;
  website?: string | null;
};

export default function OrgList() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch('/api/organizations');
        const data = await res.json();
      setOrgs(data.organizations || []);
      } catch (err) {
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrgs();
  }, []);


  if (loading) return <p>Loading organizations...</p>;


  return (
    <div className="space-y-4">
      {orgs.map((org) => (
        <div 
          key={org.id} 
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <h3 className="text-lg text-gray-700 font-semibold mb-2">{org.name}</h3>

          <div className="flex gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
              {org.org_type}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              {org.area}
            </span>
          </div>
          
          <div className="text-gray-600 text-sm mb-3">
            <p>{org.street_address}</p>
            <p>{org.city}, {org.state} {org.zip}</p>
          </div>
          
          {org.website && (
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              Website
            </button>
          )}
        </div>
      ))}
    </div>
  );
}