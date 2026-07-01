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
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  RefreshCw,
  Eye,
  Code2,
  Zap,
  Shield,
  Globe,
  BookOpen,
  Filter,
  Copy,
  ExternalLink,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "x-factory-key": "factory2026",
  "Content-Type": "application/json",
};
const PAGE_SIZE = 20;

const ENDPOINTS_DOC = [
  {
    method: "GET",
    path: "/api/clients",
    description: "Obtiene lista paginada de todos los clientes registrados.",
    plan: "Starter",
    planColor: "#00D4AA",
    params: [
      { name: "page", type: "integer", desc: "Número de página (default: 1)" },
      { name: "limit", type: "integer", desc: "Registros por página (default: 20)" },
      { name: "search", type: "string", desc: "Filtro por nombre o email" },
    ],
    response: `{ "data": [...], "total": 100, "page": 1 }`,
  },
  {
    method: "POST",
    path: "/api/clients",
    description: "Crea un nuevo cliente en el sistema.",
    plan: "Starter",
    planColor: "#00D4AA",
    params: [
      { name: "name", type: "string", desc: "Nombre completo del cliente (requerido)" },
      { name: "email", type: "string", desc: "Email único del cliente (requerido)" },
      { name: "plan", type: "string", desc: "Plan asignado: starter | pro | enterprise" },
      { name: "status", type: "string", desc: "Estado: active | inactive | suspended" },
    ],
    response: `{ "id": "uuid", "name": "...", "email": "...", "created_at": "..." }`,
  },
  {
    method: "GET",
    path: "/api/clients/:id",
    description: "Obtiene los detalles de un cliente específico por su ID.",
    plan: "Starter",
    planColor: "#00D4AA",
    params: [
      { name: "id", type: "uuid", desc: "Identificador único del cliente (path param)" },
    ],
    response: `{ "id": "uuid", "name": "...", "email": "...", "plan": "..." }`,
  },
  {
    method: "PUT",
    path: "/api/clients/:id",
    description: "Actualiza los datos de un cliente existente.",
    plan: "Pro",
    planColor: "#6C63FF",
    params: [
      { name: "id", type: "uuid", desc: "Identificador único (path param)" },
      { name: "name", type: "string", desc: "Nombre actualizado" },
      { name: "email", type: "string", desc: "Email actualizado" },
      { name: "status", type: "string", desc: "Nuevo estado" },
    ],
    response: `{ "id": "uuid", "updated": true, "updated_at": "..." }`,
  },
  {
    method: "DELETE",
    path: "/api/clients/:id",
    description: "Elimina permanentemente un cliente del sistema.",
    plan: "Enterprise",
    planColor: "#FF6B6B",
    params: [
      { name: "id", type: "uuid", desc: "Identificador único (path param)" },
    ],
    response: `{ "deleted": true, "id": "uuid" }`,
  },
  {
    method: "GET",
    path: "/api/plans",
    description: "Lista todos los planes disponibles con sus características.",
    plan: "Starter",
    planColor: "#00D4AA",
    params: [],
    response: `{ "plans": [{ "id": "...", "name": "...", "price": ... }] }`,
  },
  {
    method: "GET",
    path: "/api/api_keys",
    description: "Lista las API keys asociadas al cliente autenticado.",
    plan: "Pro",
    planColor: "#6C63FF",
    params: [
      { name: "client_id", type: "uuid", desc: "ID del cliente propietario" },
      { name: "active", type: "boolean", desc: "Filtrar solo keys activas" },
    ],
    response: `{ "keys": [{ "key": "...", "created_at": "...", "last_used": "..." }] }`,
  },
  {
    method: "GET",
    path: "/api/api_request_logs",
    description: "Logs de todas las solicitudes realizadas a la API.",
    plan: "Pro",
    planColor: "#6C63FF",
    params: [
      { name: "client_id", type: "uuid", desc: "Filtrar por cliente" },
      { name: "from", type: "datetime", desc: "Fecha inicio (ISO 8601)" },
      { name: "to", type: "datetime", desc: "Fecha fin (ISO 8601)" },
      { name: "status", type: "integer", desc: "Código HTTP de respuesta" },
    ],
    response: `{ "logs": [{ "id": "...", "method": "GET", "path": "...", "status": 200 }] }`,
  },
  {
    method: "GET",
    path: "/api/marketplaces",
    description: "Obtiene los marketplaces configurados para scraping.",
    plan: "Pro",
    planColor: "#6C63FF",
    params: [
      { name: "active", type: "boolean", desc: "Solo marketplaces activos" },
      { name: "country", type: "string", desc: "Filtrar por país (ISO 3166-1)" },
    ],
    response: `{ "marketplaces": [{ "id": "...", "name": "...", "url": "...", "country": "..." }] }`,
  },
  {
    method: "GET",
    path: "/api/scraper_runs",
    description: "Historial de ejecuciones del scraper por marketplace.",
    plan: "Pro",
    planColor: "#6C63FF",
    params: [
      { name: "marketplace_id", type: "uuid", desc: "Filtrar por marketplace" },
      { name: "status", type: "string", desc: "Estado: pending | running | completed | failed" },
    ],
    response: `{ "runs": [{ "id": "...", "status": "...", "started_at": "...", "records": 1500 }] }`,
  },
  {
    method: "GET",
    path: "/api/gap_analysis_results",
    description: "Resultados del análisis de brechas de mercado entre competidores.",
    plan: "Enterprise",
    planColor: "#FF6B6B",
    params: [
      { name: "category_id", type: "uuid", desc: "Filtrar por categoría de producto" },
      { name: "min_gap", type: "number", desc: "Brecha mínima de precio (%)" },
    ],
    response: `{ "results": [{ "product": "...", "gap_pct": 15.2, "opportunity": "high" }] }`,
  },
  {
    method: "GET",
    path: "/api/trend_snapshots",
    description: "Snapshots históricos de tendencias de precios y demanda.",
    plan: "Enterprise",
    planColor: "#FF6B6B",
    params: [
      { name: "product_id", type: "uuid", desc: "ID del producto" },
      { name: "interval", type: "string", desc: "Intervalo: daily | weekly | monthly" },
      { name: "from", type: "datetime", desc: "Fecha inicio" },
    ],
    response: `{ "snapshots": [{ "date": "...", "price": 99.99, "demand_index": 0.87 }] }`,
  },
];

const METHOD_COLORS = {
  GET: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/40" },
  POST: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/40" },
  PUT: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/40" },
  DELETE: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/40" },
  PATCH: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/40" },
};

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm transition-all duration-300 min-w-[280px] ${
            t.type === "success"
              ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-200"
              : "bg-red-900/90 border-red-500/50 text-red-200"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <XCircle size={16} className="text-red-400 shrink-0" />
          )}
          <span className="text-sm flex-1">{t.message}</span>
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
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-white/10 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonEndpoint() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="h-6 w-16 bg-white/10 rounded" />
        <div className="h-6 w-48 bg-white/10 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
      <div className="h-4 w-1/2 bg-white/10 rounded" />
    </div>
  );
}

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/20 flex items-center justify-center mb-4">
        <Users size={32} className="text-[#6C63FF]" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">No hay clientes aún</h3>
      <p className="text-white/40 text-sm mb-6 max-w-xs">
        Crea tu primer cliente para comenzar a gestionar accesos y explorar los endpoints disponibles.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA)" }}
      >
        <Plus size={16} />
        Crear primer cliente
      </button>
    </div>
  );
}

function DeleteModal({ client, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative rounded-2xl border border-red-500/30 bg-[#1A1A2E] p-6 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Eliminar cliente</h3>
          <p className="text-white/60 text-sm mb-6">
            ¿Estás seguro que deseas eliminar a{" "}
            <span className="text-white font-medium">{client?.name}</span>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ mode, client, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    name: client?.name || "",
    email: client?.email || "",
    plan: client?.plan || "starter",
    status: client?.status || "active",
    company: client?.company || "",
    phone: client?.phone || "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.email.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSave(form);
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setErrors((p) => ({ ...p, [key]: "" })); }}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-white text-sm placeholder-white/20 outline-none focus:ring-2 transition-all ${
          errors[key] ? "border-red-500/60 focus:ring-red-500/30" : "border-white/10 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/60"
        }`}
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl border border-white/10 bg-[#1A1A2E] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA)" }}>
              {mode === "edit" ? <Edit2 size={14} className="text-white" /> : <Plus size={14} className="text-white" />}
            </div>
            <h2 className="text-white font-bold text-base">
              {mode === "edit" ? "Editar cliente" : "Nuevo cliente"}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {field("Nombre completo *", "name", "text", "John Doe")}
          {field("Email *", "email", "email", "john@empresa.com")}
          {field("Empresa", "company", "text", "Acme Corp")}
          {field("Teléfono", "phone", "tel", "+1 234 567 890")}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/60 transition-all"
              >
                <option value="starter" className="bg-[#1A1A2E]">Starter</option>
                <option value="pro" className="bg-[#1A1A2E]">Pro</option>
                <option value="enterprise" className="bg-[#1A1A2E]">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/60 transition-all"
              >
                <option value="active" className="bg-[#1A1A2E]">Activo</option>
                <option value="inactive" className="bg-[#1A1A2E]">Inactivo</option>
                <option value="suspended" className="bg-[#1A1A2E]">Suspendido</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm font-medium transition-all">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA)" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : mode === "edit" ? <Edit2 size={16} /> : <Plus size={16} />}
              {mode === "edit" ? "Guardar cambios" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EndpointCard({ ep, expanded, onToggle }) {
  const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
  const [copied, setCopied] = useState(false);

  const copyPath = () => {
    navigator.clipboard.writeText(`https://www.urusverify.com/v1/client/{client_id}${ep.path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${expanded ? "border-[#6C63FF]/50 bg-[#6C63FF]/5" : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${mc.bg} ${mc.text} ${mc.border} shrink-0`}>
          {ep.method}
        </span>
        <code className="text-white/80 text-sm font-mono flex-1 truncate">{ep.path}</code>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
          style={{ background: `${ep.planColor}20`, color: ep.planColor, border: `1px solid ${ep.planColor}40` }}
        >
          {ep.plan}
        </span>
        <ChevronRight size={16} className={`text-white/40 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
          <p className="text-white/60 text-sm">{ep.description}</p>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/5 rounded-lg px-3 py-2 font-mono text-xs text-white/50 truncate">
              https://www.urusverify.com/v1/client/{"{"/* eslint-disable-line */}client_id{"}"}{ep.path}
            </div>
            <button
              onClick={copyPath}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all shrink-0"
              title="Copiar URL"
            >
              {copied ? <CheckCircle size={14} className="text-[#00D4AA]" /> : <Copy size={14} />}
            </button>
          </div>

          {ep.params.length > 0 && (
            <div>
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2">Parámetros</p>
              <div className="space-y-2">
                {ep.params.map((p) => (
                  <div key={p.name} className="flex gap-3 items-start text-sm bg-white/5 rounded-lg px-3 py-2">
                    <code className="text-[#6C63FF] font-mono text-xs shrink-0 mt-0.5">{p.name}</code>
                    <span className="text-white/30 text-xs shrink-0 mt-0.5">{p.type}</span>
                    <span className="text-white/50 text-xs">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2">Respuesta ejemplo</p>
            <pre className="bg-black/40 rounded-lg px-3 py-2.5 text-xs text-[#00D4AA] overflow-x-auto font-mono border border-white/10">
              {ep.response}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExploradorDeEndpoints() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [endpointSearch, setEndpointSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterPlanDoc, setFilterPlanDoc] = useState("");
  const [activeTab, setActiveTab] = useState("clients");

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setClients(Array.isArray(json) ? json : json.data || json.clients || []);
    } catch {
      addToast("Error al cargar clientes", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const matchSearch =
      !search ||
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase());
    const matchPlan = !filterPlan || (c.plan || "").toLowerCase() === filterPlan;
    const matchStatus = !filterStatus || (c.status || "").toLowerCase() === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filteredEndpoints = ENDPOINTS_DOC.filter((ep) => {
    const matchSearch =
      !endpointSearch ||
      ep.path.toLowerCase().includes(endpointSearch.toLowerCase()) ||
      ep.description.toLowerCase().includes(endpointSearch.toLowerCase());
    const matchMethod = !filterMethod || ep.method === filterMethod;
    const matchPlan = !filterPlanDoc || ep.plan.toLowerCase() === filterPlanDoc.toLowerCase();
    return matchSearch && matchMethod && matchPlan;
  });

  const handleCreate = async (form) => {
    setActionLoading(true);
    try {
      const res = await fetch(API_URL, { method: "POST", headers: HEADERS, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      addToast("Cliente creado exitosamente", "success");
      setModal(null);
      fetchClients();
    } catch {
      addToast("Error al crear cliente", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/${modal.client.id}`, { method: "PUT", headers: HEADERS, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      addToast("Cliente actualizado correctamente", "success");
      setModal(null);
      fetchClients();
    } catch {
      addToast("Error al actualizar cliente", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, { method: "DELETE", headers: HEADERS });
      if (!res.ok) throw new Error();
      addToast("Cliente eliminado", "success");
      setDeleteTarget(null);
      fetchClients();
    } catch {
      addToast("Error al eliminar cliente", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (s) => {
    const map = {
      active: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      inactive: "bg-white/10 text-white/50 border border-white/20",
      suspended: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    return map[s?.toLowerCase()] || map.inactive;
  };

  const planBadge = (p) => {
    const map = {
      starter: "bg-[#00D4AA]/20 text-[#00D4AA] border border-[#00D4AA]/30",
      pro: "bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30",
      enterprise: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    };
    return map[p?.toLowerCase()] || "bg-white/10 text-white/50 border border-white/20";
  };

  return (
    <div className="min-h-screen text-white" style={{ background: "#0A0A0F" }}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {modal && (
        <ClientModal
          mode={modal.mode}
          client={modal.client}
          onClose={() => setModal(null)}
          onSave={modal.mode === "edit" ? handleEdit : handleCreate}
          loading={actionLoading}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          client={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA)" }}
              >
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Explorador de Endpoints</h1>
                <p className="text-white/40 text-sm">Documentación interactiva · Acceso según plan</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5">
              <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
              <span className="text-xs text-white/50">API activa</span>
            </div>
            <button
              onClick={fetchClients}
              disabled={loading}
              className="p-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Endpoints totales", value: ENDPOINTS_DOC.length, icon: <Code2 size={16} />, color: "#6C63FF" },
            { label: "Plan Starter", value: ENDPOINTS_DOC.filter(e => e.plan === "Starter").length, icon: <Zap size={16} />, color: "#00D4AA" },
            { label: "Plan Pro", value: ENDPOINTS_DOC.filter(e => e.plan === "Pro").length, icon: <Shield size={16} />, color: "#6C63FF" },
            { label: "Plan Enterprise", value: ENDPOINTS_DOC.filter(e => e.plan === "Enterprise").length, icon: <Globe size={16} />, color: "#FF6B6B" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/3 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}20`, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/40">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
          {[
            { key: "endpoints", label: "Endpoints Docs", icon: <BookOpen size={14} /> },
            { key: "clients", label: "Gestión de Clientes", icon: <Users size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
              style={activeTab === tab.key ? { background: "linear-gradient(135deg, #6C63FF, #00D4AA)" } : {}}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ENDPOINTS TAB */}
        {activeTab === "endpoints" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#1A1A2E]/50 p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={endpointSearch}
                    onChange={(e) => setEndpointSearch(e.target.value)}
                    placeholder="Buscar endpoints..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/60 transition-all"
                  />
                </div>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/40 transition-all"
                >
                  <option value="" className="bg-[#1A1A2E]">Todos los métodos</option>
                  {["GET", "POST", "PUT", "DELETE"].map((m) => (
                    <option key={m} value={m} className="bg-[#1A1A2E]">{m}</option>
                  ))}
                </select>
                <select
                  value={filterPlanDoc}
                  onChange={(e) => setFilterPlanDoc(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/40 transition-all"
                >
                  <option value="" className="bg-[#1A1A2E]">Todos los planes</option>
                  {["Starter", "Pro", "Enterprise"].map((p) => (
                    <option key={p} value={p} className="bg-[#1A1A2E]">{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {loading
                  ? [...Array(4)].map((_, i) => <SkeletonEndpoint key={i} />)
                  : filteredEndpoints.length === 0
                  ? (
                    <div className="text-center py-12 text-white/30">
                      <Code2 size={32} className="mx-auto mb-3 opacity-40" />
                      <p>No se encontraron endpoints</p>
                    </div>
                  )
                  : filteredEndpoints.map((ep) => (
                    <EndpointCard
                      key={ep.path + ep.method}
                      ep={ep}
                      expanded={expandedEndpoint === ep.path + ep.method}
                      onToggle={() => setExpandedEndpoint(expandedEndpoint === ep.path + ep.method ? null : ep.path + ep.method)}
                    />
                  ))}
              </div>
            </div>

            {/* Auth info box */}
            <div className="rounded-2xl border border-[#6C63FF]/30 bg-[#6C63FF]/5 p-5">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-[#6C63FF] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Autenticación requerida</h3>
                  <p className="text-white/50 text-sm mb-3">
                    Todos los endpoints requieren el header <code className="text-[#6C63FF] bg-[#6C63FF]/10 px-1.5 py-0.5 rounded text-xs">x-factory-key</code> con tu clave de API válida.
                  </p>
                  <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-[#00D4AA] border border-white/10">
                    {`curl -H "x-factory-key: YOUR_API_KEY" \\\n  https://www.urusverify.com/v1/client/{id}/api/clients`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS TAB */}
        {activeTab === "clients" && (
          <div className="rounded-2xl border border-white/10 bg-[#1A1A2E]/50 overflow-hidden">
            {/* Table header controls */}
            <div className="p-4 md:p-5 border-b border-white/10">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Buscar por nombre, email o empresa..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/60 transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                    <Filter size={13} className="text-white/30" />
                    <select
                      value={filterPlan}
                      onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
                      className="bg-transparent text-white/70 text-sm outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[#1A1A2E]">Plan</option>
                      <option value="starter" className="bg-[#1A1A2E]">Starter</option>
                      <option value="pro" className="bg-[#1A1A2E]">Pro</option>
                      <option value="enterprise" className="bg-[#1A1A2E]">Enterprise</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                    <Filter size={13} className="text-white/30" />
                    <select
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                      className="bg-transparent text-white/70 text-sm outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[#1A1A2E]">Estado</option>
                      <option value="active" className="bg-[#1A1A2E]">Activo</option>
                      <option value="inactive" className="bg-[#1A1A2E]">Inactivo</option>
                      <option value="suspended" className="bg-[#1A1A2E]">Suspendido</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setModal({ mode: "create" })}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95 shrink-0"
                    style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA)" }}
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Nuevo</span>
                  </button>
                </div>
              </div>

              {(search || filterPlan || filterStatus) && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-xs text-white/40">{filtered.length} resultado(s)</span>
                  <button
                    onClick={() => { setSearch(""); setFilterPlan(""); setFilterStatus(""); setPage(1); }}
                    className="text-xs text-[#6C63FF] hover:text-[#00D4AA] transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            {loading ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Nombre", "Email", "Plan", "Estado", "Acciones"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                  </tbody>
                </table>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState onNew={() => setModal({ mode: "create" })} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        {["Cliente", "Email", "Empresa", "Plan", "Estado", "Acciones"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((c, i) => (
                        <tr
                          key={c.id || i}
                          className="border-b border-white/5 hover:bg-white/3 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                                style={{ background: "linear-gradient(135deg, #6C63FF40, #00D4AA40)", border: "1px solid #6C63FF30" }}
                              >
                                {(c.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white text-sm font-medium truncate max-w-[140px]">{c.name || "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white/50 text-sm">{c.email || "—"}</td>
                          <td className="px-4 py-3 text-white/40 text-sm">{c.company || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${planBadge(c.plan)}`}>
                              {c.plan || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(c.status)}`}>
                              {c.status || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setModal({ mode: "view", client: c })}
                                className="p-1.5 rounded-lg text-white/40 hover:text-[#00D4AA] hover:bg-[#00D4AA]/10 transition-all"
                                title="Ver detalles"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => setModal({ mode: "edit", client: c })}
                                className="p-1.5 rounded-lg text-white/40 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-all"
                                title="Editar"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(c)}
                                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                    <p className="text-xs text-white/30">
                      {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                            page === i + 1
                              ? "text-white"
                              : "text-white/40 hover:text-white border border-white/10 hover:border-white/30"
                          }`}
                          style={page === i + 1 ? { background: "linear-gradient(135deg, #6C63FF, #00D4AA)" } : {}}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-white/20">URUS Market Intelligence API · v1</p>
          <a
            href="https://www.urusverify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-white/20 hover:text-[#6C63FF] transition-colors"
          >
            <ExternalLink size={11} />
            urusverify.com
          </a>
        </div>
      </div>
    </div>
  );
}