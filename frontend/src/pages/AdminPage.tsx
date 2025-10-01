import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "../lib/zodResolver";
import { createProduct, deleteProduct, updateProduct } from "../api/products";
import { fetchOrders, updateOrderStatus } from "../api/orders";
import { useProducts, useCategories } from "../hooks/useProducts";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select } from "../components/ui/select";
import { Label } from "../components/ui/label";
import type { Product, Order, OrderStatus } from "../types";
import { showSuccessToast } from "../lib/toast";
import { LoadingState } from "../components/shared/LoadingState";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  image: z.string().min(5),
  gallery: z.string().min(5),
  inventory: z.coerce.number().min(0),
  featured: z.boolean().default(false),
  rating: z.coerce.number().min(0).max(5)
});

type ProductFormValues = z.infer<typeof productSchema>;

export function AdminPage(): JSX.Element {
  const queryClient = useQueryClient();
  const categoriesQuery = useCategories();
  const productsQuery = useProducts({ page: 1, pageSize: 12, sort: "latest" });
  const ordersQuery = useQuery({ queryKey: ["admin-orders"], queryFn: fetchOrders });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      image: "",
      gallery: "",
      inventory: 0,
      featured: false,
      rating: 4.5
    }
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        categoryId: editingProduct.categoryId,
        image: editingProduct.image,
        gallery: editingProduct.gallery[0] ?? editingProduct.image,
        inventory: editingProduct.inventory,
        featured: editingProduct.featured,
        rating: editingProduct.rating
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        categoryId: categoriesQuery.data?.[0]?.id ?? "",
        image: "",
        gallery: "",
        inventory: 0,
        featured: false,
        rating: 4.5
      });
    }
  }, [editingProduct, categoriesQuery.data, form]);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      showSuccessToast("Product created");
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, values }: { productId: string; values: Partial<Product> }) => updateProduct(productId, values),
    onSuccess: () => {
      showSuccessToast("Product updated");
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      showSuccessToast("Product deleted");
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      showSuccessToast("Order updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    }
  });

  const onSubmit = (values: ProductFormValues) => {
    const payload: Partial<Product> = {
      name: values.name,
      description: values.description,
      price: values.price,
      categoryId: values.categoryId,
      image: values.image,
      gallery: [values.gallery || values.image],
      inventory: values.inventory,
      featured: values.featured,
      rating: values.rating,
      currency: "USD"
    };

    if (editingProduct) {
      updateMutation.mutate({ productId: editingProduct.id, values: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const orders: Order[] = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);

  if (productsQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingState message="Loading admin data" />;
  }

  return (
    <div className="bg-slate-50">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:px-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
              <p className="text-sm text-slate-500">Create, update, and manage the catalog.</p>
            </div>
            {editingProduct ? (
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setEditingProduct(null)}>
                New product
              </Button>
            ) : null}
          </div>
          <form className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" className="mt-2" {...form.register("name")} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} className="mt-2" {...form.register("description")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" className="mt-2" {...form.register("price")} />
              </div>
              <div>
                <Label htmlFor="inventory">Inventory</Label>
                <Input id="inventory" type="number" className="mt-2" {...form.register("inventory")} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select id="category" className="mt-2" value={form.watch("categoryId")} onChange={(event) => form.setValue("categoryId", event.target.value)}>
                  <option value="">Select a category</option>
                  {categoriesQuery.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input id="rating" type="number" step="0.1" className="mt-2" {...form.register("rating")} />
              </div>
            </div>
            <div>
              <Label htmlFor="image">Primary image URL</Label>
              <Input id="image" className="mt-2" {...form.register("image")} />
            </div>
            <div>
              <Label htmlFor="gallery">Gallery image URL</Label>
              <Input id="gallery" className="mt-2" {...form.register("gallery")} />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="featured"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={form.watch("featured")}
                onChange={(event) => form.setValue("featured", event.target.checked)}
              />
              <Label htmlFor="featured" className="text-sm text-slate-600">
                Mark as featured
              </Label>
            </div>
            <Button type="submit" className="rounded-full" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingProduct ? "Update product" : "Create product"}
            </Button>
          </form>

          <div className="grid gap-4">
            {productsQuery.data?.items.map((product) => (
              <div key={product.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{product.name}</h2>
                  <p className="text-sm text-slate-500">${product.price.toFixed(2)} • Stock {product.inventory}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" className="rounded-full" onClick={() => setEditingProduct(product)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => deleteMutation.mutate(product.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Orders board</h2>
            <p className="text-sm text-slate-500">Monitor live orders and update their status.</p>
          </div>
          {ordersQuery.isLoading ? (
            <LoadingState message="Loading orders" />
          ) : (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-sm text-slate-500">No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Order {String(order.id).slice(0, 8)}</p>
                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      {order.items.length} items • {order.address.fullName}
                    </div>
                    <Select
                      value={order.status}
                      onChange={(event) =>
                        statusMutation.mutate({ orderId: order.id, status: event.target.value as OrderStatus })
                      }
                      className="mt-3 rounded-full border-slate-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </div>
                ))
              )}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
