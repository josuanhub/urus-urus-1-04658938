import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Activity,
  CreditCard,
  Calendar,
  BarChart2,
  Eye,
  EyeOff,
  RefreshCw,
  User,
  Package,
  Clock,
  TrendingUp,
  Filter,
  ChevronDown,
} from "lucide-react";

const API_BASE = "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api";
const HEADERS = { "x-factory-key": "factory2026", "Content-Type": "application/json" };
const PAGE_SIZE = 20;

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-sm transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? <Check size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100 shrink-0"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, add, remove };
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />;
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({ open, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold">Confirmar acción</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-xl text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all flex items-center gap-2">
            {loading && <RefreshCw size={14} className="animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Copy Button ────────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={handle} className="p-1 rounded text-white/40 hover:text-[#00D4AA] transition-colors">
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ── Key Mask ───────────────────────────────────────────────────────────────────
function MaskedKey({ value }) {
  const [show, setShow] = useState(false);
  const masked = value ? value.slice(0, 8) + "••••••••••••" + value.slice(-4) : "—";
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs">
      <span className="text-white/70">{show ? value : masked}</span>
      <button onClick={() => setShow((s) => !s)} className="text-white/30 hover:text-white/60 transition-colors">
        {show ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
      {value && <CopyButton text={value} />}
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20",
    inactive: "bg-white/5 text-white/40 border-white/10",
    revoked: "bg-red-500/10 text-red-400 border-red-500/20",
    expired: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  const labels = { active: "Activa", inactive: "Inactiva", revoked: "Revocada", expired: "Expirada" };
  const cls = map[status] || "bg-white/5 text-white/40 border-white/10";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${cls}`}>
      {labels[status] || status}
    </span>
  );
}

// ── Modal Form ─────────────────────────────────────────────────────────────────
function KeyModal({ open, onClose, onSave, initial, loading }) {
  const empty = { key_name: "", key_value: "", status: "active", client_id: "", plan_id: "", scopes: "", expires_at: "", notes: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...empty, ...initial } : empty);
      setErrors({});
    }
  }, [open, initial]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.key_name?.trim()) e.key_name = "Nombre requerido";
    if (!form.client_id?.trim()) e.client_id = "Client ID requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  if (!open) return null;

  const Field = ({ label, id, type = "text", placeholder, error, children, required }) => (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">
        {label} {required && <span className="text-[#6C63FF]">*</span>}
      </label>
      {children || (
        <input
          id={id}
          type={type}
          value={form[id] || ""}
          onChange={(e) => set(id, e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#6C63FF]/60 transition-colors ${
            error ? "border-red-500/50" : "border-white/10"
          }`}
        />
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
              <Key size={16} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold">{initial ? "Editar API Key" : "Nueva API Key"}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            <Field label="Nombre de la key" id="key_name" placeholder="ej. producción-principal" error={errors.key_name} required />
            <Field label="Valor de la key" id="key_value" placeholder="sk_live_..." />
            <Field label="Client ID" id="client_id" placeholder="UUID del cliente" error={errors.client_id} required />
            <Field label="Plan ID" id="plan_id" placeholder="UUID del plan" />

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Estado</label>
              <select
                value={form.status || "active"}
                onChange={(e) => set("status", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#6C63FF]/60 transition-colors"
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
                <option value="revoked">Revocada</option>
                <option value="expired">Expirada</option>
              </select>
            </div>

            <Field label="Scopes" id="scopes" placeholder="read,write,admin (separados por coma)" />
            <Field label="Fecha de expiración" id="expires_at" type="date" />
            <Field label="Notas" id="notes" placeholder="Descripción opcional">
              <textarea
                value={form.notes || ""}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Descripción opcional"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#6C63FF]/60 transition-colors resize-none"
              />
            </Field>
          </div>

          <div className="p-5 border-t border-white/10 flex gap-3 justify-end shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm bg-[#6C63FF] text-white font-medium hover:bg-[#5a52e0] transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <RefreshCw size={14} className="animate-spin" />}
              {initial ? "Guardar cambios" : "Crear API Key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "#6C63FF", loading }) {
  return (
    <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-4 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-white/40 text-xs mb-1">{label}</p>
        {loading ? (
          <Skeleton className="h-6 w-16 mb-1" />
        ) : (
          <p className="text-white font-bold text-xl leading-none">{value ?? "—"}</p>
        )}
        {sub && <p className="text-white/30 text-xs mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Monthly Chart ──────────────────────────────────────────────────────────────
function MonthlyChart({ data, loading }) {
  if (loading) return <Skeleton className="h-40 w-full" />;
  if (!data || data.length === 0) return (
    <div className="h-40 flex items-center justify-center text-white/30 text-sm">Sin datos históricos</div>
  );

  const max = Math.max(...data.map((d) => d.count || 0), 1);

  return (
    <div className="flex items-end gap-1.5 h-40 w-full">
      {data.map((d, i) => {
        const pct = Math.max(4, ((d.count || 0) / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full relative flex flex-col justify-end" style={{ height: "120px" }}>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{ height: `${pct}%`, background: `linear-gradient(180deg, #6C63FF, #00D4AA)` }}
              />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-[#1A1A2E] border border-white/10 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap z-10">
                {d.count} reqs
              </div>
            </div>
            <span className="text-white/30 text-[9px] truncate w-full text-center">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DetalleDeClienteConsumoHistricoMesAMesTodasLasAPIKeysGeneradasLogDeActividadYPlanAsignado() {
  const { toasts, add: addToast, remove: removeToast } = useToast();

  // Data states
  const [keys, setKeys] = useState([]);
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);

  // UI states
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [savingModal, setSavingModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("keys");

  // ── Fetch helpers ────────────────────────────────────────────────────────────
  const fetchTable = async (table) => {
    const res = await fetch(`${API_BASE}/${table}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const json = await res.json();
    return Array.isArray(json) ? json : json.data || json.records || [];
  };

  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const data = await fetchTable("api_keys");
      setKeys(data);
    } catch {
      addToast("Error al cargar API keys", "error");
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const data = await fetchTable("clients");
      setClients(data);
    } catch {
      addToast("Error al cargar clientes", "error");
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const data = await fetchTable("plans");
      setPlans(data);
    } catch {
      addToast("Error al cargar planes", "error");
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const data = await fetchTable("api_request_logs");
      setLogs(data);
    } catch {
      addToast("Error al cargar logs", "error");
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
    fetchClients();
    fetchPlans();
    fetchLogs();
  }, [fetchKeys, fetchClients, fetchPlans, fetchLogs]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));

  const monthlyData = (() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ month: d.toLocaleString("es", { month: "short" }), key, count: 0 });
    }
    logs.forEach((log) => {
      const d = log.created_at || log.timestamp || log.date || "";
      const mk = d.slice(0, 7);
      const m = months.find((m) => m.key === mk);
      if (m) m.count++;
    });
    return months;
  })();

  const filteredKeys = keys.filter((k) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (k.key_name || "").toLowerCase().includes(q) ||
      (k.key_value || "").toLowerCase().includes(q) ||
      (k.client_id || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || k.status === filterStatus;
    const matchClient = filterClient === "all" || k.client_id === filterClient;
    return matchSearch && matchStatus && matchClient;
  });

  const totalPages = Math.ceil(filteredKeys.length / PAGE_SIZE);
  const pagedKeys = filteredKeys.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeKeys = keys.filter((k) => k.status === "active").length;
  const revokedKeys = keys.filter((k) => k.status === "revoked").length;
  const totalRequests = logs.length;
  const uniqueClients = [...new Set(keys.map((k) => k.client_id).filter(Boolean))].length;

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    setSavingModal(true);
    try {
      const payload = { ...form };
      let res;
      if (editTarget) {
        res = await fetch(`${API_BASE}/api_keys/${editTarget.id}`, {
          method: "PUT",
          headers: HEADERS,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/api_keys`, {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error();
      addToast(editTarget ? "API Key actualizada correctamente" : "API Key creada correctamente");
      setModalOpen(false);
      setEditTarget(null);
      fetchKeys();
    } catch {
      addToast("Error al guardar la API key", "error");
    } finally {
      setSavingModal(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`${API_BASE}/api_keys/${deleteTarget.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error();
      addToast("API Key eliminada correctamente");
      setDeleteTarget(null);
      fetchKeys();
    } catch {
      addToast("Error al eliminar la API key", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (key) => {
    setEditTarget(key);
    setModalOpen(true);
  };

  const openNew = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  // ── Recent logs ───────────────────────────────────────────────────────────────
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 15);

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch {
      return d;
    }
  };

  const methodColor = (m) => {
    const map = { GET: "text-[#00D4AA]", POST: "text-[#6C63FF]", PUT: "text-yellow-400", DELETE: "text-red-400" };
    return map[(m || "").toUpperCase()] || "text-white/50";
  };

  const statusCodeColor = (code) => {
    const n = Number(code);
    if (n < 300) return "text-[#00D4AA]";
    if (n < 400) return "text-yellow-400";
    return "text-red-400";
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      <Toast toasts={toasts} remove={removeToast} />

      <ConfirmDialog
        open={!!deleteTarget}
        message={`¿Eliminar la API key "${deleteTarget?.key_name || deleteTarget?.id}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={!!deletingId}
      />

      <KeyModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={editTarget}
        loading={savingModal}
      />

      {/* ── Header ── */}
      <div className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center shrink-0">
              <Key size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg leading-none truncate">
                URUS — Detalle de Cliente
              </h1>
              <p className="text-white/40 text-xs mt-0.5 truncate">
                Consumo histórico · API Keys · Actividad · Plan asignado
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { fetchKeys(); fetchLogs(); fetchClients(); fetchPlans(); }}
              className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#6C63FF] hover:bg-[#5a52e0] rounded-xl text-sm font-medium transition-all"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Nueva Key</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Key} label="Total API Keys" value={keys.length} sub={`${activeKeys} activas`} color="#6C63FF" loading={loadingKeys} />
          <StatCard icon={Activity} label="Total Requests" value={totalRequests.toLocaleString()} sub="histórico completo" color="#00D4AA" loading={loadingLogs} />
          <StatCard icon={User} label="Clientes únicos" value={uniqueClients} sub="con al menos 1 key" color="#6C63FF" loading={loadingKeys} />
          <StatCard icon={AlertTriangle} label="Keys revocadas" value={revokedKeys} sub="requieren revisión" color="#ef4444" loading={loadingKeys} />
        </div>

        {/* ── Monthly chart ── */}
        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-[#6C63FF]" />
              <h2 className="text-white font-semibold text-sm">Consumo histórico — últimos 12 meses</h2>
            </div>
            <span className="text-white/30 text-xs">{totalRequests.toLocaleString()} requests totales</span>
          </div>
          <MonthlyChart data={monthlyData} loading={loadingLogs} />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
          {[
            { id: "keys", label: "API Keys", icon: Key },
            { id: "logs", label: "Log de actividad", icon: Activity },
            { id: "clients", label: "Clientes", icon: User },
            { id: "plans", label: "Planes", icon: Package },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#6C63FF] text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <tab.icon size={13} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── API Keys Tab ── */}
        {activeTab === "keys" && (
          <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Buscar por nombre, key, cliente…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#6C63FF]/50 transition-colors"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-3 pr-8 py-2.5 text-sm text-white/70 outline-none focus:border-[#6C63FF]/50 transition-colors cursor-pointer"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                    <option value="revoked">Revocada</option>
                    <option value="expired">Expirada</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={filterClient}
                    onChange={(e) => { setFilterClient(e.target.value); setPage(1); }}
                    className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-3 pr-8 py-2.5 text-sm text-white/70 outline-none focus:border-[#6C63FF]/50 transition-colors cursor-pointer max-w-[140px]"
                  >
                    <option value="all">Todos los clientes</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.company || c.id}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results info */}
            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
              <span className="text-white/30 text-xs">
                {filteredKeys.length} resultado{filteredKeys.length !== 1 ? "s" : ""}
                {search && ` para "${search}"`}
              </span>
              {(search || filterStatus !== "all" || filterClient !== "all") && (
                <button
                  onClick={() => { setSearch(""); setFilterStatus("all"); setFilterClient("all"); setPage(1); }}
                  className="text-[#6C63FF] text-xs hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Table */}
            {loadingKeys ? (
              <TableSkeleton />
            ) : pagedKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Key size={28} className="text-white/20" />
                </div>
                <div className="text-center">
                  <p className="text-white/50 font-medium mb-1">No hay API keys</p>
                  <p className="text-white/30 text-sm">
                    {search || filterStatus !== "all" ? "Prueba con otros filtros" : "Crea la primera API key para comenzar"}
                  </p>
                </div>
                {!search && filterStatus === "all" && (
                  <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#6C63FF] hover:bg-[#5a52e0] rounded-xl text-sm font-medium transition-all"
                  >
                    <Plus size={15} /> Nueva API Key
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Nombre", "Key", "Estado", "Cliente", "Plan", "Expiración", "Creada", "Acciones"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-white/30 text-xs font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pagedKeys.map((k) => {
                      const client = clientMap[k.client_id];
                      const plan = planMap[k.plan_id];
                      return (
                        <tr key={k.id} className="hover:bg-white/3 transition-colors group">
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#6C63FF]/10 flex items-center justify-center shrink-0">
                                <Key size={12} className="text-[#6C63FF]" />
                              </div>
                              <div>
                                <p className="text-white font-medium text-xs">{k.key_name || "—"}</p>
                                {k.scopes && <p className="text-white/30 text-[10px] truncate max-w-[120px]">{k.scopes}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <MaskedKey value={k.key_value || k.key || ""} />
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <StatusBadge status={k.status} />
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div>
                              <p className="text-white/70 text-xs truncate max-w-[120px]">
                                {client ? (client.name || client.company || client.email || k.client_id) : k.client_id || "—"}
                              </p>
                              {client?.email && <p className="text-white/30 text-[10px] truncate max-w-[120px]">{client.email}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-white/50 text-xs">
                              {plan ? (plan.name || plan.plan_name || k.plan_id) : k.plan_id || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-white/40">
                              <Calendar size={11} />
                              {k.expires_at ? formatDate(k.expires_at) : <span className="text-[#00D4AA]/70">Sin expiración</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-white/30 text-xs">{formatDate(k.created_at)}</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEdit(k)}
                                className="p-1.5 rounded-lg text-white/40 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-all"
                                title="Editar"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(k)}
                                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Eliminar"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loadingKeys && totalPages > 1 && (
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/30 text-xs">
                  Página {page} de {totalPages} · {filteredKeys.length} registros
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const pNum = start + i;
                    return pNum <= totalPages ? (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          pNum === page
                            ? "bg-[#6C63FF] text-white"
                            : "border border-white/10 text-white/40 hover:text-white hover:border-white/20"
                        }`}
                      >
                        {pNum}
                      </button>
                    ) : null;
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Activity Log Tab ── */}
        {activeTab === "logs" && (
          <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[#00D4AA]" />
                <h2 className="text-white font-semibold text-sm">Log de Actividad Reciente</h2>
              </div>
              <span className="text-white/30 text-xs">{logs.length} requests totales</span>
            </div>

            {loadingLogs ? (
              <TableSkeleton />
            ) : recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Activity size={24} className="text-white/20" />
                </div>
                <p className="text-white/40 text-sm">Sin actividad registrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Timestamp", "Método", "Endpoint", "Status", "API Key", "IP", "Latencia"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-white/30 text-xs font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <Clock size={11} />
                            {formatDate(log.created_at || log.timestamp)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-xs font-bold font-mono ${methodColor(log.method)}`}>
                            {log.method || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white/60 text-xs font-mono truncate block max-w-[200px]">
                            {log.endpoint || log.path || log.url || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-xs font-mono font-bold ${statusCodeColor(log.status_code || log.status)}`}>
                            {log.status_code || log.status || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-white/40 text-xs font-mono truncate block max-w-[120px]">
                            {log.api_key_id || log.key_id || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-white/30 text-xs font-mono">{log.ip || log.ip_address || "—"}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-white/40 text-xs">
                            {log.latency || log.response_time ? `${log.latency || log.response_time}ms` : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Clients Tab ── */}
        {activeTab === "clients" && (
          <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <User size={15} className="text-[#6C63FF]" />
              <h2 className="text-white font-semibold text-sm">Clientes registrados</h2>
              <span className="ml-auto text-white/30 text-xs">{clients.length} clientes</span>
            </div>

            {loadingClients ? (
              <TableSkeleton />
            ) : clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <User size={24} className="text-white/20" />
                </div>
                <p className="text-white/40 text-sm">Sin clientes registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Cliente", "Email", "Empresa", "Plan", "Keys activas", "Estado", "Creado"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-white/30 text-xs font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clients.map((c) => {
                      const clientKeys = keys.filter((k) => k.client_id === c.id);
                      const activeClientKeys = clientKeys.filter((k) => k.status === "active").length;
                      const plan = planMap[c.plan_id];
                      return (
                        <tr key={c.id} className="hover:bg-white/3 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {(c.name || c.company || "?")[0].toUpperCase()}
                              </div>
                              <span className="text-white text-xs font-medium">{c.name || c.id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-white/50 text-xs">{c.email || "—"}</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-white/50 text-xs">{c.company || c.organization || "—"}</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-[#6C63FF] text-xs font-medium">
                              {plan ? (plan.name || plan.plan_name) : c.plan_id || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-semibold ${activeClientKeys > 0 ? "text-[#00D4AA]" : "text-white/30"}`}>
                                {activeClientKeys}
                              </span>
                              <span className="text-white/20 text-xs">/ {clientKeys.length}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <StatusBadge status={c.status || "active"} />
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-white/30 text-xs">{formatDate(c.created_at)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Plans Tab ── */}
        {activeTab === "plans" && (
          <div className="space-y-4">
            {loadingPlans ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
              </div>
            ) : plans.length === 0 ? (
              <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Package size={24} className="text-white/20" />
                </div>
                <p className="text-white/40 text-sm">Sin planes configurados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const planClients = clients.filter((c) => c.plan_id === plan.id).length;
                  const planKeys = keys.filter((k) => k.plan_id === plan.id).length;
                  return (
                    <div key={plan.id} className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5 hover:border-[#6C63FF]/30 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                          <Package size={18} className="text-[#6C63FF]" />
                        </div>
                        <StatusBadge status={plan.status || "active"} />
                      </div>
                      <h3 className="text-white font-semibold mb-1">{plan.name || plan.plan_name || "Sin nombre"}</h3>
                      <p className="text-white/40 text-xs mb-4 line-clamp-2">{plan.description || "Sin descripción"}</p>
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                        <div>
                          <p className="text-white/30 text-xs mb-0.5">Precio</p>
                          <p className="text-[#00D4AA] font-semibold text-sm">
                            {plan.price ? `$${plan.price}` : "—"}
                            {plan.billing_cycle && <span className="text-white/30 text-xs">/{plan.billing_cycle}</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/30 text-xs mb-0.5">Rate limit</p>
                          <p className="text-white font-semibold text-sm">{plan.rate_limit || plan.requests_limit || "—"}</p>
                        </div>
                        <div>
                          <p className="text-white/30 text-xs mb-0.5">Clientes</p>
                          <p className="text-white font-semibold text-sm">{planClients}</p>
                        </div>
                        <div>
                          <p className="text-white/30 text-xs mb-0.5">API Keys</p>
                          <p className="text-white font-semibold text-sm">{planKeys}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between py-4 border-t border-white/5">
          <p className="text-white/20 text-xs">URUS Market Intelligence API — Admin Panel</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
            <span className="text-white/20 text-xs">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}