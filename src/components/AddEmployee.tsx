import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Camera, Upload, CheckCircle2, X, Loader2 } from "lucide-react";
import {
  employeeService,
  type DepartmentResponse,
  type RegisterEmployeeRequest,
} from "../services/employee";

export function AddEmployee() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegisterEmployeeRequest>({
    email: "",
    password: "",
    name: "",
    phone_number: "",
    date_of_birth: "",
    employee_id: "",
    department_id: 0,
    role: "EMPLOYEE",
    designation: "",
    joining_date: "",
    flat: "",
    house_no: "",
    city: "",
    postal_code: "",
    state: "",
    country: "",
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    branch_name: "",
    ifsc_code: "",
  });

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        const departmentsData = await employeeService.getDepartments();
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        setErrors((prev) => ({
          ...prev,
          general: "Failed to load departments",
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateField = (fieldName: string, value: string | number): string => {
    const requiredFields = [
      "name",
      "employee_id",
      "email",
      "phone_number",
      "password",
      "department_id",
      "designation",
      "joining_date",
    ];

    if (
      requiredFields.includes(fieldName) &&
      (!value || value.toString().trim() === "" || value === 0)
    ) {
      return "This field is required";
    }

    if (
      fieldName === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toString())
    ) {
      return "Invalid email format";
    }

    if (fieldName === "password" && value && value.toString().length < 8) {
      return "Password must be at least 8 characters";
    }

    return "";
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    const processedValue =
      fieldName === "department_id" ? parseInt(value) || 0 : value;
    setFormData({ ...formData, [fieldName]: processedValue });
    const error = validateField(fieldName, processedValue);
    if (error) {
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      "name",
      "employee_id",
      "email",
      "phone_number",
      "password",
      "department_id",
      "designation",
      "joining_date",
    ];
    const newErrors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      const error = validateField(
        field,
        formData[field as keyof RegisterEmployeeRequest] as string | number
      );
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await employeeService.registerEmployee(
        formData,
        avatarFile as File
      );

      // Success - show success message and reset form
      console.log("Employee registered successfully:", result);
      alert(
        `Employee registered successfully! Employee ID: ${result.employee_id}`
      );

      // Reset form
      setFormData({
        email: "",
        password: "",
        name: "",
        phone_number: "",
        date_of_birth: "",
        employee_id: "",
        department_id: 0,
        role: "EMPLOYEE",
        designation: "",
        joining_date: "",
        flat: "",
        house_no: "",
        city: "",
        postal_code: "",
        state: "",
        country: "",
        account_holder_name: "",
        bank_name: "",
        account_number: "",
        branch_name: "",
        ifsc_code: "",
      });
      setImagePreview(null);
      setAvatarFile(null);
      setErrors({});
    } catch (error: any) {
      console.error("Failed to register employee:", error);

      let errorMessage = "Failed to register employee. Please try again.";

      if (error.response && error.response.data && error.response.data.detail) {
        const detail = error.response.data.detail;

        if (Array.isArray(detail)) {
          const pydanticError = detail[0];
          errorMessage = `${pydanticError.msg} (for ${pydanticError.loc.slice(
            -1
          )})`;
        } else if (typeof detail === "string") {
          // This is a simple string error (e.g., "Email already registered")
          errorMessage = detail;
        }
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { value: "employee", label: "Employee" },
    { value: "department_manager", label: "Department Manager" },
    { value: "super_admin", label: "Super Admin" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Form */}
      <div
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <form onSubmit={handleSubmit} className="max-w-5xl">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-8">
            {/* General Error Display */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-blue-700">
                    Loading departments...
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* Photo Upload */}
              <div>
                <Label className="text-sm font-semibold text-[#111827] mb-4 block">
                  Employee Photo
                </Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Employee"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-12 h-12 text-[#9CA3AF]" />
                      )}
                    </div>
                    {imagePreview && (
                      <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 border-white bg-[#10B981] flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="photoUpload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 px-6 gap-2 border-[#E5E7EB]"
                      onClick={() =>
                        document.getElementById("photoUpload")?.click()
                      }
                    >
                      <Upload className="w-4 h-4" />
                      {imagePreview ? "Change Photo" : "Upload Photo"}
                    </Button>
                    <p className="text-xs text-[#6B7280] mt-2">
                      JPG or PNG, max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Full Name <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleFieldChange("name", e.target.value)
                      }
                      placeholder="John Smith"
                      className={`h-12 ${
                        errors.name
                          ? "border-[#EF4444] border-2"
                          : "border-[#E5E7EB]"
                      }`}
                    />
                    {errors.name && (
                      <div className="flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-[#EF4444]" />
                        <span className="text-xs text-[#EF4444]">
                          {errors.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="employee_id"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Employee ID <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) =>
                        handleFieldChange("employee_id", e.target.value)
                      }
                      placeholder="EMP001"
                      className={`h-12 ${
                        errors.employee_id
                          ? "border-[#EF4444] border-2"
                          : "border-[#E5E7EB]"
                      }`}
                    />
                    {errors.employee_id && (
                      <div className="flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-[#EF4444]" />
                        <span className="text-xs text-[#EF4444]">
                          {errors.employee_id}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Email <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleFieldChange("email", e.target.value)
                      }
                      placeholder="john.smith@company.com"
                      className={`h-12 ${
                        errors.email
                          ? "border-[#EF4444] border-2"
                          : "border-[#E5E7EB]"
                      }`}
                    />
                    {errors.email && (
                      <div className="flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-[#EF4444]" />
                        <span className="text-xs text-[#EF4444]">
                          {errors.email}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone_number"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Phone Number <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) =>
                        handleFieldChange("phone_number", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      className={`h-12 ${
                        errors.phone_number
                          ? "border-[#EF4444] border-2"
                          : "border-[#E5E7EB]"
                      }`}
                    />
                    {errors.phone_number && (
                      <div className="flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-[#EF4444]" />
                        <span className="text-xs text-[#EF4444]">
                          {errors.phone_number}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="date_of_birth"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Date of Birth
                    </Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        handleFieldChange("date_of_birth", e.target.value)
                      }
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Initial Password <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleFieldChange("password", e.target.value)
                      }
                      placeholder="Minimum 6 characters"
                      className={`h-12 ${
                        errors.password
                          ? "border-[#EF4444] border-2"
                          : "border-[#E5E7EB]"
                      }`}
                    />
                    {errors.password && (
                      <div className="flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-[#EF4444]" />
                        <span className="text-xs text-[#EF4444]">
                          {errors.password}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">
                  Employment Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="department_id"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Department <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Select
                      value={formData.department_id.toString()}
                      onValueChange={(value: string) =>
                        handleFieldChange("department_id", value)
                      }
                    >
                      <SelectTrigger
                        className={`h-12 ${
                          errors.department_id
                            ? "border-[#EF4444] border-2"
                            : "border-[#E5E7EB]"
                        }`}
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.department_id && (
                      <div className="flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-[#EF4444]" />
                        <span className="text-xs text-[#EF4444]">
                          {errors.department_id}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="designation"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Designation <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) =>
                        handleFieldChange("designation", e.target.value)
                      }
                      placeholder="Senior Software Engineer"
                      className={`h-12 ${
                        errors.designation
                          ? "border-[#EF4444] border-2"
                          : "border-[#E5E7EB]"
                      }`}
                    />
                    {errors.designation && (
                      <div className="flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-[#EF4444]" />
                        <span className="text-xs text-[#EF4444]">
                          {errors.designation}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="role"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      System Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: string) =>
                        handleFieldChange("role", value)
                      }
                    >
                      <SelectTrigger className="h-12 border-[#E5E7EB]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="joining_date"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Joining Date <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      id="joining_date"
                      type="date"
                      value={formData.joining_date}
                      onChange={(e) =>
                        handleFieldChange("joining_date", e.target.value)
                      }
                      className={`h-12 ${
                        errors.joining_date
                          ? "border-[#EF4444] border-2"
                          : "border-[#E5E7EB]"
                      }`}
                    />
                    {errors.joining_date && (
                      <div className="flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-[#EF4444]" />
                        <span className="text-xs text-[#EF4444]">
                          {errors.joining_date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">
                  Address Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="flat"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Flat / Apartment
                    </Label>
                    <Input
                      id="flat"
                      value={formData.flat}
                      onChange={(e) =>
                        handleFieldChange("flat", e.target.value)
                      }
                      placeholder="Apt 4B"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="house_no"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      House Number / Street
                    </Label>
                    <Input
                      id="house_no"
                      value={formData.house_no}
                      onChange={(e) =>
                        handleFieldChange("house_no", e.target.value)
                      }
                      placeholder="123 Main Street"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="city"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleFieldChange("city", e.target.value)
                      }
                      placeholder="San Francisco"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="state"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      State
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        handleFieldChange("state", e.target.value)
                      }
                      placeholder="California"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="postal_code"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Postal Code
                    </Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) =>
                        handleFieldChange("postal_code", e.target.value)
                      }
                      placeholder="94102"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="country"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        handleFieldChange("country", e.target.value)
                      }
                      placeholder="United States"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">
                  Bank Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="account_holder_name"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Account Holder Name
                    </Label>
                    <Input
                      id="account_holder_name"
                      value={formData.account_holder_name}
                      onChange={(e) =>
                        handleFieldChange("account_holder_name", e.target.value)
                      }
                      placeholder="John Smith"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="account_number"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Account Number
                    </Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) =>
                        handleFieldChange("account_number", e.target.value)
                      }
                      placeholder="1234567890"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="ifsc_code"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      IFSC / Routing Number
                    </Label>
                    <Input
                      id="ifsc_code"
                      value={formData.ifsc_code}
                      onChange={(e) =>
                        handleFieldChange(
                          "ifsc_code",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="ABCD0123456"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="bank_name"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Bank Name
                    </Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) =>
                        handleFieldChange("bank_name", e.target.value)
                      }
                      placeholder="Bank of America"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="branch_name"
                      className="text-sm font-semibold text-[#111827]"
                    >
                      Branch Name
                    </Label>
                    <Input
                      id="branch_name"
                      value={formData.branch_name}
                      onChange={(e) =>
                        handleFieldChange("branch_name", e.target.value)
                      }
                      placeholder="Downtown Branch"
                      className="h-12 border-[#E5E7EB]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full h-12 bg-[#10B981] hover:bg-[#059669] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering Employee...
                </div>
              ) : (
                "Add Employee"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
