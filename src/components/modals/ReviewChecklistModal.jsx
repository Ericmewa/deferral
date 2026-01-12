// export default ReviewChecklistModal;
import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Tag,
  Modal,
  Input,
  Select,
  Card,
  Descriptions,
  message,
  Upload,
  Spin,
  List,
  Avatar,
  Popconfirm,
  Progress,
} from "antd";
import { UploadOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";
import { loanTypes } from "../../pages/docTypes";

// import DocumentInputSection from "../../components/creator/DocumentInputSection";
import {
  useSubmitChecklistToRMMutation,
  useUpdateChecklistStatusMutation,
  useGetChecklistCommentsQuery,
} from "../../api/checklistApi";
import DocumentInputSectionCoCreator from "../creator/DocumentInputSection";

const { Option } = Select;

// Theme Colors
const PRIMARY_BLUE = "#164679";
const ACCENT_LIME = "#b5d334";
const SECONDARY_PURPLE = "#7e6496";

// Custom CSS
const customStyles = `
  .ant-modal-header { background-color: ${PRIMARY_BLUE} !important; padding: 18px 24px !important; }
  .ant-modal-title { color: white !important; font-size: 1.15rem !important; font-weight: 700 !important; letter-spacing: 0.5px; }
  .ant-modal-close-x { color: white !important; }

  .checklist-info-card .ant-card-head { border-bottom: 2px solid ${ACCENT_LIME} !important; }
  .checklist-info-card .ant-descriptions-item-label { font-weight: 600 !important; color: ${SECONDARY_PURPLE} !important; padding-bottom: 4px; }
  .checklist-info-card .ant-descriptions-item-content { color: ${PRIMARY_BLUE} !important; font-weight: 700 !important; font-size: 13px !important; }

  .doc-table.ant-table-wrapper table { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
  .doc-table .ant-table-thead > tr > th { background-color: #f7f9fc !important; color: ${PRIMARY_BLUE} !important; font-weight: 600 !important; padding: 12px 16px !important; }
  .doc-table .ant-table-tbody > tr > td { padding: 10px 16px !important; border-bottom: 1px dashed #f0f0f0 !important; }

  .ant-input, .ant-select-selector { border-radius: 6px !important; border-color: #e0e0e0 !important; }
  .ant-input:focus, .ant-select-focused .ant-select-selector { box-shadow: 0 0 0 2px rgba(22, 70, 121, 0.2) !important; border-color: ${PRIMARY_BLUE} !important; }

  .status-tag { font-weight: 700 !important; border-radius: 999px !important; padding: 3px 8px !important; text-transform: capitalize; min-width: 80px; text-align: center; display: inline-flex; align-items: center; gap: 4px; justify-content: center; }

  .ant-modal-footer .ant-btn { border-radius: 8px; font-weight: 600; height: 38px; padding: 0 16px; }
  .ant-modal-footer .ant-btn-primary { background-color: ${PRIMARY_BLUE} !important; border-color: ${PRIMARY_BLUE} !important; }
`;

const getRoleTag = (role) => {
  let color = "blue";
  const roleLower = (role || "").toLowerCase();
  switch (roleLower) {
    case "rm":
      color = "purple";
      break;
    case "creator":
      color = "green";
      break;
    case "co_checker":
      color = "volcano";
      break;
    case "system":
      color = "default";
      break;
    default:
      color = "blue";
  }
  return (
    <Tag color={color} style={{ marginLeft: 8, textTransform: "uppercase" }}>
      {roleLower.replace(/_/g, " ")}
    </Tag>
  );
};

const CommentTrail = ({ comments, isLoading }) => {
  if (isLoading) return <Spin className="block m-5" />;
  if (!comments || comments.length === 0)
    return <i className="pl-4">No historical comments yet.</i>;

  return (
    <div className="max-h-52 overflow-y-auto">
      <List
        dataSource={comments}
        itemLayout="horizontal"
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <div className="flex justify-between">
                  <div>
                    <b>{item.userId?.name || "System"}</b>
                    {getRoleTag(item.userId?.role || "system")}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(
                      item.createdAt || item.timestamp
                    ).toLocaleString()}
                  </span>
                </div>
              }
              description={<div className="break-words">{item.message}</div>}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

const ReviewChecklistModal = ({ checklist, open, onClose }) => {
  const [docs, setDocs] = useState([]);
  const [newDocName, setNewDocName] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [creatorComment, setCreatorComment] = useState("");
  const [checkerComment] = useState("");
  const [checkerFiles, setCheckerFiles] = useState([]);
  const [loanType, setLoanType] = useState("");

  const [submitRmChecklist, { isLoading }] = useSubmitChecklistToRMMutation();
  const [updateChecklistStatus, { isLoading: isCheckerSubmitting }] =
    useUpdateChecklistStatusMutation();
  const { data: comments, isLoading: commentsLoading } =
    useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

  // Client-side: Inside ReviewChecklistModal
  const isActionDisabled = !["pending", "co_creator_review"].includes(
    checklist?.status?.toLowerCase()
  );

  useEffect(() => {
    if (!checklist || !checklist.documents) return;

    const flatDocs = checklist.documents.reduce((acc, item) => {
      if (item.docList && Array.isArray(item.docList) && item.docList.length) {
        const nestedDocs = item.docList.map((doc) => ({
          ...doc,
          category: item.category,
        }));
        return acc.concat(nestedDocs);
      }
      if (item.category) return acc.concat(item);
      return acc;
    }, []);

    const preparedDocs = flatDocs.map((doc, idx) => ({
      ...doc,
      docIdx: idx,
      status: doc.status || "pendingrm",
      action: doc.status || "pendingrm",
      comment: doc.comment || "",
      fileUrl: doc.fileUrl || null,
    }));

    setDocs(preparedDocs);
  }, [checklist]);

  const handleDelete = (idx) => {
    const updated = docs
      .filter((_, i) => i !== idx)
      .map((doc, i) => ({ ...doc, docIdx: i }));
    setDocs(updated);
    message.success("Document deleted.");
  };

  // post comment

  const handlePostCreatorComment = () => {
    if (!creatorComment.trim()) {
      message.error("Comment cannot be empty");
      return;
    }

    message.success("Comment added");
  };

  console.log("loanType:", loanType);
  // console.log("categories:", categoriesToDisplay);

  const handleAddNewDocument = () => {
    if (!newDocName.trim() || !selectedCategoryName)
      return message.error(
        "Please enter a document name and select a category."
      );
    setDocs((prevDocs) => [
      ...prevDocs,
      {
        docIdx: prevDocs.length,
        name: newDocName.trim(),
        category: selectedCategoryName,
        status: "pendingrm",
        action: "pendingrm",
        comment: "",
        fileUrl: null,
      },
    ]);
    message.success(
      `Document '${newDocName.trim()}' added to ${selectedCategoryName}.`
    );
    setNewDocName("");
    setSelectedCategoryName(null);
  };

  const handleActionChange = (idx, value) => {
    const updated = [...docs];
    updated[idx].action = value;
    updated[idx].status = value;
    setDocs(updated);
  };

  const handleCommentChange = (idx, value) => {
    const updated = [...docs];
    updated[idx].comment = value;
    setDocs(updated);
  };

  const handleFileUpload = (docIdx, file) => {
    const updated = [...docs];
    updated[docIdx].fileUrl = URL.createObjectURL(file);
    updated[docIdx].status = "uploaded";
    setDocs(updated);
    message.success("File uploaded");
    return false;
  };

  const ALLOWED_DOC_ACTIONS = [
    "submitted_for_review",
    "sighted",
    "waived",
    "deferred",
    "tbo",
    "approved",
    "submitted",
  ];

  const canSubmitToCoChecker =
    checklist?.status === "co_creator_review" &&
    docs.length > 0 &&
    docs.every((doc) =>
      ALLOWED_DOC_ACTIONS.includes((doc.action || "").toLowerCase())
    );

  const submitToRM = async () => {
    try {
      if (!checklist?._id) throw new Error("Checklist ID missing");
      const nestedDocuments = docs.reduce((acc, doc) => {
        let categoryGroup = acc.find((c) => c.category === doc.category);
        if (!categoryGroup) {
          categoryGroup = { category: doc.category, docList: [] };
          acc.push(categoryGroup);
        }
        categoryGroup.docList.push({
          _id: doc._id,
          name: doc.name,
          category: doc.category,
          status: doc.status,
          action: doc.action,
          comment: doc.comment,
          fileUrl: doc.fileUrl,
          deferralReason: doc.deferralReason,
        });
        return acc;
      }, []);
      const payload = { creatorComment, documents: nestedDocuments };
      await submitRmChecklist({ id: checklist._id, body: payload }).unwrap();
      message.success("Checklist submitted to RM!");
      onClose();
    } catch (err) {
      console.error(err);
      message.error(err?.data?.error || "Failed to submit checklist to RM");
    }
  };

  const submitToCheckers = async () => {
    if (!checklist?.dclNo) return message.error("DCL No missing.");
    try {
      message.loading({
        content: "Submitting checklist to Co-Checker...",
        key: "checkerSubmit",
      });
      const payload = {
        dclNo: checklist.dclNo,
        documents: docs,
        status: "co_checker_review",
        submittedToCoChecker: true,
        finalComment: checkerComment,
        attachments: checkerFiles,
      };
      await updateChecklistStatus(payload).unwrap();
      message.success({
        content: "Checklist submitted to Co-Checker!",
        key: "checkerSubmit",
        duration: 3,
      });
      onClose();
    } catch (err) {
      console.error(err);
      message.error({
        content: err?.data?.error || "Failed to submit checklist.",
        key: "checkerSubmit",
      });
    }
  };

  const uniqueCategories = [...new Set(docs.map((doc) => doc.category))];
  const allDocsApproved =
    docs.length > 0 && docs.every((doc) => doc.action === "submitted");
  const total = docs.length;
  const submitted = docs.filter(
    (d) => d.action === "submitted" || d.action === "uploaded"
  ).length;
  const pending = docs.filter((d) =>
    ["pendingrm", "pendingco", "tbo"].includes(d.action)
  ).length;
  const deferred = docs.filter((d) => d.action === "deferred").length;
  const progressPercent =
    total === 0 ? 0 : Math.round((submitted / total) * 100);

  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      width: 120,
      render: (text) => (
        <span
          style={{ fontSize: 12, color: SECONDARY_PURPLE, fontWeight: 500 }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Document Name",
      dataIndex: "name",
      width: 250,
      render: (text, record) => (
        <Input
          size="small"
          value={record.name}
          onChange={(e) => {
            const updated = [...docs];
            updated[record.docIdx].name = e.target.value;
            setDocs(updated);
          }}
          disabled={isActionDisabled}
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      width: 140,
      render: (text, record) => (
        <Select
          size="small"
          value={record.action}
          style={{ width: "100%" }}
          onChange={(val) => handleActionChange(record.docIdx, val)}
          disabled={isActionDisabled}
        >
          <Option value="submitted">Submitted</Option>
          <Option value="pendingrm">Pending from RM</Option>
          <Option value="pendingco">Pending from Co</Option>
          <Option value="tbo">TBO</Option>
          <Option value="sighted">Sighted</Option>
          <Option value="waived">Waived</Option>
          <Option value="deferred">Deferred</Option>
        </Select>
      ),
    },
    {
      title: "Co status",
      dataIndex: "status",
      width: 120,
      render: (status) => {
        let color = "default";
        switch ((status || "").toLowerCase()) {
          case "submitted":
            color = "green";
            break;
          case "pendingrm":
            color = "#6E0C05";
            break;
          case "pendingco":
            color = "#6E0549";
            break;
          // case "deferred":
          case "waived":
            color = "#C4AA1D";
            break;
          case "sighted":
            color = "#02ECF5";
            break;
          case "deferred":
            color = "#55C41D";
            break;
          case "tbo":
            color = "#0F13E5";
            break;
          default:
            color = "default";
        }
        return (
          <Tag className="status-tag" color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Co comment",
      dataIndex: "comment",
      width: 200,
      render: (text, record) => (
        <Input.TextArea
          rows={1}
          size="small"
          value={text}
          onChange={(e) => handleCommentChange(record.docIdx, e.target.value)}
          disabled={isActionDisabled}
        />
      ),
    },
    {
      title: "View",
      key: "view",
      width: 80,
      render: (_, record) =>
        record.fileUrl ? (
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              const newWindow = window.open(
                record.fileUrl,
                "_blank",
                "noopener,noreferrer"
              );
              if (!newWindow)
                message.error("Popup blocked! Please allow popups.");
            }}
            size="small"
            style={{
              backgroundColor: PRIMARY_BLUE,
              borderColor: PRIMARY_BLUE,
              borderRadius: 6,
            }}
            disabled={isActionDisabled}
          >
            View
          </Button>
        ) : (
          <Tag color="default">No File</Tag>
        ),
    },
    {
      title: "Delete",
      key: "delete",
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Delete document?"
          description="This action cannot be undone."
          okText="Yes, Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(record.docIdx)}
        >
          <Button type="text" danger size="small" disabled={isActionDisabled}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <style>{customStyles}</style>
      <Modal
        title={`Review Checklist  ${checklist?.title || ""}`}
        open={open}
        onCancel={onClose}
        width={1150}
        styles={{ body: { padding: "0 24px 24px" } }}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Close
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={isActionDisabled || allDocsApproved}
            loading={isLoading}
            onClick={submitToRM}
          >
            Submit to RM
          </Button>,

          // <Button
          //   key="submit-checker"
          //   type="primary"
          //   loading={isCheckerSubmitting}
          //   onClick={submitToCheckers}
          //   disabled={checklist?.status !== "rm_review" || docs.length === 0}
          // >
          //   Submit to Co-Checker
          // </Button>,

          <Button
            key="submit-checker"
            type="primary"
            loading={isCheckerSubmitting}
            onClick={submitToCheckers}
            disabled={!canSubmitToCoChecker}
          >
            Submit to Co-Checker
          </Button>,
        ]}
      >
        {checklist && (
          <>
            <Card
              className="checklist-info-card"
              size="small"
              title={
                <span style={{ color: PRIMARY_BLUE, fontSize: 14 }}>
                  Checklist Details
                </span>
              }
              style={{
                marginBottom: 18,
                marginTop: 24,
                borderRadius: 10,
                border: `1px solid #e0e0e0`,
              }}
            >
              <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
                <Descriptions.Item label="DCL No">
                  {checklist.dclNo}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {checklist.createdAt}
                </Descriptions.Item>
                <Descriptions.Item label="Loan Type">
                  {checklist.loanType}
                </Descriptions.Item>
                <Descriptions.Item label="Created By">
                  {checklist.createdBy?.name}
                </Descriptions.Item>
                <Descriptions.Item label="RM">
                  {checklist.assignedToRM?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Co-Checker">
                  {checklist.assignedToCoChecker?.name || "Pending"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <div
              style={{
                padding: "16px",
                background: "#f7f9fc",
                borderRadius: 8,
                border: "1px solid #e0e0e0",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontWeight: "700", color: PRIMARY_BLUE }}>
                  Total: {total}
                </div>
                <div style={{ fontWeight: "700", color: SECONDARY_PURPLE }}>
                  Pending: {pending}
                </div>
                <div style={{ fontWeight: "700", color: "green" }}>
                  Submitted: {submitted}
                </div>
                <div style={{ fontWeight: "700", color: "orange" }}>
                  Deferred: {deferred}
                </div>
              </div>
              <Progress percent={progressPercent} />
            </div>

            <Table
              className="doc-table"
              columns={columns}
              dataSource={docs}
              pagination={false}
              rowKey="docIdx"
              size="small"
              scroll={{ x: "max-content" }}
            />

            <div style={{ marginTop: 18 }}>
              {/* <DocumentInputSectionCoCreator
                uniqueCategories={uniqueCategories}
                // disabled={isActionDisabled}
                newDocName={newDocName}
                setNewDocName={setNewDocName}
                selectedCategoryName={selectedCategoryName} 
                setSelectedCategoryName={setSelectedCategoryName}
                handleAddNewDocument={handleAddNewDocument}
              /> */}

              {/* 🔹 Document Input */}
              <DocumentInputSectionCoCreator
                loanType={loanTypes} // ✅ THIS FIXES EVERYTHING
                newDocName={newDocName}
                setNewDocName={setNewDocName}
                selectedCategoryName={selectedCategoryName}
                setSelectedCategoryName={setSelectedCategoryName}
                handleAddNewDocument={handleAddNewDocument}
              />
            </div>

            <div style={{ marginTop: 24 }}>
              <h4>Creator Comment</h4>

              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <Input.TextArea
                  rows={2}
                  value={creatorComment}
                  onChange={(e) => setCreatorComment(e.target.value)}
                  disabled={isActionDisabled}
                  placeholder="Add a comment for RM / Co-Checker"
                />

                <Button
                  type="primary"
                  onClick={handlePostCreatorComment}
                  disabled={isActionDisabled || !creatorComment.trim()}
                  style={{
                    height: 38,
                    backgroundColor: PRIMARY_BLUE,
                    borderColor: PRIMARY_BLUE,
                  }}
                >
                  Post Comment
                </Button>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <h4>Comment Trail & History</h4>
              <CommentTrail comments={comments} isLoading={commentsLoading} />
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default ReviewChecklistModal;