import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Printer, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Golongan {
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
    gaji_pokok: string;
    status: string;
    pegawai?: Pegawai;
    verifier?: { name: string };
    verified_at: string;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    pensiunans: Paginated<Pensiunan>;
    filters: {
        search?: string;
    };
}

export default function LaporanBpjs({ pensiunans, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportStatus, setReportStatus] = useState('selesai');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/pimpinan/laporan-bpjs',
            { search },
            { preserveState: true, replace: true }
        );
    };

    const handlePrintReport = (e: React.FormEvent) => {
        e.preventDefault();
        const url = `/pimpinan/laporan-bpjs/cetak?start_date=${startDate}&end_date=${endDate}&status=${reportStatus}`;
        window.open(url, '_blank');
        setIsReportOpen(false);
    };

    const formatRupiah = (value: string | number) => {
        const numeric = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(numeric);
    };

    return (
        <>
            <Head title="Laporan Mutasi Selesai (BPJS Kesehatan)" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-emerald-700">
                            Laporan Mutasi Selesai (BPJS Kesehatan)
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Monitoring usulan pensiun PNS yang telah selesai diproses mutasi kepesertaan BPJS.
                        </p>
                    </div>
                    <Button onClick={() => setIsReportOpen(true)} className="w-full md:w-auto gap-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-950">
                        <Printer className="size-4" />
                        Cetak Rekap Laporan
                    </Button>
                </div>

                <Card className="border border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:max-w-sm">
                            <Input
                                placeholder="Cari nama atau NIP..."
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
                                        <th scope="col" className="px-6 py-4">No</th>
                                        <th scope="col" className="px-6 py-4">NIP & Nama Pegawai</th>
                                        <th scope="col" className="px-6 py-4">Golongan</th>
                                        <th scope="col" className="px-6 py-4">Satuan Kerja</th>
                                        <th scope="col" className="px-6 py-4 font-mono">Gaji Pokok</th>
                                        <th scope="col" className="px-6 py-4">Verifikator BPJS</th>
                                        <th scope="col" className="px-6 py-4 text-center">Tgl Mutasi</th>
                                        <th scope="col" className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {pensiunans.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-8 text-center text-neutral-400">
                                                Tidak ada data usulan selesai.
                                            </td>
                                        </tr>
                                    ) : (
                                        pensiunans.data.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-emerald-950/20 transition-colors">
                                                <td className="px-6 py-4 font-mono">
                                                    {(pensiunans.current_page - 1) * 10 + idx + 1}
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="font-semibold text-neutral-900 dark:text-emerald-700">{item.pegawai?.nama || '-'}</div>
                                                    <div className="text-xs text-neutral-500 font-mono">NIP. {item.pegawai?.nip || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {item.pegawai?.golongan ? (
                                                        <div>
                                                            <div>{item.pegawai.golongan.nama_golongan}</div>
                                                            <div className="text-[10px] text-neutral-500">{item.pegawai.golongan.pangkat}</div>
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">{item.satuan_kerja}</td>
                                                <td className="px-6 py-4 font-mono">{formatRupiah(item.gaji_pokok)}</td>
                                                <td className="px-6 py-4">{item.verifier?.name || '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.verified_at ? new Date(item.verified_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    }) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-150 text-green-800 border border-green-200 dark:bg-emerald-950/40 dark:text-emerald-500 dark:border-emerald-800/40">
                                                        Selesai Mutasi
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>

                    {/* Pagination */}
                    {pensiunans.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                            <span className="text-sm text-neutral-500">
                                Menampilkan {pensiunans.data.length} dari {pensiunans.total} usulan
                            </span>
                            <div className="flex items-center gap-1">
                                {pensiunans.links.map((link, idx) => {
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

            {/* Print Report Dialog */}
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cetak Laporan Rekapitulasi Mutasi BPJS</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePrintReport} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="start_date">Tanggal Awal</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="end_date">Tanggal Akhir</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="report_status">Filter Status Usulan</Label>
                            <Select value={reportStatus} onValueChange={setReportStatus}>
                                <SelectTrigger id="report_status">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="selesai">Selesai (Mutasi)</SelectItem>
                                    <SelectItem value="all">Semua Status BPJS (Selesai, Ditolak, Diproses)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsReportOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" className="gap-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-950 text-white">
                                <Printer className="size-4" />
                                Buka Pratinjau Cetak
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

LaporanBpjs.layout = {
    breadcrumbs: [
        {
            title: 'Pimpinan Dashboard',
            href: '/pimpinan/dashboard',
        },
        {
            title: 'Laporan BPJS',
            href: '/pimpinan/laporan-bpjs',
        },
    ],
};
