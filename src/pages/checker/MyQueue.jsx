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
//   CustomerServiceOutlined
// } from "@ant-design/icons";
// import CheckerReviewChecklistModal from "../../components/modals/CheckerReviewChecklistModal";
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

// // MOCK DATA for Checker Queue (3 ITEMS)
// const MOCK_CHECKER_CHECKLISTS = [
//   {
//     _id: "1",
//     dclNo: "DCL-2024-001",
//     customerNumber: "CUST001",
//     customerName: "Alpha Enterprises Ltd",
//     loanType: "Business Loan",
//     title: "Business Expansion Loan",
//     createdBy: { _id: "creator1", name: "Sarah Wangui", email: "sarah.w@ncba.co.ke" },
//     creatorGeneralComment: "All documents verified and approved",
//     status: "pending_checker",
//     priority: "high",
//     slaExpiry: "2024-12-20T23:59:59Z",
//     submittedToCheckerAt: "2024-12-16T14:20:00Z",
//     createdAt: "2024-12-01T09:30:00Z",
//     updatedAt: "2024-12-16T14:20:00Z",
//     documents: [
//       {
//         category: "Business Registration",
//         docList: [
//           {
//             _id: "doc1_1",
//             name: "Certificate of Incorporation",
//             status: "approved",
//             fileUrl: "https://example.com/doc1.pdf",
//             creatorComment: "Verified - valid",
//             uploadedAt: "2024-12-15T14:15:00Z"
//           }
//         ]
//       }
//     ]
//   },
//   {
//     _id: "2",
//     dclNo: "DCL-2024-002",
//     customerNumber: "CUST002",
//     customerName: "Beta Manufacturing Inc",
//     loanType: "Equipment Finance",
//     title: "Machinery Upgrade - $350,000",
//     createdBy: { _id: "creator2", name: "David Omondi", email: "david.o@ncba.co.ke" },
//     creatorGeneralComment: "Documents uploaded and verified. Ready for final review.",
//     status: "pending_checker",
//     priority: "medium",
//     slaExpiry: "2024-12-18T23:59:59Z",
//     submittedToCheckerAt: "2024-12-16T09:45:00Z",
//     createdAt: "2024-12-03T14:15:00Z",
//     updatedAt: "2024-12-16T09:45:00Z",
//     documents: [
//       {
//         category: "Technical Documents",
//         docList: [
//           {
//             _id: "doc2_1",
//             name: "Equipment Quotations",
//             status: "approved",
//             fileUrl: "https://example.com/doc2.pdf",
//             creatorComment: "From 3 approved suppliers",
//             uploadedAt: "2024-12-15T11:30:00Z"
//           },
//           {
//             _id: "doc2_2",
//             name: "Technical Specifications",
//             status: "approved",
//             fileUrl: "https://example.com/doc2_2.pdf",
//             creatorComment: "Complete technical specs",
//             uploadedAt: "2024-12-15T11:35:00Z"
//           }
//         ]
//       }
//     ]
//   },
//   {
//     _id: "3",
//     dclNo: "DCL-2024-003",
//     customerNumber: "CUST003",
//     customerName: "Premium Motors Ltd",
//     loanType: "Asset Finance",
//     title: "Fleet Vehicle Purchase - 5 Units",
//     createdBy: { _id: "creator2", name: "David Omondi", email: "david.o@ncba.co.ke" },
//     creatorGeneralComment: "All vehicle documents from authorized dealers. Ready for final approval.",
//     status: "pending_checker",
//     priority: "medium",
//     slaExpiry: "2024-12-22T23:59:59Z",
//     submittedToCheckerAt: "2024-12-16T10:45:00Z",
//     createdAt: "2024-12-05T11:15:00Z",
//     updatedAt: "2024-12-16T10:45:00Z",
//     documents: [
//       {
//         category: "Vehicle Documents",
//         docList: [
//           {
//             _id: "doc3_1",
//             name: "Proforma Invoice",
//             status: "approved",
//             fileUrl: "https://example.com/doc3_1.pdf",
//             creatorComment: "From authorized dealer with breakdown",
//             uploadedAt: "2024-12-15T15:20:00Z"
//           },
//           {
//             _id: "doc3_2",
//             name: "Logbook Copies",
//             status: "approved",
//             fileUrl: "https://example.com/doc3_2.pdf",
//             creatorComment: "Existing fleet verified",
//             uploadedAt: "2024-12-15T15:25:00Z"
//           },
//           {
//             _id: "doc3_3",
//             name: "Insurance Certificates",
//             status: "approved",
//             fileUrl: "https://example.com/doc3_3.pdf",
//             creatorComment: "Valid insurance for all vehicles",
//             uploadedAt: "2024-12-15T15:30:00Z"
//           }
//         ]
//       }
//     ]
//   }
// ];

// // Checker's MyQueue component
// const MyQueue = ({ userId = "checker_current" }) => {
//   const [selectedChecklist, setSelectedChecklist] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [mockData, setMockData] = useState([]);
 
//   // Filters
//   const [searchText, setSearchText] = useState("");

//   // Load data
//   useEffect(() => {
//     setLoading(true);
   
//     setTimeout(() => {
//       setMockData(MOCK_CHECKER_CHECKLISTS);
//       setLoading(false);
//     }, 300);
//   }, []);

//   // Filter data
//   const filteredData = useMemo(() => {
//     let filtered = mockData.filter((c) => c.status === "pending_checker");
   
//     // Apply search filter
//     if (searchText) {
//       filtered = filtered.filter(c =>
//         c.dclNo.toLowerCase().includes(searchText.toLowerCase()) ||
//         c.customerNumber.toLowerCase().includes(searchText.toLowerCase()) ||
//         c.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
//         c.loanType.toLowerCase().includes(searchText.toLowerCase()) ||
//         c.createdBy?.name?.toLowerCase().includes(searchText.toLowerCase())
//       );
//     }
   
//     return filtered;
//   }, [mockData, searchText]);

//   // Clear filters
//   const clearFilters = () => {
//     setSearchText("");
//   };

//   // Refetch function
//   const refetch = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setMockData([...MOCK_CHECKER_CHECKLISTS]);
//       setLoading(false);
//     }, 200);
//   };

//   // Columns - Format: DCL No, Customer No, Customer Name, Loan Type, Creator, Docs, Submitted, SLA
//   const columns = [
//     {
//       title: "DCL No",
//       dataIndex: "dclNo",
//       width: 140,
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
//       title: "Creator",
//       dataIndex: "createdBy",
//       width: 120,
//       render: (creator) => (
//         <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
//           <UserOutlined style={{ color: PRIMARY_BLUE, fontSize: 12 }} />
//           <span style={{ color: PRIMARY_BLUE, fontWeight: 500, fontSize: 13 }}>{creator?.name || "N/A"}</span>
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
//       title: "Submitted",
//       dataIndex: "submittedToCheckerAt",
//       width: 110,
//       render: (date) => (
//         <div style={{ fontSize: 12 }}>
//           {dayjs(date).format('DD/MM/YYYY')}
//         </div>
//       )
//     },
//     {
//       title: "SLA",
//       dataIndex: "slaExpiry",
//       width: 90,
//       fixed: "right",
//       render: (date) => {
//         const daysLeft = dayjs(date).diff(dayjs(), 'days');
//         return (
//           <Tag
//             color={daysLeft <= 2 ? ERROR_RED : daysLeft <= 5 ? WARNING_ORANGE : SUCCESS_GREEN}
//             style={{ fontWeight: "bold", fontSize: 11 }}
//           >
//             {daysLeft > 0 ? `${daysLeft}d` : 'Expired'}
//           </Tag>
//         );
//       }
//     }
//   ];

//   // Custom table styles
//   const customTableStyles = `
//     .checker-myqueue-table .ant-table-wrapper {
//       border-radius: 12px;
//       overflow: hidden;
//       box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
//       border: 1px solid #e0e0e0;
//     }
//     .checker-myqueue-table .ant-table-thead > tr > th {
//       background-color: #f7f7f7 !important;
//       color: ${PRIMARY_BLUE} !important;
//       font-weight: 700;
//       fontSize: 13px;
//       padding: 14px 12px !important;
//       border-bottom: 3px solid ${ACCENT_LIME} !important;
//       border-right: none !important;
//     }
//     .checker-myqueue-table .ant-table-tbody > tr > td {
//       border-bottom: 1px solid #f0f0f0 !important;
//       border-right: none !important;
//       padding: 12px 12px !important;
//       fontSize: 13px;
//       color: #333;
//     }
//     .checker-myqueue-table .ant-table-tbody > tr.ant-table-row:hover > td {
//       background-color: rgba(181, 211, 52, 0.1) !important;
//       cursor: pointer;
//     }
//     .checker-myqueue-table .ant-pagination .ant-pagination-item-active {
//       background-color: ${ACCENT_LIME} !important;
//       border-color: ${ACCENT_LIME} !important;
//     }
//     .checker-myqueue-table .ant-pagination .ant-pagination-item-active a {
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
//           borderLeft: `4px solid ${ACCENT_LIME}`
//         }}
//         bodyStyle={{ padding: 16 }}
//       >
//         <Row justify="space-between" align="middle">
//           <Col>
//             <h2 style={{ margin: 0, color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 12 }}>
//               My Queue
//               <Badge
//                 count={filteredData.length}
//                 style={{
//                   backgroundColor: ACCENT_LIME,
//                   fontSize: 12
//                 }}
//               />
//             </h2>
//             <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
//               Review DCLs approved by Creators
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
//               placeholder="Search by DCL No, Customer, Loan Type, or Creator"
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
//           Pending Review ({filteredData.length} items)
//         </span>
//       </Divider>

//       {/* Table */}
//       {loading ? (
//         <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
//           <Spin tip="Loading checklists..." />
//         </div>
//       ) : filteredData.length === 0 ? (
//         <Empty
//           description={
//             <div>
//               <p style={{ fontSize: 16, marginBottom: 8 }}>No DCLs pending review</p>
//               <p style={{ color: "#999" }}>
//                 {searchText
//                   ? 'Try changing your search term'
//                   : 'No DCLs available for review'}
//               </p>
//             </div>
//           }
//           style={{ padding: 40 }}
//         />
//       ) : (
//         <div className="checker-myqueue-table">
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
//               showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} DCLs`
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
//   {selectedChecklist && (
//   <CheckerReviewChecklistModal
//     checklist={selectedChecklist}
//     open={modalOpen}
//     onClose={() => {
//       setModalOpen(false);
//       setSelectedChecklist(null);
//       refetch();
//     }}
//   />
// )}

//     </div>
//   );
// };

// export default MyQueue;



import React, { useState } from "react";
import { Table, Divider, Button, Tag } from "antd";
import CheckerReviewChecklistModal from "../../components/modals/CheckerReviewChecklistModal.jsx";
import { useGetAllCoCreatorChecklistsQuery } from "../../api/checklistApi.js";

const PRIMARY_BLUE = "#164679";
const SECONDARY_PURPLE = "#7e6496";
const SUCCESS_GREEN = "#52c41a";

const CompletedChecklists = ({ userId }) => {
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  const { data: checklists = [], refetch } =
    useGetAllCoCreatorChecklistsQuery();

  /**
   * ✅ ONLY APPROVED CHECKLISTS
   */
  const completedChecklists = checklists.filter(
    (c) =>
      c.assignedToCoChecker?._id === userId &&
      c.status?.toLowerCase() === "approved"
  );

  const columns = [
    {
      title: "DCL No",
      dataIndex: "dclNo",
      render: (text) => (
        <span style={{ fontWeight: "bold", color: PRIMARY_BLUE }}>
          {text}
        </span>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      render: (text) => (
        <span style={{ color: SECONDARY_PURPLE }}>
          {text || "N/A"}
        </span>
      ),
    },
    {
      title: "Customer Number",
      dataIndex: "customerNumber",
      render: (text) => (
        <span style={{ fontWeight: 500, color: PRIMARY_BLUE }}>
          {text || "N/A"}
        </span>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      render: (text) => (
        <span style={{ color: SECONDARY_PURPLE }}>
          {text}
        </span>
      ),
    },
    {
      title: "Loan Type",
      dataIndex: "loanType",
    },
    {
      title: "Assigned RM",
      dataIndex: "assignedToRM",
      render: (rm) => (
        <span style={{ color: PRIMARY_BLUE }}>
          {rm?.name || "N/A"}
        </span>
      ),
    },
    {
      title: "# Docs",
      dataIndex: "documents",
      render: (docs) => (
        <span
          style={{
            backgroundColor: "#f0f5ff",
            padding: "2px 10px",
            borderRadius: 12,
            fontWeight: "bold",
          }}
        >
          {docs?.length || 0}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: () => (
        <Tag
          color={SUCCESS_GREEN}
          style={{ fontWeight: "bold", textTransform: "uppercase" }}
        >
          Approved
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          style={{ fontWeight: "bold", color: SECONDARY_PURPLE }}
          onClick={() => setSelectedChecklist(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Divider style={{ margin: "12px 0" }}>
        ✅ Completed / Approved DCLs
      </Divider>

      <Table
        columns={columns}
        dataSource={completedChecklists}
        rowKey="_id"
        pagination={{ pageSize: 5, showSizeChanger: true }}
        onRow={(record) => ({
          onClick: () => setSelectedChecklist(record),
          style: { cursor: "pointer" },
        })}
      />

      {selectedChecklist && (
        <CheckerReviewChecklistModal
          checklist={selectedChecklist}
          open={!!selectedChecklist}
          onClose={() => {
            setSelectedChecklist(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default CompletedChecklists;
