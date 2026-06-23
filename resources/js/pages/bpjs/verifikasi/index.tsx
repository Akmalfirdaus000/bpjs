import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, FileText, CheckCircle, Clock, XCircle, Play, Eye, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface Golongan {
    id: number;
    nama_golongan: string;
    pangkat: string;
}

interface Pegawai {
    id: number;
    nip: string;
    nik: string | null;
    nama: string;
    tanggal_lahir: string;
    golongan?: Golongan;
}

interface Riwayat {
    id: number;
    status_sebelumnya: string | null;
    status_baru: string;
    catatan: string | null;
    created_at: string;
    user?: { name: string };
}

interface Pensiunan {
    id: number;
    pegawai_id: number;
    tanggal_pensiun: string;
    satuan_kerja: string;
    gaji_pokok: string;
    status: 'pending' | 'diproses' | 'selesai' | 'ditolak';
    dokumen_sk: string | null;
    catatan: string | null;
    pegawai?: Pegawai;
    user?: { name: string };
    verified_by?: number;
    verified_by_user?: { name: string };
    verified_at?: string;
    created_at: string;
    riwayats?: Riwayat[];
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
    processableCount: number;
    filters: { search?: string; status?: string };
}

export default function VerifikasiIndex({ pensiunans, processableCount = 0, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPensiunan, setSelectedPensiunan] = useState<Pensiunan | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [reportFilter, setReportFilter] = useState({
        start_date: '',
        end_date: '',
        status: 'all',
    });

    const { data, setData, patch, processing, errors, reset } = useForm({
        status: '',
        catatan: '',
    });

    const bulkForm = useForm({
        email: '',
        password: '',
    });

    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        bulkForm.post('/bpjs/verifikasi/bulk-approve', {
            onSuccess: () => {
                setIsBulkOpen(false);
                bulkForm.reset();
                toast.success('Persetujuan masal 50 data berhasil diproses.');
            },
            onError: () => {
                toast.error('Gagal melakukan otorisasi. Periksa kembali email dan kata sandi Pimpinan.');
            }
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/bpjs/verifikasi',
            { search, status: statusFilter === 'all' ? '' : statusFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val);
        router.get(
            '/bpjs/verifikasi',
            { search, status: val === 'all' ? '' : val },
            { preserveState: true, replace: true }
        );
    };

    const openVerifikasiModal = (pensiunan: Pensiunan) => {
        setSelectedPensiunan(pensiunan);
        setData({
            status: pensiunan.status,
            catatan: '',
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPensiunan) return;

        patch(`/bpjs/verifikasi/${selectedPensiunan.id}/status`, {
            onSuccess: () => {
                setIsOpen(false);
                reset();
                toast.success('Status pengajuan berhasil diperbarui.');
            },
            onError: () => {
                toast.error('Gagal memperbarui status pengajuan.');
            }
        });
    };

    const handlePrintReport = (e: React.FormEvent) => {
        e.preventDefault();
        const url = `/bpjs/verifikasi/laporan?start_date=${reportFilter.start_date}&end_date=${reportFilter.end_date}&status=${reportFilter.status}`;
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

    const renderStatusBadge = (status: Pensiunan['status']) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-amber-950/40 dark:text-amber-500 dark:border-amber-800/40">
                        <Clock className="size-3" />
                        Pending
                    </span>
                );
            case 'diproses':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-500 dark:border-blue-800/40">
                        <Play className="size-3" />
                        Diproses
                    </span>
                );
            case 'selesai':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-emerald-950/40 dark:text-emerald-500 dark:border-emerald-800/40">
                        <CheckCircle className="size-3" />
                        Selesai
                    </span>
                );
            case 'ditolak':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-500 dark:border-red-800/40">
                        <XCircle className="size-3" />
                        Ditolak
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Verifikasi Pensiunan" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-emerald-700 flex items-center gap-2">
                            <Clock className="size-6 text-neutral-600 dark:text-emerald-700" />
                            Antrean Verifikasi Pensiunan
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Pantau, verifikasi, dan lakukan mutasi status kepesertaan BPJS Kesehatan dari pengajuan BKPSDM.
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        {processableCount >= 50 && (
                            <Button onClick={() => setIsBulkOpen(true)} className="w-full md:w-auto gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                                <CheckCircle className="size-4" />
                                Setujui Masal (50+)
                            </Button>
                        )}
                        <Button onClick={() => setIsReportOpen(true)} variant="outline" className="w-full md:w-auto gap-2 border-neutral-200 dark:border-emerald-800/40 text-neutral-700 dark:text-emerald-700 hover:bg-neutral-50 dark:hover:bg-emerald-950/30">
                            <Printer className="size-4" />
                            Cetak Laporan
                        </Button>
                    </div>
                </div>

                <Card className="border border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:max-w-sm">
                            <Input
                                placeholder="Cari NIP atau Nama..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                            <Button type="submit" variant="secondary" size="icon">
                                <Search className="size-4" />
                            </Button>
                        </form>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Label className="text-xs text-neutral-500 uppercase whitespace-nowrap">Filter Status:</Label>
                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="diproses">Diproses</SelectItem>
                                    <SelectItem value="selesai">Selesai</SelectItem>
                                    <SelectItem value="ditolak">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
                                <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-emerald-950/40 dark:text-emerald-700 border-b border-neutral-200 dark:border-emerald-900/40">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Nama / NIP</th>
                                        <th scope="col" className="px-6 py-4">TMT Pensiun</th>
                                        <th scope="col" className="px-6 py-4">Satker Pensiun</th>
                                        <th scope="col" className="px-6 py-4">Gaji Pokok</th>
                                        <th scope="col" className="px-6 py-4">Pengirim</th>
                                        <th scope="col" className="px-6 py-4">Status</th>
                                        <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {pensiunans.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-neutral-400">
                                                Tidak ada pengajuan untuk diverifikasi.
                                            </td>
                                        </tr>
                                    ) : (
                                        pensiunans.data.map((pensiunan) => (
                                            <tr key={pensiunan.id} className="hover:bg-neutral-50/50 dark:hover:bg-emerald-950/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {pensiunan.pegawai ? (
                                                        <>
                                                            <div className="font-semibold text-neutral-900 dark:text-emerald-700">
                                                                {pensiunan.pegawai.nama}
                                                            </div>
                                                            <div className="text-xs text-neutral-500">
                                                                NIP: {pensiunan.pegawai.nip}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-neutral-400">Data Pegawai Terhapus</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-neutral-900 dark:text-emerald-700">
                                                        {new Date(pensiunan.tanggal_pensiun).toLocaleDateString('id-ID')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-neutral-950 dark:text-emerald-700 font-medium">
                                                        {pensiunan.satuan_kerja}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-semibold text-neutral-900 dark:text-emerald-700">
                                                        {formatRupiah(pensiunan.gaji_pokok)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs">
                                                    {pensiunan.user ? pensiunan.user.name : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {renderStatusBadge(pensiunan.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openVerifikasiModal(pensiunan)}
                                                        className="gap-1.5"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        Detail & Verifikasi
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                    {pensiunans.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                            <span className="text-sm text-neutral-500">
                                Menampilkan {pensiunans.data.length} dari {pensiunans.total} pengajuan
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

            {/* Modal Detail & Proses Verifikasi */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail & Proses Verifikasi Pensiunan</DialogTitle>
                    </DialogHeader>

                    {selectedPensiunan && (
                        <div className="space-y-6">
                            {/* Grid Detail Pegawai */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-neutral-50 dark:bg-emerald-950/20 border border-neutral-200 dark:border-emerald-900/40 text-sm">
                                <div>
                                    <span className="text-neutral-500 font-medium block">Nama Pegawai:</span>
                                    <span className="font-semibold text-neutral-900 dark:text-emerald-700">
                                        {selectedPensiunan.pegawai?.nama || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-500 font-medium block">NIP:</span>
                                    <span className="font-semibold text-neutral-900 dark:text-emerald-700">
                                        {selectedPensiunan.pegawai?.nip || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-500 font-medium block">Tanggal Lahir:</span>
                                    <span className="font-semibold text-neutral-900 dark:text-emerald-700">
                                        {selectedPensiunan.pegawai?.tanggal_lahir 
                                            ? new Date(selectedPensiunan.pegawai.tanggal_lahir).toLocaleDateString('id-ID')
                                            : '-'
                                        }
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-500 font-medium block">Pangkat / Golongan:</span>
                                    <span className="font-semibold text-neutral-900 dark:text-emerald-700">
                                        {selectedPensiunan.pegawai?.golongan 
                                            ? `${selectedPensiunan.pegawai.golongan.nama_golongan} / ${selectedPensiunan.pegawai.golongan.pangkat}`
                                            : '-'
                                        }
                                    </span>
                                </div>
                                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2 col-span-2"></div>
                                <div>
                                    <span className="text-neutral-500 font-medium block">TMT Pensiun:</span>
                                    <span className="font-semibold text-neutral-900 dark:text-emerald-700">
                                        {new Date(selectedPensiunan.tanggal_pensiun).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-500 font-medium block">Satuan Kerja Pensiun:</span>
                                    <span className="font-semibold text-neutral-900 dark:text-emerald-700">
                                        {selectedPensiunan.satuan_kerja}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-500 font-medium block">Gaji Pokok Pensiun:</span>
                                    <span className="font-semibold text-neutral-900 dark:text-emerald-700 text-green-600 dark:text-green-400">
                                        {formatRupiah(selectedPensiunan.gaji_pokok)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-500 font-medium block">SK Pensiun:</span>
                                    {selectedPensiunan.dokumen_sk ? (
                                        <a
                                            href={`/storage/${selectedPensiunan.dokumen_sk}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                        >
                                            <FileText className="size-4" />
                                            Lihat Lampiran SK
                                        </a>
                                    ) : (
                                        <span className="text-neutral-400">Tidak ada file</span>
                                    )}
                                </div>
                            </div>

                            {/* Alur Riwayat Status (Log Audit) */}
                            {selectedPensiunan.riwayats && selectedPensiunan.riwayats.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-emerald-700">Riwayat Perjalanan Dokumen:</h4>
                                    <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-3 pl-5 space-y-4">
                                        {selectedPensiunan.riwayats.map((riwayat) => (
                                            <div key={riwayat.id} className="relative">
                                                <span className="absolute -left-[27px] top-0.5 flex size-4 items-center justify-center rounded-full bg-neutral-200 dark:bg-emerald-950 border border-neutral-300 dark:border-emerald-800">
                                                    <span className="size-2 rounded-full bg-neutral-500 dark:bg-emerald-700" />
                                                </span>
                                                <div className="text-xs">
                                                    <span className="font-bold text-neutral-900 dark:text-emerald-450">
                                                        Status diubah ke {riwayat.status_baru.toUpperCase()}
                                                    </span>{' '}
                                                    oleh{' '}
                                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                        {riwayat.user?.name || 'Sistem'}
                                                    </span>
                                                    <span className="text-neutral-400 block mt-0.5">
                                                        {new Date(riwayat.created_at).toLocaleString('id-ID')}
                                                    </span>
                                                    {riwayat.catatan && (
                                                        <p className="mt-1 p-2 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 italic">
                                                            "{riwayat.catatan}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Form Ubah Status */}
                            <form onSubmit={handleSubmit} className="space-y-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="status">Tindakan Verifikasi <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(val) => setData('status', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Tindakan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Tetap Pending</SelectItem>
                                                <SelectItem value="diproses">Proses Dokumen</SelectItem>
                                                <SelectItem value="selesai">Verifikasi & Selesai (Mutasi)</SelectItem>
                                                <SelectItem value="ditolak">Tolak Pengajuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="catatan">Catatan / Alasan (Opsional)</Label>
                                    <textarea
                                        id="catatan"
                                        rows={3}
                                        value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Tulis alasan jika menolak, atau catatan proses verifikasi..."
                                    />
                                    {errors.catatan && <p className="text-xs text-red-500">{errors.catatan}</p>}
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                        Tutup
                                    </Button>
                                    <Button type="submit" disabled={processing} className="font-bold">
                                        Simpan Verifikasi
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal Dialog Cetak Laporan */}
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Filter Cetak Laporan Verifikasi</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePrintReport} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="report_start_date">TMT Mulai Pensiun</Label>
                            <Input
                                id="report_start_date"
                                type="date"
                                value={reportFilter.start_date}
                                onChange={(e) => setReportFilter({ ...reportFilter, start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="report_end_date">TMT Akhir Pensiun</Label>
                            <Input
                                id="report_end_date"
                                type="date"
                                value={reportFilter.end_date}
                                onChange={(e) => setReportFilter({ ...reportFilter, end_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="report_status">Status Pengajuan</Label>
                            <Select
                                value={reportFilter.status}
                                onValueChange={(val) => setReportFilter({ ...reportFilter, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="diproses">Diproses</SelectItem>
                                    <SelectItem value="selesai">Selesai</SelectItem>
                                    <SelectItem value="ditolak">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsReportOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" className="font-bold gap-2">
                                <Printer className="size-4" />
                                Buka Pratinjau Cetak
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Dialog Persetujuan Masal */}
            <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-600 font-bold">
                            <CheckCircle className="size-5" />
                            Otorisasi Persetujuan Masal (50 Data)
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBulkSubmit} className="space-y-4">
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Anda akan menyetujui sekaligus <span className="font-bold text-neutral-900 dark:text-neutral-200">50 berkas pengajuan pensiunan</span> yang sedang dalam antrean (status Pending / Diproses).
                            <br />
                            <span className="font-semibold text-amber-600 dark:text-amber-500 mt-2 block">
                                Tindakan ini memerlukan otorisasi berupa verifikasi email dan kata sandi Pimpinan.
                            </span>
                        </p>

                        <div className="space-y-1">
                            <Label htmlFor="bulk_email">Email Pimpinan <span className="text-red-500">*</span></Label>
                            <Input
                                id="bulk_email"
                                type="email"
                                placeholder="Contoh: pimpinan@gmail.com"
                                value={bulkForm.data.email}
                                onChange={(e) => bulkForm.setData('email', e.target.value)}
                                required
                            />
                            {bulkForm.errors.email && <p className="text-xs text-red-500">{bulkForm.errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="bulk_password">Kata Sandi Pimpinan <span className="text-red-500">*</span></Label>
                            <Input
                                id="bulk_password"
                                type="password"
                                placeholder="Masukkan kata sandi pimpinan"
                                value={bulkForm.data.password}
                                onChange={(e) => bulkForm.setData('password', e.target.value)}
                                required
                            />
                            {bulkForm.errors.password && <p className="text-xs text-red-500">{bulkForm.errors.password}</p>}
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsBulkOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={bulkForm.processing} className="font-bold bg-emerald-700 hover:bg-emerald-800 text-white">
                                Verifikasi & Approve 50 Data
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

VerifikasiIndex.layout = {
    breadcrumbs: [
        {
            title: 'BPJS Dashboard',
            href: '/bpjs/dashboard',
        },
        {
            title: 'Antrean Verifikasi',
            href: '/bpjs/verifikasi',
        },
    ],
};
