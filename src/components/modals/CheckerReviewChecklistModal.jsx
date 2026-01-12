// // // // // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // // // // import {
// // // // // // // // // //   Button,
// // // // // // // // // //   Table,
// // // // // // // // // //   Tag,
// // // // // // // // // //   Modal,
// // // // // // // // // //   Input,
// // // // // // // // // //   Select,
// // // // // // // // // //   Card,
// // // // // // // // // //   Descriptions,
// // // // // // // // // //   message,
// // // // // // // // // //   Row, // ← add this
// // // // // // // // // //   Col,
// // // // // // // // // //   Progress,
// // // // // // // // // //   Space,
// // // // // // // // // //   Upload,
// // // // // // // // // //   // 🟢 ADDED: Missing Ant Design components for CommentTrail
// // // // // // // // // //   Spin,
// // // // // // // // // //   List,
// // // // // // // // // //   Avatar,
// // // // // // // // // // } from "antd";

// // // // // // // // // // import {
// // // // // // // // // //   CheckCircleOutlined,
// // // // // // // // // //   RollbackOutlined,
// // // // // // // // // //   EyeOutlined,
// // // // // // // // // //   UploadOutlined,
// // // // // // // // // //   DownloadOutlined,
// // // // // // // // // // } from "@ant-design/icons";

// // // // // // // // // // import {
// // // // // // // // // //   // UploadOutlined,
// // // // // // // // // //   // EyeOutlined,
// // // // // // // // // //   // CheckCircleOutlined,
// // // // // // // // // //   CloseCircleOutlined,
// // // // // // // // // //   ClockCircleOutlined,
// // // // // // // // // //   SyncOutlined,
// // // // // // // // // //   UserOutlined,
// // // // // // // // // //   BellOutlined,
// // // // // // // // // //   MenuOutlined,
// // // // // // // // // // } from "@ant-design/icons";
// // // // // // // // // // import jsPDF from "jspdf";
// // // // // // // // // // import autoTable from "jspdf-autotable";
// // // // // // // // // // import {
// // // // // // // // // //   useUpdateCheckerStatusMutation,
// // // // // // // // // //   useGetChecklistCommentsQuery,
// // // // // // // // // // } from "../../api/checklistApi";

// // // // // // // // // // const GREEN = "#52c41a";
// // // // // // // // // // const ORANGE = "#ffa940";
// // // // // // // // // // const RED = "red";

// // // // // // // // // // // 🟢 ADDED: Helper function to render role tags in the Comment Trail
// // // // // // // // // // const getRoleTag = (role) => {
// // // // // // // // // //   let color = "blue";
// // // // // // // // // //   const roleLower = role.toLowerCase();
// // // // // // // // // //   switch (roleLower) {
// // // // // // // // // //     case "rm":
// // // // // // // // // //       color = "purple";
// // // // // // // // // //       break;
// // // // // // // // // //     case "creator":
// // // // // // // // // //       color = "green";
// // // // // // // // // //       break;
// // // // // // // // // //     case "co_checker":
// // // // // // // // // //       color = "volcano";
// // // // // // // // // //       break;
// // // // // // // // // //     case "system":
// // // // // // // // // //       color = "default";
// // // // // // // // // //       break;
// // // // // // // // // //     default:
// // // // // // // // // //       color = "blue";
// // // // // // // // // //   }
// // // // // // // // // //   return (
// // // // // // // // // //     <Tag color={color} style={{ marginLeft: 8, textTransform: "uppercase" }}>
// // // // // // // // // //       {roleLower.replace(/_/g, " ")}
// // // // // // // // // //     </Tag>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // const CommentTrail = ({ comments, isLoading }) => {
// // // // // // // // // //   if (isLoading) {
// // // // // // // // // //     return (
// // // // // // // // // //       <div style={{ textAlign: "center", padding: 20 }}>
// // // // // // // // // //         <Spin />
// // // // // // // // // //       </div>
// // // // // // // // // //     );
// // // // // // // // // //   }
// // // // // // // // // //   if (!comments || comments.length === 0) {
// // // // // // // // // //     return (
// // // // // // // // // //       <div style={{ paddingLeft: 15, borderLeft: `3px solid ${RED}` }}>
// // // // // // // // // //         <i>No historical comments yet.</i>
// // // // // // // // // //       </div>
// // // // // // // // // //     );
// // // // // // // // // //   }
// // // // // // // // // //   return (
// // // // // // // // // //     <div
// // // // // // // // // //       style={{
// // // // // // // // // //         overflowX: "auto",
// // // // // // // // // //         whiteSpace: "nowrap",
// // // // // // // // // //         paddingBottom: 8,
// // // // // // // // // //       }}
// // // // // // // // // //     >
// // // // // // // // // //       <div style={{ display: "inline-flex", gap: 16 }}>
// // // // // // // // // //         {comments.map((item, index) => (
// // // // // // // // // //           <Card
// // // // // // // // // //             key={index}
// // // // // // // // // //             style={{
// // // // // // // // // //               minWidth: 420,
// // // // // // // // // //               maxWidth: 420,
// // // // // // // // // //               borderLeft: `4px solid ${RED}`,
// // // // // // // // // //             }}
// // // // // // // // // //           >
// // // // // // // // // //             <List.Item.Meta
// // // // // // // // // //               avatar={<Avatar icon={<UserOutlined />} />}
// // // // // // // // // //               title={
// // // // // // // // // //                 <div
// // // // // // // // // //                   style={{ display: "flex", justifyContent: "space-between" }}
// // // // // // // // // //                 >
// // // // // // // // // //                   <div>
// // // // // // // // // //                     <b>{item.userId?.name || "System"}</b>{" "}
// // // // // // // // // //                     {getRoleTag(item.userId?.role || "system")}
// // // // // // // // // //                   </div>
// // // // // // // // // //                   <span style={{ fontSize: 12, color: "#888" }}>
// // // // // // // // // //                     {new Date(
// // // // // // // // // //                       item.createdAt || item.timestamp
// // // // // // // // // //                     ).toLocaleString()}
// // // // // // // // // //                   </span>
// // // // // // // // // //                 </div>
// // // // // // // // // //               }
// // // // // // // // // //               description={
// // // // // // // // // //                 <div
// // // // // // // // // //                   style={{
// // // // // // // // // //                     whiteSpace: "normal",
// // // // // // // // // //                     wordBreak: "break-word",
// // // // // // // // // //                     marginTop: 8,
// // // // // // // // // //                   }}
// // // // // // // // // //                 >
// // // // // // // // // //                   {item.message}
// // // // // // // // // //                 </div>
// // // // // // // // // //               }
// // // // // // // // // //             />
// // // // // // // // // //           </Card>
// // // // // // // // // //         ))}
// // // // // // // // // //       </div>
// // // // // // // // // //     </div>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
// // // // // // // // // //   const [docs, setDocs] = useState([]);
// // // // // // // // // //   const [checkerComment, setCheckerComment] = useState("");
// // // // // // // // // //   const [commentThread, setCommentThread] = useState([]);
// // // // // // // // // //   const [loading, setLoading] = useState(false);
// // // // // // // // // //   const [submitCheckerStatus] = useUpdateCheckerStatusMutation();

// // // // // // // // // //   const { data: comments, isLoading: commentsLoading } =
// // // // // // // // // //     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

// // // // // // // // // //   /** ========================
// // // // // // // // // //    * LOAD DOCUMENTS CORRECTLY
// // // // // // // // // //    * ======================== */
// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     // 1. Guard clause to ensure checklist and documents exist
// // // // // // // // // //     if (!checklist || !checklist.documents) return;

// // // // // // // // // //     const flatDocs = checklist.documents.reduce((acc, item) => {
// // // // // // // // // //       // Check 1: If item has a docList AND that list has documents, flatten them.
// // // // // // // // // //       if (
// // // // // // // // // //         item.docList &&
// // // // // // // // // //         Array.isArray(item.docList) &&
// // // // // // // // // //         item.docList.length > 0
// // // // // // // // // //       ) {
// // // // // // // // // //         const nestedDocs = item.docList.map((doc) => ({
// // // // // // // // // //           ...doc,
// // // // // // // // // //           // Inherit category from the parent item
// // // // // // // // // //           category: item.category,
// // // // // // // // // //         }));
// // // // // // // // // //         return acc.concat(nestedDocs);
// // // // // // // // // //       }

// // // // // // // // // //       // Check 2 (The Fix): If docList is empty (or non-existent), include the
// // // // // // // // // //       // top-level item itself, provided it has a category.
// // // // // // // // // //       // This ensures your 12 items are not ignored.
// // // // // // // // // //       if (item.category) {
// // // // // // // // // //         // We're including the top-level object as a document
// // // // // // // // // //         return acc.concat(item);
// // // // // // // // // //       }

// // // // // // // // // //       // Default: Skip anything that doesn't fit the document structure
// // // // // // // // // //       return acc;
// // // // // // // // // //     }, []); // Initialize the accumulator as an empty array

// // // // // // // // // //     // 2. Prepare/standardize the flattened documents
// // // // // // // // // //     const preparedDocs = flatDocs.map((doc, idx) => ({
// // // // // // // // // //       ...doc,
// // // // // // // // // //       // Assign a local index for mapping/keying
// // // // // // // // // //       docIdx: idx,
// // // // // // // // // //       // Standardize fields that might be missing
// // // // // // // // // //       status: doc.status || "pendingrm",
// // // // // // // // // //       action: doc.status || "pendingrm",
// // // // // // // // // //       comment: doc.comment || "",
// // // // // // // // // //       fileUrl: doc.fileUrl || null,
// // // // // // // // // //     }));

// // // // // // // // // //     // 3. Update the state and log
// // // // // // // // // //     setDocs(preparedDocs);
// // // // // // // // // //     // Log the preparedDocs, as that's what's actually being set to state
// // // // // // // // // //   }, [checklist]);

// // // // // // // // // //   // Inside CheckerReviewChecklistModal component

// // // // // // // // // // // const totalDocs = docs.length;
// // // // // // // // // // // const approvedDocs = docs.filter((d) => d.approved).length;
// // // // // // // // // // // const pendingDocs = docs.filter((d) => d.status === "pending").length;
// // // // // // // // // // // const submittedDocs = docs.filter(
// // // // // // // // // // //   (d) => d.status === "submitted" && d.approved
// // // // // // // // // // // ).length;
// // // // // // // // // // // const progressPercent = totalDocs ? (submittedDocs / totalDocs) * 100 : 0;

// // // // // // // // // // // const allApproved = totalDocs > 0 && docs.every((d) => d.approved);
// // // // // // // // // // // const hasPending = docs.some((d) => d.status === "pending");

// // // // // // // // // // const { totalDocs, submittedDocs, pendingDocs, allApproved, hasPending, progressPercent } = useMemo(() => {
// // // // // // // // // //     const total = docs.length;
// // // // // // // // // //     const submitted = docs.filter((d) => d.status === "submitted").length;
// // // // // // // // // //     const pending = docs.filter((d) => d.status === "pending").length;

// // // // // // // // // //     // allApproved checks if the CHECKER has approved all documents
// // // // // // // // // //     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);

// // // // // // // // // //     // hasPending checks if the RM/Creator has NOT submitted all documents
// // // // // // // // // //     const isStillPendingRm = docs.some((d) => d.status === "pending");

// // // // // // // // // //     return {
// // // // // // // // // //         totalDocs: total,
// // // // // // // // // //         submittedDocs: submitted,
// // // // // // // // // //         pendingDocs: pending,
// // // // // // // // // //         progressPercent: total ? (submitted / total) * 100 : 0,
// // // // // // // // // //         allApproved: checkerApprovedAll, // Use this for enabling final button
// // // // // // // // // //         hasPending: isStillPendingRm, // Use this for disabling final button
// // // // // // // // // //     };
// // // // // // // // // // }, [docs]);

// // // // // // // // // //   const handleDocApprove = (index) => {
// // // // // // // // // //     setDocs((prev) => {
// // // // // // // // // //       const updated = [...prev];
// // // // // // // // // //       updated[index].approved = true;
// // // // // // // // // //       updated[index].checkerStatus = "approved";
// // // // // // // // // //       return updated;
// // // // // // // // // //     });
// // // // // // // // // //   };

// // // // // // // // // //   const handleDocReject = (index) => {
// // // // // // // // // //     setDocs((prev) => {
// // // // // // // // // //       const updated = [...prev];
// // // // // // // // // //       updated[index].approved = false;
// // // // // // // // // //       updated[index].checkerStatus = "rejected";
// // // // // // // // // //       return updated;
// // // // // // // // // //     });
// // // // // // // // // //   };

// // // // // // // // // //   // const submitCheckerAction = async (action) => {
// // // // // // // // // //   //   const payload = {
// // // // // // // // // //   //     action: action,
// // // // // // // // // //   //     id: checklist._id,
// // // // // // // // // //   //   };

// // // // // // // // // //   //   await submitCheckerStatus(payload).unwrap();
// // // // // // // // // //   //   onClose();
// // // // // // // // // //   // };

// // // // // // // // // //   // --- 2. The Core Action Function ---
// // // // // // // // // //   const submitCheckerAction = async (action) => {
// // // // // // // // // //     const payload = {
// // // // // // // // // //       action: action,
// // // // // // // // // //       id: checklist._id,
// // // // // // // // // //     };

// // // // // // // // // //     setLoading(true); // Start loading state before API call
// // // // // // // // // //     try {
// // // // // // // // // //       // Your existing logic: call the API and unwrap the result
// // // // // // // // // //       await submitCheckerStatus(payload).unwrap();

// // // // // // // // // //       // Your existing logic: close the form/modal on success
// // // // // // // // // //       onClose();
// // // // // // // // // //     } catch (error) {
// // // // // // // // // //       console.error(`Error during action "${action}":`, error);
// // // // // // // // // //       Modal.error({
// // // // // // // // // //         title: "Submission Failed",
// // // // // // // // // //         content: `Could not submit action: ${error.message}`,
// // // // // // // // // //       });
// // // // // // // // // //     } finally {
// // // // // // // // // //       setLoading(false); // Stop loading state
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   const handleReturnConfirmation = () => {
// // // // // // // // // //     // If loading is true, stop execution immediately (though Ant Design handles this via the prop)
// // // // // // // // // //     if (loading) return;

// // // // // // // // // //     Modal.confirm({
// // // // // // // // // //       title: "Confirm Return to Creator",
// // // // // // // // // //       content:
// // // // // // // // // //         "Are you sure you want to return this checklist? This sends the review back and may require the creator to resubmit.",
// // // // // // // // // //       icon: <RollbackOutlined style={{ color: "#faad14" }} />,
// // // // // // // // // //       okText: "Yes, Return",
// // // // // // // // // //       okType: "danger",
// // // // // // // // // //       cancelText: "Cancel",
// // // // // // // // // //       onOk() {
// // // // // // // // // //         return submitCheckerAction("co_creator_review");
// // // // // // // // // //       },
// // // // // // // // // //     });
// // // // // // // // // //   };
// // // // // // // // // //   // // NEW Handler for "Return to Creator"
// // // // // // // // // //   // const handleReturnConfirmation = () => {
// // // // // // // // // //   //   Modal.confirm({
// // // // // // // // // //   //     title: "Confirm Return to Creator",
// // // // // // // // // //   //     content:
// // // // // // // // // //   //       "Are you sure you want to return this checklist? This sends the review back and may require the creator to resubmit.",
// // // // // // // // // //   //     icon: <RollbackOutlined style={{ color: "#faad14" }} />, // Optional icon for visual warning
// // // // // // // // // //   //     okText: "Yes, Return",
// // // // // // // // // //   //     okType: "danger", // Use danger type to indicate a serious action
// // // // // // // // // //   //     cancelText: "Cancel",
// // // // // // // // // //   //     onOk() {
// // // // // // // // // //   //       // Calls the core action function with the "co_creator_review" action
// // // // // // // // // //   //       return submitCheckerAction("co_creator_review");
// // // // // // // // // //   //     },
// // // // // // // // // //   //   });
// // // // // // // // // //   // };
// // // // // // // // // //   // // Handler for "Approve"
// // // // // // // // // //   // const handleApproveConfirmation = () => {
// // // // // // // // // //   //     // Prevent showing the modal if the button is clearly disabled
// // // // // // // // // //   //     if (!allApproved || hasPending) {
// // // // // // // // // //   //         return;
// // // // // // // // // //   //     }

// // // // // // // // // //   //     Modal.confirm({
// // // // // // // // // //   //         title: 'Confirm Final Approval',
// // // // // // // // // //   //         content: 'Are you absolutely sure you want to Approve this checklist? This is the final step and is typically irreversible.',
// // // // // // // // // //   //         icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
// // // // // // // // // //   //         okText: 'Yes, Final Approve',
// // // // // // // // // //   //         okType: 'primary',
// // // // // // // // // //   //         cancelText: 'Cancel',
// // // // // // // // // //   //         onOk() {
// // // // // // // // // //   //             // Calls the core action function with the "approved" action
// // // // // // // // // //   //             return submitCheckerAction("approved");
// // // // // // // // // //   //         },
// // // // // // // // // //   //     });
// // // // // // // // // //   // };

// // // // // // // // // //   const handleApproveConfirmation = () => {
// // // // // // // // // //     // Only proceed if the button is NOT disabled
// // // // // // // // // //     if (!allApproved) {
// // // // // // // // // //       return;
// // // // // // // // // //     }

// // // // // // // // // //     Modal.confirm({
// // // // // // // // // //       title: "Confirm Final Approval",
// // // // // // // // // //       content:
// // // // // // // // // //         "Are you absolutely sure you want to Approve this checklist? This action is often irreversible and final.",
// // // // // // // // // //       okText: "Yes, Approve Final",
// // // // // // // // // //       okType: "primary",
// // // // // // // // // //       cancelText: "Cancel",

// // // // // // // // // //       // onOk will call your existing action function if the user confirms
// // // // // // // // // //       onOk() {
// // // // // // // // // //         // You can wrap this in an async function if needed, but Modal handles promises
// // // // // // // // // //         // If submitCheckerAction is async and returns a promise, Modal handles the loading state automatically.
// // // // // // // // // //         return submitCheckerAction("approved");
// // // // // // // // // //       },
// // // // // // // // // //       // You could also add an onCancel() function if you needed side effects on dismissal
// // // // // // // // // //     });
// // // // // // // // // //   };

// // // // // // // // // //   const postComment = () => {
// // // // // // // // // //     if (!checkerComment.trim()) return; // ignore empty comment

// // // // // // // // // //     const newComment = {
// // // // // // // // // //       user: "Checker", // Replace with actual user name if needed
// // // // // // // // // //       comment: checkerComment,
// // // // // // // // // //       time: new Date().toLocaleString(),
// // // // // // // // // //     };

// // // // // // // // // //     setCommentThread((prev) => [newComment, ...prev]);
// // // // // // // // // //     setCheckerComment(""); // clear input after posting
// // // // // // // // // //   };

// // // // // // // // // //   const renderStatusTag = (status) => (
// // // // // // // // // //     <Tag className="status-tag">{status.replace(/_/g, " ")}</Tag>
// // // // // // // // // //   );

// // // // // // // // // //   const downloadPDF = () => {
// // // // // // // // // //     const doc = new jsPDF();
// // // // // // // // // //     doc.setFontSize(16);
// // // // // // // // // //     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
// // // // // // // // // //     doc.setFontSize(12);
// // // // // // // // // //     doc.text(`Loan Type: ${checklist?.loanType}`, 14, 28);
// // // // // // // // // //     doc.text(`Created By: ${checklist?.createdBy?.name}`, 14, 36);
// // // // // // // // // //     doc.text(`Co-Checker: ${checklist?.coChecker || "Pending"}`, 14, 44);
// // // // // // // // // //     doc.text(`Checker Comment: ${checkerComment || "N/A"}`, 14, 52);

// // // // // // // // // //     const tableColumn = ["Category", "Document Name", "Status", "Co Comment"];
// // // // // // // // // //     const tableRows = docs.map((d) => [
// // // // // // // // // //       d.category,
// // // // // // // // // //       d.name,
// // // // // // // // // //       d.status === "submitted" ? "Submitted" : "Pending",
// // // // // // // // // //       d.comment || "",
// // // // // // // // // //     ]);

// // // // // // // // // //     autoTable(doc, {
// // // // // // // // // //       head: [tableColumn],
// // // // // // // // // //       body: tableRows,
// // // // // // // // // //       startY: 60,
// // // // // // // // // //     });

// // // // // // // // // //     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
// // // // // // // // // //   };

// // // // // // // // // //   const columns = [
// // // // // // // // // //     { title: "Category", dataIndex: "category" },
// // // // // // // // // //     { title: "Document Name", dataIndex: "name" },
// // // // // // // // // //     {
// // // // // // // // // //       title: "Co Status",
// // // // // // // // // //       render: (_, record) => {
// // // // // // // // // //         if (record.status === "pending") return <Tag color={RED}>Pending</Tag>;
// // // // // // // // // //         return <Tag color={GREEN}>Submitted</Tag>;
// // // // // // // // // //       },
// // // // // // // // // //     },
// // // // // // // // // //     { title: "Co Comment", dataIndex: "comment" },
// // // // // // // // // //     {
// // // // // // // // // //       title: "checker status",
// // // // // // // // // //       dataIndex: "checkerStatus",
// // // // // // // // // //       width: 120,
// // // // // // // // // //       render: (status) => renderStatusTag(status),
// // // // // // // // // //     },
// // // // // // // // // //     {
// // // // // // // // // //       title: "Action",
// // // // // // // // // //       render: (_, record, index) => (
// // // // // // // // // //         <Space>
// // // // // // // // // //           <Button
// // // // // // // // // //             type="primary"
// // // // // // // // // //             size="small"
// // // // // // // // // //             onClick={() => handleDocApprove(index)}
// // // // // // // // // //             // disabled={record.status === "pending"} // cannot approve pending doc
// // // // // // // // // //           >
// // // // // // // // // //             Approve
// // // // // // // // // //           </Button>
// // // // // // // // // //           <Button danger size="small" onClick={() => handleDocReject(index)}>
// // // // // // // // // //             Reject
// // // // // // // // // //           </Button>
// // // // // // // // // //           {/* Only show View button if file exists */}
// // // // // // // // // //           {record.fileUrl && (
// // // // // // // // // //             <Button
// // // // // // // // // //               icon={<EyeOutlined />}
// // // // // // // // // //               size="small"
// // // // // // // // // //               onClick={() => window.open(record.fileUrl, "_blank")}
// // // // // // // // // //             >
// // // // // // // // // //               View
// // // // // // // // // //             </Button>
// // // // // // // // // //           )}
// // // // // // // // // //         </Space>
// // // // // // // // // //       ),
// // // // // // // // // //     },
// // // // // // // // // //   ];

// // // // // // // // // //   const totalDocs = docs.length;
// // // // // // // // // //   const approvedDocs = docs.filter((d) => d.approved).length;
// // // // // // // // // //   const pendingDocs = docs.filter((d) => d.status === "pending").length;
// // // // // // // // // //   const submittedDocs = docs.filter(
// // // // // // // // // //     (d) => d.status === "submitted" && d.approved
// // // // // // // // // //   ).length;
// // // // // // // // // //   const progressPercent = totalDocs ? (submittedDocs / totalDocs) * 100 : 0;

// // // // // // // // // //   const allApproved = totalDocs > 0 && docs.every((d) => d.approved);
// // // // // // // // // //   const hasPending = docs.some((d) => d.status === "pending");

// // // // // // // // // //   return (
// // // // // // // // // //     <Modal
// // // // // // // // // //       title="Review Checklist"
// // // // // // // // // //       open={open}
// // // // // // // // // //       onCancel={onClose}
// // // // // // // // // //       width={1000}
// // // // // // // // // //       footer={null}
// // // // // // // // // //     >
// // // // // // // // // //       {/* Checklist Details */}
// // // // // // // // // //       <Card style={{ marginBottom: 16 }}>
// // // // // // // // // //         <Row gutter={16}>
// // // // // // // // // //           <Col span={8}>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>DCL No:</b>{" "}
// // // // // // // // // //               <span style={{ color: "#6b52b0" }}>{checklist?.dclNo}</span>
// // // // // // // // // //             </p>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>Loan Type:</b> <b>{checklist?.loanType}</b>
// // // // // // // // // //             </p>
// // // // // // // // // //           </Col>
// // // // // // // // // //           <Col span={8}>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>Created By:</b> {checklist?.createdBy?.name}
// // // // // // // // // //             </p>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
// // // // // // // // // //             </p>
// // // // // // // // // //           </Col>
// // // // // // // // // //           <Col span={8}>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
// // // // // // // // // //             </p>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>Created At:</b> {checklist?.createdAt}
// // // // // // // // // //             </p>
// // // // // // // // // //           </Col>
// // // // // // // // // //         </Row>
// // // // // // // // // //       </Card>

// // // // // // // // // //       {/* Progress Summary */}
// // // // // // // // // //       <Card style={{ marginBottom: 16 }}>
// // // // // // // // // //         <p>
// // // // // // // // // //           <b>Total:</b> {totalDocs} &nbsp; | &nbsp;
// // // // // // // // // //           <b>Submitted:</b> {submittedDocs} &nbsp; | &nbsp;
// // // // // // // // // //           <b style={{ color: RED }}>Pending:</b> {pendingDocs}
// // // // // // // // // //         </p>
// // // // // // // // // //         <Progress
// // // // // // // // // //           percent={progressPercent}
// // // // // // // // // //           showInfo={false}
// // // // // // // // // //           strokeColor={GREEN}
// // // // // // // // // //         />
// // // // // // // // // //       </Card>

// // // // // // // // // //       {/* Documents Table */}
// // // // // // // // // //       <Table columns={columns} dataSource={docs} pagination={false} />

// // // // // // // // // //       {/* Comment Section */}
// // // // // // // // // //       <Row gutter={16} style={{ marginTop: 16 }}>
// // // // // // // // // //         {/* Editable Checker Comment */}
// // // // // // // // // //         <Col span={12}>
// // // // // // // // // //           <Card title="Checker Comment">
// // // // // // // // // //             <Input.TextArea
// // // // // // // // // //               rows={3}
// // // // // // // // // //               value={checkerComment}
// // // // // // // // // //               onChange={(e) => setCheckerComment(e.target.value)}
// // // // // // // // // //               placeholder="Add your comment here..."
// // // // // // // // // //             />
// // // // // // // // // //             <Button
// // // // // // // // // //               type="primary"
// // // // // // // // // //               style={{ marginTop: 8 }}
// // // // // // // // // //               onClick={postComment}
// // // // // // // // // //             >
// // // // // // // // // //               Post Comment
// // // // // // // // // //             </Button>
// // // // // // // // // //           </Card>
// // // // // // // // // //         </Col>

// // // // // // // // // //         {/* Comment Thread (read-only) */}
// // // // // // // // // //         <Col span={12}>
// // // // // // // // // //           <Card
// // // // // // // // // //             title="Comment Thread"
// // // // // // // // // //             style={{ maxHeight: 160, overflowY: "auto" }}
// // // // // // // // // //           >
// // // // // // // // // //             {commentThread.map((c, idx) => (
// // // // // // // // // //               <p key={idx}>
// // // // // // // // // //                 <b>{c.user}:</b> {c.comment}{" "}
// // // // // // // // // //                 <i style={{ fontSize: 10 }}>{c.time}</i>
// // // // // // // // // //               </p>
// // // // // // // // // //             ))}
// // // // // // // // // //           </Card>
// // // // // // // // // //         </Col>
// // // // // // // // // //       </Row>

// // // // // // // // // //       {/* 🟢 ADDED: Render the Comment Trail section */}
// // // // // // // // // //       <h3
// // // // // // // // // //         style={{
// // // // // // // // // //           margin: "24px 0 8px",
// // // // // // // // // //           color: GREEN,
// // // // // // // // // //           fontWeight: "bold",
// // // // // // // // // //         }}
// // // // // // // // // //       >
// // // // // // // // // //         Comment Trail
// // // // // // // // // //       </h3>
// // // // // // // // // //       <CommentTrail comments={comments} isLoading={commentsLoading} />

// // // // // // // // // //       {/* Bottom Buttons */}
// // // // // // // // // //       <div
// // // // // // // // // //         style={{
// // // // // // // // // //           marginTop: 20,
// // // // // // // // // //           display: "flex",
// // // // // // // // // //           justifyContent: "space-between",
// // // // // // // // // //         }}
// // // // // // // // // //       >
// // // // // // // // // //         <Space>
// // // // // // // // // //           <Button icon={<UploadOutlined />}>Upload Documents</Button>
// // // // // // // // // //           <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
// // // // // // // // // //             Download Checklist
// // // // // // // // // //           </Button>
// // // // // // // // // //         </Space>

// // // // // // // // // //         <Space>
// // // // // // // // // //           {/* <Button
// // // // // // // // // //             danger
// // // // // // // // // //             onClick={() => submitCheckerAction("co_creator_review")}
// // // // // // // // // //           >
// // // // // // // // // //             Return to Creator
// // // // // // // // // //           </Button> */}

// // // // // // // // // //           <Button
// // // // // // // // // //             danger
// // // // // // // // // //             icon={<RollbackOutlined />}
// // // // // // // // // //             onClick={handleReturnConfirmation}
// // // // // // // // // //             loading={loading} // Already handled spinner
// // // // // // // // // //             disabled={loading} // Add disabled check for extra safety
// // // // // // // // // //           >
// // // // // // // // // //             Return to Creator
// // // // // // // // // //           </Button>
// // // // // // // // // //           {/* <Button
// // // // // // // // // //             type="primary"
// // // // // // // // // //             icon={<CheckCircleOutlined />}
// // // // // // // // // //             onClick={() => submitCheckerAction("approved")}
// // // // // // // // // //             disabled={!allApproved || hasPending} // cannot approve if any pending
// // // // // // // // // //             style={{
// // // // // // // // // //               backgroundColor:
// // // // // // // // // //                 !allApproved || hasPending ? "#d9d9d9" : undefined,
// // // // // // // // // //             }}
// // // // // // // // // //           >
// // // // // // // // // //             Approve
// // // // // // // // // //           </Button> */}

// // // // // // // // // //           {/* 2. Approve Button (calls confirmation handler) */}
// // // // // // // // // //           <Button
// // // // // // // // // //             type="primary"
// // // // // // // // // //             icon={<CheckCircleOutlined />}
// // // // // // // // // //             onClick={handleApproveConfirmation} // <-- Calls the confirmation wrapper
// // // // // // // // // //             // The disabled state prevents clicks AND controls style
// // // // // // // // // //             disabled={!allApproved || hasPending || loading}
// // // // // // // // // //             style={{
// // // // // // // // // //               backgroundColor:
// // // // // // // // // //                 !allApproved || hasPending ? "#d9d9d9" : undefined,
// // // // // // // // // //               borderColor: !allApproved || hasPending ? "#d9d9d9" : undefined,
// // // // // // // // // //             }}
// // // // // // // // // //             loading={loading}
// // // // // // // // // //           >
// // // // // // // // // //             Approve
// // // // // // // // // //           </Button>
// // // // // // // // // //         </Space>
// // // // // // // // // //       </div>
// // // // // // // // // //     </Modal>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // export default CheckerReviewChecklistModal;
// // // // // // // // // // import React, { useState, useEffect, useMemo } from "react"; // ⬅️ ADDED useMemo
// // // // // // // // // // import {
// // // // // // // // // //   Button,
// // // // // // // // // //   Table,
// // // // // // // // // //   Tag,
// // // // // // // // // //   Modal,
// // // // // // // // // //   Input,
// // // // // // // // // //   Select,
// // // // // // // // // //   Card,
// // // // // // // // // //   Descriptions,
// // // // // // // // // //   message,
// // // // // // // // // //   Row,
// // // // // // // // // //   Col,
// // // // // // // // // //   Progress,
// // // // // // // // // //   Space,
// // // // // // // // // //   Upload,
// // // // // // // // // //   Spin,
// // // // // // // // // //   List,
// // // // // // // // // //   Avatar,
// // // // // // // // // // } from "antd";

// // // // // // // // // // import {
// // // // // // // // // //   CheckCircleOutlined,
// // // // // // // // // //   RollbackOutlined,
// // // // // // // // // //   EyeOutlined,
// // // // // // // // // //   UploadOutlined,
// // // // // // // // // //   DownloadOutlined,
// // // // // // // // // //   CloseCircleOutlined,
// // // // // // // // // //   UserOutlined,
// // // // // // // // // // } from "@ant-design/icons";
// // // // // // // // // // import jsPDF from "jspdf";
// // // // // // // // // // import autoTable from "jspdf-autotable";

// // // // // // // // // // // Assume these are correctly imported from your API slice
// // // // // // // // // // import {
// // // // // // // // // //   useUpdateCheckerStatusMutation,
// // // // // // // // // //   useGetChecklistCommentsQuery,
// // // // // // // // // // } from "../../api/checklistApi";

// // // // // // // // // // const GREEN = "#52c41a";
// // // // // // // // // // const RED = "red";

// // // // // // // // // // // Helper function to render role tags
// // // // // // // // // // const getRoleTag = (role) => {
// // // // // // // // // //   let color = "blue";
// // // // // // // // // //   const roleLower = role?.toLowerCase() || "system";
// // // // // // // // // //   switch (roleLower) {
// // // // // // // // // //     case "rm":
// // // // // // // // // //       color = "purple";
// // // // // // // // // //       break;
// // // // // // // // // //     case "creator":
// // // // // // // // // //       color = "green";
// // // // // // // // // //       break;
// // // // // // // // // //     case "co_checker":
// // // // // // // // // //       color = "volcano";
// // // // // // // // // //       break;
// // // // // // // // // //     case "system":
// // // // // // // // // //       color = "default";
// // // // // // // // // //       break;
// // // // // // // // // //     default:
// // // // // // // // // //       color = "blue";
// // // // // // // // // //   }
// // // // // // // // // //   return (
// // // // // // // // // //     <Tag color={color} style={{ marginLeft: 8, textTransform: "uppercase" }}>
// // // // // // // // // //       {roleLower.replace(/_/g, " ")}
// // // // // // // // // //     </Tag>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // // Comment Trail Component (simplified for brevity)
// // // // // // // // // // const CommentTrail = ({ comments, isLoading }) => {
// // // // // // // // // //   if (isLoading) {
// // // // // // // // // //     return (
// // // // // // // // // //       <div style={{ textAlign: "center", padding: 20 }}>
// // // // // // // // // //         <Spin />
// // // // // // // // // //       </div>
// // // // // // // // // //     );
// // // // // // // // // //   }
// // // // // // // // // //   if (!comments || comments.length === 0) {
// // // // // // // // // //     return (
// // // // // // // // // //       <div style={{ paddingLeft: 15, borderLeft: `3px solid ${RED}` }}>
// // // // // // // // // //         <i>No historical comments yet.</i>
// // // // // // // // // //       </div>
// // // // // // // // // //     );
// // // // // // // // // //   }
// // // // // // // // // //   return (
// // // // // // // // // //     <div style={{ maxHeight: 200, overflowY: "auto" }}>
// // // // // // // // // //       <List
// // // // // // // // // //         dataSource={comments}
// // // // // // // // // //         itemLayout="horizontal"
// // // // // // // // // //         renderItem={(item, index) => (
// // // // // // // // // //           <List.Item>
// // // // // // // // // //             <List.Item.Meta
// // // // // // // // // //               avatar={<Avatar icon={<UserOutlined />} />}
// // // // // // // // // //               title={
// // // // // // // // // //                 <div
// // // // // // // // // //                   style={{ display: "flex", justifyContent: "space-between" }}
// // // // // // // // // //                 >
// // // // // // // // // //                   <div>
// // // // // // // // // //                     <b>{item.userId?.name || "System"}</b>
// // // // // // // // // //                     {getRoleTag(item.userId?.role || "system")}
// // // // // // // // // //                   </div>
// // // // // // // // // //                   <span style={{ fontSize: 12, color: "#888" }}>
// // // // // // // // // //                     {new Date(
// // // // // // // // // //                       item.createdAt || item.timestamp
// // // // // // // // // //                     ).toLocaleString()}
// // // // // // // // // //                   </span>
// // // // // // // // // //                 </div>
// // // // // // // // // //               }
// // // // // // // // // //               description={
// // // // // // // // // //                 <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
// // // // // // // // // //                   {item.message}
// // // // // // // // // //                 </div>
// // // // // // // // // //               }
// // // // // // // // // //             />
// // // // // // // // // //           </List.Item>
// // // // // // // // // //         )}
// // // // // // // // // //       />
// // // // // // // // // //     </div>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
// // // // // // // // // //   const [docs, setDocs] = useState([]);
// // // // // // // // // //   const [checkerComment, setCheckerComment] = useState("");
// // // // // // // // // //   const [commentThread, setCommentThread] = useState([]);
// // // // // // // // // //   const [loading, setLoading] = useState(false);
// // // // // // // // // //   const [submitCheckerStatus] = useUpdateCheckerStatusMutation(); // RTK Mutation

// // // // // // // // // //   const { data: comments, isLoading: commentsLoading } =
// // // // // // // // // //     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

// // // // // // // // // //   // ===================================
// // // // // // // // // //   // 1. STATE MANAGEMENT (useMemo)
// // // // // // // // // //   // ===================================

// // // // // // // // // //   const {
// // // // // // // // // //     totalDocs,
// // // // // // // // // //     submittedDocs,
// // // // // // // // // //     pendingDocs,
// // // // // // // // // //     allApproved,
// // // // // // // // // //     hasPending,
// // // // // // // // // //     progressPercent,
// // // // // // // // // //   } = useMemo(() => {
// // // // // // // // // //     const total = docs.length;
// // // // // // // // // //     // Count of documents submitted by RM/Creator
// // // // // // // // // //     const submitted = docs.filter((d) => d.status === "submitted").length;
// // // // // // // // // //     // Count of documents pending RM/Creator submission
// // // // // // // // // //     const pending = docs.filter((d) => d.status === "pending").length;

// // // // // // // // // //     // allApproved: TRUE if the CHECKER has approved ALL documents
// // // // // // // // // //     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);

// // // // // // // // // //     // hasPending: TRUE if ANY document is still waiting for RM/Creator submission
// // // // // // // // // //     const isStillPendingRm = docs.some((d) => d.status === "pending");

// // // // // // // // // //     return {
// // // // // // // // // //       totalDocs: total,
// // // // // // // // // //       submittedDocs: submitted,
// // // // // // // // // //       pendingDocs: pending,
// // // // // // // // // //       progressPercent: total ? (submitted / total) * 100 : 0,
// // // // // // // // // //       allApproved: checkerApprovedAll,
// // // // // // // // // //       hasPending: isStillPendingRm,
// // // // // // // // // //     };
// // // // // // // // // //   }, [docs]);

// // // // // // // // // //   // ===================================
// // // // // // // // // //   // 2. DOCUMENT LOADING (useEffect)
// // // // // // // // // //   // ===================================
// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     if (!checklist || !checklist.documents) return;

// // // // // // // // // //     const flatDocs = checklist.documents.reduce((acc, item) => {
// // // // // // // // // //       if (
// // // // // // // // // //         item.docList &&
// // // // // // // // // //         Array.isArray(item.docList) &&
// // // // // // // // // //         item.docList.length > 0
// // // // // // // // // //       ) {
// // // // // // // // // //         const nestedDocs = item.docList.map((doc) => ({
// // // // // // // // // //           ...doc,
// // // // // // // // // //           category: item.category,
// // // // // // // // // //         }));
// // // // // // // // // //         return acc.concat(nestedDocs);
// // // // // // // // // //       }
// // // // // // // // // //       if (item.category) {
// // // // // // // // // //         return acc.concat(item);
// // // // // // // // // //       }
// // // // // // // // // //       return acc;
// // // // // // // // // //     }, []);

// // // // // // // // // //     const preparedDocs = flatDocs.map((doc, idx) => ({
// // // // // // // // // //       ...doc,
// // // // // // // // // //       key: doc._id || `doc-${idx}`, // Ensure key exists for table
// // // // // // // // // //       docIdx: idx,
// // // // // // // // // //       status: doc.status || "pending", // Default to 'pending' if missing
// // // // // // // // // //       comment: doc.comment || "",
// // // // // // // // // //       // Initialize checker approval state if missing
// // // // // // // // // //       approved: doc.approved === true,
// // // // // // // // // //       checkerStatus:
// // // // // // // // // //         doc.checkerStatus || (doc.approved ? "approved" : "pending"),
// // // // // // // // // //       fileUrl: doc.fileUrl || null,
// // // // // // // // // //     }));

// // // // // // // // // //     setDocs(preparedDocs);
// // // // // // // // // //   }, [checklist]);

// // // // // // // // // //   // ===================================
// // // // // // // // // //   // 3. HANDLERS (Local Status Update)
// // // // // // // // // //   // ===================================

// // // // // // // // // //   const handleDocApprove = (index) => {
// // // // // // // // // //     setDocs((prev) => {
// // // // // // // // // //       const updated = [...prev];
// // // // // // // // // //       updated[index].approved = true;
// // // // // // // // // //       updated[index].checkerStatus = "approved";
// // // // // // // // // //       return updated;
// // // // // // // // // //     });
// // // // // // // // // //   };

// // // // // // // // // //   const handleDocReject = (index) => {
// // // // // // // // // //     setDocs((prev) => {
// // // // // // // // // //       const updated = [...prev];
// // // // // // // // // //       updated[index].approved = false;
// // // // // // // // // //       updated[index].checkerStatus = "rejected";
// // // // // // // // // //       return updated;
// // // // // // // // // //     });
// // // // // // // // // //   };

// // // // // // // // // //   const postComment = () => {
// // // // // // // // // //     if (!checkerComment.trim()) return;

// // // // // // // // // //     const newComment = {
// // // // // // // // // //       user: "Checker",
// // // // // // // // // //       comment: checkerComment,
// // // // // // // // // //       time: new Date().toLocaleString(),
// // // // // // // // // //     };

// // // // // // // // // //     setCommentThread((prev) => [newComment, ...prev]);
// // // // // // // // // //     setCheckerComment("");
// // // // // // // // // //   };

// // // // // // // // // //   // ===================================
// // // // // // // // // //   // 4. CORE API ACTION (Centralized)
// // // // // // // // // //   // ===================================
// // // // // // // // // //   const submitCheckerAction = async (action) => {
// // // // // // // // // //     const payload = {
// // // // // // // // // //       action: action,
// // // // // // // // // //       id: checklist._id,
// // // // // // // // // //       // NOTE: You may also need to include the 'docs' state or 'checkerComment'
// // // // // // // // // //       // in the payload depending on your API structure.
// // // // // // // // // //       // e.g., docs: docs, comment: checkerComment
// // // // // // // // // //     };

// // // // // // // // // //     setLoading(true);
// // // // // // // // // //     try {
// // // // // // // // // //       // Your API call logic
// // // // // // // // // //       await submitCheckerStatus(payload).unwrap();
// // // // // // // // // //       message.success(`Checklist successfully ${action}!`);
// // // // // // // // // //       onClose();
// // // // // // // // // //     } catch (error) {
// // // // // // // // // //       console.error(`Error during action "${action}":`, error);
// // // // // // // // // //       // Use message for transient error feedback
// // // // // // // // // //       message.error(
// // // // // // // // // //         `Submission Failed: ${error?.data?.message || "Check connection."}`
// // // // // // // // // //       );
// // // // // // // // // //     } finally {
// // // // // // // // // //       setLoading(false);
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   // ===================================
// // // // // // // // // //   // 5. CONFIRMATION WRAPPERS
// // // // // // // // // //   // ===================================

// // // // // // // // // //   const handleReturnConfirmation = () => {
// // // // // // // // // //     // Check loading state here for a fail-fast mechanism, though 'disabled' handles it.
// // // // // // // // // //     if (loading) return;

// // // // // // // // // //     Modal.confirm({
// // // // // // // // // //       title: "Confirm Return to Creator",
// // // // // // // // // //       content:
// // // // // // // // // //         "Are you sure you want to return this checklist? This sends the review back and may require the creator to resubmit.",
// // // // // // // // // //       icon: <RollbackOutlined style={{ color: "#faad14" }} />,
// // // // // // // // // //       okText: "Yes, Return",
// // // // // // // // // //       okType: "danger",
// // // // // // // // // //       cancelText: "Cancel",
// // // // // // // // // //       onOk() {
// // // // // // // // // //         // Calls the core action function
// // // // // // // // // //         return submitCheckerAction("co_creator_review");
// // // // // // // // // //       },
// // // // // // // // // //     });
// // // // // // // // // //   };

// // // // // // // // // //   const handleApproveConfirmation = () => {
// // // // // // // // // //     // Explicitly check disabled conditions before showing modal
// // // // // // // // // //     if (!allApproved || hasPending || loading) {
// // // // // // // // // //       // You can add a tooltip or message here explaining why it's disabled
// // // // // // // // // //       return;
// // // // // // // // // //     }

// // // // // // // // // //     Modal.confirm({
// // // // // // // // // //       title: "Confirm Final Approval",
// // // // // // // // // //       content:
// // // // // // // // // //         "Are you absolutely sure you want to Approve this checklist? This action is often irreversible and final.",
// // // // // // // // // //       icon: <CheckCircleOutlined style={{ color: GREEN }} />,
// // // // // // // // // //       okText: "Yes, Approve Final",
// // // // // // // // // //       okType: "primary",
// // // // // // // // // //       cancelText: "Cancel",
// // // // // // // // // //       onOk() {
// // // // // // // // // //         // Calls the core action function
// // // // // // // // // //         return submitCheckerAction("approved");
// // // // // // // // // //       },
// // // // // // // // // //     });
// // // // // // // // // //   };

// // // // // // // // // //   // ===================================
// // // // // // // // // //   // 6. RENDER COMPONENTS
// // // // // // // // // //   // ===================================

// // // // // // // // // //   const renderStatusTag = (status) => (
// // // // // // // // // //     <Tag className="status-tag">{status?.replace(/_/g, " ")}</Tag>
// // // // // // // // // //   );

// // // // // // // // // //   const downloadPDF = () => {
// // // // // // // // // //     const doc = new jsPDF();
// // // // // // // // // //     // ... (PDF generation logic remains the same)
// // // // // // // // // //     doc.setFontSize(16);
// // // // // // // // // //     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
// // // // // // // // // //     // ... rest of PDF logic

// // // // // // // // // //     const tableColumn = ["Category", "Document Name", "Status", "Co Comment"];
// // // // // // // // // //     const tableRows = docs.map((d) => [
// // // // // // // // // //       d.category,
// // // // // // // // // //       d.name,
// // // // // // // // // //       d.status === "submitted" ? "Submitted" : "Pending",
// // // // // // // // // //       d.comment || "",
// // // // // // // // // //     ]);

// // // // // // // // // //     autoTable(doc, {
// // // // // // // // // //       head: [tableColumn],
// // // // // // // // // //       body: tableRows,
// // // // // // // // // //       startY: 60,
// // // // // // // // // //     });

// // // // // // // // // //     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
// // // // // // // // // //   };

// // // // // // // // // //   const columns = [
// // // // // // // // // //     { title: "Category", dataIndex: "category" },
// // // // // // // // // //     { title: "Document Name", dataIndex: "name" },
// // // // // // // // // //     {
// // // // // // // // // //       title: "Co Status",
// // // // // // // // // //       render: (_, record) => {
// // // // // // // // // //         if (record.status === "pending") return <Tag color={RED}>Pending</Tag>;
// // // // // // // // // //         return <Tag color={GREEN}>Submitted</Tag>;
// // // // // // // // // //       },
// // // // // // // // // //     },
// // // // // // // // // //     { title: "Co Comment", dataIndex: "comment" },
// // // // // // // // // //     {
// // // // // // // // // //       title: "Checker Status",
// // // // // // // // // //       dataIndex: "checkerStatus",
// // // // // // // // // //       width: 120,
// // // // // // // // // //       render: (status) => renderStatusTag(status),
// // // // // // // // // //     },
// // // // // // // // // //     {
// // // // // // // // // //       title: "Action",
// // // // // // // // // //       width: 250,
// // // // // // // // // //       render: (_, record, index) => (
// // // // // // // // // //         <Space>
// // // // // // // // // //           <Button
// // // // // // // // // //             type="primary"
// // // // // // // // // //             size="small"
// // // // // // // // // //             onClick={() => handleDocApprove(index)}
// // // // // // // // // //           >
// // // // // // // // // //             Approve
// // // // // // // // // //           </Button>
// // // // // // // // // //           <Button danger size="small" onClick={() => handleDocReject(index)}>
// // // // // // // // // //             Reject
// // // // // // // // // //           </Button>
// // // // // // // // // //           {record.fileUrl && (
// // // // // // // // // //             <Button
// // // // // // // // // //               icon={<EyeOutlined />}
// // // // // // // // // //               size="small"
// // // // // // // // // //               onClick={() => window.open(record.fileUrl, "_blank")}
// // // // // // // // // //             >
// // // // // // // // // //               View
// // // // // // // // // //             </Button>
// // // // // // // // // //           )}
// // // // // // // // // //         </Space>
// // // // // // // // // //       ),
// // // // // // // // // //     },
// // // // // // // // // //   ];

// // // // // // // // // //   return (
// // // // // // // // // //     <Modal
// // // // // // // // // //       title="Review Checklist"
// // // // // // // // // //       open={open}
// // // // // // // // // //       onCancel={onClose}
// // // // // // // // // //       width={1000}
// // // // // // // // // //       footer={null}
// // // // // // // // // //     >
// // // // // // // // // //       {/* Checklist Details Card */}
// // // // // // // // // //       <Card style={{ marginBottom: 16 }}>
// // // // // // // // // //         <Row gutter={16}>
// // // // // // // // // //           {/* ... Checklist Details ... */}
// // // // // // // // // //           <Col span={8}>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>DCL No:</b>{" "}
// // // // // // // // // //               <span style={{ color: "#6b52b0" }}>{checklist?.dclNo}</span>
// // // // // // // // // //             </p>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>Loan Type:</b> <b>{checklist?.loanType}</b>
// // // // // // // // // //             </p>
// // // // // // // // // //           </Col>
// // // // // // // // // //           <Col span={8}>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>Created By:</b> {checklist?.createdBy?.name}
// // // // // // // // // //             </p>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
// // // // // // // // // //             </p>
// // // // // // // // // //           </Col>
// // // // // // // // // //           <Col span={8}>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
// // // // // // // // // //             </p>
// // // // // // // // // //             <p>
// // // // // // // // // //               <b>Created At:</b> {checklist?.createdAt}
// // // // // // // // // //             </p>
// // // // // // // // // //           </Col>
// // // // // // // // // //         </Row>
// // // // // // // // // //       </Card>

// // // // // // // // // //       {/* Progress Summary Card */}
// // // // // // // // // //       <Card style={{ marginBottom: 16 }}>
// // // // // // // // // //         <p>
// // // // // // // // // //           <b>Total:</b> {totalDocs} &nbsp; | &nbsp;
// // // // // // // // // //           <b>Submitted:</b> {submittedDocs} &nbsp; | &nbsp;
// // // // // // // // // //           <b style={{ color: RED }}>Pending:</b> {pendingDocs}
// // // // // // // // // //         </p>
// // // // // // // // // //         <Progress
// // // // // // // // // //           percent={progressPercent}
// // // // // // // // // //           showInfo={false}
// // // // // // // // // //           strokeColor={GREEN}
// // // // // // // // // //         />
// // // // // // // // // //       </Card>

// // // // // // // // // //       {/* Documents Table */}
// // // // // // // // // //       <Table columns={columns} dataSource={docs} pagination={false} />

// // // // // // // // // //       {/* Comment Section (Your Existing Logic) */}
// // // // // // // // // //       {/* ... */}

// // // // // // // // // //       {/* Comment Trail */}
// // // // // // // // // //       <h3
// // // // // // // // // //         style={{
// // // // // // // // // //           margin: "24px 0 8px",
// // // // // // // // // //           color: GREEN,
// // // // // // // // // //           fontWeight: "bold",
// // // // // // // // // //         }}
// // // // // // // // // //       >
// // // // // // // // // //         Comment Trail
// // // // // // // // // //       </h3>
// // // // // // // // // //       <CommentTrail comments={comments} isLoading={commentsLoading} />

// // // // // // // // // //       {/* Bottom Buttons (FINAL WORKING LOGIC) */}
// // // // // // // // // //       <div
// // // // // // // // // //         style={{
// // // // // // // // // //           marginTop: 20,
// // // // // // // // // //           display: "flex",
// // // // // // // // // //           justifyContent: "space-between",
// // // // // // // // // //         }}
// // // // // // // // // //       >
// // // // // // // // // //         <Space>
// // // // // // // // // //           <Button icon={<UploadOutlined />}>Upload Documents</Button>
// // // // // // // // // //           <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
// // // // // // // // // //             Download Checklist
// // // // // // // // // //           </Button>
// // // // // // // // // //         </Space>

// // // // // // // // // //         <Space>
// // // // // // // // // //           {/* 1. Return to Creator Button with Confirmation */}
// // // // // // // // // //           <Button
// // // // // // // // // //             danger
// // // // // // // // // //             icon={<RollbackOutlined />}
// // // // // // // // // //             onClick={handleReturnConfirmation}
// // // // // // // // // //             loading={loading}
// // // // // // // // // //             // Disabled when API call is in progress
// // // // // // // // // //             disabled={loading}
// // // // // // // // // //           >
// // // // // // // // // //             Return to Creator
// // // // // // // // // //           </Button>

// // // // // // // // // //           {/* 2. Approve Button with Confirmation */}
// // // // // // // // // //           <Button
// // // // // // // // // //             type="primary"
// // // // // // // // // //             icon={<CheckCircleOutlined />}
// // // // // // // // // //             onClick={handleApproveConfirmation}
// // // // // // // // // //             loading={loading}
// // // // // // // // // //             // Disabled when: NOT all locally approved OR still RM pending OR loading
// // // // // // // // // //             disabled={!allApproved}
// // // // // // // // // //             style={{
// // // // // // // // // //               backgroundColor:
// // // // // // // // // //                 !allApproved || hasPending ? "#d9d9d9" : undefined,
// // // // // // // // // //               borderColor: !allApproved || hasPending ? "#d9d9d9" : undefined,
// // // // // // // // // //             }}
// // // // // // // // // //           >
// // // // // // // // // //             Approve
// // // // // // // // // //           </Button>
// // // // // // // // // //         </Space>
// // // // // // // // // //       </div>
// // // // // // // // // //     </Modal>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // export default CheckerReviewChecklistModal;
// // // // // // // // // import React, { useState, useEffect, useMemo } from "react";
// // // // // // // // // import {
// // // // // // // // //   Button,
// // // // // // // // //   Table,
// // // // // // // // //   Tag,
// // // // // // // // //   Modal,
// // // // // // // // //   Input,
// // // // // // // // //   Card,
// // // // // // // // //   Row,
// // // // // // // // //   Col,
// // // // // // // // //   Progress,
// // // // // // // // //   Space,
// // // // // // // // //   List,
// // // // // // // // //   Avatar,
// // // // // // // // //   Spin,
// // // // // // // // // } from "antd";
// // // // // // // // // import {
// // // // // // // // //   CheckCircleOutlined,
// // // // // // // // //   RollbackOutlined,
// // // // // // // // //   DownloadOutlined,
// // // // // // // // //   EyeOutlined,
// // // // // // // // //   UploadOutlined,
// // // // // // // // //   UserOutlined,
// // // // // // // // // } from "@ant-design/icons";
// // // // // // // // // import jsPDF from "jspdf";
// // // // // // // // // import autoTable from "jspdf-autotable";
// // // // // // // // // import {
// // // // // // // // //   useUpdateCheckerStatusMutation,
// // // // // // // // //   useGetChecklistCommentsQuery,
// // // // // // // // // } from "../../api/checklistApi";

// // // // // // // // // const GREEN = "#52c41a";
// // // // // // // // // const RED = "red";

// // // // // // // // // const getRoleTag = (role) => {
// // // // // // // // //   const roleLower = role?.toLowerCase() || "system";
// // // // // // // // //   let color = "blue";
// // // // // // // // //   switch (roleLower) {
// // // // // // // // //     case "rm":
// // // // // // // // //       color = "purple";
// // // // // // // // //       break;
// // // // // // // // //     case "creator":
// // // // // // // // //       color = "green";
// // // // // // // // //       break;
// // // // // // // // //     case "co_checker":
// // // // // // // // //       color = "volcano";
// // // // // // // // //       break;
// // // // // // // // //     case "system":
// // // // // // // // //       color = "default";
// // // // // // // // //       break;
// // // // // // // // //     default:
// // // // // // // // //       color = "blue";
// // // // // // // // //   }
// // // // // // // // //   return (
// // // // // // // // //     <Tag color={color} style={{ marginLeft: 8, textTransform: "uppercase" }}>
// // // // // // // // //       {roleLower.replace(/_/g, " ")}
// // // // // // // // //     </Tag>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // const CommentTrail = ({ comments, isLoading }) => {
// // // // // // // // //   if (isLoading)
// // // // // // // // //     return <Spin style={{ display: "block", margin: "20px auto" }} />;
// // // // // // // // //   if (!comments || comments.length === 0)
// // // // // // // // //     return <i style={{ paddingLeft: 15 }}>No historical comments yet.</i>;

// // // // // // // // //   return (
// // // // // // // // //     <div style={{ maxHeight: 200, overflowY: "auto" }}>
// // // // // // // // //       <List
// // // // // // // // //         dataSource={comments}
// // // // // // // // //         itemLayout="horizontal"
// // // // // // // // //         renderItem={(item) => (
// // // // // // // // //           <List.Item>
// // // // // // // // //             <List.Item.Meta
// // // // // // // // //               avatar={<Avatar icon={<UserOutlined />} />}
// // // // // // // // //               title={
// // // // // // // // //                 <div
// // // // // // // // //                   style={{ display: "flex", justifyContent: "space-between" }}
// // // // // // // // //                 >
// // // // // // // // //                   <div>
// // // // // // // // //                     <b>{item.userId?.name || "System"}</b>
// // // // // // // // //                     {getRoleTag(item.userId?.role || "system")}
// // // // // // // // //                   </div>
// // // // // // // // //                   <span style={{ fontSize: 12, color: "#888" }}>
// // // // // // // // //                     {new Date(
// // // // // // // // //                       item.createdAt || item.timestamp
// // // // // // // // //                     ).toLocaleString()}
// // // // // // // // //                   </span>
// // // // // // // // //                 </div>
// // // // // // // // //               }
// // // // // // // // //               description={
// // // // // // // // //                 <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
// // // // // // // // //                   {item.message}
// // // // // // // // //                 </div>
// // // // // // // // //               }
// // // // // // // // //             />
// // // // // // // // //           </List.Item>
// // // // // // // // //         )}
// // // // // // // // //       />
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
// // // // // // // // //   const [docs, setDocs] = useState([]);
// // // // // // // // //   const [checkerComment, setCheckerComment] = useState("");
// // // // // // // // //   const [commentThread, setCommentThread] = useState([]);
// // // // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // // // //   const [submitCheckerStatus] = useUpdateCheckerStatusMutation();
// // // // // // // // //   const { data: comments, isLoading: commentsLoading } =
// // // // // // // // //     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

// // // // // // // // //   // Flatten and prepare docs
// // // // // // // // //   useEffect(() => {
// // // // // // // // //     if (!checklist?.documents) return;

// // // // // // // // //     const flatDocs = checklist.documents.reduce((acc, item) => {
// // // // // // // // //       if (item.docList?.length) {
// // // // // // // // //         const nested = item.docList.map((doc) => ({
// // // // // // // // //           ...doc,
// // // // // // // // //           category: item.category,
// // // // // // // // //         }));
// // // // // // // // //         return acc.concat(nested);
// // // // // // // // //       }
// // // // // // // // //       if (item.category) return acc.concat(item);
// // // // // // // // //       return acc;
// // // // // // // // //     }, []);

// // // // // // // // //     setDocs(
// // // // // // // // //       flatDocs.map((doc, idx) => ({
// // // // // // // // //         ...doc,
// // // // // // // // //         key: doc._id || `doc-${idx}`,
// // // // // // // // //         status: doc.status || "pending",
// // // // // // // // //         approved: doc.approved || false,
// // // // // // // // //         checkerStatus:
// // // // // // // // //           doc.checkerStatus || (doc.approved ? "approved" : "pending"),
// // // // // // // // //         comment: doc.comment || "",
// // // // // // // // //         fileUrl: doc.fileUrl || null,
// // // // // // // // //       }))
// // // // // // // // //     );
// // // // // // // // //   }, [checklist]);

// // // // // // // // //   const {
// // // // // // // // //     totalDocs,
// // // // // // // // //     submittedDocs,
// // // // // // // // //     pendingDocs,
// // // // // // // // //     allApproved,
// // // // // // // // //     hasPending,
// // // // // // // // //     progressPercent,
// // // // // // // // //   } = useMemo(() => {
// // // // // // // // //     const total = docs.length;
// // // // // // // // //     const submitted = docs.filter((d) => d.status === "submitted").length;
// // // // // // // // //     const pending = docs.filter((d) => d.status === "pending").length;
// // // // // // // // //     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);
// // // // // // // // //     const isStillPendingRm = docs.some((d) => d.status === "pending");

// // // // // // // // //     return {
// // // // // // // // //       totalDocs: total,
// // // // // // // // //       submittedDocs: submitted,
// // // // // // // // //       pendingDocs: pending,
// // // // // // // // //       allApproved: checkerApprovedAll,
// // // // // // // // //       hasPending: isStillPendingRm,
// // // // // // // // //       progressPercent: total ? (submitted / total) * 100 : 0,
// // // // // // // // //     };
// // // // // // // // //   }, [docs]);

// // // // // // // // //   const handleDocApprove = (index) => {
// // // // // // // // //     setDocs((prev) => {
// // // // // // // // //       const updated = [...prev];
// // // // // // // // //       updated[index].approved = true;
// // // // // // // // //       updated[index].checkerStatus = "approved";
// // // // // // // // //       return updated;
// // // // // // // // //     });
// // // // // // // // //   };

// // // // // // // // //   const handleDocReject = (index) => {
// // // // // // // // //     setDocs((prev) => {
// // // // // // // // //       const updated = [...prev];
// // // // // // // // //       updated[index].approved = false;
// // // // // // // // //       updated[index].checkerStatus = "rejected";
// // // // // // // // //       return updated;
// // // // // // // // //     });
// // // // // // // // //   };

// // // // // // // // //   const submitCheckerAction = async (action) => {
// // // // // // // // //     setLoading(true);
// // // // // // // // //     try {
// // // // // // // // //       await submitCheckerStatus({ id: checklist._id, action }).unwrap();
// // // // // // // // //       onClose();
// // // // // // // // //     } catch (err) {
// // // // // // // // //       console.error(err);
// // // // // // // // //       Modal.error({ title: "Error", content: err?.data?.message || "Failed" });
// // // // // // // // //     } finally {
// // // // // // // // //       setLoading(false);
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const postComment = () => {
// // // // // // // // //     if (!checkerComment.trim()) return;
// // // // // // // // //     setCommentThread((prev) => [
// // // // // // // // //       {
// // // // // // // // //         user: "Checker",
// // // // // // // // //         comment: checkerComment,
// // // // // // // // //         time: new Date().toLocaleString(),
// // // // // // // // //       },
// // // // // // // // //       ...prev,
// // // // // // // // //     ]);
// // // // // // // // //     setCheckerComment("");
// // // // // // // // //   };

// // // // // // // // //   const renderStatusTag = (status) => <Tag>{status.replace(/_/g, " ")}</Tag>;

// // // // // // // // //   const downloadPDF = () => {
// // // // // // // // //     const doc = new jsPDF();
// // // // // // // // //     doc.setFontSize(16);
// // // // // // // // //     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
// // // // // // // // //     const tableColumns = ["Category", "Document Name", "Status", "Co Comment"];
// // // // // // // // //     const tableRows = docs.map((d) => [
// // // // // // // // //       d.category,
// // // // // // // // //       d.name,
// // // // // // // // //       d.status === "submitted" ? "Submitted" : "Pending",
// // // // // // // // //       d.comment || "",
// // // // // // // // //     ]);
// // // // // // // // //     autoTable(doc, { head: [tableColumns], body: tableRows, startY: 60 });
// // // // // // // // //     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
// // // // // // // // //   };

// // // // // // // // //   const columns = [
// // // // // // // // //     { title: "Category", dataIndex: "category" },
// // // // // // // // //     { title: "Document Name", dataIndex: "name" },
// // // // // // // // //     {
// // // // // // // // //       title: "Co Status",
// // // // // // // // //       render: (_, record) =>
// // // // // // // // //         record.status === "pending" ? (
// // // // // // // // //           <Tag color={RED}>Pending</Tag>
// // // // // // // // //         ) : (
// // // // // // // // //           <Tag color={GREEN}>Submitted</Tag>
// // // // // // // // //         ),
// // // // // // // // //     },
// // // // // // // // //     { title: "Co Comment", dataIndex: "comment" },
// // // // // // // // //     {
// // // // // // // // //       title: "Checker Status",
// // // // // // // // //       dataIndex: "checkerStatus",
// // // // // // // // //       render: (status) => renderStatusTag(status),
// // // // // // // // //     },
// // // // // // // // //     {
// // // // // // // // //       title: "Action",
// // // // // // // // //       render: (_, record, index) => (
// // // // // // // // //         <Space>
// // // // // // // // //           <Button
// // // // // // // // //             size="small"
// // // // // // // // //             type="primary"
// // // // // // // // //             onClick={() => handleDocApprove(index)}
// // // // // // // // //           >
// // // // // // // // //             Approve
// // // // // // // // //           </Button>
// // // // // // // // //           <Button size="small" danger onClick={() => handleDocReject(index)}>
// // // // // // // // //             Reject
// // // // // // // // //           </Button>
// // // // // // // // //           {record.fileUrl && (
// // // // // // // // //             <Button
// // // // // // // // //               size="small"
// // // // // // // // //               icon={<EyeOutlined />}
// // // // // // // // //               onClick={() => window.open(record.fileUrl, "_blank")}
// // // // // // // // //             >
// // // // // // // // //               View
// // // // // // // // //             </Button>
// // // // // // // // //           )}
// // // // // // // // //         </Space>
// // // // // // // // //       ),
// // // // // // // // //     },
// // // // // // // // //   ];

// // // // // // // // //   return (
// // // // // // // // //     <Modal
// // // // // // // // //       title="Review Checklist"
// // // // // // // // //       open={open}
// // // // // // // // //       onCancel={onClose}
// // // // // // // // //       width={1000}
// // // // // // // // //       footer={null}
// // // // // // // // //     >
// // // // // // // // //       <Card style={{ marginBottom: 16 }}>
// // // // // // // // //         <Row gutter={16}>
// // // // // // // // //           <Col span={8}>
// // // // // // // // //             <p>
// // // // // // // // //               <b>DCL No:</b>{" "}
// // // // // // // // //               <span style={{ color: "#6b52b0" }}>{checklist?.dclNo}</span>
// // // // // // // // //             </p>
// // // // // // // // //             <p>
// // // // // // // // //               <b>Loan Type:</b> {checklist?.loanType}
// // // // // // // // //             </p>
// // // // // // // // //           </Col>
// // // // // // // // //           <Col span={8}>
// // // // // // // // //             <p>
// // // // // // // // //               <b>Created By:</b> {checklist?.createdBy?.name}
// // // // // // // // //             </p>
// // // // // // // // //             <p>
// // // // // // // // //               <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
// // // // // // // // //             </p>
// // // // // // // // //           </Col>
// // // // // // // // //           <Col span={8}>
// // // // // // // // //             <p>
// // // // // // // // //               <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
// // // // // // // // //             </p>
// // // // // // // // //             <p>
// // // // // // // // //               <b>Created At:</b> {checklist?.createdAt}
// // // // // // // // //             </p>
// // // // // // // // //           </Col>
// // // // // // // // //         </Row>
// // // // // // // // //       </Card>

// // // // // // // // //       <Card style={{ marginBottom: 16 }}>
// // // // // // // // //         <p>
// // // // // // // // //           <b>Total:</b> {totalDocs} &nbsp; | &nbsp;
// // // // // // // // //           <b>Submitted:</b> {submittedDocs} &nbsp; | &nbsp;
// // // // // // // // //           <b style={{ color: RED }}>Pending:</b> {pendingDocs}
// // // // // // // // //         </p>
// // // // // // // // //         <Progress
// // // // // // // // //           percent={progressPercent}
// // // // // // // // //           showInfo={false}
// // // // // // // // //           strokeColor={GREEN}
// // // // // // // // //         />
// // // // // // // // //       </Card>

// // // // // // // // //       <Table columns={columns} dataSource={docs} pagination={false} />

// // // // // // // // //       <Row gutter={16} style={{ marginTop: 16 }}>
// // // // // // // // //         <Col span={12}>
// // // // // // // // //           <Card title="Checker Comment">
// // // // // // // // //             <Input.TextArea
// // // // // // // // //               rows={3}
// // // // // // // // //               value={checkerComment}
// // // // // // // // //               onChange={(e) => setCheckerComment(e.target.value)}
// // // // // // // // //               placeholder="Add your comment..."
// // // // // // // // //             />
// // // // // // // // //             <Button
// // // // // // // // //               style={{ marginTop: 8 }}
// // // // // // // // //               type="primary"
// // // // // // // // //               onClick={postComment}
// // // // // // // // //             >
// // // // // // // // //               Post Comment
// // // // // // // // //             </Button>
// // // // // // // // //           </Card>
// // // // // // // // //         </Col>
// // // // // // // // //         <Col span={12}>
// // // // // // // // //           <Card
// // // // // // // // //             title="Comment Thread"
// // // // // // // // //             style={{ maxHeight: 160, overflowY: "auto" }}
// // // // // // // // //           >
// // // // // // // // //             {commentThread.map((c, idx) => (
// // // // // // // // //               <p key={idx}>
// // // // // // // // //                 <b>{c.user}:</b> {c.comment}{" "}
// // // // // // // // //                 <i style={{ fontSize: 10 }}>{c.time}</i>
// // // // // // // // //               </p>
// // // // // // // // //             ))}
// // // // // // // // //           </Card>
// // // // // // // // //         </Col>
// // // // // // // // //       </Row>

// // // // // // // // //       <div
// // // // // // // // //         style={{
// // // // // // // // //           marginTop: 20,
// // // // // // // // //           display: "flex",
// // // // // // // // //           justifyContent: "space-between",
// // // // // // // // //         }}
// // // // // // // // //       >
// // // // // // // // //         <Space>
// // // // // // // // //           <Button icon={<UploadOutlined />}>Upload Documents</Button>
// // // // // // // // //           <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
// // // // // // // // //             Download Checklist
// // // // // // // // //           </Button>
// // // // // // // // //         </Space>

// // // // // // // // //         <Space>
// // // // // // // // //           <Button
// // // // // // // // //             danger
// // // // // // // // //             loading={loading}
// // // // // // // // //             onClick={() =>
// // // // // // // // //               Modal.confirm({
// // // // // // // // //                 title: "Return to Creator?",
// // // // // // // // //                 content: "This will send the checklist back to the creator.",
// // // // // // // // //                 onOk: () => submitCheckerAction("co_creator_review"),
// // // // // // // // //               })
// // // // // // // // //             }
// // // // // // // // //           >
// // // // // // // // //             Return to Creator
// // // // // // // // //           </Button>

// // // // // // // // //           <Button
// // // // // // // // //             type="primary"
// // // // // // // // //             icon={<CheckCircleOutlined />}
// // // // // // // // //             loading={loading}
// // // // // // // // //             // disabled={!allApproved || hasPending}
// // // // // // // // //             style={{
// // // // // // // // //               backgroundColor:
// // // // // // // // //                 !allApproved || hasPending ? "#d9d9d9" : undefined,
// // // // // // // // //             }}
// // // // // // // // //             onClick={() =>
// // // // // // // // //               Modal.confirm({
// // // // // // // // //                 title: "Approve Checklist?",
// // // // // // // // //                 content: "This action is final.",
// // // // // // // // //                 onOk: () => submitCheckerAction("approved"),
// // // // // // // // //               })
// // // // // // // // //             }
// // // // // // // // //           >
// // // // // // // // //             Approve
// // // // // // // // //           </Button>
// // // // // // // // //         </Space>
// // // // // // // // //       </div>

// // // // // // // // //       <CommentTrail comments={comments} isLoading={commentsLoading} />
// // // // // // // // //     </Modal>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // export default CheckerReviewChecklistModal;
// // // // // // // // import React, { useState, useEffect, useMemo } from "react";
// // // // // // // // import {
// // // // // // // //   Button,
// // // // // // // //   Table,
// // // // // // // //   Tag,
// // // // // // // //   Modal,
// // // // // // // //   Input,
// // // // // // // //   Card,
// // // // // // // //   Row,
// // // // // // // //   Col,
// // // // // // // //   Progress,
// // // // // // // //   Space,
// // // // // // // //   List,
// // // // // // // //   Avatar,
// // // // // // // //   Spin,
// // // // // // // // } from "antd";
// // // // // // // // import {
// // // // // // // //   CheckCircleOutlined,
// // // // // // // //   RollbackOutlined,
// // // // // // // //   DownloadOutlined,
// // // // // // // //   EyeOutlined,
// // // // // // // //   UploadOutlined,
// // // // // // // //   UserOutlined,
// // // // // // // // } from "@ant-design/icons";
// // // // // // // // import jsPDF from "jspdf";
// // // // // // // // import autoTable from "jspdf-autotable";
// // // // // // // // import {
// // // // // // // //   useUpdateCheckerStatusMutation,
// // // // // // // //   useGetChecklistCommentsQuery,
// // // // // // // // } from "../../api/checklistApi";

// // // // // // // // const GREEN = "#52c41a";
// // // // // // // // const RED = "red";

// // // // // // // // // Role Tag
// // // // // // // // const getRoleTag = (role) => {
// // // // // // // //   const roleLower = role?.toLowerCase() || "system";
// // // // // // // //   let color = "blue";
// // // // // // // //   switch (roleLower) {
// // // // // // // //     case "rm":
// // // // // // // //       color = "purple";
// // // // // // // //       break;
// // // // // // // //     case "creator":
// // // // // // // //       color = "green";
// // // // // // // //       break;
// // // // // // // //     case "co_checker":
// // // // // // // //       color = "volcano";
// // // // // // // //       break;
// // // // // // // //     case "system":
// // // // // // // //       color = "default";
// // // // // // // //       break;
// // // // // // // //     default:
// // // // // // // //       color = "blue";
// // // // // // // //   }
// // // // // // // //   return (
// // // // // // // //     <Tag color={color} style={{ marginLeft: 8, textTransform: "uppercase" }}>
// // // // // // // //       {roleLower.replace(/_/g, " ")}
// // // // // // // //     </Tag>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // // Comment Trail
// // // // // // // // const CommentTrail = ({ comments, isLoading }) => {
// // // // // // // //   if (isLoading)
// // // // // // // //     return <Spin style={{ display: "block", margin: "20px auto" }} />;
// // // // // // // //   if (!comments || comments.length === 0)
// // // // // // // //     return <i style={{ paddingLeft: 15 }}>No historical comments yet.</i>;

// // // // // // // //   return (
// // // // // // // //     <div style={{ maxHeight: 200, overflowY: "auto" }}>
// // // // // // // //       <List
// // // // // // // //         dataSource={comments}
// // // // // // // //         itemLayout="horizontal"
// // // // // // // //         renderItem={(item) => (
// // // // // // // //           <List.Item>
// // // // // // // //             <List.Item.Meta
// // // // // // // //               avatar={<Avatar icon={<UserOutlined />} />}
// // // // // // // //               title={
// // // // // // // //                 <div
// // // // // // // //                   style={{ display: "flex", justifyContent: "space-between" }}
// // // // // // // //                 >
// // // // // // // //                   <div>
// // // // // // // //                     <b>{item.userId?.name || "System"}</b>
// // // // // // // //                     {getRoleTag(item.userId?.role || "system")}
// // // // // // // //                   </div>
// // // // // // // //                   <span style={{ fontSize: 12, color: "#888" }}>
// // // // // // // //                     {new Date(
// // // // // // // //                       item.createdAt || item.timestamp
// // // // // // // //                     ).toLocaleString()}
// // // // // // // //                   </span>
// // // // // // // //                 </div>
// // // // // // // //               }
// // // // // // // //               description={
// // // // // // // //                 <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
// // // // // // // //                   {item.message}
// // // // // // // //                 </div>
// // // // // // // //               }
// // // // // // // //             />
// // // // // // // //           </List.Item>
// // // // // // // //         )}
// // // // // // // //       />
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // // Main Modal
// // // // // // // // const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
// // // // // // // //   const [docs, setDocs] = useState([]);
// // // // // // // //   const [checkerComment, setCheckerComment] = useState("");
// // // // // // // //   const [commentThread, setCommentThread] = useState([]);
// // // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // // //   const [submitCheckerStatus] = useUpdateCheckerStatusMutation();
// // // // // // // //   const { data: comments, isLoading: commentsLoading } =
// // // // // // // //     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

// // // // // // // //   // Flatten documents
// // // // // // // //   useEffect(() => {
// // // // // // // //     if (!checklist?.documents) return;

// // // // // // // //     const flatDocs = checklist.documents.reduce((acc, item) => {
// // // // // // // //       if (item.docList?.length) {
// // // // // // // //         const nested = item.docList.map((doc) => ({
// // // // // // // //           ...doc,
// // // // // // // //           category: item.category,
// // // // // // // //         }));
// // // // // // // //         return acc.concat(nested);
// // // // // // // //       }
// // // // // // // //       if (item.category) return acc.concat(item);
// // // // // // // //       return acc;
// // // // // // // //     }, []);

// // // // // // // //     setDocs(
// // // // // // // //       flatDocs.map((doc, idx) => ({
// // // // // // // //         ...doc,
// // // // // // // //         key: doc._id || `doc-${idx}`,
// // // // // // // //         status: doc.status || "pending",
// // // // // // // //         approved: doc.approved || false,
// // // // // // // //         checkerStatus:
// // // // // // // //           doc.checkerStatus || (doc.approved ? "approved" : "pending"),
// // // // // // // //         comment: doc.comment || "",
// // // // // // // //         fileUrl: doc.fileUrl || null,
// // // // // // // //       }))
// // // // // // // //     );
// // // // // // // //   }, [checklist]);

// // // // // // // //   // Summary
// // // // // // // //   const {
// // // // // // // //     totalDocs,
// // // // // // // //     submittedDocs,
// // // // // // // //     pendingDocs,
// // // // // // // //     allApproved,
// // // // // // // //     hasPending,
// // // // // // // //     progressPercent,
// // // // // // // //   } = useMemo(() => {
// // // // // // // //     const total = docs.length;
// // // // // // // //     const submitted = docs.filter((d) => d.status === "submitted").length;
// // // // // // // //     const pending = docs.filter((d) => d.status === "pending").length;
// // // // // // // //     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);
// // // // // // // //     const isStillPendingRm = docs.some((d) => d.status === "pending");

// // // // // // // //     return {
// // // // // // // //       totalDocs: total,
// // // // // // // //       submittedDocs: submitted,
// // // // // // // //       pendingDocs: pending,
// // // // // // // //       allApproved: checkerApprovedAll,
// // // // // // // //       hasPending: isStillPendingRm,
// // // // // // // //       progressPercent: total ? (submitted / total) * 100 : 0,
// // // // // // // //     };
// // // // // // // //   }, [docs]);

// // // // // // // //   // Approve/Reject individual docs
// // // // // // // //   const handleDocApprove = (index) => {
// // // // // // // //     setDocs((prev) => {
// // // // // // // //       const updated = [...prev];
// // // // // // // //       updated[index].approved = true;
// // // // // // // //       updated[index].checkerStatus = "approved";
// // // // // // // //       return updated;
// // // // // // // //     });
// // // // // // // //   };

// // // // // // // //   const handleDocReject = (index) => {
// // // // // // // //     setDocs((prev) => {
// // // // // // // //       const updated = [...prev];
// // // // // // // //       updated[index].approved = false;
// // // // // // // //       updated[index].checkerStatus = "rejected";
// // // // // // // //       return updated;
// // // // // // // //     });
// // // // // // // //   };

// // // // // // // //   // Submit checker action
// // // // // // // //   const submitCheckerAction = async (status) => {
// // // // // // // //     setLoading(true);
// // // // // // // //     try {
// // // // // // // //       console.log("Submitting checker action:", checklist._id, status);
// // // // // // // //       await submitCheckerStatus({
// // // // // // // //         checklistId: checklist._id,
// // // // // // // //         status,
// // // // // // // //       }).unwrap();
// // // // // // // //       onClose();
// // // // // // // //     } catch (err) {
// // // // // // // //       console.error(err);
// // // // // // // //       Modal.error({ title: "Error", content: err?.data?.message || "Failed" });
// // // // // // // //     } finally {
// // // // // // // //       setLoading(false);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   // Button handlers
// // // // // // // //   const handleApprove = () => {
// // // // // // // //     Modal.confirm({
// // // // // // // //       title: "Approve Checklist?",
// // // // // // // //       content: "This action is final.",
// // // // // // // //       okText: "Yes",
// // // // // // // //       cancelText: "No",
// // // // // // // //       onOk: async () => await submitCheckerAction("approved"),
// // // // // // // //     });
// // // // // // // //   };

// // // // // // // //   const handleReturnToCreator = () => {
// // // // // // // //     Modal.confirm({
// // // // // // // //       title: "Return to Creator?",
// // // // // // // //       content: "This will send the checklist back to the creator.",
// // // // // // // //       okText: "Yes",
// // // // // // // //       cancelText: "No",
// // // // // // // //       onOk: async () => await submitCheckerAction("co_creator_review"),
// // // // // // // //     });
// // // // // // // //   };

// // // // // // // //   // Post comment
// // // // // // // //   const postComment = () => {
// // // // // // // //     if (!checkerComment.trim()) return;
// // // // // // // //     setCommentThread((prev) => [
// // // // // // // //       {
// // // // // // // //         user: "Checker",
// // // // // // // //         comment: checkerComment,
// // // // // // // //         time: new Date().toLocaleString(),
// // // // // // // //       },
// // // // // // // //       ...prev,
// // // // // // // //     ]);
// // // // // // // //     setCheckerComment("");
// // // // // // // //   };

// // // // // // // //   // Render status tag
// // // // // // // //   const renderStatusTag = (status) => <Tag>{status.replace(/_/g, " ")}</Tag>;

// // // // // // // //   // Download PDF
// // // // // // // //   const downloadPDF = () => {
// // // // // // // //     const doc = new jsPDF();
// // // // // // // //     doc.setFontSize(16);
// // // // // // // //     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
// // // // // // // //     const tableColumns = ["Category", "Document Name", "Status", "Co Comment"];
// // // // // // // //     const tableRows = docs.map((d) => [
// // // // // // // //       d.category,
// // // // // // // //       d.name,
// // // // // // // //       d.status === "submitted" ? "Submitted" : "Pending",
// // // // // // // //       d.comment || "",
// // // // // // // //     ]);
// // // // // // // //     autoTable(doc, { head: [tableColumns], body: tableRows, startY: 60 });
// // // // // // // //     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
// // // // // // // //   };

// // // // // // // //   // Table columns
// // // // // // // //   const columns = [
// // // // // // // //     { title: "Category", dataIndex: "category" },
// // // // // // // //     { title: "Document Name", dataIndex: "name" },
// // // // // // // //     {
// // // // // // // //       title: "Co Status",
// // // // // // // //       render: (_, record) =>
// // // // // // // //         record.status === "pending" ? (
// // // // // // // //           <Tag color={RED}>Pending</Tag>
// // // // // // // //         ) : (
// // // // // // // //           <Tag color={GREEN}>Submitted</Tag>
// // // // // // // //         ),
// // // // // // // //     },
// // // // // // // //     { title: "Co Comment", dataIndex: "comment" },
// // // // // // // //     {
// // // // // // // //       title: "Checker Status",
// // // // // // // //       dataIndex: "checkerStatus",
// // // // // // // //       render: (status) => renderStatusTag(status),
// // // // // // // //     },
// // // // // // // //     {
// // // // // // // //       title: "Action",
// // // // // // // //       render: (_, record, index) => (
// // // // // // // //         <Space>
// // // // // // // //           <Button
// // // // // // // //             size="small"
// // // // // // // //             type="primary"
// // // // // // // //             onClick={() => handleDocApprove(index)}
// // // // // // // //           >
// // // // // // // //             Approve
// // // // // // // //           </Button>
// // // // // // // //           <Button size="small" danger onClick={() => handleDocReject(index)}>
// // // // // // // //             Reject
// // // // // // // //           </Button>
// // // // // // // //           {record.fileUrl && (
// // // // // // // //             <Button
// // // // // // // //               size="small"
// // // // // // // //               icon={<EyeOutlined />}
// // // // // // // //               onClick={() => window.open(record.fileUrl, "_blank")}
// // // // // // // //             >
// // // // // // // //               View
// // // // // // // //             </Button>
// // // // // // // //           )}
// // // // // // // //         </Space>
// // // // // // // //       ),
// // // // // // // //     },
// // // // // // // //   ];

// // // // // // // //   return (
// // // // // // // //     <Modal
// // // // // // // //       title="Review Checklist"
// // // // // // // //       open={open}
// // // // // // // //       onCancel={onClose}
// // // // // // // //       width={1000}
// // // // // // // //       footer={null}
// // // // // // // //     >
// // // // // // // //       <Card style={{ marginBottom: 16 }}>
// // // // // // // //         <Row gutter={16}>
// // // // // // // //           <Col span={8}>
// // // // // // // //             <p>
// // // // // // // //               <b>DCL No:</b>{" "}
// // // // // // // //               <span style={{ color: "#6b52b0" }}>{checklist?.dclNo}</span>
// // // // // // // //             </p>
// // // // // // // //             <p>
// // // // // // // //               <b>Loan Type:</b> {checklist?.loanType}
// // // // // // // //             </p>
// // // // // // // //           </Col>
// // // // // // // //           <Col span={8}>
// // // // // // // //             <p>
// // // // // // // //               <b>Created By:</b> {checklist?.createdBy?.name}
// // // // // // // //             </p>
// // // // // // // //             <p>
// // // // // // // //               <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
// // // // // // // //             </p>
// // // // // // // //           </Col>
// // // // // // // //           <Col span={8}>
// // // // // // // //             <p>
// // // // // // // //               <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
// // // // // // // //             </p>
// // // // // // // //             <p>
// // // // // // // //               <b>Created At:</b> {checklist?.createdAt}
// // // // // // // //             </p>
// // // // // // // //           </Col>
// // // // // // // //         </Row>
// // // // // // // //       </Card>

// // // // // // // //       <Card style={{ marginBottom: 16 }}>
// // // // // // // //         <p>
// // // // // // // //           <b>Total:</b> {totalDocs} &nbsp; | &nbsp;
// // // // // // // //           <b>Submitted:</b> {submittedDocs} &nbsp; | &nbsp;
// // // // // // // //           <b style={{ color: RED }}>Pending:</b> {pendingDocs}
// // // // // // // //         </p>
// // // // // // // //         <Progress
// // // // // // // //           percent={progressPercent}
// // // // // // // //           showInfo={false}
// // // // // // // //           strokeColor={GREEN}
// // // // // // // //         />
// // // // // // // //       </Card>

// // // // // // // //       <Table columns={columns} dataSource={docs} pagination={false} />

// // // // // // // //       <Row gutter={16} style={{ marginTop: 16 }}>
// // // // // // // //         <Col span={12}>
// // // // // // // //           <Card title="Checker Comment">
// // // // // // // //             <Input.TextArea
// // // // // // // //               rows={3}
// // // // // // // //               value={checkerComment}
// // // // // // // //               onChange={(e) => setCheckerComment(e.target.value)}
// // // // // // // //               placeholder="Add your comment..."
// // // // // // // //             />
// // // // // // // //             <Button
// // // // // // // //               style={{ marginTop: 8 }}
// // // // // // // //               type="primary"
// // // // // // // //               onClick={postComment}
// // // // // // // //             >
// // // // // // // //               Post Comment
// // // // // // // //             </Button>
// // // // // // // //           </Card>
// // // // // // // //         </Col>
// // // // // // // //         <Col span={12}>
// // // // // // // //           <Card
// // // // // // // //             title="Comment Thread"
// // // // // // // //             style={{ maxHeight: 160, overflowY: "auto" }}
// // // // // // // //           >
// // // // // // // //             {commentThread.map((c, idx) => (
// // // // // // // //               <p key={idx}>
// // // // // // // //                 <b>{c.user}:</b> {c.comment}{" "}
// // // // // // // //                 <i style={{ fontSize: 10 }}>{c.time}</i>
// // // // // // // //               </p>
// // // // // // // //             ))}
// // // // // // // //           </Card>
// // // // // // // //         </Col>
// // // // // // // //       </Row>

// // // // // // // //       <div
// // // // // // // //         style={{
// // // // // // // //           marginTop: 20,
// // // // // // // //           display: "flex",
// // // // // // // //           justifyContent: "space-between",
// // // // // // // //         }}
// // // // // // // //       >
// // // // // // // //         <Space>
// // // // // // // //           <Button icon={<UploadOutlined />}>Upload Documents</Button>
// // // // // // // //           <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
// // // // // // // //             Download Checklist
// // // // // // // //           </Button>
// // // // // // // //         </Space>

// // // // // // // //         <Space>
// // // // // // // //           <Button danger loading={loading} onClick={handleReturnToCreator}>
// // // // // // // //             Return to Creator
// // // // // // // //           </Button>

// // // // // // // //           <Button
// // // // // // // //             type="primary"
// // // // // // // //             icon={<CheckCircleOutlined />}
// // // // // // // //             loading={loading}
// // // // // // // //             disabled={!allApproved || hasPending}
// // // // // // // //             style={{
// // // // // // // //               backgroundColor:
// // // // // // // //                 !allApproved || hasPending ? "#d9d9d9" : undefined,
// // // // // // // //             }}
// // // // // // // //             onClick={handleApprove}
// // // // // // // //           >
// // // // // // // //             Approve
// // // // // // // //           </Button>
// // // // // // // //         </Space>
// // // // // // // //       </div>

// // // // // // // //       <CommentTrail comments={comments} isLoading={commentsLoading} />
// // // // // // // //     </Modal>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default CheckerReviewChecklistModal;
// // // // // // // import React, { useState, useEffect, useMemo } from "react";
// // // // // // // import {
// // // // // // //   Button,
// // // // // // //   Table,
// // // // // // //   Tag,
// // // // // // //   Input,
// // // // // // //   Card,
// // // // // // //   Row,
// // // // // // //   Col,
// // // // // // //   Progress,
// // // // // // //   Space,
// // // // // // //   List,
// // // // // // //   Avatar,
// // // // // // //   Spin,
// // // // // // // } from "antd";
// // // // // // // import {
// // // // // // //   CheckCircleOutlined,
// // // // // // //   EyeOutlined,
// // // // // // //   UploadOutlined,
// // // // // // //   DownloadOutlined,
// // // // // // //   UserOutlined,
// // // // // // // } from "@ant-design/icons";
// // // // // // // import jsPDF from "jspdf";
// // // // // // // import autoTable from "jspdf-autotable";
// // // // // // // import {
// // // // // // //   useUpdateCheckerStatusMutation,
// // // // // // //   useGetChecklistCommentsQuery,
// // // // // // // } from "../../api/checklistApi";

// // // // // // // const GREEN = "#52c41a";
// // // // // // // const RED = "red";

// // // // // // // // Role Tag
// // // // // // // const getRoleTag = (role) => {
// // // // // // //   const roleLower = role?.toLowerCase() || "system";
// // // // // // //   let color = "blue";
// // // // // // //   switch (roleLower) {
// // // // // // //     case "rm":
// // // // // // //       color = "purple";
// // // // // // //       break;
// // // // // // //     case "creator":
// // // // // // //       color = "green";
// // // // // // //       break;
// // // // // // //     case "co_checker":
// // // // // // //       color = "volcano";
// // // // // // //       break;
// // // // // // //     case "system":
// // // // // // //       color = "default";
// // // // // // //       break;
// // // // // // //     default:
// // // // // // //       color = "blue";
// // // // // // //   }
// // // // // // //   return (
// // // // // // //     <Tag color={color} className="ml-2 uppercase">
// // // // // // //       {roleLower.replace(/_/g, " ")}
// // // // // // //     </Tag>
// // // // // // //   );
// // // // // // // };

// // // // // // // // Comment Trail
// // // // // // // const CommentTrail = ({ comments, isLoading }) => {
// // // // // // //   if (isLoading) return <Spin className="block m-5" />;
// // // // // // //   if (!comments || comments.length === 0)
// // // // // // //     return <i className="pl-4">No historical comments yet.</i>;

// // // // // // //   return (
// // // // // // //     <div className="max-h-52 overflow-y-auto">
// // // // // // //       <List
// // // // // // //         dataSource={comments}
// // // // // // //         itemLayout="horizontal"
// // // // // // //         renderItem={(item) => (
// // // // // // //           <List.Item>
// // // // // // //             <List.Item.Meta
// // // // // // //               avatar={<Avatar icon={<UserOutlined />} />}
// // // // // // //               title={
// // // // // // //                 <div className="flex justify-between">
// // // // // // //                   <div>
// // // // // // //                     <b>{item.userId?.name || "System"}</b>
// // // // // // //                     {getRoleTag(item.userId?.role || "system")}
// // // // // // //                   </div>
// // // // // // //                   <span className="text-xs text-gray-500">
// // // // // // //                     {new Date(
// // // // // // //                       item.createdAt || item.timestamp
// // // // // // //                     ).toLocaleString()}
// // // // // // //                   </span>
// // // // // // //                 </div>
// // // // // // //               }
// // // // // // //               description={<div className="break-words">{item.message}</div>}
// // // // // // //             />
// // // // // // //           </List.Item>
// // // // // // //         )}
// // // // // // //       />
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // // Main Modal
// // // // // // // const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
// // // // // // //   const [docs, setDocs] = useState([]);
// // // // // // //   const [checkerComment, setCheckerComment] = useState("");
// // // // // // //   const [commentThread, setCommentThread] = useState([]);
// // // // // // //   const [loading, setLoading] = useState(false);
// // // // // // //   const [confirmAction, setConfirmAction] = useState(null); // "approve" or "return"

// // // // // // //   const [submitCheckerStatus] = useUpdateCheckerStatusMutation();
// // // // // // //   const { data: comments, isLoading: commentsLoading } =
// // // // // // //     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

// // // // // // //   // Flatten docs
// // // // // // //   useEffect(() => {
// // // // // // //     if (!checklist?.documents) return;
// // // // // // //     const flatDocs = checklist.documents.reduce((acc, item) => {
// // // // // // //       if (item.docList?.length) {
// // // // // // //         const nested = item.docList.map((doc) => ({
// // // // // // //           ...doc,
// // // // // // //           category: item.category,
// // // // // // //         }));
// // // // // // //         return acc.concat(nested);
// // // // // // //       }
// // // // // // //       if (item.category) return acc.concat(item);
// // // // // // //       return acc;
// // // // // // //     }, []);

// // // // // // //     setDocs(
// // // // // // //       flatDocs.map((doc, idx) => ({
// // // // // // //         ...doc,
// // // // // // //         key: doc._id || `doc-${idx}`,
// // // // // // //         status: doc.status || "pending",
// // // // // // //         approved: doc.approved || false,
// // // // // // //         checkerStatus:
// // // // // // //           doc.checkerStatus || (doc.approved ? "approved" : "pending"),
// // // // // // //         comment: doc.comment || "",
// // // // // // //         fileUrl: doc.fileUrl || null,
// // // // // // //       }))
// // // // // // //     );
// // // // // // //   }, [checklist]);

// // // // // // //   const {
// // // // // // //     totalDocs,
// // // // // // //     submittedDocs,
// // // // // // //     pendingDocs,
// // // // // // //     allApproved,
// // // // // // //     hasPending,
// // // // // // //     progressPercent,
// // // // // // //   } = useMemo(() => {
// // // // // // //     const total = docs.length;
// // // // // // //     const submitted = docs.filter((d) => d.status === "submitted").length;
// // // // // // //     const pending = docs.filter((d) => d.status === "pending").length;
// // // // // // //     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);
// // // // // // //     const isStillPendingRm = docs.some((d) => d.status === "pending");
// // // // // // //     return {
// // // // // // //       totalDocs: total,
// // // // // // //       submittedDocs: submitted,
// // // // // // //       pendingDocs: pending,
// // // // // // //       allApproved: checkerApprovedAll,
// // // // // // //       hasPending: isStillPendingRm,
// // // // // // //       progressPercent: total ? (submitted / total) * 100 : 0,
// // // // // // //     };
// // // // // // //   }, [docs]);

// // // // // // //   const handleDocApprove = (index) => {
// // // // // // //     setDocs((prev) => {
// // // // // // //       const updated = [...prev];
// // // // // // //       updated[index].approved = true;
// // // // // // //       updated[index].checkerStatus = "approved";
// // // // // // //       return updated;
// // // // // // //     });
// // // // // // //   };

// // // // // // //   const handleDocReject = (index) => {
// // // // // // //     setDocs((prev) => {
// // // // // // //       const updated = [...prev];
// // // // // // //       updated[index].approved = false;
// // // // // // //       updated[index].checkerStatus = "rejected";
// // // // // // //       return updated;
// // // // // // //     });
// // // // // // //   };

// // // // // // //   const submitCheckerAction = async (status) => {
// // // // // // //     setLoading(true);
// // // // // // //     try {
// // // // // // //       await submitCheckerStatus({
// // // // // // //         checklistId: checklist._id,
// // // // // // //         status,
// // // // // // //       }).unwrap();
// // // // // // //       setConfirmAction(null);
// // // // // // //       onClose();
// // // // // // //     } catch (err) {
// // // // // // //       console.error(err);
// // // // // // //       alert(err?.data?.message || "Failed");
// // // // // // //     } finally {
// // // // // // //       setLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const postComment = () => {
// // // // // // //     if (!checkerComment.trim()) return;
// // // // // // //     setCommentThread((prev) => [
// // // // // // //       {
// // // // // // //         user: "Checker",
// // // // // // //         comment: checkerComment,
// // // // // // //         time: new Date().toLocaleString(),
// // // // // // //       },
// // // // // // //       ...prev,
// // // // // // //     ]);
// // // // // // //     setCheckerComment("");
// // // // // // //   };

// // // // // // //   const renderStatusTag = (status) => <Tag>{status.replace(/_/g, " ")}</Tag>;

// // // // // // //   const downloadPDF = () => {
// // // // // // //     const doc = new jsPDF();
// // // // // // //     doc.setFontSize(16);
// // // // // // //     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
// // // // // // //     const tableColumns = ["Category", "Document Name", "Status", "Co Comment"];
// // // // // // //     const tableRows = docs.map((d) => [
// // // // // // //       d.category,
// // // // // // //       d.name,
// // // // // // //       d.status === "submitted" ? "Submitted" : "Pending",
// // // // // // //       d.comment || "",
// // // // // // //     ]);
// // // // // // //     autoTable(doc, { head: [tableColumns], body: tableRows, startY: 60 });
// // // // // // //     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
// // // // // // //   };

// // // // // // //   const columns = [
// // // // // // //     { title: "Category", dataIndex: "category" },
// // // // // // //     { title: "Document Name", dataIndex: "name" },
// // // // // // //     {
// // // // // // //       title: "Co Status",
// // // // // // //       render: (_, record) =>
// // // // // // //         record.status === "pending" ? (
// // // // // // //           <Tag color={RED}>Pending</Tag>
// // // // // // //         ) : (
// // // // // // //           <Tag color={GREEN}>Submitted</Tag>
// // // // // // //         ),
// // // // // // //     },
// // // // // // //     { title: "Co Comment", dataIndex: "comment" },
// // // // // // //     {
// // // // // // //       title: "Checker Status",
// // // // // // //       dataIndex: "checkerStatus",
// // // // // // //       render: (status) => renderStatusTag(status),
// // // // // // //     },
// // // // // // //     {
// // // // // // //       title: "Action",
// // // // // // //       render: (_, record, index) => (
// // // // // // //         <Space>
// // // // // // //           <Button
// // // // // // //             size="small"
// // // // // // //             type="primary"
// // // // // // //             onClick={() => handleDocApprove(index)}
// // // // // // //           >
// // // // // // //             Approve
// // // // // // //           </Button>
// // // // // // //           <Button size="small" danger onClick={() => handleDocReject(index)}>
// // // // // // //             Reject
// // // // // // //           </Button>
// // // // // // //           {record.fileUrl && (
// // // // // // //             <Button
// // // // // // //               size="small"
// // // // // // //               icon={<EyeOutlined />}
// // // // // // //               onClick={() => window.open(record.fileUrl, "_blank")}
// // // // // // //             >
// // // // // // //               View
// // // // // // //             </Button>
// // // // // // //           )}
// // // // // // //         </Space>
// // // // // // //       ),
// // // // // // //     },
// // // // // // //   ];

// // // // // // //   return (
// // // // // // //     <div
// // // // // // //       className={`fixed inset-0 z-50 overflow-auto bg-black/40 flex justify-center items-start pt-10 ${
// // // // // // //         open ? "" : "hidden"
// // // // // // //       }`}
// // // // // // //     >
// // // // // // //       <div className="bg-white dark:bg-gray-800 w-[95%] max-w-6xl p-6 rounded-lg shadow-lg relative">
// // // // // // //         {/* Checklist Info */}
// // // // // // //         <Card className="mb-4">
// // // // // // //           <Row gutter={16}>
// // // // // // //             <Col span={8}>
// // // // // // //               <p>
// // // // // // //                 <b>DCL No:</b>{" "}
// // // // // // //                 <span className="text-purple-700">{checklist?.dclNo}</span>
// // // // // // //               </p>
// // // // // // //               <p>
// // // // // // //                 <b>Loan Type:</b> {checklist?.loanType}
// // // // // // //               </p>
// // // // // // //             </Col>
// // // // // // //             <Col span={8}>
// // // // // // //               <p>
// // // // // // //                 <b>Created By:</b> {checklist?.createdBy?.name}
// // // // // // //               </p>
// // // // // // //               <p>
// // // // // // //                 <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
// // // // // // //               </p>
// // // // // // //             </Col>
// // // // // // //             <Col span={8}>
// // // // // // //               <p>
// // // // // // //                 <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
// // // // // // //               </p>
// // // // // // //               <p>
// // // // // // //                 <b>Created At:</b> {checklist?.createdAt}
// // // // // // //               </p>
// // // // // // //             </Col>
// // // // // // //           </Row>
// // // // // // //         </Card>

// // // // // // //         {/* Progress */}
// // // // // // //         <Card className="mb-4">
// // // // // // //           <p>
// // // // // // //             <b>Total:</b> {totalDocs} | <b>Submitted:</b> {submittedDocs} |{" "}
// // // // // // //             <b className="text-red-600">Pending:</b> {pendingDocs}
// // // // // // //           </p>
// // // // // // //           <Progress
// // // // // // //             percent={progressPercent}
// // // // // // //             showInfo={false}
// // // // // // //             strokeColor={GREEN}
// // // // // // //           />
// // // // // // //         </Card>

// // // // // // //         <Table columns={columns} dataSource={docs} pagination={false} />

// // // // // // //         {/* Comments */}
// // // // // // //         <Row gutter={16} className="mt-4">
// // // // // // //           <Col span={12}>
// // // // // // //             <Card title="Checker Comment">
// // // // // // //               <Input.TextArea
// // // // // // //                 rows={3}
// // // // // // //                 value={checkerComment}
// // // // // // //                 onChange={(e) => setCheckerComment(e.target.value)}
// // // // // // //                 placeholder="Add your comment..."
// // // // // // //               />
// // // // // // //               <Button className="mt-2" type="primary" onClick={postComment}>
// // // // // // //                 Post Comment
// // // // // // //               </Button>
// // // // // // //             </Card>
// // // // // // //           </Col>
// // // // // // //           <Col span={12}>
// // // // // // //             <Card title="Comment Thread" className="max-h-40 overflow-y-auto">
// // // // // // //               {commentThread.map((c, idx) => (
// // // // // // //                 <p key={idx}>
// // // // // // //                   <b>{c.user}:</b> {c.comment}{" "}
// // // // // // //                   <i className="text-xs">{c.time}</i>
// // // // // // //                 </p>
// // // // // // //               ))}
// // // // // // //             </Card>
// // // // // // //           </Col>
// // // // // // //         </Row>

// // // // // // //         {/* Bottom Buttons */}
// // // // // // //         <div className="mt-6 flex justify-between items-center">
// // // // // // //           <Space>
// // // // // // //             <Button icon={<UploadOutlined />}>Upload Documents</Button>
// // // // // // //             <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
// // // // // // //               Download Checklist
// // // // // // //             </Button>
// // // // // // //           </Space>

// // // // // // //           <Space>
// // // // // // //             <Button danger onClick={() => setConfirmAction("return")}>
// // // // // // //               Return to Creator
// // // // // // //             </Button>
// // // // // // //             <Button
// // // // // // //               type="primary"
// // // // // // //               icon={<CheckCircleOutlined />}
// // // // // // //               disabled={!allApproved || hasPending}
// // // // // // //               onClick={() => setConfirmAction("approve")}
// // // // // // //             >
// // // // // // //               Approve
// // // // // // //             </Button>
// // // // // // //           </Space>
// // // // // // //         </div>

// // // // // // //         {/* Custom Confirmation Card */}
// // // // // // //         {confirmAction && (
// // // // // // //           <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
// // // // // // //             <div className="bg-white dark:bg-gray-700 p-6 rounded-lg w-96 shadow-lg text-center">
// // // // // // //               <h3 className="text-lg font-bold mb-4">
// // // // // // //                 {confirmAction === "approve"
// // // // // // //                   ? "Approve Checklist?"
// // // // // // //                   : "Return to Creator?"}
// // // // // // //               </h3>
// // // // // // //               <p className="mb-6">
// // // // // // //                 {confirmAction === "approve"
// // // // // // //                   ? "This action is final."
// // // // // // //                   : "This will send the checklist back to the creator."}
// // // // // // //               </p>
// // // // // // //               <div className="flex justify-center gap-4">
// // // // // // //                 <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
// // // // // // //                 <Button
// // // // // // //                   type="primary"
// // // // // // //                   loading={loading}
// // // // // // //                   onClick={() => submitCheckerAction(confirmAction)}
// // // // // // //                 >
// // // // // // //                   Confirm
// // // // // // //                 </Button>
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         )}

// // // // // // //         {/* Comment trail */}
// // // // // // //         <CommentTrail comments={comments} isLoading={commentsLoading} />
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default CheckerReviewChecklistModal;
// // // // // // import React, { useState, useEffect, useMemo } from "react";
// // // // // // import {
// // // // // //   Button,
// // // // // //   Table,
// // // // // //   Tag,
// // // // // //   Input,
// // // // // //   Card,
// // // // // //   Row,
// // // // // //   Col,
// // // // // //   Progress,
// // // // // //   Space,
// // // // // //   List,
// // // // // //   Avatar,
// // // // // //   Spin,
// // // // // // } from "antd";
// // // // // // import {
// // // // // //   CheckCircleOutlined,
// // // // // //   EyeOutlined,
// // // // // //   UploadOutlined,
// // // // // //   DownloadOutlined,
// // // // // //   UserOutlined,
// // // // // // } from "@ant-design/icons";
// // // // // // import jsPDF from "jspdf";
// // // // // // import autoTable from "jspdf-autotable";
// // // // // // import {
// // // // // //   useUpdateCheckerStatusMutation,
// // // // // //   useGetChecklistCommentsQuery,
// // // // // // } from "../../api/checklistApi";

// // // // // // const GREEN = "#52c41a";
// // // // // // const RED = "red";

// // // // // // // Role Tag
// // // // // // const getRoleTag = (role) => {
// // // // // //   const roleLower = role?.toLowerCase() || "system";
// // // // // //   let color = "blue";
// // // // // //   switch (roleLower) {
// // // // // //     case "rm":
// // // // // //       color = "purple";
// // // // // //       break;
// // // // // //     case "creator":
// // // // // //       color = "green";
// // // // // //       break;
// // // // // //     case "co_checker":
// // // // // //       color = "volcano";
// // // // // //       break;
// // // // // //     case "system":
// // // // // //       color = "default";
// // // // // //       break;
// // // // // //     default:
// // // // // //       color = "blue";
// // // // // //   }
// // // // // //   return (
// // // // // //     <Tag color={color} className="ml-2 uppercase">
// // // // // //       {roleLower.replace(/_/g, " ")}
// // // // // //     </Tag>
// // // // // //   );
// // // // // // };

// // // // // // // Comment Trail
// // // // // // const CommentTrail = ({ comments, isLoading }) => {
// // // // // //   if (isLoading) return <Spin className="block m-5" />;
// // // // // //   if (!comments || comments.length === 0)
// // // // // //     return <i className="pl-4">No historical comments yet.</i>;

// // // // // //   return (
// // // // // //     <div className="max-h-52 overflow-y-auto">
// // // // // //       <List
// // // // // //         dataSource={comments}
// // // // // //         itemLayout="horizontal"
// // // // // //         renderItem={(item) => (
// // // // // //           <List.Item>
// // // // // //             <List.Item.Meta
// // // // // //               avatar={<Avatar icon={<UserOutlined />} />}
// // // // // //               title={
// // // // // //                 <div className="flex justify-between">
// // // // // //                   <div>
// // // // // //                     <b>{item.userId?.name || "System"}</b>
// // // // // //                     {getRoleTag(item.userId?.role || "system")}
// // // // // //                   </div>
// // // // // //                   <span className="text-xs text-gray-500">
// // // // // //                     {new Date(
// // // // // //                       item.createdAt || item.timestamp
// // // // // //                     ).toLocaleString()}
// // // // // //                   </span>
// // // // // //                 </div>
// // // // // //               }
// // // // // //               description={<div className="break-words">{item.message}</div>}
// // // // // //             />
// // // // // //           </List.Item>
// // // // // //         )}
// // // // // //       />
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // // Main Modal
// // // // // // const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
// // // // // //   const [docs, setDocs] = useState([]);
// // // // // //   const [checkerComment, setCheckerComment] = useState("");
// // // // // //   const [commentThread, setCommentThread] = useState([]);
// // // // // //   const [loading, setLoading] = useState(false);
// // // // // //   const [confirmAction, setConfirmAction] = useState(null); // "approve" or "return"

// // // // // //   const [submitCheckerStatus] = useUpdateCheckerStatusMutation();
// // // // // //   const { data: comments, isLoading: commentsLoading } =
// // // // // //     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

// // // // // //   // Flatten docs
// // // // // //   useEffect(() => {
// // // // // //     if (!checklist?.documents) return;
// // // // // //     const flatDocs = checklist.documents.reduce((acc, item) => {
// // // // // //       if (item.docList?.length) {
// // // // // //         const nested = item.docList.map((doc) => ({
// // // // // //           ...doc,
// // // // // //           category: item.category,
// // // // // //         }));
// // // // // //         return acc.concat(nested);
// // // // // //       }
// // // // // //       if (item.category) return acc.concat(item);
// // // // // //       return acc;
// // // // // //     }, []);

// // // // // //     setDocs(
// // // // // //       flatDocs.map((doc, idx) => ({
// // // // // //         ...doc,
// // // // // //         key: doc._id || `doc-${idx}`,
// // // // // //         status: doc.status || "pending",
// // // // // //         approved: doc.approved || false,
// // // // // //         checkerStatus:
// // // // // //           doc.checkerStatus || (doc.approved ? "approved" : "pending"),
// // // // // //         comment: doc.comment || "",
// // // // // //         fileUrl: doc.fileUrl || null,
// // // // // //       }))
// // // // // //     );
// // // // // //   }, [checklist]);

// // // // // //   const {
// // // // // //     totalDocs,
// // // // // //     submittedDocs,
// // // // // //     pendingDocs,
// // // // // //     allApproved,
// // // // // //     hasPending,
// // // // // //     progressPercent,
// // // // // //   } = useMemo(() => {
// // // // // //     const total = docs.length;
// // // // // //     const submitted = docs.filter((d) => d.status === "submitted").length;
// // // // // //     const pending = docs.filter((d) => d.status === "pending").length;
// // // // // //     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);
// // // // // //     const isStillPendingRm = docs.some((d) => d.status === "pending");
// // // // // //     return {
// // // // // //       totalDocs: total,
// // // // // //       submittedDocs: submitted,
// // // // // //       pendingDocs: pending,
// // // // // //       allApproved: checkerApprovedAll,
// // // // // //       hasPending: isStillPendingRm,
// // // // // //       progressPercent: total ? (submitted / total) * 100 : 0,
// // // // // //     };
// // // // // //   }, [docs]);

// // // // // //   const handleDocApprove = (index) => {
// // // // // //     setDocs((prev) => {
// // // // // //       const updated = [...prev];
// // // // // //       updated[index].approved = true;
// // // // // //       updated[index].checkerStatus = "approved";
// // // // // //       return updated;
// // // // // //     });
// // // // // //   };

// // // // // //   const handleDocReject = (index) => {
// // // // // //     setDocs((prev) => {
// // // // // //       const updated = [...prev];
// // // // // //       updated[index].approved = false;
// // // // // //       updated[index].checkerStatus = "rejected";
// // // // // //       return updated;
// // // // // //     });
// // // // // //   };

// // // // // //   // ✅ Correct payload for backend
// // // // // //   const submitCheckerAction = async (action) => {
// // // // // //     if (!checklist?._id) return alert("Checklist ID missing");
// // // // // //     setLoading(true);
// // // // // //     try {
// // // // // //       await submitCheckerStatus({ id: checklist._id, action }).unwrap(); // ✅ id + action
// // // // // //       setConfirmAction(null);
// // // // // //       onClose();
// // // // // //     } catch (err) {
// // // // // //       console.error(err);
// // // // // //       alert(err?.data?.message || "Failed");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   const postComment = () => {
// // // // // //     if (!checkerComment.trim()) return;
// // // // // //     setCommentThread((prev) => [
// // // // // //       {
// // // // // //         user: "Checker",
// // // // // //         comment: checkerComment,
// // // // // //         time: new Date().toLocaleString(),
// // // // // //       },
// // // // // //       ...prev,
// // // // // //     ]);
// // // // // //     setCheckerComment("");
// // // // // //   };

// // // // // //   const renderStatusTag = (status) => <Tag>{status.replace(/_/g, " ")}</Tag>;

// // // // // //   const downloadPDF = () => {
// // // // // //     const doc = new jsPDF();
// // // // // //     doc.setFontSize(16);
// // // // // //     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
// // // // // //     const tableColumns = ["Category", "Document Name", "Status", "Co Comment"];
// // // // // //     const tableRows = docs.map((d) => [
// // // // // //       d.category,
// // // // // //       d.name,
// // // // // //       d.status === "submitted" ? "Submitted" : "Pending",
// // // // // //       d.comment || "",
// // // // // //     ]);
// // // // // //     autoTable(doc, { head: [tableColumns], body: tableRows, startY: 60 });
// // // // // //     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
// // // // // //   };

// // // // // //   const columns = [
// // // // // //     { title: "Category", dataIndex: "category" },
// // // // // //     { title: "Document Name", dataIndex: "name" },
// // // // // //     {
// // // // // //       title: "Co Status",
// // // // // //       render: (_, record) =>
// // // // // //         record.status === "pending" ? (
// // // // // //           <Tag color={RED}>Pending</Tag>
// // // // // //         ) : (
// // // // // //           <Tag color={GREEN}>Submitted</Tag>
// // // // // //         ),
// // // // // //     },
// // // // // //     { title: "Co Comment", dataIndex: "comment" },
// // // // // //     {
// // // // // //       title: "Checker Status",
// // // // // //       dataIndex: "checkerStatus",
// // // // // //       render: (status) => renderStatusTag(status),
// // // // // //     },
// // // // // //     {
// // // // // //       title: "Action",
// // // // // //       render: (_, record, index) => (
// // // // // //         <Space>
// // // // // //           <Button
// // // // // //             size="small"
// // // // // //             type="primary"
// // // // // //             onClick={() => handleDocApprove(index)}
// // // // // //           >
// // // // // //             Approve
// // // // // //           </Button>
// // // // // //           <Button size="small" danger onClick={() => handleDocReject(index)}>
// // // // // //             Reject
// // // // // //           </Button>
// // // // // //           {record.fileUrl && (
// // // // // //             <Button
// // // // // //               size="small"
// // // // // //               icon={<EyeOutlined />}
// // // // // //               onClick={() => window.open(record.fileUrl, "_blank")}
// // // // // //             >
// // // // // //               View
// // // // // //             </Button>
// // // // // //           )}
// // // // // //         </Space>
// // // // // //       ),
// // // // // //     },
// // // // // //   ];

// // // // // //   return (
// // // // // //     <div
// // // // // //       className={`fixed inset-0 z-50 overflow-auto bg-black/40 flex justify-center items-start pt-10 ${
// // // // // //         open ? "" : "hidden"
// // // // // //       }`}
// // // // // //     >
// // // // // //       <div className="bg-white dark:bg-gray-800 w-[95%] max-w-6xl p-6 rounded-lg shadow-lg relative">
// // // // // //         {/* Checklist Info */}
// // // // // //         <Card className="mb-4">
// // // // // //           <Row gutter={16}>
// // // // // //             <Col span={8}>
// // // // // //               <p>
// // // // // //                 <b>DCL No:</b>{" "}
// // // // // //                 <span className="text-purple-700">{checklist?.dclNo}</span>
// // // // // //               </p>
// // // // // //               <p>
// // // // // //                 <b>Loan Type:</b> {checklist?.loanType}
// // // // // //               </p>
// // // // // //             </Col>
// // // // // //             <Col span={8}>
// // // // // //               <p>
// // // // // //                 <b>Created By:</b> {checklist?.createdBy?.name}
// // // // // //               </p>
// // // // // //               <p>
// // // // // //                 <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
// // // // // //               </p>
// // // // // //             </Col>
// // // // // //             <Col span={8}>
// // // // // //               <p>
// // // // // //                 <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
// // // // // //               </p>
// // // // // //               <p>
// // // // // //                 <b>Created At:</b> {checklist?.createdAt}
// // // // // //               </p>
// // // // // //             </Col>
// // // // // //           </Row>
// // // // // //         </Card>

// // // // // //         {/* Progress */}
// // // // // //         <Card className="mb-4">
// // // // // //           <p>
// // // // // //             <b>Total:</b> {totalDocs} | <b>Submitted:</b> {submittedDocs} |{" "}
// // // // // //             <b className="text-red-600">Pending:</b> {pendingDocs}
// // // // // //           </p>
// // // // // //           <Progress
// // // // // //             percent={progressPercent}
// // // // // //             showInfo={false}
// // // // // //             strokeColor={GREEN}
// // // // // //           />
// // // // // //         </Card>

// // // // // //         <Table columns={columns} dataSource={docs} pagination={false} />

// // // // // //         {/* Comments */}
// // // // // //         <Row gutter={16} className="mt-4">
// // // // // //           <Col span={12}>
// // // // // //             <Card title="Checker Comment">
// // // // // //               <Input.TextArea
// // // // // //                 rows={3}
// // // // // //                 value={checkerComment}
// // // // // //                 onChange={(e) => setCheckerComment(e.target.value)}
// // // // // //                 placeholder="Add your comment..."
// // // // // //               />
// // // // // //               <Button className="mt-2" type="primary" onClick={postComment}>
// // // // // //                 Post Comment
// // // // // //               </Button>
// // // // // //             </Card>
// // // // // //           </Col>
// // // // // //           <Col span={12}>
// // // // // //             <Card title="Comment Thread" className="max-h-40 overflow-y-auto">
// // // // // //               {commentThread.map((c, idx) => (
// // // // // //                 <p key={idx}>
// // // // // //                   <b>{c.user}:</b> {c.comment}{" "}
// // // // // //                   <i className="text-xs">{c.time}</i>
// // // // // //                 </p>
// // // // // //               ))}
// // // // // //             </Card>
// // // // // //           </Col>
// // // // // //         </Row>

// // // // // //         {/* Bottom Buttons */}
// // // // // //         <div className="mt-6 flex justify-between items-center">
// // // // // //           <Space>
// // // // // //             <Button icon={<UploadOutlined />}>Upload Documents</Button>
// // // // // //             <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
// // // // // //               Download Checklist
// // // // // //             </Button>
// // // // // //           </Space>

// // // // // //           <Space>
// // // // // //             <Button
// // // // // //               danger
// // // // // //               onClick={() => setConfirmAction("co_creator_review")}
// // // // // //             >
// // // // // //               Return to Creator
// // // // // //             </Button>
// // // // // //             <Button
// // // // // //               type="primary"
// // // // // //               icon={<CheckCircleOutlined />}
// // // // // //               disabled={!allApproved || hasPending}
// // // // // //               onClick={() => setConfirmAction("approve")}
// // // // // //             >
// // // // // //               Approve
// // // // // //             </Button>
// // // // // //           </Space>
// // // // // //         </div>

// // // // // //         {/* Custom Confirmation Card */}
// // // // // //         {confirmAction && (
// // // // // //           <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
// // // // // //             <div className="bg-white dark:bg-gray-700 p-6 rounded-lg w-96 shadow-lg text-center">
// // // // // //               <h3 className="text-lg font-bold mb-4">
// // // // // //                 {confirmAction === "approve"
// // // // // //                   ? "Approve Checklist?"
// // // // // //                   : "Return to Creator?"}
// // // // // //               </h3>
// // // // // //               <p className="mb-6">
// // // // // //                 {confirmAction === "approve"
// // // // // //                   ? "This action is final."
// // // // // //                   : "This will send the checklist back to the creator."}
// // // // // //               </p>
// // // // // //               <div className="flex justify-center gap-4">
// // // // // //                 <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
// // // // // //                 <Button
// // // // // //                   type="primary"
// // // // // //                   loading={loading}
// // // // // //                   onClick={() => submitCheckerAction(confirmAction)}
// // // // // //                 >
// // // // // //                   Confirm
// // // // // //                 </Button>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {/* Comment trail */}
// // // // // //         <CommentTrail comments={comments} isLoading={commentsLoading} />
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default CheckerReviewChecklistModal;
// // // // // import React, { useState, useEffect, useMemo } from "react";
// // // // // import {
// // // // //   Button,
// // // // //   Table,
// // // // //   Tag,
// // // // //   Input,
// // // // //   Card,
// // // // //   Row,
// // // // //   Col,
// // // // //   Progress,
// // // // //   Space,
// // // // //   List,
// // // // //   Avatar,
// // // // //   Spin,
// // // // // } from "antd";
// // // // // import {
// // // // //   CheckCircleOutlined,
// // // // //   EyeOutlined,
// // // // //   UploadOutlined,
// // // // //   DownloadOutlined,
// // // // //   UserOutlined,
// // // // // } from "@ant-design/icons";
// // // // // import jsPDF from "jspdf";
// // // // // import autoTable from "jspdf-autotable";
// // // // // import {
// // // // //   useUpdateCheckerStatusMutation,
// // // // //   useGetChecklistCommentsQuery,
// // // // // } from "../../api/checklistApi";

// // // // // const GREEN = "#52c41a";
// // // // // const RED = "red";

// // // // // // Role Tag
// // // // // const getRoleTag = (role) => {
// // // // //   const roleLower = role?.toLowerCase() || "system";
// // // // //   let color = "blue";
// // // // //   switch (roleLower) {
// // // // //     case "rm":
// // // // //       color = "purple";
// // // // //       break;
// // // // //     case "creator":
// // // // //       color = "green";
// // // // //       break;
// // // // //     case "co_checker":
// // // // //       color = "volcano";
// // // // //       break;
// // // // //     case "system":
// // // // //       color = "default";
// // // // //       break;
// // // // //     default:
// // // // //       color = "blue";
// // // // //   }
// // // // //   return (
// // // // //     <Tag color={color} className="ml-2 uppercase">
// // // // //       {roleLower.replace(/_/g, " ")}
// // // // //     </Tag>
// // // // //   );
// // // // // };

// // // // // // Comment Trail
// // // // // const CommentTrail = ({ comments, isLoading }) => {
// // // // //   if (isLoading) return <Spin className="block m-5" />;
// // // // //   if (!comments || comments.length === 0)
// // // // //     return <i className="pl-4">No historical comments yet.</i>;

// // // // //   return (
// // // // //     <div className="max-h-52 overflow-y-auto">
// // // // //       <List
// // // // //         dataSource={comments}
// // // // //         itemLayout="horizontal"
// // // // //         renderItem={(item) => (
// // // // //           <List.Item>
// // // // //             <List.Item.Meta
// // // // //               avatar={<Avatar icon={<UserOutlined />} />}
// // // // //               title={
// // // // //                 <div className="flex justify-between">
// // // // //                   <div>
// // // // //                     <b>{item.userId?.name || "System"}</b>
// // // // //                     {getRoleTag(item.userId?.role || "system")}
// // // // //                   </div>
// // // // //                   <span className="text-xs text-gray-500">
// // // // //                     {new Date(
// // // // //                       item.createdAt || item.timestamp
// // // // //                     ).toLocaleString()}
// // // // //                   </span>
// // // // //                 </div>
// // // // //               }
// // // // //               description={<div className="break-words">{item.message}</div>}
// // // // //             />
// // // // //           </List.Item>
// // // // //         )}
// // // // //       />
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // // Main Modal
// // // // // const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
// // // // //   const [docs, setDocs] = useState([]);
// // // // //   const [checkerComment, setCheckerComment] = useState("");
// // // // //   const [commentThread, setCommentThread] = useState([]);
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [confirmAction, setConfirmAction] = useState(null); // "approved" or "co_creator_review"

// // // // //   const [submitCheckerStatus] = useUpdateCheckerStatusMutation();
// // // // //   const { data: comments, isLoading: commentsLoading } =
// // // // //     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

// // // // //   // Flatten docs
// // // // //   useEffect(() => {
// // // // //     if (!checklist?.documents) return;
// // // // //     const flatDocs = checklist.documents.reduce((acc, item) => {
// // // // //       if (item.docList?.length) {
// // // // //         const nested = item.docList.map((doc) => ({
// // // // //           ...doc,
// // // // //           category: item.category,
// // // // //         }));
// // // // //         return acc.concat(nested);
// // // // //       }
// // // // //       if (item.category) return acc.concat(item);
// // // // //       return acc;
// // // // //     }, []);

// // // // //     setDocs(
// // // // //       flatDocs.map((doc, idx) => ({
// // // // //         ...doc,
// // // // //         key: doc._id || `doc-${idx}`,
// // // // //         status: doc.status || "pending",
// // // // //         approved: doc.approved || false,
// // // // //         checkerStatus:
// // // // //           doc.checkerStatus || (doc.approved ? "approved" : "pending"),
// // // // //         comment: doc.comment || "",
// // // // //         fileUrl: doc.fileUrl || null,
// // // // //       }))
// // // // //     );
// // // // //   }, [checklist]);

// // // // //   const {
// // // // //     totalDocs,
// // // // //     submittedDocs,
// // // // //     pendingDocs,
// // // // //     allApproved,
// // // // //     hasPending,
// // // // //     progressPercent,
// // // // //   } = useMemo(() => {
// // // // //     const total = docs.length;
// // // // //     const submitted = docs.filter((d) => d.status === "submitted").length;
// // // // //     const pending = docs.filter((d) => d.status === "pending").length;
// // // // //     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);
// // // // //     const isStillPendingRm = docs.some((d) => d.status === "pending");
// // // // //     return {
// // // // //       totalDocs: total,
// // // // //       submittedDocs: submitted,
// // // // //       pendingDocs: pending,
// // // // //       allApproved: checkerApprovedAll,
// // // // //       hasPending: isStillPendingRm,
// // // // //       progressPercent: total ? (submitted / total) * 100 : 0,
// // // // //     };
// // // // //   }, [docs]);

// // // // //   const handleDocApprove = (index) => {
// // // // //     setDocs((prev) => {
// // // // //       const updated = [...prev];
// // // // //       updated[index].approved = true;
// // // // //       updated[index].checkerStatus = "approved";
// // // // //       return updated;
// // // // //     });
// // // // //   };

// // // // //   const handleDocReject = (index) => {
// // // // //     setDocs((prev) => {
// // // // //       const updated = [...prev];
// // // // //       updated[index].approved = false;
// // // // //       updated[index].checkerStatus = "rejected";
// // // // //       return updated;
// // // // //     });
// // // // //   };

// // // // //   // ✅ Correct payload for backend
// // // // //   const submitCheckerAction = async (action) => {
// // // // //     if (!checklist?._id) return alert("Checklist ID missing");
// // // // //     setLoading(true);
// // // // //     try {
// // // // //       await submitCheckerStatus({ id: checklist._id, action }).unwrap(); // id + action
// // // // //       setConfirmAction(null);
// // // // //       onClose();
// // // // //     } catch (err) {
// // // // //       console.error(err);
// // // // //       alert(err?.data?.message || "Failed");
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   const postComment = () => {
// // // // //     if (!checkerComment.trim()) return;
// // // // //     setCommentThread((prev) => [
// // // // //       {
// // // // //         user: "Checker",
// // // // //         comment: checkerComment,
// // // // //         time: new Date().toLocaleString(),
// // // // //       },
// // // // //       ...prev,
// // // // //     ]);
// // // // //     setCheckerComment("");
// // // // //   };

// // // // //   const renderStatusTag = (status) => <Tag>{status.replace(/_/g, " ")}</Tag>;

// // // // //   const downloadPDF = () => {
// // // // //     const doc = new jsPDF();
// // // // //     doc.setFontSize(16);
// // // // //     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
// // // // //     const tableColumns = ["Category", "Document Name", "Status", "Co Comment"];
// // // // //     const tableRows = docs.map((d) => [
// // // // //       d.category,
// // // // //       d.name,
// // // // //       d.status === "submitted" ? "Submitted" : "Pending",
// // // // //       d.comment || "",
// // // // //     ]);
// // // // //     autoTable(doc, { head: [tableColumns], body: tableRows, startY: 60 });
// // // // //     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
// // // // //   };

// // // // //   const columns = [
// // // // //     { title: "Category", dataIndex: "category" },
// // // // //     { title: "Document Name", dataIndex: "name" },
// // // // //     {
// // // // //       title: "Co Status",
// // // // //       render: (_, record) =>
// // // // //         record.status === "pending" ? (
// // // // //           <Tag color={RED}>Pending</Tag>
// // // // //         ) : (
// // // // //           <Tag color={GREEN}>Submitted</Tag>
// // // // //         ),
// // // // //     },
// // // // //     { title: "Co Comment", dataIndex: "comment" },
// // // // //     {
// // // // //       title: "Checker Status",
// // // // //       dataIndex: "checkerStatus",
// // // // //       render: (status) => renderStatusTag(status),
// // // // //     },
// // // // //     {
// // // // //       title: "Action",
// // // // //       render: (_, record, index) => (
// // // // //         <Space>
// // // // //           <Button
// // // // //             size="small"
// // // // //             type="primary"
// // // // //             onClick={() => handleDocApprove(index)}
// // // // //           >
// // // // //             Approve
// // // // //           </Button>
// // // // //           <Button size="small" danger onClick={() => handleDocReject(index)}>
// // // // //             Reject
// // // // //           </Button>
// // // // //           {record.fileUrl && (
// // // // //             <Button
// // // // //               size="small"
// // // // //               icon={<EyeOutlined />}
// // // // //               onClick={() => window.open(record.fileUrl, "_blank")}
// // // // //             >
// // // // //               View
// // // // //             </Button>
// // // // //           )}
// // // // //         </Space>
// // // // //       ),
// // // // //     },
// // // // //   ];

// // // // //   return (
// // // // //     <div
// // // // //       className={`fixed inset-0 z-50 overflow-auto bg-black/40 flex justify-center items-start pt-10 ${
// // // // //         open ? "" : "hidden"
// // // // //       }`}
// // // // //     >
// // // // //       <div className="bg-white dark:bg-gray-800 w-[95%] max-w-6xl p-6 rounded-lg shadow-lg relative">
// // // // //         {/* Checklist Info */}
// // // // //         <Card className="mb-4">
// // // // //           <Row gutter={16}>
// // // // //             <Col span={8}>
// // // // //               <p>
// // // // //                 <b>DCL No:</b>{" "}
// // // // //                 <span className="text-purple-700">{checklist?.dclNo}</span>
// // // // //               </p>
// // // // //               <p>
// // // // //                 <b>Loan Type:</b> {checklist?.loanType}
// // // // //               </p>
// // // // //             </Col>
// // // // //             <Col span={8}>
// // // // //               <p>
// // // // //                 <b>Created By:</b> {checklist?.createdBy?.name}
// // // // //               </p>
// // // // //               <p>
// // // // //                 <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
// // // // //               </p>
// // // // //             </Col>
// // // // //             <Col span={8}>
// // // // //               <p>
// // // // //                 <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
// // // // //               </p>
// // // // //               <p>
// // // // //                 <b>Created At:</b> {checklist?.createdAt}
// // // // //               </p>
// // // // //             </Col>
// // // // //           </Row>
// // // // //         </Card>

// // // // //         {/* Progress */}
// // // // //         <Card className="mb-4">
// // // // //           <p>
// // // // //             <b>Total:</b> {totalDocs} | <b>Submitted:</b> {submittedDocs} |{" "}
// // // // //             <b className="text-red-600">Pending:</b> {pendingDocs}
// // // // //           </p>
// // // // //           <Progress
// // // // //             percent={progressPercent}
// // // // //             showInfo={false}
// // // // //             strokeColor={GREEN}
// // // // //           />
// // // // //         </Card>

// // // // //         <Table columns={columns} dataSource={docs} pagination={false} />

// // // // //         {/* Comments */}
// // // // //         <Row gutter={16} className="mt-4">
// // // // //           <Col span={12}>
// // // // //             <Card title="Checker Comment">
// // // // //               <Input.TextArea
// // // // //                 rows={3}
// // // // //                 value={checkerComment}
// // // // //                 onChange={(e) => setCheckerComment(e.target.value)}
// // // // //                 placeholder="Add your comment..."
// // // // //               />
// // // // //               <Button className="mt-2" type="primary" onClick={postComment}>
// // // // //                 Post Comment
// // // // //               </Button>
// // // // //             </Card>
// // // // //           </Col>
// // // // //           <Col span={12}>
// // // // //             <Card title="Comment Thread" className="max-h-40 overflow-y-auto">
// // // // //               {commentThread.map((c, idx) => (
// // // // //                 <p key={idx}>
// // // // //                   <b>{c.user}:</b> {c.comment}{" "}
// // // // //                   <i className="text-xs">{c.time}</i>
// // // // //                 </p>
// // // // //               ))}
// // // // //             </Card>
// // // // //           </Col>
// // // // //         </Row>

// // // // //         {/* Comment trail */}
// // // // //         <CommentTrail comments={comments} isLoading={commentsLoading} />

// // // // //         {/* Bottom Buttons */}
// // // // //         <div className="mt-6 flex justify-between items-center">
// // // // //           <Space>
// // // // //             <Button icon={<UploadOutlined />}>Upload Documents</Button>
// // // // //             <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
// // // // //               Download Checklist
// // // // //             </Button>
// // // // //           </Space>

// // // // //           <Space>
// // // // //             <Button
// // // // //               danger
// // // // //               onClick={() => setConfirmAction("co_creator_review")}
// // // // //             >
// // // // //               Return to Creator
// // // // //             </Button>
// // // // //             <Button
// // // // //               type="primary"
// // // // //               icon={<CheckCircleOutlined />}
// // // // //               disabled={!allApproved || hasPending}
// // // // //               onClick={() => setConfirmAction("approved")}
// // // // //             >
// // // // //               Approve
// // // // //             </Button>
// // // // //           </Space>
// // // // //         </div>

// // // // //         {/* Custom Confirmation Card */}
// // // // //         {confirmAction && (
// // // // //           <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
// // // // //             <div className="bg-white dark:bg-gray-700 p-6 rounded-lg w-96 shadow-lg text-center">
// // // // //               <h3 className="text-lg font-bold mb-4">
// // // // //                 {confirmAction === "approved"
// // // // //                   ? "Approve Checklist?"
// // // // //                   : "Return to Creator?"}
// // // // //               </h3>
// // // // //               <p className="mb-6">
// // // // //                 {confirmAction === "approved"
// // // // //                   ? "This action is final."
// // // // //                   : "This will send the checklist back to the creator."}
// // // // //               </p>
// // // // //               <div className="flex justify-center gap-4">
// // // // //                 <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
// // // // //                 <Button
// // // // //                   type="primary"
// // // // //                   loading={loading}
// // // // //                   onClick={() => submitCheckerAction(confirmAction)}
// // // // //                 >
// // // // //                   Confirm
// // // // //                 </Button>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         )}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default CheckerReviewChecklistModal;
// // // // import React, { useState, useEffect, useMemo } from "react";
// // // // import {
// // // //   Button,
// // // //   Table,
// // // //   Tag,
// // // //   Input,
// // // //   Card,
// // // //   Row,
// // // //   Col,
// // // //   Progress,
// // // //   Space,
// // // //   List,
// // // //   Avatar,
// // // //   Spin,
// // // // } from "antd";
// // // // import {
// // // //   CheckCircleOutlined,
// // // //   EyeOutlined,
// // // //   UploadOutlined,
// // // //   DownloadOutlined,
// // // //   UserOutlined,
// // // // } from "@ant-design/icons";
// // // // import jsPDF from "jspdf";
// // // // import autoTable from "jspdf-autotable";
// // // // import {
// // // //   useUpdateCheckerStatusMutation,
// // // //   useGetChecklistCommentsQuery,
// // // // } from "../../api/checklistApi";

// // // // const GREEN = "#52c41a";
// // // // const RED = "red";

// // // // const getRoleTag = (role) => {
// // // //   const roleLower = role?.toLowerCase() || "system";
// // // //   let color = "blue";
// // // //   switch (roleLower) {
// // // //     case "rm":
// // // //       color = "purple";
// // // //       break;
// // // //     case "creator":
// // // //       color = "green";
// // // //       break;
// // // //     case "co_checker":
// // // //       color = "volcano";
// // // //       break;
// // // //     case "system":
// // // //       color = "default";
// // // //       break;
// // // //     default:
// // // //       color = "blue";
// // // //   }
// // // //   return (
// // // //     <Tag color={color} className="ml-2 uppercase">
// // // //       {roleLower.replace(/_/g, " ")}
// // // //     </Tag>
// // // //   );
// // // // };

// // // // const CommentTrail = ({ comments, isLoading }) => {
// // // //   if (isLoading) return <Spin className="block m-5" />;
// // // //   if (!comments || comments.length === 0)
// // // //     return <i className="pl-4">No historical comments yet.</i>;

// // // //   return (
// // // //     <div className="max-h-52 overflow-y-auto">
// // // //       <List
// // // //         dataSource={comments}
// // // //         itemLayout="horizontal"
// // // //         renderItem={(item) => (
// // // //           <List.Item>
// // // //             <List.Item.Meta
// // // //               avatar={<Avatar icon={<UserOutlined />} />}
// // // //               title={
// // // //                 <div className="flex justify-between">
// // // //                   <div>
// // // //                     <b>{item.userId?.name || "System"}</b>
// // // //                     {getRoleTag(item.userId?.role || "system")}
// // // //                   </div>
// // // //                   <span className="text-xs text-gray-500">
// // // //                     {new Date(
// // // //                       item.createdAt || item.timestamp
// // // //                     ).toLocaleString()}
// // // //                   </span>
// // // //                 </div>
// // // //               }
// // // //               description={<div className="break-words">{item.message}</div>}
// // // //             />
// // // //           </List.Item>
// // // //         )}
// // // //       />
// // // //     </div>
// // // //   );
// // // // };

// // // // const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
// // // //   const [docs, setDocs] = useState([]);
// // // //   const [checkerComment, setCheckerComment] = useState("");
// // // //   const [commentThread, setCommentThread] = useState([]);
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [confirmAction, setConfirmAction] = useState(null);

// // // //   const [submitCheckerStatus] = useUpdateCheckerStatusMutation();
// // // //   const { data: comments, isLoading: commentsLoading } =
// // // //     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

// // // //   // Flatten documents
// // // //   useEffect(() => {
// // // //     if (!checklist?.documents) return;
// // // //     const flatDocs = checklist.documents.reduce((acc, item) => {
// // // //       if (item.docList?.length) {
// // // //         const nested = item.docList.map((doc) => ({
// // // //           ...doc,
// // // //           category: item.category,
// // // //         }));
// // // //         return acc.concat(nested);
// // // //       }
// // // //       if (item.category) return acc.concat(item);
// // // //       return acc;
// // // //     }, []);

// // // //     setDocs(
// // // //       flatDocs.map((doc, idx) => ({
// // // //         ...doc,
// // // //         key: doc._id || `doc-${idx}`,
// // // //         status: doc.status || "pending",
// // // //         approved: doc.approved || false,
// // // //         checkerStatus:
// // // //           doc.checkerStatus || (doc.approved ? "approved" : "pending"),
// // // //         comment: doc.comment || "",
// // // //         fileUrl: doc.fileUrl || null,
// // // //       }))
// // // //     );
// // // //   }, [checklist]);

// // // //   const {
// // // //     totalDocs,
// // // //     submittedDocs,
// // // //     pendingDocs,
// // // //     allApproved,
// // // //     hasPending,
// // // //     progressPercent,
// // // //   } = useMemo(() => {
// // // //     const total = docs.length;
// // // //     const submitted = docs.filter((d) => d.status === "submitted").length;
// // // //     const pending = docs.filter((d) => d.status === "pending").length;
// // // //     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);
// // // //     const isStillPendingRm = docs.some((d) => d.status === "pending");
// // // //     return {
// // // //       totalDocs: total,
// // // //       submittedDocs: submitted,
// // // //       pendingDocs: pending,
// // // //       allApproved: checkerApprovedAll,
// // // //       hasPending: isStillPendingRm,
// // // //       progressPercent: total ? (submitted / total) * 100 : 0,
// // // //     };
// // // //   }, [docs]);

// // // //   const handleDocApprove = (index) => {
// // // //     setDocs((prev) => {
// // // //       const updated = [...prev];
// // // //       updated[index].approved = true;
// // // //       updated[index].checkerStatus = "approved";
// // // //       return updated;
// // // //     });
// // // //   };

// // // //   const handleDocReject = (index) => {
// // // //     setDocs((prev) => {
// // // //       const updated = [...prev];
// // // //       updated[index].approved = false;
// // // //       updated[index].checkerStatus = "rejected";
// // // //       return updated;
// // // //     });
// // // //   };

// // // //   const submitCheckerAction = async (action) => {
// // // //     if (!checklist?._id) return alert("Checklist ID missing");
// // // //     setLoading(true);
// // // //     try {
// // // //       await submitCheckerStatus({ id: checklist._id, action }).unwrap();
// // // //       setConfirmAction(null);
// // // //       onClose(); // ✅ Close modal after action
// // // //     } catch (err) {
// // // //       console.error(err);
// // // //       alert(err?.data?.message || "Failed");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const postComment = () => {
// // // //     if (!checkerComment.trim()) return;
// // // //     setCommentThread((prev) => [
// // // //       {
// // // //         user: "Checker",
// // // //         comment: checkerComment,
// // // //         time: new Date().toLocaleString(),
// // // //       },
// // // //       ...prev,
// // // //     ]);
// // // //     setCheckerComment("");
// // // //   };

// // // //   const renderStatusTag = (status) => <Tag>{status.replace(/_/g, " ")}</Tag>;

// // // //   const downloadPDF = () => {
// // // //     const doc = new jsPDF();
// // // //     doc.setFontSize(16);
// // // //     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
// // // //     const tableColumns = ["Category", "Document Name", "Status", "Co Comment"];
// // // //     const tableRows = docs.map((d) => [
// // // //       d.category,
// // // //       d.name,
// // // //       d.status === "submitted" ? "Submitted" : "Pending",
// // // //       d.comment || "",
// // // //     ]);
// // // //     autoTable(doc, { head: [tableColumns], body: tableRows, startY: 60 });
// // // //     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
// // // //   };

// // // //   const columns = [
// // // //     { title: "Category", dataIndex: "category" },
// // // //     { title: "Document Name", dataIndex: "name" },
// // // //     {
// // // //       title: "Co Status",
// // // //       render: (_, record) =>
// // // //         record.status === "pending" ? (
// // // //           <Tag color={RED}>Pending</Tag>
// // // //         ) : (
// // // //           <Tag color={GREEN}>Submitted</Tag>
// // // //         ),
// // // //     },
// // // //     { title: "Co Comment", dataIndex: "comment" },
// // // //     {
// // // //       title: "Checker Status",
// // // //       dataIndex: "checkerStatus",
// // // //       render: (status) => renderStatusTag(status),
// // // //     },
// // // //     {
// // // //       title: "Action",
// // // //       render: (_, record, index) => (
// // // //         <Space>
// // // //           <Button
// // // //             size="small"
// // // //             type="primary"
// // // //             onClick={() => handleDocApprove(index)}
// // // //             disabled={checklist?.status !== "pending"}
// // // //           >
// // // //             Approve
// // // //           </Button>
// // // //           <Button
// // // //             size="small"
// // // //             danger
// // // //             onClick={() => handleDocReject(index)}
// // // //             disabled={checklist?.status !== "pending"}
// // // //           >
// // // //             Reject
// // // //           </Button>
// // // //           {record.fileUrl && (
// // // //             <Button
// // // //               size="small"
// // // //               icon={<EyeOutlined />}
// // // //               onClick={() => window.open(record.fileUrl, "_blank")}
// // // //             >
// // // //               View
// // // //             </Button>
// // // //           )}
// // // //         </Space>
// // // //       ),
// // // //     },
// // // //   ];

// // // //   // Disable entire modal if checklist is already approved or returned
// // // //   const isDisabled = checklist?.status !== "pending";

// // // //   return (
// // // //     <div
// // // //       className={`fixed inset-0 z-50 overflow-auto bg-black/40 flex justify-center items-start pt-10 ${
// // // //         open ? "" : "hidden"
// // // //       }`}
// // // //     >
// // // //       <div
// // // //         className={`bg-white dark:bg-gray-800 w-[95%] max-w-6xl p-6 rounded-lg shadow-lg relative ${
// // // //           isDisabled ? "opacity-60 pointer-events-none" : ""
// // // //         }`}
// // // //       >
// // // //         {/* Checklist Info */}
// // // //         <Card className="mb-4">
// // // //           <Row gutter={16}>
// // // //             <Col span={8}>
// // // //               <p>
// // // //                 <b>DCL No:</b>{" "}
// // // //                 <span className="text-purple-700">{checklist?.dclNo}</span>
// // // //               </p>
// // // //               <p>
// // // //                 <b>Loan Type:</b> {checklist?.loanType}
// // // //               </p>
// // // //             </Col>
// // // //             <Col span={8}>
// // // //               <p>
// // // //                 <b>Created By:</b> {checklist?.createdBy?.name}
// // // //               </p>
// // // //               <p>
// // // //                 <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
// // // //               </p>
// // // //             </Col>
// // // //             <Col span={8}>
// // // //               <p>
// // // //                 <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
// // // //               </p>
// // // //               <p>
// // // //                 <b>Created At:</b> {checklist?.createdAt}
// // // //               </p>
// // // //             </Col>
// // // //           </Row>
// // // //         </Card>

// // // //         {/* Progress */}
// // // //         <Card className="mb-4">
// // // //           <p>
// // // //             <b>Total:</b> {totalDocs} | <b>Submitted:</b> {submittedDocs} |{" "}
// // // //             <b className="text-red-600">Pending:</b> {pendingDocs}
// // // //           </p>
// // // //           <Progress
// // // //             percent={progressPercent}
// // // //             showInfo={false}
// // // //             strokeColor={GREEN}
// // // //           />
// // // //         </Card>

// // // //         <Table columns={columns} dataSource={docs} pagination={false} />

// // // //         {/* Comments */}
// // // //         <Row gutter={16} className="mt-4">
// // // //           <Col span={12}>
// // // //             <Card title="Checker Comment">
// // // //               <Input.TextArea
// // // //                 rows={3}
// // // //                 value={checkerComment}
// // // //                 onChange={(e) => setCheckerComment(e.target.value)}
// // // //                 placeholder="Add your comment..."
// // // //                 disabled={isDisabled}
// // // //               />
// // // //               <Button
// // // //                 className="mt-2"
// // // //                 type="primary"
// // // //                 onClick={postComment}
// // // //                 disabled={isDisabled}
// // // //               >
// // // //                 Post Comment
// // // //               </Button>
// // // //             </Card>
// // // //           </Col>
// // // //           <Col span={12}>
// // // //             <Card title="Comment Thread" className="max-h-40 overflow-y-auto">
// // // //               {commentThread.map((c, idx) => (
// // // //                 <p key={idx}>
// // // //                   <b>{c.user}:</b> {c.comment}{" "}
// // // //                   <i className="text-xs">{c.time}</i>
// // // //                 </p>
// // // //               ))}
// // // //             </Card>
// // // //           </Col>
// // // //         </Row>

// // // //         {/* Bottom Buttons */}
// // // //         <div className="mt-6 flex justify-between items-center">
// // // //           <Space>
// // // //             <Button icon={<UploadOutlined />} disabled={isDisabled}>
// // // //               Upload Documents
// // // //             </Button>
// // // //             <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
// // // //               Download Checklist
// // // //             </Button>
// // // //           </Space>

// // // //           <Space>
// // // //             <Button
// // // //               danger
// // // //               onClick={() => setConfirmAction("co_creator_review")}
// // // //               disabled={isDisabled}
// // // //             >
// // // //               Return to Creator
// // // //             </Button>
// // // //             <Button
// // // //               type="primary"
// // // //               icon={<CheckCircleOutlined />}
// // // //               disabled={!allApproved || hasPending || isDisabled}
// // // //               onClick={() => setConfirmAction("approved")}
// // // //             >
// // // //               Approve
// // // //             </Button>
// // // //           </Space>
// // // //         </div>

// // // //         {/* Custom Confirmation Card */}
// // // //         {confirmAction && (
// // // //           <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
// // // //             <div className="bg-white dark:bg-gray-700 p-6 rounded-lg w-96 shadow-lg text-center">
// // // //               <h3 className="text-lg font-bold mb-4">
// // // //                 {confirmAction === "approved"
// // // //                   ? "Approve Checklist?"
// // // //                   : "Return to Creator?"}
// // // //               </h3>
// // // //               <p className="mb-6">
// // // //                 {confirmAction === "approved"
// // // //                   ? "This action is final."
// // // //                   : "This will send the checklist back to the creator."}
// // // //               </p>
// // // //               <div className="flex justify-center gap-4">
// // // //                 <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
// // // //                 <Button
// // // //                   type="primary"
// // // //                   loading={loading}
// // // //                   onClick={() => submitCheckerAction(confirmAction)}
// // // //                 >
// // // //                   Confirm
// // // //                 </Button>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         )}

// // // //         {/* Comment trail */}
// // // //         <CommentTrail comments={comments} isLoading={commentsLoading} />
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default CheckerReviewChecklistModal;
// // // import React, { useState, useEffect, useMemo } from "react";
// // // import {
// // //   Button,
// // //   Table,
// // //   Tag,
// // //   Input,
// // //   Card,
// // //   Row,
// // //   Col,
// // //   Progress,
// // //   Space,
// // //   List,
// // //   Avatar,
// // //   Spin,
// // // } from "antd";
// // // import {
// // //   CheckCircleOutlined,
// // //   EyeOutlined,
// // //   UploadOutlined,
// // //   DownloadOutlined,
// // //   UserOutlined,
// // // } from "@ant-design/icons";
// // // import jsPDF from "jspdf";
// // // import autoTable from "jspdf-autotable";
// // // import {
// // //   useUpdateCheckerStatusMutation,
// // //   useGetChecklistCommentsQuery,
// // // } from "../../api/checklistApi";

// // // const GREEN = "#52c41a";
// // // const RED = "red";

// // // const getRoleTag = (role) => {
// // //   const roleLower = role?.toLowerCase() || "system";
// // //   let color = "blue";
// // //   switch (roleLower) {
// // //     case "rm":
// // //       color = "purple";
// // //       break;
// // //     case "creator":
// // //       color = "green";
// // //       break;
// // //     case "co_checker":
// // //       color = "volcano";
// // //       break;
// // //     case "system":
// // //       color = "default";
// // //       break;
// // //     default:
// // //       color = "blue";
// // //   }
// // //   return (
// // //     <Tag color={color} className="ml-2 uppercase">
// // //       {roleLower.replace(/_/g, " ")}
// // //     </Tag>
// // //   );
// // // };

// // // const CommentTrail = ({ comments, isLoading }) => {
// // //   if (isLoading) return <Spin className="block m-5" />;
// // //   if (!comments || comments.length === 0)
// // //     return <i className="pl-4">No historical comments yet.</i>;

// // //   return (
// // //     <div className="max-h-52 overflow-y-auto">
// // //       <List
// // //         dataSource={comments}
// // //         itemLayout="horizontal"
// // //         renderItem={(item) => (
// // //           <List.Item>
// // //             <List.Item.Meta
// // //               avatar={<Avatar icon={<UserOutlined />} />}
// // //               title={
// // //                 <div className="flex justify-between">
// // //                   <div>
// // //                     <b>{item.userId?.name || "System"}</b>
// // //                     {getRoleTag(item.userId?.role || "system")}
// // //                   </div>
// // //                   <span className="text-xs text-gray-500">
// // //                     {new Date(
// // //                       item.createdAt || item.timestamp
// // //                     ).toLocaleString()}
// // //                   </span>
// // //                 </div>
// // //               }
// // //               description={<div className="break-words">{item.message}</div>}
// // //             />
// // //           </List.Item>
// // //         )}
// // //       />
// // //     </div>
// // //   );
// // // };

// // // const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
// // //   const [docs, setDocs] = useState([]);
// // //   const [checkerComment, setCheckerComment] = useState("");
// // //   const [commentThread, setCommentThread] = useState([]);
// // //   const [loading, setLoading] = useState(false);
// // //   const [confirmAction, setConfirmAction] = useState(null);

// // //   const [submitCheckerStatus] = useUpdateCheckerStatusMutation();
// // //   const { data: comments, isLoading: commentsLoading } =
// // //     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

// // //   useEffect(() => {
// // //     if (!checklist?.documents) return;
// // //     const flatDocs = checklist.documents.reduce((acc, item) => {
// // //       if (item.docList?.length) {
// // //         const nested = item.docList.map((doc) => ({
// // //           ...doc,
// // //           category: item.category,
// // //         }));
// // //         return acc.concat(nested);
// // //       }
// // //       if (item.category) return acc.concat(item);
// // //       return acc;
// // //     }, []);

// // //     setDocs(
// // //       flatDocs.map((doc, idx) => ({
// // //         ...doc,
// // //         key: doc._id || `doc-${idx}`,
// // //         status: doc.status || "pending",
// // //         approved: doc.approved || false,
// // //         checkerStatus:
// // //           doc.checkerStatus || (doc.approved ? "approved" : "pending"),
// // //         comment: doc.comment || "",
// // //         fileUrl: doc.fileUrl || null,
// // //       }))
// // //     );
// // //   }, [checklist]);

// // //   const {
// // //     totalDocs,
// // //     submittedDocs,
// // //     pendingDocs,
// // //     allApproved,
// // //     hasPending,
// // //     progressPercent,
// // //   } = useMemo(() => {
// // //     const total = docs.length;
// // //     const submitted = docs.filter((d) => d.status === "submitted").length;
// // //     const pending = docs.filter((d) => d.status === "pending").length;
// // //     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);
// // //     const isStillPendingRm = docs.some((d) => d.status === "pending");
// // //     return {
// // //       totalDocs: total,
// // //       submittedDocs: submitted,
// // //       pendingDocs: pending,
// // //       allApproved: checkerApprovedAll,
// // //       hasPending: isStillPendingRm,
// // //       progressPercent: total ? (submitted / total) * 100 : 0,
// // //     };
// // //   }, [docs]);

// // //   const handleDocApprove = (index) => {
// // //     setDocs((prev) => {
// // //       const updated = [...prev];
// // //       updated[index].approved = true;
// // //       updated[index].checkerStatus = "approved";
// // //       return updated;
// // //     });
// // //   };

// // //   const handleDocReject = (index) => {
// // //     setDocs((prev) => {
// // //       const updated = [...prev];
// // //       updated[index].approved = false;
// // //       updated[index].checkerStatus = "rejected";
// // //       return updated;
// // //     });
// // //   };

// // //   const submitCheckerAction = async (action) => {
// // //     if (!checklist?._id) return alert("Checklist ID missing");
// // //     setLoading(true);
// // //     try {
// // //       await submitCheckerStatus({ id: checklist._id, action }).unwrap();
// // //       setConfirmAction(null);
// // //       onClose(); // close modal after action
// // //     } catch (err) {
// // //       console.error(err);
// // //       alert(err?.data?.message || "Failed");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const postComment = () => {
// // //     if (!checkerComment.trim()) return;
// // //     setCommentThread((prev) => [
// // //       {
// // //         user: "Checker",
// // //         comment: checkerComment,
// // //         time: new Date().toLocaleString(),
// // //       },
// // //       ...prev,
// // //     ]);
// // //     setCheckerComment("");
// // //   };

// // //   const renderStatusTag = (status) => <Tag>{status.replace(/_/g, " ")}</Tag>;

// // //   const downloadPDF = () => {
// // //     const doc = new jsPDF();
// // //     doc.setFontSize(16);
// // //     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
// // //     const tableColumns = ["Category", "Document Name", "Status", "Co Comment"];
// // //     const tableRows = docs.map((d) => [
// // //       d.category,
// // //       d.name,
// // //       d.status === "submitted" ? "Submitted" : "Pending",
// // //       d.comment || "",
// // //     ]);
// // //     autoTable(doc, { head: [tableColumns], body: tableRows, startY: 60 });
// // //     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
// // //   };

// // //   const columns = [
// // //     { title: "Category", dataIndex: "category" },
// // //     { title: "Document Name", dataIndex: "name" },
// // //     {
// // //       title: "Co Status",
// // //       render: (_, record) =>
// // //         record.status === "pending" ? (
// // //           <Tag color={RED}>Pending</Tag>
// // //         ) : (
// // //           <Tag color={GREEN}>Submitted</Tag>
// // //         ),
// // //     },
// // //     { title: "Co Comment", dataIndex: "comment" },
// // //     {
// // //       title: "Checker Status",
// // //       dataIndex: "checkerStatus",
// // //       render: (status) => renderStatusTag(status),
// // //     },
// // //     {
// // //       title: "Action",
// // //       render: (_, record, index) => (
// // //         <Space>
// // //           <Button
// // //             size="small"
// // //             type="primary"
// // //             onClick={() => handleDocApprove(index)}
// // //             disabled={checklist?.status !== "pending"}
// // //           >
// // //             Approve
// // //           </Button>
// // //           <Button
// // //             size="small"
// // //             danger
// // //             onClick={() => handleDocReject(index)}
// // //             disabled={checklist?.status !== "pending"}
// // //           >
// // //             Reject
// // //           </Button>
// // //           {record.fileUrl && (
// // //             <Button
// // //               size="small"
// // //               icon={<EyeOutlined />}
// // //               onClick={() => window.open(record.fileUrl, "_blank")}
// // //             >
// // //               View
// // //             </Button>
// // //           )}
// // //         </Space>
// // //       ),
// // //     },
// // //   ];

// // //   const isDisabled = checklist?.status !== "pending"; // only disable actions

// // //   return (
// // //     <div
// // //       className={`fixed inset-0 z-50 overflow-auto bg-black/40 flex justify-center items-start pt-10 ${
// // //         open ? "" : "hidden"
// // //       }`}
// // //     >
// // //       <div className="bg-white dark:bg-gray-800 w-[95%] max-w-6xl p-6 rounded-lg shadow-lg relative">
// // //         {/* Checklist Info */}
// // //         <Card className="mb-4">
// // //           <Row gutter={16}>
// // //             <Col span={8}>
// // //               <p>
// // //                 <b>DCL No:</b>{" "}
// // //                 <span className="text-purple-700">{checklist?.dclNo}</span>
// // //               </p>
// // //               <p>
// // //                 <b>Loan Type:</b> {checklist?.loanType}
// // //               </p>
// // //             </Col>
// // //             <Col span={8}>
// // //               <p>
// // //                 <b>Created By:</b> {checklist?.createdBy?.name}
// // //               </p>
// // //               <p>
// // //                 <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
// // //               </p>
// // //             </Col>
// // //             <Col span={8}>
// // //               <p>
// // //                 <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
// // //               </p>
// // //               <p>
// // //                 <b>Created At:</b> {checklist?.createdAt}
// // //               </p>
// // //             </Col>
// // //           </Row>
// // //         </Card>

// // //         {/* Progress */}
// // //         <Card className="mb-4">
// // //           <p>
// // //             <b>Total:</b> {totalDocs} | <b>Submitted:</b> {submittedDocs} |{" "}
// // //             <b className="text-red-600">Pending:</b> {pendingDocs}
// // //           </p>
// // //           <Progress
// // //             percent={progressPercent}
// // //             showInfo={false}
// // //             strokeColor={GREEN}
// // //           />
// // //         </Card>

// // //         <Table columns={columns} dataSource={docs} pagination={false} />

// // //         {/* Comments */}
// // //         <Row gutter={16} className="mt-4">
// // //           <Col span={12}>
// // //             <Card title="Checker Comment">
// // //               <Input.TextArea
// // //                 rows={3}
// // //                 value={checkerComment}
// // //                 onChange={(e) => setCheckerComment(e.target.value)}
// // //                 placeholder="Add your comment..."
// // //                 disabled={isDisabled}
// // //               />
// // //               <Button
// // //                 className="mt-2"
// // //                 type="primary"
// // //                 onClick={postComment}
// // //                 disabled={isDisabled}
// // //               >
// // //                 Post Comment
// // //               </Button>
// // //             </Card>
// // //           </Col>
// // //           <Col span={12}>
// // //             <Card title="Comment Thread" className="max-h-40 overflow-y-auto">
// // //               {commentThread.map((c, idx) => (
// // //                 <p key={idx}>
// // //                   <b>{c.user}:</b> {c.comment}{" "}
// // //                   <i className="text-xs">{c.time}</i>
// // //                 </p>
// // //               ))}
// // //             </Card>
// // //           </Col>
// // //         </Row>

// // //         {/* Bottom Buttons */}
// // //         <div className="mt-6 flex justify-between items-center">
// // //           <Space>
// // //             <Button icon={<UploadOutlined />} disabled={isDisabled}>
// // //               Upload Documents
// // //             </Button>
// // //             <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
// // //               Download Checklist
// // //             </Button>
// // //           </Space>

// // //           <Space>
// // //             <Button
// // //               danger
// // //               onClick={() => setConfirmAction("co_creator_review")}
// // //               disabled={isDisabled}
// // //             >
// // //               Return to Creator
// // //             </Button>
// // //             <Button
// // //               type="primary"
// // //               icon={<CheckCircleOutlined />}
// // //               disabled={!allApproved || hasPending || isDisabled}
// // //               onClick={() => setConfirmAction("approved")}
// // //             >
// // //               Approve
// // //             </Button>
// // //           </Space>
// // //         </div>

// // //         {/* Custom Confirmation Card */}
// // //         {confirmAction && (
// // //           <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
// // //             <div className="bg-white dark:bg-gray-700 p-6 rounded-lg w-96 shadow-lg text-center">
// // //               <h3 className="text-lg font-bold mb-4">
// // //                 {confirmAction === "approved"
// // //                   ? "Approve Checklist?"
// // //                   : "Return to Creator?"}
// // //               </h3>
// // //               <p className="mb-6">
// // //                 {confirmAction === "approved"
// // //                   ? "This action is final."
// // //                   : "This will send the checklist back to the creator."}
// // //               </p>
// // //               <div className="flex justify-center gap-4">
// // //                 <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
// // //                 <Button
// // //                   type="primary"
// // //                   loading={loading}
// // //                   onClick={() => submitCheckerAction(confirmAction)}
// // //                 >
// // //                   Confirm
// // //                 </Button>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         )}

// // //         <CommentTrail comments={comments} isLoading={commentsLoading} />
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default CheckerReviewChecklistModal;
// // import React, { useState, useEffect, useMemo } from "react";
// // import {
// //   Button,
// //   Table,
// //   Tag,
// //   Input,
// //   Card,
// //   Row,
// //   Col,
// //   Progress,
// //   Space,
// //   List,
// //   Avatar,
// //   Spin,
// // } from "antd";
// // import {
// //   CheckCircleOutlined,
// //   EyeOutlined,
// //   UploadOutlined,
// //   DownloadOutlined,
// //   UserOutlined,
// // } from "@ant-design/icons";
// // import jsPDF from "jspdf";
// // import autoTable from "jspdf-autotable";
// // import {
// //   useUpdateCheckerStatusMutation,
// //   useGetChecklistCommentsQuery,
// // } from "../../api/checklistApi";

// // const GREEN = "#52c41a";
// // const RED = "red";

// // const getRoleTag = (role) => {
// //   const roleLower = role?.toLowerCase() || "system";
// //   let color = "blue";
// //   switch (roleLower) {
// //     case "rm":
// //       color = "purple";
// //       break;
// //     case "creator":
// //       color = "green";
// //       break;
// //     case "co_checker":
// //       color = "volcano";
// //       break;
// //     case "system":
// //       color = "default";
// //       break;
// //     default:
// //       color = "blue";
// //   }
// //   return (
// //     <Tag color={color} className="ml-2 uppercase">
// //       {roleLower.replace(/_/g, " ")}
// //     </Tag>
// //   );
// // };

// // const CommentTrail = ({ comments, isLoading }) => {
// //   if (isLoading) return <Spin className="block m-5" />;
// //   if (!comments || comments.length === 0)
// //     return <i className="pl-4">No historical comments yet.</i>;

// //   return (
// //     <div className="max-h-52 overflow-y-auto">
// //       <List
// //         dataSource={comments}
// //         itemLayout="horizontal"
// //         renderItem={(item) => (
// //           <List.Item>
// //             <List.Item.Meta
// //               avatar={<Avatar icon={<UserOutlined />} />}
// //               title={
// //                 <div className="flex justify-between">
// //                   <div>
// //                     <b>{item.userId?.name || "System"}</b>
// //                     {getRoleTag(item.userId?.role || "system")}
// //                   </div>
// //                   <span className="text-xs text-gray-500">
// //                     {new Date(
// //                       item.createdAt || item.timestamp
// //                     ).toLocaleString()}
// //                   </span>
// //                 </div>
// //               }
// //               description={<div className="break-words">{item.message}</div>}
// //             />
// //           </List.Item>
// //         )}
// //       />
// //     </div>
// //   );
// // };

// // const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
// //   const [docs, setDocs] = useState([]);
// //   const [checkerComment, setCheckerComment] = useState("");
// //   const [commentThread, setCommentThread] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [confirmAction, setConfirmAction] = useState(null);

// //   const [submitCheckerStatus] = useUpdateCheckerStatusMutation();
// //   const { data: comments, isLoading: commentsLoading } =
// //     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

// //   useEffect(() => {
// //     if (!checklist?.documents) return;
// //     const flatDocs = checklist.documents.reduce((acc, item) => {
// //       if (item.docList?.length) {
// //         const nested = item.docList.map((doc) => ({
// //           ...doc,
// //           category: item.category,
// //         }));
// //         return acc.concat(nested);
// //       }
// //       if (item.category) return acc.concat(item);
// //       return acc;
// //     }, []);

// //     setDocs(
// //       flatDocs.map((doc, idx) => ({
// //         ...doc,
// //         key: doc._id || `doc-${idx}`,
// //         status: doc.status || "pending",
// //         approved: doc.approved || false,
// //         checkerStatus:
// //           doc.checkerStatus || (doc.approved ? "approved" : "pending"),
// //         comment: doc.comment || "",
// //         fileUrl: doc.fileUrl || null,
// //       }))
// //     );
// //   }, [checklist]);

// //   const {
// //     totalDocs,
// //     submittedDocs,
// //     pendingDocs,
// //     allApproved,
// //     hasPending,
// //     progressPercent,
// //   } = useMemo(() => {
// //     const total = docs.length;
// //     const submitted = docs.filter((d) => d.status === "submitted").length;
// //     const pending = docs.filter((d) => d.status === "pending").length;
// //     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);
// //     const isStillPendingRm = docs.some((d) => d.status === "pending");
// //     return {
// //       totalDocs: total,
// //       submittedDocs: submitted,
// //       pendingDocs: pending,
// //       allApproved: checkerApprovedAll,
// //       hasPending: isStillPendingRm,
// //       progressPercent: total ? (submitted / total) * 100 : 0,
// //     };
// //   }, [docs]);

// //   const handleDocApprove = (index) => {
// //     setDocs((prev) => {
// //       const updated = [...prev];
// //       updated[index].approved = true;
// //       updated[index].checkerStatus = "approved";
// //       return updated;
// //     });
// //   };

// //   const handleDocReject = (index) => {
// //     setDocs((prev) => {
// //       const updated = [...prev];
// //       updated[index].approved = false;
// //       updated[index].checkerStatus = "rejected";
// //       return updated;
// //     });
// //   };

// //   const submitCheckerAction = async (action) => {
// //     if (!checklist?._id) return alert("Checklist ID missing");
// //     setLoading(true);
// //     try {
// //       await submitCheckerStatus({ id: checklist._id, action }).unwrap();
// //       setConfirmAction(null);
// //       onClose(); // close modal after action
// //     } catch (err) {
// //       console.error(err);
// //       alert(err?.data?.message || "Failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const postComment = () => {
// //     if (!checkerComment.trim()) return;
// //     setCommentThread((prev) => [
// //       {
// //         user: "Checker",
// //         comment: checkerComment,
// //         time: new Date().toLocaleString(),
// //       },
// //       ...prev,
// //     ]);
// //     setCheckerComment("");
// //   };

// //   const renderStatusTag = (status) => <Tag>{status.replace(/_/g, " ")}</Tag>;

// //   const downloadPDF = () => {
// //     const doc = new jsPDF();
// //     doc.setFontSize(16);
// //     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
// //     const tableColumns = ["Category", "Document Name", "Status", "Co Comment"];
// //     const tableRows = docs.map((d) => [
// //       d.category,
// //       d.name,
// //       d.status === "submitted" ? "Submitted" : "Pending",
// //       d.comment || "",
// //     ]);
// //     autoTable(doc, { head: [tableColumns], body: tableRows, startY: 60 });
// //     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
// //   };

// //   const columns = [
// //     { title: "Category", dataIndex: "category" },
// //     { title: "Document Name", dataIndex: "name" },
// //     {
// //       title: "Co Status",
// //       render: (_, record) =>
// //         record.status === "pending" ? (
// //           <Tag color={RED}>Pending</Tag>
// //         ) : (
// //           <Tag color={GREEN}>Submitted</Tag>
// //         ),
// //     },
// //     { title: "Co Comment", dataIndex: "comment" },
// //     {
// //       title: "Checker Status",
// //       dataIndex: "checkerStatus",
// //       render: (status) => renderStatusTag(status),
// //     },
// //     {
// //       title: "Action",
// //       render: (_, record, index) => (
// //         <Space>
// //           <Button
// //             size="small"
// //             type="primary"
// //             onClick={() => handleDocApprove(index)}
// //             disabled={checklist?.status !== "pending"}
// //           >
// //             Approve
// //           </Button>
// //           <Button
// //             size="small"
// //             danger
// //             onClick={() => handleDocReject(index)}
// //             disabled={checklist?.status !== "pending"}
// //           >
// //             Reject
// //           </Button>
// //           {record.fileUrl && (
// //             <Button
// //               size="small"
// //               icon={<EyeOutlined />}
// //               onClick={() => window.open(record.fileUrl, "_blank")}
// //             >
// //               View
// //             </Button>
// //           )}
// //         </Space>
// //       ),
// //     },
// //   ];

// //   const isDisabled = checklist?.status !== "pending"; // disable actions only

// //   return (
// //     <div
// //       className={`fixed inset-0 z-50 overflow-auto bg-black/40 flex justify-center items-start pt-10 ${
// //         open ? "" : "hidden"
// //       }`}
// //     >
// //       <div className="bg-white dark:bg-gray-800 w-[95%] max-w-6xl p-6 rounded-lg shadow-lg relative">
// //         {/* Close Button */}
// //         <button
// //           className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white text-xl font-bold"
// //           onClick={onClose}
// //         >
// //           ×
// //         </button>

// //         {/* Checklist Info */}
// //         <Card className="mb-4">
// //           <Row gutter={16}>
// //             <Col span={8}>
// //               <p>
// //                 <b>DCL No:</b>{" "}
// //                 <span className="text-purple-700">{checklist?.dclNo}</span>
// //               </p>
// //               <p>
// //                 <b>Loan Type:</b> {checklist?.loanType}
// //               </p>
// //             </Col>
// //             <Col span={8}>
// //               <p>
// //                 <b>Created By:</b> {checklist?.createdBy?.name}
// //               </p>
// //               <p>
// //                 <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
// //               </p>
// //             </Col>
// //             <Col span={8}>
// //               <p>
// //                 <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
// //               </p>
// //               <p>
// //                 <b>Created At:</b> {checklist?.createdAt}
// //               </p>
// //             </Col>
// //           </Row>
// //         </Card>

// //         {/* Progress */}
// //         <Card className="mb-4">
// //           <p>
// //             <b>Total:</b> {totalDocs} | <b>Submitted:</b> {submittedDocs} |{" "}
// //             <b className="text-red-600">Pending:</b> {pendingDocs}
// //           </p>
// //           <Progress
// //             percent={progressPercent}
// //             showInfo={false}
// //             strokeColor={GREEN}
// //           />
// //         </Card>

// //         <Table columns={columns} dataSource={docs} pagination={false} />

// //         {/* Comments */}
// //         <Row gutter={16} className="mt-4">
// //           <Col span={12}>
// //             <Card title="Checker Comment">
// //               <Input.TextArea
// //                 rows={3}
// //                 value={checkerComment}
// //                 onChange={(e) => setCheckerComment(e.target.value)}
// //                 placeholder="Add your comment..."
// //                 disabled={isDisabled}
// //               />
// //               <Button
// //                 className="mt-2"
// //                 type="primary"
// //                 onClick={postComment}
// //                 disabled={isDisabled}
// //               >
// //                 Post Comment
// //               </Button>
// //             </Card>
// //           </Col>
// //           <Col span={12}>
// //             <Card title="Comment Thread" className="max-h-40 overflow-y-auto">
// //               {commentThread.map((c, idx) => (
// //                 <p key={idx}>
// //                   <b>{c.user}:</b> {c.comment}{" "}
// //                   <i className="text-xs">{c.time}</i>
// //                 </p>
// //               ))}
// //             </Card>
// //           </Col>
// //         </Row>

// //         {/* Bottom Buttons */}
// //         <div className="mt-6 flex justify-between items-center">
// //           <Space>
// //             <Button icon={<UploadOutlined />} disabled={isDisabled}>
// //               Upload Documents
// //             </Button>
// //             <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
// //               Download Checklist
// //             </Button>
// //           </Space>

// //           <Space>
// //             <Button
// //               danger
// //               onClick={() => setConfirmAction("co_creator_review")}
// //               disabled={isDisabled}
// //             >
// //               Return to Creator
// //             </Button>
// //             <Button
// //               type="primary"
// //               icon={<CheckCircleOutlined />}
// //               disabled={!allApproved || hasPending || isDisabled}
// //               onClick={() => setConfirmAction("approved")}
// //             >
// //               Approve
// //             </Button>
// //           </Space>
// //         </div>

// //         {/* Custom Confirmation Card */}
// //         {confirmAction && (
// //           <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
// //             <div className="bg-white dark:bg-gray-700 p-6 rounded-lg w-96 shadow-lg text-center">
// //               <h3 className="text-lg font-bold mb-4">
// //                 {confirmAction === "approved"
// //                   ? "Approve Checklist?"
// //                   : "Return to Creator?"}
// //               </h3>
// //               <p className="mb-6">
// //                 {confirmAction === "approved"
// //                   ? "This action is final."
// //                   : "This will send the checklist back to the creator."}
// //               </p>
// //               <div className="flex justify-center gap-4">
// //                 <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
// //                 <Button
// //                   type="primary"
// //                   loading={loading}
// //                   onClick={() => submitCheckerAction(confirmAction)}
// //                 >
// //                   Confirm
// //                 </Button>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         <CommentTrail comments={comments} isLoading={commentsLoading} />
// //       </div>
// //     </div>
// //   );
// // };

// // export default CheckerReviewChecklistModal;
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Button,
//   Table,
//   Tag,
//   Input,
//   Card,
//   Row,
//   Col,
//   Progress,
//   Space,
//   List,
//   Avatar,
//   Spin,
// } from "antd";
// import {
//   CheckCircleOutlined,
//   EyeOutlined,
//   UploadOutlined,
//   DownloadOutlined,
//   UserOutlined,
// } from "@ant-design/icons";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import {
//   useUpdateCheckerStatusMutation,
//   useGetChecklistCommentsQuery,
// } from "../../api/checklistApi";

// const GREEN = "#52c41a";
// const RED = "red";

// const getRoleTag = (role) => {
//   const roleLower = role?.toLowerCase() || "system";
//   let color = "blue";
//   switch (roleLower) {
//     case "rm":
//       color = "purple";
//       break;
//     case "creator":
//       color = "green";
//       break;
//     case "co_checker":
//       color = "volcano";
//       break;
//     case "system":
//       color = "default";
//       break;
//     default:
//       color = "blue";
//   }
//   return (
//     <Tag color={color} className="ml-2 uppercase">
//       {roleLower.replace(/_/g, " ")}
//     </Tag>
//   );
// };

// const CommentTrail = ({ comments, isLoading }) => {
//   if (isLoading) return <Spin className="block m-5" />;
//   if (!comments || comments.length === 0)
//     return <i className="pl-4">No historical comments yet.</i>;

//   return (
//     <div className="max-h-52 overflow-y-auto">
//       <List
//         dataSource={comments}
//         itemLayout="horizontal"
//         renderItem={(item) => (
//           <List.Item>
//             <List.Item.Meta
//               avatar={<Avatar icon={<UserOutlined />} />}
//               title={
//                 <div className="flex justify-between">
//                   <div>
//                     <b>{item.userId?.name || "System"}</b>
//                     {getRoleTag(item.userId?.role || "system")}
//                   </div>
//                   <span className="text-xs text-gray-500">
//                     {new Date(
//                       item.createdAt || item.timestamp
//                     ).toLocaleString()}
//                   </span>
//                 </div>
//               }
//               description={<div className="break-words">{item.message}</div>}
//             />
//           </List.Item>
//         )}
//       />
//     </div>
//   );
// };

// const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
//   const [docs, setDocs] = useState([]);
//   const [checkerComment, setCheckerComment] = useState("");
//   const [commentThread, setCommentThread] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [confirmAction, setConfirmAction] = useState(null);

//   const [submitCheckerStatus] = useUpdateCheckerStatusMutation();
//   const { data: comments, isLoading: commentsLoading } =
//     useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

//   useEffect(() => {
//     if (!checklist?.documents) return;
//     const flatDocs = checklist.documents.reduce((acc, item) => {
//       if (item.docList?.length) {
//         const nested = item.docList.map((doc) => ({
//           ...doc,
//           category: item.category,
//         }));
//         return acc.concat(nested);
//       }
//       if (item.category) return acc.concat(item);
//       return acc;
//     }, []);

//     setDocs(
//       flatDocs.map((doc, idx) => ({
//         ...doc,
//         key: doc._id || `doc-${idx}`,
//         status: doc.status || "pending",
//         approved: doc.approved || false,
//         checkerStatus:
//           doc.checkerStatus || (doc.approved ? "approved" : "pending"),
//         comment: doc.comment || "",
//         fileUrl: doc.fileUrl || null,
//       }))
//     );
//   }, [checklist]);

//   const {
//     totalDocs,
//     submittedDocs,
//     pendingDocs,
//     allApproved,
//     hasPending,
//     progressPercent,
//   } = useMemo(() => {
//     const total = docs.length;
//     const submitted = docs.filter((d) => d.status === "submitted").length;
//     const pending = docs.filter((d) => d.status === "pending").length;
//     const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);
//     const isStillPendingRm = docs.some((d) => d.status === "pending");
//     return {
//       totalDocs: total,
//       submittedDocs: submitted,
//       pendingDocs: pending,
//       allApproved: checkerApprovedAll,
//       hasPending: isStillPendingRm,
//       progressPercent: total ? (submitted / total) * 100 : 0,
//     };
//   }, [docs]);

//   const handleDocApprove = (index) => {
//     setDocs((prev) => {
//       const updated = [...prev];
//       updated[index].approved = true;
//       updated[index].checkerStatus = "approved";
//       return updated;
//     });
//   };

//   const handleDocReject = (index) => {
//     setDocs((prev) => {
//       const updated = [...prev];
//       updated[index].approved = false;
//       updated[index].checkerStatus = "rejected";
//       return updated;
//     });
//   };

//   const submitCheckerAction = async (action) => {
//     if (!checklist?._id) return alert("Checklist ID missing");
//     setLoading(true);
//     try {
//       await submitCheckerStatus({ id: checklist._id, action }).unwrap();
//       setConfirmAction(null);
//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert(err?.data?.message || "Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const postComment = () => {
//     if (!checkerComment.trim()) return;
//     setCommentThread((prev) => [
//       {
//         user: "Checker",
//         comment: checkerComment,
//         time: new Date().toLocaleString(),
//       },
//       ...prev,
//     ]);
//     setCheckerComment("");
//   };

//   const renderStatusTag = (status) => <Tag>{status.replace(/_/g, " ")}</Tag>;

//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
//     const tableColumns = ["Category", "Document Name", "Status", "Co Comment"];
//     const tableRows = docs.map((d) => [
//       d.category,
//       d.name,
//       d.status === "submitted" ? "Submitted" : "Pending",
//       d.comment || "",
//     ]);
//     autoTable(doc, { head: [tableColumns], body: tableRows, startY: 60 });
//     doc.save(`Checklist_${checklist?.dclNo}.pdf`);
//   };

//   const isDisabled = checklist?.status === "creator_review"; // disable if sent to creator

//   const columns = [
//     { title: "Category", dataIndex: "category" },
//     { title: "Document Name", dataIndex: "name" },
//     {
//       title: "Co Status",
//       render: (_, record) =>
//         record.status === "pending" ? (
//           <Tag color={RED}>Pending</Tag>
//         ) : (
//           <Tag color={GREEN}>Submitted</Tag>
//         ),
//     },
//     { title: "Co Comment", dataIndex: "comment" },
//     {
//       title: "Checker Status",
//       dataIndex: "checkerStatus",
//       render: (status) => renderStatusTag(status),
//     },
//     {
//       title: "Action",
//       render: (_, record, index) => (
//         <Space className={isDisabled ? "opacity-50 pointer-events-none" : ""}>
//           <Button
//             size="small"
//             type="primary"
//             onClick={() => handleDocApprove(index)}
//             disabled={isDisabled}
//           >
//             Approve
//           </Button>
//           <Button
//             size="small"
//             danger
//             onClick={() => handleDocReject(index)}
//             disabled={isDisabled}
//           >
//             Reject
//           </Button>
//           {record.fileUrl && (
//             <Button
//               size="small"
//               icon={<EyeOutlined />}
//               onClick={() => window.open(record.fileUrl, "_blank")}
//             >
//               View
//             </Button>
//           )}
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div
//       className={`fixed inset-0 z-50 overflow-auto bg-black/40 flex justify-center items-start pt-10 ${
//         open ? "" : "hidden"
//       }`}
//     >
//       <div className="bg-white dark:bg-gray-800 w-[95%] max-w-6xl p-6 rounded-lg shadow-lg relative">
//         {/* Close Button */}
//         <button
//           className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white text-xl font-bold"
//           onClick={onClose}
//         >
//           ×
//         </button>

//         {/* Checklist Info */}
//         <Card className="mb-4">
//           <Row gutter={16}>
//             <Col span={8}>
//               <p>
//                 <b>DCL No:</b>{" "}
//                 <span className="text-purple-700">{checklist?.dclNo}</span>
//               </p>
//               <p>
//                 <b>Loan Type:</b> {checklist?.loanType}
//               </p>
//             </Col>
//             <Col span={8}>
//               <p>
//                 <b>Created By:</b> {checklist?.createdBy?.name}
//               </p>
//               <p>
//                 <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
//               </p>
//             </Col>
//             <Col span={8}>
//               <p>
//                 <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
//               </p>
//               <p>
//                 <b>Created At:</b> {checklist?.createdAt}
//               </p>
//             </Col>
//           </Row>
//         </Card>

//         {/* Progress */}
//         <Card className="mb-4">
//           <p>
//             <b>Total:</b> {totalDocs} | <b>Submitted:</b> {submittedDocs} |{" "}
//             <b className="text-red-600">Pending:</b> {pendingDocs}
//           </p>
//           <Progress
//             percent={progressPercent}
//             showInfo={false}
//             strokeColor={GREEN}
//           />
//         </Card>

//         <Table columns={columns} dataSource={docs} pagination={false} />

//         {/* Comments */}
//         <Row gutter={16} className="mt-4">
//           <Col span={12}>
//             <Card title="Checker Comment">
//               <Input.TextArea
//                 rows={3}
//                 value={checkerComment}
//                 onChange={(e) => setCheckerComment(e.target.value)}
//                 placeholder="Add your comment..."
//                 disabled={isDisabled}
//               />
//               <Button
//                 className="mt-2"
//                 type="primary"
//                 onClick={postComment}
//                 disabled={isDisabled}
//               >
//                 Post Comment
//               </Button>
//             </Card>
//           </Col>
//           <Col span={12}>
//             <Card title="Comment Thread" className="max-h-40 overflow-y-auto">
//               {commentThread.map((c, idx) => (
//                 <p key={idx}>
//                   <b>{c.user}:</b> {c.comment}{" "}
//                   <i className="text-xs">{c.time}</i>
//                 </p>
//               ))}
//             </Card>
//           </Col>
//         </Row>

//         {/* Bottom Buttons */}
//         <div
//           className={`mt-6 flex justify-between items-center ${
//             isDisabled ? "opacity-50 pointer-events-none" : ""
//           }`}
//         >
//           <Space>
//             <Button icon={<UploadOutlined />} disabled={isDisabled}>
//               Upload Documents
//             </Button>
//             <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
//               Download Checklist
//             </Button>
//           </Space>

//           <Space>
//             <Button
//               danger
//               onClick={() => setConfirmAction("co_creator_review")}
//               disabled={isDisabled}
//             >
//               Return to Creator
//             </Button>
//             <Button
//               type="primary"
//               icon={<CheckCircleOutlined />}
//               disabled={!allApproved || hasPending || isDisabled}
//               onClick={() => setConfirmAction("approved")}
//             >
//               Approve
//             </Button>
//           </Space>
//         </div>

//         {/* Custom Confirmation Card */}
//         {confirmAction && (
//           <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
//             <div className="bg-white dark:bg-gray-700 p-6 rounded-lg w-96 shadow-lg text-center">
//               <h3 className="text-lg font-bold mb-4">
//                 {confirmAction === "approved"
//                   ? "Approve Checklist?"
//                   : "Return to Creator?"}
//               </h3>
//               <p className="mb-6">
//                 {confirmAction === "approved"
//                   ? "This action is final."
//                   : "This will send the checklist back to the creator."}
//               </p>
//               <div className="flex justify-center gap-4">
//                 <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
//                 <Button
//                   type="primary"
//                   loading={loading}
//                   onClick={() => submitCheckerAction(confirmAction)}
//                 >
//                   Confirm
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         <CommentTrail comments={comments} isLoading={commentsLoading} />
//       </div>
//     </div>
//   );
// };

// export default CheckerReviewChecklistModal;
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Table,
  Tag,
  Input,
  Card,
  Row,
  Col,
  Progress,
  Space,
  List,
  Avatar,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  UploadOutlined,
  DownloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useUpdateCheckerStatusMutation,
  useGetChecklistCommentsQuery,
} from "../../api/checklistApi";

const GREEN = "#52c41a";
const RED = "red";

const getRoleTag = (role) => {
  const roleLower = role?.toLowerCase() || "system";
  let color = "blue";
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
    <Tag color={color} className="ml-2 uppercase">
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

const CheckerReviewChecklistModal = ({ checklist, open, onClose }) => {
  const [docs, setDocs] = useState([]);
  const [checkerComment, setCheckerComment] = useState("");
  const [commentThread, setCommentThread] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [submitCheckerStatus] = useUpdateCheckerStatusMutation();
  const { data: comments, isLoading: commentsLoading } =
    useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

  useEffect(() => {
    if (!checklist?.documents) return;
    const flatDocs = checklist.documents.reduce((acc, item) => {
      if (item.docList?.length) {
        const nested = item.docList.map((doc) => ({
          ...doc,
          category: item.category,
        }));
        return acc.concat(nested);
      }
      if (item.category) return acc.concat(item);
      return acc;
    }, []);

    setDocs(
      flatDocs.map((doc, idx) => ({
        ...doc,
        key: doc._id || `doc-${idx}`,
        status: doc.status || "pending",
        approved: doc.approved || false,
        checkerStatus:
          doc.checkerStatus || (doc.approved ? "approved" : "pending"),
        comment: doc.comment || "",
        fileUrl: doc.fileUrl || null,
      }))
    );
  }, [checklist]);

  const {
    totalDocs,
    submittedDocs,
    pendingDocs,
    allApproved,
    hasPending,
    progressPercent,
  } = useMemo(() => {
    const total = docs.length;
    const submitted = docs.filter((d) => d.status === "submitted").length;
    const pending = docs.filter((d) => d.status === "pending").length;
    const checkerApprovedAll = total > 0 && docs.every((d) => d.approved);
    const isStillPendingRm = docs.some((d) => d.status === "pending");
    return {
      totalDocs: total,
      submittedDocs: submitted,
      pendingDocs: pending,
      allApproved: checkerApprovedAll,
      hasPending: isStillPendingRm,
      progressPercent: total ? (submitted / total) * 100 : 0,
    };
  }, [docs]);

  const handleDocApprove = (index) => {
    setDocs((prev) => {
      const updated = [...prev];
      updated[index].approved = true;
      updated[index].checkerStatus = "approved";
      return updated;
    });
  };

  const handleDocReject = (index) => {
    setDocs((prev) => {
      const updated = [...prev];
      updated[index].approved = false;
      updated[index].checkerStatus = "rejected";
      return updated;
    });
  };

  const submitCheckerAction = async (action) => {
    if (!checklist?._id) return alert("Checklist ID missing");
    setLoading(true);
    try {
      await submitCheckerStatus({ id: checklist._id, action }).unwrap();
      setConfirmAction(null);
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const postComment = () => {
    if (!checkerComment.trim()) return;
    setCommentThread((prev) => [
      {
        user: "Checker",
        comment: checkerComment,
        time: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    setCheckerComment("");
  };

  // const renderStatusTag = (status) => <Tag>{status.replace(/_/g, " ")}</Tag>;
  const renderStatusTag = (status) => {
    if (!status) return <Tag>Unknown</Tag>;

    const normalized = status.toLowerCase().replace(/_/g, " ");

    let color = "default";

    switch (normalized) {
      case "pending":
        color = "red"; // pending → red
        break;
      case "approved":
        color = "green"; // approved → green
        break;
      case "rejected":
        color = "volcano"; // optional extra example
        break;
      case "submitted for review":
        color = "blue"; // optional extra
        break;
      default:
        color = "default";
    }

    return <Tag color={color}>{normalized}</Tag>;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Checklist - DCL No: ${checklist?.dclNo}`, 14, 20);
    const tableColumns = ["Category", "Document Name", "Status", "Co Comment"];
    const tableRows = docs.map((d) => [
      d.category,
      d.name,
      d.status === "submitted" ? "Submitted" : "Pending",
      d.comment || "",
    ]);
    autoTable(doc, { head: [tableColumns], body: tableRows, startY: 60 });
    doc.save(`Checklist_${checklist?.dclNo}.pdf`);
  };

  // Only enable actions in "check_review" and "co_checker_review"
  const isDisabled = !["check_review", "co_checker_review"].includes(
    checklist?.status
  );

  const columns = [
    { title: "Category", dataIndex: "category" },
    { title: "Document Name", dataIndex: "name" },
    {
      title: "Co Status",
      render: (_, record) =>
        record.status === "pending" ? (
          <Tag color={RED}>Pending</Tag>
        ) : (
          <Tag color={GREEN}>Submitted</Tag>
        ),
    },
    { title: "Co Comment", dataIndex: "comment" },
    {
      title: "Checker Status",
      dataIndex: "checkerStatus",
      render: (status) => renderStatusTag(status),
    },
    {
      title: "Action",
      render: (_, record, index) => (
        <Space className={isDisabled ? "opacity-50 pointer-events-none" : ""}>
          <Button
            size="small"
            type="primary"
            onClick={() => handleDocApprove(index)}
            disabled={isDisabled}
          >
            Approve
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDocReject(index)}
            disabled={isDisabled}
          >
            Reject
          </Button>
          {record.fileUrl && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => window.open(record.fileUrl, "_blank")}
            >
              View
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 overflow-auto bg-black/40 flex justify-center items-start pt-10 ${
        open ? "" : "hidden"
      }`}
    >
      <div className="bg-white dark:bg-gray-800 w-[95%] max-w-6xl p-6 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>

        {/* Checklist Info */}
        <Card className="mb-4">
          <Row gutter={16}>
            <Col span={8}>
              <p>
                <b>DCL No:</b>{" "}
                <span className="text-purple-700">{checklist?.dclNo}</span>
              </p>
              <p>
                <b>Loan Type:</b> {checklist?.loanType}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <b>Created By:</b> {checklist?.createdBy?.name}
              </p>
              <p>
                <b>RM:</b> {checklist.assignedToRM?.name || "N/A"}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <b>Co-Checker:</b> {checklist?.coChecker || "Pending"}
              </p>
              <p>
                <b>Created At:</b> {checklist?.createdAt}
              </p>
            </Col>
          </Row>
        </Card>

        {/* Progress */}
        <Card className="mb-4">
          <p>
            <b>Total:</b> {totalDocs} | <b>Submitted:</b> {submittedDocs} |{" "}
            <b className="text-red-600">Pending:</b> {pendingDocs}
          </p>
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor={GREEN}
          />
        </Card>

        <Table columns={columns} dataSource={docs} pagination={false} />

        {/* Comments */}
        <Row gutter={16} className="mt-2">
          <Col span={12}>
            {/* <Card title="Checker Comment">
              <Input.TextArea
                rows={3}
                value={checkerComment}
                onChange={(e) => setCheckerComment(e.target.value)}
                placeholder="Add your comment..."
                disabled={isDisabled}
              />
              <Button
                className="mt-4"
                type="primary"
                onClick={postComment}
                disabled={isDisabled}
              >
                Post Comment
              </Button>
            </Card> */}

            <Card title="Checker Comment">
              <Input.TextArea
                rows={3}
                value={checkerComment}
                onChange={(e) => setCheckerComment(e.target.value)}
                placeholder="Add your comment..."
                disabled={isDisabled}
              />
              <Button
                type="primary"
                onClick={postComment}
                disabled={isDisabled}
                style={{ marginTop: 16 }} // 16px = mt-4
              >
                Post Comment
              </Button>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Comment Thread" className="max-h-40 overflow-y-auto">
              {commentThread.map((c, idx) => (
                <p key={idx}>
                  <b>{c.user}:</b> {c.comment}{" "}
                  <i className="text-xs">{c.time}</i>
                </p>
              ))}
            </Card>
          </Col>
        </Row>

        <CommentTrail comments={comments} isLoading={commentsLoading} />
        {/* Bottom Buttons */}
        <div
          className={`mt-6 flex justify-between items-center ${
            isDisabled ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Space>
            <Button icon={<UploadOutlined />} disabled={isDisabled}>
              Upload Documents
            </Button>
            <Button icon={<DownloadOutlined />} onClick={downloadPDF}>
              Download Checklist
            </Button>
          </Space>

          <Space>
            <Button
              danger
              onClick={() => setConfirmAction("co_creator_review")}
              disabled={isDisabled}
            >
              Return to Creator
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              disabled={!allApproved || hasPending || isDisabled}
              onClick={() => setConfirmAction("approved")}
            >
              Approve
            </Button>
          </Space>
        </div>

        {/* Custom Confirmation Card */}
        {confirmAction && (
          <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg w-96 shadow-lg text-center">
              <h3 className="text-lg font-bold mb-4">
                {confirmAction === "approved"
                  ? "Approve Checklist?"
                  : "Return to Creator?"}
              </h3>
              <p className="mb-6">
                {confirmAction === "approved"
                  ? "This action is final."
                  : "This will send the checklist back to the creator."}
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={() => submitCheckerAction(confirmAction)}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckerReviewChecklistModal;
