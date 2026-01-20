# DEFERRAL SYSTEM
## Architectural Design Document

**Version:** 1.0  
**Date:** January 19, 2026  
**Project Name:** Deferral System

---

## TABLE OF CONTENTS
1. Executive Summary
2. Deferral Subsystem Overview
3. Architecture Overview
4. Technology Stack
5. Deferral Components
6. Deferral Data Model
7. Deferral API Architecture
8. User Roles & Deferral Access Control
9. Deferral Workflows
10. Deployment Architecture
11. Security Architecture
12. Performance Considerations
13. Error Handling & Logging
14. Appendices (Diagrams)

---

## 1. EXECUTIVE SUMMARY

The Deferral System is a specialized application that manages the complete lifecycle of loan deferral requests. This system handles the creation, approval, and tracking of deferral requests from customers seeking to defer their loan obligations.

### Key Objectives:
- Manage loan deferral request creation and submission
- Enable multi-tier approval workflows (Creator → Checker → Approver)
- Track deferral status and approval progression
- Manage deferral-specific documents and facilities
- Maintain audit trail of deferral actions
- Generate deferral reports and PDFs

### Key Features:
- Sequential deferral number generation (DEF-YY-XXXX format)
- Multi-stage approval tracking with approval history
- Facility information management (sanctioned amount, balance, headroom)
- Document management (DCL documents, additional documents, selected documents)
- Comment and discussion threads on deferrals
- Email notifications for approvals and actions
- PDF generation and export capabilities
- SLA tracking for deferral requests

---

## 2. DEFERRAL SUBSYSTEM OVERVIEW

### 2.1 Purpose
The Deferral Subsystem manages the specialized workflow for handling customer requests to defer loan obligations, including:
- Deferral request creation with facility information
- Multi-level approval process (Creator, Checker, Approver)
- Document collection and validation
- Status tracking and history management
- Customer and approver notifications
- Deferral analytics and reporting

### 2.2 Scope
**In Scope:**
- Deferral creation and initialization
- Multi-tier approval workflows
- Deferral document management
- Approval status tracking
- Facility management within deferrals
- Comment and discussion system
- PDF generation for deferrals
- Email notifications
- Deferral queuing and status queries
- Return for rework workflow
- Rejection handling

**Out of Scope:**
- Core banking system integration (currently mocked via customerRoutes)
- Advanced analytics and reporting dashboards
- Integration with external document management systems
- Mobile application support
- Real-time WebSocket updates

### 2.3 Stakeholder User Types (for Deferrals)
1. **RM (Relationship Manager)** - Creates deferral requests
2. **CO Creator** - Provides approval at creation stage
3. **Checker (Co-Checker)** - Verifies documents and approves
4. **Approver** - Provides final multi-level approvals
5. **Customer** - Submits documents for deferral
6. **Admin** - System management and oversight

---

## 3. DEFERRAL SUBSYSTEM ARCHITECTURE OVERVIEW

### 3.1 High-Level Deferral Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│              DEFERRAL FRONTEND COMPONENTS                         │
│         (React Components - src/pages/deferrals/)                │
│  ├─ DeferralForm.jsx          (Create/Edit deferral)            │
│  └─ DeferralPending.jsx       (View pending deferrals)          │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                    HTTPS/REST API
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              DEFERRAL API ROUTES                                  │
│    (Express Router - routes/deferralRoutes.js)                  │
│    Base: /api/deferrals                                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
┌───────▼──────────────┐        ┌───────────▼────────┐
│ DEFERRAL CONTROLLER  │        │ MIDDLEWARE STACK   │
│(deferralController)  │        │ ├─ protect (JWT)  │
├──────────────────────┤        │ ├─ authorize      │
│ • createDeferral     │        │ ├─ uploadSingle  │
│ • getDeferral        │        │ ├─ validation    │
│ • approveDeferral    │        │ └─ errorHandler  │
│ • rejectDeferral     │        └────────────────────┘
│ • returnForRework    │
│ • getApproverQueue   │
│ • generatePDF        │
└──────────┬───────────┘
           │
    ┌──────▴───────────────────────┐
    │   DEFERRAL DATA LAYER        │
    ├──────────────────────────────┤
    │  MongoDB Collections         │
    │  • Deferrals (main)          │
    │  • Documents (embedded)      │
    │  • Approvers (embedded)      │
    │  • History (audit trail)     │
    │  • Comments (discussions)    │
    └──────────────────────────────┘
            │
    ┌───────▴────────────┐
    │  FILE STORAGE      │
    │  /uploads/         │
    │  (deferral docs)   │
    └────────────────────┘
```

### 3.2 Deferral Architectural Patterns

**1. MVC Pattern (Deferral-Specific)**
- **Model:** Deferral.js (MongoDB schema with embedded documents)
- **View:** React components (DeferralForm, DeferralPending)
- **Controller:** deferralController.js (business logic)

**2. Approval State Machine**
```
pending_approval → in_review → approved/rejected/returned_for_rework
```

**3. Multi-Stage Approval Pattern**
- Creator approval stage
- Checker approval stage  
- Approver queue progression

**4. Document Management Pattern**
- Main documents (DCL documents)
- Additional documents (supplementary)
- Selected documents (customer choices)

---

## 4. TECHNOLOGY STACK (DEFERRAL SUBSYSTEM)

### 4.1 Frontend Deferral Components

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React | 19.2.0 |
| **Routing** | React Router DOM | 7.9.6 |
| **Build Tool** | Vite | Latest |
| **UI Library** | Ant Design | 5.29.1 |
| **HTTP Client** | Axios | 1.13.2 |
| **Date Handling** | Day.js | 1.11.19 |
| **PDF Export** | jsPDF + jspdf-autotable | 3.0.4 |
| **File Upload** | Ant Design Upload | 5.29.1 |
| **Icons** | Ant Design Icons | 5.6.1 |

**Key Deferral Components:**
- `DeferralForm.jsx` - Create/edit deferral requests
- `DeferralPending.jsx` - View and manage pending deferrals

### 4.2 Backend Deferral Services

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Express.js | 5.1.0 |
| **Runtime** | Node.js | Latest |
| **Database** | MongoDB | Latest |
| **ODM** | Mongoose | 8.19.3 |
| **File Upload** | Multer | 2.0.2 |
| **PDF Generation** | PDFKit | 0.17.2 |
| **Email Service** | Nodemailer | 6.9.4 |
| **Authentication** | JWT | 9.0.2 |
| **Password Hash** | bcryptjs | 3.0.3 |
| **Environment** | dotenv | 17.2.3 |

**Key Backend Files:**
- `controllers/deferralController.js` - Business logic
- `routes/deferralRoutes.js` - API endpoints
- `models/Deferral.js` - Data schema
- `middleware/upload.js` - File upload handling
- `services/emailService.js` - Email notifications

---

## 5. DEFERRAL COMPONENTS

### 5.1 Frontend Deferral Component Structure

```
deferral/src/
├── pages/
│   └── deferrals/
│       ├── DeferralForm.jsx           # Create/Edit deferral requests
│       │   ├─ Customer selection
│       │   ├─ Facility configuration
│       │   ├─ Document management
│       │   ├─ Approver selection
│       │   └─ Submission workflow
│       │
│       └── DeferralPending.jsx        # View/Manage pending deferrals
│           ├─ Status filtering
│           ├─ Approval queue display
│           ├─ Comment system
│           ├─ Approval/Rejection actions
│           └─ PDF export
│
├── api/
│   └── [Redux slices for deferral state]
│
└── service/
    ├── deferralApi.js               # Deferral API service layer
    └── [Deferral-specific utilities]
```

### 5.2 Backend Deferral Component Structure

```
defferaldclb/
├── controllers/
│   └── deferralController.js         # Deferral business logic
│       ├─ createDeferral()           # Create new deferral
│       ├─ getDeferral()              # Retrieve deferral details
│       ├─ getPendingDeferrals()      # Get pending queue
│       ├─ getApproverQueue()         # Get approver's work items
│       ├─ approveDeferral()          # Approve workflow
│       ├─ rejectDeferral()           # Reject with reason
│       ├─ returnForRework()          # Return for rework
│       ├─ postComment()              # Add comments
│       ├─ addDocument()              # Attach documents
│       ├─ uploadDocument()           # File upload handler
│       ├─ deleteDocument()           # Remove document
│       ├─ updateFacilities()         # Update facility info
│       ├─ generatePDF()              # PDF export
│       ├─ getNextDeferralNumber()    # Sequential numbering
│       └─ [Additional handlers]
│
├── models/
│   └── Deferral.js                  # Deferral schema
│       ├─ documentSchema            # Embedded document structure
│       ├─ facilitySchema            # Loan facility details
│       ├─ approverSchema            # Approver tracking
│       ├─ selectedDocumentSchema    # Document selections
│       └─ [Validation rules]
│
├── routes/
│   └── deferralRoutes.js            # REST endpoints
│       ├─ POST /                    # Create deferral
│       ├─ GET /                     # List deferrals
│       ├─ GET /:id                  # Get details
│       ├─ GET /pending              # Pending queue
│       ├─ GET /approver/queue       # Approver queue
│       ├─ PUT /:id/approve          # Approve workflow
│       ├─ PUT /:id/reject           # Reject deferral
│       ├─ PUT /:id/return-for-rework
│       ├─ POST /:id/comments        # Comments
│       ├─ POST /:id/documents       # Document mgmt
│       ├─ POST /:id/documents/upload
│       ├─ GET /:id/pdf              # PDF export
│       └─ [Additional routes]
│
├── middleware/
│   ├── authMiddleware.js            # JWT verification
│   ├── roleMiddleware.js            # Role authorization
│   ├── upload.js                    # Multer config
│   └── errorHandler.js              # Error handling
│
├── services/
│   ├── emailService.js              # Email notifications
│   └── emailTemplates.js            # Email templates
│       ├─ deferralSubmissionTemplate
│       ├─ deferralApprovalTemplate
│       ├─ deferralRejectionTemplate
│       └─ deferralReminderTemplate
│
└── uploads/                         # File storage directory
    └── [deferral documents]
```

### 5.3 Deferral Data Flow

```
Frontend Request
      ↓
DeferralForm / DeferralPending Component
      ↓
Redux Action (deferralSlice)
      ↓
Axios HTTP Request → deferralApi.service.js
      ↓
Backend Express Route (deferralRoutes)
      ↓
Middleware Stack:
├─ protect (authMiddleware) - Verify JWT
├─ authorization check
├─ validation
└─ upload handling (if file)
      ↓
deferralController.js
├─ Input validation
├─ Business logic
├─ Database queries
└─ Email notifications
      ↓
MongoDB Deferral Collection
      ↓
Response JSON
      ↓
Redux Store Update
      ↓
Component Re-render
```

---

## 6. DEFERRAL DATA MODEL

### 6.1 Deferral Schema (Complete)

```javascript
{
  // Identification
  deferralNumber: String (unique, auto-generated DEF-YY-XXXX),
  
  // Customer Information
  customer: ObjectId (ref: User),
  customerNumber: String,
  customerName: String,
  businessName: String,
  requestor: ObjectId (ref: User),
  
  // Loan Details
  loanType: String,
  deferralTitle: String,
  loanAmount: Number,
  daysSought: Number,
  nextDocumentDueDate: Date,
  deferralDescription: String,
  dclNumber: String (DCL reference number),
  
  // Facilities (Loan accounts to defer)
  facilities: [
    {
      type: String,           // e.g., "Term Loan", "Overdraft"
      sanctioned: Number,     // Sanctioned amount
      balance: Number,        // Current balance
      headroom: Number        // Available amount
    }
  ],
  
  // Documents
  documents: [DocumentSchema],
  additionalDocuments: [DocumentSchema],
  selectedDocuments: [SelectedDocumentSchema],
  
  // Document Schema Detail
  DocumentSchema: {
    name: String,
    url: String,
    type: String,            // File extension
    size: Number,            // File size
    uploadDate: Date,
    isDCL: Boolean,
    isAdditional: Boolean,
    uploadedBy: ObjectId (ref: User)
  },
  
  SelectedDocumentSchema: {
    name: String,            // e.g., "Customer Identification"
    type: String,
    items: [String]          // e.g., ["KRA", "Passport", "ID"]
  },
  
  // Approval Workflow
  approvers: [
    {
      role: String,          // e.g., "creator", "checker", "approver"
      user: ObjectId (ref: User),
      approved: Boolean,
      approvedAt: Date
    }
  ],
  currentApproverIndex: Number,  // Current position in approval chain
  allApproversApproved: Boolean,
  
  // Three-Stage Approval
  creatorApprovalStatus: Enum ["pending", "approved", "rejected"],
  creatorApprovalDate: Date,
  creatorApprovedBy: ObjectId (ref: User),
  
  checkerApprovalStatus: Enum ["pending", "approved", "rejected"],
  checkerApprovalDate: Date,
  checkerApprovedBy: ObjectId (ref: User),
  
  creator: ObjectId (ref: User),
  checker: ObjectId (ref: User),
  
  // Status Management
  status: Enum [
    "pending_approval",      // Initial state
    "in_review",             // Under review
    "approved",              // Final approval
    "rejected",              // Rejected
    "returned_for_rework"    // Sent back for changes
  ],
  
  // Approval Results
  approvedBy: String,
  approvedById: ObjectId (ref: User),
  approvedDate: Date,
  
  rejectedBy: String,
  rejectedById: ObjectId (ref: User),
  rejectedDate: Date,
  rejectionReason: String,
  
  // Rework Request
  reworkRequestedBy: String,
  reworkRequestedById: ObjectId (ref: User),
  reworkRequestedDate: Date,
  reworkComments: String,
  approverComments: String,
  
  // Comments & Discussion
  comments: [
    {
      author: ObjectId (ref: User),
      text: String,
      createdAt: Date (default: now)
    }
  ],
  
  // Audit Trail
  history: [
    {
      action: String,        // e.g., "created", "approved", "rejected", "commented"
      user: ObjectId (ref: User),
      userName: String,
      notes: String,
      date: Date (default: now)
    }
  ],
  
  // SLA & Timing
  slaExpiry: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 6.2 Deferral Status Lifecycle

```
┌─────────────────┐
│  pending_approval│  ← Initial state when created
└────────┬────────┘
         │
┌────────▼──────────┐
│    in_review      │  ← During approval process
└────────┬──────────┘
         │
    ┌────┴──────────┐
    │               │
┌───▼────────┐  ┌──▼─────────┐  ┌──────────────────────┐
│  approved  │  │ rejected   │  │ returned_for_rework  │
└────────────┘  └────────────┘  └──────────┬───────────┘
                                            │
                                   Back to in_review
```

### 6.3 Approval Chain Structure

```
Deferral Creation by RM
         │
         ├─ Creator (CO Creator) Stage
         │  ├─ creatorApprovalStatus: pending → approved/rejected
         │  └─ creatorApprovedBy: User reference
         │
         ├─ Checker (Co-Checker) Stage  
         │  ├─ checkerApprovalStatus: pending → approved/rejected
         │  └─ checkerApprovedBy: User reference
         │
         └─ Approver(s) Stage
            ├─ approvers[]: Multi-level approvers
            ├─ currentApproverIndex: Position in queue
            └─ allApproversApproved: All signed off?
```

---

## 7. DEFERRAL API ARCHITECTURE

### 7.1 Deferral REST Endpoints (`/api/deferrals`)

#### Core Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| **POST** | `/` | Create new deferral | ✓ | RM, Creator |
| **GET** | `/` | List all deferrals | ✓ | All |
| **GET** | `/:id` | Get deferral details | ✓ | All |
| **GET** | `/pending` | Get pending deferrals | ✓ | All |
| **GET** | `/approver/queue` | Get user's approval queue | ✓ | Approver |
| **GET** | `/approver/actioned` | Get completed approvals | ✓ | Approver |
| **GET** | `/my` | Get user's deferrals | ✓ | All |
| **GET** | `/approved` | Get approved deferrals | ✓ | All |
| **GET** | `/preview-number` | Get next deferral number | ✗ | - |

#### Approval Workflow Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| **PUT** | `/:id/approve` | Approve deferral | ✓ | Approver |
| **PUT** | `/:id/approve-by-creator` | Creator approval | ✓ | Creator |
| **PUT** | `/:id/approve-by-checker` | Checker approval | ✓ | Checker |
| **PUT** | `/:id/reject` | Reject deferral | ✓ | Approver |
| **PUT** | `/:id/return-for-rework` | Return for rework | ✓ | Approver |

#### Document Management

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| **POST** | `/:id/documents` | Add document reference | ✓ | All |
| **POST** | `/:id/documents/upload` | Upload file | ✓ | All |
| **DELETE** | `/:id/documents/:docId` | Delete document | ✓ | Creator |
| **PUT** | `/:id/facilities` | Update facilities | ✓ | RM |

#### Comments & History

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| **POST** | `/:id/comments` | Add comment | ✓ | All |
| **GET** | `/:id/comments` | Get comments | ✓ | All |

#### Utilities

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| **GET** | `/:id/pdf` | Generate PDF export | ✓ | All |
| **PUT** | `/:id/approvers` | Set approvers | ✓ | Admin |
| **DELETE** | `/:id/approvers/:index` | Remove approver | ✓ | Admin |

### 7.2 Request/Response Examples

**Create Deferral Request:**
```json
POST /api/deferrals
{
  "customerId": "user-123",
  "loanType": "Term Loan",
  "deferralTitle": "6-Month Deferral Request",
  "loanAmount": 500000,
  "daysSought": 180,
  "nextDocumentDueDate": "2026-07-19",
  "deferralDescription": "Temporary cash flow relief",
  "dclNumber": "DCL-2026-001",
  "facilities": [
    {
      "type": "Term Loan",
      "sanctioned": 1000000,
      "balance": 750000,
      "headroom": 250000
    }
  ],
  "selectedDocuments": [
    {
      "name": "Financial Statements",
      "items": ["Q4 2025", "Q1 2026"]
    }
  ],
  "approvers": [
    { "role": "creator", "user": "creator-user-id" },
    { "role": "checker", "user": "checker-user-id" },
    { "role": "approver", "user": "approver-user-id" }
  ]
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "statusCode": 201,
  "data": {
    "_id": "deferral-mongo-id",
    "deferralNumber": "DEF-26-0001",
    "customerName": "John Smith",
    "loanAmount": 500000,
    "status": "pending_approval",
    "createdAt": "2026-01-19T10:30:00Z",
    "approvers": [...],
    "documents": []
  }
}
```

**Approve Deferral:**
```json
PUT /api/deferrals/deferral-id/approve
{
  "approvalComments": "All documents verified and in order"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "statusCode": 400,
  "error": "Validation failed",
  "message": "DCL number is required for deferral creation"
}
```

### 7.3 Deferral Number Generation

**Format:** DEF-YY-XXXX
- **DEF** = Fixed prefix
- **YY** = Current year (2026 → 26)
- **XXXX** = Sequential 4-digit number (0001-9999)

**Example:** DEF-26-0001, DEF-26-0002, etc.

**Generation Logic:**
1. Get current year (last 2 digits)
2. Query database for max sequence number with current year prefix
3. Increment and pad with zeros
4. Combine with prefix

### 7.4 Authentication & Authorization

**JWT Token Flow:**
```
1. Login → Get JWT Token
2. Include in Authorization header: "Bearer <token>"
3. Server validates via authMiddleware
4. roleMiddleware checks permissions
5. Route handler processes request
```

**Protected Route Example:**
```javascript
// Routes with 'protect' middleware require valid JWT
router.put("/:id/approve", protect, approveDeferral);

// roleMiddleware adds role-based checks
router.post("/seed", protect, authorizeRoles('admin'), seedDeferrals);
```

---

## 8. USER ROLES & DEFERRAL ACCESS CONTROL

### 8.1 Deferral-Related Roles

| Role | Full Name | Key Deferral Responsibilities |
|------|-----------|------------------------------|
| **RM** | Relationship Manager | Create deferrals, specify facilities, submit for approval |
| **Creator** (CO Creator) | Credit Officer Creator | Approve deferral at creation stage, provide initial review |
| **Checker** (Co-Checker) | Document Checker | Verify documents, approve completeness, check compliance |
| **Approver** | Loan Approver | Final approval authority, authorize deferral requests |
| **Admin** | Administrator | System oversight, user management, configuration |
| **Customer** | Loan Applicant | Submit required documents, view status |

### 8.2 Deferral Permission Matrix

| Deferral Action | RM | Creator | Checker | Approver | Customer | Admin |
|-----------------|----|---------|---------|-----------|----|-------|
| Create deferral | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| View deferral | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit own deferral | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Add facilities | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Approve (Creator) | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Approve (Checker) | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Approve (Final) | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Reject | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Return for rework | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Upload documents | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Add comments | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View approval queue | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Export PDF | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### 8.3 Access Control Implementation

**Frontend Route Protection:**
```javascript
// ProtectedRoute component checks auth & role
<Route element={<ProtectedRoute requiredRole="approver" />}>
  <Route path="/approver" element={<ApproverLayout />} />
</Route>
```

**Backend Middleware Stack:**
```javascript
// Applied to protected routes
router.put("/:id/approve", 
  protect,                    // Verify JWT token
  authorizeRoles('approver'), // Check role
  approveDeferral             // Handler
);
```

**Middleware Implementation:**
```javascript
// authMiddleware.js - Verify JWT
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token" });
  jwt.verify(token, process.env.JWT_SECRET);
  // decoded user attached to req.user
  next();
};

// roleMiddleware.js - Check permissions
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};
```

---

## 9. DEFERRAL WORKFLOWS

### 9.1 Deferral Creation & Approval Workflow

```
┌──────────────────────────────────────────────────┐
│   START: Loan Customer Requests Deferral        │
└────────────────────┬─────────────────────────────┘
                     │
         ┌───────────▼──────────────┐
         │  1. RM Creates Deferral  │
         │  ├─ Select customer      │
         │  ├─ Enter loan details   │
         │  ├─ Add facilities info  │
         │  ├─ Specify approvers    │
         │  └─ Set deferral period  │
         └───────────┬──────────────┘
                     │
         ┌───────────▼───────────────────────┐
         │  2. System Generates Deferral ID  │
         │  └─ Format: DEF-26-0001          │
         └───────────┬───────────────────────┘
                     │
         ┌───────────▼──────────────────────────────┐
         │  3. Creator Stage Approval              │
         │  ├─ Review deferral details              │
         │  ├─ Approve or reject                    │
         │  └─ Status: creatorApprovalStatus       │
         └──────┬──────────────┬────────────────────┘
                │              │
       APPROVED │              │ REJECTED
         ┌──────▼──┐          ┌─▼──────────────┐
         │ Move to │          │ Return to RM   │
         │ Checker │          │ for Revision   │
         └──────┬──┘          └────────────────┘
                │
         ┌──────▼───────────────────────────────────┐
         │  4. Checker Stage Approval              │
         │  ├─ Verify documents                     │
         │  ├─ Check compliance                     │
         │  ├─ Approve or reject                    │
         │  └─ Status: checkerApprovalStatus       │
         └──────┬──────────────┬────────────────────┘
                │              │
       APPROVED │              │ REJECTED
         ┌──────▼──┐          ┌─▼──────────────┐
         │ Move to │          │ Return to RM   │
         │Approver │          │ for Revision   │
         │ Queue   │          └────────────────┘
         └──────┬──┘
                │
         ┌──────▼──────────────────────────────┐
         │  5. Approver Queue Processing       │
         │  ├─ Enter approver work queue       │
         │  ├─ Await approver action           │
         │  └─ currentApproverIndex progresses │
         └──────┬──────┬──────────┬────────────┘
                │      │          │
       APPROVED │      │ REJECTED │ REWORK
         ┌──────▼──┐  ┌─▼──────┐  ┌─▼──────────────┐
         │ Next    │  │Reject  │  │ Return for     │
         │Approver │  │and     │  │ Rework with    │
         │in Chain │  │Notify  │  │ Comments       │
         └──────┬──┘  └────┬───┘  └────┬───────────┘
                │          │           │
                │      FINAL          Back to
                │      REJECT         in_review
         ┌──────▼──────────┐
         │ All Approvers   │
         │ Approved?       │
         │ YES ↓           │
         │ allApproversApproved = true
         └──────┬──────────┘
                │
         ┌──────▼──────────────────┐
         │  6. Final Approval      │
         │  ├─ Status: approved    │
         │  ├─ approvedDate set    │
         │  ├─ approvedBy recorded │
         │  └─ Notify all parties  │
         └──────┬──────────────────┘
                │
         ┌──────▼────────────────────┐
         │  END: Deferral Approved  │
         │  Customer can proceed    │
         └───────────────────────────┘
```

### 9.2 Deferral Document Upload Workflow

```
┌─────────────────────────────────────────┐
│ Customer/RM Needs to Submit Documents   │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼───────────────────┐
         │ DeferralForm - Upload Tab │
         │ ├─ Select document type   │
         │ ├─ Drag & drop file       │
         │ └─ Upload via Multer      │
         └───────┬───────────────────┘
                 │
         ┌───────▼────────────────────────────┐
         │ Backend: uploadDocument Handler    │
         │ ├─ Receive multipart/form-data    │
         │ ├─ Validate file type/size         │
         │ ├─ Store in /uploads directory     │
         │ └─ Generate file URL               │
         └───────┬────────────────────────────┘
                 │
         ┌───────▼──────────────────────────┐
         │ Create DocumentSchema Object     │
         │ ├─ name: filename                │
         │ ├─ url: /uploads/file-path       │
         │ ├─ type: file extension          │
         │ ├─ uploadDate: now()             │
         │ ├─ uploadedBy: user._id          │
         │ └─ isDCL/isAdditional flags      │
         └───────┬──────────────────────────┘
                 │
         ┌───────▼──────────────────────────┐
         │ Add to Deferral.documents array  │
         │ or Deferral.additionalDocuments │
         └───────┬──────────────────────────┘
                 │
         ┌───────▼──────────────────────┐
         │ Frontend: Update UI           │
         │ ├─ Show file in document list │
         │ ├─ Enable download button     │
         │ └─ Success message to user    │
         └───────────────────────────────┘
```

### 9.3 Deferral Approval Action Workflow

```
Approver Views Approval Queue (GET /approver/queue)
         │
         ├─ Shows all deferrals where:
         │  ├─ status: "pending_approval" or "in_review"
         │  ├─ currentApproverIndex points to approver
         │  └─ sorted by createdAt (oldest first)
         │
    ┌────▼─────────────────────────────┐
    │ Approver Selects Deferral        │
    │ Loads DeferralPending.jsx        │
    │ Views:                            │
    │ ├─ Customer info                  │
    │ ├─ Facilities                     │
    │ ├─ Documents                      │
    │ ├─ Comments thread                │
    │ └─ Approval history               │
    └────┬──────────────────────────────┘
         │
    ┌────┴──────────────┐
    │                   │
APPROVE            REJECT
    │                │
┌───▼─────┐   ┌──────▼────────┐
│PUT /:id │   │PUT /:id/reject│
│/approve │   └───────┬────────┘
└───┬─────┘          │
    │         ┌──────▼──────────────────┐
    │         │ Enter Rejection Reason  │
    │         │ (rejectionReason field) │
    │         └──────┬──────────────────┘
    │                │
    │         ┌──────▼──────────────────┐
    │         │ Update Deferral Status  │
    │         │ └─ status: "rejected"   │
    │         │ └─ rejectedDate: now    │
    │         │ └─ rejectedBy: req.user │
    │         └──────┬──────────────────┘
    │                │
    │         ┌──────▼──────────────────┐
    │         │ Add to History          │
    │         │ └─ action: "rejected"   │
    │         └──────┬──────────────────┘
    │                │
    │         ┌──────▼──────────────────┐
    │         │ Send Email Notification │
    │         │ (deferralRejectionTmpl) │
    │         └──────────────────────────┘
    │
    ├─ Increment approverIndex
    │
    ├─ Check: Are all approvers done?
    │  ├─ Yes: allApproversApproved = true
    │  └─ No: Move to next approver
    │
    ├─ Update status field
    │  ├─ If all approved: status = "approved"
    │  └─ Else: status = "in_review"
    │
    ├─ Add to History
    │  └─ action: "approved"
    │
    └─ Send Email Notification
       └─ To next approver or final confirmation
```

### 9.4 Deferral Return for Rework Workflow

```
Approver Reviews Deferral
         │
         └─ Issues Detected
           │
         ┌─▼─ Click "Return for Rework"
         │
    ┌────▼──────────────────────────────┐
    │ Enters Rework Comments             │
    │ ├─ Specify required changes        │
    │ ├─ Detail missing documents        │
    │ └─ Provide guidance                │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │ PUT /:id/return-for-rework        │
    │ Backend Handler                    │
    ├─ Set status: "returned_for_rework"│
    ├─ Store reworkComments             │
    ├─ Reset approval fields            │
    ├─ Add to history                   │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │ Send Email: Request for Rework    │
    │ └─ Include detailed comments      │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │ RM/Creator Receives Notification   │
    │ ├─ Reviews rework requirements    │
    │ ├─ Collects additional documents  │
    │ └─ Uploads new versions           │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │ Resubmits Deferral                 │
    │ └─ Status resets to in_review     │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │ Returns to Approval Queue          │
    │ └─ Approver reviews changes       │
    └────────────────────────────────────┘
```

---

## 10. DEFERRAL DEPLOYMENT ARCHITECTURE

### 10.1 Development Environment

**Frontend (Deferral UI):**
```bash
cd deferral
npm run dev
# Runs on: http://localhost:5173 (Vite default)
# Access: /deferrals routes
```

**Backend (Deferral APIs):**
```bash
cd defferaldclb
npm run dev
# Runs on: http://localhost:8000 (via nodemon)
# Deferral endpoints: /api/deferrals/*
```

### 10.2 Production Deferral Stack

```
┌────────────────────────────────────────┐
│   Users/Approvers/RMs                   │
└─────────────┬──────────────────────────┘
              │
    ┌─────────▼─────────────┐
    │  Deferral UI (React)  │
    │  - DeferralForm       │
    │  - DeferralPending    │
    │  - Approval queues    │
    └─────────┬─────────────┘
              │
    ┌─────────▼──────────────────────────┐
    │ API Gateway / Load Balancer         │
    │ Routing to /api/deferrals/*         │
    └─────────┬──────────────────────────┘
              │
    ┌─────────▼──────────────────────────┐
    │ Express.js Deferral API Server      │
    │ ├─ deferralRoutes                   │
    │ ├─ deferralController               │
    │ ├─ Email notifications              │
    │ └─ PDF generation                   │
    └─────────┬──────────────────────────┘
              │
    ┌─────────▼──────────────────────────┐
    │ MongoDB - Deferral Collection       │
    │ ├─ Deferrals (main docs)            │
    │ ├─ Embedded approvals               │
    │ ├─ Embedded documents               │
    │ ├─ Embedded comments                │
    │ └─ Indices on deferralNumber        │
    └─────────┬──────────────────────────┘
              │
    ┌─────────▼──────────────────────────┐
    │ File Storage for Deferral Documents │
    │ ├─ /uploads/deferrals/*             │
    │ ├─ PDF exports                      │
    │ └─ Document archives                │
    └────────────────────────────────────┘
```

### 10.3 Deferral-Specific Deployment Tasks

- [ ] Deferral routes configured at `/api/deferrals`
- [ ] Deferral controller endpoints tested
- [ ] Email templates configured for deferral notifications
- [ ] File upload directory exists with proper permissions
- [ ] MongoDB indices on `deferralNumber` created
- [ ] MongoDB indices on `status` and `approvers.user` created
- [ ] PDF generation dependencies verified (PDFKit)
- [ ] Email service credentials configured (Nodemailer)
- [ ] Document storage location configured
- [ ] CORS configured for deferral UI access

---

## 11. DEFERRAL SECURITY ARCHITECTURE

### 11.1 Deferral-Specific Authentication

**JWT Token Usage for Deferrals:**
- All deferral endpoints require `protect` middleware
- Token includes user role (critical for deferral approval chain)
- Tokens expire after 24-48 hours
- Refresh mechanism available for long-running deferral reviews

**Deferral API Protection:**
```javascript
// All deferral routes require authentication
router.post("/", protect, createDeferral);
router.get("/:id", protect, getDeferral);
router.put("/:id/approve", protect, approveDeferral);
```

### 11.2 Deferral Access Control

**Role-Based Enforcement:**
- **RM**: Can create, edit own deferrals
- **Creator**: Can approve at creator stage
- **Checker**: Can approve at checker stage
- **Approver**: Can approve at final stage
- **Customer**: Can upload documents only
- **Admin**: Can manage/override all

**Implemented via middleware:**
```javascript
// Example: Only approvers can approve
router.put("/:id/approve", 
  protect,                      // JWT check
  authorizeRoles('approver'),  // Role check
  approveDeferral              // Handler
);
```

### 11.3 Deferral Document Security

**File Upload Security:**
- Multer validates file types
- File size limits enforced
- Stored outside web root
- Access controlled via API (not direct serving)
- Scanned for viruses before storage (recommended)

**File Access Control:**
```javascript
// Documents accessed via API with role checks
GET /api/deferrals/:id/documents
// Only users authorized to view deferral can access
```

### 11.4 Deferral Audit Trail

**Comprehensive History Tracking:**
- Every action logged to `history` array
- Actions: created, approved, rejected, commented, returned_for_rework
- Includes: user, timestamp, notes
- Queryable by approvers for compliance

**History Fields:**
```javascript
history: [
  {
    action: String,      // e.g., "approved"
    user: ObjectId,      // Who performed action
    userName: String,    // User display name
    notes: String,       // Why/what
    date: Date          // When
  }
]
```

### 11.5 Email Notification Security

**Deferral Notifications:**
- Sent via Nodemailer (requires SMTP config)
- Include secure links with tokens
- Do not expose sensitive data in emails
- Only send to authorized recipients

**Email Templates:**
- `deferralSubmissionTemplate` - New deferral notification
- `deferralApprovalTemplate` - Approval confirmation
- `deferralRejectionTemplate` - Rejection notice
- `deferralReminderTemplate` - Action reminders

### 11.6 Data Protection in Transit

**HTTPS/TLS:**
- All deferral API calls over HTTPS
- Certificate pinning recommended for mobile (future)
- Secure WebSocket (WSS) for real-time updates (future)

**Payload Encryption (Optional):**
- Sensitive fields can be encrypted at rest
- Example: `rejectionReason`, `reworkComments` with sensitive details

---

## 12. DEFERRAL PERFORMANCE CONSIDERATIONS

### 12.1 Database Query Optimization

**Critical Indices for Deferrals:**
```javascript
// /api/deferrals/pending
db.deferrals.createIndex({ "status": 1, "createdAt": -1 })

// /api/deferrals/approver/queue
db.deferrals.createIndex({ 
  "status": 1, 
  "currentApproverIndex": 1, 
  "approvers.user": 1 
})

// Deferral number lookup
db.deferrals.createIndex({ "deferralNumber": 1 })
```

**Query Optimization Strategies:**
- Use `.lean()` for read-only queries
- Use `.select()` for field projection
- Use `.limit()` and `.skip()` for pagination
- Batch related document loads with `.populate()`

### 12.2 Frontend Performance

**Component Optimization:**
- Lazy load DeferralForm and DeferralPending components
- Memoize expensive calculations in approval list rendering
- Use React.memo for approval queue items
- Virtual scrolling for large document lists

**Data Management:**
- Cache deferral lists (stale-while-revalidate)
- Implement infinite scroll for pending deferrals
- Debounce search/filter operations
- Batch API requests when possible

### 12.3 Load Testing Targets for Deferrals

| Metric | Target |
|--------|--------|
| Concurrent Users | 500+ approvers reviewing deferrals |
| Approval Queue Load | 1000 pending deferrals |
| Document Upload | 50MB per file |
| API Response Time | <500ms for approval queue |
| PDF Generation | <2 seconds for deferral PDF |

### 12.4 Caching Strategy

**Redis Caching (Future Enhancement):**
- Cache approver queues (15 min TTL)
- Cache deferral counts by status
- Cache user role permissions
- Cache approval chain calculations

---

## 13. DEFERRAL ERROR HANDLING & LOGGING

### 13.1 Deferral-Specific Errors

**Common Deferral Errors:**
```javascript
// 400 - Bad Request
"DCL number is required for deferral creation"
"Invalid facility configuration"
"Approver list cannot be empty"

// 403 - Access Denied  
"Only approvers can approve deferrals"
"Cannot modify a rejected deferral"
"User is not in approval chain"

// 404 - Not Found
"Deferral DEF-26-0001 not found"

// 409 - Conflict
"Deferral already approved, cannot modify"
"Cannot reject while in approval"
```

### 13.2 Logging Implementation

**Deferral Logger:**
```javascript
// Log all deferral state changes
logger.info('Deferral created', {
  deferralNumber: 'DEF-26-0001',
  customerId: user123,
  timestamp: new Date()
})

// Log approvals
logger.info('Deferral approved', {
  deferralNumber: 'DEF-26-0001',
  approverId: user456,
  stage: 'checker'
})

// Log rejections
logger.error('Deferral rejected', {
  deferralNumber: 'DEF-26-0001',
  reason: 'Missing documents',
  rejectedBy: user789
})
```

### 13.3 Monitoring Alerts

**Critical Alerts for Deferrals:**
- Approval queue exceeds 100 pending
- Average approval time > 5 days
- Rejection rate > 20%
- Email notification failures
- File upload failures
- PDF generation errors

---**In Transit:**
- HTTPS/TLS for all communications
- Secure WebSocket (WSS) for real-time features

**At Rest:**
- Database password protection
- Encrypted sensitive fields (if needed)
- File permissions on server

### 11.3 Security Headers

```javascript
// Helmet middleware applied
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
```

### 11.4 Input Validation & Sanitization

**Frontend:**
- React form validation
- Type checking with Redux

**Backend:**
- Express middleware validation
- Mongoose schema constraints
- SQL injection protection (n/a for MongoDB)
- XSS prevention via parameterized queries

### 11.5 Rate Limiting

```javascript
// Implement rate limiting
- Login attempts: 5 per 15 minutes
- API calls: 100 per minute per user
- File uploads: Configurable size limits
```

### 11.6 Audit Logging

- All user actions logged to UserLog collection
- Tracks: user, action, resource, IP address, timestamp
- Accessible only to admin role
- Retention: Configurable (recommend 1-2 years)

### 11.7 Role-Based Access Control

- Enforced at middleware level
- Granular permissions per endpoint
- Cannot be bypassed on frontend (server validates)

---

## 12. SCALABILITY & PERFORMANCE

### 12.1 Frontend Optimization

**Code Splitting:**
- Lazy load route components
- Dynamic imports for heavy libraries

**State Management:**
- Redux selectors for memoization
- Avoid unnecessary re-renders

**Caching:**
- Browser caching for static assets
- Service workers for offline support

**CDN Distribution:**
- Vite built assets to CDN
- Static files served from edge locations

### 12.2 Backend Optimization

**Database:**
- MongoDB indices on frequently queried fields
- Connection pooling with Mongoose
- Query optimization and lean() usage

**Caching:**
- Redis for session/token caching (future enhancement)
- In-memory caching for reference data

**API Efficiency:**
- Pagination for large datasets
- Field projection to reduce document size
- Compression with gzip middleware

**Horizontal Scaling:**
- Node.js cluster mode for multi-core usage
- Load balancer distribution
- Stateless API design

### 12.3 Load Testing Recommendations

- Target: 1000+ concurrent users
- Peak load: 500 requests/second
- Database query optimization under load
- Cache hit ratio monitoring

---

## 13. ERROR HANDLING & LOGGING

### 13.1 Error Handling Strategy

**Frontend:**
```javascript
- Try-catch blocks in async operations
- Redux error states
- User-friendly error messages
- Error boundary components
```

**Backend:**
```javascript
- Express error handling middleware
- Mongoose validation errors
- Custom error classes
- Structured error responses
```

### 13.2 Logging Levels

| Level | Usage | Examples |
|-------|-------|----------|
| **ERROR** | Critical failures | Database connection failed, unhandled exceptions |
| **WARN** | Potential issues | Deprecated API usage, unusual patterns |
| **INFO** | General information | User login, API request completion |
| **DEBUG** | Development information | Query logs, middleware traces |

### 13.3 Logging Implementation

**Morgan (HTTP Logging):**
```javascript
app.use(morgan('combined'));
// Logs: IP, method, URL, status, response time
```

**Custom Logger:**
```javascript
- UserLog model for audit trail
- Action, timestamp, user, resource tracked
- searchable and filterable
```

---

## 14. APPENDICES: SYSTEM DIAGRAMS

### Diagram 1: System Architecture Overview
```
                    ┌─────────────────────────┐
                    │  Frontend Application   │
                    │  (React 19 + Redux)     │
                    │  Port: 5173 (dev)       │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  REST API Gateway       │
                    │  (Express.js)           │
                    │  Port: 8000             │
                    └────────────┬────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
    ┌───────▼──────┐    ┌────────▼─────┐    ┌────────▼─────┐
    │ Controllers  │    │  Middleware  │    │   Services   │
    ├──────────────┤    ├──────────────┤    ├──────────────┤
    │ Auth         │    │ Auth         │    │ Notification │
    │ User         │    │ Role         │    │ File Upload  │
    │ Checklist    │    │ Error Handler│    │ PDF Generate │
    │ Deferral     │    │ Validation   │    │ Email        │
    └───────┬──────┘    └──────────────┘    └──────────────┘
            │
    ┌───────▼────────────────────┐
    │     Data Layer             │
    ├────────────────────────────┤
    │ MongoDB Database           │
    │ ├─ Users Collection        │
    │ ├─ Checklists Collection   │
    │ ├─ Deferrals Collection    │
    │ ├─ Notifications           │
    │ └─ UserLogs Collection     │
    └────────────────────────────┘
            │
    ┌───────▼────────────────────┐
    │  File Storage              │
    │  /uploads directory        │
    └────────────────────────────┘
```

### Diagram 2: User Role Hierarchy
```
                         ┌──────────┐
                         │  ADMIN   │
                         └────┬─────┘
                    ┌─────────┼─────────┐
                    │         │         │
          ┌─────────▼──┐  ┌───▼──────┐ ┌──▼────────┐
          │  APPROVER  │  │  CHECKER │ │ CO-CREATOR
          ├────────────┤  ├──────────┤ ├────────────┤
          │ - Approve  │  │-Validate │ │- Populate  │
          │   deferrals│  │ documents│ │  checklists│
          │ - View logs│  │ -Add     │ │- Manage    │
          │            │  │ comments │ │  documents │
          └─────┬──────┘  └────┬─────┘ └──┬─────────┘
                │               │         │
                └───────┬───────┴─────────┘
                        │
              ┌─────────▼──────────┐
              │   RM/CO CREATOR    │
              ├────────────────────┤
              │ - Create checklists│
              │ - Submit deferrals │
              │ - Upload documents │
              └─────────┬──────────┘
                        │
              ┌─────────▼──────────┐
              │   CUSTOMER         │
              ├────────────────────┤
              │ - View status      │
              │ - Upload documents │
              │ - Respond to req's │
              └────────────────────┘
```

### Diagram 3: Document Status Flow
```
           ┌──────────────────┐
           │  Document Upload │
           └────────┬─────────┘
                    │
            ┌───────▼────────┐
            │ Status: Pending │
            └────────┬────────┘
                     │
        ┌────────────▼────────────┐
        │  Checker Review         │
        ├────────┬─────────────┬──┤
        │Approved│ Rejected    │Waived
        └───┬────┴──┬──────────┴──┘
            │       │
    ┌───────▼──┐  ┌─▼──────────────┐
    │ APPROVED │  │ Return to RM   │
    │ for Final│  │ for Revision   │
    │ Approval │  │                │
    └───────┬──┘  └─┬───────────────┘
            │       │
            │   ┌───▼────────────┐
            │   │ Resubmitted    │
            │   └────┬───────────┘
            │        │
    ┌───────▼────────▼──┐
    │  Final Approval   │
    └───────────────────┘
```

### Diagram 4: API Request Flow
```
┌──────────────────────┐
│  Client (Browser)    │
│ ┌────────────────┐   │
│ │ Redux Store    │   │
│ │ ├─ auth.token  │   │
│ │ ├─ auth.user   │   │
│ │ └─ data...     │   │
│ └────────┬───────┘   │
└──────────┼───────────┘
           │
    ┌──────▼─────────────┐
    │ axios.interceptor  │
    │ Attach JWT token   │
    │ in Authorization   │
    │ header             │
    └──────┬─────────────┘
           │
    ┌──────▼──────────────────┐
    │  HTTP Request (HTTPS)   │
    │ POST /api/checklist/123 │
    │ Authorization: Bearer.. │
    │ Content-Type: JSON      │
    └──────┬──────────────────┘
           │
    ┌──────▼────────────────────┐
    │  Express Server           │
    │  1. Parse request         │
    │  2. Run middleware        │
    │     - authMiddleware (JWT)│
    │     - roleMiddleware      │
    │     - validation          │
    │  3. Route to controller   │
    │  4. Execute business logic│
    │  5. Query database        │
    │  6. Generate response     │
    └──────┬────────────────────┘
           │
    ┌──────▼────────────────────┐
    │  HTTP Response (JSON)     │
    │  {                         │
    │    "status": "success",   │
    │    "data": {...},         │
    │    "statusCode": 200      │
    │  }                         │
    └──────┬────────────────────┘
           │
    ┌──────▼──────────────────┐
    │  Client Handler         │
    │  1. Parse response      │
    │  2. Update Redux store  │
    │  3. Re-render component │
    │  4. Show user feedback  │
    └───────────────────────┘
```

### Diagram 5: Database Schema Relationships
```
    ┌──────────────┐
    │    Users     │
    ├──────────────┤
    │ _id (PK)     │────────────┐
    │ name         │            │
    │ email        │            │
    │ password     │            │
    │ role         │            │
    │ ...          │            │
    └──────────────┘            │
            ▲                   │
            │                   │
            │ 1:N               │
            │                   │
    ┌───────┴──────────┐        │
    │   UserLogs       │        │
    ├──────────────────┤        │
    │ _id (PK)         │        │
    │ user (FK) ───────┼────────┘
    │ action           │
    │ timestamp        │
    │ ...              │
    └──────────────────┘
    
    ┌──────────────────┐
    │   Checklists     │
    ├──────────────────┤
    │ _id (PK)         │
    │ customer (FK) ───┼─────────┐
    │ documents []     │         │
    │ status           │         │
    │ ...              │         │
    └──────────────────┘         │
                                 │
                        ┌────────▼────────┐
                        │   Deferrals     │
                        ├─────────────────┤
                        │ _id (PK)        │
                        │ customer (FK)   │
                        │ approvers []    │
                        │ documents []    │
                        │ status          │
                        │ ...             │
                        └─────────────────┘
```

### Diagram 6: Security & Authentication Flow
```
┌──────────────────────────────────────┐
│  Public Route: /login                │
└────────────────┬─────────────────────┘
                 │
        ┌────────▼──────────┐
        │  POST /api/auth   │
        │  /login           │
        └────────┬──────────┘
                 │
        ┌────────▼──────────────────┐
        │ Validate email & password │
        │ Hash comparison (bcrypt)  │
        └────────┬──────────────────┘
                 │
    ┌────────────┴────────────┐
    │ Credentials             │ Invalid
    │ Valid?                  │ Credentials
    │                         │ ↓
    │                    ┌────────────┐
    │                    │ 401 Error  │
    │                    │ Unauthorized
    │                    └────────────┘
    │
    ├─ Generate JWT
    │  - Header: Algorithm
    │  - Payload: user_id, role, exp
    │  - Signature: HMAC-SHA256
    │
    ├─ Return Token to Client
    │  ├─ Store in localStorage
    │  ├─ Set Redux auth state
    │  └─ Redirect to dashboard
    │
    ↓
┌──────────────────────────────┐
│ Protected Route Request      │
│ GET /api/checklist           │
│ Headers: {                   │
│   Authorization: Bearer ...  │
│ }                            │
└────────────┬─────────────────┘
             │
     ┌───────▼────────────┐
     │ authMiddleware     │
     │ - Extract token    │
     │ - Verify signature │
     │ - Check expiry     │
     └────────┬───────────┘
              │
    ┌─────────┴──────────┐
    │ Token Valid?       │
    │ YES        NO      │
    └─┬─────────┬────────┘
      │         │
      │    ┌────▼──────────┐
      │    │ 401 Error     │
      │    │ Unauthorized  │
      │    │ Re-login req'd│
      │    └───────────────┘
      │
      ├─ roleMiddleware
      │ - Check user role
      │ - Verify permissions
      │
      ├─ Route Handler
      │ - Execute business logic
      │
      └─ Return 200 OK with data
```

---

## SUMMARY

This Deferral Management System is a comprehensive, role-based application designed for managing credit loan deferrals in financial institutions. It employs modern web technologies with a clear separation of concerns, robust security measures, and scalable architecture patterns.

**Key Strengths:**
- Role-based access control with multiple user types
- Comprehensive workflow management
- Audit trail tracking
- Document management capabilities
- RESTful API architecture
- Scalable deployment options

**Future Enhancements:**
- Real-time notifications with WebSockets
- Advanced analytics and reporting
- Machine learning for document classification
- Mobile application
- Integration with core banking systems
- Workflow automation with RPA

---

**Document Version:** 1.0  
**Date:** January 19, 2026  
**Module Focus:** Deferral Subsystem Architecture  
**Scope:** Deferral Management ONLY  
**Status:** Complete - Focused on Deferral Module
