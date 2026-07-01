import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
  Users,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "x-factory-key": "factory2026",
  "Content-Type": "application/json",
};
const PAGE_SIZE = 20;

const SCRAPER_HEALTH = [
  {
    marketplace: "Zapier",
    icon: Zap,
    color: "#FF4A00",
    status: "healthy",
    lastSuccess: "2025-01-15 14:32:00",
    nextRun: "2025-01-15 15:32:00",
    activeRecords: 1247,
    successRate: 98.2,
  },
  {
    marketplace: "Make",
    icon: Globe,
    color: "#6D00CC",
    status: "warning",
    lastSuccess: "2025-01-15 13:15:00",
    nextRun: "2025-01-15 15:15:00",
    activeRecords: 893,
    successRate: 87.4,
  },
  {
    marketplace: "n8n",
    icon: Activity,
    color: "#EA4B71",
    status: "critical",
    lastSuccess: "2025-01-15 10:05:00",
    nextRun: "2025-01-15 16:00:00",
    activeRecords: 456,
    successRate: 61.3,
  },
];

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 min-w-[280px] ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <XCircle size={16} />
          )}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100">
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
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-white/5 rounded animate-pulse w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: { label: "Activo", cls: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20" },
    inactive: { label: "Inactivo", cls: "bg-white/5 text-white/40 border-white/10" },
    pending: { label: "Pendiente", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    suspended: { label: "Suspendido", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  };
  const s = map[status?.toLowerCase()] || map.inactive;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function ScraperSemaphore({ item }) {
  const Icon = item.icon;
  const statusMap = {
    healthy: {
      color: "#00D4AA",
      bg: "bg-[#00D4AA]/10",
      border: "border-[#00D4AA]/30",
      ring: "ring-[#00D4AA]",
      label: "Saludable",
      Icon: CheckCircle2,
    },
    warning: {
      color: "#F59E0B",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      ring: "ring-yellow-400",
      label: "Advertencia",
      Icon: AlertTriangle,
    },
    critical: {
      color: "#EF4444",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      ring: "ring-red-500",
      label: "Crítico",
      Icon: XCircle,
    },
  };
  const s = statusMap[item.status];
  const StatusIcon = s.Icon;

  return (
    <div
      className={`relative rounded-xl border ${s.border} ${s.bg} p-5 flex flex-col gap-4 overflow-hidden`}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl"
        style={{ background: s.color, transform: "translate(30%, -30%)" }}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${item.color}20` }}
          >
            <Icon size={18} style={{ color: item.color }} />
          </div>
          <span className="font-semibold text-white text-sm">{item.marketplace}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${s.bg} border ${s.border}`}>
          <StatusIcon size={12} style={{ color: s.color }} />
          <span className="text-xs font-medium" style={{ color: s.color }}>
            {s.label}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wide">Éxito</span>
          <span className="text-lg font-bold" style={{ color: s.color }}>
            {item.successRate}%
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wide">Registros</span>
          <span className="text-lg font-bold text-white">
            {item.activeRecords.toLocaleString()}
          </span>
        </div>
        <div
          className="flex flex-col items-center justify-center rounded-lg"
          style={{ background: `${s.color}15` }}
        >
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{
              background: s.color,
              boxShadow: item.status === "healthy" ? `0 0 8px ${s.color}` : "none",
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40 flex items-center gap-1">
            <CheckCircle2 size={10} /> Última OK
          </span>
          <span className="text-white/70 font-mono text-[11px]">
            {new Date(item.lastSuccess).toLocaleString("es-MX", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40 flex items-center gap-1">
            <Clock size={10} /> Próxima
          </span>
          <span className="text-white/70 font-mono text-[11px]">
            {new Date(item.nextRun).toLocaleString("es-MX", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ client, onClose, onSaved, addToast }) {
  const isEdit = !!client?.id;
  const [form, setForm] = useState({
    name: client?.name || "",
    email: client?.email || "",
    company: client?.company || "",
    status: client?.status || "active",
    phone: client?.phone || "",
    plan: client?.plan || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nombre requerido";
    if (!form.email.trim()) e.email = "Email requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email inválido";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setSaving(true);
    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `${API_URL}/${client.id}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al guardar");
      addToast(isEdit ? "Cliente actualizado" : "Cliente creado", "success");
      onSaved();
    } catch {
      addToast("Error al guardar cliente", "error");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "name", label: "Nombre completo", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "company", label: "Empresa", type: "text" },
    { key: "phone", label: "Teléfono", type: "tel" },
    { key: "plan", label: "Plan", type: "text" },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[#1A1A2E] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
              <Users size={16} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold">
              {isEdit ? "Editar cliente" : "Nuevo cliente"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50 uppercase tracking-wide">
                {f.label}
                {f.required && <span className="text-[#6C63FF] ml-1">*</span>}
              </label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={(e) => {
                  setForm((p) => ({ ...p, [f.key]: e.target.value }));
                  setErrors((p) => ({ ...p, [f.key]: "" }));
                }}
                className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#6C63FF]/60 transition-colors ${
                  errors[f.key] ? "border-red-500/50" : "border-white/10"
                }`}
                placeholder={f.label}
              />
              {errors[f.key] && (
                <span className="text-red-400 text-xs">{errors[f.key]}</span>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wide">
              Estado
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#6C63FF]/60 transition-colors"
            >
              {["active", "inactive", "pending", "suspended"].map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <ShieldCheck size={14} />
              )}
              {saving ? "Guardando…" : isEdit ? "Actualizar" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ client, onClose, onDeleted, addToast }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/${client.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error();
      addToast("Cliente eliminado", "success");
      onDeleted();
    } catch {
      addToast("Error al eliminar", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#1A1A2E] border border-red-500/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Eliminar cliente</h3>
            <p className="text-white/40 text-xs">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-white/60 text-sm">
          ¿Eliminar a{" "}
          <span className="text-white font-medium">{client.name}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {deleting ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EstadoGeneralDelSistema() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const fetchClients = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.data || data.clients || []);
    } catch {
      addToast("Error al cargar clientes", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchClients(refreshKey > 0);
  }, [refreshKey, fetchClients]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || (c.status || "").toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalActive = clients.filter(
    (c) => (c.status || "").toLowerCase() === "active"
  ).length;

  const handleSaved = () => {
    setModal(null);
    setRefreshKey((k) => k + 1);
  };

  const handleDeleted = () => {
    setDeleteTarget(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} removeToast={removeToast} />
      {modal && (
        <ClientModal
          client={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          addToast={addToast}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          client={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
          addToast={addToast}
        />
      )}

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center shadow-lg">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-none">
                Monitor de Salud del Scraper
              </h1>
              <p className="text-white/40 text-xs mt-0.5">Panel Admin Interno — URUS</p>
            </div>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
        {/* Semaphore Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#6C63FF] to-[#00D4AA]" />
            <h2 className="text-white font-semibold">
              Estado general del sistema
            </h2>
            <span className="text-white/30 text-sm">— Semáforo por marketplace</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SCRAPER_HEALTH.map((item) => (
              <ScraperSemaphore key={item.marketplace} item={item} />
            ))}
          </div>
        </section>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total clientes",
              value: clients.length,
              icon: Users,
              color: "#6C63FF",
            },
            {
              label: "Activos",
              value: totalActive,
              icon: CheckCircle2,
              color: "#00D4AA",
            },
            {
              label: "Total registros",
              value: SCRAPER_HEALTH.reduce((a, b) => a + b.activeRecords, 0).toLocaleString(),
              icon: Database,
              color: "#6C63FF",
            },
            {
              label: "Alertas activas",
              value: SCRAPER_HEALTH.filter((s) => s.status !== "healthy").length,
              icon: AlertTriangle,
              color: "#F59E0B",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-[#1A1A2E] border border-white/5 rounded-xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{s.label}</span>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
                <span className="text-xl font-bold text-white">{s.value}</span>
              </div>
            );
          })}
        </div>

        {/* Clients Table Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#6C63FF] to-[#00D4AA]" />
            <h2 className="text-white font-semibold">Gestión de Clientes</h2>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                placeholder="Buscar por nombre, email o empresa…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#6C63FF]/50 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#1A1A2E] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/60 outline-none focus:border-[#6C63FF]/50 transition-colors"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="pending">Pendiente</option>
              <option value="suspended">Suspendido</option>
            </select>
            <button
              onClick={() => setModal("new")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              <Plus size={15} />
              Nuevo cliente
            </button>
          </div>

          {/* Table */}
          <div className="bg-[#1A1A2E] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Nombre", "Email", "Empresa", "Plan", "Estado", "Acciones"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs text-white/30 uppercase tracking-wider font-medium"
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
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                            <Users size={24} className="text-white/20" />
                          </div>
                          <div>
                            <p className="text-white/40 font-medium">
                              {search || statusFilter !== "all"
                                ? "Sin resultados"
                                : "Sin clientes"}
                            </p>
                            <p className="text-white/20 text-xs mt-1">
                              {search || statusFilter !== "all"
                                ? "Intenta con otros filtros"
                                : "Crea el primer cliente"}
                            </p>
                          </div>
                          {!search && statusFilter === "all" && (
                            <button
                              onClick={() => setModal("new")}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm transition-colors"
                            >
                              <Plus size={14} />
                              Nuevo cliente
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF] font-semibold text-xs flex-shrink-0">
                              {(c.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium truncate max-w-[120px]">
                              {c.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/50 truncate max-w-[160px]">
                          {c.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-white/50 truncate max-w-[120px]">
                          {c.company || "—"}
                        </td>
                        <td className="px-4 py-3 text-white/50">
                          {c.plan || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setModal(c)}
                              className="w-7 h-7 rounded-lg bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF] transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                <span className="text-white/30 text-xs">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)} de{" "}
                  {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                          page === p
                            ? "bg-[#6C63FF] text-white"
                            : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 py-4 text-white/20 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
          URUS Market Intelligence — Panel Admin v1.0
        </div>
      </div>
    </div>
  );
}