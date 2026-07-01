import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Activity,
  TrendingUp,
  Zap,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BarChart2,
  Clock,
  Calendar,
} from "lucide-react";

const API_BASE = "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api";
const HEADERS = { "x-factory-key": "factory2026", "Content-Type": "application/json" };
const HEADERS_NO_CT = { "x-factory-key": "factory2026" };
const PAGE_SIZE = 20;

function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{t.message}</span>
          <button onClick={() => remove(t.id)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />;
}

function MetricCard({ icon: Icon, label, value, sub, color, loading }) {
  return (
    <div className="bg-[#1A1A2E] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center`} style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <span className="text-3xl font-bold text-white">{value}</span>
      )}
      {sub && !loading && <span className="text-xs text-white/30">{sub}</span>}
    </div>
  );
}

function DistributionBar({ data, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }
  if (!data || data.length === 0) return <p className="text-white/30 text-sm">Sin datos</p>;

  const total = data.reduce((s, d) => s + d.count, 0);
  const colors = ["#6C63FF", "#00D4AA", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/60 truncate max-w-[70%]">{d.endpoint}</span>
            <span className="text-white/40">{d.count} ({total ? Math.round((d.count / total) * 100) : 0}%)</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${total ? (d.count / total) * 100 : 0}%`, background: colors[i % colors.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfirmModal({ open, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold">Confirmar eliminación</h3>
        </div>
        <p className="text-white/50 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ open, onClose, onSave, initial, loading }) {
  const empty = { name: "", email: "", company: "", status: "active", plan: "", phone: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...empty, ...initial } : empty);
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Nombre requerido";
    if (!form.email?.trim()) e.email = "Email requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSave(form);
  };

  if (!open) return null;

  const Field = ({ label, name, type = "text", required, options }) => (
    <div>
      <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      {options ? (
        <select
          value={form[name] || ""}
          onChange={(e) => { setForm((p) => ({ ...p, [name]: e.target.value })); setErrors((p) => ({ ...p, [name]: "" })); }}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#6C63FF]/50 focus:bg-white/8 transition-all"
        >
          {options.map((o) => <option key={o.value} value={o.value} className="bg-[#1A1A2E]">{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={form[name] || ""}
          onChange={(e) => { setForm((p) => ({ ...p, [name]: e.target.value })); setErrors((p) => ({ ...p, [name]: "" })); }}
          className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:bg-white/8 transition-all ${errors[name] ? "border-red-500/50 focus:border-red-500/70" : "border-white/10 focus:border-[#6C63FF]/50"}`}
          placeholder={`Ingresa ${label.toLowerCase()}`}
        />
      )}
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0A0A0F] z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
              <Users size={18} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold">{initial ? "Editar cliente" : "Nuevo cliente"}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Nombre" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Empresa" name="company" />
          <Field label="Teléfono" name="phone" />
          <Field label="Plan" name="plan" />
          <Field
            label="Estado"
            name="status"
            options={[
              { value: "active", label: "Activo" },
              { value: "inactive", label: "Inactivo" },
              { value: "suspended", label: "Suspendido" },
            ]}
          />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-all">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {initial ? "Guardar cambios" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MetricasGlobales() {
  const [clients, setClients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ open: false, data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const res = await fetch(`${API_BASE}/clients`, { headers: HEADERS_NO_CT });
      const json = await res.json();
      setClients(Array.isArray(json) ? json : json.data || json.clients || []);
    } catch {
      addToast("Error al cargar clientes", "error");
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_BASE}/api_request_logs`, { headers: HEADERS_NO_CT });
      const json = await res.json();
      setLogs(Array.isArray(json) ? json : json.data || json.logs || []);
    } catch {
      // silently handle
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchLogs();
  }, [fetchClients, fetchLogs]);

  // Metrics computation
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const thisMonth = now.toISOString().slice(0, 7);

  const callsToday = logs.filter((l) => (l.created_at || l.timestamp || "").startsWith(todayStr)).length;
  const callsMonth = logs.filter((l) => (l.created_at || l.timestamp || "").startsWith(thisMonth)).length;
  const errors429 = logs.filter((l) => l.status_code === 429 || l.statusCode === 429 || l.response_status === 429).length;
  const errorRate = logs.length ? ((errors429 / logs.length) * 100).toFixed(1) : "0.0";

  const activeClients = clients.filter((c) => (c.status || "").toLowerCase() === "active").length;
  const inactiveClients = clients.filter((c) => (c.status || "").toLowerCase() !== "active").length;

  const endpointMap = {};
  logs.forEach((l) => {
    const ep = l.endpoint || l.path || l.url || "Desconocido";
    const short = ep.replace(/\/v1\/client\/[^/]+\/api/, "/api").slice(0, 40);
    endpointMap[short] = (endpointMap[short] || 0) + 1;
  });
  const endpointDist = Object.entries(endpointMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([endpoint, count]) => ({ endpoint, count }));

  // Filtered clients
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" ||
      (c.status || "").toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = !!modal.data;
      const url = isEdit ? `${API_BASE}/clients/${modal.data.id}` : `${API_BASE}/clients`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      addToast(isEdit ? "Cliente actualizado correctamente" : "Cliente creado correctamente");
      setModal({ open: false, data: null });
      fetchClients();
    } catch {
      addToast("Error al guardar cliente", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/clients/${confirm.id}`, { method: "DELETE", headers: HEADERS_NO_CT });
      if (!res.ok) throw new Error();
      addToast("Cliente eliminado correctamente");
      setConfirm({ open: false, id: null });
      fetchClients();
    } catch {
      addToast("Error al eliminar cliente", "error");
    } finally {
      setDeleting(false);
    }
  };

  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "active") return <span className="px-2 py-0.5 rounded-full text-xs bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20">Activo</span>;
    if (s === "suspended") return <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">Suspendido</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/40 border border-white/10">Inactivo</span>;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} remove={removeToast} />
      <ConfirmModal
        open={confirm.open}
        message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
        loading={deleting}
      />
      <ClientModal
        open={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        onSave={handleSave}
        initial={modal.data}
        loading={saving}
      />

      {/* Header */}
      <div className="border-b border-white/5 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#6C63FF] animate-pulse" />
              <span className="text-[#6C63FF] text-xs font-medium uppercase tracking-widest">Admin Panel</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Métricas Globales de la API</h1>
            <p className="text-white/30 text-sm mt-0.5">Panel de Administración de Clientes</p>
          </div>
          <button
            onClick={() => { fetchClients(); fetchLogs(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-all self-start sm:self-auto"
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Clock} label="Llamadas Hoy" value={callsToday.toLocaleString()} sub="Solicitudes del día" color="#6C63FF" loading={loadingLogs} />
          <MetricCard icon={Calendar} label="Llamadas Este Mes" value={callsMonth.toLocaleString()} sub={`Mes ${thisMonth}`} color="#00D4AA" loading={loadingLogs} />
          <MetricCard icon={Users} label="Activos / Inactivos" value={`${activeClients} / ${inactiveClients}`} sub={`${clients.length} total`} color="#6C63FF" loading={loadingClients} />
          <MetricCard icon={AlertTriangle} label="Tasa Error 429" value={`${errorRate}%`} sub={`${errors429} errores`} color={parseFloat(errorRate) > 5 ? "#EF4444" : "#F59E0B"} loading={loadingLogs} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Endpoint Distribution */}
          <div className="bg-[#1A1A2E] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                <BarChart2 size={18} className="text-[#6C63FF]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Distribución por Endpoint</h3>
                <p className="text-white/30 text-xs">Top endpoints más llamados</p>
              </div>
            </div>
            <DistributionBar data={endpointDist} loading={loadingLogs} />
          </div>

          {/* Clients Active/Inactive visual */}
          <div className="bg-[#1A1A2E] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center">
                <Activity size={18} className="text-[#00D4AA]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Estado de Clientes</h3>
                <p className="text-white/30 text-xs">Distribución activos vs inactivos</p>
              </div>
            </div>
            {loadingClients ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Activos", count: activeClients, color: "#00D4AA", bg: "#00D4AA18" },
                  { label: "Inactivos", count: inactiveClients, color: "#6C63FF", bg: "#6C63FF18" },
                  { label: "Total", count: clients.length, color: "#F59E0B", bg: "#F59E0B18" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: item.bg, border: `1px solid ${item.color}20` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                      <span className="text-white/70 text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-lg">{item.count}</span>
                      {clients.length > 0 && (
                        <span className="text-xs" style={{ color: item.color }}>
                          {Math.round((item.count / clients.length) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {/* Error rate bar */}
                <div className="mt-2 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/50 flex items-center gap-2"><Zap size={14} className="text-red-400" /> Tasa de error 429</span>
                    <span className="text-red-400 font-bold">{errorRate}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-red-500 transition-all duration-700" style={{ width: `${Math.min(parseFloat(errorRate), 100)}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-[#1A1A2E] border border-white/5 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center">
                <Users size={18} className="text-[#6C63FF]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Gestión de Clientes</h3>
                <p className="text-white/30 text-xs">{filtered.length} clientes encontrados</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/40 w-full sm:w-52 transition-all"
                />
              </div>
              {/* Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-[#6C63FF]/40 transition-all"
              >
                <option value="all" className="bg-[#1A1A2E]">Todos</option>
                <option value="active" className="bg-[#1A1A2E]">Activos</option>
                <option value="inactive" className="bg-[#1A1A2E]">Inactivos</option>
                <option value="suspended" className="bg-[#1A1A2E]">Suspendidos</option>
              </select>
              {/* New button */}
              <button
                onClick={() => setModal({ open: true, data: null })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium transition-all whitespace-nowrap"
              >
                <Plus size={15} />
                Nuevo
              </button>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            {loadingClients ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 flex items-center justify-center mb-4">
                  <Users size={28} className="text-[#6C63FF]/50" />
                </div>
                <h3 className="text-white/50 font-semibold mb-2">
                  {search || statusFilter !== "all" ? "Sin resultados" : "Sin clientes aún"}
                </h3>
                <p className="text-white/25 text-sm mb-6 max-w-xs">
                  {search || statusFilter !== "all"
                    ? "Intenta con otros filtros o términos de búsqueda"
                    : "Crea tu primer cliente para comenzar a gestionar el acceso a la API"}
                </p>
                {!search && statusFilter === "all" && (
                  <button
                    onClick={() => setModal({ open: true, data: null })}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium transition-all"
                  >
                    <Plus size={15} />
                    Crear primer cliente
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-xs text-white/30 uppercase tracking-widest font-medium">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs text-white/30 uppercase tracking-widest font-medium hidden md:table-cell">Empresa</th>
                    <th className="text-left px-4 py-3 text-xs text-white/30 uppercase tracking-widest font-medium hidden lg:table-cell">Plan</th>
                    <th className="text-left px-4 py-3 text-xs text-white/30 uppercase tracking-widest font-medium">Estado</th>
                    <th className="text-right px-6 py-3 text-xs text-white/30 uppercase tracking-widest font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/3">
                  {paginated.map((c) => (
                    <tr key={c.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF] text-xs font-bold uppercase shrink-0">
                            {(c.name || "?")[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{c.name || "—"}</p>
                            <p className="text-white/30 text-xs">{c.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-white/50 text-sm">{c.company || "—"}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-white/40 text-xs bg-white/5 px-2 py-1 rounded-lg">{c.plan || "—"}</span>
                      </td>
                      <td className="px-4 py-4">{statusBadge(c.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal({ open: true, data: c })}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#6C63FF]/20 text-white/40 hover:text-[#6C63FF] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setConfirm({ open: true, id: c.id })}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-white/30 text-xs">
                Página {page} de {totalPages} — {filtered.length} resultados
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        page === p
                          ? "bg-[#6C63FF] text-white"
                          : "border border-white/10 text-white/40 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-white/15 text-xs pb-4">
          <TrendingUp size={12} />
          <span>URUS Market Intelligence API — Admin Panel v1.0</span>
        </div>
      </div>
    </div>
  );
}