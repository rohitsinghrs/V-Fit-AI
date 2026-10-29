
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "http://127.0.0.1:8000";

type CartItem = {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
};

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  is_featured: boolean;
};

type CartEntry = {
  item: CartItem;
  product: Product | null;
};

export default function CartPage() {
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError("");
    setLoggedOut(false);

    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setLoggedOut(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("access_token");
        setLoggedOut(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Cart load nahi ho paaya.");
      }

      const items: CartItem[] = await response.json();

      const results = await Promise.all(
        items.map(async (item) => {
          try {
            const productResponse = await fetch(
              `${API_URL}/products/${item.product_id}`
            );

            if (!productResponse.ok) {
              return { item, product: null };
            }

            const product: Product = await productResponse.json();
            return { item, product };
          } catch {
            return { item, product: null };
          }
        })
      );

      setEntries(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function updateQuantity(itemId: number, quantity: number) {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setLoggedOut(true);
      return;
    }

    setUpdatingId(itemId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("access_token");
        setLoggedOut(true);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Quantity update nahi hui."
        );
      }

      await loadCart();
      setMessage("Cart quantity updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Quantity update nahi hui."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(itemId: number) {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setLoggedOut(true);
      return;
    }

    setUpdatingId(itemId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("access_token");
        setLoggedOut(true);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Product remove nahi ho paaya."
        );
      }

      await loadCart();
      setMessage("Product removed from cart.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Product remove nahi ho paaya."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const total = entries.reduce((sum, entry) => {
    return sum + (entry.product?.price ?? 0) * entry.item.quantity;
  }, 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <main className="min-h-screen bg-[#080811] px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-black">
            V-Fit <span className="text-violet-400">AI</span>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
          >
            Continue Shopping
          </Link>
        </header>

        <h1 className="text-3xl font-bold sm:text-4xl">My Cart</h1>
        <p className="mt-2 text-gray-400">
          Review your selected products.
        </p>

        {loading && (
          <p className="mt-8 text-gray-400">Loading your cart...</p>
        )}

        {loggedOut && !loading && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-lg font-semibold">
              Please login to view your cart.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
            >
              Go to Login
            </Link>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
          >
            {error}
            <button
              onClick={loadCart}
              className="ml-3 underline"
            >
              Retry
            </button>
          </div>
        )}

        {message && (
          <p role="status" className="mt-5 text-green-300">
            {message}
          </p>
        )}

        {!loading && !loggedOut && !error && entries.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-5xl">🛍️</div>
            <h2 className="mt-4 text-xl font-semibold">
              Your cart is empty
            </h2>
            <p className="mt-2 text-gray-400">
              Explore the collection and add something you love.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
            >
              Explore Products
            </Link>
          </div>
        )}

        {!loading && !loggedOut && entries.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
            <section className="space-y-4">
              {entries.map(({ item, product }) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row"
                >
                  {product && (
                    <Link
                      href={`/products/${product.id}`}
                      className="h-36 w-full shrink-0 overflow-hidden rounded-xl bg-white/5 sm:w-32"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                  )}

                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-violet-300">
                        {product?.category ?? "Product"}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        {product?.name ?? `Product #${item.product_id}`}
                      </h2>
                      <p className="mt-2 text-gray-300">
                        {product
                          ? formatPrice(product.price)
                          : "Product details unavailable"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-gray-400">
                        Quantity
                      </span>

                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={updatingId === item.id || item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="rounded-lg border border-white/15 px-3 py-1.5 disabled:opacity-40"
                      >
                        −
                      </button>

                      <span className="min-w-5 text-center">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={updatingId === item.id || item.quantity >= 10}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="rounded-lg border border-white/15 px-3 py-1.5 disabled:opacity-40"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-sm text-red-300 hover:text-red-200 disabled:opacity-50"
                      >
                        {updatingId === item.id
                          ? "Updating..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>

                  {product && (
                    <p className="font-semibold sm:text-right">
                      {formatPrice(product.price * item.quantity)}
                    </p>
                  )}
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-semibold">Order Summary</h2>

              <div className="mt-5 flex justify-between gap-3 text-gray-300">
                <span>Items</span>
                <span>
                  {entries.reduce(
                    (sum, entry) => sum + entry.item.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-3 border-t border-white/10 pt-4 text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-500">
                Delivery charges and checkout are not connected yet.
              </p>

              <Link
                href="/"
                className="mt-6 block rounded-xl bg-violet-600 px-4 py-3 text-center font-semibold hover:bg-violet-500"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
