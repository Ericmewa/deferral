import { AutoComplete, Input } from "antd";
import { useGetCustomersQuery } from "../../api/userApi";

const ChecklistFormFields = ({
  rms,
  assignedToRM,
  setAssignedToRM,

  customerId,
  setCustomerId,

  customerName,
  setCustomerName,

  customerNumber,
  setCustomerNumber,

  customerEmail,
  setCustomerEmail,

  loanType,
  loanTypes,
  handleLoanTypeChange,
}) => {
  const { data: customers = [], isLoading } = useGetCustomersQuery();

  /* ---------------- RM OPTIONS ---------------- */
  const rmOptions = rms?.map((rm) => ({
    label: rm.name,
    value: rm.name,
    id: rm._id,
  }));

  const selectedRMName = rms?.find((rm) => rm._id === assignedToRM)?.name || "";

  const handleRMSelect = (value, option) => {
    setAssignedToRM(option.id);
  };

  /* ---------------- CUSTOMER OPTIONS ---------------- */
  const customerOptions = customers?.map((cust) => ({
    label: cust.customerNumber,
    value: cust.customerNumber,
    id: cust._id,
    name: cust.name,
    email: cust.email,
  }));

  const handleCustomerSelect = (value, option) => {
    setCustomerId(option.id);
    setCustomerNumber(option.value); // Number selected
    setCustomerName(option.name); // Auto populate
    setCustomerEmail(option.email); // Auto populate
  };

  if (isLoading) return <h1>Loading customers...</h1>;

  return (
    <div
      className="p-6 md:p-8 bg-white shadow-xl rounded-lg"
      style={{ borderTop: `4px solid #b5d334` }}
    >
      <h2 className="text-xl font-bold mb-6" style={{ color: "#164679" }}>
        Create New Checklist
      </h2>

      {/* ---------------- CUSTOMER NUMBER SELECTOR ---------------- */}
      <AutoComplete
        style={{ width: "100%", marginBottom: 18 }}
        placeholder="Select Customer Number..."
        value={customerNumber} // ensures stable controlled input
        options={customerOptions}
        onSelect={handleCustomerSelect}
        onChange={(val) => setCustomerNumber(val)}
        filterOption={(input, option) =>
          option?.value?.toLowerCase().includes(input.toLowerCase()) ||
          option?.label?.toLowerCase().includes(input.toLowerCase())
        }
      >
        <Input />
      </AutoComplete>

      {/* ---------------- AUTO-FILLED FIELDS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input placeholder="Customer Name" value={customerName} disabled />
        <Input placeholder="Customer Number" value={customerNumber} disabled />
        <Input placeholder="Customer Email" value={customerEmail} disabled />
      </div>

      {/* ---------------- RM SELECTOR ---------------- */}
      <AutoComplete
        style={{ width: "100%", marginBottom: 18 }}
        placeholder="Search RM..."
        value={selectedRMName}
        options={rmOptions}
        onSelect={handleRMSelect}
        filterOption={(input, option) =>
          option?.value?.toLowerCase().includes(input.toLowerCase())
        }
      >
        <Input />
      </AutoComplete>

      {/* ---------------- LOAN TYPE SELECTOR ---------------- */}
      <AutoComplete
        style={{ width: "100%", marginBottom: 18 }}
        placeholder="Select Loan Type"
        value={loanType}
        options={loanTypes.map((t) => ({ label: t, value: t }))}
        onSelect={handleLoanTypeChange}
      >
        <Input />
      </AutoComplete>
    </div>
  );
};

export default ChecklistFormFields;
