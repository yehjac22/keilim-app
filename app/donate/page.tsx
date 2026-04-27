// Server component — reads env vars and passes them as props to the POS client.
//
// Optional env vars:
//   DONATE_DEFAULT_AMOUNT_CENTS   — suggested amount in cents, e.g. "1000" for $10.00 (default: 1000)
//   DONATE_ORG_NAME               — display name shown at top of terminal (default: "Point of Sale")

import DonateClient from "./DonateClient";

export default function DonatePage() {
  const defaultAmountCents = Math.max(
    1,
    parseInt(process.env.DONATE_DEFAULT_AMOUNT_CENTS ?? "1000", 10)
  );
  const orgName = process.env.DONATE_ORG_NAME ?? "Point of Sale";

  return (
    <DonateClient defaultAmountCents={defaultAmountCents} orgName={orgName} />
  );
}
