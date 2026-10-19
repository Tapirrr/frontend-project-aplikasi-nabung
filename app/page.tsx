"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user, ready } = useAuth();
  const r = useRouter();
  useEffect(() => { if (ready) r.replace(user ? "/tabungan" : "/login"); }, [ready, user, r]);
  return null;
}
