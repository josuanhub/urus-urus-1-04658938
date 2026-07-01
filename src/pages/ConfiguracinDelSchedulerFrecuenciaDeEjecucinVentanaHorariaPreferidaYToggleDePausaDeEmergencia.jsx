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
  Calendar,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  Zap,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

const FREQ_OPTIONS = [
  { value: "15m", label: "Cada 15 minutos" },
  { value: "30m", label: "Cada 30 minutos" },
  { value: "1h", label: "Cada hora" },
  { value: "3h", label: "Cada 3 horas" },
  { value: "6h", label: "Cada 6 horas" },
  { value: "12h", label: "Cada 12 horas" },
  { value: "24h", label: "Cada 24 horas" },
];

const defaultForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "active",
  scheduler_frequency: "1h",
  scheduler_window_start: "08:00",
  scheduler_window_end: "20:00",
  scheduler_paused: false,
  plan: "basic",
  notes: "",
};

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#0d1f1a] border-[#00D4AA]/40 text-[#00D4AA]"
              : "bg-[#1f0d0d] border-red-500/40 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <XCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <span className="text-sm flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="ml-2 opacity-60 hover:opacity-100">
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
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
        </td>
      ))}
    </tr>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm bg-red-500/80 hover:bg-red-500 text-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, editData, loading }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        ...defaultForm,
        ...editData,
        scheduler_paused: editData.scheduler_paused || false,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editData, open]);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "El nombre es obligatorio";
    if (!form.email?.trim()) e.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email inválido";
    if (!form.scheduler_window_start) e.scheduler_window_start = "Requerido";
    if (!form.scheduler_window_end) e.scheduler_window_end = "Requerido";
    if (
      form.scheduler_window_start &&
      form.scheduler_window_end &&
      form.scheduler_window_start >= form.scheduler_window_end
    ) {
      e.scheduler_window_end = "La hora de fin debe ser mayor al inicio";
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  const field = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg bg-[#0A0A0F] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1A1A2E]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6C63FF]/10 rounded-lg">
              <Settings size={18} className="text-[#6C63FF]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">
                {editData ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <p className="text-white/40 text-xs">Scheduler & configuración</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Info básica */}
          <div>
            <p className="text-[#6C63FF] text-xs font-semibold uppercase tracking-widest mb-3">
              Información básica
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-xs mb-1 block">
                  Nombre *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => field("name", e.target.value)}
                  placeholder="Nombre del cliente"
                  className={`w-full bg-white/5 border ${
                    errors.name ? "border-red-500/60" : "border-white/10"
                  } rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/60 transition-all`}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1 block">
                  Email *
                </label>
                <input
                  value={form.email}
                  onChange={(e) => field("email", e.target.value)}
                  placeholder="email@empresa.com"
                  type="email"
                  className={`w-full bg-white/5 border ${
                    errors.email ? "border-red-500/60" : "border-white/10"
                  } rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/60 transition-all`}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs mb-1 block">
                    Teléfono
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => field("phone", e.target.value)}
                    placeholder="+1 234 567 890"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/60 transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1 block">
                    Empresa
                  </label>
                  <input
                    value={form.company}
                    onChange={(e) => field("company", e.target.value)}
                    placeholder="Empresa S.A."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/60 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs mb-1 block">
                    Estado
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => field("status", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/60 transition-all"
                  >
                    <option value="active" className="bg-[#1A1A2E]">Activo</option>
                    <option value="inactive" className="bg-[#1A1A2E]">Inactivo</option>
                    <option value="suspended" className="bg-[#1A1A2E]">Suspendido</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1 block">
                    Plan
                  </label>
                  <select
                    value={form.plan}
                    onChange={(e) => field("plan", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/60 transition-all"
                  >
                    <option value="basic" className="bg-[#1A1A2E]">Basic</option>
                    <option value="pro" className="bg-[#1A1A2E]">Pro</option>
                    <option value="enterprise" className="bg-[#1A1A2E]">Enterprise</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Scheduler config */}
          <div className="border-t border-white/5 pt-5">
            <p className="text-[#00D4AA] text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap size={12} />
              Configuración del Scheduler
            </p>

            <div className="space-y-4">
              {/* Frecuencia */}
              <div>
                <label className="text-white/60 text-xs mb-1 block flex items-center gap-1.5">
                  <Clock size={11} />
                  Frecuencia de ejecución
                </label>
                <select
                  value={form.scheduler_frequency}
                  onChange={(e) => field("scheduler_frequency", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4AA]/60 transition-all"
                >
                  {FREQ_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#1A1A2E]">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ventana horaria */}
              <div>
                <label className="text-white/60 text-xs mb-2 block flex items-center gap-1.5">
                  <Calendar size={11} />
                  Ventana horaria preferida
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/30 text-xs mb-1 block">
                      Inicio
                    </label>
                    <input
                      type="time"
                      value={form.scheduler_window_start}
                      onChange={(e) =>
                        field("scheduler_window_start", e.target.value)
                      }
                      className={`w-full bg-white/5 border ${
                        errors.scheduler_window_start
                          ? "border-red-500/60"
                          : "border-white/10"
                      } rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4AA]/60 transition-all`}
                    />
                    {errors.scheduler_window_start && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.scheduler_window_start}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-white/30 text-xs mb-1 block">
                      Fin
                    </label>
                    <input
                      type="time"
                      value={form.scheduler_window_end}
                      onChange={(e) =>
                        field("scheduler_window_end", e.target.value)
                      }
                      className={`w-full bg-white/5 border ${
                        errors.scheduler_window_end
                          ? "border-red-500/60"
                          : "border-white/10"
                      } rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4AA]/60 transition-all`}
                    />
                    {errors.scheduler_window_end && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.scheduler_window_end}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 px-3 py-2 bg-[#00D4AA]/5 border border-[#00D4AA]/10 rounded-lg">
                  <p className="text-[#00D4AA]/70 text-xs">
                    El scraper solo ejecutará dentro de esta ventana horaria
                  </p>
                </div>
              </div>

              {/* Pausa de emergencia */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  form.scheduler_paused
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-white/3 border-white/10"
                }`}
              >
                <div>
                  <p className="text-white text-sm font-medium flex items-center gap-2">
                    {form.scheduler_paused ? (
                      <AlertTriangle size={14} className="text-red-400" />
                    ) : (
                      <CheckCircle size={14} className="text-[#00D4AA]" />
                    )}
                    Pausa de emergencia
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {form.scheduler_paused
                      ? "⚠ Scraper detenido completamente"
                      : "Scraper activo y ejecutando"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    field("scheduler_paused", !form.scheduler_paused)
                  }
                  className="focus:outline-none transition-all"
                >
                  {form.scheduler_paused ? (
                    <ToggleRight size={36} className="text-red-400" />
                  ) : (
                    <ToggleLeft size={36} className="text-white/20" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="border-t border-white/5 pt-4">
            <label className="text-white/60 text-xs mb-1 block">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => field("notes", e.target.value)}
              placeholder="Notas internas sobre este cliente..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/60 transition-all resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#1A1A2E] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {editData ? "Guardar cambios" : "Crear cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfiguracionDelScheduler() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pausedFilter, setPausedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const fetchClients = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error("Error al obtener clientes");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      addToast("Error al cargar clientes: " + err.message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = !!editData?.id;
      const url = isEdit ? `${API_URL}/${editData.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al guardar");
      addToast(
        isEdit ? "Cliente actualizado correctamente" : "Cliente creado exitosamente",
        "success"
      );
      setModalOpen(false);
      setEditData(null);
      await fetchClients(true);
    } catch (err) {
      addToast("Error al guardar: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/${confirmDelete.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error("Error al eliminar");
      addToast("Cliente eliminado correctamente", "success");
      setConfirmDelete(null);
      await fetchClients(true);
    } catch (err) {
      addToast("Error al eliminar: " + err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePause = async (client) => {
    try {
      const res = await fetch(`${API_URL}/${client.id}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify({
          ...client,
          scheduler_paused: !client.scheduler_paused,
        }),
      });
      if (!res.ok) throw new Error();
      addToast(
        !client.scheduler_paused
          ? "⚠ Pausa de emergencia activada"
          : "✓ Scraper reactivado",
        !client.scheduler_paused ? "error" : "success"
      );
      await fetchClients(true);
    } catch {
      addToast("Error al cambiar estado de pausa", "error");
    }
  };

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || c.status === statusFilter;
    const matchPaused =
      pausedFilter === "all" ||
      (pausedFilter === "paused" ? c.scheduler_paused : !c.scheduler_paused);
    return matchSearch && matchStatus && matchPaused;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const freqLabel = (v) =>
    FREQ_OPTIONS.find((o) => o.value === v)?.label || v || "—";

  const statusBadge = (status) => {
    const map = {
      active: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20",
      inactive: "bg-white/5 text-white/40 border-white/10",
      suspended: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    const labels = { active: "Activo", inactive: "Inactivo", suspended: "Suspendido" };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
          map[status] || "bg-white/5 text-white/40 border-white/10"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} removeToast={removeToast} />

      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSave={handleSave}
        editData={editData}
        loading={saving}
      />

      <ConfirmModal
        open={!!confirmDelete}
        title="Eliminar cliente"
        message={`¿Seguro que deseas eliminar a "${confirmDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4AA]/20 rounded-xl border border-[#6C63FF]/20">
                  <Settings size={22} className="text-[#6C63FF]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Configuración del Scheduler
                  </h1>
                  <p className="text-white/40 text-sm">
                    Monitor de Salud del Scraper — Panel Admin Interno
                  </p>
                </div>
              </div>
              <p className="text-white/50 text-sm max-w-xl">
                Gestiona la frecuencia de ejecución, ventana horaria preferida y
                control de pausa de emergencia por cliente.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchClients(true)}
                disabled={refreshing}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => {
                  setEditData(null);
                  setModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-[#6C63FF]/20"
              >
                <Plus size={16} />
                Nuevo cliente
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              {
                label: "Total clientes",
                value: clients.length,
                icon: Users,
                color: "#6C63FF",
              },
              {
                label: "Activos",
                value: clients.filter((c) => c.status === "active").length,
                icon: CheckCircle,
                color: "#00D4AA",
              },
              {
                label: "Pausados",
                value: clients.filter((c) => c.scheduler_paused).length,
                icon: AlertTriangle,
                color: "#ef4444",
              },
              {
                label: "Suspendidos",
                value: clients.filter((c) => c.status === "suspended").length,
                icon: XCircle,
                color: "#f97316",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-[#1A1A2E] border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: s.color + "18" }}
                >
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-tight">
                    {s.value}
                  </p>
                  <p className="text-white/40 text-xs">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, email o empresa..."
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/50 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#1A1A2E] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/50 transition-all"
          >
            <option value="all" className="bg-[#1A1A2E]">Todos los estados</option>
            <option value="active" className="bg-[#1A1A2E]">Activo</option>
            <option value="inactive" className="bg-[#1A1A2E]">Inactivo</option>
            <option value="suspended" className="bg-[#1A1A2E]">Suspendido</option>
          </select>
          <select
            value={pausedFilter}
            onChange={(e) => {
              setPausedFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#1A1A2E] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/50 transition-all"
          >
            <option value="all" className="bg-[#1A1A2E]">Todos los scrapers</option>
            <option value="running" className="bg-[#1A1A2E]">En ejecución</option>
            <option value="paused" className="bg-[#1A1A2E]">Pausados</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#1A1A2E] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-widest hidden md:table-cell">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">
                    Frecuencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">
                    Ventana
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white/30 uppercase tracking-widest">
                    Scraper
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white/30 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-5 bg-white/3 rounded-2xl border border-white/5">
                          <Users size={36} className="text-white/10" />
                        </div>
                        <div>
                          <p className="text-white/40 font-medium text-lg mb-1">
                            {search || statusFilter !== "all" || pausedFilter !== "all"
                              ? "Sin resultados"
                              : "No hay clientes aún"}
                          </p>
                          <p className="text-white/20 text-sm">
                            {search || statusFilter !== "all" || pausedFilter !== "all"
                              ? "Intenta cambiar los filtros de búsqueda"
                              : "Crea tu primer cliente para empezar"}
                          </p>
                        </div>
                        {!search && statusFilter === "all" && pausedFilter === "all" && (
                          <button
                            onClick={() => {
                              setEditData(null);
                              setModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 border border-[#6C63FF]/20 text-[#6C63FF] rounded-lg text-sm transition-all"
                          >
                            <Plus size={15} />
                            Crear primer cliente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-white/5 hover:bg-white/2 transition-colors group"
                    >
                      {/* Cliente */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF]/30 to-[#00D4AA]/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {client.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium leading-tight">
                              {client.name || "—"}
                            </p>
                            <p className="text-white/40 text-xs truncate max-w-[160px]">
                              {client.email || "—"}
                            </p>
                            {client.company && (
                              <p className="text-white/25 text-xs">{client.company}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          {statusBadge(client.status)}
                          {client.plan && (
                            <span className="text-white/30 text-xs capitalize">
                              {client.plan}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Frecuencia */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-[#6C63FF] shrink-0" />
                          <span className="text-white/70 text-xs">
                            {freqLabel(client.scheduler_frequency)}
                          </span>
                        </div>
                      </td>

                      {/* Ventana */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {client.scheduler_window_start && client.scheduler_window_end ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#00D4AA] shrink-0" />
                            <span className="text-white/70 text-xs font-mono">
                              {client.scheduler_window_start} — {client.scheduler_window_end}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs">Sin ventana</span>
                        )}
                      </td>

                      {/* Toggle pausa */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleTogglePause(client)}
                          title={
                            client.scheduler_paused
                              ? "Reactivar scraper"
                              : "Pausar scraper"
                          }
                          className="inline-flex items-center gap-1.5 focus:outline-none transition-all"
                        >
                          {client.scheduler_paused ? (
                            <>
                              <ToggleRight size={22} className="text-red-400" />
                              <span className="text-red-400 text-xs hidden sm:inline">
                                Pausado
                              </span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={22} className="text-white/20 group-hover:text-white/40" />
                              <span className="text-white/30 text-xs hidden sm:inline">
                                Activo
                              </span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditData(client);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-white/30 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-all"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(client)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Eliminar"
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

          {/* Paginación */}
          {!loading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <p className="text-white/30 text-xs">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} de{" "}
                {filtered.length} clientes
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 1
                  )
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-white/20 px-1 text-xs">…</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                          p === page
                            ? "bg-[#6C63FF] text-white"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
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

        {/* Footer info */}
        <div className="mt-4 flex items-center gap-2 text-white/20 text-xs">
          <Zap size={11} />
          <span>
            URUS Market Intelligence API — Scheduler Config Module — {clients.length} clientes cargados
          </span>
        </div>
      </div>
    </div>
  );
}