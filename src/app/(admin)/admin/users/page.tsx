"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  const columns = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: (info: any) => info.getValue() || "-",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info: any) => (
        <span className={`px-2 py-1 rounded text-sm ${
          info.getValue() === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
        }`}>
          {info.getValue()}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin: Daftar User</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-lg">Manajemen User</h2>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} />
        </CardContent>
      </Card>
    </div>
  );
}
