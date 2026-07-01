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
  Package,
  RefreshCw,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/plans";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};

const FEATURES_LIST = [
  "scraping",
  "gap_analysis",
  "trend_snapshots",
  "integrations",
  "api_access",
  "multi_marketplace",
  "alerts",
  "export_csv",
  "export_pdf",
  "white_label",
];

const PAGE_SIZE = 20;

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-sm transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="text-sm flex-1 text-white/90">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
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
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/5 rounded-lg animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="w-20 h-20 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-[#6C63FF]" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        No hay planes aún
      </h3>
      <p className="text-white/40 text-sm mb-8 text-center max-w-xs">
        Comienza creando tu primer plan con sus límites y features habilitadas.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-semibold transition-all duration-200 shadow-lg shadow-[#6C63FF]/25"
      >
        <Plus className="w-4 h-4" />
        Crear primer plan
      </button>
    </div>
  );
}

function ConfirmModal({ open, onConfirm, onCancel, planName }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Eliminar plan</h3>
            <p className="text-white/40 text-xs">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-white/70 text-sm mb-6">
          ¿Estás seguro de que deseas eliminar el plan{" "}
          <span className="text-white font-semibold">"{planName}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all text-sm shadow-lg shadow-red-500/25"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price_monthly: "",
  price_yearly: "",
  max_api_requests_month: "",
  max_scraper_runs_month: "",
  max_marketplaces: "",
  max_integrations: "",
  max_apps: "",
  features_enabled: [],
  is_active: true,
};

function PlanModal({ open, onClose, onSave, initial, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              ...EMPTY_FORM,
              ...initial,
              features_enabled: Array.isArray(initial.features_enabled)
                ? initial.features_enabled
                : [],
              price_monthly: initial.price_monthly ?? "",
              price_yearly: initial.price_yearly ?? "",
              max_api_requests_month: initial.max_api_requests_month ?? "",
              max_scraper_runs_month: initial.max_scraper_runs_month ?? "",
              max_marketplaces: initial.max_marketplaces ?? "",
              max_integrations: initial.max_integrations ?? "",
              max_apps: initial.max_apps ?? "",
            }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (form.price_monthly === "" || isNaN(Number(form.price_monthly)))
      e.price_monthly = "Precio mensual inválido";
    if (form.max_api_requests_month === "" || isNaN(Number(form.max_api_requests_month)))
      e.max_api_requests_month = "Límite de requests inválido";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const payload = {
      ...form,
      price_monthly: Number(form.price_monthly),
      price_yearly: form.price_yearly !== "" ? Number(form.price_yearly) : null,
      max_api_requests_month: Number(form.max_api_requests_month),
      max_scraper_runs_month:
        form.max_scraper_runs_month !== ""
          ? Number(form.max_scraper_runs_month)
          : null,
      max_marketplaces:
        form.max_marketplaces !== "" ? Number(form.max_marketplaces) : null,
      max_integrations:
        form.max_integrations !== "" ? Number(form.max_integrations) : null,
      max_apps: form.max_apps !== "" ? Number(form.max_apps) : null,
    };
    onSave(payload);
  };

  const toggleFeature = (f) => {
    setForm((prev) => ({
      ...prev,
      features_enabled: prev.features_enabled.includes(f)
        ? prev.features_enabled.filter((x) => x !== f)
        : [...prev.features_enabled, f],
    }));
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => {
          setForm((p) => ({ ...p, [key]: e.target.value }));
          setErrors((p) => ({ ...p, [key]: undefined }));
        }}
        placeholder={placeholder}
        className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 transition-all ${
          errors[key]
            ? "border-red-500/50 focus:ring-red-500/30"
            : "border-white/10 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50"
        }`}
      />
      {errors[key] && (
        <p className="text-red-400 text-xs mt-1">{errors[key]}</p>
      )}
    </div>
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#0A0A0F] border-l border-white/10 w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0A0F]/95 backdrop-blur-sm border-b border-white/10 px-6 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-white">
              {initial ? "Editar plan" : "Nuevo plan"}
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              {initial
                ? "Modifica los límites y features"
                : "Define límites mensuales y features"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 flex flex-col gap-5">
          {/* Básicos */}
          <div className="space-y-4">
            <p className="text-xs text-[#6C63FF] font-semibold uppercase tracking-widest">
              Información básica
            </p>
            {field("Nombre del plan *", "name", "text", "ej. Pro, Enterprise...")}
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
                Descripción
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Descripción breve del plan..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50 transition-all resize-none"
              />
            </div>
          </div>

          {/* Precios */}
          <div className="space-y-4">
            <p className="text-xs text-[#00D4AA] font-semibold uppercase tracking-widest">
              Precios
            </p>
            <div className="grid grid-cols-2 gap-4">
              {field("Precio mensual (USD) *", "price_monthly", "number", "0")}
              {field("Precio anual (USD)", "price_yearly", "number", "0")}
            </div>
          </div>

          {/* Límites */}
          <div className="space-y-4">
            <p className="text-xs text-[#6C63FF] font-semibold uppercase tracking-widest">
              Límites mensuales
            </p>
            <div className="grid grid-cols-2 gap-4">
              {field(
                "Max API Requests *",
                "max_api_requests_month",
                "number",
                "10000"
              )}
              {field(
                "Max Scraper Runs",
                "max_scraper_runs_month",
                "number",
                "100"
              )}
              {field("Max Marketplaces", "max_marketplaces", "number", "5")}
              {field("Max Integraciones", "max_integrations", "number", "10")}
              {field("Max Apps", "max_apps", "number", "3")}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <p className="text-xs text-[#00D4AA] font-semibold uppercase tracking-widest">
              Features habilitadas
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FEATURES_LIST.map((f) => {
                const active = form.features_enabled.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      active
                        ? "bg-[#6C63FF]/15 border-[#6C63FF]/40 text-[#6C63FF]"
                        : "bg-white/3 border-white/8 text-white/40 hover:border-white/15 hover:text-white/60"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full border flex-shrink-0 transition-all ${
                        active
                          ? "bg-[#6C63FF] border-[#6C63FF]"
                          : "border-white/20"
                      }`}
                    />
                    {f.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/8">
            <div>
              <p className="text-sm text-white font-medium">Plan activo</p>
              <p className="text-xs text-white/40 mt-0.5">
                Los clientes podrán suscribirse
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, is_active: !p.is_active }))
              }
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                form.is_active ? "bg-[#00D4AA]" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                  form.is_active ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] disabled:opacity-50 text-white font-semibold transition-all text-sm shadow-lg shadow-[#6C63FF]/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>{initial ? "Guardar cambios" : "Crear plan"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GestionDePlanes() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) =>
    setToasts((p) => p.filter((t) => t.id !== id));

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: { "x-factory-key": "factory2026" },
      });
      if (!res.ok) throw new Error("Error al cargar planes");
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      addToast("No se pudieron cargar los planes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const filtered = plans.filter((p) => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && p.is_active) ||
      (filterActive === "inactive" && !p.is_active);
    return matchSearch && matchActive;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const isEdit = !!editingPlan;
      const url = isEdit ? `${API_URL}/${editingPlan.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      addToast(
        isEdit ? "Plan actualizado correctamente" : "Plan creado correctamente"
      );
      setModalOpen(false);
      setEditingPlan(null);
      fetchPlans();
    } catch {
      addToast("Error al guardar el plan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "x-factory-key": "factory2026" },
      });
      if (!res.ok) throw new Error();
      addToast("Plan eliminado correctamente");
      setDeleteTarget(null);
      fetchPlans();
    } catch {
      addToast("Error al eliminar el plan", "error");
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} removeToast={removeToast} />

      <ConfirmModal
        open={!!deleteTarget}
        planName={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <PlanModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSave}
        initial={editingPlan}
        loading={saving}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/15 border border-[#6C63FF]/25 flex items-center justify-center">
              <Package className="w-4 h-4 text-[#6C63FF]" />
            </div>
            <span className="text-xs text-white/30 uppercase tracking-widest font-medium">
              Panel Admin · URUS Market Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-3">
            Gestión de Planes
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            Crea, edita y elimina planes con límites mensuales y features
            habilitadas.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total planes",
              value: plans.length,
              color: "#6C63FF",
              icon: Package,
            },
            {
              label: "Activos",
              value: plans.filter((p) => p.is_active).length,
              color: "#00D4AA",
              icon: CheckCircle,
            },
            {
              label: "Inactivos",
              value: plans.filter((p) => !p.is_active).length,
              color: "#ff6b6b",
              icon: XCircle,
            },
            {
              label: "Filtrados",
              value: filtered.length,
              color: "#f59e0b",
              icon: Search,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#1A1A2E]/60 border border-white/8 rounded-2xl p-4 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${s.color}15`, border: `1px solid ${s.color}25` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/40">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre o descripción..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {["all", "active", "inactive"].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilterActive(f);
                  setPage(1);
                }}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  filterActive === f
                    ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/25"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20"
                }`}
              >
                {f === "all" ? "Todos" : f === "active" ? "Activos" : "Inactivos"}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchPlans}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-semibold text-sm transition-all shadow-lg shadow-[#6C63FF]/25 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Nuevo plan
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-[#1A1A2E]/40 border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/3">
                  {[
                    "Nombre",
                    "Precio / mes",
                    "API Requests",
                    "Scraper Runs",
                    "Features",
                    "Estado",
                    "Acciones",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap"
                    >
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
                      <EmptyState onNew={openNew} />
                    </td>
                  </tr>
                ) : (
                  paginated.map((plan) => (
                    <tr
                      key={plan.id}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-white group-hover:text-[#6C63FF] transition-colors">
                            {plan.name}
                          </p>
                          {plan.description && (
                            <p className="text-xs text-white/35 mt-0.5 max-w-[180px] truncate">
                              {plan.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[#00D4AA] font-bold">
                          ${plan.price_monthly ?? "—"}
                        </span>
                        {plan.price_yearly && (
                          <p className="text-xs text-white/30">
                            ${plan.price_yearly}/año
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-white/80">
                          {plan.max_api_requests_month?.toLocaleString() ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-white/80">
                          {plan.max_scraper_runs_month?.toLocaleString() ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {Array.isArray(plan.features_enabled) &&
                          plan.features_enabled.length > 0 ? (
                            <>
                              {plan.features_enabled.slice(0, 2).map((f) => (
                                <span
                                  key={f}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[#6C63FF]"
                                >
                                  {f.replace(/_/g, " ")}
                                </span>
                              ))}
                              {plan.features_enabled.length > 2 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-white/40">
                                  +{plan.features_enabled.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-white/25 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            plan.is_active
                              ? "bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20"
                              : "bg-white/5 text-white/40 border border-white/10"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              plan.is_active ? "bg-[#00D4AA]" : "bg-white/25"
                            }`}
                          />
                          {plan.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(plan)}
                            className="w-8 h-8 rounded-lg bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF] hover:bg-[#6C63FF]/20 transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(plan)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
            <div className="flex items-center justify-between px-4 py-4 border-t border-white/8 bg-white/2">
              <p className="text-xs text-white/40">
                Mostrando{" "}
                <span className="text-white/70">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                de{" "}
                <span className="text-white/70">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const pg = i + 1;
                  if (
                    pg === 1 ||
                    pg === totalPages ||
                    (pg >= page - 1 && pg <= page + 1)
                  ) {
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          pg === page
                            ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/25"
                            : "text-white/40 hover:text-white hover:bg-white/8"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  }
                  if (pg === page - 2 || pg === page + 2) {
                    return (
                      <span key={pg} className="text-white/20 text-xs px-1">
                        …
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
          URUS Market Intelligence API · Panel Admin
        </div>
      </div>
    </div>
  );
}