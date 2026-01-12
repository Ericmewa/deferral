// export default RmReviewChecklistModal;
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
  Space,
  List,
  Avatar,
} from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";

// import { Tag } from "antd";

import {
  useRmSubmitChecklistToCoCreatorMutation,
  useGetChecklistCommentsQuery,
} from "../../api/checklistApi";

// ------------------ COLORS ------------------
const PRIMARY_BLUE = "#164679";
const ACCENT_LIME = "#b5d334";
const SECONDARY_PURPLE = "#7e6496";

// ------------------ CUSTOM STYLES ------------------
const customStyles = `
  .ant-modal-header {
      background-color: ${PRIMARY_BLUE} !important;
      padding: 18px 24px !important;
  }
  .ant-modal-title {
      color: white !important;
      font-size: 1.15rem !important;
      font-weight: 700 !important;
      letter-spacing: 0.5px;
  }
  .ant-modal-close-x { color: white !important; }

  .checklist-info-card .ant-card-head {
    border-bottom: 2px solid ${ACCENT_LIME} !important;
  }
  .checklist-info-card .ant-descriptions-item-label {
      font-weight: 600 !important;
      color: ${SECONDARY_PURPLE} !important;
  }
  .checklist-info-card .ant-descriptions-item-content {
      color: ${PRIMARY_BLUE} !important;
      font-weight: 700 !important;
  }

  .doc-table.ant-table-wrapper table {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }
  .doc-table .ant-table-thead > tr > th {
      background-color: #f7f9fc !important;
      color: ${PRIMARY_BLUE} !important;
      font-weight: 600 !important;
      padding: 12px 16px !important;
  }
  .doc-table .ant-table-tbody > tr > td {
      padding: 10px 16px !important;
      border-bottom: 1px dashed #f0f0f0 !important;
  }

  .status-tag {
    font-weight: 700 !important;
    border-radius: 999px !important;
    padding: 3px 8px !important;
    text-transform: capitalize;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .deferral-input.missing {
    border-color: #ff4d4f !important;
  }
`;

// const renderStatusTag = (status) => {
//   const normalized = (status || "").toLowerCase();

//   let color = "default";

//   switch (normalized) {
//     case "pending from customer":
//       color = "orange"; // waiting action
//       break;

//     case "submitted for review":
//       color = "blue"; // in progress
//       break;

//     default:
//       color = "default";
//   }
// };

const renderStatusTag = (status) => {
  const normalized = (status || "").toLowerCase();

  let color = "default";
  let text = status || "Unknown";

  switch (normalized) {
    case "pending from customer":
      color = "orange";
      text = "Pending from Customer";
      break;

    case "submitted for review":
      color = "blue";
      text = "Submitted for Review";
      break;

    default:
      color = "gray";
      text = status || "Unknown";
  }

  return (
    <Tag
      className="status-tag"
      style={{
        color: color,
        backgroundColor: color + "22",
        borderColor: color + "55",
      }}
    >
      {text}
    </Tag>
  );
};

// ------------------ HELPER: Role Tag ------------------
const getRoleTag = (role) => {
  switch ((role || "").toLowerCase()) {
    case "rm":
      return <Tag color="blue">RM</Tag>;
    case "co-checker":
      return <Tag color="green">Co-Checker</Tag>;
    case "creator":
      return <Tag color="purple">Creator</Tag>;
    case "system":
      return <Tag color="gray">System</Tag>;
    default:
      return <Tag>{role || "Unknown"}</Tag>;
  }
};

const RmReviewChecklistModal = ({ checklist, open, onClose, refetch }) => {
  const [docs, setDocs] = useState([]);
  const [showDeferralModal, setShowDeferralModal] = useState(false);
  const [deferralDocIdx, setDeferralDocIdx] = useState(null);
  const [deferralNumber, setDeferralNumber] = useState("");

  const [rmGeneralComment, setRmGeneralComment] = useState("");
  const [submitRmChecklistToCoCreator, { isLoading }] =
    useRmSubmitChecklistToCoCreatorMutation();

  const { data: comments, isLoading: commentsLoading } =
    useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

  // ------------------------------ PREPARE DOCS
  useEffect(() => {
    if (!checklist || !checklist.documents) return;

    const flattenedDocs = checklist.documents.reduce((acc, categoryObj) => {
      const filteredDocs = categoryObj.docList
        .filter((doc) => doc.name?.trim() !== "")
        .map((doc) => ({
          ...doc,
          category: categoryObj.category,
        }));
      return acc.concat(filteredDocs);
    }, []);

    const preparedDocs = flattenedDocs.map((doc, idx) => ({
      ...doc,
      docIdx: idx,
      status: doc.status || "pendingrm",
      comment: doc.comment || "",
      action: doc.status || "pendingrm",
      fileUrl: doc.fileUrl || null,
      rmStatus: doc.rmStatus || "pending",
      // rmStatus : updatedDoc.rmStatus ?? doc.rmStatus ?? "Pending",
      // rmStatus: doc.rmStatus ?? "", // default empty
      deferralReason: doc.deferralReason || "",
      deferralNumber: doc.deferralNumber || "",
    }));

    setDocs(preparedDocs);
  }, [checklist]);

  const isActionAllowed = checklist?.status === "rm_review";

  // ------------------------------ STATUS TAG
  const renderrStatusTag = (key) => {
    const map = {
      sighted: { color: PRIMARY_BLUE, text: "Sighted", icon: <EyeOutlined /> },
      pending: {
        color: "#fadb14",
        text: "Pending",
        icon: <ClockCircleOutlined />,
      },
      submitted: {
        color: "#52c41a",
        text: "Submitted",
        icon: <CheckCircleOutlined />,
      },
      deferred: {
        color: "#ff4d4f",
        text: "Deferred",
        icon: <CloseCircleOutlined />,
      },
      waived: {
        color: "#ff4d4f",
        text: "Waived",
        icon: <CloseCircleOutlined />,
      },
    };

    const s = map[key?.toLowerCase()] || {
      color: "gray",
      text: key || "Unknown",
      icon: <SyncOutlined spin />,
    };

    return (
      <Tag
        className="status-tag"
        style={{
          color: s.color,
          backgroundColor: s.color + "22",
          borderColor: s.color + "55",
        }}
      >
        {s.icon} {s.text}
      </Tag>
    );
  };

  // upload doc function

  const handleDownloadChecklist = () => {
    if (!checklist?._id) {
      message.error("Checklist not available");
      return;
    }

    window.open(`/api/checklists/${checklist._id}/download`, "_blank");
  };

  const handleUploadAdditionalDoc = (file) => {
    message.success(`Document "${file.name}" uploaded`);
    return false;
  };

  // can act on doc
  const canActOnDoc = (doc) => isActionAllowed && doc.status === "pendingrm";

  /* ===================== COMMENT TRAIL ===================== */
  // const CommentTrail = ({ comments, isLoading }) => {
  //   if (isLoading) {
  //     return (
  //       <div style={{ textAlign: "center", padding: 20 }}>
  //         <Spin />
  //       </div>
  //     );
  //   }
  //   if (!comments || comments.length === 0) {
  //     return (
  //       <div
  //         style={{ paddingLeft: 15, borderLeft: `3px solid ${PRIMARY_BLUE}` }}
  //       >
  //         <i>No historical comments yet.</i>
  //       </div>
  //     );
  //   }
  //   return (
  //     <div
  //       style={{ overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 8 }}
  //     >
  //       <div style={{ display: "inline-flex", gap: 16 }}>
  //         {comments.map((item, index) => (
  //           <Card
  //             key={index}
  //             style={{
  //               minWidth: 420,
  //               maxWidth: 420,
  //               borderLeft: `4px solid ${PRIMARY_BLUE}`,
  //             }}
  //           >
  //             <List.Item.Meta
  //               avatar={<Avatar icon={<UserOutlined />} />}
  //               title={
  //                 <div
  //                   style={{ display: "flex", justifyContent: "space-between" }}
  //                 >
  //                   <div>
  //                     <b>{item.userId?.name || "System"}</b>{" "}
  //                     {getRoleTag(item.userId?.role || "system")}
  //                   </div>
  //                   <span style={{ fontSize: 12, color: "#888" }}>
  //                     {new Date(
  //                       item.createdAt || item.timestamp
  //                     ).toLocaleString()}
  //                   </span>
  //                 </div>
  //               }
  //               description={
  //                 <div
  //                   style={{
  //                     whiteSpace: "normal",
  //                     wordBreak: "break-word",
  //                     marginTop: 8,
  //                   }}
  //                 >
  //                   {item.message}
  //                 </div>
  //               }
  //             />
  //           </Card>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  // ------------------------------ UPLOAD

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

  const handleFileUpload = (docIdx, file) => {
    setDocs((prev) =>
      prev.map((d, idx) =>
        idx === docIdx ? { ...d, fileUrl: URL.createObjectURL(file) } : d
      )
    );
    message.success(`File "${file.name}" uploaded successfully!`);
    return false;
  };

  // ------------------------------ SUBMIT
  const submitRM = async () => {
    try {
      if (!checklist?._id) throw new Error("Checklist ID missing");

      const missingDeferral = docs.find(
        (doc) =>
          doc.rmStatus === "Deferral Requested" && !doc.deferralNumber?.trim()
      );

      if (missingDeferral) {
        Modal.warning({
          title: "Deferral Number Required",
          content:
            "Please enter a deferral number for all documents marked as Deferral Requested.",
          okText: "OK",
          centered: true,
        });
        return;
      }

      const payload = {
        checklistId: checklist._id,
        documents: docs.map((doc) => ({
          _id: doc._id,
          name: doc.name,
          category: doc.category,
          status: doc.status,
          action: doc.action,
          comment: doc.comment,
          fileUrl: doc.fileUrl || null,
          deferralReason: doc.deferralReason,
          rmStatus: doc.rmStatus,
          deferralNumber: doc.deferralNumber,
        })),
        rmGeneralComment,
      };

      await submitRmChecklistToCoCreator(payload).unwrap();
      if (refetch) refetch();

      message.success("Checklist submitted to RM!");
      onClose();
    } catch (err) {
      console.error(err);
      message.error(err?.data?.error || "Failed to submit checklist to RM");
    }
  };

  // ------------------------------ COLUMNS
  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      width: 100,
      render: (text) => (
        <Input size="small" value={text} disabled style={{ opacity: 0.6 }} />
      ),
    },
    {
      title: "Document Name",
      dataIndex: "name",
      width: 150,
      render: (text) => (
        <Input size="small" value={text} disabled style={{ opacity: 0.6 }} />
      ),
    },
    {
      title: "Status from CO",
      dataIndex: "status",
      width: 100,
      render: (status) => (
        <div style={{ opacity: 0.6 }}>{renderrStatusTag(status)}</div>
      ),
    },
    {
      title: "Comment from CO",
      dataIndex: "comment",
      width: 150,
      render: (text) => (
        <Input.TextArea
          rows={1}
          size="small"
          value={text}
          disabled
          style={{ opacity: 0.6 }}
        />
      ),
    },
    {
      title: "Actions",
      width: 250,
      render: (_, record) => (
        <Space size={4}>
          <Upload
            showUploadList={false}
            beforeUpload={(f) => handleFileUpload(record.docIdx, f)}
            disabled={!isActionAllowed}
          >
            <Button
              size="small"
              icon={<UploadOutlined />}
              style={{ borderRadius: 6 }}
              disabled={!isActionAllowed}
            >
              Upload
            </Button>
          </Upload>

          {record.fileUrl && (
            <>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => window.open(record.fileUrl, "_blank")}
                style={{ borderRadius: 6 }}
              >
                View
              </Button>
              <Button
                size="small"
                danger
                onClick={() =>
                  setDocs((p) =>
                    p.map((d, i) =>
                      i === record.docIdx ? { ...d, fileUrl: null } : d
                    )
                  )
                }
                disabled={!isActionAllowed}
              >
                Delete
              </Button>
            </>
          )}

          {/* <Select
            size="small"
            value={record.rmStatus}
            style={{ width: 180 }}
            onChange={(value) =>
              setDocs((prev) =>
                prev.map((d, idx) =>
                  idx === record.docIdx ? { ...d, rmStatus: value } : d
                )
              )
            }
            options={[
              {
                label: "Pending from Customer",
                value: "Pending from Customer",
              },
              { label: "Submitted for Review", value: "Submitted for Review" },
              { label: "Deferral Requested", value: "Deferral Requested" },
            ]}
            disabled={!isActionAllowed}
          /> */}

          <Select
            size="small"
            value={record.rmStatus}
            style={{ width: 180 }}
            onChange={(value) =>
              setDocs((prev) =>
                prev.map((d, idx) =>
                  idx === record.docIdx ? { ...d, rmStatus: value } : d
                )
              )
            }
            options={[
              {
                label: "Pending from Customer",
                value: "Pending from Customer",
              },
              { label: "Submitted for Review", value: "Submitted for Review" },
              { label: "Deferral Requested", value: "Deferral Requested" },
            ]}
            disabled={!canActOnDoc(record)}
          />

          {showDeferralModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg w-[360px] p-5">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Deferral Number
                </h3>

                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter deferral number"
                  value={deferralNumber}
                  onChange={(e) => setDeferralNumber(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => {
                      setShowDeferralModal(false);
                      setDeferralDocIdx(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => {
                      if (!deferralNumber.trim()) {
                        message.error("Deferral number is required");
                        return;
                      }

                      const updated = [...docs];
                      updated[deferralDocIdx].action = "deferred";
                      updated[deferralDocIdx].status = "deferred";
                      updated[deferralDocIdx].deferralReason = deferralNumber;

                      setDocs(updated);
                      setShowDeferralModal(false);
                      setDeferralDocIdx(null);
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* {record.rmStatus === "Deferral Requested" && isActionAllowed && (
            <Input
              size="small"
              placeholder="Deferral Number"
              value={record.deferralNumber}
              onChange={(e) =>
                setDocs((prev) =>
                  prev.map((d, idx) =>
                    idx === record.docIdx
                      ? { ...d, deferralNumber: e.target.value }
                      : d
                  )
                )
              }
              className={`deferral-input ${
                !record.deferralNumber ? "missing" : ""
              }`}
            />
          )} */}

          {/* {record.rmStatus === "Deferral Requested" && (
            <Input
              size="small"
              placeholder="Deferral Number"
              value={record.deferralNumber}
              style={{ width: "100%", marginTop: 6 }}
              onChange={(e) =>
                setDocs((prev) =>
                  prev.map((d, idx) =>
                    idx === record.docIdx
                      ? { ...d, deferralNumber: e.target.value }
                      : d
                  )
                )
              }
              className={`deferral-input ${
                !record.deferralNumber ? "missing" : ""
              }`}
              disabled={!isActionAllowed}
            />
          )} */}

          {record.rmStatus === "Deferral Requested" && (
            <Input
              size="small"
              placeholder="Deferral number"
              value={record.deferralNumber}
              style={{ width: "100%", marginTop: 6 }}
              onChange={(e) =>
                setDocs((prev) =>
                  prev.map((d, idx) =>
                    idx === record.docIdx
                      ? { ...d, deferralNumber: e.target.value }
                      : d
                  )
                )
              }
              disabled={!isActionAllowed}
            />
          )}
        </Space>
      ),
    },
    // {
    //   title: "RM Status",
    //   width: 120,
    //   render: (_, record) => (
    //     <div style={{ opacity: 0.6 }}>{renderStatusTag(record.rmStatus)}</div>
    //   ),
    // },

    {
      title: "RM Status",
      width: 120,
      render: (_, record) => (
        <div style={{ opacity: 0.6 }}>{renderStatusTag(record.rmStatus)}</div>
      ),
    },
  ];

  return (
    <>
      <style>{customStyles}</style>

      <Modal
        title={`Review Checklist — ${checklist?.customerNumber || ""}`}
        open={open}
        onCancel={onClose}
        width={1100}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Close
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={submitRM}
            disabled={!isActionAllowed}
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            Submit to CO
          </Button>,
        ]}
      >
        {checklist && (
          <>
            <Card
              className="checklist-info-card"
              size="small"
              title="Checklist Details"
              style={{ marginBottom: 18, marginTop: 24 }}
            >
              <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
                <Descriptions.Item label="Customer Number">
                  {checklist.customerNumber}
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

            <h3 style={{ color: PRIMARY_BLUE, fontWeight: "bold" }}>
              Required Documents
            </h3>
            <Table
              className="doc-table"
              rowKey="docIdx"
              size="middle"
              pagination={false}
              dataSource={docs}
              columns={columns}
              scroll={{ x: "max-content" }}
            />

            <h3 style={{ marginTop: 24, color: PRIMARY_BLUE }}>
              Comment & Review History
            </h3>
            <CommentTrail comments={comments} isLoading={commentsLoading} />

            <h3
              style={{ marginTop: 24, color: PRIMARY_BLUE, fontWeight: "bold" }}
            >
              RM General Comment
            </h3>
            <Input.TextArea
              rows={3}
              value={rmGeneralComment}
              onChange={(e) => setRmGeneralComment(e.target.value)}
              placeholder="Enter RM general remarks..."
              style={{ borderRadius: 8, marginTop: 8 }}
              disabled={!isActionAllowed}
            />

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <Button icon={<EyeOutlined />} onClick={handleDownloadChecklist}>
                Download Checklist
              </Button>

              <Upload
                showUploadList={false}
                beforeUpload={handleUploadAdditionalDoc}
                disabled={!isActionAllowed}
              >
                <Button icon={<UploadOutlined />}>
                  Upload Supporting Document
                </Button>
              </Upload>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default RmReviewChecklistModal;
