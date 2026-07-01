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
  Globe,
  AlertCircle,
  CheckCircle,
  Loader2,
  UserPlus,
  RefreshCw,
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
  phone: "",
  company: "",
  website: "",
  status: "active",
  plan: "",
  notes: "",
};

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-sm animate-pulse-once transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="opacity-60 hover:opacity-100 transition-opacity"
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
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/5 rounded animate-pulse w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

function ConfirmModal({ open, onConfirm, onCancel, clientName }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Eliminar cliente</h3>
            <p className="text-white/40 text-sm">Esta acción es irreversible</p>
          </div>
        </div>
        <p className="text-white/70 text-sm mb-6">
          ¿Estás seguro de que deseas eliminar a{" "}
          <span className="text-white font-medium">"{clientName}"</span>? Todos
          sus datos serán eliminados permanentemente.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ open, onClose, onSave, editingClient, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingClient) {
      setForm({ ...EMPTY_FORM, ...editingClient });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingClient, open]);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "El nombre es requerido";
    if (!form.email?.trim()) {
      e.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Email inválido";
    }
    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      e.website = "URL debe comenzar con http:// o https://";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  const field = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#1A1A2E] z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center">
              {editingClient ? (
                <Edit2 className="w-4 h-4 text-[#6C63FF]" />
              ) : (
                <UserPlus className="w-4 h-4 text-[#6C63FF]" />
              )}
            </div>
            <h2 className="text-white font-semibold text-lg">
              {editingClient ? "Editar cliente" : "Nuevo cliente"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Nombre completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => field("name", e.target.value)}
                placeholder="Juan García"
                className={`w-full bg-[#0A0A0F] border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none transition-all ${
                  errors.name
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-[#6C63FF]/50"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => field("email", e.target.value)}
                placeholder="juan@empresa.com"
                className={`w-full bg-[#0A0A0F] border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none transition-all ${
                  errors.email
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-[#6C63FF]/50"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => field("phone", e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="w-full bg-[#0A0A0F] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Empresa
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => field("company", e.target.value)}
                  placeholder="Mi Empresa SA"
                  className="w-full bg-[#0A0A0F] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Sitio web
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="url"
                value={form.website}
                onChange={(e) => field("website", e.target.value)}
                placeholder="https://miempresa.com"
                className={`w-full bg-[#0A0A0F] border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none transition-all ${
                  errors.website
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-[#6C63FF]/50"
                }`}
              />
            </div>
            {errors.website && (
              <p className="text-red-400 text-xs mt-1">{errors.website}</p>
            )}
          </div>

          {/* Status & Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Estado
              </label>
              <select
                value={form.status}
                onChange={(e) => field("status", e.target.value)}
                className="w-full bg-[#0A0A0F] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all appearance-none"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
                <option value="trial">Prueba</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Plan
              </label>
              <input
                type="text"
                value={form.plan}
                onChange={(e) => field("plan", e.target.value)}
                placeholder="Pro / Enterprise"
                className="w-full bg-[#0A0A0F] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => field("notes", e.target.value)}
              placeholder="Información adicional del cliente..."
              rows={3}
              className="w-full bg-[#0A0A0F] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5A52E0] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : editingClient ? (
                "Guardar cambios"
              ) : (
                "Crear cliente"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: {
      label: "Activo",
      cls: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20",
    },
    inactive: {
      label: "Inactivo",
      cls: "bg-white/5 text-white/40 border-white/10",
    },
    suspended: {
      label: "Suspendido",
      cls: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    trial: {
      label: "Prueba",
      cls: "bg-[#6C63FF]/10 text-[#6C63FF] border-[#6C63FF]/20",
    },
  };
  const s = map[status] || map.inactive;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {s.label}
    </span>
  );
}

export default function PerfilYConfiguracionDeCuenta() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      addToast(err.message || "Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Filtered & paginated
  const filtered = clients.filter((c) => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.company?.toLowerCase().includes(term);
    const matchStatus =
      filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = !!editingClient?.id;
      const url = isEdit ? `${API_URL}/${editingClient.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al guardar");
      addToast(
        isEdit
          ? "Cliente actualizado correctamente"
          : "Cliente creado correctamente",
        "success"
      );
      setModalOpen(false);
      setEditingClient(null);
      await fetchClients();
    } catch (err) {
      addToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${API_URL}/${confirmDelete.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error("Error al eliminar");
      addToast("Cliente eliminado correctamente", "success");
      setConfirmDelete(null);
      await fetchClients();
    } catch (err) {
      addToast(err.message || "Error al eliminar", "error");
    }
  };

  const openNew = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} removeToast={removeToast} />

      <ClientModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSave}
        editingClient={editingClient}
        saving={saving}
      />

      <ConfirmModal
        open={!!confirmDelete}
        clientName={confirmDelete?.name}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#6C63FF] to-[#00D4AA]" />
            <p className="text-[#6C63FF] text-sm font-medium uppercase tracking-widest">
              Dashboard de Cliente
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Perfil y configuración de cuenta
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Gestiona los clientes registrados en la plataforma URUS Market
            Intelligence
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total clientes",
              value: clients.length,
              color: "text-white",
            },
            {
              label: "Activos",
              value: clients.filter((c) => c.status === "active").length,
              color: "text-[#00D4AA]",
            },
            {
              label: "En prueba",
              value: clients.filter((c) => c.status === "trial").length,
              color: "text-[#6C63FF]",
            },
            {
              label: "Suspendidos",
              value: clients.filter((c) => c.status === "suspended").length,
              color: "text-red-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#1A1A2E]/60 border border-white/5 rounded-xl p-4"
            >
              <p className="text-white/40 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-[#6C63FF]/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-sm outline-none focus:border-[#6C63FF]/50 transition-all appearance-none min-w-[140px]"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="trial">Prueba</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchClients}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#1A1A2E] border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* New button */}
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5A52E0] transition-all text-white text-sm font-medium shadow-lg shadow-[#6C63FF]/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </button>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-white/30 text-xs mb-3">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            {search || filterStatus !== "all" ? " encontrados" : ""}
          </p>
        )}

        {/* Table */}
        <div className="bg-[#1A1A2E]/60 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Cliente", "Email", "Empresa", "Plan", "Estado", "Acciones"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3.5 text-left text-xs font-semibold text-white/30 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#6C63FF]/10 flex items-center justify-center">
                          <User className="w-8 h-8 text-[#6C63FF]/50" />
                        </div>
                        <div>
                          <p className="text-white/50 font-medium mb-1">
                            {search || filterStatus !== "all"
                              ? "No se encontraron resultados"
                              : "No hay clientes registrados"}
                          </p>
                          <p className="text-white/25 text-sm">
                            {search || filterStatus !== "all"
                              ? "Intenta con otros filtros de búsqueda"
                              : "Crea tu primer cliente para comenzar"}
                          </p>
                        </div>
                        {!search && filterStatus === "all" && (
                          <button
                            onClick={openNew}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5A52E0] transition-all text-white text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Crear primer cliente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((client, idx) => (
                    <tr
                      key={client.id || idx}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF]/30 to-[#00D4AA]/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {(client.name || "?")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium leading-tight">
                              {client.name || "—"}
                            </p>
                            {client.phone && (
                              <p className="text-white/30 text-xs mt-0.5">
                                {client.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-white/60 text-sm">
                          {client.email || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-white/60 text-sm">
                          {client.company || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {client.plan ? (
                          <span className="px-2 py-0.5 rounded-lg bg-[#6C63FF]/10 text-[#6C63FF] text-xs border border-[#6C63FF]/20">
                            {client.plan}
                          </span>
                        ) : (
                          <span className="text-white/20 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(client)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#6C63FF]/20 text-white/40 hover:text-[#6C63FF] transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(client)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
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
            <div className="flex items-center justify-between px-4 py-4 border-t border-white/5">
              <p className="text-white/30 text-xs">
                Página {page} de {totalPages} · {filtered.length} registros
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 disabled:opacity-30 hover:border-[#6C63FF]/40 hover:text-[#6C63FF] transition-all text-white/50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const p =
                    totalPages <= 5
                      ? i + 1
                      : page <= 3
                      ? i + 1
                      : page >= totalPages - 2
                      ? totalPages - 4 + i
                      : page - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs transition-all ${
                        page === p
                          ? "bg-[#6C63FF] text-white border border-[#6C63FF]"
                          : "border border-white/10 text-white/40 hover:border-[#6C63FF]/40 hover:text-[#6C63FF]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 disabled:opacity-30 hover:border-[#6C63FF]/40 hover:text-[#6C63FF] transition-all text-white/50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}