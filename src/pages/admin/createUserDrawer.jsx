// export default CreateUserDrawer;
import React, { useMemo } from "react";
import { Drawer, Input, Select, Form, Button } from "antd";

const roleOptions = [
  { value: "rm", label: "Relationship Manager" },
  { value: "cocreator", label: "CO Creator" },
  { value: "cochecker", label: "CO Checker" },
  { value: "admin", label: "Admin" },
  { value: "customer", label: "Customer" },
];

const CreateUserDrawer = ({
  visible = false,
  loading = false,
  formData = {},
  setFormData = () => {},
  onCreate = () => {},
  onClose = () => {},
}) => {
  const roles = useMemo(() => roleOptions, []);

  return (
    <Drawer
      title={
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Create New User
        </span>
      }
      placement="right"
      width={360}
      open={visible}
      onClose={onClose}
      className="dark:bg-gray-900"
      styles={{ body: { paddingBottom: 80 } }}
    >
      <Form layout="vertical" onFinish={onCreate}>
        {/* NAME */}
        <Form.Item label="Name" required>
          <Input
            value={formData?.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="dark:bg-gray-800 dark:text-gray-100"
          />
        </Form.Item>

        {/* EMAIL */}
        <Form.Item label="Email" required>
          <Input
            type="email"
            value={formData?.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="dark:bg-gray-800 dark:text-gray-100"
          />
        </Form.Item>

        {/* PASSWORD */}
        <Form.Item label="Password" required>
          <Input.Password
            value={formData?.password || ""}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="dark:bg-gray-800 dark:text-gray-100"
          />
        </Form.Item>

        {/* ROLE */}
        <Form.Item label="Role">
          <Select
            value={formData?.role || "rm"}
            onChange={(value) => setFormData({ ...formData, role: value })}
            options={roles}
            className="dark:bg-gray-800 dark:text-gray-100"
          />
        </Form.Item>

        {/* BUTTON */}
        <Button
          htmlType="submit"
          type="primary"
          block
          loading={loading}
          className="bg-gray-700 dark:bg-gray-600 text-white"
        >
          Create User
        </Button>
      </Form>
    </Drawer>
  );
};

export default CreateUserDrawer;
