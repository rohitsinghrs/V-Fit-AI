
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  is_featured: boolean;
};

const API_URL = "http://127.0.0.1:8000";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/products/${params.id}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product nahi mila."
              : "Product load nahi ho paaya."
          );
        }

        const data: Product = await response.json();
        setProduct(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  async function handleAddToCart() {
    setCartMessage("");
    setCartError("");

    if (!product) {
      setCartError("Product details available nahi hain.");
      return;
    }

    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setCartError("Please login first to add this product to your cart.");
      return;
    }

    setCartLoading(true);

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("access_token");
        throw new Error("Your session has expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Product could not be added to cart."
        );
      }

      setCartMessage(
        `${product.name} (Qty: ${quantity}) added to your cart successfully!`
      );
    } catch (err) {
      setCartError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setCartLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080811] p-10 text-white">
        Loading product...
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#080811] p-10 text-white">
        <p>{error || "Product not found."}</p>

        <Link
          href="/"
          className="mt-4 inline-block text-violet-300 hover:text-violet-200"
        >
          Back to shop
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080811] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-violet-300 hover:text-violet-200"
        >
          ← Back to shop
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full max-h-[650px] min-h-80 w-full object-cover"
            />
          </div>

          <section className="py-4">
            <p className="text-sm uppercase tracking-widest text-violet-300">
              {product.category}
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              {product.name}
            </h1>

            <p className="mt-5 text-2xl font-semibold">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(product.price)}
            </p>

            <p className="mt-6 leading-7 text-gray-400">
              {product.description ||
                "Discover your next favorite style."}
            </p>

            <div className="mt-8">
              <p className="mb-3 font-medium">Select size</p>

              <div className="flex gap-3">
                {["S", "M", "L", "XL"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSize(item)}
                    aria-pressed={size === item}
                    className={`rounded-xl border px-5 py-3 ${
                      size === item
                        ? "border-violet-400 bg-violet-600"
                        : "border-white/15 hover:border-violet-400"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Demo size selector; actual stock availability is
                not connected yet. Size is not currently saved in
                the backend cart.
              </p>
            </div>

            <div className="mt-6">
              <label
                htmlFor="quantity"
                className="mb-3 block font-medium"
              >
                Quantity
              </label>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.max(1, q - 1))
                  }
                  className="rounded-lg border border-white/15 px-4 py-2"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1 || cartLoading}
                >
                  −
                </button>

                <span id="quantity" aria-live="polite">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(10, q + 1))
                  }
                  className="rounded-lg border border-white/15 px-4 py-2"
                  aria-label="Increase quantity"
                  disabled={quantity >= 10 || cartLoading}
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cartLoading ? "Adding to Cart..." : "Add to Cart"}
            </button>

            {cartMessage && (
              <div
                role="status"
                className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300"
              >
                <p>{cartMessage}</p>

                <Link
                  href="/cart"
                  className="mt-2 inline-block underline hover:text-green-200"
                >
                  View Cart
                </Link>
              </div>
            )}

            {cartError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
              >
                <p>{cartError}</p>

                {cartError.toLowerCase().includes("login") && (
                  <Link
                    href="/login"
                    className="mt-2 inline-block underline hover:text-red-200"
                  >
                    Go to Login
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
