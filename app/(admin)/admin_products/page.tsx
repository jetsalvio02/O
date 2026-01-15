"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
};

const EMPTY_PRODUCT: Product = {
  id: 0,
  name: "",
  price: 0,
  stock: 0,
  image: null,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------------- SAVE (ADD / EDIT) ---------------- */
  const saveProduct = async () => {
    if (!editing) return;

    setLoading(true);

    let imagePath = editing.image;

    // upload image if changed
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      const uploadRes = await fetch("/api/upload/product", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      imagePath = uploadData.path;
    }

    const method = editing.id === 0 ? "POST" : "PUT";

    await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(editing.id !== 0 && { id: editing.id }),
        name: editing.name,
        price: Number(editing.price),
        stock: Number(editing.stock),
        image: imagePath,
      }),
    });

    setEditing(null);
    setImageFile(null);
    setLoading(false);
    fetchProducts();
  };

  /* ---------------- DELETE ---------------- */
  const confirm_to_delete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    return result.isConfirmed;
  };

  const deleteProduct = async () => {
    if (!editing) return;

    const confirmDelete = await confirm_to_delete();
    if (!confirmDelete) return;

    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id }),
    });

    setEditing(null);
    fetchProducts();
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Product Management
          </h2>
          <p className="text-sm text-gray-500">
            Manage products, prices, inventory, and images
          </p>
        </div>

        <button
          onClick={() => setEditing({ ...EMPTY_PRODUCT })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="text-left">Price</th>
              <th className="text-left">Stock</th>
              <th className="text-left">Image</th>
              <th className="px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td>₱{p.price.toLocaleString("en-Ph")}</td>
                <td>
                  {p.stock}{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      p.stock > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td>
                  {p.image && (
                    <img
                      src={p.image}
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                </td>
                <td className="px-6 text-right">
                  <button
                    onClick={() => setEditing(p)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {loadingProducts && (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  <div className="flex justify-center items-center gap-2 text-gray-500">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-600"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Loading products...
                  </div>
                </td>
              </tr>
            )}

            {!loadingProducts && products.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-1">
              {editing.id === 0 ? "Add Product" : "Edit Product"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">Enter product details</p>

            <div className="space-y-4">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Product name"
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2"
                  placeholder="Price"
                  value={editing.price === 0 ? "" : editing.price}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      price: Number(e.target.value),
                    })
                  }
                />
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2"
                  placeholder="Stock"
                  value={editing.stock === 0 ? "" : editing.stock}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      stock: Number(e.target.value),
                    })
                  }
                />
              </div>

              {previewImage ? (
                <img
                  src={previewImage}
                  className="h-24 w-24 object-cover rounded border"
                />
              ) : (
                editing.image && (
                  <img
                    src={editing.image}
                    className="h-24 w-24 object-cover rounded border"
                  />
                )
              )}

              <input
                type="file"
                className="border rounded-lg px-3 py-2"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);

                  if (file) {
                    setPreviewImage(URL.createObjectURL(file));
                  } else {
                    setPreviewImage(null);
                  }
                }}
              />
            </div>

            {/* MODAL ACTIONS */}
            <div className="flex justify-between">
              <div className="flex justify-center">
                {editing.id !== 0 && (
                  <button
                    onClick={deleteProduct}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete Product
                  </button>
                )}
              </div>
              <div
                className="flex justify-end
                 items-center mt-6"
              >
                <div className="flex justify-end">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditing(null);
                        setImageFile(null);
                        setPreviewImage(null);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={loading}
                      onClick={saveProduct}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
