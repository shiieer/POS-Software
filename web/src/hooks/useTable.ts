import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api, type TablePublic } from "../api/client";

type TableStatus = "loading" | "valid" | "invalid" | "no_qr";

export function useTable() {
  const [searchParams] = useSearchParams();

  const rawId = searchParams.get("table");
  const token = searchParams.get("token");
  const tableId = rawId ? parseInt(rawId, 10) : null;

  const [table, setTable] = useState<TablePublic | null>(null);
  const [status, setStatus] = useState<TableStatus>(() =>
    tableId && token ? "loading" : "no_qr"
  );

  useEffect(() => {
    if (!tableId || !token) {
      setStatus("no_qr");
      return;
    }

    setStatus("loading");
    api
      .verifyTable(tableId, token)
      .then((data) => {
        setTable(data);
        setStatus("valid");
      })
      .catch(() => {
        setTable(null);
        setStatus("invalid");
      });
  }, [tableId, token]);

  const tableName = table?.name ?? (tableId ? `Table ${tableId}` : "Walk-in");

  return { tableId, token, table, tableName, status };
}
