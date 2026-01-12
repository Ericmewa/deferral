// // // import React, { useMemo, useState, useEffect } from "react";
// // // import {
// // //   Button,
// // //   Divider,
// // //   Table,
// // //   Tag,
// // //   Spin,
// // //   Empty,
// // //   Tabs,
// // //   Card,
// // //   Row,
// // //   Col,
// // //   Input,
// // //   DatePicker,
// // //   Badge,
// // //   Typography
// // // } from "antd";
// // // import {
// // //   SearchOutlined,
// // //   FileTextOutlined,
// // //   UserOutlined,
// // //   CustomerServiceOutlined
// // // } from "@ant-design/icons";
// // // import CreatorQueueChecklistModal from "../../components/modals/CreatorQueueChecklistModal";
// // // import dayjs from "dayjs";

// // // // Theme Colors
// // // const PRIMARY_BLUE = "#164679";
// // // const ACCENT_LIME = "#b5d334";
// // // const HIGHLIGHT_GOLD = "#fcb116";
// // // const LIGHT_YELLOW = "#fcd716";
// // // const SECONDARY_PURPLE = "#7e6496";
// // // const SUCCESS_GREEN = "#52c41a";
// // // const ERROR_RED = "#ff4d4f";
// // // const WARNING_ORANGE = "#faad14";
// // // const INFO_BLUE = "#1890ff";

// // // const { RangePicker } = DatePicker;
// // // const { Text } = Typography;
// // // const { TabPane } = Tabs;

// // // // MOCK DATA
// // // const MOCK_CHECKLISTS = [
// // //   {
// // //     _id: "1",
// // //     dclNo: "DCL-2024-001",
// // //     customerNumber: "CUST001",
// // //     customerName: "Alpha Enterprises Ltd",
// // //     loanType: "Business Loan",
// // //     title: "Business Expansion Loan",
// // //     assignedToRM: { _id: "rm1", name: "John Kamau", email: "john.kamau@ncba.co.ke" },
// // //     assignedToCoChecker: { _id: "current_user", name: "Creator User" },
// // //     createdBy: { _id: "creator1", name: "Sarah Wangui", email: "sarah.w@ncba.co.ke" },
// // //     status: "pending_creator_review",
// // //     priority: "high",
// // //     slaExpiry: "2024-12-20T23:59:59Z",
// // //     submittedToCreatorAt: "2024-12-16T14:20:00Z",
// // //     rmGeneralComment: "All documents uploaded as requested. Customer awaiting approval.",
// // //     checkerComments: "",
// // //     createdAt: "2024-12-01T09:30:00Z",
// // //     updatedAt: "2024-12-15T14:20:00Z",
// // //     expiryDate: "2024-12-20T23:59:59Z",
// // //     documents: [
// // //       {
// // //         category: "Business Registration",
// // //         docList: [
// // //           {
// // //             _id: "doc1_1",
// // //             name: "Certificate of Incorporation",
// // //             status: "uploaded",
// // //             fileUrl: "https://example.com/doc1.pdf",
// // //             rmComment: "Uploaded certified copy",
// // //             uploadedAt: "2024-12-15T14:15:00Z"
// // //           },
// // //           {
// // //             _id: "doc1_2",
// // //             name: "Business Permit",
// // //             status: "uploaded",
// // //             fileUrl: "https://example.com/doc2.pdf",
// // //             rmComment: "Valid until Dec 2025",
// // //             uploadedAt: "2024-12-15T14:18:00Z"
// // //           }
// // //         ]
// // //       }
// // //     ]
// // //   },
// // //   {
// // //     _id: "2",
// // //     dclNo: "DCL-2024-003",
// // //     customerNumber: "CUST003",
// // //     customerName: "Premium Motors Ltd",
// // //     loanType: "Asset Finance",
// // //     title: "Fleet Vehicle Purchase",
// // //     assignedToRM: { _id: "rm2", name: "Jane Akinyi", email: "jane.a@ncba.co.ke" },
// // //     assignedToCoChecker: { _id: "current_user", name: "Creator User" },
// // //     createdBy: { _id: "creator2", name: "David Omondi", email: "david.o@ncba.co.ke" },
// // //     status: "pending_creator_review",
// // //     priority: "medium",
// // //     slaExpiry: "2024-12-22T23:59:59Z",
// // //     submittedToCreatorAt: "2024-12-16T10:45:00Z",
// // //     rmGeneralComment: "Vehicle quotations attached. Customer ready to proceed.",
// // //     checkerComments: "",
// // //     createdAt: "2024-12-05T11:15:00Z",
// // //     updatedAt: "2024-12-16T10:45:00Z",
// // //     expiryDate: "2024-12-22T23:59:59Z",
// // //     documents: [
// // //       {
// // //         category: "Vehicle Documents",
// // //         docList: [
// // //           {
// // //             _id: "doc3_1",
// // //             name: "Proforma Invoice",
// // //             status: "uploaded",
// // //             fileUrl: "https://example.com/doc4.pdf",
// // //             rmComment: "From Toyota Kenya",
// // //             uploadedAt: "2024-12-16T10:30:00Z"
// // //           }
// // //         ]
// // //       }
// // //     ]
// // //   },
// // //   {
// // //     _id: "3",
// // //     dclNo: "DCL-2024-002",
// // //     customerNumber: "CUST002",
// // //     customerName: "Greenfield Developers",
// // //     loanType: "Mortgage",
// // //     title: "Residential Mortgage",
// // //     assignedToRM: { _id: "rm1", name: "John Kamau", email: "john.kamau@ncba.co.ke" },
// // //     assignedToCoChecker: { _id: "current_user", name: "Creator User" },
// // //     assignedToChecker: { _id: "checker1", name: "Michael Chengo", email: "michael.c@ncba.co.ke" },
// // //     createdBy: { _id: "creator1", name: "Sarah Wangui", email: "sarah.w@ncba.co.ke" },
// // //     status: "returned_by_checker",
// // //     priority: "high",
// // //     slaExpiry: "2024-12-25T23:59:59Z",
// // //     submittedToCreatorAt: "2024-12-16T16:30:00Z",
// // //     rmGeneralComment: "All property documents provided",
// // //     checkerComments: "Missing valuation report for the property.",
// // //     returnedBy: { _id: "checker1", name: "Michael Chengo" },
// // //     returnedAt: "2024-12-16T16:30:00Z",
// // //     createdAt: "2024-12-02T14:20:00Z",
// // //     updatedAt: "2024-12-16T16:30:00Z",
// // //     expiryDate: "2024-12-25T23:59:59Z",
// // //     documents: [
// // //       {
// // //         category: "Property Documents",
// // //         docList: [
// // //           {
// // //             _id: "doc5_1",
// // //             name: "Title Deed",
// // //             status: "approved",
// // //             fileUrl: "https://example.com/doc8.pdf",
// // //             rmComment: "Original scanned",
// // //             checkerComment: "",
// // //             uploadedAt: "2024-12-10T11:20:00Z"
// // //           }
// // //         ]
// // //       }
// // //     ]
// // //   }
// // // ];

// // // const Myqueue = ({ userId = "current_user" }) => {
// // //   const [selectedChecklist, setSelectedChecklist] = useState(null);
// // //   const [activeTab, setActiveTab] = useState("current");
// // //   const [loading, setLoading] = useState(false);
// // //   const [mockData, setMockData] = useState([]);

// // //   // Filters
// // //   const [searchText, setSearchText] = useState("");
// // //   const [dateRange, setDateRange] = useState(null);

// // //   // Load data
// // //   useEffect(() => {
// // //     setLoading(true);

// // //     setTimeout(() => {
// // //       const userChecklists = MOCK_CHECKLISTS.filter((c) => {
// // //         const isAssigned =
// // //           c.assignedToCoChecker?._id === userId ||
// // //           c.assignedToCoChecker === userId ||
// // //           c.createdBy?._id === userId ||
// // //           c.createdBy === userId;

// // //         return isAssigned;
// // //       });

// // //       setMockData(userChecklists);
// // //       setLoading(false);
// // //     }, 300);
// // //   }, [userId]);

// // //   // Filter data
// // //   const filteredCurrentQueue = useMemo(() => {
// // //     let filtered = mockData.filter((c) => c.status === "pending_creator_review");

// // //     // Apply search filter
// // //     if (searchText) {
// // //       filtered = filtered.filter(c =>
// // //         c.dclNo.toLowerCase().includes(searchText.toLowerCase()) ||
// // //         c.customerNumber.toLowerCase().includes(searchText.toLowerCase()) ||
// // //         c.customerName.toLowerCase().includes(searchText.toLowerCase())
// // //       );
// // //     }

// // //     // Apply date range filter
// // //     if (dateRange && dateRange[0] && dateRange[1]) {
// // //       filtered = filtered.filter(c => {
// // //         const createdDate = dayjs(c.createdAt);
// // //         return createdDate.isAfter(dateRange[0]) && createdDate.isBefore(dateRange[1]);
// // //       });
// // //     }

// // //     return filtered;
// // //   }, [mockData, searchText, dateRange]);

// // //   const filteredPreviousQueue = useMemo(() => {
// // //     let filtered = mockData.filter((c) => c.status === "returned_by_checker");

// // //     // Apply search filter
// // //     if (searchText) {
// // //       filtered = filtered.filter(c =>
// // //         c.dclNo.toLowerCase().includes(searchText.toLowerCase()) ||
// // //         c.customerNumber.toLowerCase().includes(searchText.toLowerCase()) ||
// // //         c.customerName.toLowerCase().includes(searchText.toLowerCase())
// // //       );
// // //     }

// // //     // Apply date range filter
// // //     if (dateRange && dateRange[0] && dateRange[1]) {
// // //       filtered = filtered.filter(c => {
// // //         const createdDate = dayjs(c.createdAt);
// // //         return createdDate.isAfter(dateRange[0]) && createdDate.isBefore(dateRange[1]);
// // //       });
// // //     }

// // //     return filtered;
// // //   }, [mockData, searchText, dateRange]);

// // //   // Get current data count
// // //   const getCurrentDataCount = () => {
// // //     return activeTab === "current" ? filteredCurrentQueue.length : filteredPreviousQueue.length;
// // //   };

// // //   // Clear filters
// // //   const clearFilters = () => {
// // //     setSearchText("");
// // //     setDateRange(null);
// // //   };

// // //   // Refetch function
// // //   const refetch = () => {
// // //     setLoading(true);
// // //     setTimeout(() => {
// // //       setMockData([...MOCK_CHECKLISTS]);
// // //       setLoading(false);
// // //     }, 200);
// // //   };

// // //   // Common columns matching your specified order: DCL No, Customer No, Customer Name, Loan Type, RM, Docs, Submitted, SLA, Status
// // //   const getColumns = (isCurrentTab) => [
// // //     {
// // //       title: "DCL No",
// // //       dataIndex: "dclNo",
// // //       width: 140,
// // //       render: (text) => (
// // //         <div style={{ fontWeight: "bold", color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 8 }}>
// // //           <FileTextOutlined style={{ color: SECONDARY_PURPLE }} />
// // //           {text}
// // //         </div>
// // //       )
// // //     },
// // //     {
// // //       title: "Customer No",
// // //       dataIndex: "customerNumber",
// // //       width: 110,
// // //       render: (text) => (
// // //         <div style={{ color: SECONDARY_PURPLE, fontWeight: 500, fontSize: 13 }}>
// // //           {text}
// // //         </div>
// // //       )
// // //     },
// // //     {
// // //       title: "Customer Name",
// // //       dataIndex: "customerName",
// // //       width: 160,
// // //       render: (text) => (
// // //         <div style={{
// // //           fontWeight: 600,
// // //           color: PRIMARY_BLUE,
// // //           display: "flex",
// // //           alignItems: "center",
// // //           gap: 6
// // //         }}>
// // //           <CustomerServiceOutlined style={{ fontSize: 12 }} />
// // //           {text}
// // //         </div>
// // //       )
// // //     },
// // //     {
// // //       title: "Loan Type",
// // //       dataIndex: "loanType",
// // //       width: 120,
// // //       render: (text) => (
// // //         <div style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
// // //           {text}
// // //         </div>
// // //       )
// // //     },
// // //     {
// // //       title: "RM",
// // //       dataIndex: "assignedToRM",
// // //       width: 120,
// // //       render: (rm) => (
// // //         <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
// // //           <UserOutlined style={{ color: PRIMARY_BLUE, fontSize: 12 }} />
// // //           <span style={{ color: PRIMARY_BLUE, fontWeight: 500, fontSize: 13 }}>{rm?.name || "N/A"}</span>
// // //         </div>
// // //       )
// // //     },
// // //     {
// // //       title: "Docs",
// // //       dataIndex: "documents",
// // //       width: 70,
// // //       align: "center",
// // //       render: (docs) => {
// // //         const totalDocs = docs?.reduce((total, category) => total + (category.docList?.length || 0), 0) || 0;
// // //         return (
// // //           <Tag
// // //             color={LIGHT_YELLOW}
// // //             style={{
// // //               fontSize: 11,
// // //               borderRadius: 999,
// // //               fontWeight: "bold",
// // //               color: PRIMARY_BLUE,
// // //               border: `1px solid ${HIGHLIGHT_GOLD}`,
// // //               minWidth: 28,
// // //               textAlign: "center"
// // //             }}
// // //           >
// // //             {totalDocs}
// // //           </Tag>
// // //         );
// // //       }
// // //     },
// // //     {
// // //       title: "Submitted",
// // //       dataIndex: "submittedToCreatorAt",
// // //       width: 110,
// // //       render: (date) => (
// // //         <div style={{ fontSize: 12 }}>
// // //           {date ? dayjs(date).format('DD/MM/YYYY') : "N/A"}
// // //         </div>
// // //       )
// // //     },
// // //     {
// // //       title: "SLA",
// // //       dataIndex: "slaExpiry",
// // //       width: 90,
// // //       render: (date) => {
// // //         const daysLeft = dayjs(date).diff(dayjs(), 'days');
// // //         return (
// // //           <Tag
// // //             color={daysLeft <= 2 ? ERROR_RED : daysLeft <= 5 ? WARNING_ORANGE : SUCCESS_GREEN}
// // //             style={{ fontWeight: "bold", fontSize: 11 }}
// // //           >
// // //             {daysLeft > 0 ? `${daysLeft}d` : 'Expired'}
// // //           </Tag>
// // //         );
// // //       }
// // //     },
// // //     {
// // //       title: "Status",
// // //       width: 120,
// // //       fixed: "right",
// // //       render: () => (
// // //         <Tag
// // //           color={isCurrentTab ? "orange" : "red"}
// // //           style={{
// // //             fontSize: 11,
// // //             borderRadius: 999,
// // //             fontWeight: "bold",
// // //             padding: "2px 8px"
// // //           }}
// // //         >
// // //           {isCurrentTab ? "From RM" : "From Checker"}
// // //         </Tag>
// // //       )
// // //     }
// // //   ];

// // //   // Custom table styles (matching Reports design)
// // //   const customTableStyles = `
// // //     .myqueue-table .ant-table-wrapper {
// // //       border-radius: 12px;
// // //       overflow: hidden;
// // //       box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
// // //       border: 1px solid #e0e0e0;
// // //     }
// // //     .myqueue-table .ant-table-thead > tr > th {
// // //       background-color: #f7f7f7 !important;
// // //       color: ${PRIMARY_BLUE} !important;
// // //       font-weight: 700;
// // //       font-size: 14px;
// // //       padding: 16px 16px !important;
// // //       border-bottom: 3px solid ${ACCENT_LIME} !important;
// // //       border-right: none !important;
// // //     }
// // //     .myqueue-table .ant-table-tbody > tr > td {
// // //       border-bottom: 1px solid #f0f0f0 !important;
// // //       border-right: none !important;
// // //       padding: 14px 16px !important;
// // //       font-size: 14px;
// // //       color: #333;
// // //     }
// // //     .myqueue-table .ant-table-tbody > tr.ant-table-row:hover > td {
// // //       background-color: rgba(181, 211, 52, 0.1) !important;
// // //       cursor: pointer;
// // //     }
// // //     .myqueue-table .ant-pagination .ant-pagination-item-active {
// // //       background-color: ${ACCENT_LIME} !important;
// // //       border-color: ${ACCENT_LIME} !important;
// // //     }
// // //     .myqueue-table .ant-pagination .ant-pagination-item-active a {
// // //       color: ${PRIMARY_BLUE} !important;
// // //       font-weight: 600;
// // //     }
// // //   `;

// // //   // Filter component - WITHOUT Priority filter
// // //   const renderFilters = () => (
// // //     <Card
// // //       style={{
// // //         marginBottom: 16,
// // //         background: "#fafafa",
// // //         border: `1px solid ${PRIMARY_BLUE}20`,
// // //         borderRadius: 8
// // //       }}
// // //       size="small"
// // //     >
// // //       <Row gutter={[16, 16]} align="middle">
// // //         <Col xs={24} sm={12} md={8}>
// // //           <Input
// // //             placeholder="Search by DCL No, Customer No, or Name"
// // //             prefix={<SearchOutlined />}
// // //             value={searchText}
// // //             onChange={(e) => setSearchText(e.target.value)}
// // //             allowClear
// // //             size="middle"
// // //           />
// // //         </Col>

// // //         <Col xs={24} sm={12} md={8}>
// // //           <RangePicker
// // //             style={{ width: '100%' }}
// // //             placeholder={['Start Date', 'End Date']}
// // //             value={dateRange}
// // //             onChange={(dates) => setDateRange(dates)}
// // //             format="DD/MM/YYYY"
// // //             size="middle"
// // //           />
// // //         </Col>

// // //         <Col xs={24} sm={12} md={4}>
// // //           <Button
// // //             onClick={clearFilters}
// // //             style={{ width: '100%' }}
// // //             size="middle"
// // //           >
// // //             Clear
// // //           </Button>
// // //         </Col>
// // //       </Row>
// // //     </Card>
// // //   );

// // //   return (
// // //     <div style={{ padding: 24 }}>
// // //       <style>{customTableStyles}</style>

// // //       {/* Header - Matching Reports design */}
// // //       <Card
// // //         style={{
// // //           marginBottom: 24,
// // //           borderRadius: 8,
// // //           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
// // //           borderLeft: `4px solid ${ACCENT_LIME}`
// // //         }}
// // //         bodyStyle={{ padding: 16 }}
// // //       >
// // //         <Row justify="space-between" align="middle">
// // //           <Col>
// // //             <h2 style={{ margin: 0, color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 12 }}>
// // //               My Queue
// // //               <Badge
// // //                 count={getCurrentDataCount()}
// // //                 style={{
// // //                   backgroundColor: ACCENT_LIME,
// // //                   fontSize: 12
// // //                 }}
// // //               />
// // //             </h2>
// // //             <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
// // //               Review checklists from Relationship Managers and Checkers
// // //             </p>
// // //           </Col>
// // //         </Row>
// // //       </Card>

// // //       {/* Filters - WITHOUT Priority filter */}
// // //       {renderFilters()}

// // //       {/* Tabs */}
// // //       <Tabs
// // //         activeKey={activeTab}
// // //         onChange={(key) => {
// // //           setActiveTab(key);
// // //           clearFilters();
// // //         }}
// // //         type="card"
// // //         size="large"
// // //         style={{ marginBottom: 16 }}
// // //       >
// // //         <TabPane
// // //           tab={
// // //             <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
// // //               Current Queue
// // //               {filteredCurrentQueue.length > 0 && (
// // //                 <Badge
// // //                   count={filteredCurrentQueue.length}
// // //                   style={{
// // //                     backgroundColor: HIGHLIGHT_GOLD,
// // //                     fontSize: 10,
// // //                     marginLeft: 4
// // //                   }}
// // //                 />
// // //               )}
// // //             </span>
// // //           }
// // //           key="current"
// // //         >
// // //           {/* Table Title */}
// // //           <Divider style={{ margin: "12px 0" }}>
// // //             <span style={{ color: PRIMARY_BLUE, fontSize: 16, fontWeight: 600 }}>
// // //               Current Queue ({filteredCurrentQueue.length} items)
// // //             </span>
// // //           </Divider>

// // //           {/* Table */}
// // //           {loading ? (
// // //             <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
// // //               <Spin tip="Loading checklists..." />
// // //             </div>
// // //           ) : filteredCurrentQueue.length === 0 ? (
// // //             <Empty
// // //               description={
// // //                 <div>
// // //                   <p style={{ fontSize: 16, marginBottom: 8 }}>No checklists from RM for review</p>
// // //                   <p style={{ color: "#999" }}>
// // //                     {searchText || dateRange
// // //                       ? 'Try changing your filters'
// // //                       : 'No data available'}
// // //                   </p>
// // //                 </div>
// // //               }
// // //               style={{ padding: 40 }}
// // //             />
// // //           ) : (
// // //             <div className="myqueue-table">
// // //               <Table
// // //                 columns={getColumns(true)}
// // //                 dataSource={filteredCurrentQueue}
// // //                 rowKey="_id"
// // //                 size="middle"
// // //                 pagination={{
// // //                   pageSize: 10,
// // //                   showSizeChanger: true,
// // //                   pageSizeOptions: ["10", "20", "50"],
// // //                   position: ["bottomCenter"],
// // //                   showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} checklists`
// // //                 }}
// // //                 scroll={{ x: 1100 }}
// // //                 onRow={(record) => ({
// // //                   onClick: () => setSelectedChecklist(record),
// // //                 })}
// // //               />
// // //             </div>
// // //           )}
// // //         </TabPane>

// // //         <TabPane
// // //           tab={
// // //             <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
// // //               Previous Queue
// // //               {filteredPreviousQueue.length > 0 && (
// // //                 <Badge
// // //                   count={filteredPreviousQueue.length}
// // //                   style={{
// // //                     backgroundColor: SECONDARY_PURPLE,
// // //                     fontSize: 10,
// // //                     marginLeft: 4
// // //                   }}
// // //                 />
// // //               )}
// // //             </span>
// // //           }
// // //           key="previous"
// // //         >
// // //           {/* Table Title */}
// // //           <Divider style={{ margin: "12px 0" }}>
// // //             <span style={{ color: PRIMARY_BLUE, fontSize: 16, fontWeight: 600 }}>
// // //               Previous Queue ({filteredPreviousQueue.length} items)
// // //             </span>
// // //           </Divider>

// // //           {/* Table */}
// // //           {loading ? (
// // //             <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
// // //               <Spin tip="Loading checklists..." />
// // //             </div>
// // //           ) : filteredPreviousQueue.length === 0 ? (
// // //             <Empty
// // //               description={
// // //                 <div>
// // //                   <p style={{ fontSize: 16, marginBottom: 8 }}>No checklists returned by Checker</p>
// // //                   <p style={{ color: "#999" }}>
// // //                     {searchText || dateRange
// // //                       ? 'Try changing your filters'
// // //                       : 'No data available'}
// // //                   </p>
// // //                 </div>
// // //               }
// // //               style={{ padding: 40 }}
// // //             />
// // //           ) : (
// // //             <div className="myqueue-table">
// // //               <Table
// // //                 columns={getColumns(false)}
// // //                 dataSource={filteredPreviousQueue}
// // //                 rowKey="_id"
// // //                 size="middle"
// // //                 pagination={{
// // //                   pageSize: 10,
// // //                   showSizeChanger: true,
// // //                   pageSizeOptions: ["10", "20", "50"],
// // //                   position: ["bottomCenter"],
// // //                   showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} checklists`
// // //                 }}
// // //                 scroll={{ x: 1100 }}
// // //                 onRow={(record) => ({
// // //                   onClick: () => setSelectedChecklist(record),
// // //                 })}
// // //               />
// // //             </div>
// // //           )}
// // //         </TabPane>
// // //       </Tabs>

// // //       {/* Footer Info */}
// // //       <div style={{
// // //         marginTop: 24,
// // //         padding: 16,
// // //         background: "#f8f9fa",
// // //         borderRadius: 8,
// // //         fontSize: 12,
// // //         color: "#666",
// // //         border: `1px solid ${PRIMARY_BLUE}10`
// // //       }}>
// // //         <Row justify="space-between" align="middle">
// // //           <Col>
// // //             Report generated on: {dayjs().format('DD/MM/YYYY HH:mm:ss')}
// // //           </Col>
// // //           <Col>
// // //             <Text type="secondary">
// // //               Showing {getCurrentDataCount()} items • Data as of latest system update
// // //             </Text>
// // //           </Col>
// // //         </Row>
// // //       </div>

// // //       {/* Modal */}
// // //       {selectedChecklist && (
// // //         <CreatorQueueChecklistModal
// // //           checklist={selectedChecklist}
// // //           open={!!selectedChecklist}
// // //           onClose={() => {
// // //             setSelectedChecklist(null);
// // //             refetch();
// // //           }}
// // //           sourceType={activeTab === "current" ? "from_rm" : "from_checker"}
// // //         />
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default Myqueue;

// // import React, { useMemo, useState } from "react";
// // import {
// //   Button,
// //   Divider,
// //   Table,
// //   Tag,
// //   Spin,
// //   Empty,
// //   Tabs,
// //   Card,
// //   Row,
// //   Col,
// //   Input,
// //   DatePicker,
// //   Badge,
// //   Typography,
// // } from "antd";
// // import {
// //   SearchOutlined,
// //   FileTextOutlined,
// //   UserOutlined,
// //   CustomerServiceOutlined,
// // } from "@ant-design/icons";
// // import CreatorQueueChecklistModal from "../../components/modals/CreatorQueueChecklistModal";
// // import { useGetAllCoCreatorChecklistsQuery } from "../../api/checklistApi";
// // import dayjs from "dayjs";

// // /* ---------------- THEME COLORS ---------------- */
// // const PRIMARY_BLUE = "#164679";
// // const ACCENT_LIME = "#b5d334";
// // const HIGHLIGHT_GOLD = "#fcb116";
// // const LIGHT_YELLOW = "#fcd716";
// // const SECONDARY_PURPLE = "#7e6496";
// // const SUCCESS_GREEN = "#52c41a";
// // const ERROR_RED = "#ff4d4f";
// // const WARNING_ORANGE = "#faad14";

// // const { RangePicker } = DatePicker;
// // const { Text } = Typography;
// // const { TabPane } = Tabs;

// // const Myqueue = ({ userId = "current_user" }) => {
// //   const [selectedChecklist, setSelectedChecklist] = useState(null);
// //   const [activeTab, setActiveTab] = useState("current");

// //   /* ---------------- FILTER STATE ---------------- */
// //   const [searchText, setSearchText] = useState("");
// //   const [dateRange, setDateRange] = useState(null);

// //   /* ---------------- FETCH DATA ---------------- */
// //   const {
// //     data: allChecklists = [],
// //     isLoading,
// //     refetch,
// //   } = useGetAllCoCreatorChecklistsQuery();

// //   /* ---------------- FILTER APPROVED ---------------- */
// //   const filteredData = useMemo(() => {
// //     let filtered = allChecklists.filter(
// //       (c) => c.status?.toLowerCase() === "approved"
// //     );

// //     if (searchText) {
// //       const q = searchText.toLowerCase();
// //       filtered = filtered.filter(
// //         (c) =>
// //           c.dclNo?.toLowerCase().includes(q) ||
// //           c.customerNumber?.toLowerCase().includes(q) ||
// //           c.customerName?.toLowerCase().includes(q) ||
// //           c.loanType?.toLowerCase().includes(q) ||
// //           c.approvedBy?.name?.toLowerCase().includes(q)
// //       );
// //     }

// //     return filtered;
// //   }, [allChecklists, searchText]);

// //   // /* ---------------- ASSIGNED TO USER ---------------- */
// //   // const myChecklists = useMemo(() => {
// //   //   return checklists.filter((c) => {
// //   //     return (
// //   //       c.assignedToCoChecker?._id === userId ||
// //   //       c.assignedToCoChecker === userId ||
// //   //       c.createdBy?._id === userId ||
// //   //       c.createdBy === userId
// //   //     );
// //   //   });
// //   // }, [checklists, userId]);

// //   // // /* ---------------- CURRENT QUEUE ---------------- */
// //   // // const filteredCurrentQueue = useMemo(() => {
// //   // //   let filtered = myChecklists.filter((c) => ["Approved"].includes(c.status));

// //   // //   if (searchText) {
// //   // //     const q = searchText.toLowerCase();
// //   // //     filtered = filtered.filter(
// //   // //       (c) =>
// //   // //         c.dclNo?.toLowerCase().includes(q) ||
// //   // //         c.customerNumber?.toLowerCase().includes(q) ||
// //   // //         c.customerName?.toLowerCase().includes(q)
// //   // //     );
// //   // //   }

// //   // //   if (dateRange?.[0] && dateRange?.[1]) {
// //   // //     filtered = filtered.filter((c) => {
// //   // //       const created = dayjs(c.createdAt);
// //   // //       return created.isAfter(dateRange[0]) && created.isBefore(dateRange[1]);
// //   // //     });
// //   // //   }

// //   // //   return filtered;
// //   // // }, [myChecklists, searchText, dateRange]);

// //   // /* ---------------- CURRENT QUEUE (APPROVED ONLY) ---------------- */
// //   // const filteredCurrentQueue = useMemo(() => {
// //   //   let filtered = myChecklists.filter(
// //   //     (c) => (c.status || "").toLowerCase() === "approved"
// //   //   );

// //   //   if (searchText) {
// //   //     const q = searchText.toLowerCase();
// //   //     filtered = filtered.filter(
// //   //       (c) =>
// //   //         c.dclNo?.toLowerCase().includes(q) ||
// //   //         c.customerNumber?.toLowerCase().includes(q) ||
// //   //         c.customerName?.toLowerCase().includes(q)
// //   //     );
// //   //   }

// //   //   if (dateRange?.[0] && dateRange?.[1]) {
// //   //     filtered = filtered.filter((c) => {
// //   //       const created = dayjs(c.createdAt);
// //   //       return created.isAfter(dateRange[0]) && created.isBefore(dateRange[1]);
// //   //     });
// //   //   }

// //   //   return filtered;
// //   // }, [myChecklists, searchText, dateRange]);

// //   // /* ---------------- PREVIOUS QUEUE ---------------- */
// //   // const filteredPreviousQueue = useMemo(() => {
// //   //   let filtered = myChecklists.filter((c) => c.status === "pending");

// //   //   if (searchText) {
// //   //     const q = searchText.toLowerCase();
// //   //     filtered = filtered.filter(
// //   //       (c) =>
// //   //         c.dclNo?.toLowerCase().includes(q) ||
// //   //         c.customerNumber?.toLowerCase().includes(q) ||
// //   //         c.customerName?.toLowerCase().includes(q)
// //   //     );
// //   //   }

// //   //   if (dateRange?.[0] && dateRange?.[1]) {
// //   //     filtered = filtered.filter((c) => {
// //   //       const created = dayjs(c.createdAt);
// //   //       return created.isAfter(dateRange[0]) && created.isBefore(dateRange[1]);
// //   //     });
// //   //   }

// //   //   return filtered;
// //   // }, [myChecklists, searchText, dateRange]);

// //   // /* ---------------- HELPERS ---------------- */
// //   // const clearFilters = () => {
// //   //   setSearchText("");
// //   //   setDateRange(null);
// //   // };

// //   // const getCurrentDataCount = () =>
// //   //   activeTab === "current"
// //   //     ? filteredCurrentQueue.length
// //   //     : filteredPreviousQueue.length;

// //   // console.log("previouscurrent", filteredPreviousQueue);

// //   /* ---------------- TABLE COLUMNS ---------------- */
// //   const getColumns = (isCurrentTab) => [
// //     {
// //       title: "DCL No",
// //       dataIndex: "dclNo",
// //       width: 140,
// //       render: (text) => (
// //         <div
// //           style={{
// //             fontWeight: "bold",
// //             color: PRIMARY_BLUE,
// //             display: "flex",
// //             alignItems: "center",
// //             gap: 8,
// //           }}
// //         >
// //           <FileTextOutlined style={{ color: SECONDARY_PURPLE }} />
// //           {text}
// //         </div>
// //       ),
// //     },
// //     {
// //       title: "Customer No",
// //       dataIndex: "customerNumber",
// //       width: 110,
// //       render: (text) => (
// //         <div
// //           style={{
// //             color: SECONDARY_PURPLE,
// //             fontWeight: 500,
// //             fontSize: 13,
// //           }}
// //         >
// //           {text || "—"}
// //         </div>
// //       ),
// //     },
// //     {
// //       title: "Customer Name",
// //       dataIndex: "customerName",
// //       width: 160,
// //       render: (text) => (
// //         <div
// //           style={{
// //             fontWeight: 600,
// //             color: PRIMARY_BLUE,
// //             display: "flex",
// //             alignItems: "center",
// //             gap: 6,
// //           }}
// //         >
// //           <CustomerServiceOutlined style={{ fontSize: 12 }} />
// //           {text}
// //         </div>
// //       ),
// //     },
// //     {
// //       title: "Loan Type",
// //       dataIndex: "loanType",
// //       width: 120,
// //       render: (text) => (
// //         <div style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
// //           {text}
// //         </div>
// //       ),
// //     },
// //     {
// //       title: "RM",
// //       dataIndex: "assignedToRM",
// //       width: 120,
// //       render: (rm) => (
// //         <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
// //           <UserOutlined style={{ color: PRIMARY_BLUE, fontSize: 12 }} />
// //           <span
// //             style={{
// //               color: PRIMARY_BLUE,
// //               fontWeight: 500,
// //               fontSize: 13,
// //             }}
// //           >
// //             {rm?.name || "N/A"}
// //           </span>
// //         </div>
// //       ),
// //     },
// //     {
// //       title: "Docs",
// //       dataIndex: "documents",
// //       width: 70,
// //       align: "center",
// //       render: (docs = []) => {
// //         const total =
// //           docs.reduce((t, c) => t + (c.docList?.length || 0), 0) || 0;

// //         return (
// //           <Tag
// //             color={LIGHT_YELLOW}
// //             style={{
// //               fontSize: 11,
// //               borderRadius: 999,
// //               fontWeight: "bold",
// //               color: PRIMARY_BLUE,
// //               border: `1px solid ${HIGHLIGHT_GOLD}`,
// //               minWidth: 28,
// //               textAlign: "center",
// //             }}
// //           >
// //             {total}
// //           </Tag>
// //         );
// //       },
// //     },
// //     {
// //       title: "Submitted",
// //       dataIndex: "submittedToCreatorAt",
// //       width: 110,
// //       render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
// //     },
// //     {
// //       title: "SLA",
// //       dataIndex: "slaExpiry",
// //       width: 90,
// //       render: (date) => {
// //         const daysLeft = dayjs(date).diff(dayjs(), "days");
// //         return (
// //           <Tag
// //             color={
// //               daysLeft <= 2
// //                 ? ERROR_RED
// //                 : daysLeft <= 5
// //                 ? WARNING_ORANGE
// //                 : SUCCESS_GREEN
// //             }
// //             style={{ fontWeight: "bold", fontSize: 11 }}
// //           >
// //             {daysLeft > 0 ? `${daysLeft}d` : "Expired"}
// //           </Tag>
// //         );
// //       },
// //     },
// //     {
// //       title: "Status",
// //       width: 120,
// //       fixed: "right",
// //       render: () => (
// //         <Tag
// //           color={isCurrentTab ? "orange" : "red"}
// //           style={{
// //             fontSize: 11,
// //             borderRadius: 999,
// //             fontWeight: "bold",
// //             padding: "2px 8px",
// //           }}
// //         >
// //           {isCurrentTab ? "From RM" : "From Checker"}
// //         </Tag>
// //       ),
// //     },
// //   ];

// //   /* ---------------- TABLE STYLES (UNCHANGED) ---------------- */
// //   const customTableStyles = `
// //     .myqueue-table .ant-table-wrapper {
// //       border-radius: 12px;
// //       overflow: hidden;
// //       box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
// //       border: 1px solid #e0e0e0;
// //     }
// //     .myqueue-table .ant-table-thead > tr > th {
// //       background-color: #f7f7f7 !important;
// //       color: ${PRIMARY_BLUE} !important;
// //       font-weight: 700;
// //       border-bottom: 3px solid ${ACCENT_LIME} !important;
// //     }
// //     .myqueue-table .ant-table-tbody > tr:hover > td {
// //       background-color: rgba(181, 211, 52, 0.1) !important;
// //       cursor: pointer;
// //     }
// //   `;

// //   /* ---------------- RENDER ---------------- */
// //   return (
// //     <div style={{ padding: 24 }}>
// //       <style>{customTableStyles}</style>

// //       {/* HEADER */}
// //       <Card
// //         style={{
// //           marginBottom: 24,
// //           borderRadius: 8,
// //           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
// //           borderLeft: `4px solid ${ACCENT_LIME}`,
// //         }}
// //       >
// //         <Row justify="space-between" align="middle">
// //           <Col>
// //             <h2 style={{ margin: 0, color: PRIMARY_BLUE }}>
// //               My Queue <Badge count={getCurrentDataCount()} />
// //             </h2>
// //             <p style={{ marginTop: 4, color: "#666" }}>
// //               Review checklists from RM & Checkers
// //             </p>
// //           </Col>
// //         </Row>
// //       </Card>

// //       {/* FILTERS */}
// //       <Card size="small" style={{ marginBottom: 16 }}>
// //         <Row gutter={16}>
// //           <Col md={8}>
// //             <Input
// //               prefix={<SearchOutlined />}
// //               placeholder="Search..."
// //               value={searchText}
// //               onChange={(e) => setSearchText(e.target.value)}
// //               allowClear
// //             />
// //           </Col>
// //           <Col md={8}>
// //             <RangePicker
// //               style={{ width: "100%" }}
// //               value={dateRange}
// //               onChange={setDateRange}
// //             />
// //           </Col>
// //           <Col md={4}>
// //             <Button onClick={clearFilters} block>
// //               Clear
// //             </Button>
// //           </Col>
// //         </Row>
// //       </Card>

// //       {/* TABS */}
// //       <Tabs
// //         activeKey={activeTab}
// //         onChange={(k) => {
// //           setActiveTab(k);
// //           clearFilters();
// //         }}
// //         type="card"
// //       >
// //         <TabPane tab="Current Queue" key="current">
// //           {isLoading ? (
// //             <Spin style={{ display: "block", margin: 40 }} />
// //           ) : filteredData.length === 0 ? (
// //             <Empty description="No current items" />
// //           ) : (
// //             <div className="myqueue-table">
// //               <Table
// //                 rowKey="_id"
// //                 columns={getColumns(true)}
// //                 dataSource={filteredData}
// //                 pagination={{ pageSize: 10 }}
// //                 onRow={(r) => ({
// //                   onClick: () => setSelectedChecklist(r),
// //                 })}
// //               />
// //             </div>
// //           )}
// //         </TabPane>

// //         <TabPane tab="Previous Queue" key="previous">
// //           {isLoading ? (
// //             <Spin style={{ display: "block", margin: 40 }} />
// //           ) : filteredData.length === 0 ? (
// //             <Empty description="No previous items" />
// //           ) : (
// //             <div className="myqueue-table">
// //               <Table
// //                 rowKey="_id"
// //                 columns={getColumns(false)}
// //                 dataSource={filteredData}
// //                 pagination={{ pageSize: 10 }}
// //                 onRow={(r) => ({
// //                   onClick: () => setSelectedChecklist(r),
// //                 })}
// //               />
// //             </div>
// //           )}
// //         </TabPane>
// //       </Tabs>

// //       {/* MODAL */}
// //       {selectedChecklist && (
// //         <CreatorQueueChecklistModal
// //           open
// //           checklist={selectedChecklist}
// //           onClose={() => {
// //             setSelectedChecklist(null);
// //             refetch();
// //           }}
// //           sourceType={activeTab === "current" ? "from_rm" : "from_checker"}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default Myqueue;
// // import React, { useMemo, useState } from "react";
// // import {
// //   Button,
// //   Divider,
// //   Table,
// //   Tag,
// //   Spin,
// //   Empty,
// //   Tabs,
// //   Card,
// //   Row,
// //   Col,
// //   Input,
// //   DatePicker,
// //   Badge,
// //   Typography,
// // } from "antd";
// // import {
// //   SearchOutlined,
// //   FileTextOutlined,
// //   UserOutlined,
// //   CustomerServiceOutlined,
// // } from "@ant-design/icons";
// // import CreatorQueueChecklistModal from "../../components/modals/CreatorQueueChecklistModal";
// // import { useGetAllCoCreatorChecklistsQuery } from "../../api/checklistApi";
// // import dayjs from "dayjs";

// // /* ---------------- THEME COLORS ---------------- */
// // const PRIMARY_BLUE = "#164679";
// // const ACCENT_LIME = "#b5d334";
// // const HIGHLIGHT_GOLD = "#fcb116";
// // const LIGHT_YELLOW = "#fcd716";
// // const SECONDARY_PURPLE = "#7e6496";
// // const SUCCESS_GREEN = "#52c41a";
// // const ERROR_RED = "#ff4d4f";
// // const WARNING_ORANGE = "#faad14";

// // const { RangePicker } = DatePicker;
// // const { Text } = Typography;
// // const { TabPane } = Tabs;

// // const Myqueue = ({ userId = "current_user" }) => {
// //   const [selectedChecklist, setSelectedChecklist] = useState(null);
// //   const [activeTab, setActiveTab] = useState("current");

// //   /* ---------------- FILTER STATE ---------------- */
// //   const [searchText, setSearchText] = useState("");
// //   const [dateRange, setDateRange] = useState(null);

// //   /* ---------------- FETCH DATA ---------------- */
// //   const {
// //     data: allChecklists = [],
// //     isLoading,
// //     refetch,
// //   } = useGetAllCoCreatorChecklistsQuery();

// //   /* ---------------- FILTER APPROVED ---------------- */
// //   const filteredData = useMemo(() => {
// //     let filtered = allChecklists.filter(
// //       (c) => c.status?.toLowerCase() === "co_creator_review"
// //     );

// //     if (searchText) {
// //       const q = searchText.toLowerCase();
// //       filtered = filtered.filter(
// //         (c) =>
// //           c.dclNo?.toLowerCase().includes(q) ||
// //           c.customerNumber?.toLowerCase().includes(q) ||
// //           c.customerName?.toLowerCase().includes(q) ||
// //           c.loanType?.toLowerCase().includes(q) ||
// //           c.approvedBy?.name?.toLowerCase().includes(q)
// //       );
// //     }

// //     return filtered;
// //   }, [allChecklists, searchText]);

// //   /* ---------------- TABLE COLUMNS ---------------- */
// //   const getColumns = (isCurrentTab) => [
// //     {
// //       title: "DCL No",
// //       dataIndex: "dclNo",
// //       width: 140,
// //       render: (text) => (
// //         <div
// //           style={{
// //             fontWeight: "bold",
// //             color: PRIMARY_BLUE,
// //             display: "flex",
// //             alignItems: "center",
// //             gap: 8,
// //           }}
// //         >
// //           <FileTextOutlined style={{ color: SECONDARY_PURPLE }} />
// //           {text}
// //         </div>
// //       ),
// //     },
// //     {
// //       title: "Customer No",
// //       dataIndex: "customerNumber",
// //       width: 110,
// //       render: (text) => (
// //         <div
// //           style={{
// //             color: SECONDARY_PURPLE,
// //             fontWeight: 500,
// //             fontSize: 13,
// //           }}
// //         >
// //           {text || "—"}
// //         </div>
// //       ),
// //     },
// //     {
// //       title: "Customer Name",
// //       dataIndex: "customerName",
// //       width: 160,
// //       render: (text) => (
// //         <div
// //           style={{
// //             fontWeight: 600,
// //             color: PRIMARY_BLUE,
// //             display: "flex",
// //             alignItems: "center",
// //             gap: 6,
// //           }}
// //         >
// //           <CustomerServiceOutlined style={{ fontSize: 12 }} />
// //           {text}
// //         </div>
// //       ),
// //     },
// //     {
// //       title: "Loan Type",
// //       dataIndex: "loanType",
// //       width: 120,
// //       render: (text) => (
// //         <div style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
// //           {text}
// //         </div>
// //       ),
// //     },
// //     {
// //       title: "RM",
// //       dataIndex: "assignedToRM",
// //       width: 120,
// //       render: (rm) => (
// //         <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
// //           <UserOutlined style={{ color: PRIMARY_BLUE, fontSize: 12 }} />
// //           <span
// //             style={{
// //               color: PRIMARY_BLUE,
// //               fontWeight: 500,
// //               fontSize: 13,
// //             }}
// //           >
// //             {rm?.name || "N/A"}
// //           </span>
// //         </div>
// //       ),
// //     },
// //     {
// //       title: "Docs",
// //       dataIndex: "documents",
// //       width: 70,
// //       align: "center",
// //       render: (docs = []) => {
// //         const total =
// //           docs.reduce((t, c) => t + (c.docList?.length || 0), 0) || 0;

// //         return (
// //           <Tag
// //             color={LIGHT_YELLOW}
// //             style={{
// //               fontSize: 11,
// //               borderRadius: 999,
// //               fontWeight: "bold",
// //               color: PRIMARY_BLUE,
// //               border: `1px solid ${HIGHLIGHT_GOLD}`,
// //               minWidth: 28,
// //               textAlign: "center",
// //             }}
// //           >
// //             {total}
// //           </Tag>
// //         );
// //       },
// //     },
// //     {
// //       title: "Submitted",
// //       dataIndex: "submittedToCreatorAt",
// //       width: 110,
// //       render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
// //     },
// //     {
// //       title: "SLA",
// //       dataIndex: "slaExpiry",
// //       width: 90,
// //       render: (date) => {
// //         const daysLeft = dayjs(date).diff(dayjs(), "days");
// //         return (
// //           <Tag
// //             color={
// //               daysLeft <= 2
// //                 ? ERROR_RED
// //                 : daysLeft <= 5
// //                 ? WARNING_ORANGE
// //                 : SUCCESS_GREEN
// //             }
// //             style={{ fontWeight: "bold", fontSize: 11 }}
// //           >
// //             {daysLeft > 0 ? `${daysLeft}d` : "Expired"}
// //           </Tag>
// //         );
// //       },
// //     },
// //     {
// //       title: "Status",
// //       width: 120,
// //       fixed: "right",
// //       render: () => (
// //         <Tag
// //           color={isCurrentTab ? "orange" : "red"}
// //           style={{
// //             fontSize: 11,
// //             borderRadius: 999,
// //             fontWeight: "bold",
// //             padding: "2px 8px",
// //           }}
// //         >
// //           {isCurrentTab ? "From RM" : "From Checker"}
// //         </Tag>
// //       ),
// //     },
// //   ];

// //   /* ---------------- TABLE STYLES (UNCHANGED) ---------------- */
// //   const customTableStyles = `
// //     .myqueue-table .ant-table-wrapper {
// //       border-radius: 12px;
// //       overflow: hidden;
// //       box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
// //       border: 1px solid #e0e0e0;
// //     }
// //     .myqueue-table .ant-table-thead > tr > th {
// //       background-color: #f7f7f7 !important;
// //       color: ${PRIMARY_BLUE} !important;
// //       font-weight: 700;
// //       border-bottom: 3px solid ${ACCENT_LIME} !important;
// //     }
// //     .myqueue-table .ant-table-tbody > tr:hover > td {
// //       background-color: rgba(181, 211, 52, 0.1) !important;
// //       cursor: pointer;
// //     }
// //   `;

// //   /* ---------------- RENDER ---------------- */
// //   return (
// //     <div style={{ padding: 24 }}>
// //       <style>{customTableStyles}</style>

// //       {/* HEADER */}
// //       <Card
// //         style={{
// //           marginBottom: 24,
// //           borderRadius: 8,
// //           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
// //           borderLeft: `4px solid ${ACCENT_LIME}`,
// //         }}
// //       >
// //         <Row justify="space-between" align="middle">
// //           <Col>
// //             <h2 style={{ margin: 0, color: PRIMARY_BLUE }}>
// //               {/* My Queue <Badge count={getCurrentDataCount()} /> */} hh
// //             </h2>
// //             <p style={{ marginTop: 4, color: "#666" }}>
// //               Review checklists from RM & Checkers
// //             </p>
// //           </Col>
// //         </Row>
// //       </Card>

// //       {/* FILTERS */}
// //       <Card size="small" style={{ marginBottom: 16 }}>
// //         <Row gutter={16}>
// //           <Col md={8}>
// //             <Input
// //               prefix={<SearchOutlined />}
// //               placeholder="Search..."
// //               value={searchText}
// //               onChange={(e) => setSearchText(e.target.value)}
// //               allowClear
// //             />
// //           </Col>
// //           <Col md={8}>
// //             <RangePicker
// //               style={{ width: "100%" }}
// //               value={dateRange}
// //               onChange={setDateRange}
// //             />
// //           </Col>
// //           <Col md={4}>
// //             <Button block>Clear</Button>
// //           </Col>
// //         </Row>
// //       </Card>

// //       {/* TABS */}
// //       <Tabs
// //         activeKey={activeTab}
// //         onChange={(k) => {
// //           setActiveTab(k);
// //           // clearFilters();
// //         }}
// //         type="card"
// //       >
// //         <TabPane tab="Current Queue" key="current">
// //           {isLoading ? (
// //             <Spin style={{ display: "block", margin: 40 }} />
// //           ) : filteredData.length === 0 ? (
// //             <Empty description="No current items" />
// //           ) : (
// //             <div className="myqueue-table">
// //               <Table
// //                 rowKey="_id"
// //                 columns={getColumns(true)}
// //                 dataSource={filteredData}
// //                 pagination={{ pageSize: 10 }}
// //                 onRow={(r) => ({
// //                   onClick: () => setSelectedChecklist(r),
// //                 })}
// //               />
// //             </div>
// //           )}
// //         </TabPane>

// //         <TabPane tab="Previous Queue" key="previous">
// //           {isLoading ? (
// //             <Spin style={{ display: "block", margin: 40 }} />
// //           ) : filteredData.length === 0 ? (
// //             <Empty description="No previous items" />
// //           ) : (
// //             <div className="myqueue-table">
// //               <Table
// //                 rowKey="_id"
// //                 columns={getColumns(false)}
// //                 dataSource={filteredData}
// //                 pagination={{ pageSize: 10 }}
// //                 onRow={(r) => ({
// //                   onClick: () => setSelectedChecklist(r),
// //                 })}
// //               />
// //             </div>
// //           )}
// //         </TabPane>
// //       </Tabs>

// //       {/* MODAL */}
// //       {selectedChecklist && (
// //         <CreatorQueueChecklistModal
// //           open
// //           checklist={selectedChecklist}
// //           onClose={() => {
// //             setSelectedChecklist(null);
// //             refetch();
// //           }}
// //           sourceType={activeTab === "current" ? "from_rm" : "from_checker"}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default Myqueue;












// import React, { useMemo, useState } from "react";
// import {
//   Button,
//   Table,
//   Tag,
//   Spin,
//   Empty,
//   Tabs,
//   Card,
//   Row,
//   Col,
//   Input,
//   DatePicker,
// } from "antd";
// import {
//   SearchOutlined,
//   FileTextOutlined,
//   UserOutlined,
//   CustomerServiceOutlined,
// } from "@ant-design/icons";
// import CreatorQueueChecklistModal from "../../components/modals/CreatorQueueChecklistModal";
// import { useGetAllCoCreatorChecklistsQuery } from "../../api/checklistApi";
// import dayjs from "dayjs";
// import ReviewChecklistModal from "../../components/modals/ReviewChecklistModal";

// /* ---------------- THEME COLORS ---------------- */
// const PRIMARY_BLUE = "#164679";
// const ACCENT_LIME = "#b5d334";
// const HIGHLIGHT_GOLD = "#fcb116";
// const LIGHT_YELLOW = "#fcd716";
// const SECONDARY_PURPLE = "#7e6496";
// const SUCCESS_GREEN = "#52c41a";
// const ERROR_RED = "#ff4d4f";
// const WARNING_ORANGE = "#faad14";

// const { RangePicker } = DatePicker;
// const { TabPane } = Tabs;

// const Myqueue = () => {
//   const [selectedChecklist, setSelectedChecklist] = useState(null);
//   const [activeTab, setActiveTab] = useState("current");
//   const [searchText, setSearchText] = useState("");

//   /* ---------------- FETCH DATA ---------------- */
//   const {
//     data: allChecklists = [],
//     isLoading,
//     refetch,
//   } = useGetAllCoCreatorChecklistsQuery();

//   /* ---------------- CURRENT QUEUE (PENDING) ---------------- */

//   const currentQueue = useMemo(() => {
//     let filtered = allChecklists.filter((c) =>
//       ["co_creator_review", "rm_review"].includes(
//         (c.status || "").toLowerCase()
//       )
//     );

//     if (searchText) {
//       const q = searchText.toLowerCase();
//       filtered = filtered.filter(
//         (c) =>
//           c.dclNo?.toLowerCase().includes(q) ||
//           c.customerNumber?.toLowerCase().includes(q) ||
//           c.customerName?.toLowerCase().includes(q) ||
//           c.loanType?.toLowerCase().includes(q)
//       );
//     }

//     return filtered;
//   }, [allChecklists, searchText]);

//   // const currentQueue = useMemo(() => {
//   //   let filtered = allChecklists.filter(
//   //     (c) => (c.status || "").toLowerCase() === "co_creator_review"
//   //   );

//   //   if (searchText) {
//   //     const q = searchText.toLowerCase();
//   //     filtered = filtered.filter(
//   //       (c) =>
//   //         c.dclNo?.toLowerCase().includes(q) ||
//   //         c.customerNumber?.toLowerCase().includes(q) ||
//   //         c.customerName?.toLowerCase().includes(q) ||
//   //         c.loanType?.toLowerCase().includes(q)
//   //     );
//   //   }

//   //   return filtered;
//   // }, [allChecklists, searchText]);

//   /* ---------------- PREVIOUS QUEUE (APPROVED) ---------------- */
//   const previousQueue = useMemo(() => {
//     let filtered = allChecklists.filter(
//       (c) => (c.status || "").toLowerCase() === "co_checker_review"
//     );

//     if (searchText) {
//       const q = searchText.toLowerCase();
//       filtered = filtered.filter(
//         (c) =>
//           c.dclNo?.toLowerCase().includes(q) ||
//           c.customerNumber?.toLowerCase().includes(q) ||
//           c.customerName?.toLowerCase().includes(q) ||
//           c.loanType?.toLowerCase().includes(q)
//       );
//     }

//     return filtered;
//   }, [allChecklists, searchText]);

//   /* ---------------- TABLE COLUMNS ---------------- */
//   const getColumns = (isCurrentTab) => [
//     {
//       title: "DCL No",
//       dataIndex: "dclNo",
//       width: 140,
//       render: (text) => (
//         <div style={{ fontWeight: "bold", color: PRIMARY_BLUE }}>
//           <FileTextOutlined style={{ marginRight: 6 }} />
//           {text}
//         </div>
//       ),
//     },
//     {
//       title: "Customer No",
//       dataIndex: "customerNumber",
//       width: 120,
//       render: (text) => (
//         <span style={{ color: SECONDARY_PURPLE }}>{text || "—"}</span>
//       ),
//     },
//     {
//       title: "Customer Name",
//       dataIndex: "customerName",
//       width: 180,
//       render: (text) => (
//         <span style={{ fontWeight: 600, color: PRIMARY_BLUE }}>
//           <CustomerServiceOutlined style={{ marginRight: 6 }} />
//           {text}
//         </span>
//       ),
//     },
//     {
//       title: "Loan Type",
//       dataIndex: "loanType",
//       width: 130,
//     },
//     {
//       title: "RM",
//       dataIndex: "assignedToRM",
//       width: 140,
//       render: (rm) => (
//         <span>
//           <UserOutlined style={{ marginRight: 6 }} />
//           {rm?.name || "N/A"}
//         </span>
//       ),
//     },
//     {
//       title: "Docs",
//       dataIndex: "documents",
//       width: 80,
//       align: "center",
//       render: (docs = []) => {
//         const total =
//           docs.reduce((sum, d) => sum + (d.docList?.length || 0), 0) || 0;

//         return (
//           <Tag
//             color={LIGHT_YELLOW}
//             style={{
//               fontWeight: "bold",
//               borderRadius: 999,
//               border: `1px solid ${HIGHLIGHT_GOLD}`,
//             }}
//           >
//             {total}
//           </Tag>
//         );
//       },
//     },
//     {
//       title: "Submitted",
//       dataIndex: "submittedToCreatorAt",
//       width: 120,
//       render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
//     },
//     {
//       title: "SLA",
//       dataIndex: "slaExpiry",
//       width: 90,
//       render: (date) => {
//         const daysLeft = dayjs(date).diff(dayjs(), "days");
//         return (
//           <Tag
//             color={
//               daysLeft <= 2
//                 ? ERROR_RED
//                 : daysLeft <= 5
//                 ? WARNING_ORANGE
//                 : SUCCESS_GREEN
//             }
//           >
//             {daysLeft > 0 ? `${daysLeft}d` : "Expired"}
//           </Tag>
//         );
//       },
//     },
//     {
//       title: "Status",
//       width: 120,
//       render: () => (
//         <Tag color={isCurrentTab ? "orange" : "green"}>
//           {isCurrentTab ? "Pending Review" : "co_checker_review"}
//         </Tag>
//       ),
//     },
//   ];

//   /* ---------------- TABLE STYLES ---------------- */
//   const customTableStyles = `
//     .myqueue-table .ant-table-wrapper {
//       border-radius: 12px;
//       overflow: hidden;
//       box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
//       border: 1px solid #e0e0e0;
//     }
//     .myqueue-table .ant-table-thead > tr > th {
//       background-color: #f7f7f7 !important;
//       color: ${PRIMARY_BLUE} !important;
//       font-weight: 700;
//       border-bottom: 3px solid ${ACCENT_LIME} !important;
//     }
//     .myqueue-table .ant-table-tbody > tr:hover > td {
//       background-color: rgba(181, 211, 52, 0.1) !important;
//       cursor: pointer;
//     }
//   `;

//   /* ---------------- RENDER ---------------- */
//   return (
//     <div style={{ padding: 24 }}>
//       <style>{customTableStyles}</style>

//       {/* HEADER */}
//       <Card
//         style={{
//           marginBottom: 24,
//           borderLeft: `4px solid ${ACCENT_LIME}`,
//         }}
//       >
//         <h2 style={{ margin: 0, color: PRIMARY_BLUE }}>My Queue</h2>
//         <p style={{ marginTop: 4, color: "#666" }}>
//           Review pending and completed checklists
//         </p>
//       </Card>

//       {/* FILTER */}
//       <Card size="small" style={{ marginBottom: 16 }}>
//         <Row gutter={16}>
//           <Col md={12}>
//             <Input
//               prefix={<SearchOutlined />}
//               placeholder="Search DCL / Customer / Loan"
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               allowClear
//             />
//           </Col>
//         </Row>
//       </Card>

//       {/* TABS */}
//       <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
//         <TabPane tab="Current Queue" key="current">
//           {isLoading ? (
//             <Spin style={{ display: "block", margin: 40 }} />
//           ) : currentQueue.length === 0 ? (
//             <Empty description="No pending items" />
//           ) : (
//             <div className="myqueue-table">
//               <Table
//                 rowKey="_id"
//                 columns={getColumns(true)}
//                 dataSource={currentQueue}
//                 pagination={{ pageSize: 10 }}
//                 onRow={(r) => ({
//                   onClick: () => setSelectedChecklist(r),
//                 })}
//               />
//             </div>
//           )}
//         </TabPane>

//         <TabPane tab="Previous Queue" key="previous">
//           {isLoading ? (
//             <Spin style={{ display: "block", margin: 40 }} />
//           ) : previousQueue.length === 0 ? (
//             <Empty description="No approved items" />
//           ) : (
//             <div className="myqueue-table">
//               <Table
//                 rowKey="_id"
//                 columns={getColumns(false)}
//                 dataSource={previousQueue}
//                 pagination={{ pageSize: 10 }}
//                 onRow={(r) => ({
//                   onClick: () => setSelectedChecklist(r),
//                 })}
//               />
//             </div>
//           )}
//         </TabPane>
//       </Tabs>

//       {/* MODAL */}
//       {selectedChecklist && (
//         <ReviewChecklistModal
//           checklist={selectedChecklist}
//           open={!!selectedChecklist}
//           onClose={() => setSelectedChecklist(null)}
//         />
//         // <CreatorQueueChecklistModal
//         //   open
//         //   checklist={selectedChecklist}
//         //   onClose={() => {
//         //     setSelectedChecklist(null);
//         //     refetch();
//         //   }}
//         //   sourceType={activeTab === "current" ? "from_rm" : "from_checker"}
//         // />
//       )}
//     </div>
//   );
// };

// export default Myqueue;










import React, { useMemo, useState } from "react";
import {
  Button,
  Table,
  Tag,
  Spin,
  Empty,
  Tabs,
  Card,
  Row,
  Col,
  Input,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import CreatorQueueChecklistModal from "../../components/modals/CreatorQueueChecklistModal";
import { useGetAllCoCreatorChecklistsQuery } from "../../api/checklistApi";
import dayjs from "dayjs";
import ReviewChecklistModal from "../../components/modals/ReviewChecklistModal";

/* ---------------- THEME COLORS ---------------- */
const PRIMARY_BLUE = "#164679";
const ACCENT_LIME = "#b5d334";
const HIGHLIGHT_GOLD = "#fcb116";
const LIGHT_YELLOW = "#fcd716";
const SECONDARY_PURPLE = "#7e6496";
const SUCCESS_GREEN = "#52c41a";
const ERROR_RED = "#ff4d4f";
const WARNING_ORANGE = "#faad14";

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Myqueue = () => {
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [activeTab, setActiveTab] = useState("current");
  const [searchText, setSearchText] = useState("");

  /* ---------------- FETCH DATA ---------------- */
  const {
    data: allChecklists = [],
    isLoading,
    refetch,
  } = useGetAllCoCreatorChecklistsQuery();

  /* ---------------- CURRENT QUEUE (PENDING) ---------------- */

  const currentQueue = useMemo(() => {
    let filtered = allChecklists.filter((c) =>
      ["co_creator_review", "rm_review"].includes(
        (c.status || "").toLowerCase()
      )
    );

    if (searchText) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.dclNo?.toLowerCase().includes(q) ||
          c.customerNumber?.toLowerCase().includes(q) ||
          c.customerName?.toLowerCase().includes(q) ||
          c.loanType?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [allChecklists, searchText]);

  // const currentQueue = useMemo(() => {
  //   let filtered = allChecklists.filter(
  //     (c) => (c.status || "").toLowerCase() === "co_creator_review"
  //   );

  //   if (searchText) {
  //     const q = searchText.toLowerCase();
  //     filtered = filtered.filter(
  //       (c) =>
  //         c.dclNo?.toLowerCase().includes(q) ||
  //         c.customerNumber?.toLowerCase().includes(q) ||
  //         c.customerName?.toLowerCase().includes(q) ||
  //         c.loanType?.toLowerCase().includes(q)
  //     );
  //   }

  //   return filtered;
  // }, [allChecklists, searchText]);

  /* ---------------- PREVIOUS QUEUE (APPROVED) ---------------- */
  const previousQueue = useMemo(() => {
    let filtered = allChecklists.filter(
      (c) => (c.status || "").toLowerCase() === "co_checker_review"
    );

    if (searchText) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.dclNo?.toLowerCase().includes(q) ||
          c.customerNumber?.toLowerCase().includes(q) ||
          c.customerName?.toLowerCase().includes(q) ||
          c.loanType?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [allChecklists, searchText]);

  /* ---------------- TABLE COLUMNS ---------------- */
  const getColumns = (isCurrentTab) => [
    {
      title: "DCL No",
      dataIndex: "dclNo",
      width: 140,
      render: (text) => (
        <div style={{ fontWeight: "bold", color: PRIMARY_BLUE }}>
          <FileTextOutlined style={{ marginRight: 6 }} />
          {text}
        </div>
      ),
    },
    {
      title: "Customer No",
      dataIndex: "customerNumber",
      width: 120,
      render: (text) => (
        <span style={{ color: SECONDARY_PURPLE }}>{text || "—"}</span>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      width: 180,
      render: (text) => (
        <span style={{ fontWeight: 600, color: PRIMARY_BLUE }}>
          <CustomerServiceOutlined style={{ marginRight: 6 }} />
          {text}
        </span>
      ),
    },
    {
      title: "Loan Type",
      dataIndex: "loanType",
      width: 130,
    },
    {
      title: "RM",
      dataIndex: "assignedToRM",
      width: 140,
      render: (rm) => (
        <span>
          <UserOutlined style={{ marginRight: 6 }} />
          {rm?.name || "N/A"}
        </span>
      ),
    },
    {
      title: "Docs",
      dataIndex: "documents",
      width: 80,
      align: "center",
      render: (docs = []) => {
        const total =
          docs.reduce((sum, d) => sum + (d.docList?.length || 0), 0) || 0;

        return (
          <Tag
            color={LIGHT_YELLOW}
            style={{
              fontWeight: "bold",
              borderRadius: 999,
              border: `1px solid ${HIGHLIGHT_GOLD}`,
            }}
          >
            {total}
          </Tag>
        );
      },
    },
    {
      title: "Submitted",
      dataIndex: "submittedToCreatorAt",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "SLA",
      dataIndex: "slaExpiry",
      width: 90,
      render: (date) => {
        const daysLeft = dayjs(date).diff(dayjs(), "days");
        return (
          <Tag
            color={
              daysLeft <= 2
                ? ERROR_RED
                : daysLeft <= 5
                ? WARNING_ORANGE
                : SUCCESS_GREEN
            }
          >
            {daysLeft > 0 ? `${daysLeft}d` : "Expired"}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      width: 120,
      render: () => (
        <Tag color={isCurrentTab ? "orange" : "green"}>
          {isCurrentTab ? "Pending Review" : "co_checker_review"}
        </Tag>
      ),
    },
  ];

  /* ---------------- TABLE STYLES ---------------- */
  const customTableStyles = `
    .myqueue-table .ant-table-wrapper {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
      border: 1px solid #e0e0e0;
    }
    .myqueue-table .ant-table-thead > tr > th {
      background-color: #f7f7f7 !important;
      color: ${PRIMARY_BLUE} !important;
      font-weight: 700;
      border-bottom: 3px solid ${ACCENT_LIME} !important;
    }
    .myqueue-table .ant-table-tbody > tr:hover > td {
      background-color: rgba(181, 211, 52, 0.1) !important;
      cursor: pointer;
    }
  `;

  /* ---------------- RENDER ---------------- */
  return (
    <div style={{ padding: 24 }}>
      <style>{customTableStyles}</style>

      {/* HEADER */}
      <Card
        style={{
          marginBottom: 24,
          borderLeft: `4px solid ${ACCENT_LIME}`,
        }}
      >
        <h2 style={{ margin: 0, color: PRIMARY_BLUE }}>My Queue</h2>
        <p style={{ marginTop: 4, color: "#666" }}>
          Review pending and completed checklists
        </p>
      </Card>

      {/* FILTER */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col md={12}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search DCL / Customer / Loan"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* TABS */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab="Current Queue" key="current">
          {isLoading ? (
            <Spin style={{ display: "block", margin: 40 }} />
          ) : currentQueue.length === 0 ? (
            <Empty description="No pending items" />
          ) : (
            <div className="myqueue-table">
              <Table
                rowKey="_id"
                columns={getColumns(true)}
                dataSource={currentQueue}
                pagination={{ pageSize: 10 }}
                onRow={(r) => ({
                  onClick: () => setSelectedChecklist(r),
                })}
              />
            </div>
          )}
        </TabPane>

        <TabPane tab="Previous Queue" key="previous">
          {isLoading ? (
            <Spin style={{ display: "block", margin: 40 }} />
          ) : previousQueue.length === 0 ? (
            <Empty description="No approved items" />
          ) : (
            <div className="myqueue-table">
              <Table
                rowKey="_id"
                columns={getColumns(false)}
                dataSource={previousQueue}
                pagination={{ pageSize: 10 }}
                onRow={(r) => ({
                  onClick: () => setSelectedChecklist(r),
                })}
              />
            </div>
          )}
        </TabPane>
      </Tabs>

      {/* MODAL */}
      {selectedChecklist && (
        <ReviewChecklistModal
          checklist={selectedChecklist}
          open={!!selectedChecklist}
          onClose={() => setSelectedChecklist(null)}
        />
        // <CreatorQueueChecklistModal
        //   open
        //   checklist={selectedChecklist}
        //   onClose={() => {
        //     setSelectedChecklist(null);
        //     refetch();
        //   }}
        //   sourceType={activeTab === "current" ? "from_rm" : "from_checker"}
        // />
      )}
    </div>
  );
};

export default Myqueue;