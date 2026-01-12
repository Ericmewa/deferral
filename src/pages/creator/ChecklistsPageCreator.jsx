import React, { useState } from "react";
import { Modal, Button, Space } from "antd";
import DocumentAccordion from "../../components/creator/DocumentAccordion";
import { useGetUsersQuery } from "../../api/userApi";
import { loanTypes, loanTypeDocuments } from "../docTypes";
import { useCreateCoCreatorChecklistMutation } from "../../api/checklistApi";
import ChecklistFormFields from "../../components/creator/ChecklistFormFields";

const ChecklistsPage = ({ open, onClose }) => {
  const [loanType, setLoanType] = useState("");
  const [assignedToRM, setAssignedToRM] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedCategory] = useState(null); // No longer needed but kept to avoid breaking other components
  const [newDocName] = useState(""); // Removed add-doc logic
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const { data: users = [] } = useGetUsersQuery();
  const rms = users.filter((u) => u.role?.toLowerCase() === "rm");

  const [createChecklist] = useCreateCoCreatorChecklistMutation();

  const handleLoanTypeChange = (value) => {
    setLoanType(value);
    const categories = loanTypeDocuments[value] || [];
    setDocuments(
      categories.map((cat) => ({
        category: cat.title,
        docList: cat.documents.map((d) => ({
          name: d,
          status: "pendingrm",
          action: "",
          comment: "",
        })),
      }))
    );
  };

  const handleSubmit = async () => {
    if (!assignedToRM || !loanType)
      return alert("Please fill all required fields.");

    const payload = {
      loanType,
      assignedToRM,
      customerId,
      customerName,
      customerNumber,
      customerEmail,
      documents: documents,
    }; 

    try {
      await createChecklist(payload).unwrap();
      alert("Checklist created successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error creating checklist.");
    }
  };

  return (
    <Modal
      title="Create DCL Checklist"
      open={open}
      onCancel={onClose}
      width={1100}
      footer={null}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <ChecklistFormFields
          rms={rms}
          assignedToRM={assignedToRM}
          setAssignedToRM={setAssignedToRM}
          customerId={customerId}
          setCustomerId={setCustomerId}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerNumber={customerNumber}
          setCustomerNumber={setCustomerNumber}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          loanType={loanType}
          loanTypes={loanTypes}
          handleLoanTypeChange={handleLoanTypeChange}
        />

        {loanType && (
          <>
            {/* ❌ Removed DocumentInputSection completely */}
            <DocumentAccordion
              documents={documents}
              setDocuments={setDocuments}
            />
          </>
        )}

        <Button type="primary" block onClick={handleSubmit}>
          Submit Checklist
        </Button>
      </Space>
    </Modal>
  );
};

export default ChecklistsPage;
