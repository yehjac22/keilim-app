import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import TopBar from "@/components/TopBar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("TopBar hamburger menu", () => {
  it("should open a left sidebar when pulltab is clicked", () => {
    render(<TopBar />);

    const sidebar = screen.getByRole("navigation", { name: "Site navigation" });
    expect(sidebar).toHaveAttribute("data-open", "false");
    expect(sidebar).toHaveClass("left-0");

    const pulltab = screen.getByRole("button", { name: "Open menu pulltab" });
    fireEvent.click(pulltab);

    expect(sidebar).toHaveAttribute("data-open", "true");
  });
});
