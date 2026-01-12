📄 NCBA Digital Document Checklist (DCL) System

A workflow management system for NCBA Credit Operations

📌 Overview

The Digital Document Checklist (DCL) system streamlines NCBA’s credit operations by digitizing the process of creating, submitting, reviewing, and approving loan application documents.

The platform provides an efficient workflow among three roles:

Credit Operations (Creator)

Relationship Manager (RM)

Credit Operations (Checker)

This system ensures improved compliance, transparency, and operational efficiency.

🚀 Features
🔹 Document Workflow Automation

Create and manage loan document checklists

Upload and validate required documents

Review, approve, or reject documents

Route workflows between RM, Creator, and Checker

🔹 Role-Based User Access

Different dashboards and permissions for each role

🔹 Audit Trail & Status Tracking

Track each step of the workflow

Full visibility on approvals, rejections, and deferments

🔹 Modern Frontend Stack

Built with:

⚛ React.js

🎨 Tailwind CSS

⚡ Vite

🔐 Potential authentication integration

🧩 Workflow Summary
🟦 1. Credit Operations (Creator)

Creates a new Document Checklist using createDCL.jsx, lists required documents, and assigns it to a Relationship Manager.

🟨 2. Relationship Manager (RM)

Uploads required documents, requests deferment if needed, and submits the checklist back for review.

🟦 3. Credit Operations (Creator) – Review Stage

Approves or rejects the RM's uploaded documents.
If rejected → sent back to RM.
If approved → sent to Checker.

🟩 4. Credit Operations (Checker) – Final Approval

Performs final validation and marks the workflow as Completed.



✅ CREDIT OPERATIONS (CREATOR) — FINAL PAGE STRUCTURE
It will have 6 pages:
1. CreateDCL.jsx  
2. MyQueue.jsx  
3. Active.jsx  
4. Completed.jsx  
5. Deferrals.jsx  
6. Reports.jsx

Below is the full specification for each page.
________________________________________
🟦 1. CreateDCL.jsx
Purpose:
•	Create new Document Checklist
•	Select customer, loan type, required documents
•	Submit → goes to RM (status: pending_rm)

Actions:
•	Add/remove document requirements
•	Save as draft or Submit
•	Auto-generate Workstep No (optional)

Status Created:
draft
pending_rm
You already have this — we can enhance later.
________________________________________
🟩 2. MyQueue.jsx
This page is ONLY for Creator’s incoming work.
These are DCLs submitted by RM and requiring the Creator’s review.
It will have two sections:
________________________________________
A. Current Queue (from RM)
➡️ Items submitted by RM
Status = pending_creator_review
Creator sees:
•	Customer No
•	Workstep
•	RM Uploads
•   RM comments
•	Checklist documents uploaded 
•	Button: Review → opens CreatorReview page

✔ Actions:

Approve per document

Reject per document (give comment)

Return to RM

Submit to Checker
________________________________________
B. Previous Queue (returned by Checker)
➡️ Items declined by Checker
Status = returned_by_checker
Creator must re-evaluate:

✔ Must show:

Checker comments

Rejected documents

Reason for decline


•	Button: Review → opens CreatorReview page

✔ Actions:

Fix or request RM to upload again

Approve again

Resubmit to Checker


________________________________________
Additionally:
✔️ Auto-load all checklist items as originally created
When the Creator opens an item:
•	Show original checklist (from CreateDCL)
•	Show RM uploaded files next to each requirement
________________________________________
🟧 3. Active.jsx
This page shows all DCLs the Creator has already processed but NOT yet approved by Checker.

Includes:
•	Workflows waiting for checker → pending_checker
•	Incomplete DCLs (e.g. some documents missing) → incomplete
•	Items waiting for 2nd/3rd document sets (e.g. legal, risk input)

Filters / Search:
•	Search by Customer No or Workstep
•	Dropdown filter:
o	All
o	Pending checker
o	Incomplete
o	Returned by checker (optional)
Purpose:
Let the creator monitor all workflows they have escalated but not completed.
________________________________________
🟦 4. Completed.jsx
Shows DCLs fully approved by the checker.

Status = completed
A simple table:
•	Workstep
•	Customer No
•	Loan type
•	Checklist summary
•	Date completed
•	View button (document view only)
No actions — view-only.
________________________________________
🟨 5. Deferrals.jsx — MOST IMPORTANT PAGE
Holds approved deferrals that now require the Creator to review.

Status = deferral_pending_creator_review

DEFERRALS TABLE COLUMNS:
Column	                Meaning
Customer No	            Customer identifier
Workstep	            Unique workflow
Document	            Document with deferral requested
Reason	                RM's request reason
Expiry Date	            Defer until this date
Creator Comments	    Text area to reply
Action	                Accept / Reject


6️⃣ Reports.jsx

This page provides a reporting layer for Creator.

✔ Reports include:
A. Post-approval deferrals

(Deferrals made AFTER the DCL was fully completed)

Searchable by:

Customer No

Workstep

Date range

B. Pending approval deferrals

Same list from Deferrals page but non-actionable.

C. All DCLs — regardless of status 



🏢 SYSTEM ARCHITECTURE OVERVIEW
🔐 User Roles & Permissions

1. ADMIN (System Administrator)
   - Full system access
   - User management
   - Role assignment
   - System configuration
   - Audit logs access

2. CREDIT OPERATIONS - CREATOR
   - Create Document Checklists
   - Review RM submissions
   - Manage deferrals
   - Monitor active workflows
   - Generate reports

3. RELATIONSHIP MANAGER (RM)
   - View assigned checklists
   - Upload documents
   - Request deferrals
   - Submit for review
   - Track submission status

4. CREDIT OPERATIONS - CHECKER
   - Final validation
   - Approve/reject submissions
   - Return for corrections
   - Complete workflows