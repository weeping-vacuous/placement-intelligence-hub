import { Link, useRouterState } from "@tanstack/react-router";
import { Brain, Building2, LayoutGrid } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { COLLEGE_SHORT } from "@/lib/companyData";

const items = [
  { title: "Company Intelligence", url: "/company/intelligence", icon: Building2 },
  { title: "Skill Intelligence", url: "/company/skills", icon: Brain },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-8 items-center gap-2 px-1 font-heading text-sm font-semibold text-sidebar-foreground">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-nav-active-bg text-[10px] font-bold text-nav-active">{COLLEGE_SHORT.slice(0, 2)}</span>
          <span className="truncate group-data-[collapsible=icon]:hidden">{COLLEGE_SHORT} Placement Hub</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.url}><SidebarMenuButton asChild isActive={path === it.url} tooltip={it.title} className="data-[active=true]:bg-nav-active-bg data-[active=true]:text-nav-active">
                  <Link to={it.url}><it.icon className="h-4 w-4" /><span>{it.title}</span></Link>
                </SidebarMenuButton></SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="All Companies">
              <Link to="/"><LayoutGrid className="h-4 w-4" /><span>All Companies</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
