import type { AxiosRequestConfig } from "axios";
import MockAdapter from "axios-mock-adapter";
import { apiClient } from "./client";
import { env } from "../config/env";
import type {
  Address,
  AuthTokens,
  CartSummary,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductsQuery,
  User
} from "../types";

interface UserRecord extends User {
  password: string;
}

interface CartItemRecord {
  id: string;
  productId: string;
  quantity: number;
}

interface CartRecord {
  id: number;
  items: CartItemRecord[];
}

let mockAdapter: MockAdapter | null = null;

const users: UserRecord[] = [
  {
    id: "u1",
    name: "Ava Harper",
    email: "ava@storefront.dev",
    role: "customer",
    password: "password123"
  },
  {
    id: "u2",
    name: "Elliot Stone",
    email: "elliot@storefront.dev",
    role: "admin",
    password: "admin123"
  }
];

const categories: Category[] = [
  {
    id: "c1",
    name: "Apparel",
    description: "Tailored essentials for every day"
  },
  {
    id: "c2",
    name: "Accessories",
    description: "Finish every look with thoughtful details"
  },
  {
    id: "c3",
    name: "Home & Living",
    description: "Objects that make your space feel like you"
  }
];

const products: Product[] = [
  {
    id: "p1",
    name: "Everyday Linen Shirt",
    description: "Breathable linen shirt with a relaxed fit and corozo buttons.",
    price: 78,
    currency: "USD",
    categoryId: "c1",
    image: "/images/products/linen-shirt.jpg",
    gallery: ["/images/products/linen-shirt.jpg", "/images/products/linen-shirt-detail.jpg"],
    inventory: 42,
    featured: true,
    rating: 4.6,
    createdAt: new Date("2024-02-01T08:00:00Z").toISOString()
  },
  {
    id: "p2",
    name: "Ridge Knit Sweater",
    description: "Organic cotton sweater with a modern textured stitch.",
    price: 96,
    currency: "USD",
    categoryId: "c1",
    image: "/images/products/ridge-knit.jpg",
    gallery: ["/images/products/ridge-knit.jpg", "/images/products/ridge-knit-detail.jpg"],
    inventory: 15,
    featured: true,
    rating: 4.8,
    createdAt: new Date("2024-02-15T08:00:00Z").toISOString()
  },
  {
    id: "p3",
    name: "Sierra Canvas Tote",
    description: "Durable canvas tote with interior organization and leather trim.",
    price: 68,
    currency: "USD",
    categoryId: "c2",
    image: "/images/products/sierra-tote.jpg",
    gallery: ["/images/products/sierra-tote.jpg", "/images/products/sierra-tote-detail.jpg"],
    inventory: 30,
    featured: true,
    rating: 4.7,
    createdAt: new Date("2024-01-28T08:00:00Z").toISOString()
  },
  {
    id: "p4",
    name: "Marble Keep Cup",
    description: "Handmade ceramic tumbler finished with a satin glaze.",
    price: 32,
    currency: "USD",
    categoryId: "c3",
    image: "/images/products/marble-cup.jpg",
    gallery: ["/images/products/marble-cup.jpg"],
    inventory: 60,
    featured: false,
    rating: 4.5,
    createdAt: new Date("2024-01-20T08:00:00Z").toISOString()
  },
  {
    id: "p5",
    name: "Cloud Cotton Throw",
    description: "Supremely soft throw woven from recycled cotton blends.",
    price: 120,
    currency: "USD",
    categoryId: "c3",
    image: "/images/products/cloud-throw.jpg",
    gallery: ["/images/products/cloud-throw.jpg", "/images/products/cloud-throw-detail.jpg"],
    inventory: 22,
    featured: true,
    rating: 4.9,
    createdAt: new Date("2024-02-20T08:00:00Z").toISOString()
  },
  {
    id: "p6",
    name: "Arc Leather Belt",
    description: "Vegetable-tanned leather belt finished with brushed brass hardware.",
    price: 58,
    currency: "USD",
    categoryId: "c2",
    image: "/images/products/arc-belt.jpg",
    gallery: ["/images/products/arc-belt.jpg"],
    inventory: 45,
    featured: false,
    rating: 4.3,
    createdAt: new Date("2024-01-12T08:00:00Z").toISOString()
  },
  {
    id: "p7",
    name: "Summit Quilted Jacket",
    description: "Insulated jacket crafted with recycled fill and water-resistant shell.",
    price: 168,
    currency: "USD",
    categoryId: "c1",
    image: "/images/products/summit-jacket.jpg",
    gallery: ["/images/products/summit-jacket.jpg", "/images/products/summit-jacket-detail.jpg"],
    inventory: 12,
    featured: false,
    rating: 4.4,
    createdAt: new Date("2023-12-28T08:00:00Z").toISOString()
  },
  {
    id: "p8",
    name: "Aero Wool Scarf",
    description: "Featherweight merino scarf with ombré gradient.",
    price: 54,
    currency: "USD",
    categoryId: "c2",
    image: "/images/products/aero-scarf.jpg",
    gallery: ["/images/products/aero-scarf.jpg"],
    inventory: 80,
    featured: false,
    rating: 4.2,
    createdAt: new Date("2024-02-05T08:00:00Z").toISOString()
  },
  {
    id: "p9",
    name: "Lumen Table Lamp",
    description: "Sculptural table lamp with warm LED illumination and linen shade.",
    price: 210,
    currency: "USD",
    categoryId: "c3",
    image: "/images/products/lumen-lamp.jpg",
    gallery: ["/images/products/lumen-lamp.jpg", "/images/products/lumen-lamp-detail.jpg"],
    inventory: 18,
    featured: false,
    rating: 4.6,
    createdAt: new Date("2024-01-05T08:00:00Z").toISOString()
  }
];

const carts = new Map<string, CartRecord>();
const orders: Order[] = [];
const accessTokens = new Map<string, string>();
const refreshTokens = new Map<string, string>();

function createTokens(userId: string): AuthTokens {
  const accessToken = crypto.randomUUID();
  const refreshToken = crypto.randomUUID();
  accessTokens.set(accessToken, userId);
  refreshTokens.set(refreshToken, userId);
  return { accessToken, refreshToken };
}

function findUserByAccessToken(token: string | null): UserRecord | null {
  if (!token) {
    return null;
  }
  const userId = accessTokens.get(token);
  return userId ? users.find((user) => user.id === userId) ?? null : null;
}

function extractTokenFromConfig(config: AxiosRequestConfig): string | null {
  const header = (config.headers?.Authorization ?? config.headers?.authorization) as string | undefined;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

function ensureCart(userId: string): CartRecord {
  if (!carts.has(userId)) {
    carts.set(userId, { id: carts.size + 1, items: [] });
  }
  return carts.get(userId) as CartRecord;
}

function buildCartSummary(userId: string): CartSummary {
  const cart = ensureCart(userId);
  const items = cart.items.map((item) => {
    const product = products.find((productItem) => productItem.id === item.productId);
    if (!product) {
      return null;
    }
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product
    };
  });

  const definedItems = items.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const subtotal = definedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return {
    id: cart.id,
    items: definedItems,
    subtotal,
    tax,
    total,
    currency: "USD"
  };
}

function parseBody<T>(data: unknown): T {
  if (typeof data === "string") {
    return JSON.parse(data) as T;
  }
  return data as T;
}

function parseProductsQuery(config: AxiosRequestConfig): ProductsQuery {
  const params = new URLSearchParams();

  if (typeof config.url === "string") {
    const queryIndex = config.url.indexOf("?");
    if (queryIndex >= 0) {
      const query = config.url.slice(queryIndex + 1);
      new URLSearchParams(query).forEach((value, key) => params.set(key, value));
    }
  }

  if (config.params && typeof config.params === "object") {
    Object.entries(config.params as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
  }

  const query: ProductsQuery = {};
  if (params.get("search")) {
    query.search = params.get("search") ?? undefined;
  }
  if (params.get("category")) {
    query.category = params.get("category") ?? undefined;
  }
  if (params.get("sort")) {
    const sort = params.get("sort");
    if (sort === "price-asc" || sort === "price-desc" || sort === "latest") {
      query.sort = sort;
    }
  }
  const minPrice = params.get("minPrice");
  if (minPrice) {
    query.minPrice = Number(minPrice);
  }
  const maxPrice = params.get("maxPrice");
  if (maxPrice) {
    query.maxPrice = Number(maxPrice);
  }
  const page = params.get("page");
  if (page) {
    query.page = Number(page);
  }
  const pageSize = params.get("pageSize");
  if (pageSize) {
    query.pageSize = Number(pageSize);
  }

  return query;
}

function publicUser(user: UserRecord): User {
  const { password: _password, ...rest } = user;
  return rest;
}

function ensureAuthenticated(config: AxiosRequestConfig): UserRecord {
  const token = extractTokenFromConfig(config);
  const user = findUserByAccessToken(token);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

function filterProducts(query: ProductsQuery): Product[] {
  let filtered = [...products];
  if (query.search) {
    const term = query.search.toLowerCase();
    filtered = filtered.filter(
      (product) => product.name.toLowerCase().includes(term) || product.description.toLowerCase().includes(term)
    );
  }
  if (query.category) {
    filtered = filtered.filter((product) => product.categoryId === query.category);
  }
  if (typeof query.minPrice === "number") {
    filtered = filtered.filter((product) => product.price >= query.minPrice);
  }
  if (typeof query.maxPrice === "number") {
    filtered = filtered.filter((product) => product.price <= query.maxPrice);
  }
  if (query.sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (query.sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (query.sort === "latest") {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
  return filtered;
}

function findOrder(orderId: string): Order | undefined {
  return orders.find((order) => order.id === orderId);
}

function ensureOrderAccess(orderId: string, user: UserRecord): Order {
  const order = findOrder(orderId);
  if (!order) {
    throw new Error("Not Found");
  }
  if (user.role !== "admin" && order.userId !== user.id) {
    throw new Error("Forbidden");
  }
  return order;
}

function buildOrderItem(cartItem: CartItemRecord): OrderItem {
  const product = products.find((item) => item.id === cartItem.productId);
  if (!product) {
    throw new Error("Product not found");
  }
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    quantity: cartItem.quantity,
    price: product.price,
    product
  };
}

function createOrderFromCart(user: UserRecord, address: Address): Order {
  const cart = ensureCart(user.id);
  const orderItems = cart.items.map(buildOrderItem);
  const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  const order: Order = {
    id: crypto.randomUUID(),
    userId: user.id,
    status: "pending",
    items: orderItems,
    subtotal,
    tax,
    total,
    currency: "USD",
    createdAt: new Date().toISOString(),
    address,
    paymentRef: `pay_${crypto.randomUUID().slice(0, 8)}`,
    paidAt: null
  };
  orders.unshift(order);
  carts.set(user.id, { id: cart.id, items: [] });
  return order;
}

function removeToken(token: string): void {
  accessTokens.delete(token);
}

export function setupMockServer(): void {
  if (mockAdapter) {
    return;
  }

  mockAdapter = new MockAdapter(apiClient, { delayResponse: 150 });

  mockAdapter.onPost(/\/auth\/login/).reply((config) => {
    const { email, password } = parseBody<{ email: string; password: string }>(config.data);
    const user = users.find((candidate) => candidate.email === email && candidate.password === password);
    if (!user) {
      return [401, { detail: "Invalid credentials" }];
    }

    const tokens = createTokens(user.id);
    return [200, { tokens, user: publicUser(user) }];
  });

  mockAdapter.onPost(/\/auth\/refresh/).reply((config) => {
    const { refreshToken } = parseBody<{ refreshToken: string }>(config.data);
    const userId = refreshTokens.get(refreshToken);
    if (!userId) {
      return [401, { detail: "Invalid refresh token" }];
    }
    const tokens = createTokens(userId);
    return [200, tokens];
  });

  mockAdapter.onGet(/\/auth\/me/).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      return [200, publicUser(user)];
    } catch {
      return [401, { detail: "Unauthorized" }];
    }
  });

  mockAdapter.onGet(/\/categories/).reply(200, categories);

  mockAdapter.onGet(/\/products$/).reply((config) => {
    const query = parseProductsQuery(config);
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 6;
    const filtered = filterProducts(query);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return [200, { items: paginated, page, pageSize, total, totalPages }];
  });

  mockAdapter.onGet(/\/products\//).reply((config) => {
    const id = config.url?.split("/").pop();
    const product = products.find((item) => item.id === id);
    if (!product) {
      return [404, { detail: "Product not found" }];
    }
    return [200, product];
  });

  mockAdapter.onPost(/\/products/).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      if (user.role !== "admin") {
        return [403, { detail: "Forbidden" }];
      }
      const payload = parseBody<Partial<Product>>(config.data);
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: payload.name ?? "Untitled product",
        description: payload.description ?? "",
        price: payload.price ?? 0,
        currency: payload.currency ?? "USD",
        categoryId: payload.categoryId ?? categories[0]?.id ?? "",
        image: payload.image ?? "/images/products/placeholder.jpg",
        gallery: payload.gallery ?? [payload.image ?? "/images/products/placeholder.jpg"],
        inventory: payload.inventory ?? 0,
        featured: payload.featured ?? false,
        rating: payload.rating ?? 0,
        createdAt: new Date().toISOString()
      };
      products.unshift(newProduct);
      return [201, newProduct];
    } catch (error) {
      if ((error as Error).message === "Unauthorized") {
        return [401, { detail: "Unauthorized" }];
      }
      return [400, { detail: (error as Error).message }];
    }
  });

  mockAdapter.onPatch(/\/products\//).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      if (user.role !== "admin") {
        return [403, { detail: "Forbidden" }];
      }
      const id = config.url?.split("/").pop();
      const payload = parseBody<Partial<Product>>(config.data);
      const productIndex = products.findIndex((item) => item.id === id);
      if (productIndex === -1) {
        return [404, { detail: "Product not found" }];
      }
      const updated: Product = { ...products[productIndex], ...payload };
      products[productIndex] = updated;
      return [200, updated];
    } catch (error) {
      if ((error as Error).message === "Unauthorized") {
        return [401, { detail: "Unauthorized" }];
      }
      return [400, { detail: (error as Error).message }];
    }
  });

  mockAdapter.onDelete(/\/products\//).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      if (user.role !== "admin") {
        return [403, { detail: "Forbidden" }];
      }
      const id = config.url?.split("/").pop();
      const productIndex = products.findIndex((item) => item.id === id);
      if (productIndex === -1) {
        return [404, { detail: "Product not found" }];
      }
      products.splice(productIndex, 1);
      return [204];
    } catch (error) {
      if ((error as Error).message === "Unauthorized") {
        return [401, { detail: "Unauthorized" }];
      }
      return [400, { detail: (error as Error).message }];
    }
  });

  mockAdapter.onGet(/\/cart/).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      return [200, buildCartSummary(user.id)];
    } catch {
      return [401, { detail: "Unauthorized" }];
    }
  });

  mockAdapter.onPost(/\/cart/).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      const payload = parseBody<{ productId: string; quantity: number }>(config.data);
      const product = products.find((item) => item.id === payload.productId);
      if (!product) {
        return [404, { detail: "Product not found" }];
      }
      const cart = ensureCart(user.id);
      const existing = cart.items.find((item) => item.productId === payload.productId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + payload.quantity, product.inventory);
      } else {
        cart.items.push({ id: crypto.randomUUID(), productId: payload.productId, quantity: Math.min(payload.quantity, product.inventory) });
      }
      return [200, buildCartSummary(user.id)];
    } catch {
      return [401, { detail: "Unauthorized" }];
    }
  });

  mockAdapter.onPatch(/\/cart\//).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      const id = config.url?.split("/").pop();
      const payload = parseBody<{ quantity: number }>(config.data);
      const cart = ensureCart(user.id);
      const item = cart.items.find((candidate) => candidate.id === id);
      if (!item) {
        return [404, { detail: "Cart item not found" }];
      }
      if (payload.quantity <= 0) {
        cart.items = cart.items.filter((candidate) => candidate.id !== id);
      } else {
        const product = products.find((productItem) => productItem.id === item.productId);
        const maxQuantity = product?.inventory ?? payload.quantity;
        item.quantity = Math.min(payload.quantity, maxQuantity);
      }
      return [200, buildCartSummary(user.id)];
    } catch {
      return [401, { detail: "Unauthorized" }];
    }
  });

  mockAdapter.onDelete(/\/cart\//).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      const id = config.url?.split("/").pop();
      const cart = ensureCart(user.id);
      cart.items = cart.items.filter((candidate) => candidate.id !== id);
      return [200, buildCartSummary(user.id)];
    } catch {
      return [401, { detail: "Unauthorized" }];
    }
  });

  mockAdapter.onDelete(/\/cart$/).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      const cart = ensureCart(user.id);
      cart.items = [];
      return [200, buildCartSummary(user.id)];
    } catch {
      return [401, { detail: "Unauthorized" }];
    }
  });

  mockAdapter.onPost(/\/checkout/).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      const payload = parseBody<{ cart_id?: number }>(config.data);
      const cart = ensureCart(user.id);
      if (cart.items.length === 0) {
        return [400, { detail: "Your cart is empty" }];
      }
      if (typeof payload.cart_id === "number" && payload.cart_id !== cart.id) {
        return [400, { detail: "Cart mismatch" }];
      }
      const order = createOrderFromCart(user, {
        fullName: user.name,
        email: user.email,
        phone: "000-000-0000",
        line1: "123 Mockingbird Lane",
        city: "Mock City",
        state: "CA",
        postalCode: "00000",
        country: "USA"
      });
      const clientSecret = crypto.randomUUID().replace(/-/g, "");
      return [201, { order_id: order.id, payment_ref: order.paymentRef, client_secret: clientSecret }];
    } catch (error) {
      if ((error as Error).message === "Unauthorized") {
        return [401, { detail: "Unauthorized" }];
      }
      return [400, { detail: (error as Error).message }];
    }
  });

  mockAdapter.onGet(/\/orders$/).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      if (user.role === "admin") {
        return [200, orders];
      }
      return [200, orders.filter((order) => order.userId === user.id)];
    } catch {
      return [401, { detail: "Unauthorized" }];
    }
  });

  mockAdapter.onGet(/\/orders\//).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      const id = config.url?.split("/").pop();
      if (!id) {
        return [404, { detail: "Order not found" }];
      }
      const order = ensureOrderAccess(id, user);
      return [200, order];
    } catch (error) {
      const message = (error as Error).message;
      if (message === "Unauthorized") {
        return [401, { detail: "Unauthorized" }];
      }
      if (message === "Forbidden") {
        return [403, { detail: "Forbidden" }];
      }
      return [404, { detail: "Order not found" }];
    }
  });

  mockAdapter.onPost(/\/orders/).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      const payload = parseBody<{ address: Address }>(config.data);
      const summary = buildCartSummary(user.id);
      if (summary.items.length === 0) {
        return [400, { detail: "Your cart is empty" }];
      }
      const order = createOrderFromCart(user, payload.address);
      return [201, order];
    } catch (error) {
      if ((error as Error).message === "Unauthorized") {
        return [401, { detail: "Unauthorized" }];
      }
      return [400, { detail: (error as Error).message }];
    }
  });

  mockAdapter.onPatch(/\/orders\//).reply((config) => {
    try {
      const user = ensureAuthenticated(config);
      if (user.role !== "admin") {
        return [403, { detail: "Forbidden" }];
      }
      const id = config.url?.split("/").pop();
      const payload = parseBody<{ status: OrderStatus }>(config.data);
      const order = findOrder(id ?? "");
      if (!order) {
        return [404, { detail: "Order not found" }];
      }
      order.status = payload.status;
      if (payload.status === "paid") {
        order.paidAt = order.paidAt ?? new Date().toISOString();
      }
      return [200, order];
    } catch {
      return [401, { detail: "Unauthorized" }];
    }
  });

  mockAdapter.onPost(/\/webhooks\/mock-payments/).reply((config) => {
    const signature =
      config.headers?.["x-mockpay-signature"] ?? config.headers?.["X-Mockpay-Signature"] ?? config.headers?.["X-MockPay-Signature"];
    if (signature !== env.mockPaymentSecret) {
      return [401, { detail: "Invalid signature" }];
    }
    const payload = parseBody<{ payment_ref: string }>(config.data);
    const order = orders.find((item) => item.paymentRef === payload.payment_ref);
    if (!order) {
      return [404, { detail: "Order not found" }];
    }
    if (order.status !== "paid") {
      order.status = "paid";
      order.paidAt = new Date().toISOString();
    }
    return [200, order];
  });

  mockAdapter.onPost(/\/auth\/logout/).reply((config) => {
    const token = extractTokenFromConfig(config);
    if (token) {
      removeToken(token);
    }
    return [204];
  });
}
