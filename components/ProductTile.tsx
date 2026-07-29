import type { Product } from "@/lib/types";

/** Gradient art tile for a product (self-contained, no external images). */
export default function ProductTile({
  product,
  size = "md",
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg"
      ? "h-24 w-24 text-5xl rounded-2xl"
      : size === "md"
        ? "h-16 w-16 text-3xl rounded-xl"
        : "h-11 w-11 text-xl rounded-lg";
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 border border-teal-100 ${dims}`}
    >
      {product.emoji}
    </span>
  );
}
