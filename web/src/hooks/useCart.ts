import { useState, useCallback, useMemo } from "react";
import { api } from "../api/client";
import { useLocalStorage } from "./useLocalStorage";
import type { CartItem, MenuItem, OrderOut } from "../types";

export function useCart(tableId: number | null) {
  const storageKey = `pos_cart_${tableId ?? "walkin"}`;

  const [items, setItems, clearStorage] = useLocalStorage<CartItem[]>(storageKey, []);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCallback((menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  }, [setItems]);

  const removeItem = useCallback((menuItemId: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((i) => i.menuItem.id !== menuItemId);
      }
      return prev.map((i) =>
        i.menuItem.id === menuItemId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  }, [setItems]);

  const clearCart = useCallback(() => {
    clearStorage();
    setOrderResult(null);
    setError(null);
  }, [clearStorage]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
    [items]
  );

  const submitOrder = useCallback(
    async (customerName?: string, notes?: string) => {
      if (items.length === 0) return;
      setSubmitting(true);
      setError(null);

      try {
        const result = await api.createOrder({
          table_id: tableId,
          customer_name: customerName || null,
          notes: notes || null,
          items: items.map((i) => ({
            menu_item_id: i.menuItem.id,
            quantity: i.quantity,
            notes: i.notes || null,
          })),
        });
        setOrderResult(result);
        clearStorage();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit order");
      } finally {
        setSubmitting(false);
      }
    },
    [items, tableId, clearStorage]
  );

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
    submitOrder,
    submitting,
    orderResult,
    error,
  };
}
