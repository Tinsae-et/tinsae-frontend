"use client";

import NotFound from "./(common)/not-found";

export default function GlobalError() {
  return <NotFound kind="500" />;
}
