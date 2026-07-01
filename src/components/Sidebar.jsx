import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bot,
  CalendarClock,
  GitCompareArrows,
  Plug,
  TrendingUp,
  LayoutGrid,
  FileDown,
  KeyRound,
  Gauge,
  CreditCard,
  LayoutDashboard,
  Activity,
  Users,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Zap,
  Building2,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    section: "Motor de Datos",
    items: [
      {
        label: "Scraper Engine",
        icon: Bot,
        path: "/scraper-engine",
      },
      {
        label: "Scheduler / Job Queue",
        icon: CalendarClock,
        path: "/scheduler",
      },
      {
        label: "Gap Analysis Engine",
        icon: GitCompareArrows,
        path: "/gap-analysis-engine",
      },
    ],
  },
  {
    section: "API Gateway",
    items: [
      {
        label: "Integraciones",
        icon: Plug,
        path: "/api/integrations",
      },
      {
        label: "Gap Analysis",
        icon: GitCompareArrows,
        path: "/api/gap-analysis",
      },
      {
        label: "Tendencias",
        icon: TrendingUp,
        path: "/api/trends",
      },
      {
        label: "Categorías y Apps",
        icon: LayoutGrid,
        path: "/api/categories",
      },
      {
        label: "Exportación",
        icon: FileDown,
        path: "/api/export",
      },
    ],
  },
  {
    section: "Acceso y Planes",
    items: [
      {
        label: "Auth y API Keys",
        icon: KeyRound,
        path: "/auth-keys",
      },
      {
        label: "Usage Metering",
        icon: Gauge,
        path: "/usage-metering",
      },
      {
        label: "Gestión de Planes",
        icon: CreditCard,
        path: "/plans",
      },
    ],
  },
  {
    section: "Portal Cliente",
    items: [
      {
        label: "Dashboard de Cliente",
        icon: LayoutDashboard,
        path: "/client-dashboard",
        children: [
          { label: "Login / Registro", path: "/client-dashboard/auth" },
          { label: "Overview de Uso", path: "/client-dashboard/overview" },
          { label: "Gestión de API Key", path: "/client-dashboard/api-key" },
          { label: "Historial de Requests", path: "/client-dashboard/history" },
          { label: "Explorador de Endpoints", path: "/client-dashboard/explorer" },
          { label: "Upgrade de Plan", path: "/client-dashboard/upgrade" },
          { label: "Perfil y Configuración", path: "/client-dashboard/profile" },
        ],
      },
    ],
  },
  {
    section: "Admin Interno",
    items: [
      {
        label: "Monitor de Salud",
        icon: Activity,
        path: "/admin/health-monitor",
        children: [
          { label: "Estado General", path: "/admin/health-monitor/status" },
          { label: "Log de Ejecuciones", path: "/admin/health-monitor/runs" },
          { label: "Errores por Marketplace", path: "/admin/health-monitor/errors" },
          { label: "Cobertura de Datos", path: "/admin/health-monitor/coverage" },
          { label: "Alertas Activas", path: "/admin/health-monitor/alerts" },
          { label: "Trigger Manual", path: "/admin/health-monitor/trigger" },
          { label: "Config. del Scheduler", path: "/admin/health-monitor/scheduler-config" },
        ],
      },
      {
        label: "Panel de Clientes",
        icon: Users,
        path: "/admin/clients",
        children: [
          { label: "Lista de Clientes", path: "/admin/clients/list" },
          { label: "Detalle de Cliente", path: "/admin/clients/detail" },
          { label: "Gestión de Planes", path: "/admin/clients/plans" },
          { label: "Métricas Globales", path: "/admin/clients/metrics" },
          { label: "Reset Manual de Uso", path: "/admin/clients/reset" },
          { label: "Asignación de Plan", path: "/admin/clients/assign-plan" },
        ],
      },
    ],
  },
];

function NavItem({ item, collapsed, depth = 0 }) {
  const location = useLocation();
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => location.pathname.startsWith(c.path)) ||
      location.pathname.startsWith(item.path);
  });

  const isActive = location.pathname === item.path ||
    (item.children && item.children.some((c) => location.pathname === c.path));
  const isParentActive = item.children &&
    (location.pathname.startsWith(item.path) ||
      item.children.some((c) => location.pathname.startsWith(c.path)));

  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = (e) => {
    if (hasChildren) {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  const baseClasses = `
    group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
    transition-all duration-200 ease-in-out cursor-pointer select-none
    ${depth === 0 ? "w-full" : "w-full pl-9"}
    ${isActive || isParentActive
      ? "bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30"
      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
    }
  `;

  return (
    <li className="w-full">
      {hasChildren ? (
        <button
          onClick={handleToggle}
          className={baseClasses}
          title={collapsed ? item.label : undefined}
        >
          {Icon && (
            <Icon
              size={18}
              className={`flex-shrink-0 transition-colors duration-200 ${
                isActive || isParentActive
                  ? "text-[#6C63FF]"
                  : "text-slate-500 group-hover:text-[#00D4AA]"
              }`}
            />
          )}
          {!collapsed && (
            <>
              <span className="flex-1 text-left leading-tight">{item.label}</span>
              <span className="transition-transform duration-200 flex-shrink-0">
                {open ? (
                  <ChevronDown size={14} className="text-slate-500" />
                ) : (
                  <ChevronRight size={14} className="text-slate-500" />
                )}
              </span>
            </>
          )}
        </button>
      ) : (
        <Link
          to={item.path}
          className={baseClasses}
          title={collapsed ? item.label : undefined}
        >
          {Icon && (
            <Icon
              size={18}
              className={`flex-shrink-0 transition-colors duration-200 ${
                isActive
                  ? "text-[#6C63FF]"
                  : "text-slate-500 group-hover:text-[#00D4AA]"
              }`}
            />
          )}
          {!collapsed && (
            <span className="flex-1 leading-tight">{item.label}</span>
          )}
          {isActive && !collapsed && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] flex-shrink-0" />
          )}
        </Link>
      )}

      {hasChildren && open && !collapsed && (
        <ul className="mt-1 ml-3 pl-3 border-l border-[#6C63FF]/20 space-y-0.5">
          {item.children.map((child) => (
            <ChildNavItem key={child.path} child={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

function ChildNavItem({ child }) {
  const location = useLocation();
  const isActive = location.pathname === child.path;

  return (
    <li>
      <Link
        to={child.path}
        className={`
          group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium
          transition-all duration-200 ease-in-out
          ${isActive
            ? "text-[#00D4AA] bg-[#00D4AA]/10"
            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
          }
        `}
      >
        {isActive && (
          <span className="w-1 h-1 rounded-full bg-[#00D4AA] flex-shrink-0" />
        )}
        {!isActive && (
          <span className="w-1 h-1 rounded-full bg-slate-700 flex-shrink-0" />
        )}
        <span className="leading-tight">{child.label}</span>
      </Link>
    </li>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-30
          flex flex-col
          bg-[#0A0A0F] border-r border-white/5
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-16" : "w-64"}
          lg:relative lg:z-auto
        `}
        style={{
          background: "linear-gradient(180deg, #0A0A0F 0%, #0f0f1a 100%)",
        }}
      >
        {/* Header */}
        <div
          className={`
            flex items-center flex-shrink-0 px-3 py-4 border-b border-white/5
            ${collapsed ? "justify-center" : "justify-between gap-2"}
          `}
        >
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center shadow-lg shadow-[#6C63FF]/20">
                <Zap size={15} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-xs leading-tight truncate">
                  URUS Market
                </p>
                <p className="text-[#6C63FF] text-[10px] font-medium truncate">
                  Intelligence API
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center shadow-lg shadow-[#6C63FF]/20">
              <Zap size={15} className="text-white" />
            </div>
          )}

          <button
            onClick={onToggle}
            className={`
              flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center
              text-slate-500 hover:text-white hover:bg-white/10
              transition-all duration-200
              ${collapsed ? "hidden" : "flex"}
            `}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <Menu size={14} /> : <X size={14} />}
          </button>
        </div>

        {/* Toggle button when collapsed */}
        {collapsed && (
          <div className="flex justify-center py-2 border-b border-white/5">
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Expand sidebar"
            >
              <Menu size={15} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {NAV_SECTIONS.map((section) => (
            <div key={section.section} className="mb-3">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  {section.section}
                </p>
              )}
              {collapsed && (
                <div className="my-2 mx-3 h-px bg-white/5" />
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    collapsed={collapsed}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`
          flex-shrink-0 border-t border-white/5 px-3 py-3
          ${collapsed ? "flex justify-center" : ""}
        `}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF]/30 to-[#00D4AA]/30 border border-[#6C63FF]/20 flex items-center justify-center">
                <Building2 size={14} className="text-[#6C63FF]" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">urus-1</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse flex-shrink-0" />
                  <p className="text-[#00D4AA] text-[10px] font-medium truncate">
                    Sistema activo
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF]/30 to-[#00D4AA]/30 border border-[#6C63FF]/20 flex items-center justify-center"
              title="urus-1"
            >
              <Building2 size={14} className="text-[#6C63FF]" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}