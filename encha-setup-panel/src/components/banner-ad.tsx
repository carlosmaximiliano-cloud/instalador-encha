"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Banner = {
  id: number;
  image_url: string;
  link_url: string;
  alt_text: string;
};

type Props = {
  variant: "catalog" | "sidebar";
  className?: string;
};

export function BannerAd({ variant, className }: Props) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [csrf, setCsrf] = useState<string>("");

  useEffect(() => {
    fetch("/api/banner")
      .then((r) => (r.ok && r.status !== 204 ? r.json() : null))
      .then((d) => (d?.id ? setBanner(d) : null))
      .catch(() => {});
    fetch("/api/csrf")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.token && setCsrf(d.token))
      .catch(() => {});
  }, []);

  if (!banner) return null;

  function handleClick() {
    if (!banner || !csrf) return;
    // Best-effort: reporta o clique e não espera resposta.
    fetch("/api/banner/click", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ bannerId: banner.id }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <a
      href={banner.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={cn(
        "block overflow-hidden rounded-lg border border-glass-border transition-opacity hover:opacity-90",
        className
      )}
      aria-label={banner.alt_text || "Propaganda"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.image_url}
        alt={banner.alt_text}
        className={cn(
          "w-full object-cover",
          variant === "catalog" ? "max-h-32" : "max-h-40"
        )}
      />
    </a>
  );
}
