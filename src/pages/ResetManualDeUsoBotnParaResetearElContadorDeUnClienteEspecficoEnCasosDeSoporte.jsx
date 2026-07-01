import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl p-4 shadow-2xl border backdrop-blur-sm transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
          )}
          <span className="text-sm flex-1">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded-lg bg-white/5 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2 rounded-xl ${danger ? "bg-red-500/20" : "bg-[#6C63FF]/20"}`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${danger ? "text-red-400" : "text-[#6C63FF]"}`}
            />
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              danger
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-[#6C63FF] hover:bg-[#5a52e0] text-white"
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function ClientModal({ open, onClose, onSave, initial }) {
  const isEdit = !!initial;
  const empty = {
    name: "",
    email: "",
    plan: "",
    status: "active",
    usage_count: 0,
    usage_limit: 1000,
    company: "",
  };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...empty, ...initial } : empty);
      setErrors({});
      setShowUsage(false);
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Nombre requerido";
    if (!form.email?.trim()) e.email = "Email requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email inválido";
    if (!form.plan?.trim()) e.plan = "Plan requerido";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) return setErrors(v);
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div>
      <label className="block text-white/70 text-xs mb-1.5 font-medium">
        {label}
      </label>
      <input
        type={type}
        value={form[key] ?? ""}
        onChange={(ev) =>
          setForm((p) => ({ ...p, [key]: ev.target.value }))
        }
        placeholder={placeholder}
        className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:ring-2 transition-all ${
          errors[key]
            ? "border-red-500/60 focus:ring-red-500/30"
            : "border-white/10 focus:border-[#6C63FF]/50 focus:ring-[#6C63FF]/20"
        }`}
      />
      {errors[key] && (
        <p className="text-red-400 text-xs mt-1">{errors[key]}</p>
      )}
    </div>
  );

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#1A1A2E] z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6C63FF]/20 rounded-xl">
              <Users className="w-5 h-5 text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold text-lg">
              {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {field("name", "Nombre completo *", "text", "Ej. Juan García")}
          {field("email", "Correo electrónico *", "email", "juan@empresa.com")}
          {field("company", "Empresa", "text", "Nombre de la empresa")}
          {field("plan", "Plan *", "text", "starter / pro / enterprise")}

          <div>
            <label className="block text-white/70 text-xs mb-1.5 font-medium">
              Estado
            </label>
            <select
              value={form.status ?? "active"}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#6C63FF]/50 focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 text-xs mb-1.5 font-medium">
                Uso actual
              </label>
              <div className="relative">
                <input
                  type={showUsage ? "number" : "password"}
                  value={form.usage_count ?? 0}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      usage_count: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#6C63FF]/50 focus:ring-2 focus:ring-[#6C63FF]/20 transition-all pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowUsage((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showUsage ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-xs mb-1.5 font-medium">
                Límite de uso
              </label>
              <input
                type="number"
                value={form.usage_limit ?? 1000}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    usage_limit: Number(e.target.value),
                  }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#6C63FF]/50 focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {saving && (
                <RefreshCw className="w-4 h-4 animate-spin" />
              )}
              {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Reset Usage Modal ────────────────────────────────────────────────────────
function ResetUsageModal({ open, client, onConfirm, onCancel, loading }) {
  if (!open || !client) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A2E] border border-[#00D4AA]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-[#00D4AA]/15 rounded-xl">
            <RotateCcw className="w-6 h-6 text-[#00D4AA]" />
          </div>
          <h3 className="text-white font-semibold text-lg">
            Reset de Uso
          </h3>
        </div>
        <p className="text-white/50 text-sm mb-1">Cliente objetivo:</p>
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-5">
          <p className="text-white font-medium">{client.name}</p>
          <p className="text-white/50 text-sm">{client.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white/40 text-xs">Uso actual:</span>
            <span className="text-[#00D4AA] font-semibold text-sm">
              {client.usage_count ?? 0}
            </span>
            <span className="text-white/30 text-xs">/</span>
            <span className="text-white/50 text-xs">
              {client.usage_limit ?? "∞"}
            </span>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300/80 text-xs">
            Esta acción reseteará el contador de uso a <strong>0</strong> para
            este cliente. Solo úsala en casos de soporte autorizados.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#00D4AA] hover:bg-[#00bfaa] disabled:opacity-50 text-[#0A0A0F] text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {loading ? "Reseteando..." : "Confirmar reset"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active: "bg-[#00D4AA]/15 text-[#00D4AA] border-[#00D4AA]/30",
    inactive: "bg-white/5 text-white/40 border-white/10",
    suspended: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const label = {
    active: "Activo",
    inactive: "Inactivo",
    suspended: "Suspendido",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${map[status] ?? map.inactive}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === "active"
            ? "bg-[#00D4AA]"
            : status === "suspended"
            ? "bg-red-400"
            : "bg-white/30"
        }`}
      />
      {label[status] ?? status}
    </span>
  );
}

// ─── Usage Bar ────────────────────────────────────────────────────────────────
function UsageBar({ count, limit }) {
  const pct = limit ? Math.min(100, Math.round((count / limit) * 100)) : 0;
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-[#00D4AA]";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 bg-white/5 rounded-full h-1.5 min-w-[60px]">
        <div
          className={`h-1.5 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-white/40 text-xs whitespace-nowrap">
        {count ?? 0}/{limit ?? "∞"}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResetManualDeUso() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setClients(arr);
    } catch (err) {
      addToast("Error al cargar clientes: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ── Filter & Paginate ──────────────────────────────────────────────────────
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.plan?.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, statusFilter]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `${API_URL}/${editTarget.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      addToast(
        isEdit ? "Cliente actualizado correctamente" : "Cliente creado exitosamente"
      );
      await fetchClients();
    } catch (err) {
      addToast("Error al guardar: " + err.message, "error");
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      addToast("Cliente eliminado");
      setClients((p) => p.filter((c) => c.id !== deleteTarget.id));
    } catch (err) {
      addToast("Error al eliminar: " + err.message, "error");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
      setConfirmDelete(false);
    }
  };

  // ── Reset Usage ────────────────────────────────────────────────────────────
  const handleReset = async () => {
    if (!resetTarget) return;
    setResetLoading(true);
    try {
      const updated = { ...resetTarget, usage_count: 0 };
      const res = await fetch(`${API_URL}/${resetTarget.id}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setClients((p) =>
        p.map((c) => (c.id === resetTarget.id ? { ...c, usage_count: 0 } : c))
      );
      addToast(
        `Contador de uso reseteado para "${resetTarget.name}" ✓`
      );
      setResetTarget(null);
    } catch (err) {
      addToast("Error al resetear: " + err.message, "error");
    } finally {
      setResetLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      <Toast toasts={toasts} remove={removeToast} />

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#6C63FF]/20 rounded-xl">
              <RotateCcw className="w-5 h-5 text-[#6C63FF]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">
                Reset Manual de Uso
              </h1>
              <p className="text-white/40 text-xs">
                Admin Interno · Panel de Clientes · Soporte
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchClients}
              disabled={loading}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => {
                setEditTarget(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#6C63FF] hover:bg-[#5a52e0] rounded-xl text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Cliente</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total clientes",
              val: clients.length,
              color: "text-[#6C63FF]",
              bg: "bg-[#6C63FF]/10",
            },
            {
              label: "Activos",
              val: clients.filter((c) => c.status === "active").length,
              color: "text-[#00D4AA]",
              bg: "bg-[#00D4AA]/10",
            },
            {
              label: "Suspendidos",
              val: clients.filter((c) => c.status === "suspended").length,
              color: "text-red-400",
              bg: "bg-red-500/10",
            },
            {
              label: "Inactivos",
              val: clients.filter((c) => c.status === "inactive").length,
              color: "text-white/50",
              bg: "bg-white/5",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#1A1A2E] border border-white/5 rounded-2xl p-4"
            >
              <p className="text-white/40 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, empresa o plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-[#6C63FF]/50 focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/30 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1A1A2E] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#6C63FF]/50 transition-all"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="suspended">Suspendidos</option>
            </select>
          </div>
        </div>

        {/* Info bar */}
        {!loading && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              {search && ` para "${search}"`}
            </p>
            {filtered.length > PAGE_SIZE && (
              <p className="text-white/30 text-xs">
                Página {page} de {totalPages}
              </p>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-[#1A1A2E] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-4 py-3.5 text-left text-white/40 font-medium text-xs uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3.5 text-left text-white/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">
                    Empresa
                  </th>
                  <th className="px-4 py-3.5 text-left text-white/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                    Plan
                  </th>
                  <th className="px-4 py-3.5 text-left text-white/40 font-medium text-xs uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3.5 text-left text-white/40 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">
                    Uso
                  </th>
                  <th className="px-4 py-3.5 text-center text-white/40 font-medium text-xs uppercase tracking-wider">
                    Reset
                  </th>
                  <th className="px-4 py-3.5 text-right text-white/40 font-medium text-xs uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl">
                          <Users className="w-10 h-10 text-white/20" />
                        </div>
                        <div>
                          <p className="text-white/50 font-medium mb-1">
                            {search || statusFilter !== "all"
                              ? "No se encontraron resultados"
                              : "Aún no hay clientes"}
                          </p>
                          <p className="text-white/30 text-xs">
                            {search || statusFilter !== "all"
                              ? "Prueba ajustando los filtros"
                              : "Crea el primer cliente con el botón de arriba"}
                          </p>
                        </div>
                        {!search && statusFilter === "all" && (
                          <button
                            onClick={() => {
                              setEditTarget(null);
                              setModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#6C63FF] hover:bg-[#5a52e0] rounded-xl text-white text-sm font-medium transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Nuevo Cliente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-white/5 hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-white font-medium leading-tight">
                            {client.name ?? "—"}
                          </p>
                          <p className="text-white/40 text-xs mt-0.5">
                            {client.email ?? "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-white/60 text-sm">
                          {client.company ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#6C63FF]/15 border border-[#6C63FF]/25 text-[#6C63FF] text-xs font-medium">
                          {client.plan ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <UsageBar
                          count={client.usage_count}
                          limit={client.usage_limit}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setResetTarget(client)}
                          title="Reset contador de uso"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00D4AA]/10 hover:bg-[#00D4AA]/20 border border-[#00D4AA]/25 hover:border-[#00D4AA]/50 text-[#00D4AA] rounded-xl text-xs font-medium transition-all group-hover:scale-105"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reset</span>
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              setEditTarget(client);
                              setModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-[#6C63FF]/20 text-white/40 hover:text-[#6C63FF] rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget(client);
                              setConfirmDelete(true);
                            }}
                            disabled={deletingId === client.id}
                            className="p-1.5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-colors disabled:opacity-40"
                            title="Eliminar"
                          >
                            {deletingId === client.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <p className="text-white/40 text-xs">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} de{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/70 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const n = i + 1;
                  if (
                    n === 1 ||
                    n === totalPages ||
                    (n >= page - 1 && n <= page + 1)
                  ) {
                    return (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          n === page
                            ? "bg-[#6C63FF] text-white"
                            : "bg-white/5 hover:bg-white/10 text-white/60"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  }
                  if (n === page - 2 || n === page + 2) {
                    return (
                      <span key={n} className="text-white/30 text-xs px-1">
                        …
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/70 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-4 flex items-start gap-2 p-3 bg-[#00D4AA]/5 border border-[#00D4AA]/15 rounded-xl">
          <RotateCcw className="w-4 h-4 text-[#00D4AA] shrink-0 mt-0.5" />
          <p className="text-white/40 text-xs">
            El botón <span className="text-[#00D4AA] font-medium">Reset</span>{" "}
            por fila establece el contador{" "}
            <code className="bg-white/10 px-1 py-0.5 rounded text-[#00D4AA]">
              usage_count
            </code>{" "}
            a <strong className="text-white/60">0</strong> para ese cliente.
            Úsalo únicamente en casos de soporte autorizados. Cada acción queda
            registrada.
          </p>
        </div>
      </div>

      {/* Modals */}
      <ClientModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
        initial={editTarget}
      />

      <ResetUsageModal
        open={!!resetTarget}
        client={resetTarget}
        onConfirm={handleReset}
        onCancel={() => setResetTarget(null)}
        loading={resetLoading}
      />

      <ConfirmModal
        open={confirmDelete}
        title="Eliminar cliente"
        message={`¿Estás seguro de que deseas eliminar a "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        danger
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmDelete(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}