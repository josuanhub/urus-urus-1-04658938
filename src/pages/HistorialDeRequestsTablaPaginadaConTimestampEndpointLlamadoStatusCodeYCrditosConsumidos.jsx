import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  RefreshCw,
  Database,
  Filter,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "x-factory-key": "factory2026",
  "Content-Type": "application/json",
};
const PAGE_SIZE = 20;

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 min-w-[260px] border ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)}>
            <X size={14} className="opacity-60 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center">
        <Database size={28} className="text-[#6C63FF]" />
      </div>
      <p className="text-white/60 text-sm">No se encontraron registros</p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium transition-colors"
      >
        <Plus size={16} />
        Nuevo Cliente
      </button>
    </div>
  );
}

function StatusBadge({ code }) {
  if (!code)
    return <span className="text-white/30 text-xs">—</span>;
  const num = parseInt(code);
  let color = "text-white/50 bg-white/5 border-white/10";
  if (num >= 200 && num < 300)
    color = "text-[#00D4AA] bg-[#00D4AA]/10 border-[#00D4AA]/20";
  else if (num >= 400 && num < 500)
    color = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
  else if (num >= 500)
    color = "text-red-400 bg-red-400/10 border-red-400/20";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-mono font-semibold ${color}`}
    >
      {num >= 200 && num < 300 ? (
        <CheckCircle size={10} />
      ) : (
        <XCircle size={10} />
      )}
      {code}
    </span>
  );
}

function ConfirmModal({ open, onConfirm, onCancel, name }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold">Confirmar eliminación</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">
          ¿Eliminar{" "}
          <span className="text-white font-medium">"{name}"</span>? Esta acción
          no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  name: "",
  email: "",
  endpoint: "",
  status_code: "",
  credits_consumed: "",
  timestamp: "",
};

function FormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || "",
              email: initial.email || "",
              endpoint: initial.endpoint || "",
              status_code: initial.status_code ?? "",
              credits_consumed: initial.credits_consumed ?? "",
              timestamp: initial.timestamp || "",
            }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Requerido";
    if (!form.email.trim()) e.email = "Requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido";
    if (!form.endpoint.trim()) e.endpoint = "Requerido";
    if (form.status_code && isNaN(parseInt(form.status_code)))
      e.status_code = "Debe ser número";
    if (form.credits_consumed && isNaN(parseFloat(form.credits_consumed)))
      e.credits_consumed = "Debe ser número";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      status_code: form.status_code ? parseInt(form.status_code) : null,
      credits_consumed: form.credits_consumed
        ? parseFloat(form.credits_consumed)
        : null,
    };
    await onSave(payload);
    setSaving(false);
  };

  if (!open) return null;

  const Field = ({ label, name, type = "text", placeholder }) => (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(ev) => setForm((p) => ({ ...p, [name]: ev.target.value }))}
        placeholder={placeholder}
        className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:ring-1 transition-all ${
          errors[name]
            ? "border-red-500/50 focus:ring-red-500/30"
            : "border-white/10 focus:border-[#6C63FF]/50 focus:ring-[#6C63FF]/20"
        }`}
      />
      {errors[name] && (
        <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center">
              {initial ? (
                <Edit2 size={14} className="text-[#6C63FF]" />
              ) : (
                <Plus size={14} className="text-[#6C63FF]" />
              )}
            </div>
            <h2 className="text-white font-semibold">
              {initial ? "Editar registro" : "Nuevo registro"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <Field label="Nombre *" name="name" placeholder="Ej. John Doe" />
          <Field
            label="Email *"
            name="email"
            type="email"
            placeholder="john@example.com"
          />
          <Field
            label="Endpoint llamado *"
            name="endpoint"
            placeholder="/api/v1/scraper"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Status Code"
              name="status_code"
              placeholder="200"
            />
            <Field
              label="Créditos Consumidos"
              name="credits_consumed"
              placeholder="1.5"
            />
          </div>
          <Field
            label="Timestamp"
            name="timestamp"
            type="datetime-local"
          />
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {saving && <RefreshCw size={14} className="animate-spin" />}
              {saving ? "Guardando..." : initial ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HistorialDeRequestsTablaPaginadaConTimestampEndpointLlamadoStatusCodeYCrditosConsumidos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : json.data || []);
    } catch (err) {
      addToast("Error al cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = data.filter((row) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (row.name || "").toLowerCase().includes(q) ||
      (row.email || "").toLowerCase().includes(q) ||
      (row.endpoint || "").toLowerCase().includes(q);
    const code = parseInt(row.status_code);
    const matchFilter =
      filterStatus === "all" ||
      (filterStatus === "2xx" && code >= 200 && code < 300) ||
      (filterStatus === "4xx" && code >= 400 && code < 500) ||
      (filterStatus === "5xx" && code >= 500);
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = async (payload) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      await fetchData();
      setModalOpen(false);
      addToast("Registro creado exitosamente");
    } catch {
      addToast("Error al crear el registro", "error");
    }
  };

  const handleUpdate = async (payload) => {
    try {
      const res = await fetch(`${API_URL}/${editItem.id}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      await fetchData();
      setEditItem(null);
      setModalOpen(false);
      addToast("Registro actualizado exitosamente");
    } catch {
      addToast("Error al actualizar el registro", "error");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/${confirmDelete.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error();
      await fetchData();
      setConfirmDelete(null);
      addToast("Registro eliminado correctamente");
    } catch {
      addToast("Error al eliminar el registro", "error");
    }
  };

  const openNew = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    setModalOpen(true);
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    try {
      return new Date(ts).toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  const stats = {
    total: data.length,
    success: data.filter((r) => parseInt(r.status_code) >= 200 && parseInt(r.status_code) < 300).length,
    errors: data.filter((r) => parseInt(r.status_code) >= 400).length,
    credits: data.reduce((s, r) => s + (parseFloat(r.credits_consumed) || 0), 0),
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSave={editItem ? handleUpdate : handleCreate}
        initial={editItem}
      />
      <ConfirmModal
        open={!!confirmDelete}
        name={confirmDelete?.name || confirmDelete?.email || "este registro"}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center">
              <Clock size={20} className="text-[#6C63FF]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Historial de Requests
              </h1>
              <p className="text-white/40 text-sm">
                Dashboard de Cliente · Tabla paginada de API requests
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Requests", value: stats.total, icon: Database, color: "#6C63FF" },
            { label: "Exitosos (2xx)", value: stats.success, icon: CheckCircle, color: "#00D4AA" },
            { label: "Errores (4xx/5xx)", value: stats.errors, icon: XCircle, color: "#ef4444" },
            { label: "Créditos usados", value: stats.credits.toFixed(2), icon: Zap, color: "#f59e0b" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-[#1A1A2E] border border-white/5 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color }} />
                <span className="text-white/40 text-xs">{label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o endpoint…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#6C63FF]/50 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-white/30" />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="bg-[#1A1A2E] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#6C63FF]/50 transition-all"
            >
              <option value="all">Todos los status</option>
              <option value="2xx">2xx Exitosos</option>
              <option value="4xx">4xx Client Error</option>
              <option value="5xx">5xx Server Error</option>
            </select>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#1A1A2E] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Timestamp", "Nombre / Email", "Endpoint", "Status Code", "Créditos", "Acciones"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState onNew={openNew} />
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <Clock size={12} className="text-[#6C63FF]/60 flex-shrink-0" />
                          {formatDate(row.timestamp || row.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-white font-medium truncate max-w-[160px]">
                            {row.name || "—"}
                          </p>
                          <p className="text-xs text-white/40 truncate max-w-[160px]">
                            {row.email || ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 max-w-[200px]">
                          <Globe size={12} className="text-[#00D4AA]/50 flex-shrink-0" />
                          <span className="text-xs text-white/60 font-mono truncate">
                            {row.endpoint || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge code={row.status_code} />
                      </td>
                      <td className="px-4 py-3">
                        {row.credits_consumed != null ? (
                          <div className="flex items-center gap-1.5">
                            <Zap size={12} className="text-yellow-400/70" />
                            <span className="text-sm text-white/80 font-mono">
                              {parseFloat(row.credits_consumed).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(row)}
                            className="p-1.5 rounded-lg hover:bg-[#6C63FF]/20 text-white/40 hover:text-[#6C63FF] transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(row)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <p className="text-xs text-white/40">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pg = i + 1;
                  if (totalPages > 5 && page > 3) pg = page - 2 + i;
                  if (pg > totalPages) return null;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                        page === pg
                          ? "bg-[#6C63FF] text-white"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-white/20 text-xs mt-6">
          URUS Market Intelligence API · Tabla: clients ·{" "}
          {filtered.length} registros encontrados
        </p>
      </div>
    </div>
  );
}