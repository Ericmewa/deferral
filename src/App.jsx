// // App.jsx
// // import React from "react";
// import "antd/dist/reset.css";

// import { Routes, Route, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// // Pages
// import RegisterPage from "./pages/RegisterPage";
// import LoginPage from "./pages/LoginPage";
// // import CreditChecklist from "./pages/CreditChecklist";
// // import RequestChecklist from "./pages/rmChecklist";
// import ProtectedRoute from "./components/ProtectedRoute";

// // NCBA Dashboard Layout & Pages
// import MainLayout from "./components/creator/COLayout";
// // import DashboardHome from "./components/cocreator/cocreatordash/pages/DashboardHome";
// // import Checklists from "./components/cocreator/cocreatordash/pages/Checklists";
// // import Deferrals from "./components/cocreator/cocreatordash/pages/Deferrals";
// // import Completed from "./components/cocreator/cocreatordash/pages/Completed";
// // import RelationshipManagers from "./components/cocreator/cocreatordash/pages/RelationshipManagers";
// // import Settings from "./components/cocreator/cocreatordash/pages/Settings";

// // Other Layouts - To be organized later
// import CheckerLayout from "./components/checker/CheckerLayout";
// import AdminLayout from "./components/admin/AdminLayout";
// import RmLayout from "./components/rm/RmLayout";

// // Checklist Components
// // import CreateChecklist from "./components/Rm/RmUpload";
// // import ChecklistTableTest from "./createChecklist/ChecklistTabletest";
// // import RMUpload from "./createChecklist/RMUpload ";
// // import ChecklistDrawerr from "./components/Rm/ChecklistDrawerTest";
// // import ChecklistP from "./components/Rm/checkpage";

// // Styles
// import "./App.css";
// // import ChecklistsPageh from "./components/Rm/CreateeCheklist";
// // import CreateChecklistPage from "./components/Rm/rmTbb";

// const App = () => {
//   const { user } = useSelector((state) => state.auth);
//   const userId = user?.id;

//   return (
//     <Routes>
//       {/* PUBLIC ROUTES */}
//       <Route path="/" element={<Navigate to="/login" />} />
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/register" element={<RegisterPage />} />
//       {/* <Route path="/tb" element={<ChecklistTableTest />} /> */}
//       {/* <Route path="/up" element={<RMUpload />} /> */}
//       {/* <Route path="/cochecker" element={<CheckerLayout />} />
//       {/* <Route path="/co" element={<CreateChecklistPage />} /> */}
//       {/* <Route path="/checklistpage" element={<ChecklistP />} /> */} */
//       {/* MAIN DASHBOARD ROUTES */}
//       <Route
//         path="/cocreator"
//         element={
//           <ProtectedRoute>
//             <MainLayout />
//           </ProtectedRoute>
//         }
//       ></Route>
//       <Route
//         path="/cochecker"
//         element={
//           <ProtectedRoute>
//             <CheckerLayout />
//           </ProtectedRoute>
//         }
//       />
//       {/* <Route path="home" element={<DashboardHome />} />
//         <Route path="checklists" element={<Checklists />} />
//         <Route path="deferrals" element={<Deferrals />} />
//         <Route path="completed" element={<Completed />} />
//         <Route path="rms" element={<RelationshipManagers />} />
//         // <Route path="settings" element={<Settings />} />
//       </Route> 

//       {/* ADMIN ROUTES */}
//       <Route
//         path="/admin"
//         element={
//           <ProtectedRoute>
//             <AdminLayout />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/rm/*"
//         element={
//           <ProtectedRoute>
//             <RmLayout userId={userId} />
//           </ProtectedRoute>
//         }
//       >
//         {/* <Route path="cr" element={<ChecklistsPageh />} /> */}
//       </Route>
//       {/* 
//       {/* STANDALONE CHECKLIST ROUTES */}
//       {/* <Route path="/cl" element={<CreditChecklist />} />
//       <Route path="/rmck" element={<RequestChecklist />} />
//       <Route path="/checklists" element={<ProtectedRoute><ChecklistDrawerr /></ProtectedRoute>} /> */}{" "}
//       */
//       {/* CATCH-ALL */}
//       <Route path="*" element={<Navigate to="/login" />} />
//     </Routes>
//   );
// };

// export default App;





// App.jsx
import React from "react";
import "antd/dist/reset.css";

import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import MainLayout from "./components/creator/COLayout";
import CheckerLayout from "./components/checker/CheckerLayout";
import AdminLayout from "./components/admin/AdminLayout";
import RmLayout from "./components/rm/RmLayout";
import ApproverLayout from "./components/approver/ApproverLayout"; // Add this import

// Styles
import "./App.css";

const App = () => {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* PROTECTED ROUTES */}

      {/* CO-CREATOR ROUTES */}
      <Route
        path="/cocreator/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />

      {/* CHECKER ROUTES */}
      <Route
        path="/cochecker/*"
        element={
          <ProtectedRoute>
            <CheckerLayout />
          </ProtectedRoute>
        }
      />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* RELATIONSHIP MANAGER ROUTES */}
      <Route
        path="/rm/*"
        element={
          <ProtectedRoute>
            <RmLayout userId={userId} />
          </ProtectedRoute>
        }
      />

      {/* APPROVER ROUTES - NEW ADDITION */}
      <Route
        path="/approver/*"
        element={
          <ProtectedRoute>
            <ApproverLayout userId={userId} />
          </ProtectedRoute>
        }
      />

      {/* CATCH-ALL */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
