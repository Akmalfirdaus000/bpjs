import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Users, FileText, ClipboardList, CheckCircle2, History, UserCog } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role;

    const mainNavItems: NavItem[] = [];

    if (role === 'admin_bpjs') {
        mainNavItems.push(
            {
                title: 'Dashboard',
                href: '/bpjs/dashboard',
                icon: LayoutGrid,
            },
            {
                type: 'separator',
            },
            {
                title: 'Antrean Verifikasi',
                href: '/bpjs/verifikasi',
                icon: ClipboardList,
            },
            {
                title: 'Mutasi Selesai',
                href: '/bpjs/verifikasi-selesai',
                icon: CheckCircle2,
            },
            {
                title: 'Log Verifikasi',
                href: '/bpjs/log-aktivitas',
                icon: History,
            }
        );
    } else if (role === 'admin_bkpsdm') {
        mainNavItems.push(
            {
                title: 'Dashboard',
                href: '/bkpsdm/dashboard',
                icon: LayoutGrid,
            },
            {
                type: 'separator',
            },
            {
                title: 'Data Pegawai',
                href: '/bkpsdm/pegawai',
                icon: Users,
            },
            {
                title: 'Data Golongan',
                href: '/bkpsdm/golongan',
                icon: BookOpen,
            },
            {
                title: 'Manajemen User',
                href: '/bkpsdm/user',
                icon: UserCog,
            },
            {
                type: 'separator',
            },
            {
                title: 'Pengajuan Pensiun',
                href: '/bkpsdm/pensiun',
                icon: FileText,
            }
        );
    } else {
        mainNavItems.push({
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        });
    }

    const homeUrl = role === 'admin_bpjs' ? '/bpjs/dashboard' : (role === 'admin_bkpsdm' ? '/bkpsdm/dashboard' : dashboard());

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
