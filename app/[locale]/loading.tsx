/**
 * Loading state — the portal waits with grace.
 * Server Component. Calm, minimal.
 */

import { Motif } from "@/app/components/design/Motif";

export default function Loading() {
  return (
    <div className="empty-state" aria-busy="true">
      <Motif role="breath" voice="sacred" className="pulse" />
      <p className="visually-hidden">Loading...</p>
    </div>
  );
}
