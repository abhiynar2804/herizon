"use client";

import { useCallback, useEffect, useState } from "react";
import AdminNavbar from "@/components/layout/AdminNavbar";

type AuditLog = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  details: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/audit-logs?page=1&limit=50");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load audit logs.");
      }

      setLogs(data.logs || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load audit logs.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.name.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.email.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Platform Audit Activity Logs
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Chronological security audit log of administrative actions and
              platform state updates.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by action, actor, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </header>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Audit Logs Table */}
        <section className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading audit logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No audit logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Target Type</th>
                    <th className="py-3.5 px-6">Actor</th>
                    <th className="py-3.5 px-6">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-6 text-slate-400 font-sans">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 font-bold text-[10px]">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-sans">
                        {log.targetType}
                      </td>

                      <td className="py-3.5 px-6 font-sans">
                        <div className="font-semibold text-white">
                          {log.actor.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {log.actor.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-6 font-sans text-slate-300">
                        {log.details || log.targetId || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
