import { createFileRoute, redirect } from "@tanstack/react-router";

// Old address (contained the filler word "od"): permanently redirect to the clean URL.
export const Route = createFileRoute("/odstapienie-od-umowy")({
  beforeLoad: () => {
    throw redirect({ to: "/odstapienie-umowy", statusCode: 301 });
  },
});
