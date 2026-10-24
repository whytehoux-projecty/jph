"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <Button icon={<Printer aria-hidden="true" />} onClick={() => window.print()}>
      Print or save as PDF
    </Button>
  );
}
