import { getStore } from "@/lib/stores";
import type { StoreId } from "@/lib/types";

/** Compact store identity chip with the store's brand colour. */
export default function StoreBadge({
  storeId,
  size = "sm",
}: {
  storeId: StoreId;
  size?: "sm" | "md";
}) {
  const store = getStore(storeId);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white font-medium text-slate-700 ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span
        aria-hidden
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: store.color }}
      />
      {store.name}
    </span>
  );
}
