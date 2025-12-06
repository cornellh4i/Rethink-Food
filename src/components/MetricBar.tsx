"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUtensils, faDollarSign, faXmark } from "@fortawesome/free-solid-svg-icons";

interface MetricBarProps {
  organization: any;
  onClose: () => void;
}

export default function MetricBar({ organization, onClose }: MetricBarProps) {
  if (!organization || organization.org_type?.toLowerCase() !== "cbo") {
    return null;
  }

  const mealsPerWeek = organization.meal_count || 0;
  const povertyPercent = organization.percent_below_poverty_served || 0;
  const quarterGoal = organization.quarter_funding_goal || 0;
  const website = organization.website || "#";
  const cboName = organization.name || "this organization";

  // Don't show poverty metric if it's 0
  const showPovertyMetric = povertyPercent > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-[40]">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Section - Impact Summary */}
          <div className="flex-1">
            {/* Header */}
            <h3 className="text-2xl font-bold text-black mb-2">
              Your Support Matters
            </h3>
            
            {/* Subheading with org name highlighted */}
            <p className="text-base text-gray-700 mb-4">
              For <span className="font-semibold text-[#2D5F4F]">{cboName}</span>, your donation supports:
            </p>
            
            {/* Stats Row */}
            <div className="flex gap-6">
              {/* Meals Metric */}
              {mealsPerWeek > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#B6F3C7] flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faUtensils} className="w-5 h-5 text-[#2D5F4F]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-black leading-tight">{mealsPerWeek}</div>
                    <div className="text-sm text-gray-600 mt-0.5">meals served per week</div>
                  </div>
                </div>
              )}

              {/* Poverty Metric */}
              {showPovertyMetric && (
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#B6F3C7] flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-[#2D5F4F]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-black leading-tight">{povertyPercent}%</div>
                    <div className="text-sm text-gray-600 mt-0.5">of recipients living below the<br />poverty line</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Donation CTA */}
          <div className="flex flex-col items-start md:items-end gap-3">
            {/* Prompt Text */}
            <div className="text-base text-gray-800 md:text-right max-w-xs">
              Help <span className="font-semibold text-[#2D5F4F]">{cboName}</span> reach their quarter funding goal of
            </div>
            
            {/* Funding Amount in Pill */}
            {quarterGoal > 0 && (
              <div className="inline-block px-4 py-1.5 bg-[#B6F3C7] rounded-full">
                <span className="text-xl font-bold text-[#2D5F4F]">
                  ${quarterGoal.toLocaleString()}
                </span>
              </div>
            )}
            
            {/* Donate Button */}
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold rounded-full transition-colors shadow-md text-base uppercase tracking-wide"
            >
              DONATE NOW
            </a>
          </div>
        </div>

        {/* Close button - only closes MetricBar, not the popup */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close metric bar"
        >
          <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}