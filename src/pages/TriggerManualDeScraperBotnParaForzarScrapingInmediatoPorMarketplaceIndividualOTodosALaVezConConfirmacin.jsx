import { useState, useEffect, useCallback } from "react";
import {
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Zap,
  Globe,
  Users,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

/* ─── Toast ─── */
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all
            ${t.type === "success" ? "bg-[#00D4AA]/20 border border-[#00D4AA]/40 text-[#00D4AA]" : "bg-red-500/20 border border-red-500/40 text-red-400"}`}
        >
          {t.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          <span>{t.message}</span>
          <button onClick={() => remove(t.id)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, add, remove };
}

/* ─── Skeleton ─── */
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-white/10 rounded animate-pulse" style={{ width: `${60 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ─── Confirm Modal ─── */
function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = true, loading = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${danger ? "bg-red-500/20" : "bg-[#6C63FF]/20"}`}>
            <AlertTriangle size={20} className={danger ? "text-red-400" : "text-[#6C63FF]"} />
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50
              ${danger ? "bg-red-500/80 hover:bg-red-500 text-white" : "bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white"}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Scraper Trigger Modal ─── */
function ScraperTriggerModal({ open, onClose, clients, onTrigger }) {
  const [mode, setMode] = useState("all"); // "all" | "individual"
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) { setMode("all"); setSelected(null); setConfirm(false); setDone(false); }
  }, [open]);

  if (!open) return null;

  const handleTrigger = async () => {
    setTriggering(true);
    await onTrigger(mode === "all" ? null : selected);
    setTriggering(false);
    setConfirm(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#6C63FF]/20">
              <Zap size={20} className="text-[#6C63FF]" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Trigger Manual de Scraper</h3>
              <p className="text-white/40 text-xs">Forzar scraping inmediato</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#00D4AA]/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#00D4AA]" />
            </div>
            <h4 className="text-white font-semibold text-lg mb-2">¡Scraping Iniciado!</h4>
            <p className="text-white/50 text-sm mb-6">
              {mode === "all" ? "Se lanzó scraping en todos los marketplaces." : `Scraping lanzado para el cliente seleccionado.`}
            </p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white text-sm font-medium transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-white/60 text-sm mb-4">Selecciona el alcance del scraping:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("all")}
                  className={`p-4 rounded-xl border text-left transition-all ${mode === "all" ? "border-[#6C63FF] bg-[#6C63FF]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <Globe size={20} className={`mb-2 ${mode === "all" ? "text-[#6C63FF]" : "text-white/50"}`} />
                  <p className={`font-medium text-sm ${mode === "all" ? "text-white" : "text-white/70"}`}>Todos los Marketplaces</p>
                  <p className="text-white/40 text-xs mt-1">Scraping global simultáneo</p>
                </button>
                <button
                  onClick={() => setMode("individual")}
                  className={`p-4 rounded-xl border text-left transition-all ${mode === "individual" ? "border-[#6C63FF] bg-[#6C63FF]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <Users size={20} className={`mb-2 ${mode === "individual" ? "text-[#6C63FF]" : "text-white/50"}`} />
                  <p className={`font-medium text-sm ${mode === "individual" ? "text-white" : "text-white/70"}`}>Cliente Individual</p>
                  <p className="text-white/40 text-xs mt-1">Selecciona un cliente</p>
                </button>
              </div>
            </div>

            {mode === "individual" && (
              <div className="mb-6">
                <label className="text-white/60 text-xs font-medium mb-2 block">Cliente objetivo</label>
                <select
                  value={selected || ""}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/50"
                >
                  <option value="" disabled>Selecciona un cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#1A1A2E]">
                      {c.name || c.email || `Cliente #${c.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!confirm ? (
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={() => setConfirm(true)}
                  disabled={mode === "individual" && !selected}
                  className="flex-1 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play size={14} />
                  Lanzar Scraping
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-amber-400 text-sm font-medium">¿Confirmar acción?</p>
                    <p className="text-white/50 text-xs mt-1">
                      {mode === "all"
                        ? "Se iniciará scraping en TODOS los marketplaces simultáneamente. Esto puede generar carga en el sistema."
                        : "Se iniciará scraping inmediato para el cliente seleccionado."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setConfirm(false)} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
                    Volver
                  </button>
                  <button
                    onClick={handleTrigger}
                    disabled={triggering}
                    className="flex-1 py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {triggering ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    {triggering ? "Lanzando..." : "Sí, confirmar"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Form Modal ─── */
const EMPTY_FORM = { name: "", email: "", company: "", plan: "", status: "active" };

function ClientModal({ open, onClose, initial, onSave, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
      setErrors({});
    }
  }, [open, initial]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Nombre requerido";
    if (!form.email?.trim()) e.email = "Email requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#6C63FF]/20">
              <Users size={18} className="text-[#6C63FF]" />
            </div>
            <h3 className="text-white font-semibold text-lg">
              {initial ? "Editar Cliente" : "Nuevo Cliente"}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {[
            { key: "name", label: "Nombre completo", type: "text", placeholder: "Ej: Juan García" },
            { key: "email", label: "Email", type: "email", placeholder: "correo@empresa.com" },
            { key: "company", label: "Empresa", type: "text", placeholder: "Nombre de la empresa" },
            { key: "plan", label: "Plan", type: "text", placeholder: "starter, pro, enterprise..." },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">{label}</label>
              <input
                type={type}
                value={form[key] || ""}
                onChange={handle(key)}
                placeholder={placeholder}
                className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none transition-colors
                  ${errors[key] ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#6C63FF]/50"}`}
              />
              {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}

          <div>
            <label className="text-white/60 text-xs font-medium mb-1.5 block">Estado</label>
            <select
              value={form.status || "active"}
              onChange={handle("status")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/50"
            >
              <option value="active" className="bg-[#1A1A2E]">Activo</option>
              <option value="inactive" className="bg-[#1A1A2E]">Inactivo</option>
              <option value="suspended" className="bg-[#1A1A2E]">Suspendido</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Guardando..." : initial ? "Actualizar" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const map = {
    active: "bg-[#00D4AA]/15 text-[#00D4AA] border-[#00D4AA]/30",
    inactive: "bg-white/10 text-white/50 border-white/20",
    suspended: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const labels = { active: "Activo", inactive: "Inactivo", suspended: "Suspendido" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] || map.inactive}`}>
      {labels[status] || status}
    </span>
  );
}

/* ─── Main Page ─── */
export default function TriggerManualDeScraper() {
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [scraperModal, setScraperModal] = useState(false);

  /* ─── Fetch ─── */
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  /* ─── Filtered / Paginated ─── */
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  /* ─── CRUD ─── */
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = !!editing;
      const url = isEdit ? `${API_URL}/${editing.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(isEdit ? "Error al actualizar" : "Error al crear");
      addToast(isEdit ? "Cliente actualizado correctamente" : "Cliente creado correctamente", "success");
      setModalOpen(false);
      setEditing(null);
      fetchClients();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, { method: "DELETE", headers: HEADERS });
      if (!res.ok) throw new Error("Error al eliminar");
      addToast("Cliente eliminado", "success");
      setDeleteTarget(null);
      fetchClients();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleTrigger = async (clientId) => {
    await new Promise((r) => setTimeout(r, 1800));
    addToast(clientId ? `Scraping lanzado para cliente #${clientId}` : "Scraping global iniciado en todos los marketplaces", "success");
  };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      <Toast toasts={toasts} remove={removeToast} />

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/30">
              <ShieldCheck size={22} className="text-[#6C63FF]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight">Monitor de Salud del Scraper</h1>
              <p className="text-white/40 text-xs">Trigger manual · Panel Admin Interno</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScraperModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00D4AA]/20 hover:bg-[#00D4AA]/30 border border-[#00D4AA]/30 text-[#00D4AA] text-sm font-medium transition-all"
            >
              <Zap size={15} />
              <span className="hidden sm:inline">Trigger Scraper</span>
              <span className="sm:hidden">Trigger</span>
            </button>
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white text-sm font-medium transition-colors"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Nuevo Cliente</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Clientes", value: clients.length, color: "text-[#6C63FF]", bg: "bg-[#6C63FF]/10 border-[#6C63FF]/20" },
            { label: "Activos", value: clients.filter((c) => c.status === "active").length, color: "text-[#00D4AA]", bg: "bg-[#00D4AA]/10 border-[#00D4AA]/20" },
            { label: "Inactivos", value: clients.filter((c) => c.status === "inactive").length, color: "text-white/50", bg: "bg-white/5 border-white/10" },
            { label: "Suspendidos", value: clients.filter((c) => c.status === "suspended").length, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border rounded-xl p-3 sm:p-4`}>
              <p className="text-white/40 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{loading ? "—" : s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o empresa..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/40 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/40 min-w-[150px]"
          >
            <option value="all" className="bg-[#1A1A2E]">Todos los estados</option>
            <option value="active" className="bg-[#1A1A2E]">Activo</option>
            <option value="inactive" className="bg-[#1A1A2E]">Inactivo</option>
            <option value="suspended" className="bg-[#1A1A2E]">Suspendido</option>
          </select>
          <button
            onClick={fetchClients}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-[#1A1A2E]/60 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Nombre", "Email", "Empresa", "Plan", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-white/40 text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                          <Users size={28} className="text-white/20" />
                        </div>
                        <div>
                          <p className="text-white/50 font-medium mb-1">
                            {search || statusFilter !== "all" ? "Sin resultados" : "Sin clientes registrados"}
                          </p>
                          <p className="text-white/30 text-xs">
                            {search || statusFilter !== "all" ? "Prueba ajustando los filtros" : "Crea tu primer cliente con el botón de arriba"}
                          </p>
                        </div>
                        {!search && statusFilter === "all" && (
                          <button
                            onClick={() => { setEditing(null); setModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white text-sm font-medium transition-colors"
                          >
                            <Plus size={14} />
                            Nuevo Cliente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center shrink-0">
                            <span className="text-[#6C63FF] text-xs font-semibold">
                              {(client.name || client.email || "?")[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white font-medium truncate max-w-[150px]">
                            {client.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/60 truncate max-w-[180px]">{client.email || "—"}</td>
                      <td className="px-4 py-3 text-white/60 truncate max-w-[140px]">{client.company || "—"}</td>
                      <td className="px-4 py-3">
                        {client.plan ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30">
                            {client.plan}
                          </span>
                        ) : <span className="text-white/30">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditing(client); setModalOpen(true); }}
                            title="Editar"
                            className="p-1.5 rounded-lg hover:bg-[#6C63FF]/20 text-white/40 hover:text-[#6C63FF] transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(client)}
                            title="Eliminar"
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
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

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <p className="text-white/40 text-xs">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${n === page ? "bg-[#6C63FF] text-white" : "bg-white/5 hover:bg-white/10 text-white/50"}`}
                    >
                      {n}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ScraperTriggerModal
        open={scraperModal}
        onClose={() => setScraperModal(false)}
        clients={clients}
        onTrigger={handleTrigger}
      />

      <ClientModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        initial={editing}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar Cliente"
        message={`¿Seguro que deseas eliminar a "${deleteTarget?.name || deleteTarget?.email}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        danger={true}
      />
    </div>
  );
}