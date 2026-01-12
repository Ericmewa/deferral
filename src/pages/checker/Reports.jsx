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
//   CheckCircleOutlined,
//   DownloadOutlined
// } from "@ant-design/icons";
// import dayjs from "dayjs";

// // Theme Colors
// const PRIMARY_BLUE = "#164679";
// const ACCENT_LIME = "#b5d334";
// const HIGHLIGHT_GOLD = "#fcb116";
// const LIGHT_YELLOW = "#fcd716";
// const SECONDARY_PURPLE = "#7e6496";
// const SUCCESS_GREEN = "#52c41a";
// const ERROR_RED = "#ff4d4f";
// const WARNING_ORANGE = "#faad14";

// const { Text } = Typography;

// // MOCK DATA for Checker Reports
// const MOCK_CHECKER_REPORTS = [
//   {
//     _id: "r1",
//     dclNo: "DCL-2024-001",
//     customerNumber: "CUST001",
//     customerName: "Alpha Enterprises Ltd",
//     loanType: "Business Loan",
//     title: "Business Expansion Loan",
//     approvedBy: { _id: "checker1", name: "Michael Chen", email: "michael.c@ncba.co.ke" },
//     checkerComments: "All documents properly verified and complete. Excellent work!",
//     status: "approved",
//     priority: "high",
//     completionDate: "2024-12-18T10:30:00Z",
//     createdAt: "2024-12-01T09:30:00Z",
//     updatedAt: "2024-12-18T10:30:00Z",
//     documents: [
//       {
//         category: "Business Registration",
//         docList: [
//           { 
//             _id: "doc1_1", 
//             name: "Certificate of Incorporation", 
//             status: "approved"
//           },
//           { 
//             _id: "doc1_2", 
//             name: "CR12 Certificate", 
//             status: "approved"
//           }
//         ]
//       }
//     ]
//   },
//   {
//     _id: "r2",
//     dclNo: "DCL-2024-002",
//     customerNumber: "CUST002",
//     customerName: "Beta Manufacturing Inc",
//     loanType: "Equipment Finance",
//     title: "Machinery Upgrade",
//     approvedBy: { _id: "checker2", name: "David Omondi", email: "david.o@ncba.co.ke" },
//     checkerComments: "Minor revisions required on invoice. Overall good work.",
//     status: "approved_with_revisions",
//     priority: "medium",
//     completionDate: "2024-12-17T14:15:00Z",
//     createdAt: "2024-12-03T14:15:00Z",
//     updatedAt: "2024-12-17T14:15:00Z",
//     documents: [
//       {
//         category: "Technical Documents",
//         docList: [
//           { 
//             _id: "doc2_1", 
//             name: "Equipment Quotations", 
//             status: "approved"
//           },
//           { 
//             _id: "doc2_2", 
//             name: "Technical Specifications", 
//             status: "approved"
//           }
//         ]
//       }
//     ]
//   },
//   {
//     _id: "r3",
//     dclNo: "DCL-2024-003",
//     customerNumber: "CUST003",
//     customerName: "Premium Motors Ltd",
//     loanType: "Asset Finance",
//     title: "Fleet Vehicle Purchase",
//     approvedBy: { _id: "checker1", name: "Michael Chen", email: "michael.c@ncba.co.ke" },
//     checkerComments: "Complete documentation. Ready for processing.",
//     status: "approved",
//     priority: "medium",
//     completionDate: "2024-12-18T09:20:00Z",
//     createdAt: "2024-12-05T11:15:00Z",
//     updatedAt: "2024-12-18T09:20:00Z",
//     documents: [
//       {
//         category: "Vehicle Documents",
//         docList: [
//           { 
//             _id: "doc3_1", 
//             name: "Proforma Invoice", 
//             status: "approved"
//           },
//           { 
//             _id: "doc3_2", 
//             name: "Logbook Copies", 
//             status: "approved"
//           },
//           { 
//             _id: "doc3_3", 
//             name: "Insurance Certificates", 
//             status: "approved"
//           }
//         ]
//       }
//     ]
//   },
//   {
//     _id: "r4",
//     dclNo: "DCL-2024-004",
//     customerNumber: "CUST004",
//     customerName: "Tech Solutions Ltd",
//     loanType: "Technology Loan",
//     title: "Software Development",
//     approvedBy: { _id: "checker2", name: "David Omondi", email: "david.o@ncba.co.ke" },
//     checkerComments: "Excellent documentation. No issues found.",
//     status: "approved",
//     priority: "low",
//     completionDate: "2024-12-19T11:45:00Z",
//     createdAt: "2024-12-06T10:00:00Z",
//     updatedAt: "2024-12-19T11:45:00Z",
//     documents: [
//       {
//         category: "Technical Documents",
//         docList: [
//           { 
//             _id: "doc4_1", 
//             name: "Project Proposal", 
//             status: "approved"
//           },
//           { 
//             _id: "doc4_2", 
//             name: "Budget Breakdown", 
//             status: "approved"
//           }
//         ]
//       }
//     ]
//   }
// ];

// const ReportsPage = ({ userId = "checker_current" }) => {
//   const [loading, setLoading] = useState(false);
//   const [mockData, setMockData] = useState([]);
  
//   // Filters
//   const [searchText, setSearchText] = useState("");

//   // Load data
//   useEffect(() => {
//     setLoading(true);
    
//     setTimeout(() => {
//       setMockData(MOCK_CHECKER_REPORTS);
//       setLoading(false);
//     }, 300);
//   }, []);

//   // Filter data
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
//       setMockData([...MOCK_CHECKER_REPORTS]);
//       setLoading(false);
//     }, 200);
//   };

//   const exportToCSV = () => {
//     const csvData = filteredData.map(item => ({
//       "DCL No": item.dclNo,
//       "Customer No": item.customerNumber,
//       "Customer Name": item.customerName,
//       "Loan Type": item.loanType,
//       "Checker": item.approvedBy?.name || "N/A",
//       "Documents": item.documents?.reduce((sum, cat) => sum + (cat.docList?.length || 0), 0) || 0,
//       "Completed Date": dayjs(item.completionDate).format('DD/MM/YYYY'),
//       "Status": item.status === "approved" ? "Approved" : 
//                 item.status === "approved_with_revisions" ? "Approved with Revisions" : item.status
//     }));

//     const headers = Object.keys(csvData[0]).join(",");
//     const rows = csvData.map(row => Object.values(row).join(","));
//     const csvContent = [headers, ...rows].join("\n");
    
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `checker_reports_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
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
//           <div style={{ textAlign: "center" }}>
//             <Tag 
//               color={LIGHT_YELLOW} 
//               style={{ 
//                 fontSize: 11, 
//                 borderRadius: 999, 
//                 fontWeight: "bold", 
//                 color: PRIMARY_BLUE, 
//                 border: `1px solid ${HIGHLIGHT_GOLD}`,
//                 minWidth: 28,
//                 textAlign: "center"
//               }}
//             >
//               {totalDocs}
//             </Tag>
//           </div>
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
//       width: 130,
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
//     .checker-reports-table .ant-table-wrapper { 
//       border-radius: 12px; 
//       overflow: hidden; 
//       box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08); 
//       border: 1px solid #e0e0e0; 
//     }
//     .checker-reports-table .ant-table-thead > tr > th { 
//       background-color: #f7f7f7 !important; 
//       color: ${PRIMARY_BLUE} !important; 
//       font-weight: 700; 
//       font-size: 13px; 
//       padding: 14px 12px !important; 
//       border-bottom: 3px solid ${SUCCESS_GREEN} !important; 
//       border-right: none !important; 
//     }
//     .checker-reports-table .ant-table-tbody > tr > td { 
//       border-bottom: 1px solid #f0f0f0 !important; 
//       border-right: none !important; 
//       padding: 12px 12px !important; 
//       font-size: 13px; 
//       color: #333; 
//     }
//     .checker-reports-table .ant-table-tbody > tr.ant-table-row:hover > td { 
//       background-color: rgba(82, 196, 26, 0.1) !important; 
//       cursor: pointer;
//     }
//     .checker-reports-table .ant-pagination .ant-pagination-item-active { 
//       background-color: ${SUCCESS_GREEN} !important; 
//       border-color: ${SUCCESS_GREEN} !important; 
//     }
//     .checker-reports-table .ant-pagination .ant-pagination-item-active a { 
//       color: ${PRIMARY_BLUE} !important; 
//       font-weight: 600; 
//     }
//   `;

//   return (
//     <div style={{ padding: 24 }}>
//       <style>{customTableStyles}</style>

//       {/* Header - Exact same format as creator side */}
//       <Card
//         style={{ 
//           marginBottom: 24,
//           borderRadius: 8,
//           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           borderLeft: `4px solid ${SUCCESS_GREEN}`
//         }}
//         bodyStyle={{ padding: 16 }}
//       >
//         <Row justify="space-between" align="middle">
//           <Col>
//             <h2 style={{ margin: 0, color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 12 }}>
//               Checker Reports
//               <Badge 
//                 count={filteredData.length} 
//                 style={{ 
//                   backgroundColor: SUCCESS_GREEN,
//                   fontSize: 12
//                 }}
//               />
//             </h2>
//             <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
//               Reports on all checked DCLs
//             </p>
//           </Col>
          
//           <Col>
//             <Button 
//               icon={<DownloadOutlined />} 
//               onClick={exportToCSV}
//               style={{ 
//                 background: SUCCESS_GREEN,
//                 borderColor: SUCCESS_GREEN,
//                 color: "white",
//                 fontWeight: "bold"
//               }}
//               disabled={filteredData.length === 0}
//             >
//               Export Report
//             </Button>
//           </Col>
//         </Row>
//       </Card>

//       {/* Filters - Exact same format as creator side */}
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
//           Checked DCL Reports ({filteredData.length} items)
//         </span>
//       </Divider>

//       {/* Table */}
//       {loading ? (
//         <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
//           <Spin tip="Loading reports..." />
//         </div>
//       ) : filteredData.length === 0 ? (
//         <Empty 
//           description={
//             <div>
//               <p style={{ fontSize: 16, marginBottom: 8 }}>No reports found</p>
//               <p style={{ color: "#999" }}>
//                 {searchText 
//                   ? 'Try changing your search term' 
//                   : 'No reports available yet'}
//               </p>
//             </div>
//           } 
//           style={{ padding: 40 }} 
//         />
//       ) : (
//         <div className="checker-reports-table">
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
//               showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reports`
//             }}
//             scroll={{ x: 1000 }}
//           />
//         </div>
//       )}

//       {/* Footer Info - Exact same format as creator side */}
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
//     </div>
//   );
// };

// export default ReportsPage;


// src/pages/Reports.jsx
import React, { useState, useMemo } from "react";
import { 
  Tabs,
  Table,
  Button,
  Divider,
  Tag,
  Spin,
  Empty,
  Card,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Badge,
  Tooltip,
  Space,
  Typography
} from "antd";
import { 
  SearchOutlined, 
  DownloadOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

// Theme Colors (matching Deferrals component)
const PRIMARY_BLUE = "#164679";
const ACCENT_LIME = "#b5d334";
const HIGHLIGHT_GOLD = "#fcb116";
const LIGHT_YELLOW = "#fcd716";
const SECONDARY_PURPLE = "#7e6496";
const SUCCESS_GREEN = "#52c41a";
const ERROR_RED = "#ff4d4f";
const WARNING_ORANGE = "#faad14";
const INFO_BLUE = "#1890ff";

// Mock Data
const MOCK_DCLS = [
  {
    id: "DCL-10001",
    dclNo: "DCL-2024-10001",
    customerNumber: "458921",
    customerName: "Tech Innovations Ltd",
    documentName: "Business Registration Certificate",
    workstep: "WS-001",
    product: "Personal Loan",
    status: "Completed",
    completedDate: "2025-11-20",
    loanAmount: "KES 500,000",
    assignedRM: { name: "Sarah Johnson" },
    deferralStatus: "None",
    expiryDate: "2025-12-31",
    daysRemaining: 25
  },
  {
    id: "DCL-10002",
    dclNo: "DCL-2024-10002",
    customerNumber: "772194",
    customerName: "Jane Smith Ltd",
    documentName: "Latest Bank Statements",
    workstep: "WS-002",
    product: "Home Loan",
    status: "Active",
    completedDate: null,
    loanAmount: "KES 8,000,000",
    assignedRM: { name: "Michael Brown" },
    deferralStatus: "None",
    expiryDate: "2025-12-15",
    daysRemaining: 10
  },
  {
    id: "DCL-10003",
    dclNo: "DCL-2024-10003",
    customerNumber: "993015",
    customerName: "Robert Kamau Enterprises",
    documentName: "Tax Compliance Certificate",
    workstep: "WS-003",
    product: "Credit Card",
    status: "Deferred",
    completedDate: "2025-11-25",
    loanAmount: "KES 1,000,000",
    assignedRM: { name: "Alice Williams" },
    deferralStatus: "Approved",
    expiryDate: "2025-12-10",
    daysRemaining: 5
  },
  {
    id: "DCL-10004",
    dclNo: "DCL-2024-10004",
    customerNumber: "551002",
    customerName: "Green Farms Co-op",
    documentName: "Audited Financial Statements",
    workstep: "WS-004",
    product: "Car Loan",
    status: "Completed",
    completedDate: "2025-11-22",
    loanAmount: "KES 3,500,000",
    assignedRM: { name: "David Miller" },
    deferralStatus: "None",
    expiryDate: "2025-12-25",
    daysRemaining: 30
  },
  {
    id: "DCL-10005",
    dclNo: "DCL-2024-10005",
    customerNumber: "663018",
    customerName: "Tech Solutions Ltd",
    documentName: "Bank Statements",
    workstep: "WS-005",
    product: "Business Loan",
    status: "Active",
    completedDate: null,
    loanAmount: "KES 12,000,000",
    assignedRM: { name: "John Doe" },
    deferralStatus: "Rejected",
    expiryDate: "2025-12-05",
    daysRemaining: -2
  },
  {
    id: "DCL-10006",
    dclNo: "DCL-2024-10006",
    customerNumber: "774029",
    customerName: "Smart Investments",
    documentName: "Audited Financial Statements",
    workstep: "WS-006",
    product: "Investment Loan",
    status: "Completed",
    completedDate: "2025-11-18",
    loanAmount: "KES 6,000,000",
    assignedRM: { name: "Jane Smith" },
    deferralStatus: "Approved",
    expiryDate: "2025-12-15",
    daysRemaining: 12
  },
];

const MOCK_DEFERRALS = [
  // Post-approval deferrals (Approved by creator)
  {
    id: "DEF-001",
    dclNo: "DCL-2024-10003",
    customerNumber: "993015",
    customerName: "Robert Kamau Enterprises",
    document: "Credit Report",
    reason: "Client traveling abroad, will provide document upon return",
    expiryDate: "2025-12-10",
    creatorComments: "Approved with condition to submit within 5 days of return",
    status: "Approved",
    decisionDate: "2025-11-25",
    decisionBy: "John Creator",
    loanAmount: "KES 1,000,000",
    product: "Credit Card",
    dateRequested: "2025-11-24",
    assignedRM: { name: "Alice Williams" },
    priority: "medium",
    daysRemaining: 5
  },
  {
    id: "DEF-002",
    dclNo: "DCL-2024-10006",
    customerNumber: "774029",
    customerName: "Smart Investments",
    document: "Audited Financial Statements",
    reason: "Auditor unavailable due to medical leave, will provide next week",
    expiryDate: "2025-12-15",
    creatorComments: "Approved - auditor medical situation verified",
    status: "Approved",
    decisionDate: "2025-11-19",
    decisionBy: "Jane Approver",
    loanAmount: "KES 6,000,000",
    product: "Investment Loan",
    dateRequested: "2025-11-18",
    assignedRM: { name: "Jane Smith" },
    priority: "low",
    daysRemaining: 12
  },

  // Rejected deferrals (Rejected by creator)
  {
    id: "DEF-004",
    dclNo: "DCL-2024-10005",
    customerNumber: "663018",
    customerName: "Tech Solutions Ltd",
    document: "Bank Statements",
    reason: "Could not access online banking due to password issues",
    expiryDate: "2025-12-05",
    creatorComments: "Client should visit bank branch to reset credentials",
    status: "Rejected",
    decisionDate: "2025-11-26",
    decisionBy: "Mary Reviewer",
    loanAmount: "KES 12,000,000",
    product: "Business Loan",
    dateRequested: "2025-11-25",
    assignedRM: { name: "John Doe" },
    priority: "high",
    daysRemaining: -2
  },
  {
    id: "DEF-005",
    dclNo: "DCL-2024-10008",
    customerNumber: "996023",
    customerName: "Quick Retail Ltd",
    document: "Tax Compliance Certificate",
    reason: "KRA portal maintenance, cannot download certificate",
    expiryDate: "2025-12-12",
    creatorComments: "RM should have advised client to visit KRA office",
    status: "Rejected",
    decisionDate: "2025-11-29",
    decisionBy: "John Creator",
    loanAmount: "KES 2,500,000",
    product: "Overdraft Facility",
    dateRequested: "2025-11-28",
    assignedRM: { name: "Sarah Williams" },
    priority: "medium",
    daysRemaining: 9
  },
];

export default function Reports() {
  // Shared filters
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("postApproval");
  const [loading, setLoading] = useState(false);

  // Filter functions
  const filteredPostApprovalDeferrals = useMemo(() => {
    return MOCK_DEFERRALS.filter(
      (d) =>
        d.status === "Approved" &&
        (searchText === "" ||
          d.customerNumber.includes(searchText) ||
          d.dclNo.includes(searchText) ||
          d.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          d.document.toLowerCase().includes(searchText.toLowerCase())) &&
        (!dateRange ||
          (d.decisionDate &&
            dayjs(d.decisionDate).isBetween(
              dateRange[0],
              dateRange[1],
              "day",
              "[]"
            )))
    );
  }, [searchText, dateRange]);

  const filteredRejectedDeferrals = useMemo(() => {
    return MOCK_DEFERRALS.filter(
      (d) =>
        d.status === "Rejected" &&
        (searchText === "" ||
          d.customerNumber.includes(searchText) ||
          d.dclNo.includes(searchText) ||
          d.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          d.document.toLowerCase().includes(searchText.toLowerCase())) &&
        (!dateRange ||
          (d.decisionDate &&
            dayjs(d.decisionDate).isBetween(
              dateRange[0],
              dateRange[1],
              "day",
              "[]"
            )))
    );
  }, [searchText, dateRange]);

  const filteredAllDCLs = useMemo(() => {
    return MOCK_DCLS.filter(
      (d) =>
        (statusFilter === "All" || d.status === statusFilter) &&
        (searchText === "" ||
          d.customerNumber.includes(searchText) ||
          d.dclNo.includes(searchText) ||
          d.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          d.documentName.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [statusFilter, searchText]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchText("");
    setDateRange(null);
    setStatusFilter("All");
  };

  // Get current tab data count
  const getCurrentDataCount = () => {
    switch (activeTab) {
      case "postApproval":
        return filteredPostApprovalDeferrals.length;
      case "rejected":
        return filteredRejectedDeferrals.length;
      case "allDCLs":
        return filteredAllDCLs.length;
      default:
        return 0;
    }
  };

  // Export functionality
  const exportReport = () => {
    let data = [];
    let filename = "";
    
    if (activeTab === "postApproval") {
      data = filteredPostApprovalDeferrals;
      filename = `post_approval_deferrals_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    } else if (activeTab === "rejected") {
      data = filteredRejectedDeferrals;
      filename = `rejected_deferrals_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    } else {
      data = filteredAllDCLs;
      filename = `all_dcls_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter component (matching Deferrals component style)
  const renderFilters = () => (
    <Card 
      style={{ 
        marginBottom: 16,
        background: "#fafafa",
        border: `1px solid ${PRIMARY_BLUE}20`
      }}
      size="small"
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Search by DCL No, Customer No, or Name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        
        {activeTab !== "allDCLs" && (
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="DD/MM/YYYY"
            />
          </Col>
        )}
        
        {activeTab === "allDCLs" && (
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              allowClear
            >
              <Option value="All">All Statuses</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Active">Active</Option>
              <Option value="Deferred">Deferred</Option>
            </Select>
          </Col>
        )}
        
        <Col xs={24} sm={12} md={activeTab === "allDCLs" ? 2 : 2}>
          <Button 
            onClick={clearAllFilters}
            style={{ width: '100%' }}
          >
            Clear
          </Button>
        </Col>
      </Row>
    </Card>
  );

  // Common columns for Post-approval and Rejected Deferrals
  const commonDeferralColumns = [
    { 
      title: "DCL No", 
      dataIndex: "dclNo", 
      width: 150,
      render: (text) => (
        <div style={{ fontWeight: "bold", color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 8 }}>
          <FileTextOutlined style={{ color: SECONDARY_PURPLE }} />
          {text}
        </div>
      )
    },
    { 
      title: "Customer No", 
      dataIndex: "customerNumber", 
      width: 120,
      render: (text) => (
        <div style={{ color: SECONDARY_PURPLE, fontWeight: 500, fontSize: 13 }}>
          {text}
        </div>
      )
    },
    { 
      title: "Customer Name", 
      dataIndex: "customerName", 
      width: 180,
      render: (text) => (
        <div style={{ fontWeight: 600, color: PRIMARY_BLUE }}>
          {text}
        </div>
      )
    },
    { 
      title: "Document", 
      dataIndex: "document", 
      width: 160,
      render: (text) => (
        <div style={{ fontWeight: 500, color: PRIMARY_BLUE }}>
          {text}
        </div>
      )
    },
    { 
      title: "RM", 
      dataIndex: "assignedRM", 
      width: 130,
      render: (rm) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <UserOutlined style={{ color: PRIMARY_BLUE, fontSize: 12 }} />
          <span style={{ color: PRIMARY_BLUE, fontWeight: 500, fontSize: 13 }}>{rm?.name || "N/A"}</span>
        </div>
      )
    },
    { 
      title: "Reason", 
      dataIndex: "reason", 
      width: 200,
      render: (text) => (
        <div style={{ 
          fontStyle: "italic", 
          fontSize: 12, 
          color: "#666",
          lineHeight: 1.4
        }}>
          {text}
        </div>
      )
    },
    { 
      title: "Expiry Date", 
      dataIndex: "expiryDate", 
      width: 130,
      render: (date, record) => {
        const expiryDate = dayjs(record.expiryDate);
        const now = dayjs();
        const daysRemaining = expiryDate.diff(now, 'day');
        const isExpired = daysRemaining < 0;
        const isExpiringSoon = daysRemaining <= 3 && daysRemaining >= 0;

        let statusColor = SUCCESS_GREEN;
        let statusIcon = <ClockCircleOutlined />;
        let statusText = `${daysRemaining}d left`;

        if (isExpired) {
          statusColor = ERROR_RED;
          statusIcon = <ExclamationCircleOutlined />;
          statusText = `Expired`;
        } else if (isExpiringSoon) {
          statusColor = WARNING_ORANGE;
          statusIcon = <WarningOutlined />;
          statusText = `${daysRemaining}d left`;
        }

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {React.cloneElement(statusIcon, { style: { color: statusColor, fontSize: 14 } })}
            <span style={{ fontWeight: "bold", color: statusColor, fontSize: 12 }}>
              {dayjs(record.expiryDate).format("DD/MM/YYYY")}
            </span>
          </div>
        );
      }
    },
    { 
      title: "Creator Comment", 
      dataIndex: "creatorComments", 
      width: 200,
      render: (text) => (
        <div style={{ 
          fontSize: 12, 
          color: "#333",
          lineHeight: 1.4,
          backgroundColor: "#f8f9fa",
          padding: "8px",
          borderRadius: "4px"
        }}>
          {text}
        </div>
      )
    },
    { 
      title: "Decision Date", 
      dataIndex: "decisionDate", 
      width: 120,
      render: (date) => (
        <div style={{ fontWeight: 500, color: PRIMARY_BLUE }}>
          {date ? dayjs(date).format("DD/MM/YYYY") : "-"}
        </div>
      )
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      width: 130,
      fixed: "right",
      render: (status) => (
        <div style={{ minWidth: 100 }}>
          <Tag 
            color={status === "Approved" ? SUCCESS_GREEN : ERROR_RED}
            style={{ 
              fontWeight: "bold",
              fontSize: 12,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "100%",
              justifyContent: "center",
              minWidth: 90
            }}
            icon={status === "Approved" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          >
            {status}
          </Tag>
        </div>
      )
    }
  ];

  // All DCLs columns
  const allDCLColumns = [
    { 
      title: "DCL No", 
      dataIndex: "dclNo", 
      width: 180, 
      render: (text) => (
        <div style={{ fontWeight: "bold", color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 8 }}>
          <FileTextOutlined style={{ color: SECONDARY_PURPLE }} />
          {text}
        </div>
      )
    },
    { 
      title: "Customer No", 
      dataIndex: "customerNumber", 
      width: 150, 
      render: (text) => (
        <div style={{ color: SECONDARY_PURPLE, fontWeight: 500, fontSize: 13 }}>
          {text}
        </div>
      )
    },
    { 
      title: "Customer Name", 
      dataIndex: "customerName", 
      width: 200, 
      render: (text, record) => (
        <div>
          <div style={{ 
            fontWeight: 600, 
            color: PRIMARY_BLUE,
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2
          }}>
            <CustomerServiceOutlined style={{ fontSize: 12 }} />
            {text}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {record.product}
          </div>
        </div>
      )
    },
    { 
      title: "Document", 
      dataIndex: "documentName", 
      width: 200, 
      render: (text) => (
        <div>
          <div style={{ fontWeight: 600, color: PRIMARY_BLUE }}>
            {text}
          </div>
        </div>
      )
    },
    { 
      title: "RM", 
      dataIndex: "assignedRM", 
      width: 120, 
      render: (rm) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <UserOutlined style={{ color: PRIMARY_BLUE, fontSize: 12 }} />
          <span style={{ color: PRIMARY_BLUE, fontWeight: 500, fontSize: 13 }}>{rm?.name || "N/A"}</span>
        </div>
      )
    },
    { 
      title: "Timeline", 
      key: "timeline",
      width: 130,
      render: (_, record) => {
        const expiryDate = dayjs(record.expiryDate);
        const now = dayjs();
        const daysRemaining = expiryDate.diff(now, 'day');
        const isExpired = daysRemaining < 0;
        const isExpiringSoon = daysRemaining <= 3 && daysRemaining >= 0;

        let statusColor = SUCCESS_GREEN;
        let statusIcon = <ClockCircleOutlined />;
        let statusText = `${daysRemaining}d left`;

        if (isExpired) {
          statusColor = ERROR_RED;
          statusIcon = <ExclamationCircleOutlined />;
          statusText = `Expired`;
        } else if (isExpiringSoon) {
          statusColor = WARNING_ORANGE;
          statusIcon = <WarningOutlined />;
          statusText = `${daysRemaining}d left`;
        }

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {React.cloneElement(statusIcon, { style: { color: statusColor, fontSize: 14 } })}
            <span style={{ color: statusColor, fontWeight: "bold", fontSize: 12 }}>
              {statusText}
            </span>
          </div>
        );
      }
    },
    { 
      title: "# Docs", 
      dataIndex: "documents", 
      width: 80, 
      align: "center", 
      render: (docs) => (
        <Tag 
          color={LIGHT_YELLOW} 
          style={{ 
            fontSize: 12, 
            borderRadius: 999, 
            fontWeight: "bold", 
            color: PRIMARY_BLUE, 
            border: `1px solid ${HIGHLIGHT_GOLD}`,
            minWidth: 32,
            textAlign: "center"
          }}
        >
          {Array.isArray(docs) ? docs.length : 0}
        </Tag>
      ) 
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      width: 120, 
      render: (status) => {
        const statusColor = status === "Completed" ? SUCCESS_GREEN :
                           status === "Active" ? INFO_BLUE :
                           status === "Deferred" ? WARNING_ORANGE : "default";
        
        return (
          <Tag 
            color={statusColor}
            style={{ 
              fontSize: 11, 
              borderRadius: 999, 
              fontWeight: "bold", 
              padding: "2px 8px"
            }}
          >
            {status}
          </Tag>
        );
      }
    },
    { 
      title: "Deferral Status", 
      dataIndex: "deferralStatus", 
      width: 140, 
      render: (status) => {
        if (status === "None") return <Tag>No Deferral</Tag>;
        if (status === "Approved") return (
          <Tag color="green" style={{ fontWeight: "bold" }}>
            Deferral Approved
          </Tag>
        );
        if (status === "Rejected") return (
          <Tag color="red" style={{ fontWeight: "bold" }}>
            Deferral Rejected
          </Tag>
        );
        return <Tag>{status}</Tag>;
      }
    }
  ];

  // Custom table styles (matching Deferrals component)
  const customTableStyles = `
    .reports-table .ant-table-wrapper { 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08); 
      border: 1px solid #e0e0e0; 
    }
    .reports-table .ant-table-thead > tr > th { 
      background-color: #f7f7f7 !important; 
      color: ${PRIMARY_BLUE} !important; 
      font-weight: 700; 
      font-size: 15px; 
      padding: 16px 16px !important; 
      border-bottom: 3px solid ${ACCENT_LIME} !important; 
      border-right: none !important; 
    }
    .reports-table .ant-table-tbody > tr > td { 
      border-bottom: 1px solid #f0f0f0 !important; 
      border-right: none !important; 
      padding: 14px 16px !important; 
      font-size: 14px; 
      color: #333; 
    }
    .reports-table .ant-table-tbody > tr.ant-table-row:hover > td { 
      background-color: rgba(181, 211, 52, 0.1) !important; 
    }
    .reports-table .ant-table-bordered .ant-table-container, 
    .reports-table .ant-table-bordered .ant-table-tbody > tr > td, 
    .reports-table .ant-table-bordered .ant-table-thead > tr > th { 
      border: none !important; 
    }
    .reports-table .ant-pagination .ant-pagination-item-active { 
      background-color: ${ACCENT_LIME} !important; 
      border-color: ${ACCENT_LIME} !important; 
    }
    .reports-table .ant-pagination .ant-pagination-item-active a { 
      color: ${PRIMARY_BLUE} !important; 
      font-weight: 600; 
    }
    .reports-table .ant-pagination .ant-pagination-item:hover { 
      border-color: ${ACCENT_LIME} !important; 
    }
    .reports-table .ant-pagination .ant-pagination-prev:hover .ant-pagination-item-link, 
    .reports-table .ant-pagination .ant-pagination-next:hover .ant-pagination-item-link { 
      color: ${ACCENT_LIME} !important; 
    }
    .reports-table .ant-pagination .ant-pagination-options .ant-select-selector { 
      border-radius: 8px !important; 
    }
  `;

  // Get current data for active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "postApproval":
        return filteredPostApprovalDeferrals;
      case "rejected":
        return filteredRejectedDeferrals;
      case "allDCLs":
        return filteredAllDCLs;
      default:
        return [];
    }
  };

  // Get current columns for active tab
  const getCurrentColumns = () => {
    switch (activeTab) {
      case "postApproval":
      case "rejected":
        return commonDeferralColumns;
      case "allDCLs":
        return allDCLColumns;
      default:
        return [];
    }
  };

  // Get tab title
  const getTabTitle = () => {
    switch (activeTab) {
      case "postApproval":
        return "Post-approval Deferrals";
      case "rejected":
        return "Rejected Deferrals";
      case "allDCLs":
        return "All DCLs";
      default:
        return "";
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <style>{customTableStyles}</style>

      {/* Header - Matching Deferrals component style */}
      <Card
        style={{ 
          marginBottom: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderLeft: `4px solid ${ACCENT_LIME}`
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0, color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 12 }}>
              DCL Reports & Analytics
              <Badge 
                count={getCurrentDataCount()} 
                style={{ 
                  backgroundColor: ACCENT_LIME,
                  fontSize: 12
                }}
              />
            </h2>
            <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
              Comprehensive reports on deferrals and DCL statuses
            </p>
          </Col>
          
          <Col>
            <Space>
              <Tooltip title="Export Report">
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={exportReport}
                  disabled={getCurrentDataCount() === 0}
                >
                  Export Report
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filters - Matching Deferrals component style */}
      {renderFilters()}

      {/* Tabs - Matching Deferrals component style */}
      <Tabs 
        activeKey={activeTab} 
        onChange={(key) => {
          setActiveTab(key);
          clearAllFilters();
        }}
        type="card"
        size="large"
        style={{ marginBottom: 16 }}
      >
        <TabPane 
          tab={
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircleOutlined />
              Post-approval Deferrals
            </span>
          } 
          key="postApproval"
        />
        <TabPane 
          tab={
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CloseCircleOutlined />
              Rejected Deferrals
            </span>
          } 
          key="rejected"
        />
        <TabPane 
          tab={
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileTextOutlined />
              All DCLs
            </span>
          } 
          key="allDCLs"
        />
      </Tabs>

      {/* Table Title - Matching Deferrals component style */}
      <Divider style={{ margin: "12px 0" }}>
        <span style={{ color: PRIMARY_BLUE, fontSize: 16, fontWeight: 600 }}>
          {getTabTitle()} ({getCurrentDataCount()} items)
        </span>
      </Divider>

      {/* Table - Matching Deferrals component style */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
          <Spin tip="Loading reports..." />
        </div>
      ) : getCurrentDataCount() === 0 ? (
        <Empty 
          description={
            <div>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No data found</p>
              <p style={{ color: "#999" }}>
                {searchText || dateRange || statusFilter !== "All" 
                  ? 'Try changing your filters' 
                  : 'No data available'}
              </p>
            </div>
          } 
          style={{ padding: 40 }} 
        />
      ) : (
        <div className="reports-table">
          <Table 
            columns={getCurrentColumns()} 
            dataSource={getCurrentData()} 
            rowKey="id" 
            size="large" 
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: true, 
              pageSizeOptions: ["10", "20", "50"], 
              position: ["bottomCenter"],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }} 
            rowClassName={(record, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-50")}
            scroll={{ x: 1400 }}
          />
        </div>
      )}

      {/* Footer Info */}
      <div style={{ 
        marginTop: 24, 
        padding: 16, 
        background: "#f8f9fa", 
        borderRadius: 4,
        fontSize: 12,
        color: "#666"
      }}>
        <Row justify="space-between" align="middle">
          <Col>
            Report generated on: {dayjs().format('DD/MM/YYYY HH:mm:ss')}
          </Col>
          <Col>
            <Text type="secondary">
              Showing data as of latest system update
            </Text>
          </Col>
        </Row>
      </div>
    </div>
  );
}