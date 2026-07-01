import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Users,
  Zap,
  Calendar,
  TrendingUp,
  RefreshCw,
  BarChart2,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "x-factory-key": "factory2026",
  "Content-Type": "application/json",
};
const PAGE_SIZE = 20;

function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/20 border border-[#00D4AA]/40 text-[#00D4AA]"
              : "bg-red-500/20 border border-red-500/40 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{t.message}</span>
          <button onClick={() => remove(t.id)} className="ml-2 opacity-60 hover:opacity-100">
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
          <div className="h-4 bg-white/10 rounded-lg animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

function ProgressBar({ value, max, color = "#6C63FF" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isWarning = pct >= 80;
  const isDanger = pct >= 95;
  const barColor = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : color;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/60">{value?.toLocaleString() ?? 0} usadas</span>
        <span className="font-semibold" style={{ color: barColor }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor, boxShadow: `0 0 8px ${barColor}80` }}
        />
      </div>
      <div className="text-xs text-white/40 mt-1">Límite: {max?.toLocaleString() ?? "∞"}</div>
    </div>
  );
}

function PlanBadge({ plan }) {
  const map = {
    free: { color: "#6C63FF", label: "Free" },
    starter: { color: "#00D4AA", label: "Starter" },
    pro: { color: "#f59e0b", label: "Pro" },
    enterprise: { color: "#ec4899", label: "Enterprise" },
  };
  const p = map[plan?.toLowerCase()] || { color: "#6C63FF", label: plan || "—" };
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40` }}
    >
      {p.label}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        active
          ? "bg-[#00D4AA]/20 text-[#00D4AA] border border-[#00D4AA]/40"
          : "bg-red-500/20 text-red-400 border border-red-500/40"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function StatsCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-sm">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-white/40">{sub}</div>}
    </div>
  );
}

const EMPTY_FORM = {
  name: "",
  email: "",
  plan: "free",
  calls_used: 0,
  calls_limit: 1000,
  reset_date: "",
  active: true,
};

export default function OverviewDeUsoLlamadasConsumidasVsLmiteDelPlanConBarraDeProgresoFechaDeResetYPlanActivo() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const fetchClients = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error("Error al obtener clientes");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.data ?? []);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.plan?.toLowerCase().includes(q);
    const matchPlan = filterPlan === "all" || c.plan?.toLowerCase() === filterPlan;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && c.active) ||
      (filterStatus === "inactive" && !c.active);
    return matchSearch && matchPlan && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.active).length,
    totalCalls: clients.reduce((s, c) => s + (c.calls_used || 0), 0),
    avgUsage:
      clients.length > 0
        ? Math.round(
            clients.reduce((s, c) => {
              const pct = c.calls_limit > 0 ? (c.calls_used / c.calls_limit) * 100 : 0;
              return s + pct;
            }, 0) / clients.length
          )
        : 0,
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Nombre requerido";
    if (!form.email?.trim()) errs.email = "Email requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email inválido";
    if (form.calls_limit < 0) errs.calls_limit = "Debe ser >= 0";
    if (form.calls_used < 0) errs.calls_used = "Debe ser >= 0";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (client) => {
    setEditTarget(client);
    setForm({
      name: client.name || "",
      email: client.email || "",
      plan: client.plan || "free",
      calls_used: client.calls_used || 0,
      calls_limit: client.calls_limit || 1000,
      reset_date: client.reset_date ? client.reset_date.split("T")[0] : "",
      active: client.active ?? true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        calls_used: Number(form.calls_used),
        calls_limit: Number(form.calls_limit),
      };
      let res;
      if (editTarget) {
        res = await fetch(`${API_URL}/${editTarget.id}`, {
          method: "PUT",
          headers: HEADERS,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error(editTarget ? "Error al actualizar" : "Error al crear");
      addToast(editTarget ? "Cliente actualizado correctamente" : "Cliente creado correctamente");
      closeModal();
      fetchClients(true);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error("Error al eliminar cliente");
      addToast("Cliente eliminado correctamente");
      setDeleteConfirm(null);
      fetchClients(true);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (formErrors[field]) setFormErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      <Toast toasts={toasts} remove={removeToast} />

      {/* Header */}
      <div className="border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#6C63FF] to-[#00D4AA]">
              <BarChart2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Overview de Uso</h1>
              <p className="text-xs text-white/40 mt-0.5">Llamadas consumidas vs límite del plan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchClients(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={16} className={`text-white/60 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b52e8] transition-colors text-sm font-semibold"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nuevo Cliente</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={Users} label="Total Clientes" value={stats.total} color="#6C63FF" sub="Registrados" />
          <StatsCard icon={Zap} label="Clientes Activos" value={stats.active} color="#00D4AA" sub={`${stats.total - stats.active} inactivos`} />
          <StatsCard icon={TrendingUp} label="Llamadas Totales" value={stats.totalCalls.toLocaleString()} color="#f59e0b" sub="Consumidas en total" />
          <StatsCard icon={BarChart2} label="Uso Promedio" value={`${stats.avgUsage}%`} color="#ec4899" sub="Sobre todos los planes" />
        </div>

        {/* Filters */}
        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o plan..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#6C63FF]/60 transition-colors"
              />
            </div>
            <select
              value={filterPlan}
              onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6C63FF]/60 transition-colors"
            >
              <option value="all">Todos los planes</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6C63FF]/60 transition-colors"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          {(search || filterPlan !== "all" || filterStatus !== "all") && (
            <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
              <span>{filtered.length} resultado(s)</span>
              <button
                onClick={() => { setSearch(""); setFilterPlan("all"); setFilterStatus("all"); setPage(1); }}
                className="text-[#6C63FF] hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-left text-white/50 font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left text-white/50 font-medium">Plan Activo</th>
                  <th className="px-4 py-3 text-left text-white/50 font-medium hidden md:table-cell">Uso de API</th>
                  <th className="px-4 py-3 text-left text-white/50 font-medium hidden lg:table-cell">Reset</th>
                  <th className="px-4 py-3 text-left text-white/50 font-medium">Estado</th>
                  <th className="px-4 py-3 text-right text-white/50 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                          <Users size={28} className="text-white/20" />
                        </div>
                        <div>
                          <p className="text-white/40 font-medium">No hay clientes</p>
                          <p className="text-white/20 text-xs mt-1">Crea tu primer cliente para empezar</p>
                        </div>
                        <button
                          onClick={openCreate}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b52e8] transition-colors text-sm font-semibold"
                        >
                          <Plus size={16} /> Nuevo Cliente
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((client) => {
                    const pct = client.calls_limit > 0
                      ? Math.min((client.calls_used / client.calls_limit) * 100, 100)
                      : 0;
                    const isDanger = pct >= 95;
                    const isWarning = pct >= 80;
                    return (
                      <tr key={client.id} className="border-b border-white/5 hover:bg-white/3 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-white">{client.name || "—"}</div>
                          <div className="text-xs text-white/40 mt-0.5">{client.email || "—"}</div>
                        </td>
                        <td className="px-4 py-4">
                          <PlanBadge plan={client.plan} />
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell min-w-[200px]">
                          <ProgressBar value={client.calls_used} max={client.calls_limit} />
                          {isDanger && (
                            <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle size={11} /> Límite crítico
                            </span>
                          )}
                          {isWarning && !isDanger && (
                            <span className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                              <AlertCircle size={11} /> Cerca del límite
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          {client.reset_date ? (
                            <div className="flex items-center gap-1.5 text-white/60">
                              <Calendar size={13} className="text-[#6C63FF]" />
                              <span className="text-xs">
                                {new Date(client.reset_date).toLocaleDateString("es-ES", {
                                  day: "2-digit", month: "short", year: "numeric",
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-white/20 text-xs">Sin fecha</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge active={client.active} />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(client)}
                              className="p-1.5 rounded-lg bg-[#6C63FF]/20 hover:bg-[#6C63FF]/40 text-[#6C63FF] transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(client)}
                              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
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
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/40">
                Página {page} de {totalPages} — {filtered.length} registros
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        pg === page
                          ? "bg-[#6C63FF] text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1A1A2E] border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center">
                  {editTarget ? <Edit2 size={15} className="text-[#6C63FF]" /> : <Plus size={15} className="text-[#6C63FF]" />}
                </div>
                <h2 className="font-bold text-white">{editTarget ? "Editar Cliente" : "Nuevo Cliente"}</h2>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Nombre del cliente"
                  className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${
                    formErrors.name ? "border-red-500/60" : "border-white/10 focus:border-[#6C63FF]/60"
                  }`}
                />
                {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${
                    formErrors.email ? "border-red-500/60" : "border-white/10 focus:border-[#6C63FF]/60"
                  }`}
                />
                {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
              </div>

              {/* Plan */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Plan Activo</label>
                <select
                  value={form.plan}
                  onChange={(e) => handleFormChange("plan", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6C63FF]/60 transition-colors"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Calls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Llamadas Usadas</label>
                  <input
                    type="number"
                    min="0"
                    value={form.calls_used}
                    onChange={(e) => handleFormChange("calls_used", e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white focus:outline-none transition-colors ${
                      formErrors.calls_used ? "border-red-500/60" : "border-white/10 focus:border-[#6C63FF]/60"
                    }`}
                  />
                  {formErrors.calls_used && <p className="text-red-400 text-xs mt-1">{formErrors.calls_used}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Límite del Plan</label>
                  <input
                    type="number"
                    min="0"
                    value={form.calls_limit}
                    onChange={(e) => handleFormChange("calls_limit", e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white focus:outline-none transition-colors ${
                      formErrors.calls_limit ? "border-red-500/60" : "border-white/10 focus:border-[#6C63FF]/60"
                    }`}
                  />
                  {formErrors.calls_limit && <p className="text-red-400 text-xs mt-1">{formErrors.calls_limit}</p>}
                </div>
              </div>

              {/* Preview bar */}
              {(form.calls_used || form.calls_limit) && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/40 mb-2">Vista previa de uso</p>
                  <ProgressBar value={Number(form.calls_used)} max={Number(form.calls_limit)} />
                </div>
              )}

              {/* Reset date */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Fecha de Reset</label>
                <input
                  type="date"
                  value={form.reset_date}
                  onChange={(e) => handleFormChange("reset_date", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6C63FF]/60 transition-colors"
                />
              </div>

              {/* Active */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm font-medium text-white">Estado activo</p>
                  <p className="text-xs text-white/40">¿El cliente tiene acceso activo?</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFormChange("active", !form.active)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.active ? "bg-[#00D4AA]" : "bg-white/20"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.active ? "translate-x-7" : "translate-x-1"}`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5b52e8] disabled:opacity-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : editTarget ? (
                    <><Edit2 size={15} /> Actualizar</>
                  ) : (
                    <><Plus size={15} /> Crear Cliente</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Eliminar Cliente</h3>
                <p className="text-xs text-white/40">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-white/70 mb-6">
              ¿Estás seguro que deseas eliminar a{" "}
              <span className="text-white font-semibold">{deleteConfirm.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              >
                {deleting ? <RefreshCw size={15} className="animate-spin" /> : <><Trash2 size={15} /> Eliminar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}