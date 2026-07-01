import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Mail,
  Calendar,
  Activity,
  Shield,
  TrendingUp,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "x-factory-key": "factory2026",
  "Content-Type": "application/json",
};
const PAGE_SIZE = 20;

const EMPTY_FORM = {
  name: "",
  email: "",
  plan: "",
  calls_used_this_month: 0,
  calls_limit: 0,
  status: "active",
  created_at: "",
};

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
            <Check size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <span className="text-sm flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-70 hover:opacity-100">
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
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/5 rounded-lg animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
      <td className="px-4 py-4">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: { label: "Activo", cls: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20" },
    inactive: { label: "Inactivo", cls: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    suspended: { label: "Suspendido", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
    trial: { label: "Trial", cls: "bg-[#6C63FF]/10 text-[#6C63FF] border-[#6C63FF]/20" },
  };
  const s = map[status] || map.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

function UsageBar({ used, limit }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#00D4AA";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[60px]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">
        {used?.toLocaleString()}/{limit?.toLocaleString()}
      </span>
    </div>
  );
}

function ConfirmDialog({ open, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold">Confirmar eliminación</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ open, onClose, onSave, initialData, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
      setErrors({});
    }
  }, [open, initialData]);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "El nombre es requerido";
    if (!form.email?.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.plan?.trim()) e.plan = "El plan es requerido";
    if (form.calls_limit < 0) e.calls_limit = "Debe ser mayor o igual a 0";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((er) => { const n = { ...er }; delete n[k]; return n; });
  };

  if (!open) return null;

  const isEdit = !!initialData?.id;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1A2E] border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
              <Users size={16} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold">{isEdit ? "Editar cliente" : "Nuevo cliente"}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {[
            { label: "Nombre completo", key: "name", type: "text", placeholder: "John Doe" },
            { label: "Email", key: "email", type: "email", placeholder: "john@example.com" },
            { label: "Plan activo", key: "plan", type: "text", placeholder: "Pro, Starter, Enterprise..." },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key] || ""}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-[#0A0A0F] border rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors ${
                  errors[key] ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#6C63FF]/50"
                }`}
              />
              {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Llamadas usadas este mes</label>
              <input
                type="number"
                min="0"
                value={form.calls_used_this_month || 0}
                onChange={(e) => set("calls_used_this_month", Number(e.target.value))}
                className="w-full bg-[#0A0A0F] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Límite de llamadas</label>
              <input
                type="number"
                min="0"
                value={form.calls_limit || 0}
                onChange={(e) => set("calls_limit", Number(e.target.value))}
                className={`w-full bg-[#0A0A0F] border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors ${
                  errors.calls_limit ? "border-red-500/50" : "border-white/10 focus:border-[#6C63FF]/50"
                }`}
              />
              {errors.calls_limit && <p className="text-red-400 text-xs mt-1">{errors.calls_limit}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Estado de la cuenta</label>
            <select
              value={form.status || "active"}
              onChange={(e) => set("status", e.target.value)}
              className="w-full bg-[#0A0A0F] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors appearance-none"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
              <option value="trial">Trial</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
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

export default function ListaDeClientesTablaConNombreEmailPlanActivoLlamadasUsadasEsteMesLmiteEstadoDeLaCuentaYFechaDeCreacin() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const fetchClients = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || data.clients || [];
      setClients(list);
    } catch (err) {
      addToast("Error al cargar los clientes: " + err.message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const matchSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.plan?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const url = isEdit ? `${API_URL}/${form.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      addToast(isEdit ? "Cliente actualizado correctamente" : "Cliente creado correctamente");
      setModalOpen(false);
      setEditData(null);
      await fetchClients(true);
    } catch (err) {
      addToast("Error al guardar el cliente: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/${confirmDelete.id}`, { method: "DELETE", headers: HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      addToast("Cliente eliminado correctamente");
      setConfirmDelete(null);
      await fetchClients(true);
    } catch (err) {
      addToast("Error al eliminar el cliente: " + err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const openNew = () => { setEditData(null); setModalOpen(true); };
  const openEdit = (c) => { setEditData(c); setModalOpen(true); };

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    suspended: clients.filter((c) => c.status === "suspended").length,
    trial: clients.filter((c) => c.status === "trial").length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} removeToast={removeToast} />
      <ClientModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        initialData={editData}
        saving={saving}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        message={`¿Estás seguro de que deseas eliminar al cliente "${confirmDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#6C63FF] text-xs font-medium mb-1 uppercase tracking-wider">
              <Shield size={12} />
              Admin Interno
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Panel de Clientes</h1>
            <p className="text-gray-400 text-sm mt-1">Gestión completa de cuentas de clientes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchClients(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#6C63FF]/20"
            >
              <Plus size={16} />
              Nuevo cliente
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total clientes", value: stats.total, icon: Users, color: "#6C63FF" },
            { label: "Activos", value: stats.active, icon: Activity, color: "#00D4AA" },
            { label: "Trial", value: stats.trial, icon: TrendingUp, color: "#6C63FF" },
            { label: "Suspendidos", value: stats.suspended, icon: AlertCircle, color: "#ef4444" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#1A1A2E] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs">{label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={15} style={{ color }} />
                </div>
              </div>
              {loading ? (
                <div className="h-7 w-16 bg-white/5 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o plan..."
              className="w-full bg-[#1A1A2E] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1A1A2E] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors appearance-none min-w-[160px]"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
            <option value="trial">Trial</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#1A1A2E] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Cliente", "Email", "Plan activo", "Uso este mes", "Estado", "Fecha creación", "Acciones"].map((h) => (
                    <th key={h} className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : paginated.length === 0
                  ? null
                  : paginated.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors group"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(c.name || "?")[0].toUpperCase()}
                            </div>
                            <span className="text-white text-sm font-medium">{c.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Mail size={13} className="shrink-0" />
                            <span>{c.email || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#6C63FF]/10 text-[#6C63FF] text-xs font-medium border border-[#6C63FF]/20">
                            {c.plan || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4 min-w-[180px]">
                          <UsageBar
                            used={c.calls_used_this_month || 0}
                            limit={c.calls_limit || 0}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar size={13} className="shrink-0" />
                            <span>
                              {c.created_at
                                ? new Date(c.created_at).toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(c)}
                              className="p-2 rounded-lg bg-[#6C63FF]/10 text-[#6C63FF] hover:bg-[#6C63FF]/20 transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(c)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
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

          {/* Empty state */}
          {!loading && paginated.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 flex items-center justify-center mb-4">
                <Users size={28} className="text-[#6C63FF]" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {search || filterStatus !== "all" ? "Sin resultados" : "No hay clientes"}
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">
                {search || filterStatus !== "all"
                  ? "Prueba con otros términos de búsqueda o cambia los filtros."
                  : "Comienza agregando tu primer cliente al sistema."}
              </p>
              {search || filterStatus !== "all" ? (
                <button
                  onClick={() => { setSearch(""); setFilterStatus("all"); }}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition-colors"
                >
                  Limpiar filtros
                </button>
              ) : (
                <button
                  onClick={openNew}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Plus size={16} />
                  Agregar cliente
                </button>
              )}
            </div>
          )}

          {/* Footer / Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="border-t border-white/5 px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                Mostrando{" "}
                <span className="text-white font-medium">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                de <span className="text-white font-medium">{filtered.length}</span> clientes
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pg;
                      if (totalPages <= 7) pg = i + 1;
                      else if (page <= 4) pg = i + 1;
                      else if (page >= totalPages - 3) pg = totalPages - 6 + i;
                      else pg = page - 3 + i;
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            page === pg
                              ? "bg-[#6C63FF] text-white"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {pg}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}