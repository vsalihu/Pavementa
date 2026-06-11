"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormField } from "@/components/FormField";

export default function PublicTrackLookupPage() {
  const [publicId, setPublicId] = useState("");

  function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanId = publicId.trim();
    if (cleanId) {
      window.location.href = `/public/track/${encodeURIComponent(cleanId)}`;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <Link className="text-lg font-semibold text-slate-950" href="/">
          Pavementa
        </Link>
        <Card className="mt-8 p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-infrastructure-green">
            <Search aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-slate-950">
            Track a road damage report
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter the public reference number provided after submission.
          </p>
          <form className="mt-6 space-y-4" onSubmit={submitLookup}>
            <FormField
              className="uppercase"
              label="Public report ID"
              onChange={(event) => setPublicId(event.target.value)}
              placeholder="PAV-2026-0001"
              value={publicId}
            />
            <Button className="w-full" type="submit">
              Track report
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
