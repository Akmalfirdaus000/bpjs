import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, History, ArrowRight, User } from 'lucide-react';

interface Pegawai {
    nip: string;
    nama: string;
}

interface Pensiunan {
    pegawai: Pegawai;
}

interface UserData {
    name: string;
}

interface LogEntry {
    id: number;
    pensiunan: Pensiunan;
    status_sebelumnya: string;
    status_baru: string;
    catatan: string;
    created_at: string;
    user: UserData | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    logs: Paginated<LogEntry>;
    filters: { search?: string };
}

export default function LogAktivitas({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/bpjs/log-aktivitas',
            { search },
            { preserveState: true, replace: true }
        );
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }) + ' WIB';
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800';
            case 'diproses':
                return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800';
            case 'selesai':
                return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800';
            case 'ditolak':
                return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400';
        }
    };

    return (
        <>
            <Head title="Riwayat Log Verifikasi" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
                        <History className="size-6 text-emerald-700" />
                        Riwayat Log Verifikasi
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Catatan audit (audit log) perubahan status berkas pengajuan pensiun beserta verifikator dan keterangan penolakan/proses.
                    </p>
                </div>

                <Card className="border border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:max-w-sm">
                            <Input
                                placeholder="Cari nama pegawai, NIP, atau operator..."
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
                                <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
                                    <tr>
                                        <th className="px-6 py-4 w-[5%]">No</th>
                                        <th className="px-6 py-4 w-[25%]">Pegawai</th>
                                        <th className="px-6 py-4 w-[25%]">Perubahan Status</th>
                                        <th className="px-6 py-4 w-[20%]">Catatan Verifikasi</th>
                                        <th className="px-6 py-4 w-[15%]">Waktu Perubahan</th>
                                        <th className="px-6 py-4 w-[10%]">Operator</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-neutral-400">
                                                Tidak ada data log riwayat verifikasi.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.data.map((log, idx) => (
                                            <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                                                <td className="px-6 py-4 font-mono">
                                                    {(logs.current_page - 1) * 15 + idx + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {log.pensiunan?.pegawai ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-emerald-700">{log.pensiunan.pegawai.nama}</span>
                                                            <span className="text-xs font-mono text-neutral-500">NIP: {log.pensiunan.pegawai.nip}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-neutral-400 italic">Data Terhapus</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getStatusClass(log.status_sebelumnya)}`}>
                                                            {log.status_sebelumnya}
                                                        </span>
                                                        <ArrowRight className="size-3 text-neutral-400" />
                                                        <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getStatusClass(log.status_baru)}`}>
                                                            {log.status_baru}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs truncate" title={log.catatan}>
                                                    {log.catatan}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono">
                                                    {formatDate(log.created_at)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <User className="size-3 text-neutral-400" />
                                                        <span className="text-xs font-medium text-emerald-700">
                                                            {log.user?.name || 'Sistem'}
                                                        </span>
                                                    </div>
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

LogAktivitas.layout = {
    breadcrumbs: [
        {
            title: 'BPJS Dashboard',
            href: '/bpjs/dashboard',
        },
        {
            title: 'Riwayat Log Verifikasi',
            href: '/bpjs/log-aktivitas',
        },
    ],
};
