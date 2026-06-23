import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, History, User, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LogData {
    id: number;
    pensiunan_id: number;
    status_sebelumnya: string | null;
    status_baru: string;
    catatan: string | null;
    created_at: string;
    pensiunan?: {
        pegawai?: {
            nama: string;
            nip: string;
        }
    };
    user?: {
        name: string;
    };
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    logs: Paginated<LogData>;
    filters: { search?: string };
}

export default function LogIndex({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/pimpinan/log-aktivitas',
            { search },
            { preserveState: true, replace: true }
        );
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <span className="text-neutral-400 font-mono text-xs">-</span>;
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-250 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40">Pending</Badge>;
            case 'diproses':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40">Diproses</Badge>;
            case 'selesai':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-emerald-950/40 dark:text-emerald-500 dark:border-emerald-900/40">Selesai</Badge>;
            case 'ditolak':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40">Ditolak</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Log Aktivitas Verifikasi (Pimpinan)" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-emerald-700 flex items-center gap-2">
                        <History className="size-6 text-neutral-700 dark:text-emerald-700" />
                        Log Aktivitas Verifikasi
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Riwayat lengkap perubahan status verifikasi pengajuan pensiun oleh operator BKPSDM & BPJS Kesehatan.
                    </p>
                </div>

                <Card className="border border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:max-w-sm">
                            <Input
                                placeholder="Cari nama, NIP, atau operator..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                            <Button type="submit" variant="secondary" size="icon">
                                <Search className="size-4" />
                            </Button>
                        </form>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
                                <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-emerald-950/40 dark:text-emerald-700 border-b border-neutral-200 dark:border-emerald-900/40">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 w-[5%]">No</th>
                                        <th scope="col" className="px-6 py-4 w-[20%]">Tanggal & Waktu</th>
                                        <th scope="col" className="px-6 py-4 w-[25%]">Pensiunan (Pegawai)</th>
                                        <th scope="col" className="px-6 py-4 w-[15%]">Operator</th>
                                        <th scope="col" className="px-6 py-4 text-center w-[20%]">Perubahan Status</th>
                                        <th scope="col" className="px-6 py-4 w-[15%]">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-neutral-400">
                                                Tidak ada data log aktivitas.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.data.map((log, idx) => (
                                            <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-emerald-950/20 transition-colors">
                                                <td className="px-6 py-4 font-mono">
                                                    {(logs.current_page - 1) * 15 + idx + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-semibold">
                                                        <Clock className="size-3.5 text-neutral-400" />
                                                        {new Date(log.created_at).toLocaleString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit'
                                                        })} WIB
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-neutral-900 dark:text-emerald-700">
                                                        {log.pensiunan?.pegawai?.nama || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 font-mono">
                                                        NIP. {log.pensiunan?.pegawai?.nip || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-neutral-850 dark:text-neutral-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="size-3.5 text-neutral-400" />
                                                        <span>{log.user?.name || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {getStatusBadge(log.status_sebelumnya)}
                                                        <ArrowRight className="size-3.5 text-neutral-400 shrink-0" />
                                                        {getStatusBadge(log.status_baru)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs italic text-neutral-600 dark:text-neutral-400">
                                                    {log.catatan || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>

                    {/* Pagination */}
                    {logs.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                            <span className="text-sm text-neutral-500">
                                Menampilkan {logs.data.length} dari {logs.total} log aktivitas
                            </span>
                            <div className="flex items-center gap-1">
                                {logs.links.map((link, idx) => {
                                    if (link.label.includes('Previous')) {
                                        return (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url)}
                                            >
                                                Prev
                                            </Button>
                                        );
                                    }
                                    if (link.label.includes('Next')) {
                                        return (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url)}
                                            >
                                                Next
                                            </Button>
                                        );
                                    }
                                    return (
                                        <Button
                                            key={idx}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                        >
                                            {link.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}

LogIndex.layout = {
    breadcrumbs: [
        {
            title: 'Pimpinan Dashboard',
            href: '/pimpinan/dashboard',
        },
        {
            title: 'Log Aktivitas',
            href: '/pimpinan/log-aktivitas',
        },
    ],
};
