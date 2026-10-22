"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = q.trim();
    if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <form
      onSubmit={submit}
      className="hidden h-10 w-[360px] items-center gap-2 rounded-lg border border-border bg-white px-3 xl:flex"
    >
      <Search className="h-4 w-4 shrink-0 text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索问题、资源、供应链、人..."
        className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted"
        aria-label="站内搜索"
      />
    </form>
  );
}
