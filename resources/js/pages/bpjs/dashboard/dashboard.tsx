import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Play, 
    Layers, 
    UserCheck,
    Calendar,
    ArrowRight,
    HelpCircle,
    BarChart3,
    Building,
    Percent
} from 'lucide-react';

interface Stats {
    total: number;
    pending: number;
    diproses: number;
    selesai: number;
    ditolak: number;
}

interface RecentActivity {
    id: number;
    pensiunan_id: number;
    status_sebelumnya: string | null;
    status_baru: string;
    catatan: string | null;
    created_at: string;
    pensiunan?: {
        id: number;
        pegawai?: {
            nama: string;
            nip: string;
        }
    };
    user?: {
        name: string;
    };
}

interface TopSatker {
    satuan_kerja: string;
    total: number;
}

interface Props {
    stats: Stats;
    recentActivities: RecentActivity[];
    topSatker: TopSatker[];
}

export default function Dashboard({ stats, recentActivities, topSatker = [] }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-amber-950/40 text-amber-400 border-amber-800">Pending</Badge>;
            case 'diproses':
                return <Badge variant="outline" className="bg-blue-950/40 text-blue-400 border-blue-800">Diproses</Badge>;
            case 'selesai':
                return <Badge variant="outline" className="bg-emerald-950/40 text-emerald-700 border-emerald-800">Selesai</Badge>;
            case 'ditolak':
                return <Badge variant="outline" className="bg-red-950/40 text-red-400 border-red-800">Ditolak</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Calculate status chart
    const maxVal = Math.max(stats.pending, stats.diproses, stats.selesai, stats.ditolak, 1);
    const getBarHeight = (val: number) => {
        return (val / maxVal) * 120;
    };

    // Calculate verification completion rate
    const completionRate = stats.total > 0 
        ? Math.round((stats.selesai / stats.total) * 100)
        : 0;

    return (
        <>
            <Head title="BPJS Kesehatan Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Welcome Card with Deep Dark-Green/Black Gradient Background */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-800/40 bg-gradient-to-r from-neutral-950 via-emerald-950 to-neutral-950 p-6 md:p-8 shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_60%)]" />
                    <div className="relative z-10 max-w-3xl">
                        <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-700 backdrop-blur-sm">
                            BPJS Kesehatan Verifikasi Portal
                        </span>
                        <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-emerald-700 tracking-tight">
                            Selamat Datang, Tim Verifikator BPJS Kesehatan
                        </h1>
                        <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                            Kelola validasi berkas usulan TMT pensiun PNS Kota Padang. Mutasikan kepesertaan PNS aktif menjadi jaminan pensiunan untuk kelancaran pelayanan fasilitas kesehatan.
                        </p>
                    </div>
                </div>

                {/* Main Stats Summary Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Stat Card 1 */}
                    <Card className="relative overflow-hidden border border-emerald-900 bg-emerald-950/20 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Pengajuan</span>
                                <div className="p-2 bg-emerald-950/40 border border-emerald-800/30 rounded-lg">
                                    <Layers className="size-4 text-emerald-700" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-emerald-700">{stats.total}</span>
                                <span className="text-xs text-neutral-500">Berkas masuk</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-800" />
                        </CardContent>
                    </Card>

                    {/* Stat Card 2 */}
                    <Card className="relative overflow-hidden border border-emerald-900 bg-emerald-950/20 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Antrean Pending</span>
                                <div className="p-2 bg-amber-950/40 border border-amber-800/30 rounded-lg">
                                    <Clock className="size-4 text-amber-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-amber-400">{stats.pending}</span>
                                <span className="text-xs text-neutral-500">Belum diproses</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-700" />
                        </CardContent>
                    </Card>

                    {/* Stat Card 3 */}
                    <Card className="relative overflow-hidden border border-emerald-900 bg-emerald-950/20 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Sedang Diproses</span>
                                <div className="p-2 bg-blue-950/40 border border-blue-800/30 rounded-lg">
                                    <Play className="size-4 text-blue-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-blue-400">{stats.diproses}</span>
                                <span className="text-xs text-neutral-500">Tahap validasi</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-800" />
                        </CardContent>
                    </Card>

                    {/* Stat Card 4 */}
                    <Card className="relative overflow-hidden border border-emerald-900 bg-emerald-950/20 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Mutasi Selesai</span>
                                <div className="p-2 bg-emerald-950/40 border border-emerald-800/30 rounded-lg">
                                    <CheckCircle2 className="size-4 text-emerald-700" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-emerald-700">{stats.selesai}</span>
                                <span className="text-xs text-neutral-500">Sukses mutasi</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-800" />
                        </CardContent>
                    </Card>

                    {/* Stat Card 5 */}
                    <Card className="relative overflow-hidden border border-emerald-900 bg-emerald-950/20 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Berkas Ditolak</span>
                                <div className="p-2 bg-red-950/40 border border-red-800/30 rounded-lg">
                                    <XCircle className="size-4 text-red-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-red-400">{stats.ditolak}</span>
                                <span className="text-xs text-neutral-500">Butuh revisi</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-800" />
                        </CardContent>
                    </Card>
                </div>

                {/* Graphics & Info Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Visual Status Bar Chart */}
                    <Card className="border border-neutral-800 bg-neutral-900 shadow-sm">
                        <CardHeader className="p-4 border-b border-neutral-800 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700">
                                <BarChart3 className="size-4 text-emerald-700" />
                                Rekap Grafik Kerja Antrean
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                            <div className="w-full flex items-end justify-around h-[160px] border-b border-neutral-800 pb-2">
                                {/* Bar Pending */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-amber-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.pending}</span>
                                    <div 
                                        style={{ height: `${getBarHeight(stats.pending)}px` }}
                                        className="w-full bg-amber-500 dark:bg-amber-600 rounded-t-md hover:bg-amber-400 dark:hover:bg-amber-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-400 mt-2 font-semibold">Pending</span>
                                </div>

                                {/* Bar Diproses */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-blue-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.diproses}</span>
                                    <div 
                                        style={{ height: `${getBarHeight(stats.diproses)}px` }}
                                        className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-md hover:bg-blue-400 dark:hover:bg-blue-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-400 mt-2 font-semibold">Diproses</span>
                                </div>

                                {/* Bar Selesai */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-emerald-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.selesai}</span>
                                    <div 
                                        style={{ height: `${getBarHeight(stats.selesai)}px` }}
                                        className="w-full bg-emerald-500 dark:bg-emerald-600 rounded-t-md hover:bg-emerald-400 dark:hover:bg-emerald-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-400 mt-2 font-semibold">Selesai</span>
                                </div>

                                {/* Bar Ditolak */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-red-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.ditolak}</span>
                                    <div 
                                        style={{ height: `${getBarHeight(stats.ditolak)}px` }}
                                        className="w-full bg-red-500 dark:bg-red-600 rounded-t-md hover:bg-red-400 dark:hover:bg-red-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-400 mt-2 font-semibold">Ditolak</span>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-500 mt-4 text-center">
                                *Arahkan kursor pada batang untuk melihat angka detail.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Center Column: Completion Rate Circular Chart */}
                    <Card className="border border-neutral-800 bg-neutral-900 shadow-sm">
                        <CardHeader className="p-4 border-b border-neutral-800">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700">
                                <Percent className="size-4 text-emerald-700" />
                                Tingkat Mutasi Selesai
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                            {/* Circular SVG Progress */}
                            <div className="relative size-32">
                                <svg className="size-full -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="52"
                                        className="stroke-neutral-800 fill-transparent stroke-[10]"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="52"
                                        className="stroke-emerald-500 fill-transparent stroke-[10] transition-all duration-1000"
                                        strokeDasharray={2 * Math.PI * 52}
                                        strokeDashoffset={2 * Math.PI * 52 * (1 - completionRate / 100)}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-emerald-700">{completionRate}%</span>
                                    <span className="text-[10px] text-neutral-500 font-semibold">Completed</span>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-400 mt-5 text-center leading-relaxed">
                                Rasio berkas berhasil disetujui & dimutasikan dari total usulan masuk.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Right Column: Top Satuan Kerja & Guide */}
                    <Card className="border border-neutral-800 bg-neutral-900 shadow-sm">
                        <CardHeader className="p-4 border-b border-neutral-800">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700">
                                <Building className="size-4 text-emerald-700" />
                                Satker Teraktif Diajukan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {topSatker.length === 0 ? (
                                    <p className="text-xs text-neutral-500 italic py-8 text-center">Tidak ada data satuan kerja.</p>
                                ) : (
                                    topSatker.map((satker, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex items-center justify-center size-6 rounded bg-emerald-950 text-emerald-700 text-xs font-black shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-xs text-neutral-300 font-medium truncate">{satker.satuan_kerja}</span>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-700 shrink-0 ml-2">{satker.total} Usulan</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities Section */}
                <Card className="border border-neutral-800 bg-neutral-900 shadow-sm">
                    <CardHeader className="border-b border-neutral-800 p-4">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700">
                            <UserCheck className="size-4 text-emerald-700" />
                            Log Aktivitas Verifikasi Terakhir
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentActivities.length === 0 ? (
                            <div className="p-8 text-center text-sm text-neutral-500 italic">
                                Belum ada aktivitas verifikasi yang dicatat.
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-800">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="p-4 hover:bg-neutral-950 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-sm text-emerald-700">
                                                    {activity.pensiunan?.pegawai?.nama || 'N/A'}
                                                </span>
                                                <span className="text-xs text-neutral-500 font-mono">
                                                    (NIP. {activity.pensiunan?.pegawai?.nip || '-'})
                                                </span>
                                            </div>
                                            <div className="text-xs text-neutral-400 flex items-center gap-1.5 flex-wrap">
                                                <span>Oleh: <span className="font-medium text-neutral-300">{activity.user?.name || 'Sistem'}</span></span>
                                                <span className="text-neutral-700">•</span>
                                                <div className="flex items-center gap-1">
                                                    {activity.status_sebelumnya ? (
                                                        <>
                                                            <span className="capitalize text-neutral-500">{activity.status_sebelumnya}</span>
                                                            <ArrowRight className="size-3 text-neutral-600" />
                                                        </>
                                                    ) : null}
                                                    {getStatusBadge(activity.status_baru)}
                                                </div>
                                            </div>
                                            {activity.catatan && (
                                                <p className="text-xs text-neutral-400 italic mt-1 bg-neutral-950 p-2 rounded border border-neutral-800 max-w-2xl">
                                                    Catatan: "{activity.catatan}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-xs text-neutral-500 font-medium shrink-0 flex items-center gap-1">
                                            <Calendar className="size-3.5" />
                                            {new Date(activity.created_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'BPJS Dashboard',
            href: '/bpjs/dashboard',
        },
    ],
};
