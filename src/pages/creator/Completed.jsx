// import React, { useMemo, useState, useEffect } from "react";
// import {
//   Button,
//   Divider,
//   Table,
//   Tag,
//   Spin,
//   Empty,
//   Card,
//   Row,
//   Col,
//   Input,
//   Badge,
//   Typography
// } from "antd";
// import {
//   SearchOutlined,
//   FileTextOutlined,
//   UserOutlined,
//   CustomerServiceOutlined,
//   CheckCircleOutlined
// } from "@ant-design/icons";
// import CreatorCompletedChecklistModal from "../../components/modals/CreatorCompletedChecklistModal";
// import dayjs from "dayjs";

// // Theme Colors (same as other queues)
// const PRIMARY_BLUE = "#164679";
// const ACCENT_LIME = "#b5d334";
// const HIGHLIGHT_GOLD = "#fcb116";
// const LIGHT_YELLOW = "#fcd716";
// const SECONDARY_PURPLE = "#7e6496";
// const SUCCESS_GREEN = "#52c41a";
// const ERROR_RED = "#ff4d4f";
// const WARNING_ORANGE = "#faad14";

// const { Text } = Typography;

// // MOCK DATA for Creator's Completed Checklists (4 ITEMS)
// const MOCK_CREATOR_COMPLETED = [
//   {
//     _id: "c1",
//     dclNo: "DCL-2024-001",
//     customerNumber: "CUST001",
//     customerName: "Alpha Enterprises Ltd",
//     loanType: "Business Loan",
//     title: "Business Expansion Loan",
//     assignedToRM: { _id: "rm1", name: "John Kamau", email: "john.k@ncba.co.ke" },
//     approvedBy: { _id: "checker1", name: "Michael Chen", email: "michael.c@ncba.co.ke" },
//     checkerComments: "All documents properly verified and complete. Excellent work!",
//     status: "approved",
//     priority: "high",
//     completionDate: "2024-12-18T10:30:00Z",
//     submittedToCheckerAt: "2024-12-16T14:20:00Z",
//     createdAt: "2024-12-01T09:30:00Z",
//     updatedAt: "2024-12-18T10:30:00Z",
//     documents: [
//       {
//         category: "Business Registration",
//         docList: [
//           {
//             _id: "doc1_1",
//             name: "Certificate of Incorporation",
//             status: "approved",
//             fileUrl: "https://example.com/doc1.pdf"
//           }
//         ]
//       }
//     ]
//   },
//   {
//     _id: "c2",
//     dclNo: "DCL-2024-002",
//     customerNumber: "CUST002",
//     customerName: "Beta Manufacturing Inc",
//     loanType: "Equipment Finance",
//     title: "Machinery Upgrade - $350,000",
//     assignedToRM: { _id: "rm2", name: "Sarah Wangui", email: "sarah.w@ncba.co.ke" },
//     approvedBy: { _id: "checker2", name: "David Omondi", email: "david.o@ncba.co.ke" },
//     checkerComments: "Minor revisions required on invoice. Overall good work.",
//     status: "approved_with_revisions",
//     priority: "medium",
//     completionDate: "2024-12-17T14:15:00Z",
//     submittedToCheckerAt: "2024-12-16T09:45:00Z",
//     createdAt: "2024-12-03T14:15:00Z",
//     updatedAt: "2024-12-17T14:15:00Z",
//     documents: [
//       {
//         category: "Technical Documents",
//         docList: [
//           {
//             _id: "doc2_1",
//             name: "Equipment Quotations",
//             status: "approved",
//             fileUrl: "https://example.com/doc2.pdf"
//           },
//           {
//             _id: "doc2_2",
//             name: "Technical Specifications",
//             status: "approved",
//             fileUrl: "https://example.com/doc2_2.pdf"
//           }
//         ]
//       }
//     ]
//   },
//   {
//     _id: "c3",
//     dclNo: "DCL-2024-003",
//     customerNumber: "CUST003",
//     customerName: "Premium Motors Ltd",
//     loanType: "Asset Finance",
//     title: "Fleet Vehicle Purchase - 5 Units",
//     assignedToRM: { _id: "rm1", name: "John Kamau", email: "john.k@ncba.co.ke" },
//     approvedBy: { _id: "checker1", name: "Michael Chen", email: "michael.c@ncba.co.ke" },
//     checkerComments: "Complete documentation. Ready for processing.",
//     status: "approved",
//     priority: "medium",
//     completionDate: "2024-12-18T09:20:00Z",
//     submittedToCheckerAt: "2024-12-16T10:45:00Z",
//     createdAt: "2024-12-05T11:15:00Z",
//     updatedAt: "2024-12-18T09:20:00Z",
//     documents: [
//       {
//         category: "Vehicle Documents",
//         docList: [
//           {
//             _id: "doc3_1",
//             name: "Proforma Invoice",
//             status: "approved",
//             fileUrl: "https://example.com/doc3_1.pdf"
//           },
//           {
//             _id: "doc3_2",
//             name: "Logbook Copies",
//             status: "approved",
//             fileUrl: "https://example.com/doc3_2.pdf"
//           },
//           {
//             _id: "doc3_3",
//             name: "Insurance Certificates",
//             status: "approved",
//             fileUrl: "https://example.com/doc3_3.pdf"
//           }
//         ]
//       }
//     ]
//   },
//   {
//     _id: "c4",
//     dclNo: "DCL-2024-004",
//     customerNumber: "CUST004",
//     customerName: "Tech Solutions Ltd",
//     loanType: "Technology Loan",
//     title: "Software Development - $200,000",
//     assignedToRM: { _id: "rm3", name: "Peter Kariuki", email: "peter.k@ncba.co.ke" },
//     approvedBy: { _id: "checker2", name: "David Omondi", email: "david.o@ncba.co.ke" },
//     checkerComments: "Excellent documentation. No issues found.",
//     status: "approved",
//     priority: "low",
//     completionDate: "2024-12-19T11:45:00Z",
//     submittedToCheckerAt: "2024-12-17T15:30:00Z",
//     createdAt: "2024-12-06T10:00:00Z",
//     updatedAt: "2024-12-19T11:45:00Z",
//     documents: [
//       {
//         category: "Technical Documents",
//         docList: [
//           {
//             _id: "doc4_1",
//             name: "Project Proposal",
//             status: "approved",
//             fileUrl: "https://example.com/doc4_1.pdf"
//           },
//           {
//             _id: "doc4_2",
//             name: "Budget Breakdown",
//             status: "approved",
//             fileUrl: "https://example.com/doc4_2.pdf"
//           }
//         ]
//       }
//     ]
//   }
// ];

// const Completed = ({ userId = "creator_current" }) => {
//   const [selectedChecklist, setSelectedChecklist] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [mockData, setMockData] = useState([]);

//   const [searchText, setSearchText] = useState("");

//   useEffect(() => {
//     setLoading(true);
//     setTimeout(() => {
//       setMockData(MOCK_CREATOR_COMPLETED);
//       setLoading(false);
//     }, 300);
//   }, []);

//   const filteredData = useMemo(() => {
//     let filtered = mockData;

//     if (searchText) {
//       filtered = filtered.filter(c =>
//         c.dclNo.toLowerCase().includes(searchText.toLowerCase()) ||
//         c.customerNumber.toLowerCase().includes(searchText.toLowerCase()) ||
//         c.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
//         c.loanType.toLowerCase().includes(searchText.toLowerCase()) ||
//         c.approvedBy?.name?.toLowerCase().includes(searchText.toLowerCase())
//       );
//     }

//     return filtered;
//   }, [mockData, searchText]);

//   const clearFilters = () => setSearchText("");

//   const refetch = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setMockData([...MOCK_CREATOR_COMPLETED]);
//       setLoading(false);
//     }, 200);
//   };

//   const columns = [
//     {
//       title: "DCL No",
//       dataIndex: "dclNo",
//       width: 140,
//       fixed: "left",
//       render: (text) => (
//         <div style={{ fontWeight: "bold", color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 8 }}>
//           <FileTextOutlined style={{ color: SECONDARY_PURPLE }} />
//           {text}
//         </div>
//       )
//     },
//     {
//       title: "Customer No",
//       dataIndex: "customerNumber",
//       width: 110,
//       render: (text) => (
//         <div style={{ color: SECONDARY_PURPLE, fontWeight: 500, fontSize: 13 }}>
//           {text}
//         </div>
//       )
//     },
//     {
//       title: "Customer Name",
//       dataIndex: "customerName",
//       width: 160,
//       render: (text) => (
//         <div style={{
//           fontWeight: 600,
//           color: PRIMARY_BLUE,
//           display: "flex",
//           alignItems: "center",
//           gap: 6
//         }}>
//           <CustomerServiceOutlined style={{ fontSize: 12 }} />
//           {text}
//         </div>
//       )
//     },
//     {
//       title: "Loan Type",
//       dataIndex: "loanType",
//       width: 120,
//       render: (text) => (
//         <div style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
//           {text}
//         </div>
//       )
//     },
//     {
//       title: "Checker - Approver",
//       dataIndex: "approvedBy",
//       width: 140,
//       render: (approver) => (
//         <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
//           <UserOutlined style={{ color: PRIMARY_BLUE, fontSize: 12 }} />
//           <span style={{ color: PRIMARY_BLUE, fontWeight: 500, fontSize: 13 }}>{approver?.name || "N/A"}</span>
//         </div>
//       )
//     },
//     {
//       title: "Docs",
//       dataIndex: "documents",
//       width: 70,
//       align: "center",
//       render: (docs) => {
//         const totalDocs = docs?.reduce((total, category) => total + (category.docList?.length || 0), 0) || 0;
//         return (
//           <Tag
//             color={LIGHT_YELLOW}
//             style={{
//               fontSize: 11,
//               borderRadius: 999,
//               fontWeight: "bold",
//               color: PRIMARY_BLUE,
//               border: `1px solid ${HIGHLIGHT_GOLD}`,
//               minWidth: 28,
//               textAlign: "center"
//             }}
//           >
//             {totalDocs}
//           </Tag>
//         );
//       }
//     },
//     {
//       title: "Completed Date",
//       dataIndex: "completionDate",
//       width: 120,
//       render: (date) => (
//         <div style={{ fontSize: 12, fontWeight: 500 }}>
//           {dayjs(date).format('DD/MM/YYYY')}
//         </div>
//       )
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       width: 100,
//       fixed: "right",
//       render: (status) => {
//         const statusConfig = {
//           approved: { color: "success", text: "Approved", icon: <CheckCircleOutlined /> },
//           approved_with_revisions: { color: "processing", text: "Revised", icon: <CheckCircleOutlined /> }
//         };
//         const config = statusConfig[status] || { color: "default", text: status };
//         return (
//           <Tag
//             color={config.color}
//             style={{ fontWeight: "bold", fontSize: 11 }}
//             icon={config.icon}
//           >
//             {config.text}
//           </Tag>
//         );
//       }
//     }
//   ];

//   const customTableStyles = `
//     .creator-completed-table .ant-table-wrapper {
//       border-radius: 12px;
//       overflow: hidden;
//       box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
//       border: 1px solid #e0e0e0;
//     }
//     .creator-completed-table .ant-table-thead > tr > th {
//       background-color: #f7f7f7 !important;
//       color: ${PRIMARY_BLUE} !important;
//       font-weight: 700;
//       fontSize: 13px;
//       padding: 14px 12px !important;
//       border-bottom: 3px solid ${SUCCESS_GREEN} !important;
//       border-right: none !important;
//     }
//     .creator-completed-table .ant-table-tbody > tr > td {
//       border-bottom: 1px solid #f0f0f0 !important;
//       border-right: none !important;
//       padding: 12px 12px !important;
//       fontSize: 13px;
//       color: #333;
//     }
//     .creator-completed-table .ant-table-tbody > tr.ant-table-row:hover > td {
//       background-color: rgba(82, 196, 26, 0.1) !important;
//       cursor: pointer;
//     }
//     .creator-completed-table .ant-pagination .ant-pagination-item-active {
//       background-color: ${SUCCESS_GREEN} !important;
//       border-color: ${SUCCESS_GREEN} !important;
//     }
//     .creator-completed-table .ant-pagination .ant-pagination-item-active a {
//       color: ${PRIMARY_BLUE} !important;
//       font-weight: 600;
//     }
//   `;

//   return (
//     <div style={{ padding: 24 }}>
//       <style>{customTableStyles}</style>

//       {/* Header */}
//       <Card
//         style={{
//           marginBottom: 24,
//           borderRadius: 8,
//           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           borderLeft: `4px solid ${SUCCESS_GREEN}`
//         }}
//         styles={{ body: { padding: 16 } }}
//       >
//         <Row justify="space-between" align="middle">
//           <Col>
//             <h2 style={{ margin: 0, color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 12 }}>
//               Completed Checklists
//               <Badge
//                 count={filteredData.length}
//                 style={{
//                   backgroundColor: SUCCESS_GREEN,
//                   fontSize: 12
//                 }}
//               />
//             </h2>
//             <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
//               Checklists approved by checkers
//             </p>
//           </Col>
//         </Row>
//       </Card>

//       {/* Filters */}
//       <Card
//         style={{
//           marginBottom: 16,
//           background: "#fafafa",
//           border: `1px solid ${PRIMARY_BLUE}20`,
//           borderRadius: 8
//         }}
//         size="small"
//       >
//         <Row gutter={[16, 16]} align="middle">
//           <Col xs={24} sm={12} md={8}>
//             <Input
//               placeholder="Search by DCL No, Customer, Loan Type, or Checker"
//               prefix={<SearchOutlined />}
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               allowClear
//               size="middle"
//             />
//           </Col>

//           <Col xs={24} sm={12} md={4}>
//             <Button
//               onClick={clearFilters}
//               style={{ width: '100%' }}
//               size="middle"
//             >
//               Clear
//             </Button>
//           </Col>
//         </Row>
//       </Card>

//       {/* Table Title */}
//       <Divider style={{ margin: "12px 0" }}>
//         <span style={{ color: PRIMARY_BLUE, fontSize: 16, fontWeight: 600 }}>
//           Approved Checklists ({filteredData.length} items)
//         </span>
//       </Divider>

//       {/* Table */}
//       {loading ? (
//         <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
//           <Spin tip="Loading completed checklists..." />
//         </div>
//       ) : filteredData.length === 0 ? (
//         <Empty
//           description={
//             <div>
//               <p style={{ fontSize: 16, marginBottom: 8 }}>No completed checklists found</p>
//               <p style={{ color: "#999" }}>
//                 {searchText
//                   ? 'Try changing your search term'
//                   : 'No checklists have been completed yet'}
//               </p>
//             </div>
//           }
//           style={{ padding: 40 }}
//         />
//       ) : (
//         <div className="creator-completed-table">
//           <Table
//             columns={columns}
//             dataSource={filteredData}
//             rowKey="_id"
//             size="middle"
//             pagination={{
//               pageSize: 10,
//               showSizeChanger: true,
//               pageSizeOptions: ["10", "20", "50"],
//               position: ["bottomCenter"],
//               showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} checklists`
//             }}
//             scroll={{ x: 1000 }}
//             onRow={(record) => ({
//               onClick: () => {
//                 setSelectedChecklist(record);
//                 setModalOpen(true);
//               },
//             })}
//           />
//         </div>
//       )}

//       {/* Footer Info */}
//       <div style={{
//         marginTop: 24,
//         padding: 16,
//         background: "#f8f9fa",
//         borderRadius: 8,
//         fontSize: 12,
//         color: "#666",
//         border: `1px solid ${PRIMARY_BLUE}10`
//       }}>
//         <Row justify="space-between" align="middle">
//           <Col>
//             Report generated on: {dayjs().format('DD/MM/YYYY HH:mm:ss')}
//           </Col>
//           <Col>
//             <Text type="secondary">
//               Showing {filteredData.length} items • Data as of latest system update
//             </Text>
//           </Col>
//         </Row>
//       </div>

//       {/* Action Modal */}
//       {selectedChecklist && (
//         <CreatorCompletedChecklistModal
//           checklist={selectedChecklist}
//           open={modalOpen}
//           onClose={() => {
//             setModalOpen(false);
//             setSelectedChecklist(null);
//             refetch();
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Completed;

// import React, { useMemo, useState } from "react";
// import { Table, Input, Card, Divider, Spin, Button } from "antd";
// import { useGetAllCoCreatorChecklistsQuery } from "../../api/checklistApi";
// import CheckerReviewChecklistModal from "../../components/modals/CheckerReviewChecklistModal";

// const PRIMARY_BLUE = "#164679";
// const SECONDARY_PURPLE = "#7e6496";

// const Completed = () => {
//   const [searchText, setSearchText] = useState("");
//   const [selectedChecklist, setSelectedChecklist] = useState(null);

//   // ✅ Fetch ALL checklists from backend
//   const {
//     data: allChecklists = [],
//     isLoading,
//     refetch,
//   } = useGetAllCoCreatorChecklistsQuery();

//   // ✅ ONLY Approved checklists
//   const filteredData = useMemo(() => {
//     let filtered = allChecklists.filter(
//       (c) => c.status?.toLowerCase() === "approved"
//     );

//     if (searchText) {
//       const q = searchText.toLowerCase();
//       filtered = filtered.filter(
//         (c) =>
//           c.dclNo?.toLowerCase().includes(q) ||
//           c.customerNumber?.toLowerCase().includes(q) ||
//           c.customerName?.toLowerCase().includes(q) ||
//           c.loanType?.toLowerCase().includes(q) ||
//           c.approvedBy?.name?.toLowerCase().includes(q)
//       );
//     }

//     return filtered;
//   }, [allChecklists, searchText]);

//   const columns = [
//     {
//       title: "DCL No",
//       dataIndex: "dclNo",
//       render: (text) => (
//         <span style={{ fontWeight: "bold", color: PRIMARY_BLUE }}>{text}</span>
//       ),
//     },
//     {
//       title: "Customer Number",
//       dataIndex: "customerNumber",
//       render: (text) => <strong>{text || "N/A"}</strong>,
//     },
//     {
//       title: "Customer Name",
//       dataIndex: "customerName",
//       render: (text) => <span>{text || "N/A"}</span>,
//     },
//     {
//       title: "Loan Type",
//       dataIndex: "loanType",
//     },
//     {
//       title: "Approved By",
//       dataIndex: "approvedBy",
//       render: (user) => (
//         <span style={{ color: SECONDARY_PURPLE }}>{user?.name || "—"}</span>
//       ),
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       render: () => (
//         <span style={{ fontWeight: "bold", color: "#52c41a" }}>Approved</span>
//       ),
//     },
//     {
//       title: "Actions",
//       width: 90,
//       render: (_, record) => (
//         <Button
//           type="link"
//           size="small"
//           style={{ fontWeight: "bold", color: PRIMARY_BLUE }}
//           onClick={() => setSelectedChecklist(record)}
//         >
//           View
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: 16 }}>
//       <Card>
//         <Divider orientation="left">Completed / Approved Checklists</Divider>

//         <Input.Search
//           allowClear
//           placeholder="Search by DCL, Customer, Loan Type..."
//           style={{ maxWidth: 400, marginBottom: 16 }}
//           onChange={(e) => setSearchText(e.target.value)}
//         />

//         {isLoading ? (
//           <div style={{ textAlign: "center", padding: 40 }}>
//             <Spin size="large" />
//           </div>
//         ) : (
//           <Table
//             rowKey="_id"
//             columns={columns}
//             dataSource={filteredData}
//             pagination={{ pageSize: 10, showSizeChanger: true }}
//             onRow={(record) => ({
//               onClick: () => setSelectedChecklist(record),
//               style: { cursor: "pointer" },
//             })}
//           />
//         )}
//       </Card>

//       {/* ✅ View Modal */}
//       {selectedChecklist && (
//         <CheckerReviewChecklistModal
//           open={!!selectedChecklist}
//           checklist={selectedChecklist}
//           onClose={() => {
//             setSelectedChecklist(null);
//             refetch();
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Completed;

import React, { useMemo, useState } from "react";
import {
  Button,
  Divider,
  Table,
  Tag,
  Spin,
  Empty,
  Card,
  Row,
  Col,
  Input,
  Badge,
  Typography,
} from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useGetAllCoCreatorChecklistsQuery } from "../../api/checklistApi";
import CheckerReviewChecklistModal from "../../components/modals/CheckerReviewChecklistModal";
import dayjs from "dayjs";
import ReviewChecklistModal from "../../components/modals/ReviewChecklistModal";

/* ---------------- THEME COLORS ---------------- */
const PRIMARY_BLUE = "#164679";
const ACCENT_LIME = "#b5d334";
const HIGHLIGHT_GOLD = "#fcb116";
const LIGHT_YELLOW = "#fcd716";
const SECONDARY_PURPLE = "#7e6496";
const SUCCESS_GREEN = "#52c41a";

const { Text } = Typography;

const Completed = () => {
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [searchText, setSearchText] = useState("");

  /* ---------------- FETCH DATA ---------------- */
  const {
    data: allChecklists = [],
    isLoading,
    refetch,
  } = useGetAllCoCreatorChecklistsQuery();

  /* ---------------- FILTER APPROVED ---------------- */
  const filteredData = useMemo(() => {
    let filtered = allChecklists.filter(
      (c) => c.status?.toLowerCase() === "approved"
    );

    if (searchText) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.dclNo?.toLowerCase().includes(q) ||
          c.customerNumber?.toLowerCase().includes(q) ||
          c.customerName?.toLowerCase().includes(q) ||
          c.loanType?.toLowerCase().includes(q) ||
          c.approvedBy?.name?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [allChecklists, searchText]);

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: "DCL No",
      dataIndex: "dclNo",
      width: 140,
      fixed: "left",
      render: (text) => (
        <div
          style={{
            fontWeight: "bold",
            color: PRIMARY_BLUE,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FileTextOutlined style={{ color: SECONDARY_PURPLE }} />
          {text}
        </div>
      ),
    },
    {
      title: "Customer No",
      dataIndex: "customerNumber",
      width: 110,
      render: (text) => (
        <div style={{ color: SECONDARY_PURPLE, fontWeight: 500, fontSize: 13 }}>
          {text || "—"}
        </div>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      width: 160,
      render: (text) => (
        <div
          style={{
            fontWeight: 600,
            color: PRIMARY_BLUE,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CustomerServiceOutlined style={{ fontSize: 12 }} />
          {text}
        </div>
      ),
    },
    {
      title: "Loan Type",
      dataIndex: "loanType",
      width: 120,
      render: (text) => (
        <div style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
          {text}
        </div>
      ),
    },
    {
      title: "Checker - Approver",
      dataIndex: "approvedBy",
      width: 140,
      render: (approver) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <UserOutlined style={{ color: PRIMARY_BLUE, fontSize: 12 }} />
          <span
            style={{
              color: PRIMARY_BLUE,
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {approver?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "Docs",
      dataIndex: "documents",
      width: 70,
      align: "center",
      render: (docs = []) => {
        const totalDocs =
          docs.reduce(
            (total, category) => total + (category.docList?.length || 0),
            0
          ) || 0;

        return (
          <Tag
            color={LIGHT_YELLOW}
            style={{
              fontSize: 11,
              borderRadius: 999,
              fontWeight: "bold",
              color: PRIMARY_BLUE,
              border: `1px solid ${HIGHLIGHT_GOLD}`,
              minWidth: 28,
              textAlign: "center",
            }}
          >
            {totalDocs}
          </Tag>
        );
      },
    },
    {
      title: "Completed Date",
      dataIndex: "updatedAt",
      width: 120,
      render: (date) => (
        <div style={{ fontSize: 12, fontWeight: 500 }}>
          {date ? dayjs(date).format("DD/MM/YYYY") : "—"}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      fixed: "right",
      render: () => (
        <Tag
          color="success"
          style={{ fontWeight: "bold", fontSize: 11 }}
          icon={<CheckCircleOutlined />}
        >
          Approved
        </Tag>
      ),
    },
  ];

  /* ---------------- TABLE STYLES ---------------- */
  const customTableStyles = `
    .creator-completed-table .ant-table-wrapper {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
      border: 1px solid #e0e0e0;
    }
    .creator-completed-table .ant-table-thead > tr > th {
      background-color: #f7f7f7 !important;
      color: ${PRIMARY_BLUE} !important;
      font-weight: 700;
      padding: 14px 12px !important;
      border-bottom: 3px solid ${SUCCESS_GREEN} !important;
    }
    .creator-completed-table .ant-table-tbody > tr:hover > td {
      background-color: rgba(82, 196, 26, 0.1) !important;
      cursor: pointer;
    }
  `;

  return (
    <div style={{ padding: 24 }}>
      <style>{customTableStyles}</style>

      {/* ---------------- HEADER ---------------- */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderLeft: `4px solid ${SUCCESS_GREEN}`,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <h2
              style={{
                margin: 0,
                color: PRIMARY_BLUE,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              Completed Checklists
              <Badge
                count={filteredData.length}
                style={{ backgroundColor: SUCCESS_GREEN }}
              />
            </h2>
            <p style={{ margin: "4px 0 0", color: "#666" }}>
              Checklists approved by checkers
            </p>
          </Col>
        </Row>
      </Card>

      {/* ---------------- FILTER ---------------- */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          background: "#fafafa",
          borderRadius: 8,
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by DCL, Customer, Loan Type or Checker"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      <Divider>
        <Text strong>Approved Checklists ({filteredData.length})</Text>
      </Divider>

      {/* ---------------- TABLE ---------------- */}
      {isLoading ? (
        <Spin style={{ display: "block", margin: "40px auto" }} />
      ) : filteredData.length === 0 ? (
        <Empty description="No approved checklists found" />
      ) : (
        <div className="creator-completed-table">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1000 }}
            onRow={(record) => ({
              onClick: () => setSelectedChecklist(record),
            })}
          />
        </div>
      )}

      {/* ---------------- MODAL ---------------- */}
      {selectedChecklist && (
        // <CheckerReviewChecklistModal
        //   open
        //   checklist={selectedChecklist}
        //   onClose={() => {
        //     setSelectedChecklist(null);
        //     refetch();
        //   }}
        // />

        <ReviewChecklistModal
          checklist={selectedChecklist}
          open={!!selectedChecklist}
          onClose={() => setSelectedChecklist(null)}
        />
      )}
    </div>
  );
};

export default Completed;
