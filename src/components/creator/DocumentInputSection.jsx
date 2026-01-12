import React from "react";
import { Input, Select, Button, message } from "antd";
import { loanTypeDocuments } from "../../pages/docTypes";

const { Option } = Select;

const DocumentInputSectionCoCreator = ({
  loanType, // ✅ REQUIRED
  newDocName,
  setNewDocName,
  selectedCategoryName,
  setSelectedCategoryName,
  handleAddNewDocument,
}) => {
  const categories =
    loanType && loanTypeDocuments[loanType]
      ? loanTypeDocuments[loanType].map((c) => c.title)
      : [];

  const handleAddClick = () => {
    if (!newDocName.trim() || !selectedCategoryName) {
      return message.error("Enter document name and select a category");
    }
    handleAddNewDocument();
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
      <Input
        placeholder="Document Name"
        value={newDocName}
        onChange={(e) => setNewDocName(e.target.value)}
        style={{ flex: 1, minWidth: 220 }}
      />

      <Select
        placeholder={loanType ? "Select Category" : "Select Loan Type First"}
        value={selectedCategoryName}
        onChange={setSelectedCategoryName}
        style={{ minWidth: 220 }}
        allowClear
        showSearch
        disabled={!loanType}
      >
        {categories.map((title) => (
          <Option key={title} value={title}>
            {title}
          </Option>
        ))}
      </Select>

      <Button type="primary" onClick={handleAddClick}>
        Add Document
      </Button>
    </div>
  );
};

export default DocumentInputSectionCoCreator;
