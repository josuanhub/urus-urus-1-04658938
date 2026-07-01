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
  Calendar,
  RefreshCw,
  Filter,
  CreditCard,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const PLANS_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/plans";
const HEADERS = { "x-factory-key": "factory2026", "Content-Type": "application/json" };
const PAGE_SIZE = 20;

const PLAN_OPTIONS = [
  { value: "free", label: "Free", color: "#6C63FF" },
  { value: "starter", label: "Starter", color: "#00D4AA" },
  { value: "professional", label: "Professional", color: "#F59E0B" },
  { value: "enterprise", label: "Enterprise", color: "#EF4444" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "suspended", label: "Suspendido" },
];

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-sm transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          )}
          <p className="text-sm flex-1">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
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
          <div className="h-4 bg-white/5 rounded-md animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

function PlanBadge({ plan }) {
  const opt = PLAN_OPTIONS.find((p) => p.value === plan?.toLowerCase()) || PLAN_OPTIONS[0];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${opt.color}20`, color: opt.color, border: `1px solid ${opt.color}40` }}
    >
      <CreditCard className="w-3 h-3" />
      {opt.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: { label: "Activo", class: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/30" },
    inactive: { label: "Inactivo", class: "bg-white/5 text-white/40 border-white/10" },
    suspended: { label: "Suspendido", class: "bg-red-500/10 text-red-400 border-red-500/30" },
  };
  const s = map[status?.toLowerCase()] || map.inactive;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${s.class}`}>
      {s.label}
    </span>
  );
}

function ConfirmModal({ onConfirm, onCancel, clientName }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-center text-lg mb-2">Eliminar cliente</h3>
        <p className="text-white/50 text-sm text-center mb-6">
          ¿Estás seguro de eliminar a <span className="text-white font-medium">{clientName}</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientForm({ initial, onSave, onClose, saving }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    plan: "free",
    status: "active",
    effective_date: today,
    phone: "",
    ...initial,
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "El nombre es requerido";
    if (!form.email?.trim()) e.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido";
    if (!form.plan) e.plan = "Selecciona un plan";
    if (!form.effective_date) e.effective_date = "La fecha de efecto es requerida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  const inputClass = (field) =>
    `w-full bg-[#0A0A0F] border rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all ${
      errors[field]
        ? "border-red-500/60 focus:border-red-500"
        : "border-white/10 focus:border-[#6C63FF]/60 focus:ring-1 focus:ring-[#6C63FF]/20"
    }`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-xl">
              {initial ? "Editar cliente" : "Nuevo cliente"}
            </h2>
            <p className="text-white/40 text-sm mt-0.5">
              {initial ? "Modifica los datos del cliente" : "Completa los datos para registrar un nuevo cliente"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Nombre *</label>
              <input className={inputClass("name")} placeholder="John Doe" value={form.name} onChange={(e) => set("name", e.target.value)} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Email *</label>
              <input className={inputClass("email")} placeholder="john@empresa.com" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Empresa</label>
              <input className={inputClass("company")} placeholder="ACME Corp" value={form.company} onChange={(e) => set("company", e.target.value)} />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Teléfono</label>
              <input className={inputClass("phone")} placeholder="+52 55 0000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>

          {/* Plan Assignment Section */}
          <div className="bg-[#6C63FF]/5 border border-[#6C63FF]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-[#6C63FF]" />
              <span className="text-[#6C63FF] text-sm font-semibold">Asignación de Plan</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">Plan *</label>
                <select
                  className={`${inputClass("plan")} cursor-pointer`}
                  value={form.plan}
                  onChange={(e) => set("plan", e.target.value)}
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value} className="bg-[#1A1A2E]">
                      {p.label}
                    </option>
                  ))}
                </select>
                {errors.plan && <p className="text-red-400 text-xs mt-1">{errors.plan}</p>}
              </div>
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Fecha de efecto *
                  </span>
                </label>
                <input
                  type="date"
                  className={inputClass("effective_date")}
                  value={form.effective_date}
                  onChange={(e) => set("effective_date", e.target.value)}
                />
                {errors.effective_date && <p className="text-red-400 text-xs mt-1">{errors.effective_date}</p>}
              </div>
            </div>
            {form.plan && form.effective_date && (
              <div className="mt-3 p-2.5 bg-[#6C63FF]/10 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#6C63FF] shrink-0" />
                <p className="text-[#6C63FF]/80 text-xs">
                  Plan <strong>{PLAN_OPTIONS.find(p => p.value === form.plan)?.label}</strong> efectivo desde{" "}
                  <strong>{new Date(form.effective_date + "T12:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">Estado</label>
            <select
              className={`${inputClass("status")} cursor-pointer`}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#1A1A2E]">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA)" }}
            >
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
              {saving ? "Guardando..." : initial ? "Guardar cambios" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AsignacionDePlanAClienteDropdownParaCambiarElPlanDeUnClienteConFechaDeEfecto() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | "create" | {client}
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

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
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.data || data.clients || []);
    } catch (err) {
      addToast("Error al cargar la lista de clientes", "error");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q);
    const matchPlan = !filterPlan || c.plan?.toLowerCase() === filterPlan;
    const matchStatus = !filterStatus || c.status?.toLowerCase() === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const handleSave = async (form) => {
    setSaving(true);
    const isEdit = modal && modal !== "create";
    try {
      const url = isEdit ? `${API_URL}/${modal.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      addToast(
        isEdit
          ? `Plan actualizado a ${PLAN_OPTIONS.find(p => p.value === form.plan)?.label} con efecto desde ${form.effective_date}`
          : "Cliente creado exitosamente",
        "success"
      );
      setModal(null);
      fetchClients();
    } catch {
      addToast(isEdit ? "Error al actualizar el cliente" : "Error al crear el cliente", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, { method: "DELETE", headers: HEADERS });
      if (!res.ok) throw new Error();
      addToast(`Cliente "${deleteTarget.name}" eliminado correctamente`, "success");
      setDeleteTarget(null);
      fetchClients();
    } catch {
      addToast("Error al eliminar el cliente", "error");
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status?.toLowerCase() === "active").length,
    enterprise: clients.filter((c) => c.plan?.toLowerCase() === "enterprise").length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      {deleteTarget && (
        <ConfirmModal
          clientName={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {modal && (
        <ClientForm
          initial={modal !== "create" ? modal : undefined}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg, #6C63FF20, #00D4AA20)" }}>
              <Users className="w-6 h-6" style={{ color: "#6C63FF" }} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Asignación de Plan a Cliente</h1>
              <p className="text-white/40 text-sm mt-0.5">Panel de Administración de Clientes · Cambio de plan con fecha de efecto</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total clientes", value: stats.total, color: "#6C63FF", icon: <Users className="w-5 h-5" /> },
            { label: "Clientes activos", value: stats.active, color: "#00D4AA", icon: <CheckCircle className="w-5 h-5" /> },
            { label: "Enterprise", value: stats.enterprise, color: "#F59E0B", icon: <CreditCard className="w-5 h-5" /> },
          ].map((s) => (
            <div key={s.label} className="bg-[#1A1A2E] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loading ? "—" : s.value}</p>
                <p className="text-white/40 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-[#1A1A2E] border border-white/5 rounded-2xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#6C63FF]/50 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all"
                placeholder="Buscar por nombre, email o empresa..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                className="bg-[#0A0A0F] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 outline-none focus:border-[#6C63FF]/50 cursor-pointer transition-all"
                value={filterPlan}
                onChange={(e) => { setFilterPlan(e.target.value); resetPage(); }}
              >
                <option value="">Todos los planes</option>
                {PLAN_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-[#1A1A2E]">{p.label}</option>
                ))}
              </select>
              <select
                className="bg-[#0A0A0F] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 outline-none focus:border-[#6C63FF]/50 cursor-pointer transition-all"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}
              >
                <option value="">Todos los estados</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#1A1A2E]">{s.label}</option>
                ))}
              </select>
              <button
                onClick={() => { setSearch(""); setFilterPlan(""); setFilterStatus(""); resetPage(); }}
                className="p-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                title="Limpiar filtros"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={fetchClients}
                className="p-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                title="Actualizar"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setModal("create")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA)" }}
              >
                <Plus className="w-4 h-4" />
                Nuevo cliente
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1A1A2E] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Cliente", "Email", "Empresa", "Plan", "Fecha efecto", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
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
                    <td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="p-4 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 mb-4">
                          <Users className="w-10 h-10 text-[#6C63FF]/60" />
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">
                          {search || filterPlan || filterStatus ? "Sin resultados" : "Sin clientes aún"}
                        </h3>
                        <p className="text-white/40 text-sm text-center max-w-sm mb-6">
                          {search || filterPlan || filterStatus
                            ? "Prueba ajustando los filtros de búsqueda"
                            : "Comienza registrando tu primer cliente en la plataforma"}
                        </p>
                        {!search && !filterPlan && !filterStatus && (
                          <button
                            onClick={() => setModal("create")}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA)" }}
                          >
                            <Plus className="w-4 h-4" />
                            Crear primer cliente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((client) => (
                    <tr key={client.id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: "linear-gradient(135deg, #6C63FF40, #00D4AA40)", color: "#6C63FF" }}>
                            {client.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-white text-sm font-medium whitespace-nowrap">{client.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-sm whitespace-nowrap">{client.email || "—"}</td>
                      <td className="px-4 py-3 text-white/60 text-sm whitespace-nowrap">{client.company || "—"}</td>
                      <td className="px-4 py-3"><PlanBadge plan={client.plan} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-white/50 text-sm whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          {client.effective_date
                            ? new Date(client.effective_date + "T12:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setModal(client)}
                            className="p-1.5 rounded-lg hover:bg-[#6C63FF]/20 text-white/40 hover:text-[#6C63FF] transition-colors"
                            title="Editar / Cambiar plan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(client)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
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
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} clientes
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      page === i + 1
                        ? "text-white"
                        : "text-white/40 hover:text-white hover:bg-white/5 border border-white/10"
                    }`}
                    style={page === i + 1 ? { background: "linear-gradient(135deg, #6C63FF, #00D4AA)" } : {}}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-6">
          URUS Market Intelligence API · Panel de Administración de Clientes
        </p>
      </div>
    </div>
  );
}