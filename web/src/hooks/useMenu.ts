import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { MenuItem } from "../types";

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMenu()
      .then((data) => {
        setItems(data);
        const uniqueCats = [...new Set(data.map((item) => item.category))];
        setCategories(uniqueCats);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { items, categories, loading, error };
}
