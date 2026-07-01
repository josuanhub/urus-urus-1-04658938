import { useState, useEffect, useCallback } from "react";
import {
  Key,
  Copy,
  RefreshCw,
  XCircle,
  Eye,
  EyeOff,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Shield,
  Users,
  MoreVertical,
} from "lucide-react";

const API_BASE =
  "https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api/clients";
const HEADERS = {
  "x-factory-key": "factory2026",
  "Content-Type": "application/json",
};
const PAGE_SIZE = 20;

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
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
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <p className="text-sm flex-1 leading-relaxed">{t.message}</p>
          <button onClick={() => remove(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
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

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg border border-white/10 hover:border-white/20"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              confirmColor === "red"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-[#6C63FF] hover:bg-[#5a52e0] text-white"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── API Key Badge ──────────────────────────────────────────────────────────────
function ApiKeyBadge({ apiKey, visible, onToggle, onCopy }) {
  if (!apiKey) return <span className="text-gray-600 text-xs italic">Sin key</span>;
  const masked = apiKey.slice(0, 8) + "••••••••••••" + apiKey.slice(-4);
  return (
    <div className="flex items-center gap-2">
      <code className="text-xs font-mono text-[#6C63FF] bg-[#6C63FF]/10 px-2 py-1 rounded-lg max-w-[180px] truncate">
        {visible ? apiKey : masked}
      </code>
      <button
        onClick={onToggle}
        className="text-gray-500 hover:text-[#6C63FF] transition-colors"
        title={visible ? "Ocultar" : "Ver"}
      >
        {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={onCopy}
        className="text-gray-500 hover:text-[#00D4AA] transition-colors"
        title="Copiar"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Form Modal ─────────────────────────────────────────────────────────────────
function ClientModal({ open, client, onClose, onSaved, toast }) {
  const blank = { name: "", email: "", company: "", status: "active", api_key: "" };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(client ? { ...blank, ...client } : blank);
      setErrors({});
    }
  }, [open, client]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es obligatorio";
    if (!form.email.trim()) e.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    return e;
  };

  const handle = (k) => (ev) => {
    setForm((p) => ({ ...p, [k]: ev.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: null }));
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setSaving(true);
    try {
      const method = client ? "PUT" : "POST";
      const url = client ? `${API_BASE}/${client.id}` : API_BASE;
      const res = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast(client ? "Cliente actualizado correctamente" : "Cliente creado correctamente", "success");
      onSaved();
    } catch {
      toast("Error al guardar el cliente", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key] || ""}
        onChange={handle(key)}
        placeholder={placeholder}
        className={`w-full bg-[#0A0A0F] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:ring-2 ${
          errors[key]
            ? "border-red-500 focus:ring-red-500/20"
            : "border-white/10 focus:border-[#6C63FF]/60 focus:ring-[#6C63FF]/20"
        }`}
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#6C63FF]" />
            </div>
            <h2 className="text-base font-semibold text-white">
              {client ? "Editar Cliente" : "Nuevo Cliente"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {field("Nombre *", "name", "text", "Nombre del cliente")}
          {field("Email *", "email", "email", "correo@empresa.com")}
          {field("Empresa", "company", "text", "Nombre de la empresa")}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Estado</label>
            <select
              value={form.status}
              onChange={handle("status")}
              className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">API Key (opcional)</label>
            <input
              type="text"
              value={form.api_key || ""}
              onChange={handle("api_key")}
              placeholder="Se genera automáticamente si se deja vacío"
              className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/20 transition-all font-mono"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-5 border-t border-white/10 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium bg-[#6C63FF] hover:bg-[#5a52e0] text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Guardando..." : client ? "Actualizar" : "Crear Cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Row Actions Menu ───────────────────────────────────────────────────────────
function RowMenu({ open, onEdit, onDelete, onRegenerate, onRevoke, onClose }) {
  if (!open) return null;
  return (
    <div
      className="absolute right-0 top-8 z-30 bg-[#1A1A2E] border border-white/10 rounded-xl shadow-2xl py-1 w-48"
      onMouseLeave={onClose}
    >
      {[
        { icon: Edit2, label: "Editar", action: onEdit, color: "text-gray-300" },
        { icon: RefreshCw, label: "Regenerar Key", action: onRegenerate, color: "text-[#6C63FF]" },
        { icon: XCircle, label: "Revocar Key", action: onRevoke, color: "text-yellow-400" },
        { icon: Trash2, label: "Eliminar", action: onDelete, color: "text-red-400" },
      ].map(({ icon: Icon, label, action, color }) => (
        <button
          key={label}
          onClick={() => { action(); onClose(); }}
          className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${color}`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20",
    inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    suspended: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  const labels = { active: "Activo", inactive: "Inactivo", suspended: "Suspendido" };
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${map[status] || map.inactive}`}>
      {labels[status] || status}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function GestionDeAPIKey() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const { toasts, add: toast, remove } = useToast();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, { headers: { "x-factory-key": "factory2026" } });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setClients(Array.isArray(json) ? json : json.data || []);
    } catch {
      toast("Error al cargar los clientes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // Filter + Search
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  // Copy to clipboard
  const copyKey = async (key, id) => {
    try {
      await navigator.clipboard.writeText(key);
      toast("API Key copiada al portapapeles", "success");
    } catch {
      toast("No se pudo copiar al portapapeles", "error");
    }
  };

  const toggleVisible = (id) => setVisibleKeys((p) => ({ ...p, [id]: !p[id] }));

  // Generate random key
  const generateKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return "urus_" + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  // Regenerate Key
  const regenerateKey = async (client) => {
    setActionLoading((p) => ({ ...p, [`regen_${client.id}`]: true }));
    try {
      const newKey = generateKey();
      const res = await fetch(`${API_BASE}/${client.id}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify({ ...client, api_key: newKey }),
      });
      if (!res.ok) throw new Error();
      toast(`Key regenerada para ${client.name || "el cliente"}`, "success");
      fetchClients();
    } catch {
      toast("Error al regenerar la key", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [`regen_${client.id}`]: false }));
    }
  };

  // Revoke Key
  const revokeKey = async (client) => {
    setActionLoading((p) => ({ ...p, [`revoke_${client.id}`]: true }));
    try {
      const res = await fetch(`${API_BASE}/${client.id}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify({ ...client, api_key: null, status: "suspended" }),
      });
      if (!res.ok) throw new Error();
      toast(`Key revocada para ${client.name || "el cliente"}`, "success");
      fetchClients();
    } catch {
      toast("Error al revocar la key", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [`revoke_${client.id}`]: false }));
    }
  };

  // Delete
  const deleteClient = async (client) => {
    setActionLoading((p) => ({ ...p, [`del_${client.id}`]: true }));
    try {
      const res = await fetch(`${API_BASE}/${client.id}`, {
        method: "DELETE",
        headers: { "x-factory-key": "factory2026" },
      });
      if (!res.ok) throw new Error();
      toast("Cliente eliminado correctamente", "success");
      fetchClients();
    } catch {
      toast("Error al eliminar el cliente", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [`del_${client.id}`]: false }));
    }
  };

  const openConfirm = (type, client) => {
    setConfirm({ type, client });
    setOpenMenu(null);
  };

  const handleConfirm = () => {
    if (!confirm) return;
    const { type, client } = confirm;
    if (type === "delete") deleteClient(client);
    if (type === "revoke") revokeKey(client);
    if (type === "regenerate") regenerateKey(client);
    setConfirm(null);
  };

  // Stats
  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    withKey: clients.filter((c) => c.api_key).length,
    suspended: clients.filter((c) => c.status === "suspended").length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white px-4 py-8">
      <Toast toasts={toasts} remove={remove} />

      {/* Confirm */}
      <ConfirmModal
        open={!!confirm}
        title={
          confirm?.type === "delete"
            ? "Eliminar cliente"
            : confirm?.type === "revoke"
            ? "Revocar API Key"
            : "Regenerar API Key"
        }
        message={
          confirm?.type === "delete"
            ? `¿Seguro que deseas eliminar a "${confirm?.client?.name}"? Esta acción no se puede deshacer.`
            : confirm?.type === "revoke"
            ? `¿Revocar la API Key de "${confirm?.client?.name}"? El cliente perderá acceso inmediatamente.`
            : `¿Regenerar la API Key de "${confirm?.client?.name}"? La key anterior quedará inválida.`
        }
        confirmLabel={
          confirm?.type === "delete" ? "Eliminar" : confirm?.type === "revoke" ? "Revocar" : "Regenerar"
        }
        confirmColor={confirm?.type === "delete" || confirm?.type === "revoke" ? "red" : "purple"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      {/* Client Modal */}
      <ClientModal
        open={modalOpen}
        client={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={() => { setModalOpen(false); setEditing(null); fetchClients(); }}
        toast={toast}
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center border border-[#6C63FF]/30">
                <Key className="w-5 h-5 text-[#6C63FF]" />
              </div>
              <h1 className="text-xl font-bold text-white">Gestión de API Keys</h1>
            </div>
            <p className="text-sm text-gray-500 ml-12">Ver, copiar, regenerar y revocar keys de clientes</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-[#6C63FF]/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Clientes", value: stats.total, icon: Users, color: "text-[#6C63FF]", bg: "bg-[#6C63FF]/10 border-[#6C63FF]/20" },
            { label: "Activos", value: stats.active, icon: CheckCircle, color: "text-[#00D4AA]", bg: "bg-[#00D4AA]/10 border-[#00D4AA]/20" },
            { label: "Con API Key", value: stats.withKey, icon: Key, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
            { label: "Suspendidos", value: stats.suspended, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`rounded-xl border p-4 ${bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o empresa..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#6C63FF]/50 focus:ring-2 focus:ring-[#6C63FF]/10 transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}
            className="bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-[#6C63FF]/50 transition-all cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="suspended">Suspendidos</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/2">
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Empresa</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Acciones rápidas</th>
                  <th className="px-4 py-3.5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center">
                          <Shield className="w-8 h-8 text-[#6C63FF]/40" />
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium mb-1">
                            {search || filterStatus !== "all" ? "Sin resultados" : "No hay clientes aún"}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {search || filterStatus !== "all"
                              ? "Ajusta los filtros o busca otro término"
                              : "Crea tu primer cliente para comenzar"}
                          </p>
                        </div>
                        {!search && filterStatus === "all" && (
                          <button
                            onClick={() => { setEditing(null); setModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium rounded-xl transition-all"
                          >
                            <Plus className="w-4 h-4" />
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
                      className="border-b border-white/5 hover:bg-white/2 transition-colors group"
                    >
                      {/* Cliente */}
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{client.name || "—"}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{client.email || "—"}</p>
                        </div>
                      </td>
                      {/* Empresa */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-400">{client.company || "—"}</span>
                      </td>
                      {/* Estado */}
                      <td className="px-4 py-4">
                        <StatusBadge status={client.status} />
                      </td>
                      {/* API Key */}
                      <td className="px-4 py-4">
                        <ApiKeyBadge
                          apiKey={client.api_key}
                          visible={visibleKeys[client.id]}
                          onToggle={() => toggleVisible(client.id)}
                          onCopy={() => copyKey(client.api_key, client.id)}
                        />
                      </td>
                      {/* Acciones rápidas */}
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openConfirm("regenerate", client)}
                            disabled={actionLoading[`regen_${client.id}`]}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#6C63FF] border border-[#6C63FF]/30 hover:bg-[#6C63FF]/10 rounded-lg transition-all disabled:opacity-50"
                            title="Regenerar Key"
                          >
                            {actionLoading[`regen_${client.id}`] ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            Regenerar
                          </button>
                          <button
                            onClick={() => openConfirm("revoke", client)}
                            disabled={actionLoading[`revoke_${client.id}`] || !client.api_key}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/10 rounded-lg transition-all disabled:opacity-40"
                            title="Revocar Key"
                          >
                            {actionLoading[`revoke_${client.id}`] ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Revocar
                          </button>
                        </div>
                      </td>
                      {/* Menu */}
                      <td className="px-4 py-4 relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === client.id ? null : client.id)}
                          className="text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <RowMenu
                          open={openMenu === client.id}
                          onEdit={() => { setEditing(client); setModalOpen(true); setOpenMenu(null); }}
                          onDelete={() => openConfirm("delete", client)}
                          onRegenerate={() => openConfirm("regenerate", client)}
                          onRevoke={() => openConfirm("revoke", client)}
                          onClose={() => setOpenMenu(null)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-white/10">
              <p className="text-xs text-gray-500">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} clientes
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                      page === i + 1
                        ? "bg-[#6C63FF] text-white"
                        : "border border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-700 mt-6">
          URUS Market Intelligence API · Dashboard de Cliente
        </p>
      </div>
    </div>
  );
}