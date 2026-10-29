"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStore() {
      try {
        const [productResponse, categoryResponse] =
          await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/categories`),
          ]);

        if (!productResponse.ok || !categoryResponse.ok) {
          throw new Error("Could not load store data.");
        }

        const productData: Product[] =
          await productResponse.json();
        const categoryData: string[] =
          await categoryResponse.json();

        setProducts(productData);
        setCategories(categoryData);
      } catch {
        setError(
          "Store se connection nahi ho paaya. Backend server check karo."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStore();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const featuredProducts = products.filter(
    (product) => product.is_featured
  );

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080811] text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080811]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <a href="/" className="text-2xl font-black tracking-tight">
            V-Fit <span className="text-violet-400">AI</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-gray-300 md:flex">
            <a href="#shop" className="hover:text-violet-300">
              Explore
            </a>
            <a href="#featured" className="hover:text-violet-300">
              Featured
            </a>
            <a href="#assistant" className="hover:text-violet-300">
              AI Stylist
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
               className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
                    My Cart
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[130px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-sm text-violet-200">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              YOUR PERSONAL AI STYLE COMPANION
            </div>

            <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Style that
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
                understands you.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
              Discover your next look with AI-powered style
              recommendations. Find pieces that match your vibe,
              your occasion, and your budget.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#shop"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 font-semibold shadow-lg shadow-violet-950/40 transition hover:scale-[1.02]"
              >
                Explore Collection →
              </a>

              <a
                href="#assistant"
                className="rounded-xl border border-white/15 px-6 py-3.5 font-semibold hover:bg-white/5"
              >
                ✦ Meet Your AI Stylist
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-400">
              <span>✦ AI-powered discovery</span>
              <span>✦ Personal style</span>
              <span>✦ Everyday fashion</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-violet-600/30 to-blue-600/20 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    YOUR STYLE UNIVERSE
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    What's your vibe?
                  </h2>
                </div>
                <span className="rounded-xl bg-violet-500/15 p-3 text-2xl">
                  ✦
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  {
                    emoji: "◈",
                    title: "Streetwear",
                    subtitle: "Bold & relaxed",
                    style: "from-violet-900/70 to-slate-900",
                  },
                  {
                    emoji: "◇",
                    title: "Minimal",
                    subtitle: "Clean & timeless",
                    style: "from-slate-700/70 to-slate-950",
                  },
                  {
                    emoji: "✧",
                    title: "Smart Casual",
                    subtitle: "Effortlessly sharp",
                    style: "from-blue-900/60 to-slate-950",
                  },
                  {
                    emoji: "✳",
                    title: "Everyday",
                    subtitle: "Comfort first",
                    style: "from-fuchsia-900/50 to-slate-950",
                  },
                ].map((style) => (
                  <button
                    key={style.title}
                    onClick={() => {
                      setSearch(
                        style.title === "Streetwear"
                          ? "hoodie"
                          : style.title === "Minimal"
                            ? "white"
                            : style.title === "Smart Casual"
                              ? "jacket"
                              : ""
                      );
                      document
                        .getElementById("shop")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`rounded-2xl border border-white/10 bg-gradient-to-br ${style.style} p-5 text-left transition hover:-translate-y-1 hover:border-violet-400/50`}
                  >
                    <span className="text-3xl text-violet-300">
                      {style.emoji}
                    </span>
                    <p className="mt-5 font-semibold">
                      {style.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {style.subtitle}
                    </p>
                  </button>
                ))}
              </div>

              <p className="mt-5 text-center text-xs text-gray-500">
                Explore a style to discover matching products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section id="featured" className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              CURATED FOR YOU
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Featured picks
            </h2>
          </div>

          <a
            href="#shop"
            className="text-sm text-violet-300 hover:text-violet-200"
          >
            Explore all products →
          </a>
        </div>

        {loading ? (
          <p className="mt-8 text-gray-400">Loading featured picks...</p>
        ) : featuredProducts.length === 0 ? (
          <p className="mt-8 text-gray-400">
            No featured products available yet.
          </p>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-violet-400/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#151522]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs backdrop-blur">
                    ✦ Featured
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs uppercase tracking-wider text-violet-300">
                    {product.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">
                    {product.name}
                  </h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-gray-400">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold">
                      {formatPrice(product.price)}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="rounded-lg border border-white/15 px-3 py-2 text-xs text-gray-300 hover:border-violet-400 hover:text-white"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* All products */}
      <section id="shop" className="mx-auto max-w-7xl px-5 py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
            THE COLLECTION
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Find your next favorite.
          </h2>
          <p className="mt-3 text-gray-400">
            Explore products loaded directly from our store database.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-4 md:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search hoodies, shoes, accessories..."
            aria-label="Search products"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none transition placeholder:text-gray-500 focus:border-violet-500 md:max-w-md"
          />

          <div className="flex flex-wrap gap-2">
            {["All", ...categories].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-xl border px-4 py-2.5 text-sm transition ${
                  activeCategory === category
                    ? "border-violet-500 bg-violet-600 text-white"
                    : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-violet-400/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-gray-400">Loading products...</p>
        ) : error ? (
          <div className="mt-10 rounded-xl border border-red-400/20 bg-red-400/5 p-5 text-red-200">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg border border-red-300/30 px-4 py-2 text-sm"
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="mt-10 text-gray-400">
            No matching products found. Try another search.
          </p>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:border-violet-400/40"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#151522]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wider text-violet-300">
                    {product.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">
                    {product.name}
                  </h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-gray-400">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold">
                      {formatPrice(product.price)}
                    </span>
                    {product.is_featured && (
                      <span className="text-xs text-violet-300">
                        ✦ Featured
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="mt-4 inline-flex rounded-lg border border-white/15 px-3 py-2 text-xs text-gray-300 hover:border-violet-400 hover:text-white"
                  >
                    View Details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* AI assistant preview */}
      <section id="assistant" className="mx-auto max-w-7xl px-5 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950/70 via-[#111126] to-blue-950/60 p-7 sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-sm text-violet-200">
              ✦ V-FIT INTELLIGENCE
            </div>

            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
              Meet your personal AI stylist.
            </h2>

            <p className="mt-4 leading-7 text-gray-300">
              Tell us what you need, where you're going, and your
              budget. Your personal styling experience starts here.
            </p>

            <div className="mt-7 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
              <p className="text-sm text-gray-400">
                TRY A STYLE SEARCH
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id="style-prompt"
                  placeholder="e.g. Casual outfit under ₹2000"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-gray-500 focus:border-violet-400"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setSearch(
                        (event.target as HTMLInputElement).value
                      );
                      setActiveCategory("All");
                      document
                        .getElementById("shop")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById(
                      "style-prompt"
                    ) as HTMLInputElement | null;

                    setSearch(input?.value ?? "");
                    setActiveCategory("All");
                    document
                      .getElementById("shop")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
                >
                  Find my style →
                </button>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Current preview searches your product catalog. AI-generated
              recommendations and conversational responses will be connected
              in the next development step.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-gray-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} V-Fit AI. Discover your style.
          </p>
          <div className="flex gap-5">
            <a href="/login" className="hover:text-white">
              Login
            </a>
            <a href="/register" className="hover:text-white">
              Register
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
