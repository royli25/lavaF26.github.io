import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, LockKeyhole } from 'lucide-react'
import { NavIcon } from './NavIcon'
import { comingSoonPages, navigation, type Page } from './data'
import { Button } from './components/ui/button'
import { Avatar, AvatarFallback } from './components/ui/avatar'
import { Separator } from './components/ui/separator'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from './components/ui/sidebar'

export function AppSidebar({ page, navigate }: {
  page: Page
  navigate: (page: Page) => void
}) {
  const { state, isMobile, setOpen, toggleSidebar } = useSidebar()
  const lastCompact = useRef<boolean | null>(null)
  const collapsed = state === 'collapsed' && !isMobile
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
    const sync = () => {
      if (lastCompact.current !== query.matches) {
        lastCompact.current = query.matches
        setOpen(!query.matches)
      }
    }
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [setOpen])
  return <Sidebar collapsible="icon" className="dashboard-sidebar">
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`} aria-label="Main navigation">
      <SidebarHeader className="dashboard-sidebar-header">
        <div className="brand-row">
          <Button variant="ghost" className="app-button brand" onClick={() => collapsed ? toggleSidebar() : navigate('Overview')} aria-label={collapsed ? 'Expand sidebar' : 'ArcRank overview'} title={collapsed ? 'Expand sidebar' : undefined}><img className="brand-wordmark sidebar-label" src={`${import.meta.env.BASE_URL}assets/branding/arcrank-wordmark-dark.svg`} alt="ArcRank" width="149" height="30" /><img className="brand-symbol" src={`${import.meta.env.BASE_URL}assets/branding/arcrank-mark-dark.svg`} alt="" width="33" height="32" />{collapsed && <ChevronRight className="brand-expand-icon" size={20} aria-hidden="true" />}</Button>
          {!collapsed && <Button variant="ghost" className="app-button collapse-button" onClick={toggleSidebar} aria-label={isMobile ? 'Close navigation' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><ChevronLeft size={20} aria-hidden="true" /></Button>}
        </div>
      </SidebarHeader>
      <SidebarContent className="dashboard-sidebar-content">
        <nav aria-label="Dashboard pages"><SidebarMenu className="nav-list">{navigation.map(item => <SidebarMenuItem key={item.name}>
          <SidebarMenuButton asChild isActive={page === item.name} tooltip={item.name} className={`nav-link ${page === item.name ? 'active' : ''}`}>
            <a href={`#${encodeURIComponent(item.name)}`} aria-label={item.name} aria-current={page === item.name ? 'page' : undefined} onClick={() => navigate(item.name)}><NavIcon name={item.icon} /><span className="sidebar-label">{item.name}</span>{comingSoonPages.includes(item.name) && <LockKeyhole className="nav-lock sidebar-label" size={12} aria-hidden="true" />}</a>
          </SidebarMenuButton>
        </SidebarMenuItem>)}</SidebarMenu></nav>
      </SidebarContent>
      <SidebarFooter className="sidebar-bottom">
        <SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild tooltip="Settings" isActive={page === 'Settings'} className={`nav-link settings-link ${page === 'Settings' ? 'active' : ''}`}><a href="#Settings" onClick={() => navigate('Settings')}><NavIcon name="imgIconGear" /><span className="sidebar-label">Settings</span></a></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
        <Button variant="ghost" className="app-button profile" onClick={() => navigate('Settings')} title="Jordan Lee"><Avatar className="avatar"><AvatarFallback>Jo</AvatarFallback></Avatar><span className="sidebar-label">Jordan Lee</span><span className="profile-dots sidebar-label" aria-hidden="true">···</span></Button>
        <Separator className="brand-divider" />
        <Button variant="ghost" className="app-button workspace-switch" onClick={() => navigate('Settings')} title="Lavalab workspace" aria-label="Lavalab workspace settings"><Avatar className="workspace-avatar"><AvatarFallback>LL</AvatarFallback></Avatar><span className="workspace-name sidebar-label"><strong>Lavalab</strong><span>usclavalab.com</span></span><img className="workspace-chevrons sidebar-label" src={`${import.meta.env.BASE_URL}assets/workspace-chevrons.svg`} alt="" width="20" height="20" /></Button>
      </SidebarFooter>
    </aside>
  </Sidebar>
}
