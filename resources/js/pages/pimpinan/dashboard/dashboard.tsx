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
    Percent,
    Users,
    FileText,
    Bookmark,
    FileSpreadsheet
} from 'lucide-react';

interface Stats {
    totalPegawai: number;
    totalPengajuan: number;
    pending: number;
    diproses: number;
    selesai: number;
    ditolak: number;
}

interface GolonganDist {
    nama_golongan: string;
    total: number;
}

interface TopSatker {
    satuan_kerja: string;
    total: number;
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

interface RecentPension {
    id: number;
    satuan_kerja: string;
    tanggal_pensiun: string;
    status: string;
    created_at: string;
    pegawai?: {
        nama: string;
        nip: string;
        golongan?: {
            nama_golongan: string;
            pangkat: string;
        }
    };
}

interface Props {
    stats: Stats;
    recentPensions: RecentPension[];
    recentActivities: RecentActivity[];
    topSatker: TopSatker[];
    golonganDistribution: GolonganDist[];
}

export default function PimpinanDashboard({ stats, recentPensions, recentActivities, topSatker = [], golonganDistribution = [] }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">Pending</Badge>;
            case 'diproses':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">Diproses</Badge>;
            case 'selesai':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-emerald-950/40 dark:text-emerald-700 dark:border-emerald-800">Selesai</Badge>;
            case 'ditolak':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">Ditolak</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const maxStatusVal = Math.max(stats.pending, stats.diproses, stats.selesai, stats.ditolak, 1);
    const getStatusBarHeight = (val: number) => {
        return (val / maxStatusVal) * 120;
    };

    const maxGolonganVal = golonganDistribution.length > 0 
        ? Math.max(...golonganDistribution.map(g => g.total), 1)
        : 1;

    const completionRate = stats.totalPengajuan > 0 
        ? Math.round((stats.selesai / stats.totalPengajuan) * 100) 
        : 0;

    return (
        <>
            <Head title="Pimpinan Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Welcome Card with Adaptive Gradient Background */}
                <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-emerald-800/40 bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-50 dark:from-neutral-950 dark:via-emerald-950 dark:to-neutral-950 p-6 md:p-8 shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_60%)]" />
                    <div className="relative z-10 max-w-3xl">
                        <span className="inline-block rounded-full bg-emerald-550/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-neutral-800 dark:text-emerald-700 backdrop-blur-sm">
                            Executive Portal & Monitoring
                        </span>
                        <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-neutral-950 dark:text-emerald-700 tracking-tight">
                            Selamat Datang di Sistem Pelaporan Pensiunan PNS BPJS Kesehatan
                        </h1>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-350 leading-relaxed">
                            Akses monitoring data usulan pensiunan PNS Kota Padang. Dapatkan visualisasi statistik pengajuan, progres mutasi kepesertaan BPJS Kesehatan, serta cetak laporan terpadu secara langsung.
                        </p>
                    </div>
                </div>

                {/* Main Stats Summary Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Stat Card 1 */}
                    <Card className="relative overflow-hidden border border-neutral-200 dark:border-emerald-900 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Total PNS Aktif</span>
                                <div className="p-2 bg-neutral-100 dark:bg-emerald-950/40 border border-neutral-200 dark:border-emerald-800/30 rounded-lg">
                                    <Users className="size-4 text-neutral-700 dark:text-emerald-700" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-neutral-900 dark:text-emerald-700">{stats.totalPegawai}</span>
                                <span className="text-xs text-neutral-500">PNS terdaftar</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-300 dark:bg-emerald-800" />
                        </CardContent>
                    </Card>

                    {/* Stat Card 2 */}
                    <Card className="relative overflow-hidden border border-neutral-200 dark:border-emerald-900 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Total Usulan Pensiun</span>
                                <div className="p-2 bg-neutral-100 dark:bg-emerald-950/40 border border-neutral-200 dark:border-emerald-800/30 rounded-lg">
                                    <FileSpreadsheet className="size-4 text-neutral-700 dark:text-emerald-700" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-neutral-900 dark:text-emerald-700">{stats.totalPengajuan}</span>
                                <span className="text-xs text-neutral-500">Berkas diajukan</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-300 dark:bg-emerald-800" />
                        </CardContent>
                    </Card>

                    {/* Stat Card 3 */}
                    <Card className="relative overflow-hidden border border-neutral-200 dark:border-emerald-900 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Menunggu Proses (Pending)</span>
                                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                                    <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.pending + stats.diproses}</span>
                                <span className="text-xs text-neutral-500">Perlu Verifikasi</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 dark:bg-amber-700" />
                        </CardContent>
                    </Card>

                    {/* Stat Card 4 */}
                    <Card className="relative overflow-hidden border border-neutral-200 dark:border-emerald-900 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Mutasi Selesai</span>
                                <div className="p-2 bg-green-100 dark:bg-emerald-950/40 border border-green-200 dark:border-emerald-800/30 rounded-lg">
                                    <CheckCircle2 className="size-4 text-green-600 dark:text-emerald-700" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-green-700 dark:text-emerald-700">{stats.selesai}</span>
                                <span className="text-xs text-neutral-500">Mutasi disahkan</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 dark:bg-emerald-800" />
                        </CardContent>
                    </Card>
                </div>

                {/* Graphics & Info Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Visual Status Bar Chart */}
                    <Card className="border border-neutral-200 dark:border-neutral-800 bg-card shadow-sm">
                        <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-neutral-950 dark:text-emerald-700">
                                <BarChart3 className="size-4 text-neutral-600 dark:text-emerald-700" />
                                Beban Status Pengajuan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                            <div className="w-full flex items-end justify-around h-[160px] border-b border-neutral-200 dark:border-neutral-800 pb-2">
                                {/* Bar Pending */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.pending}</span>
                                    <div 
                                        style={{ height: `${getStatusBarHeight(stats.pending)}px` }}
                                        className="w-full bg-amber-500 dark:bg-amber-600 rounded-t-md hover:bg-amber-400 dark:hover:bg-amber-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2 font-semibold">Pending</span>
                                </div>

                                {/* Bar Diproses */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.diproses}</span>
                                    <div 
                                        style={{ height: `${getStatusBarHeight(stats.diproses)}px` }}
                                        className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-md hover:bg-blue-400 dark:hover:bg-blue-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2 font-semibold">Diproses</span>
                                </div>

                                {/* Bar Selesai */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-green-600 dark:text-emerald-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.selesai}</span>
                                    <div 
                                        style={{ height: `${getStatusBarHeight(stats.selesai)}px` }}
                                        className="w-full bg-emerald-500 dark:bg-emerald-600 rounded-t-md hover:bg-emerald-400 dark:hover:bg-emerald-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2 font-semibold">Selesai</span>
                                </div>

                                {/* Bar Ditolak */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-red-600 dark:text-red-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.ditolak}</span>
                                    <div 
                                        style={{ height: `${getStatusBarHeight(stats.ditolak)}px` }}
                                        className="w-full bg-red-500 dark:bg-red-600 rounded-t-md hover:bg-red-400 dark:hover:bg-red-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2 font-semibold">Ditolak</span>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-500 mt-4 text-center">
                                *Arahkan kursor pada batang untuk melihat angka detail.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Center Column: Completion Progress Card */}
                    <Card className="border border-neutral-200 dark:border-neutral-800 bg-card shadow-sm">
                        <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-neutral-950 dark:text-emerald-700">
                                <Percent className="size-4 text-neutral-600 dark:text-emerald-700" />
                                Tingkat Penyelesaian Mutasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                            <div className="relative size-32 flex items-center justify-center">
                                <svg className="size-full transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="50"
                                        className="stroke-neutral-200 dark:stroke-neutral-800 fill-transparent stroke-[10]"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="50"
                                        style={{ strokeDasharray: `${2 * Math.PI * 50}`, strokeDashoffset: `${2 * Math.PI * 50 * (1 - completionRate / 100)}` }}
                                        className="stroke-emerald-500 fill-transparent stroke-[10] transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-2xl font-black text-neutral-950 dark:text-emerald-700">{completionRate}%</span>
                                    <p className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">Selesai</p>
                                </div>
                            </div>
                            <div className="mt-6 text-center text-xs text-neutral-500 leading-relaxed">
                                <span className="font-bold text-neutral-700 dark:text-neutral-350">{stats.selesai} dari {stats.totalPengajuan} usulan</span> pensiunan PNS telah berhasil dimutasikan ke database BPJS Kesehatan.
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Top Satuan Kerja & Golongan Distribution */}
                    <Card className="border border-neutral-200 dark:border-neutral-800 bg-card shadow-sm">
                        <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-neutral-950 dark:text-emerald-700">
                                <Bookmark className="size-4 text-neutral-600 dark:text-emerald-700" />
                                Distribusi Golongan Terbanyak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {golonganDistribution.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{item.nama_golongan}</span>
                                            <span className="font-bold text-green-600 dark:text-emerald-700">{item.total} Pegawai</span>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div 
                                                style={{ width: `${(item.total / maxGolonganVal) * 100}%` }}
                                                className="h-full bg-emerald-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submissions & Logs list */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left: Recent Submissions */}
                    <Card className="border border-neutral-200 dark:border-neutral-800 bg-card shadow-sm">
                        <CardHeader className="border-b border-neutral-200 dark:border-neutral-800 p-4">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-neutral-950 dark:text-emerald-700">
                                <FileText className="size-4 text-neutral-600 dark:text-emerald-700" />
                                Daftar Usulan Pensiun Terakhir
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentPensions.length === 0 ? (
                                <div className="p-8 text-center text-sm text-neutral-500 italic">
                                    Belum ada pengajuan pensiun yang diajukan.
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-250 dark:divide-neutral-800">
                                    {recentPensions.map((pensiunan) => (
                                        <div key={pensiunan.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-sm text-neutral-950 dark:text-emerald-700">
                                                        {pensiunan.pegawai?.nama || 'N/A'}
                                                    </span>
                                                    <span className="text-xs text-neutral-500 font-mono">
                                                        (NIP. {pensiunan.pegawai?.nip || '-'})
                                                    </span>
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
                                                    <div className="flex items-center gap-1">
                                                        <Building className="size-3 text-neutral-400 dark:text-neutral-500" />
                                                        <span>Satker: <span className="font-medium text-neutral-700 dark:text-neutral-300">{pensiunan.satuan_kerja}</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                                                {getStatusBadge(pensiunan.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right: Recent status activity logs */}
                    <Card className="border border-neutral-200 dark:border-neutral-800 bg-card shadow-sm">
                        <CardHeader className="border-b border-neutral-200 dark:border-neutral-800 p-4">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-neutral-950 dark:text-emerald-700">
                                <UserCheck className="size-4 text-neutral-600 dark:text-emerald-700" />
                                Log Verifikasi & Mutasi Terakhir
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentActivities.length === 0 ? (
                                <div className="p-8 text-center text-sm text-neutral-500 italic">
                                    Belum ada log aktivitas verifikasi status.
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {recentActivities.map((act) => (
                                        <div key={act.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-1">
                                                    <div className="text-xs">
                                                        Operator <span className="font-bold text-neutral-800 dark:text-neutral-200">{act.user?.name || '-'}</span> mengubah status
                                                    </div>
                                                    <div className="text-sm font-semibold text-neutral-950 dark:text-emerald-700">
                                                        {act.pensiunan?.pegawai?.nama || 'N/A'}
                                                    </div>
                                                    {act.catatan && (
                                                        <div className="text-xs text-neutral-500 bg-neutral-100 dark:bg-emerald-950/20 border border-neutral-200 dark:border-emerald-800/30 p-2 rounded mt-1">
                                                            {act.catatan}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end shrink-0 gap-1.5">
                                                    {getStatusBadge(act.status_baru)}
                                                    <div className="text-[10px] text-neutral-500 font-medium">
                                                        {new Date(act.created_at).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

PimpinanDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Pimpinan Dashboard',
            href: '/pimpinan/dashboard',
        },
    ],
};
