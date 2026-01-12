import React from "react";
import { HiOutlineDocumentDownload } from "react-icons/hi";

export default function PendingDeferrals({ deferrals = [], onGeneratePDF }) {
  if (!deferrals.length) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No pending deferrals available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {deferrals.map((deferral, index) => (
        <div
          key={index}
          className="bg-white border rounded-lg shadow hover:shadow-md p-4 cursor-pointer transition relative"
          onClick={() => onGeneratePDF(deferral)}
        >
          {/* Top row: Deferral No | Business Name */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-800">{deferral.deferralNumber}</h3>
            <span className="text-sm text-[#1E2B5F] font-semibold">{deferral.businessName}</span>
          </div>

          {/* Customer Name */}
          <p className="text-xs text-gray-500 mb-1">
            {deferral.customerName}
          </p>

          {/* Current Approver */}
          <p className="text-xs text-gray-400 mb-1">
            Current Approver: <span className="text-gray-700">{typeof deferral.currentApprover === 'string' ? deferral.currentApprover : (deferral.currentApprover && (deferral.currentApprover.name || deferral.currentApprover.email || String(deferral.currentApprover))) || 'N/A'}</span>
          </p>

          {/* Status */}
          <p
            className={`text-xs font-semibold ${
              deferral.status === "Pending" ? "text-yellow-600" :
              deferral.status === "Approved" ? "text-green-600" :
              "text-red-600"
            }`}
          >
            {deferral.status}
          </p>

          {/* PDF icon */}
          <HiOutlineDocumentDownload className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" />
        </div>
      ))}
    </div>
  );
}
