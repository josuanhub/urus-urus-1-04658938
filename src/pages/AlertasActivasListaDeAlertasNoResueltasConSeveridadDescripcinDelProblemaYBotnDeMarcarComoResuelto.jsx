import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  RefreshCw,
  Shield,
  Clock,
  ZapOff,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/scraper_alerts";
const CLIENTS_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = { "x-factory-key": "factory2026", "Content-Type": "application/json" };
const PAGE_SIZE = 20;

const SEVERITY_CONFIG = {
  critical: {
    label: "Crítico",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    dot: "bg-red-400",
    icon: AlertCircle,
  },
  high: {
    label: "Alto",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
    dot: "bg-orange-400",
    icon: AlertTriangle,
  },
  medium: {
    label: "Medio",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    dot: "bg-yellow-400",
    icon: AlertTriangle,
  },
  low: {
    label: "Bajo",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
    dot: "bg-blue-400",
    icon: Info,
  },
};

const INITIAL_FORM = {
  client_id: "",
  severity: "medium",
  title: "",
  description: "",
  status: "open",
  source: "",
  resolved_at: "",
};

function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-2xl border backdrop-blur-sm transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <p className="text-sm font-medium flex-1">{t.message}</p>
          <button onClick={() => remove(t.id)} className="shrink-0 opacity-70 hover:opacity-100">
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
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const isOpen = status === "open";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
        isOpen
          ? "bg-red-400/10 border-red-400/30 text-red-400"
          : "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-red-400 animate-pulse" : "bg-[#00D4AA]"}`} />
      {isOpen ? "Abierta" : "Resuelta"}
    </span>
  );
}

function ConfirmModal({ open, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <Trash2 size={18} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold">Confirmar acción</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertForm({ form, setForm, clients, onSubmit, onClose, editing, loading }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "El título es requerido";
    if (!form.description.trim()) e.description = "La descripción es requerida";
    if (!form.severity) e.severity = "La severidad es requerida";
    if (!form.status) e.status = "El estado es requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit();
  };

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );

  const inputClass = (err) =>
    `w-full bg-white/5 border rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/60 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all ${
      err ? "border-red-500/50" : "border-white/10"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg h-full max-h-[calc(100vh-2rem)] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center">
              {editing ? <Edit2 size={14} className="text-[#6C63FF]" /> : <Plus size={14} className="text-[#6C63FF]" />}
            </div>
            <h2 className="text-white font-semibold text-sm">
              {editing ? "Editar Alerta" : "Nueva Alerta"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Título *" error={errors.title}>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Scraper caído en marketplace X"
                className={inputClass(errors.title)}
              />
            </Field>

            <Field label="Descripción *" error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe el problema detectado..."
                rows={3}
                className={inputClass(errors.description) + " resize-none"}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Severidad *" error={errors.severity}>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className={inputClass(errors.severity) + " appearance-none cursor-pointer"}
                >
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Medio</option>
                  <option value="low">Bajo</option>
                </select>
              </Field>

              <Field label="Estado *" error={errors.status}>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={inputClass(errors.status) + " appearance-none cursor-pointer"}
                >
                  <option value="open">Abierta</option>
                  <option value="resolved">Resuelta</option>
                </select>
              </Field>
            </div>

            <Field label="Cliente">
              <select
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className={inputClass() + " appearance-none cursor-pointer"}
              >
                <option value="">Sin cliente asignado</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.email || c.id}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Fuente / Origen">
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Ej: scraper-amazon, monitor-cron"
                className={inputClass()}
              />
            </Field>

            {form.status === "resolved" && (
              <Field label="Fecha de resolución">
                <input
                  type="datetime-local"
                  value={form.resolved_at}
                  onChange={(e) => setForm({ ...form, resolved_at: e.target.value })}
                  className={inputClass()}
                />
              </Field>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-white/10 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5a52d5] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw size={14} className="animate-spin" />}
              {editing ? "Guardar cambios" : "Crear alerta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AlertasActivasPage() {
  const [alerts, setAlerts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [confirm, setConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: { "x-factory-key": "factory2026" } });
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : data.data || []);
    } catch {
      addToast("Error al cargar las alertas", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch(CLIENTS_URL, { headers: { "x-factory-key": "factory2026" } });
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchClients();
  }, [fetchAlerts, fetchClients]);

  const filtered = alerts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (a.title || "").toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q) ||
      (a.source || "").toLowerCase().includes(q);
    const matchSeverity = filterSeverity === "all" || a.severity === filterSeverity;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchSeverity && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
  };

  const openEdit = (alert) => {
    setEditing(alert);
    setForm({
      client_id: alert.client_id || "",
      severity: alert.severity || "medium",
      title: alert.title || "",
      description: alert.description || "",
      status: alert.status || "open",
      source: alert.source || "",
      resolved_at: alert.resolved_at ? alert.resolved_at.slice(0, 16) : "",
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      const payload = { ...form };
      if (!payload.resolved_at) delete payload.resolved_at;

      const url = editing ? `${API_URL}/${editing.id}` : API_URL;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      addToast(editing ? "Alerta actualizada correctamente" : "Alerta creada correctamente");
      setShowForm(false);
      fetchAlerts();
    } catch {
      addToast("Error al guardar la alerta", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_URL}/${confirm.id}`, {
        method: "DELETE",
        headers: { "x-factory-key": "factory2026" },
      });
      if (!res.ok) throw new Error();
      addToast("Alerta eliminada correctamente");
      setConfirm(null);
      fetchAlerts();
    } catch {
      addToast("Error al eliminar la alerta", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResolve = async (alert) => {
    setResolvingId(alert.id);
    try {
      const payload = {
        ...alert,
        status: "resolved",
        resolved_at: new Date().toISOString(),
      };
      const res = await fetch(`${API_URL}/${alert.id}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      addToast("Alerta marcada como resuelta");
      fetchAlerts();
    } catch {
      addToast("Error al resolver la alerta", "error");
    } finally {
      setResolvingId(null);
    }
  };

  const getClientName = (id) => {
    const c = clients.find((cl) => cl.id === id);
    return c ? c.name || c.email || id : id || "—";
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("es-ES", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return d; }
  };

  const stats = {
    total: alerts.filter((a) => a.status === "open").length,
    critical: alerts.filter((a) => a.status === "open" && a.severity === "critical").length,
    high: alerts.filter((a) => a.status === "open" && a.severity === "high").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} remove={removeToast} />

      {showForm && (
        <AlertForm
          form={form}
          setForm={setForm}
          clients={clients}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          editing={editing}
          loading={formLoading}
        />
      )}

      <ConfirmModal
        open={!!confirm}
        message={`¿Eliminar la alerta "${confirm?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
        loading={deleteLoading}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF]/30 to-[#00D4AA]/20 border border-[#6C63FF]/30 flex items-center justify-center">
                <Bell size={22} className="text-[#6C63FF]" />
              </div>
              {stats.critical > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-[#0A0A0F] flex items-center justify-center text-white text-[10px] font-bold">
                  {stats.critical}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Alertas Activas</h1>
              <p className="text-white/40 text-sm">Monitor de salud del scraper — Panel Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAlerts}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5a52d5] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#6C63FF]/20"
            >
              <Plus size={16} />
              <span>Nueva Alerta</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Alertas abiertas", value: stats.total, icon: Bell, color: "text-[#6C63FF]", bg: "bg-[#6C63FF]/10", border: "border-[#6C63FF]/20" },
            { label: "Críticas", value: stats.critical, icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
            { label: "Alta severidad", value: stats.high, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
            { label: "Resueltas", value: stats.resolved, icon: CheckCircle, color: "text-[#00D4AA]", bg: "bg-[#00D4AA]/10", border: "border-[#00D4AA]/20" },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`rounded-2xl border ${border} ${bg} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/50 text-xs font-medium">{label}</p>
                <Icon size={16} className={color} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por título, descripción, fuente..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/50 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2.5 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#6C63FF]/50 transition-all"
              >
                <option value="all">Todos los estados</option>
                <option value="open">Abiertas</option>
                <option value="resolved">Resueltas</option>
              </select>
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => { setFilterSeverity(e.target.value); setPage(1); }}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#6C63FF]/50 transition-all"
            >
              <option value="all">Toda severidad</option>
              <option value="critical">Crítico</option>
              <option value="high">Alto</option>
              <option value="medium">Medio</option>
              <option value="low">Bajo</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#1A1A2E]/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  {["Severidad", "Título / Descripción", "Fuente", "Cliente", "Estado", "Creada", "Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center">
                          <ZapOff size={28} className="text-[#6C63FF]/50" />
                        </div>
                        <div>
                          <p className="text-white/50 font-medium mb-1">
                            {search || filterSeverity !== "all" || filterStatus !== "all"
                              ? "No hay alertas con esos filtros"
                              : "No hay alertas registradas"}
                          </p>
                          <p className="text-white/25 text-sm">
                            {search || filterSeverity !== "all" || filterStatus !== "all"
                              ? "Intenta ajustar los filtros de búsqueda"
                              : "¡Todo tranquilo! Crea una alerta cuando detectes un problema"}
                          </p>
                        </div>
                        {!search && filterSeverity === "all" && filterStatus === "all" && (
                          <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/30 text-[#6C63FF] text-sm font-semibold hover:bg-[#6C63FF]/30 transition-colors"
                          >
                            <Plus size={15} />
                            Nueva alerta
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((alert) => {
                    const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
                    return (
                      <tr
                        key={alert.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Severity */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <SeverityBadge severity={alert.severity} />
                        </td>

                        {/* Title / Description */}
                        <td className="px-4 py-4 min-w-[200px] max-w-[320px]">
                          <p className="text-white text-sm font-semibold truncate">{alert.title || "Sin título"}</p>
                          <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{alert.description || "—"}</p>
                        </td>

                        {/* Source */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-white/60 text-xs font-mono bg-white/5 px-2 py-1 rounded-lg">
                            {alert.source || "—"}
                          </span>
                        </td>

                        {/* Client */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-white/60 text-sm">{getClientName(alert.client_id)}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={alert.status} />
                        </td>

                        {/* Created at */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-white/40 text-xs">
                            <Clock size={11} />
                            {formatDate(alert.created_at)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {alert.status === "open" && (
                              <button
                                onClick={() => handleResolve(alert)}
                                disabled={resolvingId === alert.id}
                                title="Marcar como resuelto"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] text-xs font-semibold hover:bg-[#00D4AA]/20 transition-colors disabled:opacity-50"
                              >
                                {resolvingId === alert.id ? (
                                  <RefreshCw size={11} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={11} />
                                )}
                                <span>Resolver</span>
                              </button>
                            )}
                            <button
                              onClick={() => openEdit(alert)}
                              title="Editar"
                              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-[#6C63FF]/20 hover:border-[#6C63FF]/30 hover:text-[#6C63FF] flex items-center justify-center text-white/40 transition-all"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setConfirm(alert)}
                              title="Eliminar"
                              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center text-white/40 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.01]">
              <p className="text-white/30 text-xs">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                          p === page
                            ? "bg-[#6C63FF] text-white border border-[#6C63FF]"
                            : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-white/20 text-xs px-1">…</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center gap-2 text-white/20 text-xs">
          <Shield size={12} />
          <span>URUS Market Intelligence — Monitor de Salud del Scraper · Panel Admin Interno</span>
        </div>
      </div>
    </div>
  );
}