import React from "react";
import AdminLayout from "@/layouts/AdminLayout";
import FilterSection from "./FilterSection";
import UserTable from "./UseTable";

export default function UserManagementPage() {
  return (
    <AdminLayout
      title="Quản lý người dùng"
      activeMenu="users"
      activeSubmenu="all-users"
    >
      <FilterSection />
      <UserTable />
    </AdminLayout>
  );
}
