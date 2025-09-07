import React, { useEffect } from "react";
import useEmpDataStore from "@/store/empDataStore";
import useAuthStore from "@/store/authStore";
import getBaseFileURL from "@/utils/getBaseFileUrl";
import { SquarePen, Save, X, Edit3 } from "lucide-react";
import { FiUser } from "react-icons/fi";
import Employees from "@/services/Employees/employees";
function ProfilePage() {
  // Auth store
  const { user } = useAuthStore();
  // Employee data store
  const {
    currentEmployee,
    fetchEmployeeById,
    forceCompleteRefresh,
    loading: empLoading,
    error: empError,
  } = useEmpDataStore();
  const baseFileURL = getBaseFileURL();

  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(Date.now());
  const [isUploadingPicture, setIsUploadingPicture] = React.useState(false);

  // Fetch employee data when component mounts
  useEffect(() => {
    if (user?.empId && !currentEmployee) {
      fetchEmployeeById(user.empId);
    }
  }, [user?.empId, currentEmployee, fetchEmployeeById]);

  // Debug: Log when currentEmployee changes
  useEffect(() => {
    console.log(
      "currentEmployee changed:",
      currentEmployee?.FirstName,
      currentEmployee?.LastName
    );
  }, [currentEmployee]);

  // Map employee data for display
  const employee = currentEmployee
    ? {
        EmpID: currentEmployee.EmpID,
        FirstName: currentEmployee.FirstName || "",
        LastName: currentEmployee.LastName || "",
        PersonalEmail: currentEmployee.PersonalEmail || "",
        WorkEmail: currentEmployee.WorkEmail || "",
        PhoneNumber: currentEmployee.PhoneNumber || "",
        Address: currentEmployee.Address || "",
        EmergencyContact: currentEmployee.EmergencyContact || "",
        EmergencyContactNumber: currentEmployee.EmergencyContactNumber || "",
        DateOfBirth: currentEmployee.DateOfBirth || "",
        Gender: currentEmployee.Gender || "",
        DateOfJoining: currentEmployee.DateOfJoining || "",
        OBStatus: currentEmployee.OBStatus || false,
        IsActive: currentEmployee.IsActive || false,
        ProfilePicture: currentEmployee?.ProfilePicture
          ? `${baseFileURL}${currentEmployee.ProfilePicture}`
          : "",
        Signature: currentEmployee.Signature || null,
        RoleID: currentEmployee.RoleID || 0,
      }
    : null;

  // Format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Handle edit mode
  const handleEdit = () => {
    if (employee) {
      setEditData({ ...employee });
      setIsEditing(true);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!user?.empId || !currentEmployee) {
      console.error("Missing employee ID or current employee data");
      return;
    }

    setIsSaving(true);

    try {
      console.log("Saving profile data:", editData);
      console.log("Current employee before update:", currentEmployee);

      // Call the profile update service
      const updatedEmployee = await Employees.updateEmployeeProfile(
        user.empId,
        editData,
        currentEmployee
      );

      console.log("Update response:", updatedEmployee);
      await forceCompleteRefresh(user.empId);
      if (updatedEmployee) {
        console.log(
          "Profile updated successfully, forcing complete refresh..."
        );

        // Use the most aggressive refresh method
        const refreshedData = await forceCompleteRefresh(user.empId);
        console.log("Complete refresh finished:", refreshedData);

        // Update refresh key to force re-render
        setRefreshKey(Date.now());
        setIsEditing(false);
        setEditData({});
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditData({});
    setIsEditing(false);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle profile picture upload
  const handleProfilePictureEdit = () => {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file && user?.empId) {
        await handleProfilePictureUpload(file);
      }
    };

    // Trigger file selection
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  // Handle profile picture file upload
  const handleProfilePictureUpload = async (file) => {
    if (!user?.empId) {
      console.error("Missing employee ID");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploadingPicture(true);

    try {
      console.log("Uploading profile picture:", file.name);

      // Upload the profile picture
      const uploadResult = await Employees.uploadProfilePicture(
        user.empId,
        file
      );

      if (uploadResult) {
        console.log("Profile picture uploaded successfully");

        // Force refresh to get the updated profile picture
        await forceCompleteRefresh(user.empId);
        setRefreshKey(Date.now());
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const currentData = isEditing ? editData : employee;

  // Loading state
  if (empLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (empError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {empError}
          </div>
          <button
            onClick={() => user?.empId && fetchEmployeeById(user.empId)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No employee data
  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No employee data available</p>
          <button
            onClick={() => user?.empId && fetchEmployeeById(user.empId)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load Profile
          </button>
        </div>
      </div>
    );
  }
  console.log("Current data ProfilePicture:", currentData.ProfilePicture);
  console.log(
    "Current employee data:",
    currentEmployee?.FirstName,
    currentEmployee?.LastName,
    currentEmployee?._refreshed
  );

  return (
    <div
      className=""
      key={`${currentEmployee?.EmpID || "no-employee"}-${refreshKey}`}
    >
      <div className="">
        {/* Single Card Layout */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-2">
            <div className="flex items-center gap-4">
              {/* Profile Picture with Hover Controls */}
              <div className="relative group">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {isUploadingPicture ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  ) : currentData.ProfilePicture ? (
                    <img
                      src={currentData.ProfilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-16 h-16 p-1 text-white/90" />
                  )}
                </div>
                {/* Hover Controls */}
                <div
                  className={`absolute inset-0 bg-black/50 rounded-full ${
                    isUploadingPicture
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  } transition-opacity flex items-center justify-center`}
                >
                  {isUploadingPicture ? (
                    <div className="text-white text-xs">Uploading...</div>
                  ) : (
                    <button
                      onClick={handleProfilePictureEdit}
                      disabled={isUploadingPicture || isSaving}
                      className={`w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors ${
                        isUploadingPicture || isSaving
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                      title={
                        currentData.ProfilePicture
                          ? "Change Profile Picture"
                          : "Upload Profile Picture"
                      }
                    >
                      <Edit3 size={12} className="text-white" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    {isEditing ? (
                      <div className="flex gap-2 mb-1">
                        <input
                          type="text"
                          value={currentData.FirstName}
                          onChange={(e) =>
                            handleInputChange("FirstName", e.target.value)
                          }
                          className="text-lg font-bold bg-white/10 text-white placeholder-white/70 border border-white/20 rounded px-2 py-1 w-32"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          value={currentData.LastName}
                          onChange={(e) =>
                            handleInputChange("LastName", e.target.value)
                          }
                          className="text-lg font-bold bg-white/10 text-white placeholder-white/70 border border-white/20 rounded px-2 py-1 w-32"
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      <h1 className="text-2xl font-bold text-white mb-1">
                        {currentData.FirstName} {currentData.LastName}
                      </h1>
                    )}
                    <div className="flex items-center gap-4 text-slate-200 text-lg">
                      <span>Employee ID: {currentData.EmpID}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          currentData.IsActive
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {currentData.IsActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Edit/Save/Cancel Buttons */}
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className={`px-3 py-1.5 ${
                            isSaving ? "cursor-not-allowed" : ""
                          } hover:bg-green-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1`}
                        >
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Save />
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isSaving}
                          className={`px-3 py-1.5 ${
                            isSaving ? "cursor-not-allowed" : ""
                          } hover:bg-red-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1`}
                        >
                          <X />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEdit}
                        disabled={isSaving}
                        className={`p-2 ${
                          isSaving
                            ? "cursor-not-allowed opacity-50"
                            : "hover:bg-gray-800"
                        } text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1`}
                      >
                        <SquarePen />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Two Row Layout */}
          <div className="p-3">
            {/* First Row - Contact and Personal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Contact Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2">
                  <i className="fas fa-address-book text-blue-500 mr-2"></i>
                  Contact
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      Work Email
                    </div>
                    {isEditing ? (
                      <input
                        type="email"
                        value={currentData.WorkEmail}
                        onChange={(e) =>
                          handleInputChange("WorkEmail", e.target.value)
                        }
                        className="w-full text-sm text-slate-700 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-lg text-slate-700 break-all">
                        {currentData.WorkEmail}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      Personal Email
                    </div>
                    {isEditing ? (
                      <input
                        type="email"
                        value={currentData.PersonalEmail}
                        onChange={(e) =>
                          handleInputChange("PersonalEmail", e.target.value)
                        }
                        className="w-full text-sm text-slate-700 border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-lg text-slate-700 break-all">
                        {currentData.PersonalEmail}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-slate-500 mb-1">Phone</div>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={currentData.PhoneNumber}
                        onChange={(e) =>
                          handleInputChange("PhoneNumber", e.target.value)
                        }
                        className="w-full text-sm text-slate-700 border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-lg text-slate-700">
                        {currentData.PhoneNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2">
                  <i className="fas fa-user text-purple-500 mr-2"></i>Personal
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Gender</div>
                    {isEditing ? (
                      <select
                        value={currentData.Gender}
                        onChange={(e) =>
                          handleInputChange("Gender", e.target.value)
                        }
                        className="w-full text-sm text-slate-700 border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <div className="text-lg text-slate-700">
                        {currentData.Gender}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      Date of Birth
                    </div>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formatDateForInput(currentData.DateOfBirth)}
                        onChange={(e) =>
                          handleInputChange(
                            "DateOfBirth",
                            new Date(e.target.value).toISOString()
                          )
                        }
                        className="w-full text-sm text-slate-700 border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-lg text-slate-700">
                        {formatDate(currentData.DateOfBirth)}
                      </div>
                    )}
                  </div>
                  {/* <div>
                    <div className="text-sm text-slate-500 mb-1">Age</div>
                    <div className="text-lg text-slate-700">
                      {calculateAge(currentData.DateOfBirth)} years
                    </div>
                  </div> */}
                  <div className="col-span-2">
                    <div className="text-sm text-slate-500 mb-1">Address</div>
                    {isEditing ? (
                      <textarea
                        value={currentData.Address}
                        onChange={(e) =>
                          handleInputChange("Address", e.target.value)
                        }
                        className="w-full text-sm text-slate-700 border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        rows="2"
                      />
                    ) : (
                      <div className="text-lg text-slate-700 leading-relaxed">
                        {currentData.Address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Employment and Emergency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employment Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2">
                  <i className="fas fa-briefcase text-green-500 mr-2"></i>
                  Employment
                </h3>
                <div className="space-y-3 grid grid-cols-4 gap-x-4">
                  {/* Join Date */}
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Join Date</div>
                    <div className="text-lg text-slate-700">
                      {formatDate(currentData.DateOfJoining)}
                    </div>
                  </div>

                  {/* Role Name */}
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Role</div>
                    <div className="text-lg text-slate-700">
                      {currentData.RoleID === 1 ? "Admin" : "User"}
                    </div>
                  </div>

                  {/* Onboarding Status */}
                  <div>
                    <div className="text-sm  text-slate-500 mb-1">
                      Onboarding
                    </div>

                    <span
                      className={`text-sm px-2 py-1 rounded-full font-medium ${
                        currentData.OBStatus
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {currentData.OBStatus ? "Completed" : "Pending"}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Status</div>

                    <span
                      className={`text-sm px-2 py-1 rounded-full font-medium ${
                        currentData.IsActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {currentData.IsActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2">
                  <i className="fas fa-exclamation-triangle text-amber-500 mr-2"></i>
                  Emergency
                </h3>
                <div className="space-y-3 grid grid-cols-2 gap-x-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      Contact Name
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentData.EmergencyContact}
                        onChange={(e) =>
                          handleInputChange("EmergencyContact", e.target.value)
                        }
                        className="w-full text-sm text-slate-700 border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-lg text-slate-700">
                        {currentData.EmergencyContact}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      Contact Number
                    </div>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={currentData.EmergencyContactNumber}
                        onChange={(e) =>
                          handleInputChange(
                            "EmergencyContactNumber",
                            e.target.value
                          )
                        }
                        className="w-full text-sm text-slate-700 border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-lg text-slate-700">
                        {currentData.EmergencyContactNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
