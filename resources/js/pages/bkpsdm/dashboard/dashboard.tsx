import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    FileSpreadsheet, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    Building, 
    Calendar,
    BarChart3,
    HelpCircle,
    FileText,
    TrendingUp,
    Bookmark
} from 'lucide-react';

interface Stats {
    totalPegawai: number;
    totalPengajuan: number;
    pending: number;
    diproses: number;
    selesai: number;
    ditolak: number;
}

interface Golongan {
    id: number;
    nama_golongan: string;
    pangkat: string;
}

interface Pegawai {
    id: number;
    nip: string;
    nama: string;
    golongan?: Golongan;
}

interface Pensiunan {
    id: number;
    tanggal_pensiun: string;
    satuan_kerja: string;
    status: 'pending' | 'diproses' | 'selesai' | 'ditolak';
    pegawai?: Pegawai;
    created_at: string;
}

interface TopSatker {
    satuan_kerja: string;
    total: number;
}

interface GolonganDistribution {
    nama_golongan: string;
    total: number;
}

interface Props {
    stats: Stats;
    recentPensions: Pensiunan[];
    topSatker: TopSatker[];
    golonganDistribution: GolonganDistribution[];
}

export default function Dashboard({ stats, recentPensions, topSatker = [], golonganDistribution = [] }: Props) {
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
    const maxStatusVal = Math.max(stats.pending, stats.diproses, stats.selesai, stats.ditolak, 1);
    const getStatusBarHeight = (val: number) => {
        return (val / maxStatusVal) * 120;
    };

    // Calculate golongan chart max
    const maxGolonganVal = golonganDistribution.length > 0 
        ? Math.max(...golonganDistribution.map(g => g.total), 1)
        : 1;

    return (
        <>
            <Head title="BKPSDM Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Welcome Card with Deep Dark-Green/Black Gradient Background */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-800/40 bg-gradient-to-r from-neutral-950 via-emerald-950 to-neutral-950 p-6 md:p-8 shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_60%)]" />
                    <div className="relative z-10 max-w-3xl">
                        <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-700 backdrop-blur-sm">
                            BKPSDM Administrator Portal
                        </span>
                        <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-emerald-700 tracking-tight">
                            Selamat Datang di Portal Utama BKPSDM
                        </h1>
                        <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                            Monitor pengusulan pensiunan PNS Kota Padang dengan visualisasi data langsung, integrasi mutasi BPJS Kesehatan, dan pengelolaan master data kepegawaian dalam satu dasbor terpadu.
                        </p>
                    </div>
                </div>

                {/* Main Stats Summary Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Stat Card 1 */}
                    <Card className="relative overflow-hidden border border-emerald-900 bg-emerald-950/20 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total PNS Aktif</span>
                                <div className="p-2 bg-emerald-950/40 border border-emerald-800/30 rounded-lg">
                                    <Users className="size-4 text-emerald-700" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{stats.totalPegawai}</span>
                                <span className="text-xs text-neutral-500">PNS terdaftar</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-800" />
                        </CardContent>
                    </Card>

                    {/* Stat Card 2 */}
                    <Card className="relative overflow-hidden border border-emerald-900 bg-emerald-950/20 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Pengajuan</span>
                                <div className="p-2 bg-emerald-950/40 border border-emerald-800/30 rounded-lg">
                                    <FileSpreadsheet className="size-4 text-emerald-700" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{stats.totalPengajuan}</span>
                                <span className="text-xs text-neutral-500">Berkas diajukan</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-800" />
                        </CardContent>
                    </Card>

                    {/* Stat Card 3 */}
                    <Card className="relative overflow-hidden border border-emerald-900 bg-emerald-950/20 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Dalam Proses BPJS</span>
                                <div className="p-2 bg-amber-950/40 border border-amber-800/30 rounded-lg">
                                    <Clock className="size-4 text-amber-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-amber-400">{stats.pending + stats.diproses}</span>
                                <span className="text-xs text-neutral-500">Menunggu verifikasi</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-700" />
                        </CardContent>
                    </Card>

                    {/* Stat Card 4 */}
                    <Card className="relative overflow-hidden border border-emerald-900 bg-emerald-950/20 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Mutasi Selesai</span>
                                <div className="p-2 bg-emerald-950/40 border border-emerald-800/30 rounded-lg">
                                    <CheckCircle className="size-4 text-emerald-700" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-emerald-700">{stats.selesai}</span>
                                <span className="text-xs text-neutral-500">Mutasi disahkan</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-800" />
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
                                Beban Status Pengajuan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                            <div className="w-full flex items-end justify-around h-[160px] border-b border-neutral-800 pb-2">
                                {/* Bar Pending */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-amber-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.pending}</span>
                                    <div 
                                        style={{ height: `${getStatusBarHeight(stats.pending)}px` }}
                                        className="w-full bg-amber-500 dark:bg-amber-600 rounded-t-md hover:bg-amber-400 dark:hover:bg-amber-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-400 mt-2 font-semibold">Pending</span>
                                </div>

                                {/* Bar Diproses */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-blue-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.diproses}</span>
                                    <div 
                                        style={{ height: `${getStatusBarHeight(stats.diproses)}px` }}
                                        className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-md hover:bg-blue-400 dark:hover:bg-blue-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-400 mt-2 font-semibold">Diproses</span>
                                </div>

                                {/* Bar Selesai */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-emerald-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.selesai}</span>
                                    <div 
                                        style={{ height: `${getStatusBarHeight(stats.selesai)}px` }}
                                        className="w-full bg-emerald-500 dark:bg-emerald-600 rounded-t-md hover:bg-emerald-400 dark:hover:bg-emerald-500 transition-all duration-300 min-h-[4px]"
                                    />
                                    <span className="text-[10px] text-neutral-400 mt-2 font-semibold">Selesai</span>
                                </div>

                                {/* Bar Ditolak */}
                                <div className="flex flex-col items-center w-12 group">
                                    <span className="text-xs font-bold text-red-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{stats.ditolak}</span>
                                    <div 
                                        style={{ height: `${getStatusBarHeight(stats.ditolak)}px` }}
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

                    {/* Center Column: Golongan Distribution Progress Bar Chart */}
                    <Card className="border border-neutral-800 bg-neutral-900 shadow-sm">
                        <CardHeader className="p-4 border-b border-neutral-800">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700">
                                <Bookmark className="size-4 text-emerald-700" />
                                Distribusi Golongan Pensiunan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {golonganDistribution.length === 0 ? (
                                <p className="text-xs text-neutral-500 italic py-8 text-center">Tidak ada data golongan pensiun.</p>
                            ) : (
                                golonganDistribution.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-semibold text-neutral-300">{item.nama_golongan}</span>
                                            <span className="font-bold text-emerald-700">{item.total} Pegawai</span>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                            <div 
                                                style={{ width: `${(item.total / maxGolonganVal) * 100}%` }}
                                                className="h-full bg-emerald-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: Top Satuan Kerja & Guide */}
                    <Card className="border border-neutral-800 bg-neutral-900 shadow-sm">
                        <CardHeader className="p-4 border-b border-neutral-800">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700">
                                <Building className="size-4 text-emerald-700" />
                                Satker Terbanyak Mengajukan
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
                                            <span className="text-xs font-bold text-emerald-700 shrink-0 ml-2">{satker.total} Berkas</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent submissions section */}
                <Card className="border border-neutral-800 bg-neutral-900 shadow-sm">
                    <CardHeader className="border-b border-neutral-800 p-4">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700">
                            <FileText className="size-4 text-emerald-700" />
                            Daftar Pengajuan Pensiun Terakhir
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentPensions.length === 0 ? (
                            <div className="p-8 text-center text-sm text-neutral-500 italic">
                                Belum ada pengajuan pensiun yang diajukan.
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-800">
                                {recentPensions.map((pensiunan) => (
                                    <div key={pensiunan.id} className="p-4 hover:bg-neutral-950 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-sm text-emerald-700">
                                                    {pensiunan.pegawai?.nama || 'N/A'}
                                                </span>
                                                <span className="text-xs text-neutral-500 font-mono">
                                                    (NIP. {pensiunan.pegawai?.nip || '-'})
                                                </span>
                                                {pensiunan.pegawai?.golongan && (
                                                    <span className="text-xs text-neutral-400">
                                                        - {pensiunan.pegawai.golongan.nama_golongan} / {pensiunan.pegawai.golongan.pangkat}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-neutral-400 flex items-center gap-1.5 flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <Building className="size-3 text-neutral-500" />
                                                    <span>Satker: <span className="font-medium text-neutral-300">{pensiunan.satuan_kerja}</span></span>
                                                </div>
                                                <span className="text-neutral-700">•</span>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="size-3 text-neutral-500" />
                                                    <span>TMT Pensiun: <span className="font-medium">{new Date(pensiunan.tanggal_pensiun).toLocaleDateString('id-ID')}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            {getStatusBadge(pensiunan.status)}
                                            <div className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                                                <span>Dibuat: {new Date(pensiunan.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
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
            title: 'BKPSDM Dashboard',
            href: '/bkpsdm/dashboard',
        },
    ],
};
