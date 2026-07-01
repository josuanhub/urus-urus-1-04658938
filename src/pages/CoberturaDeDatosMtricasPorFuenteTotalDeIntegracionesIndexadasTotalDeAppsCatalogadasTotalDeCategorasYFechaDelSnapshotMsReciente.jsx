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
  RefreshCw,
  Package,
  Database,
  Grid,
  Clock,
  Filter,
  ChevronDown,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/apps";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border border-[#00D4AA]/40 text-[#00D4AA]"
              : "bg-red-500/10 border border-red-500/40 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{t.message}</span>
          <button onClick={() => remove(t.id)} className="ml-2 opacity-70 hover:opacity-100">
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
          <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#1A1A2E] border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle size={22} className="text-red-400 flex-shrink-0" />
          <h3 className="text-white font-semibold">Confirmar acción</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 text-sm transition-colors font-medium"
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
  category: "",
  marketplace: "",
  status: "active",
  url: "",
  version: "",
  rating: "",
  reviews_count: "",
};

function AppModal({ app, onClose, onSaved, addToast }) {
  const isEdit = !!app?.id;
  const [form, setForm] = useState(isEdit ? { ...app } : { ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "El nombre es requerido";
    if (form.url && !/^https?:\/\//.test(form.url)) e.url = "URL inválida (debe iniciar con http/https)";
    if (form.rating && (isNaN(form.rating) || form.rating < 0 || form.rating > 5))
      e.rating = "Rating entre 0 y 5";
    return e;
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.rating) payload.rating = parseFloat(payload.rating);
      if (payload.reviews_count) payload.reviews_count = parseInt(payload.reviews_count);
      const res = await fetch(isEdit ? `${API_URL}/${app.id}` : API_URL, {
        method: isEdit ? "PUT" : "POST",
        headers: HEADERS,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar");
      addToast(isEdit ? "App actualizada correctamente" : "App creada correctamente", "success");
      onSaved();
    } catch {
      addToast("Error al guardar la app", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `w-full bg-[#0A0A0F] border rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 transition-colors ${
      errors[field]
        ? "border-red-500/60 focus:ring-red-500/40"
        : "border-white/10 focus:border-[#6C63FF]/60 focus:ring-[#6C63FF]/30"
    }`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex items-center justify-center">
              <Package size={16} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold">{isEdit ? "Editar App" : "Nueva App"}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Nombre *</label>
            <input className={inputCls("name")} value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Nombre de la app" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Descripción</label>
            <textarea className={inputCls("description") + " resize-none"} rows={3} value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Descripción breve..." />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Categoría</label>
            <input className={inputCls("category")} value={form.category} onChange={(e) => handleChange("category", e.target.value)} placeholder="ej. Productivity" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Marketplace</label>
            <input className={inputCls("marketplace")} value={form.marketplace} onChange={(e) => handleChange("marketplace", e.target.value)} placeholder="ej. Shopify, HubSpot" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Versión</label>
            <input className={inputCls("version")} value={form.version} onChange={(e) => handleChange("version", e.target.value)} placeholder="ej. 2.1.0" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Estado</label>
            <div className="relative">
              <select
                className={inputCls("status") + " appearance-none pr-8"}
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
                <option value="deprecated">Obsoleto</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Rating (0–5)</label>
            <input className={inputCls("rating")} type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => handleChange("rating", e.target.value)} placeholder="4.5" />
            {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Reviews</label>
            <input className={inputCls("reviews_count")} type="number" min="0" value={form.reviews_count} onChange={(e) => handleChange("reviews_count", e.target.value)} placeholder="1200" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">URL</label>
            <input className={inputCls("url")} value={form.url} onChange={(e) => handleChange("url", e.target.value)} placeholder="https://..." />
            {errors.url && <p className="text-red-400 text-xs mt-1">{errors.url}</p>}
          </div>
          <div className="sm:col-span-2 flex gap-3 justify-end pt-2 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <RefreshCw size={14} className="animate-spin" />}
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear App"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  active: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/30",
  inactive: "bg-white/5 text-white/40 border-white/10",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  deprecated: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function CoberturaDeDatosMtricasPorFuenteTotalDeIntegracionesIndexadasTotalDeAppsCatalogadasTotalDeCategorasYFechaDelSnapshotMsReciente() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMarketplace, setFilterMarketplace] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [deleting, setDeleting] = useState(null);

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setApps(Array.isArray(data) ? data : data.data || data.items || []);
    } catch {
      addToast("Error al cargar las apps", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: HEADERS });
      if (!res.ok) throw new Error();
      setApps((p) => p.filter((a) => a.id !== id));
      addToast("App eliminada correctamente", "success");
    } catch {
      addToast("Error al eliminar la app", "error");
    } finally {
      setDeleting(null);
      setConfirm(null);
    }
  };

  const filtered = apps.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.name?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      a.marketplace?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchMarket = !filterMarketplace || a.marketplace === filterMarketplace;
    return matchSearch && matchStatus && matchMarket;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const uniqueMarketplaces = [...new Set(apps.map((a) => a.marketplace).filter(Boolean))];
  const uniqueCategories = [...new Set(apps.map((a) => a.category).filter(Boolean))];

  const latestSnapshot = apps.reduce((acc, a) => {
    const d = a.updated_at || a.created_at;
    if (!acc || (d && d > acc)) return d;
    return acc;
  }, null);

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return d; }
  };

  const selectCls = "bg-[#0A0A0F] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-[#6C63FF]/60 appearance-none pr-7 cursor-pointer";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} remove={removeToast} />
      {confirm && (
        <ConfirmDialog
          message={`¿Eliminar la app "${confirm.name}"? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {modal !== undefined && modal !== null && (
        <AppModal
          app={modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchApps(); }}
          addToast={addToast}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#6C63FF] uppercase tracking-widest font-medium">Monitor de Salud del Scraper</span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-xs text-white/30 uppercase tracking-widest">Panel Admin Interno</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Cobertura de Datos
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Métricas por fuente — integraciones indexadas, apps catalogadas, categorías y snapshots
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <MetricCard icon={Package} label="Apps Catalogadas" value={apps.length} color="#6C63FF" />
          <MetricCard icon={Grid} label="Categorías Únicas" value={uniqueCategories.length} color="#00D4AA" />
          <MetricCard icon={Database} label="Marketplaces" value={uniqueMarketplaces.length} color="#6C63FF" />
          <MetricCard icon={Clock} label="Último Snapshot" value={formatDate(latestSnapshot)} color="#00D4AA" />
        </div>

        {/* Table Card */}
        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 sm:px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1">
              <div className="relative flex-1 sm:max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#6C63FF]/60 transition-colors"
                  placeholder="Buscar por nombre, categoría..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <select className={selectCls} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                    <option value="">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="pending">Pendiente</option>
                    <option value="deprecated">Obsoleto</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
                <div className="relative">
                  <select className={selectCls} value={filterMarketplace} onChange={(e) => { setFilterMarketplace(e.target.value); setPage(1); }}>
                    <option value="">Todos los markets</option>
                    {uniqueMarketplaces.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={fetchApps}
                className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
                title="Actualizar"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setModal({})}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Nueva App</span>
              </button>
            </div>
          </div>

          {/* Results info */}
          {!loading && (
            <div className="px-4 sm:px-6 py-2 border-b border-white/5">
              <p className="text-xs text-white/30">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                {(search || filterStatus || filterMarketplace) && " con filtros aplicados"}
              </p>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Nombre", "Categoría", "Marketplace", "Versión", "Rating", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-white/40 uppercase tracking-wider font-medium whitespace-nowrap">
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
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center">
                          <Package size={28} className="text-[#6C63FF]/50" />
                        </div>
                        <div>
                          <p className="text-white/50 font-medium">No hay apps registradas</p>
                          <p className="text-white/30 text-xs mt-1">
                            {search || filterStatus || filterMarketplace
                              ? "Intenta ajustar los filtros de búsqueda"
                              : "Crea tu primera app para comenzar a indexar datos"}
                          </p>
                        </div>
                        {!search && !filterStatus && !filterMarketplace && (
                          <button
                            onClick={() => setModal({})}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/40 text-[#6C63FF] text-sm font-medium hover:bg-[#6C63FF]/30 transition-colors"
                          >
                            <Plus size={15} />
                            Crear primera app
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium truncate max-w-[180px]">{app.name || "—"}</p>
                          {app.url && (
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6C63FF]/70 hover:text-[#6C63FF] text-xs truncate block max-w-[180px] transition-colors"
                            >
                              {app.url}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">{app.category || "—"}</td>
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">{app.marketplace || "—"}</td>
                      <td className="px-4 py-3 text-white/50 whitespace-nowrap font-mono text-xs">{app.version || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {app.rating != null ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-white/70 text-xs">{parseFloat(app.rating).toFixed(1)}</span>
                            {app.reviews_count && (
                              <span className="text-white/30 text-xs">({Number(app.reviews_count).toLocaleString()})</span>
                            )}
                          </div>
                        ) : <span className="text-white/30">—</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            STATUS_STYLES[app.status] || STATUS_STYLES.inactive
                          }`}
                        >
                          {app.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setModal(app)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setConfirm(app)}
                            disabled={deleting === app.id}
                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            {deleting === app.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
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
            <div className="px-4 sm:px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-white/30">
                Página {page} de {totalPages} — {filtered.length} apps
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let p;
                  if (totalPages <= 5) p = i + 1;
                  else if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        page === p
                          ? "bg-[#6C63FF] text-white border border-[#6C63FF]"
                          : "border border-white/10 text-white/50 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-white/20 text-xs mt-6">
          URUS Market Intelligence · Monitor de Salud del Scraper · Cobertura por fuente
        </p>
      </div>
    </div>
  );
}