// CoChecklistPage.jsx
import React, { useState } from "react";
import { Button, Divider, Tabs } from "antd";
import ChecklistsPage from "./ChecklistsPageCreator";
import ChecklistTable from "./ChecklistTable"; // We'll keep table reusable
import ReviewChecklistModal from "../../components/modals/ReviewChecklistModal";
import { useGetAllCoCreatorChecklistsQuery } from "../../api/checklistApi";

const { TabPane } = Tabs;

const Queue = ({ userId }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  const { data: checklists = [], refetch } =
    useGetAllCoCreatorChecklistsQuery();

  // Filtered queues
  const myCurrentQueue = checklists.filter(
    (c) =>
      c.createdBy?._id === userId &&
      ["co_creator_review", "rm_review"].includes(c.status?.toLowerCase())
  );

  console.log(myCurrentQueue);

  const myPreviousQueue = checklists.filter(
    (c) =>
      c.createdBy?._id === userId &&
      c.status?.toLowerCase() === "co_checker_review"
  );

  return (
    <div style={{ padding: 16 }}>
      <Button type="primary" size="small" onClick={() => setDrawerOpen(true)}>
        Create New DCL
      </Button>

      {drawerOpen && (
        <ChecklistsPage
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            refetch();
          }}
          coCreatorId={userId}
        />
      )}

      <Divider>My Checklists</Divider>

      <Tabs defaultActiveKey="current" type="line">
        <TabPane tab="Current Queue" key="current">
          <ChecklistTable data={myCurrentQueue} onView={setSelectedChecklist} />
        </TabPane>
        <TabPane tab="Previous Queue" key="previous">
          <ChecklistTable
            data={myPreviousQueue}
            onView={setSelectedChecklist}
          />
        </TabPane>
      </Tabs>

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

export default Queue;
