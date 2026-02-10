"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Placeholder for StoreKit 2 integration.
 *
 * When the app is wrapped with Capacitor and the StoreKit plugin is installed,
 * replace the stub implementations below with real StoreKit calls:
 *
 *   import { Purchases } from "@capgo/capacitor-purchases"; // or custom plugin
 *
 * Product ID: "com.slate.lifetime" (configure in App Store Connect)
 */

const PRODUCT_ID = "com.slate.lifetime";

export function usePurchase() {
  const [loading, setLoading] = useState(false);

  const purchasePro = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with StoreKit 2 call via Capacitor bridge
      // const result = await StoreKit.purchase({ productId: PRODUCT_ID });
      // if (result.success) { mark isPro on server }
      toast("Purchase not available yet", {
        description: "In-app purchase will be enabled in the native app.",
        duration: 3000,
        style: { background: "var(--foreground)", color: "var(--background)" },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with StoreKit 2 restore call
      // const result = await StoreKit.restorePurchases();
      // if (result.activeEntitlements.includes(PRODUCT_ID)) { mark isPro on server }
      toast("Restore not available yet", {
        description: "Purchase restoration will be enabled in the native app.",
        duration: 3000,
        style: { background: "var(--foreground)", color: "var(--background)" },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { purchasePro, restorePurchases, loading, productId: PRODUCT_ID };
}
