import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  UserCog,
  Wallet,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/nestfam";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: "all" },
  { to: "/journey", label: "Journey", icon: RouteIcon, roles: "all" },
  {
    to: "/matches",
    label: "Matches",
    icon: Heart,
    roles: ["intended_parent", "surrogate", "admin"],
  },
  { to: "/messages", label: "Messages", icon: MessagesSquare, roles: "all" },
  { to: "/appointments", label: "Appointments", icon: CalendarDays, roles: "all" },
  { to: "/documents", label: "Documents", icon: FileText, roles: "all" },
  { to: "/payments", label: "Escrow", icon: Wallet, roles: "all" },
  { to: "/verification", label: "Verification", icon: ShieldCheck, roles: "all" },
  { to: "/admin", label: "Admin", icon: UserCog, roles: ["admin"] },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { session, profile, roles, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!session) void navigate({ to: "/auth" });
      else setReady(true);
    }
  }, [loading, session, navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Loading your NestFam workspace…</span>
        </div>
      </div>
    );
  }

  const items = NAV.filter(
    (n) => n.roles === "all" || roles.some((r) => (n.roles as readonly string[]).includes(r)),
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Heart className="h-4 w-4" />
          </span>
          <span className="font-display text-lg">NestFam</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 rounded-xl bg-sidebar-accent/60 p-3 text-xs text-sidebar-foreground/80">
          Clinical and legal decisions always rest with the qualified professionals on your case.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card/70 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="max-w-32 truncate">{profile?.full_name || "My account"}</span>
                  {role ? (
                    <Badge variant="secondary" className="hidden sm:inline-flex">
                      {ROLE_LABELS[role]}
                    </Badge>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {profile?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile & preferences</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/verification">Verification centre</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    void navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card/40 px-3 py-2 lg:hidden">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-muted-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-5 py-6">{children}</main>
      </div>
    </div>
  );
}

function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  const unread = (data ?? []).filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 ? (
            <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
              {unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unread > 0 ? (
            <button
              className="text-xs text-muted-foreground underline"
              onClick={async () => {
                await supabase
                  .from("notifications")
                  .update({ read: true })
                  .eq("read", false);
                void queryClient.invalidateQueries({ queryKey: ["notifications"] });
              }}
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <ScrollArea className="max-h-80">
          {(data ?? []).length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nothing yet. Updates on verification, contracts and payments land here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {(data ?? []).map((n) => (
                <li key={n.id} className={`px-3 py-2 ${n.read ? "opacity-60" : ""}`}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
