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
  XCircle,
  Zap,
  Shield,
  Building2,
  Star,
  ArrowRight,
  Check,
  AlertTriangle,
  Loader2,
  Users,
  BarChart2,
  Key,
  Globe,
  TrendingUp,
  Lock,
  Unlock,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

const PLAN_CONFIG = {
  basic: {
    label: "Básico",
    color: "#6C63FF",
    bg: "bg-[#6C63FF]/10",
    border: "border-[#6C63FF]/30",
    badge: "bg-[#6C63FF]/20 text-[#6C63FF]",
    icon: Zap,
    price: "$29",
    period: "/mes",
    limits: {
      api_calls: "1,000 / mes",
      marketplaces: "2",
      scraper_runs: "10 / mes",
      apps: "1",
      integrations: "2",
      gap_analysis: "Básico",
      trend_snapshots: "30 días",
      alerts: "10",
      team_members: "1",
      support: "Email",
    },
  },
  pro: {
    label: "Pro",
    color: "#00D4AA",
    bg: "bg-[#00D4AA]/10",
    border: "border-[#00D4AA]/30",
    badge: "bg-[#00D4AA]/20 text-[#00D4AA]",
    icon: Star,
    price: "$99",
    period: "/mes",
    popular: true,
    limits: {
      api_calls: "25,000 / mes",
      marketplaces: "10",
      scraper_runs: "100 / mes",
      apps: "5",
      integrations: "15",
      gap_analysis: "Avanzado",
      trend_snapshots: "90 días",
      alerts: "100",
      team_members: "5",
      support: "Prioritario",
    },
  },
  enterprise: {
    label: "Empresarial",
    color: "#F59E0B",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-400",
    icon: Building2,
    price: "$299",
    period: "/mes",
    limits: {
      api_calls: "Ilimitadas",
      marketplaces: "Ilimitados",
      scraper_runs: "Ilimitadas",
      apps: "Ilimitadas",
      integrations: "Ilimitadas",
      gap_analysis: "IA Premium",
      trend_snapshots: "365 días",
      alerts: "Ilimitadas",
      team_members: "Ilimitados",
      support: "Dedicado 24/7",
    },
  },
};

const FEATURES = [
  { key: "api_calls", label: "Llamadas API", icon: Key },
  { key: "marketplaces", label: "Marketplaces", icon: Globe },
  { key: "scraper_runs", label: "Scraper Runs", icon: TrendingUp },
  { key: "apps", label: "Apps", icon: BarChart2 },
  { key: "integrations", label: "Integraciones", icon: Shield },
  { key: "gap_analysis", label: "Gap Analysis", icon: BarChart2 },
  { key: "trend_snapshots", label: "Trend Snapshots", icon: TrendingUp },
  { key: "alerts", label: "Alertas", icon: AlertTriangle },
  { key: "team_members", label: "Miembros de equipo", icon: Users },
  { key: "support", label: "Soporte", icon: CheckCircle },
];

const PLAN_FEATURES_UNLOCKED = {
  basic: [
    "Dashboard básico",
    "API REST acceso",
    "Reportes básicos",
    "Exportar CSV",
  ],
  pro: [
    "Todo lo de Básico",
    "Dashboard avanzado",
    "Webhooks",
    "API completa",
    "Reportes personalizados",
    "Exportar Excel/PDF",
    "Acceso multi-app",
    "Historial 90 días",
  ],
  enterprise: [
    "Todo lo de Pro",
    "SLA garantizado",
    "IP dedicada",
    "Onboarding personalizado",
    "Manager de cuenta",
    "SSO/SAML",
    "Audit logs",
    "Custom integrations",
    "Datos históricos ilimitados",
    "Facturación personalizada",
  ],
};

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 min-w-[280px] ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <XCircle size={18} />
          )}
          <span className="text-sm font-medium">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="ml-auto">
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
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/5 rounded animate-pulse w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

function PlanBadge({ plan }) {
  const cfg = PLAN_CONFIG[plan?.toLowerCase()] || PLAN_CONFIG.basic;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}
    >
      <cfg.icon size={10} />
      {cfg.label || plan}
    </span>
  );
}

function ConfirmModal({ open, onConfirm, onCancel, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Confirmar acción</h3>
            <p className="text-white/50 text-sm">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ open, onClose, onSave, initial }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name: "",
    email: "",
    plan: "basic",
    status: "active",
    company: "",
    ...initial,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ name: "", email: "", plan: "basic", status: "active", company: "", ...initial });
    setErrors({});
  }, [initial, open]);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "El nombre es requerido";
    if (!form.email?.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email inválido";
    if (!form.plan) e.plan = "El plan es requerido";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">
            {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none focus:border-[#6C63FF] transition-colors text-sm ${errors.name ? "border-red-500/50" : "border-white/10"}`}
              placeholder="Nombre del cliente"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none focus:border-[#6C63FF] transition-colors text-sm ${errors.email ? "border-red-500/50" : "border-white/10"}`}
              placeholder="email@empresa.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Empresa</label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none focus:border-[#6C63FF] transition-colors text-sm"
              placeholder="Nombre de la empresa"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">Plan *</label>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
                className={`w-full bg-[#0A0A0F] border rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#6C63FF] transition-colors text-sm ${errors.plan ? "border-red-500/50" : "border-white/10"}`}
              >
                <option value="basic">Básico</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Empresarial</option>
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#6C63FF] transition-colors text-sm"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="trial">Trial</option>
              </select>
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B52EE] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlanComparison({ onSelectPlan, currentPlan }) {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <div className="bg-[#1A1A2E]/50 border border-white/5 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
          <ArrowRight size={16} className="text-[#6C63FF]" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Comparativa de Planes</h2>
          <p className="text-white/40 text-sm">Elige el plan que mejor se adapte a tu negocio</p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Object.entries(PLAN_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const isCurrentPlan = currentPlan?.toLowerCase() === key;
          return (
            <div
              key={key}
              className={`relative rounded-2xl border p-5 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${cfg.bg} ${cfg.border} ${cfg.popular ? "ring-2 ring-[#00D4AA]/40" : ""}`}
              onClick={() => onSelectPlan && onSelectPlan(key)}
            >
              {cfg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#00D4AA] text-[#0A0A0F] text-xs font-bold px-3 py-1 rounded-full">
                    MÁS POPULAR
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cfg.color}20` }}
                >
                  <Icon size={20} style={{ color: cfg.color }} />
                </div>
                {isCurrentPlan && (
                  <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                    Actual
                  </span>
                )}
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{cfg.label}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-white">{cfg.price}</span>
                <span className="text-white/40 text-sm">{cfg.period}</span>
              </div>
              <ul className="space-y-2 mb-5">
                {PLAN_FEATURES_UNLOCKED[key].slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check size={14} style={{ color: cfg.color }} />
                    <span className="text-white/70">{f}</span>
                  </li>
                ))}
                {PLAN_FEATURES_UNLOCKED[key].length > 4 && (
                  <li className="text-xs text-white/30 pl-5">
                    +{PLAN_FEATURES_UNLOCKED[key].length - 4} más...
                  </li>
                )}
              </ul>
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: isCurrentPlan ? `${cfg.color}20` : cfg.color,
                  color: isCurrentPlan ? cfg.color : "#0A0A0F",
                }}
              >
                {isCurrentPlan ? "Plan actual" : `Elegir ${cfg.label}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-white/40 font-medium w-1/4">Feature</th>
              {Object.entries(PLAN_CONFIG).map(([key, cfg]) => (
                <th key={key} className="text-center py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${cfg.badge}`}>
                    <cfg.icon size={10} /> {cfg.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <tr
                  key={feat.key}
                  className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  onMouseEnter={() => setSelectedFeature(feat.key)}
                  onMouseLeave={() => setSelectedFeature(null)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-white/30" />
                      <span className="text-white/60">{feat.label}</span>
                    </div>
                  </td>
                  {Object.entries(PLAN_CONFIG).map(([key, cfg]) => (
                    <td key={key} className="py-3 px-4 text-center">
                      <span
                        className="font-medium text-xs"
                        style={{ color: selectedFeature === feat.key ? cfg.color : undefined }}
                      >
                        <span className={selectedFeature === feat.key ? "" : "text-white/50"}>
                          {cfg.limits[feat.key]}
                        </span>
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UpgradeDePlanComparativaDePlanesBsicoproempresarialConLmitesYFeaturesDesbloqueadas() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showComparison, setShowComparison] = useState(true);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.data || []);
    } catch {
      addToast("Error al cargar clientes", "error");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q);
    const matchPlan = filterPlan === "all" || c.plan?.toLowerCase() === filterPlan;
    const matchStatus = filterStatus === "all" || c.status?.toLowerCase() === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = async (form) => {
    try {
      const isEdit = !!form.id;
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `${API_URL}/${form.id}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      addToast(isEdit ? "Cliente actualizado correctamente" : "Cliente creado correctamente");
      setModalOpen(false);
      setEditTarget(null);
      fetchClients();
    } catch {
      addToast("Error al guardar el cliente", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error();
      addToast("Cliente eliminado correctamente");
      setDeleteTarget(null);
      fetchClients();
    } catch {
      addToast("Error al eliminar el cliente", "error");
    }
  };

  const handleUpgradePlan = (plan, client) => {
    setEditTarget({ ...client, plan });
    setModalOpen(true);
    addToast(`Actualizando a plan ${PLAN_CONFIG[plan]?.label || plan}`, "success");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        open={!!deleteTarget}
        message={`¿Eliminar a "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ClientModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={editTarget}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
              <ArrowRight size={16} className="text-[#6C63FF]" />
            </div>
            <span className="text-[#6C63FF] text-sm font-semibold tracking-wide uppercase">
              Dashboard de Cliente
            </span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Upgrade de Plan
          </h1>
          <p className="text-white/40 text-base">
            Comparativa de planes Básico / Pro / Empresarial con límites y features desbloqueadas
          </p>
        </div>

        {/* Plan Comparison Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              showComparison
                ? "bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30"
                : "bg-white/5 text-white/50 border border-white/10"
            }`}
          >
            {showComparison ? <Unlock size={14} /> : <Lock size={14} />}
            {showComparison ? "Ocultar comparativa" : "Ver comparativa de planes"}
          </button>
        </div>

        {/* Plan Comparison */}
        {showComparison && (
          <PlanComparison
            onSelectPlan={(plan) => {
              if (editTarget) handleUpgradePlan(plan, editTarget);
            }}
            currentPlan={editTarget?.plan}
          />
        )}

        {/* Clients Section */}
        <div className="bg-[#1A1A2E]/50 border border-white/5 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Gestión de Clientes</h2>
                <p className="text-white/40 text-sm mt-0.5">
                  {filtered.length} cliente{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => { setEditTarget(null); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#6C63FF] hover:bg-[#5B52EE] text-white rounded-xl text-sm font-semibold transition-colors shrink-0"
              >
                <Plus size={16} />
                Nuevo Cliente
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Buscar por nombre, email o empresa..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 outline-none focus:border-[#6C63FF] transition-colors text-sm"
                />
              </div>
              <select
                value={filterPlan}
                onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
                className="bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-2.5 text-white/70 outline-none focus:border-[#6C63FF] text-sm"
              >
                <option value="all">Todos los planes</option>
                <option value="basic">Básico</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Empresarial</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-2.5 text-white/70 outline-none focus:border-[#6C63FF] text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="trial">Trial</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Empresa</th>
                  <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Estado</th>
                  <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Registrado</th>
                  <th className="text-right px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                          <Users size={32} className="text-white/20" />
                        </div>
                        <div>
                          <p className="text-white/50 font-medium mb-1">
                            {search || filterPlan !== "all" || filterStatus !== "all"
                              ? "No se encontraron clientes con esos filtros"
                              : "No hay clientes aún"}
                          </p>
                          <p className="text-white/25 text-sm">
                            {search || filterPlan !== "all" || filterStatus !== "all"
                              ? "Prueba ajustar los filtros de búsqueda"
                              : "Comienza creando tu primer cliente"}
                          </p>
                        </div>
                        {!search && filterPlan === "all" && filterStatus === "all" && (
                          <button
                            onClick={() => { setEditTarget(null); setModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#6C63FF]/20 hover:bg-[#6C63FF]/30 text-[#6C63FF] rounded-xl text-sm font-medium transition-colors"
                          >
                            <Plus size={14} />
                            Crear primer cliente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((client) => {
                    const statusColors = {
                      active: "text-[#00D4AA] bg-[#00D4AA]/10",
                      inactive: "text-red-400 bg-red-400/10",
                      trial: "text-yellow-400 bg-yellow-400/10",
                    };
                    const statusLabel = { active: "Activo", inactive: "Inactivo", trial: "Trial" };
                    return (
                      <tr key={client.id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center shrink-0">
                              <span className="text-[#6C63FF] text-xs font-bold">
                                {client.name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{client.name || "—"}</p>
                              <p className="text-white/40 text-xs">{client.email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-white/60 text-sm">{client.company || "—"}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <PlanBadge plan={client.plan} />
                            <button
                              onClick={() => { setEditTarget(client); setShowComparison(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6C63FF] hover:text-[#5B52EE]"
                              title="Cambiar plan"
                            >
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[client.status?.toLowerCase()] || "text-white/40 bg-white/5"}`}>
                            {statusLabel[client.status?.toLowerCase()] || client.status || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-white/40 text-xs">
                            {client.created_at
                              ? new Date(client.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditTarget(client); setModalOpen(true); }}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#6C63FF]/20 hover:text-[#6C63FF] text-white/40 flex items-center justify-center transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(client)}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 flex items-center justify-center transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
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
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-white/40 text-sm">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1
                        ? "bg-[#6C63FF] text-white"
                        : "bg-white/5 hover:bg-white/10 text-white/60"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Total Clientes", value: clients.length, color: "#6C63FF", icon: Users },
            { label: "Plan Básico", value: clients.filter((c) => c.plan?.toLowerCase() === "basic").length, color: "#6C63FF", icon: Zap },
            { label: "Plan Pro", value: clients.filter((c) => c.plan?.toLowerCase() === "pro").length, color: "#00D4AA", icon: Star },
            { label: "Empresarial", value: clients.filter((c) => c.plan?.toLowerCase() === "enterprise").length, color: "#F59E0B", icon: Building2 },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-[#1A1A2E]/50 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}20` }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">{loading ? "—" : stat.value}</p>
                  <p className="text-white/40 text-xs">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}