import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Database,
  Activity,
  RefreshCw,
  Filter,
  ChevronDown,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

const statusConfig = {
  success: {
    label: "Success",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    icon: CheckCircle,
  },
  partial: {
    label: "Partial",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    icon: AlertTriangle,
  },
  failed: {
    label: "Failed",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    icon: AlertCircle,
  },
};

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium transition-all duration-300 ${
            t.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {t.message}
          <button
            onClick={() => removeToast(t.id)}
            className="ml-2 opacity-60 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-white/5 rounded-lg animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status?.toLowerCase()] || statusConfig.partial;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Confirmar acción</h3>
            <p className="text-white/50 text-sm">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    status: "success",
    duration: "",
    records_extracted: "",
    errors_detected: "",
    marketplace: "",
    ...initial,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Nombre requerido";
    if (!form.email?.trim()) e.email = "Email requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido";
    if (!form.status) e.status = "Status requerido";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    onSave(form);
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[key] || ""}
        onChange={(ev) => {
          setForm((f) => ({ ...f, [key]: ev.target.value }));
          setErrors((e) => ({ ...e, [key]: undefined }));
        }}
        placeholder={placeholder}
        className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:ring-1 ${
          errors[key]
            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
            : "border-white/10 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20"
        }`}
      />
      {errors[key] && (
        <p className="mt-1 text-xs text-red-400">{errors[key]}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold text-lg">
              {initial?.id ? "Editar Registro" : "Nuevo Registro"}
            </h2>
            <p className="text-white/40 text-sm mt-0.5">
              Log de ejecución del scraper
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("name", "Nombre del Cliente *", "text", "Ej: Acme Corp")}
            {field("email", "Email *", "email", "cliente@empresa.com")}
          </div>
          {field("marketplace", "Marketplace", "text", "Ej: Amazon, MeLi...")}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {field("duration", "Duración (seg)", "number", "0")}
            {field(
              "records_extracted",
              "Registros Extraídos",
              "number",
              "0"
            )}
            {field("errors_detected", "Errores", "number", "0")}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Status *
            </label>
            <div className="relative">
              <select
                value={form.status}
                onChange={(ev) => {
                  setForm((f) => ({ ...f, status: ev.target.value }));
                  setErrors((e) => ({ ...e, status: undefined }));
                }}
                className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-white outline-none appearance-none transition-all focus:ring-1 ${
                  errors.status
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/10 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20"
                }`}
              >
                <option value="success" className="bg-[#1A1A2E]">
                  ✓ Success
                </option>
                <option value="partial" className="bg-[#1A1A2E]">
                  ⚠ Partial
                </option>
                <option value="failed" className="bg-[#1A1A2E]">
                  ✗ Failed
                </option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
            </div>
            {errors.status && (
              <p className="mt-1 text-xs text-red-400">{errors.status}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-white/60 border border-white/10 hover:border-white/20 hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#6C63FF] hover:bg-[#5a52e0] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <RefreshCw size={14} className="animate-spin" />
              )}
              {initial?.id ? "Guardar cambios" : "Crear registro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LogDeEjecucionesHistorial() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | { type: 'create'|'edit', item }
  const [confirm, setConfirm] = useState(null);
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
      if (!res.ok) throw new Error("Error al cargar datos");
      const json = await res.json();
      const rows = Array.isArray(json) ? json : json.data || json.results || [];
      setData(rows);
    } catch {
      addToast("Error al cargar los registros", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = data.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (r.name || "").toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q) ||
      (r.marketplace || "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" ||
      (r.status || "").toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const url = isEdit ? `${API_URL}/${form.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      addToast(
        isEdit ? "Registro actualizado correctamente" : "Registro creado correctamente"
      );
      setModal(null);
      await fetchData();
    } catch {
      addToast("Error al guardar el registro", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error();
      addToast("Registro eliminado correctamente");
      setData((p) => p.filter((r) => r.id !== id));
    } catch {
      addToast("Error al eliminar el registro", "error");
    } finally {
      setConfirm(null);
    }
  };

  const stats = {
    total: data.length,
    success: data.filter((r) => r.status?.toLowerCase() === "success").length,
    partial: data.filter((r) => r.status?.toLowerCase() === "partial").length,
    failed: data.filter((r) => r.status?.toLowerCase() === "failed").length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      {modal && (
        <ClientForm
          initial={modal.item || {}}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
      {confirm && (
        <ConfirmDialog
          message="¿Eliminar este registro de ejecución? Esta acción no se puede deshacer."
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center">
                <Activity size={18} className="text-[#6C63FF]" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">
                  Monitor de Salud del Scraper
                </h1>
                <p className="text-white/40 text-xs">
                  Log de ejecuciones · Panel Admin Interno
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                disabled={loading}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => setModal({ type: "create", item: {} })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-semibold transition-all shadow-lg shadow-[#6C63FF]/20"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">Nuevo Run</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Runs",
              value: stats.total,
              icon: Database,
              color: "text-[#6C63FF]",
              bg: "bg-[#6C63FF]/10",
              border: "border-[#6C63FF]/20",
            },
            {
              label: "Success",
              value: stats.success,
              icon: CheckCircle,
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
              border: "border-emerald-400/20",
            },
            {
              label: "Partial",
              value: stats.partial,
              icon: AlertTriangle,
              color: "text-amber-400",
              bg: "bg-amber-400/10",
              border: "border-amber-400/20",
            },
            {
              label: "Failed",
              value: stats.failed,
              icon: AlertCircle,
              color: "text-red-400",
              bg: "bg-red-400/10",
              border: "border-red-400/20",
            },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`rounded-2xl border ${border} ${bg} p-4 flex items-center gap-3`}
            >
              <div
                className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={16} className={color} />
              </div>
              <div>
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-white/40 text-xs">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o marketplace..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#6C63FF]/50 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all"
            />
          </div>
          <div className="relative">
            <Filter
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2.5 text-sm text-white outline-none appearance-none focus:border-[#6C63FF]/50 transition-all"
            >
              <option value="all" className="bg-[#1A1A2E]">
                Todos los status
              </option>
              <option value="success" className="bg-[#1A1A2E]">
                Success
              </option>
              <option value="partial" className="bg-[#1A1A2E]">
                Partial
              </option>
              <option value="failed" className="bg-[#1A1A2E]">
                Failed
              </option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1A1A2E]/50 border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {[
                    "Cliente",
                    "Email",
                    "Marketplace",
                    "Duración",
                    "Registros",
                    "Errores",
                    "Status",
                    "Acciones",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? null : (
                  paginated.map((row, idx) => (
                    <tr
                      key={row.id || idx}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#6C63FF] text-xs font-bold">
                              {(row.name || "?")[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white font-medium whitespace-nowrap">
                            {row.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                        {row.email || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.marketplace ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#00D4AA]/10 border border-[#00D4AA]/20 text-[#00D4AA] text-xs font-medium">
                            {row.marketplace}
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-white/60">
                          <Clock size={12} className="text-white/30" />
                          {row.duration ? `${row.duration}s` : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-white/60">
                          <Database size={12} className="text-white/30" />
                          {row.records_extracted ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            Number(row.errors_detected) > 0
                              ? "text-red-400 font-semibold"
                              : "text-white/40"
                          }
                        >
                          {row.errors_detected ?? "0"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              setModal({ type: "edit", item: row })
                            }
                            className="w-7 h-7 rounded-lg bg-[#6C63FF]/10 border border-[#6C63FF]/20 hover:bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF] transition-all"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => setConfirm(row.id)}
                            className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!loading && paginated.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center mb-4">
                <Activity size={28} className="text-[#6C63FF]/60" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                No hay registros
              </h3>
              <p className="text-white/30 text-sm text-center max-w-sm mb-6">
                {search || statusFilter !== "all"
                  ? "No se encontraron runs con los filtros aplicados. Intenta con otros criterios."
                  : "Aún no hay ejecuciones registradas. Crea el primero para comenzar el monitoreo."}
              </p>
              {!search && statusFilter === "all" && (
                <button
                  onClick={() => setModal({ type: "create", item: {} })}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-semibold transition-all"
                >
                  <Plus size={15} />
                  Crear primer registro
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-white/30 text-sm">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}{" "}
              registros
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    page === i + 1
                      ? "bg-[#6C63FF] text-white"
                      : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 text-white/15 text-xs pb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
          URUS Market Intelligence API · Monitor de Salud del Scraper
        </div>
      </div>
    </div>
  );
}