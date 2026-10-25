"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { updatePreferences } from "@/app/actions/profile";
import { Amount, AmountVisibilityToggle, type AmountProps } from "@/components/ui/amount";

/**
 * Show/hide amounts on the dashboard. Seeded from the customer's saved
 * preference (User.hideBalance) and saved back through updatePreferences —
 * never browser storage.
 */
interface Ctx {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

const BalanceVisibilityContext = createContext<Ctx>({ hidden: false, setHidden: () => {} });

export function BalanceVisibilityProvider({ initialHidden, children }: { initialHidden: boolean; children: React.ReactNode }) {
  const [hidden, setHiddenState] = useState(initialHidden);
  const setHidden = useCallback((next: boolean) => {
    setHiddenState(next);
    updatePreferences({ hideBalance: next }).catch(() => {
      // Keep the on-screen choice; it simply won't be remembered next time.
    });
  }, []);
  return <BalanceVisibilityContext.Provider value={{ hidden, setHidden }}>{children}</BalanceVisibilityContext.Provider>;
}

export function useBalanceVisibility() {
  return useContext(BalanceVisibilityContext);
}

/** An Amount that follows the dashboard's show/hide setting. */
export function VisibleAmount(props: Omit<AmountProps, "masked">) {
  const { hidden } = useBalanceVisibility();
  return <Amount {...props} masked={hidden} />;
}

export function BalanceVisibilityToggle() {
  const { hidden, setHidden } = useBalanceVisibility();
  return <AmountVisibilityToggle hidden={hidden} onHiddenChange={setHidden} />;
}
