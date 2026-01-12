// import React, { useState } from "react";
// import {
//   useGetUsersQuery,
//   useCreateUserMutation,
//   useToggleActiveMutation,
//   useChangeRoleMutation,
// } from "../../api/userApi.js";

// import UserTable from "./UserTable.jsx";
// import CreateUserModal from "./CreateUserModal.jsx";

// const AdminDashboard = () => {
//   const { data: users = [], refetch } = useGetUsersQuery();

//   const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
//   const [toggleActive] = useToggleActiveMutation();
//   const [changeRole] = useChangeRoleMutation();

//   const [openModal, setOpenModal] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "rm",
//   });

//   const handleCreate = async () => {
//     await createUser(formData);
//     setFormData({ name: "", email: "", password: "", role: "rm" });
//     setOpenModal(false);
//     refetch();
//   };

//   const handleToggleActive = async (id) => {
//     await toggleActive(id);
//     refetch();
//   };

//   const handleChangeRole = async (id, role) => {
//     await changeRole({ id, role });
//     refetch();
//   };

//   return (
//     <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">

//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
//         <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
//           🏦Admin Control Panel
//         </h2>

//         <button
//           onClick={() => setOpenModal(true)}
//           className="bg-blue-500 dark:bg-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow"
//         >
//           + Create User
//         </button>
//       </div>

//       <p className="text-gray-600 dark:text-gray-300 mb-6">
//         Manage all users, roles, and account status securely.
//       </p>

//       <UserTable
//         users={users}
//         onToggleActive={handleToggleActive}
//         onRoleChange={handleChangeRole}
//       />

//       <CreateUserModal
//         visible={openModal}
//         loading={isCreating}
//         formData={formData}
//         setFormData={setFormData}
//         onCreate={handleCreate}
//         onClose={() => setOpenModal(false)}
//       />
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState } from "react";
import { Button, message, Card, Space, Typography, Row, Col } from "antd";
import UserTable from "./UserTable";
import CreateUserDrawer from "./CreateUserModal";
// import StatsCards from "./StatsCards";
// import ActivityLog from "./ActivityLog";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useToggleActiveMutation,
  useChangeRoleMutation,
  // useGetAdminStatsQuery,
  // useGetUserLogsQuery,
  // useDeleteUserMutation,
} from "../../api/userApi";


const { Title } = Typography;

const AdminDashboard = () => {
  const { data: users = [], isLoading, refetch } = useGetUsersQuery();
  // const { data: stats = {}, isFetching: statsLoading } =
  //   useGetAdminStatsQuery();
  // const { data: logs = [] } = useGetUserLogsQuery(); // recent logss
  const [createUser] = useCreateUserMutation();
  const [toggleActive] = useToggleActiveMutation();
  const [changeRole] = useChangeRoleMutation();
  // const [deleteUser] = useDeleteUserMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const handleCreateUser = async () => {
    try {
      await createUser(formData).unwrap();
      message.success("User created successfully!");
      setDrawerOpen(false);
      setFormData({ name: "", email: "", password: "", role: "customer" });
      refetch();
    } catch (err) {
      message.error(err?.data?.message || "Failed to create user");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleActive(id).unwrap();
      message.success("User status updated");
      refetch();
    } catch (err) {
      message.error("Failed to update status", err);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await changeRole({ id, role }).unwrap();
      message.success("User role updated");
      refetch();
    } catch (err) {
      message.error("Failed to update role", err);
    }
  };

  // const handleDelete = async (id) => {
  //   try {
  //     await deleteUser({ id }).unwrap();
  //     message.success("User deleted (soft) successfully");
  //     refetch();
  //   } catch (err) {
  //     message.error("Failed to delete user");
  //   }
  // };

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 10,
          boxShadow: "0 3px 15px rgba(0,0,0,0.1)",
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Title level={3}>Admin Dashboard</Title>
          <Row gutter={16}>
            <Col flex="auto">
              <Button type="primary" onClick={() => setDrawerOpen(true)}>
                Create New User
              </Button>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  refetch();
                  message.success("Refreshed");
                }}
              >
                Refresh
              </Button>
            </Col>
          </Row>

          {/* Stats (cards) */}
          {/* <StatsCards stats={stats} loading={statsLoading} /> */}
        </Space>
      </Card>

      <Card style={{ marginBottom: 24, borderRadius: 10 }}>
        <UserTable
          users={users}
          onToggleActive={handleToggleActive}
          onRoleChange={handleRoleChange}
          // onDelete={handleDelete}
          loading={isLoading}
        />
      </Card>

      {/* <Card style={{ borderRadius: 10 }}>
        <ActivityLog logs={logs} />
      </Card> */}

      <CreateUserDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onCreate={handleCreateUser}
      />
    </div>
  );
};

export default AdminDashboard;
