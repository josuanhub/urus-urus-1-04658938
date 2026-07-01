import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  Globe,
  Shield,
  Code2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Terminal,
  Wifi,
  WifiOff,
  Layers,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

const ERROR_TYPES = ["timeout", "html_changed", "antibot", "network", "parse", "unknown"];
const ERROR_TYPE_LABELS = {
  timeout: "Timeout",
  html_changed: "HTML Cambiado",
  antibot: "Bloqueo Anti-Bot",
  network: "Error de Red",
  parse: "Error de Parseo",
  unknown: "Desconocido",
};
const ERROR_TYPE_ICONS = {
  timeout: Clock,
  html_changed: Code2,
  antibot: Shield,
  network: WifiOff,
  parse: Layers,
  unknown: AlertTriangle,
};
const ERROR_TYPE_COLORS = {
  timeout: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  html_changed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  antibot: "text-red-400 bg-red-400/10 border-red-400/20",
  network: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  parse: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  unknown: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const MARKETPLACES = ["Amazon", "MercadoLibre", "eBay", "Walmart", "Shopify", "Alibaba"];
const STATUS_OPTIONS = ["active", "inactive", "suspended"];

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm transition-all duration-300 min-w-64 ${
            t.type === "success"
              ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300"
              : "bg-red-900/90 border-red-500/30 text-red-300"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={16} className="shrink-0" />
          ) : (
            <XCircle size={16} className="shrink-0" />
          )}
          <span className="text-sm font-medium">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
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
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

function ErrorTypeBadge({ type }) {
  const Icon = ERROR_TYPE_ICONS[type] || AlertTriangle;
  const color = ERROR_TYPE_COLORS[type] || ERROR_TYPE_COLORS.unknown;
  const label = ERROR_TYPE_LABELS[type] || type;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${color}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    inactive: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    suspended: "text-red-400 bg-red-400/10 border-red-400/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium ${map[status] || map.inactive}`}>
      {status || "—"}
    </span>
  );
}

function StackTraceModal({ item, onClose }) {
  const fakeStack = `Error: ${ERROR_TYPE_LABELS[item?.error_type] || "Unknown Error"}
  at ScraperEngine.fetch (scraper/engine.js:142:18)
  at async MarketplaceAdapter.run (adapters/${item?.marketplace?.toLowerCase() || "unknown"}.js:87:12)
  at async ScraperRunner.execute (runner/index.js:234:8)

Caused by: ${item?.error_type === "timeout" ? "TimeoutError: Request exceeded 30000ms" : item?.error_type === "antibot" ? "ForbiddenError: 403 Access Denied - Bot detected" : item?.error_type === "html_changed" ? "ParseError: Expected selector .price-box not found in DOM" : "NetworkError: ECONNREFUSED"}
  at RequestHandler.send (utils/request.js:56:22)
  at process.nextTick (node:internal/process/task_queues:140:5)

URL: ${item?.failed_url || "https://example.com/product/12345"}
Status: ${item?.error_type === "antibot" ? "403" : item?.error_type === "timeout" ? "408" : "500"}
Timestamp: ${item?.error_timestamp || item?.created_at || new Date().toISOString()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-[#0D0D1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Terminal size={16} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Stack Trace</h3>
              <p className="text-xs text-white/40">{item?.marketplace || "—"} · {item?.name || item?.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="bg-white/3 rounded-xl p-3 border border-white/5">
              <p className="text-xs text-white/40 mb-1">Tipo de Error</p>
              <ErrorTypeBadge type={item?.error_type || "unknown"} />
            </div>
            <div className="bg-white/3 rounded-xl p-3 border border-white/5">
              <p className="text-xs text-white/40 mb-1">Marketplace</p>
              <p className="text-sm text-white font-medium">{item?.marketplace || "—"}</p>
            </div>
            <div className="bg-white/3 rounded-xl p-3 border border-white/5 col-span-2 sm:col-span-1">
              <p className="text-xs text-white/40 mb-1">Timestamp</p>
              <p className="text-xs text-white font-mono">{item?.error_timestamp || item?.created_at || "—"}</p>
            </div>
          </div>
          <div className="bg-white/3 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-white/40 mb-1">URL Fallida</p>
            <p className="text-xs text-[#6C63FF] font-mono break-all">
              {item?.failed_url || "https://marketplace.com/product/unavailable"}
            </p>
          </div>
          <div className="bg-[#0A0A0F] rounded-xl border border-white/5 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/3">
              <Terminal size={12} className="text-white/40" />
              <span className="text-xs text-white/40 font-mono">error.stack</span>
            </div>
            <pre className="p-4 text-xs text-red-300/80 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {fakeStack}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-[#0D0D1A] border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <h3 className="font-semibold text-white">Confirmar Acción</h3>
        </div>
        <p className="text-sm text-white/60 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium"
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
    name: initial?.name || "",
    email: initial?.email || "",
    marketplace: initial?.marketplace || "",
    error_type: initial?.error_type || "",
    failed_url: initial?.failed_url || "",
    status: initial?.status || "active",
    error_timestamp: initial?.error_timestamp || new Date().toISOString().slice(0, 16),
    stack_trace: initial?.stack_trace || "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nombre requerido";
    if (!form.email.trim()) e.email = "Email requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.marketplace) e.marketplace = "Marketplace requerido";
    if (!form.error_type) e.error_type = "Tipo de error requerido";
    if (!form.failed_url.trim()) e.failed_url = "URL fallida requerida";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    onSave(form);
  };

  const field = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0D0D1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center">
              <AlertTriangle size={16} className="text-[#6C63FF]" />
            </div>
            <h3 className="font-semibold text-white">
              {initial ? "Editar Registro de Error" : "Nuevo Registro de Error"}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Nombre / Cliente *</label>
              <input
                value={form.name}
                onChange={(e) => field("name", e.target.value)}
                placeholder="Ej: Cliente Marketplace A"
                className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all ${errors.name ? "border-red-500/50" : "border-white/10"}`}
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => field("email", e.target.value)}
                placeholder="cliente@ejemplo.com"
                className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all ${errors.email ? "border-red-500/50" : "border-white/10"}`}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Marketplace *</label>
              <select
                value={form.marketplace}
                onChange={(e) => field("marketplace", e.target.value)}
                className={`w-full bg-[#0A0A0F] border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all ${errors.marketplace ? "border-red-500/50" : "border-white/10"}`}
              >
                <option value="">Seleccionar...</option>
                {MARKETPLACES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.marketplace && <p className="text-xs text-red-400 mt-1">{errors.marketplace}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Tipo de Error *</label>
              <select
                value={form.error_type}
                onChange={(e) => field("error_type", e.target.value)}
                className={`w-full bg-[#0A0A0F] border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all ${errors.error_type ? "border-red-500/50" : "border-white/10"}`}
              >
                <option value="">Seleccionar...</option>
                {ERROR_TYPES.map((t) => <option key={t} value={t}>{ERROR_TYPE_LABELS[t]}</option>)}
              </select>
              {errors.error_type && <p className="text-xs text-red-400 mt-1">{errors.error_type}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Estado</label>
              <select
                value={form.status}
                onChange={(e) => field("status", e.target.value)}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Timestamp del Error</label>
              <input
                type="datetime-local"
                value={form.error_timestamp?.slice(0, 16) || ""}
                onChange={(e) => field("error_timestamp", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">URL Fallida *</label>
            <input
              value={form.failed_url}
              onChange={(e) => field("failed_url", e.target.value)}
              placeholder="https://marketplace.com/producto/123"
              className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all font-mono ${errors.failed_url ? "border-red-500/50" : "border-white/10"}`}
            />
            {errors.failed_url && <p className="text-xs text-red-400 mt-1">{errors.failed_url}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Stack Trace (opcional)</label>
            <textarea
              value={form.stack_trace}
              onChange={(e) => field("stack_trace", e.target.value)}
              rows={4}
              placeholder="Error: ...\n  at ..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white/70 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all font-mono resize-none"
            />
          </div>
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e8] text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : null}
            {initial ? "Guardar Cambios" : "Crear Registro"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DetalleDeErroresPorMarketplace() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMarketplace, setFilterMarketplace] = useState("");
  const [filterErrorType, setFilterErrorType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', item? }
  const [confirm, setConfirm] = useState(null); // { id }
  const [stackTrace, setStackTrace] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error("Error fetching");
      const json = await res.json();
      setData(Array.isArray(json) ? json : json.data || []);
    } catch {
      addToast("Error al cargar los registros", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (r.name || "").toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q) ||
      (r.failed_url || "").toLowerCase().includes(q) ||
      (r.marketplace || "").toLowerCase().includes(q);
    const matchMarketplace = !filterMarketplace || r.marketplace === filterMarketplace;
    const matchError = !filterErrorType || r.error_type === filterErrorType;
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchMarketplace && matchError && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      addToast("Registro creado exitosamente");
      setModal(null);
      fetchData();
    } catch {
      addToast("Error al crear el registro", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/${modal.item.id}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      addToast("Registro actualizado exitosamente");
      setModal(null);
      fetchData();
    } catch {
      addToast("Error al actualizar el registro", "error");
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
      addToast("Registro eliminado");
      setConfirm(null);
      fetchData();
    } catch {
      addToast("Error al eliminar el registro", "error");
      setConfirm(null);
    }
  };

  const errorCounts = ERROR_TYPES.reduce((acc, t) => {
    acc[t] = data.filter((d) => d.error_type === t).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />

      {modal && (
        <ClientForm
          initial={modal.mode === "edit" ? modal.item : null}
          onSave={modal.mode === "edit" ? handleEdit : handleCreate}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
      {confirm && (
        <ConfirmModal
          message="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {stackTrace && (
        <StackTraceModal item={stackTrace} onClose={() => setStackTrace(null)} />
      )}

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0D0D1A]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF]/30 to-[#00D4AA]/20 border border-[#6C63FF]/30 flex items-center justify-center">
              <AlertTriangle size={18} className="text-[#6C63FF]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Monitor de Salud del Scraper</h1>
              <p className="text-xs text-white/40">Detalle de errores por marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e8] text-white text-sm font-medium transition-all shadow-lg shadow-[#6C63FF]/20"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nuevo Registro</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ERROR_TYPES.map((t) => {
            const Icon = ERROR_TYPE_ICONS[t];
            const color = ERROR_TYPE_COLORS[t];
            return (
              <button
                key={t}
                onClick={() => setFilterErrorType(filterErrorType === t ? "" : t)}
                className={`rounded-xl p-3 border text-left transition-all hover:scale-105 ${filterErrorType === t ? color.replace("text-", "ring-1 ring-").split(" ")[0] + " " + color : "bg-white/3 border-white/5 hover:bg-white/5"}`}
              >
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2 ${color}`}>
                  <Icon size={14} />
                </div>
                <p className="text-lg font-bold text-white">{errorCounts[t] || 0}</p>
                <p className="text-xs text-white/40 leading-tight mt-0.5">{ERROR_TYPE_LABELS[t]}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-[#0D0D1A] border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
            <Filter size={12} />
            <span>Filtros y Búsqueda</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar por cliente, email, URL..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all"
              />
            </div>
            <select
              value={filterMarketplace}
              onChange={(e) => { setFilterMarketplace(e.target.value); setPage(1); }}
              className="bg-[#0A0A0F] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all min-w-36"
            >
              <option value="">Todos los MP</option>
              {MARKETPLACES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={filterErrorType}
              onChange={(e) => { setFilterErrorType(e.target.value); setPage(1); }}
              className="bg-[#0A0A0F] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all min-w-36"
            >
              <option value="">Todos los errores</option>
              {ERROR_TYPES.map((t) => <option key={t} value={t}>{ERROR_TYPE_LABELS[t]}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="bg-[#0A0A0F] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all min-w-32"
            >
              <option value="">Todos los estados</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {(search || filterMarketplace || filterErrorType || filterStatus) && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-white/40">{filtered.length} resultado(s)</span>
              <button
                onClick={() => { setSearch(""); setFilterMarketplace(""); setFilterErrorType(""); setFilterStatus(""); setPage(1); }}
                className="text-xs text-[#6C63FF] hover:text-[#00D4AA] transition-colors flex items-center gap-1"
              >
                <X size={11} /> Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-[#0D0D1A] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 whitespace-nowrap">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 whitespace-nowrap">Marketplace</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 whitespace-nowrap">Tipo de Error</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 whitespace-nowrap">URL Fallida</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 whitespace-nowrap">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 whitespace-nowrap">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/40 whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center">
                          <AlertTriangle size={24} className="text-white/20" />
                        </div>
                        <div>
                          <p className="text-white/40 font-medium mb-1">No hay registros de errores</p>
                          <p className="text-white/20 text-sm">
                            {search || filterMarketplace || filterErrorType || filterStatus
                              ? "Intenta ajustar los filtros"
                              : "Comienza registrando el primer error del scraper"}
                          </p>
                        </div>
                        {!search && !filterMarketplace && !filterErrorType && !filterStatus && (
                          <button
                            onClick={() => setModal({ mode: "create" })}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e8] text-white text-sm font-medium transition-all mt-2"
                          >
                            <Plus size={15} />
                            Nuevo Registro
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-white">{row.name || "—"}</p>
                          <p className="text-xs text-white/40 mt-0.5">{row.email || "—"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {row.marketplace ? (
                          <div className="flex items-center gap-1.5">
                            <Globe size={12} className="text-[#00D4AA]" />
                            <span className="text-sm text-white">{row.marketplace}</span>
                          </div>
                        ) : (
                          <span className="text-white/30 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {row.error_type ? (
                          <ErrorTypeBadge type={row.error_type} />
                        ) : (
                          <span className="text-white/30 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        {row.failed_url ? (
                          <p className="text-xs text-[#6C63FF] font-mono truncate max-w-48" title={row.failed_url}>
                            {row.failed_url}
                          </p>
                        ) : (
                          <span className="text-white/30 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {row.error_timestamp || row.created_at ? (
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-white/30 shrink-0" />
                            <span className="text-xs text-white/50 font-mono">
                              {new Date(row.error_timestamp || row.created_at).toLocaleString("es", {
                                day: "2-digit", month: "2-digit", year: "2-digit",
                                hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/30 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setStackTrace(row)}
                            title="Ver Stack Trace"
                            className="p-1.5 rounded-lg text-white/40 hover:text-[#00D4AA] hover:bg-[#00D4AA]/10 transition-all"
                          >
                            <Terminal size={14} />
                          </button>
                          <button
                            onClick={() => setModal({ mode: "edit", item: row })}
                            title="Editar"
                            className="p-1.5 rounded-lg text-white/40 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setConfirm({ id: row.id })}
                            title="Eliminar"
                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          >
                            <Trash2 size={14} />
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
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? "bg-[#6C63FF] text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-white/20 pb-4">
          <span>URUS Market Intelligence — Scraper Health Monitor</span>
          <span>{data.length} registros en total</span>
        </div>
      </div>
    </div>
  );
}