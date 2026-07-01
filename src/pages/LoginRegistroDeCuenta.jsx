import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Building,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  RefreshCw,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "x-factory-key": "factory2026",
  "Content-Type": "application/json",
};
const PAGE_SIZE = 20;

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "active",
  plan: "",
};

/* ─── Toast ─── */
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-sm font-medium animate-slide-in transition-all
            ${
              t.type === "success"
                ? "bg-[#1A1A2E] border-[#00D4AA] text-[#00D4AA]"
                : "bg-[#1A1A2E] border-red-500 text-red-400"
            }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
          )}
          <span className="flex-1 text-white/90">{t.message}</span>
          <button onClick={() => remove(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
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
    const id = Date.now();
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
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/10 rounded animate-pulse w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

/* ─── Badge ─── */
function Badge({ status }) {
  const styles = {
    active: "bg-[#00D4AA]/15 text-[#00D4AA] border-[#00D4AA]/30",
    inactive: "bg-red-500/15 text-red-400 border-red-500/30",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[status] || styles.inactive
      }`}
    >
      {status}
    </span>
  );
}

/* ─── Confirm Modal ─── */
function ConfirmModal({ client, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 mx-auto mb-4">
          <Trash2 size={22} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-lg text-center mb-2">Eliminar cliente</h3>
        <p className="text-white/60 text-sm text-center mb-6">
          ¿Seguro que deseas eliminar a <span className="text-white font-medium">{client?.name}</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Form Modal ─── */
function ClientModal({ client, onSave, onClose, saving }) {
  const [form, setForm] = useState(client ? { ...client } : { ...emptyForm });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "El nombre es requerido";
    if (!form.email?.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.company?.trim()) e.company = "La empresa es requerida";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) return setErrors(e2);
    onSave(form);
  };

  const isEdit = !!client;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex items-center justify-center">
              <User size={16} className="text-[#6C63FF]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">
                {isEdit ? "Editar cliente" : "Nuevo cliente"}
              </h2>
              <p className="text-white/40 text-xs">
                {isEdit ? "Actualiza la información" : "Completa los datos del cliente"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Nombre completo <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="John Doe"
                  className={`w-full bg-[#0A0A0F] border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 transition-all
                    ${errors.name ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20"}`}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="john@empresa.com"
                  className={`w-full bg-[#0A0A0F] border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 transition-all
                    ${errors.email ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20"}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Teléfono</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20 transition-all"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Empresa <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Building size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Acme Corp"
                  className={`w-full bg-[#0A0A0F] border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 transition-all
                    ${errors.company ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20"}`}
                />
              </div>
              {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company}</p>}
            </div>

            {/* Plan */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => set("plan", e.target.value)}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20 transition-all appearance-none"
              >
                <option value="">Sin plan</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Estado</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20 transition-all appearance-none"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5A52E8] hover:from-[#7B73FF] hover:to-[#6B63F8] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#6C63FF]/25"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : isEdit ? (
                <Edit2 size={15} />
              ) : (
                <Plus size={15} />
              )}
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function LoginRegistroDeCuenta() {
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* Fetch */
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: { "x-factory-key": "factory2026" } });
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      addToast(err.message || "Error al cargar clientes", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  /* Filter */
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  /* Create / Update */
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = !!editClient;
      const url = isEdit ? `${API_URL}/${editClient.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(isEdit ? "Error al actualizar" : "Error al crear cliente");
      const saved = await res.json();
      if (isEdit) {
        setClients((p) => p.map((c) => (c.id === editClient.id ? { ...c, ...saved } : c)));
        addToast("Cliente actualizado correctamente", "success");
      } else {
        setClients((p) => [saved, ...p]);
        addToast("Cliente creado correctamente", "success");
      }
      setModalOpen(false);
      setEditClient(null);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* Delete */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "x-factory-key": "factory2026" },
      });
      if (!res.ok) throw new Error("Error al eliminar cliente");
      setClients((p) => p.filter((c) => c.id !== deleteTarget.id));
      addToast("Cliente eliminado", "success");
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const openNew = () => {
    setEditClient(null);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditClient(c);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      <Toast toasts={toasts} remove={removeToast} />

      {/* Modals */}
      {modalOpen && (
        <ClientModal
          client={editClient}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditClient(null); }}
          saving={saving}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          client={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Page wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#5A52E8] flex items-center justify-center shadow-lg shadow-[#6C63FF]/30">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Clientes</h1>
              <p className="text-white/40 text-sm">Login / Registro de cuenta · Dashboard de Cliente</p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", value: clients.length, color: "text-[#6C63FF]" },
            { label: "Activos", value: clients.filter((c) => c.status === "active").length, color: "text-[#00D4AA]" },
            { label: "Inactivos", value: clients.filter((c) => c.status === "inactive").length, color: "text-red-400" },
            { label: "Pendientes", value: clients.filter((c) => c.status === "pending").length, color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1A1A2E] border border-white/8 rounded-xl px-4 py-3">
              <p className="text-white/40 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>
                {loading ? <span className="inline-block w-8 h-6 bg-white/10 rounded animate-pulse" /> : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Buscar por nombre, email o empresa..."
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20 transition-all"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); resetPage(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
            className="bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20 transition-all appearance-none w-full sm:w-40"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="pending">Pendiente</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchClients}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 bg-[#1A1A2E] text-white/60 hover:text-white hover:border-white/25 text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span className="sm:hidden">Actualizar</span>
          </button>

          {/* New */}
          <button
            onClick={openNew}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5A52E8] hover:from-[#7B73FF] hover:to-[#6B63F8] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6C63FF]/25"
          >
            <Plus size={16} />
            Nuevo cliente
          </button>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-white/30 text-xs mb-3">
            {filtered.length === clients.length
              ? `${clients.length} clientes en total`
              : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} de ${clients.length}`}
          </p>
        )}

        {/* Table card */}
        <div className="bg-[#1A1A2E] border border-white/8 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  {["Cliente", "Email", "Empresa", "Plan", "Estado", "Acciones"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap"
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
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <Users size={28} className="text-white/20" />
                        </div>
                        <div>
                          <p className="text-white/60 font-medium mb-1">
                            {search || statusFilter !== "all"
                              ? "Sin resultados para tu búsqueda"
                              : "No hay clientes aún"}
                          </p>
                          <p className="text-white/30 text-sm">
                            {search || statusFilter !== "all"
                              ? "Intenta con otros filtros"
                              : "Crea tu primer cliente para comenzar"}
                          </p>
                        </div>
                        {!search && statusFilter === "all" && (
                          <button
                            onClick={openNew}
                            className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5A52E8] text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#6C63FF]/25 hover:from-[#7B73FF] hover:to-[#6B63F8] transition-all"
                          >
                            <Plus size={16} /> Crear primer cliente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((c, idx) => (
                    <tr
                      key={c.id || idx}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF]/30 to-[#5A52E8]/30 border border-[#6C63FF]/30 flex items-center justify-center shrink-0">
                            <span className="text-[#6C63FF] text-xs font-bold uppercase">
                              {c.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <span className="text-white font-medium text-sm truncate max-w-[140px]">
                            {c.name || "—"}
                          </span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-4 py-4">
                        <span className="text-white/60 text-sm truncate max-w-[180px] block">
                          {c.email || "—"}
                        </span>
                      </td>
                      {/* Company */}
                      <td className="px-4 py-4">
                        <span className="text-white/70 text-sm">{c.company || "—"}</span>
                      </td>
                      {/* Plan */}
                      <td className="px-4 py-4">
                        {c.plan ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30 capitalize">
                            {c.plan}
                          </span>
                        ) : (
                          <span className="text-white/25 text-sm">—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-4">
                        <Badge status={c.status} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(c)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#6C63FF]/20 border border-white/8 hover:border-[#6C63FF]/40 flex items-center justify-center text-white/50 hover:text-[#6C63FF] transition-all"
                            title="Editar"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/8 hover:border-red-500/40 flex items-center justify-center text-white/50 hover:text-red-400 transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
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
            <div className="flex items-center justify-between px-4 py-4 border-t border-white/8">
              <p className="text-white/40 text-xs">
                Página {page} de {totalPages} · {filtered.length} resultados
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={15} />
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
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all border
                        ${page === p
                          ? "bg-[#6C63FF] border-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30"
                          : "border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/25"
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
        .bg-white\/3 { background-color: rgba(255,255,255,0.03); }
        .border-white\/8 { border-color: rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
}