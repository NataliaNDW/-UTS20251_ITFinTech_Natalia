"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add"|"edit">("add");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  const openAddModal = () => {
    setForm({ name: "", description: "", price: "" });
    setEditId(null);
    setModalType("add");
    setModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditId(product._id);
    setForm({ name: product.name, description: product.description, price: product.price.toString() });
    setModalType("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ name: "", description: "", price: "" });
    setEditId(null);
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error("No product ID provided");
      return;
    }

    try {
      console.log("Deleting product with ID:", id);
      //get product by id
      const product = products.find((p: any) => p._id === id);
      if (!product) {
        console.error("Product not found");
        return;
      }
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      const data = await response.json();
      console.log("Delete response:", data);
      
      setProducts(products.filter((p: any) => p._id !== id));
      setShowDeleteAlert(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      // TODO: Tampilkan error message ke user
    }
  };

  const handleSave = async () => {
    if (modalType === "edit" && editId) {
      await fetch(`/api/products/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) })
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) })
      });
    }
    closeModal();
    location.reload();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  // DataTable columns
  const columns = [
    {
      accessorKey: "name",
      header: "Nama Produk",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "price",
      header: "Harga",
      cell: (info: any) => `Rp ${Number(info.getValue()).toLocaleString()}`,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openEditModal(row.original)}>Edit</Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setDeleteId(row.original._id);
              setShowDeleteAlert(true);
            }}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin: Produk</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold text-lg">Manajemen Produk</h2>
          <Button variant="default" onClick={openAddModal}>Tambah Produk</Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={products} />
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogTitle>{modalType === "add" ? "Tambah Produk" : "Edit Produk"}</DialogTitle>
          <h2 className="text-lg font-semibold mb-4">{modalType === "add" ? "Tambah Produk" : "Edit Produk"}</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Nama produk"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="border px-2 py-1 rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Deskripsi"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="border px-2 py-1 rounded w-full mb-2"
            />
            <input
              type="number"
              placeholder="Harga"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="border px-2 py-1 rounded w-full mb-2"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={closeModal}>Batal</Button>
            <Button variant="default" onClick={handleSave}>{modalType === "add" ? "Tambah" : "Simpan"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Produk akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteAlert(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
