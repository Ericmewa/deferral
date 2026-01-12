import React, { useState } from "react";
import ChecklistTable from "./ChecklistTable";
import ReviewChecklistModal from "../../components/modals/ReviewChecklistModal";
import { useGetAllCoCreatorChecklistsQuery } from "../../api/checklistApi";

const CompletedQueue = ({ userId }) => {
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const { data: checklists = [] } = useGetAllCoCreatorChecklistsQuery();

  //

  //   const completedQueue = checklists.filter(
  //     (c) =>
  //       (c.createdBy?._id === userId && c.status?.toLowerCase() === "approved") ||
  //       "completed"
  //   );

  //   const completedQueue = (checklists || []).filter(
  //     (c) =>
  //       c.createdBy?._id?.toString() === userId?.toString() &&
  //       ["pending", "Approved", "Completed"].includes(c.status?.toLowerCase())
  //   );
  //   const completedQueue = (checklists || []).filter((c) => {
  //     // Determine the user ID from the checklist item
  //     const checklistUserId =
  //       // Case 1: Populated Object (e.g., { _id: '123' })
  //       c.createdBy?._id?.toString() ||
  //       // Case 2: Unpopulated ID String (e.g., '123')
  //       c.createdBy?.toString();

  //     // Check 1: User ID match
  //     const isMatch = checklistUserId === userId?.toString();

  //     // Check 2: Status match
  //     const isStatusValid = ["pending", "Approved", "Completed"].includes(
  //       c.status?.toLowerCase()
  //     );

  //     return isMatch && isStatusValid;
  //   });

  const completedQueue = (checklists || []).filter((c) => {
    // Determine the user ID from the checklist item (Same logic, remains robust)
    const checklistUserId =
      // Case 1: Populated Object (e.g., { _id: '123' })
      c.createdBy?._id?.toString() ||
      // Case 2: Unpopulated ID String (e.g., '123')
      c.createdBy?.toString();

    // Check 1: User ID match
    const isMatch = checklistUserId === userId?.toString();

    // Check 2: Status must be ONLY 'Approved' (Note: This is NOW case-sensitive)
    // *** ENSURE YOUR DATA USES THIS EXACT CASING, e.g., 'Approved' ***
    const isStatusValid = ["Approved"].includes(c.status);

    return isMatch && isStatusValid;
  });
  console.log(completedQueue);
  console.log(
    "Status Values:",
    (checklists || []).map((c) => c.status)
  );

  return (
    <div style={{ padding: 16 }}>
      <h2>Completed Checklists</h2>
      <ChecklistTable data={completedQueue} onView={setSelectedChecklist} />

      {selectedChecklist && (
        <ReviewChecklistModal
          checklist={selectedChecklist}
          open={!!selectedChecklist}
          onClose={() => setSelectedChecklist(null)}
        />
      )}
    </div>
  );
};

export default CompletedQueue;
