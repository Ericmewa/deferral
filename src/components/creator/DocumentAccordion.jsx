import React from "react";
import { Table, Select, Input, Button, Collapse } from "antd";

const { Panel } = Collapse;
const { Option } = Select;

// Status mapping
const actionToStatus = {
  submitted: "submitted",
  pendingrm: "pendingrm",
  pendingco: "pendingco",
  tbo: "tbo",
  sighted: "sighted",
  waived: "waived",
  deferred: "deferred",
};

// Template for a new document
const createEmptyDoc = () => ({
  name: "",
  action: "",
  status: "",
  comment: "",
});

const DocumentAccordion = ({ documents, setDocuments }) => {
  // Add new document inside a category
  const handleAddDocument = (catIdx) => {
    const updated = [...documents];
    updated[catIdx].docList.push(createEmptyDoc());
    setDocuments(updated);
  };

  // Remove document
  const handleRemoveDocument = (catIdx, docIdx) => {
    const updated = [...documents];
    updated[catIdx].docList.splice(docIdx, 1);
    setDocuments(updated);
  };

  // Handle edit/change inside a document
  const handleDocumentChange = (catIdx, docIdx, field, value) => {
    const updated = [...documents];

    // Ensure document exists
    if (!updated[catIdx].docList[docIdx]) {
      updated[catIdx].docList[docIdx] = createEmptyDoc();
    }

    const doc = updated[catIdx].docList[docIdx];
    doc[field] = value;

    // Auto update status when action changes
    if (field === "action") {
      doc.status = actionToStatus[value] || "";
    }

    setDocuments(updated);
  };

  // Table columns
  const getColumns = (catIdx) => [
    {
      title: "Document",
      dataIndex: "name",
      render: (_, record) => (
        <Input
          value={record.name}
          placeholder="Document Name"
          onChange={(e) =>
            handleDocumentChange(catIdx, record.docIdx, "name", e.target.value)
          }
        />
      ),
    },

    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <Select
          value={record.action}
          style={{ width: 150 }}
          placeholder="Select Action"
          onChange={(val) =>
            handleDocumentChange(catIdx, record.docIdx, "action", val)
          }
        >
          <Option value="submitted">Submitted</Option>
          <Option value="pendingrm">Pending from Rm</Option>
          <Option value="pendingco">Pending from Co</Option>
          <Option value="tbo">TBO</Option>
          <Option value="sighted">Sighted</Option>
          <Option value="waived">Waived</Option>
          <Option value="deferred">Deferred</Option>
        </Select>
      ),
    },

    {
      title: "Status From Co",
      dataIndex: "status",
      render: (s) => <strong>{s}</strong>,
    },

    {
      title: "Comment from Co",
      dataIndex: "comment",
      render: (_, record) => (
        <Input
          value={record.comment}
          placeholder="Enter comment"
          onChange={(e) =>
            handleDocumentChange(
              catIdx,
              record.docIdx,
              "comment",
              e.target.value
            )
          }
        />
      ),
    },

    {
      title: "Remove",
      render: (_, record) => (
        <Button
          danger
          onClick={() => handleRemoveDocument(catIdx, record.docIdx)}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <Collapse accordion>
      {documents.map((cat, catIdx) => (
        <Panel header={cat.category} key={catIdx}>
          <Button
            type="primary"
            style={{ marginBottom: 15 }}
            onClick={() => handleAddDocument(catIdx)}
          >
            + Add Document
          </Button>

          <Table
            pagination={false}
            columns={getColumns(catIdx)}
            dataSource={cat.docList.map((doc, docIdx) => ({
              ...doc,
              key: `${catIdx}-${docIdx}`,
              docIdx,
            }))}
          />
        </Panel>
      ))}
    </Collapse>
  );
};

export default DocumentAccordion;
