import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Trash, FileText, Download, CheckCircle, Clock, XCircle, Play, Edit, Printer } from 'lucide-react';
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
    created_at: string;
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
    pegawais: Pegawai[];
    filters: { search?: string; status?: string };
}

export default function PensiunIndex({ pensiunans, pegawais, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
    const [searchPegawaiQuery, setSearchPegawaiQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [editingPensiunan, setEditingPensiunan] = useState<Pensiunan | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportFilter, setReportFilter] = useState({
        start_date: '',
        end_date: '',
        status: 'all',
    });

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        pegawai_id: '',
        tanggal_pensiun: '',
        satuan_kerja: '',
        gaji_pokok: '',
        dokumen_sk: null as File | null,
    });

    const filteredPegawais = pegawais.filter((p) =>
        p.nama.toLowerCase().includes(searchPegawaiQuery.toLowerCase()) ||
        p.nip.includes(searchPegawaiQuery)
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/bkpsdm/pensiun',
            { search, status: statusFilter === 'all' ? '' : statusFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val);
        router.get(
            '/bkpsdm/pensiun',
            { search, status: val === 'all' ? '' : val },
            { preserveState: true, replace: true }
        );
    };

    // Watch pegawai selection change
    const handlePegawaiChange = (id: string) => {
        setData('pegawai_id', id);
        const peg = pegawais.find((p) => String(p.id) === id) || null;
        setSelectedPegawai(peg);
    };

    const openModal = () => {
        clearErrors();
        reset();
        setEditingPensiunan(null);
        setSelectedPegawai(null);
        setSearchPegawaiQuery('');
        setShowDropdown(false);
        setIsOpen(true);
    };

    const openEditModal = (pensiunan: Pensiunan) => {
        clearErrors();
        setEditingPensiunan(pensiunan);
        setSelectedPegawai(pensiunan.pegawai || null);
        if (pensiunan.pegawai) {
            setSearchPegawaiQuery(`${pensiunan.pegawai.nama} - NIP: ${pensiunan.pegawai.nip}`);
        }
        setData({
            pegawai_id: String(pensiunan.pegawai_id),
            tanggal_pensiun: pensiunan.tanggal_pensiun,
            satuan_kerja: pensiunan.satuan_kerja,
            gaji_pokok: String(pensiunan.gaji_pokok),
            dokumen_sk: null,
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPensiunan) {
            post(`/bkpsdm/pensiun/${editingPensiunan.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditingPensiunan(null);
                    setSelectedPegawai(null);
                    toast.success('Perbaikan pengajuan pensiun berhasil dikirim.');
                },
                onError: () => {
                    toast.error('Gagal memperbarui pengajuan pensiun. Periksa form.');
                }
            });
        } else {
            post('/bkpsdm/pensiun', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    toast.success('Pengajuan pensiun berhasil didaftarkan.');
                },
                onError: () => {
                    toast.error('Gagal mendaftarkan pengajuan pensiun. Periksa form.');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin membatalkan/menghapus pengajuan pensiun ini?')) {
            router.delete(`/bkpsdm/pensiun/${id}`, {
                onSuccess: () => {
                    toast.success('Pengajuan pensiun berhasil dibatalkan.');
                },
                onError: () => {
                    toast.error('Gagal menghapus pengajuan.');
                }
            });
        }
    };

    const handlePrintReport = (e: React.FormEvent) => {
        e.preventDefault();
        const url = `/bkpsdm/pensiun/laporan?start_date=${reportFilter.start_date}&end_date=${reportFilter.end_date}&status=${reportFilter.status}`;
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Clock className="size-3" />
                        Pending
                    </span>
                );
            case 'diproses':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        <Play className="size-3" />
                        Diproses
                    </span>
                );
            case 'selesai':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="size-3" />
                        Selesai
                    </span>
                );
            case 'ditolak':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="size-3" />
                        Ditolak
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Pengajuan Pensiun" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            Pengajuan Pensiun PNS
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Daftarkan pengajuan pensiun baru dan pantau status mutasi BPJS Kesehatan.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={() => setIsReportOpen(true)} variant="outline" className="w-full sm:w-auto gap-2">
                            <Printer className="size-4" />
                            Cetak Laporan
                        </Button>
                        <Button onClick={openModal} className="w-full sm:w-auto gap-2">
                            <Plus className="size-4" />
                            Ajukan Pensiun Baru
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
                                <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Nama / NIP</th>
                                        <th scope="col" className="px-6 py-4">TMT Pensiun</th>
                                        <th scope="col" className="px-6 py-4">Satker Pensiun</th>
                                        <th scope="col" className="px-6 py-4">Gaji Pokok</th>
                                        <th scope="col" className="px-6 py-4">Status</th>
                                        <th scope="col" className="px-6 py-4">Dokumen SK</th>
                                        <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {pensiunans.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-neutral-400">
                                                Tidak ada pengajuan pensiun.
                                            </td>
                                        </tr>
                                    ) : (
                                        pensiunans.data.map((pensiunan) => (
                                            <tr key={pensiunan.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {pensiunan.pegawai ? (
                                                        <>
                                                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
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
                                                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                        {new Date(pensiunan.tanggal_pensiun).toLocaleDateString('id-ID')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-neutral-950 dark:text-neutral-200 font-medium">
                                                        {pensiunan.satuan_kerja}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {formatRupiah(pensiunan.gaji_pokok)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {renderStatusBadge(pensiunan.status)}
                                                    {pensiunan.catatan && (
                                                        <div className="text-[10px] text-red-500 max-w-[150px] truncate mt-1" title={pensiunan.catatan}>
                                                            Catatan: {pensiunan.catatan}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {pensiunan.dokumen_sk ? (
                                                        <a
                                                            href={`/storage/${pensiunan.dokumen_sk}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                        >
                                                            <FileText className="size-3.5" />
                                                            Lihat SK
                                                        </a>
                                                    ) : (
                                                        <span className="text-neutral-400 text-xs">Tidak ada file</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    {(pensiunan.status === 'pending' || pensiunan.status === 'ditolak') ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => openEditModal(pensiunan)}
                                                                className="size-8"
                                                            >
                                                                <Edit className="size-4 text-neutral-600 dark:text-neutral-400" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleDelete(pensiunan.id)}
                                                                className="size-8 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/20"
                                                            >
                                                                <Trash className="size-4 text-red-600 dark:text-red-400" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400 text-xs">-</span>
                                                    )}
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

            {/* Modal Entri & Edit Data Pensiun */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPensiunan ? 'Edit Data Pengajuan Pensiun' : 'Ajukan Pensiun Baru'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1 relative">
                            <Label htmlFor="pegawai_id">Pilih Pegawai <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    id="pegawai_search_input"
                                    placeholder="Cari NIP atau Nama Pegawai..."
                                    value={searchPegawaiQuery}
                                    onChange={(e) => {
                                        setSearchPegawaiQuery(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    onBlur={() => {
                                        setTimeout(() => setShowDropdown(false), 250);
                                    }}
                                    disabled={!!editingPensiunan}
                                    className="w-full"
                                    autoComplete="off"
                                />
                                {data.pegawai_id && !editingPensiunan && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('pegawai_id', '');
                                            setSelectedPegawai(null);
                                            setSearchPegawaiQuery('');
                                        }}
                                        className="absolute right-3 top-2.5 text-xs text-neutral-500 hover:text-neutral-700 font-semibold"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                            
                            {showDropdown && !editingPensiunan && (
                                <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg">
                                    {filteredPegawais.length === 0 ? (
                                        <div className="p-3 text-sm text-neutral-500 text-center">
                                            Pegawai tidak ditemukan atau sudah diajukan pensiun.
                                        </div>
                                    ) : (
                                        filteredPegawais.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setData('pegawai_id', String(p.id));
                                                    setSelectedPegawai(p);
                                                    setSearchPegawaiQuery(`${p.nama} - NIP: ${p.nip}`);
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors flex flex-col border-b border-neutral-100 dark:border-neutral-900 last:border-b-0"
                                            >
                                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{p.nama}</span>
                                                <span className="text-xs text-neutral-500">NIP: {p.nip} {p.golongan ? `(${p.golongan.nama_golongan})` : ''}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                            {errors.pegawai_id && <p className="text-xs text-red-500">{errors.pegawai_id}</p>}
                        </div>

                        {/* Autofill section */}
                        {selectedPegawai && (
                            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 text-sm grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                <div>
                                    <span className="text-neutral-500 font-medium">Nama:</span>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{selectedPegawai.nama}</p>
                                </div>
                                <div>
                                    <span className="text-neutral-500 font-medium">NIP:</span>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{selectedPegawai.nip}</p>
                                </div>
                                <div>
                                    <span className="text-neutral-500 font-medium">Tanggal Lahir:</span>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                        {new Date(selectedPegawai.tanggal_lahir).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-neutral-500 font-medium">Golongan/Pangkat:</span>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                        {selectedPegawai.golongan 
                                            ? `${selectedPegawai.golongan.nama_golongan} / ${selectedPegawai.golongan.pangkat}`
                                            : '-'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="tanggal_pensiun">TMT Pensiun <span className="text-red-500">*</span></Label>
                                <Input
                                    id="tanggal_pensiun"
                                    type="date"
                                    value={data.tanggal_pensiun}
                                    onChange={(e) => setData('tanggal_pensiun', e.target.value)}
                                />
                                {errors.tanggal_pensiun && <p className="text-xs text-red-500">{errors.tanggal_pensiun}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="satuan_kerja">Satuan Kerja Pensiun <span className="text-red-500">*</span></Label>
                                <Input
                                    id="satuan_kerja"
                                    placeholder="Masukkan Satuan Kerja Pensiun"
                                    value={data.satuan_kerja}
                                    onChange={(e) => setData('satuan_kerja', e.target.value)}
                                />
                                {errors.satuan_kerja && <p className="text-xs text-red-500">{errors.satuan_kerja}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="gaji_pokok">Gaji Pokok (Rp) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="gaji_pokok"
                                    type="number"
                                    placeholder="Masukkan Gaji Pokok"
                                    value={data.gaji_pokok}
                                    onChange={(e) => setData('gaji_pokok', e.target.value)}
                                />
                                {errors.gaji_pokok && <p className="text-xs text-red-500">{errors.gaji_pokok}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="dokumen_sk">
                                    Upload SK Pensiun {!editingPensiunan && <span className="text-red-500">*</span>}
                                </Label>
                                <Input
                                    id="dokumen_sk"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setData('dokumen_sk', e.target.files ? e.target.files[0] : null)}
                                    className="cursor-pointer"
                                />
                                <span className="text-[10px] text-neutral-400 block mt-1">
                                    Format: PDF/JPG/JPEG/PNG. Max: 2MB {editingPensiunan && '(Biarkan kosong jika tidak ingin mengubah)'}
                                </span>
                                {errors.dokumen_sk && <p className="text-xs text-red-500">{errors.dokumen_sk}</p>}
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingPensiunan ? 'Simpan Perubahan' : 'Kirim Pengajuan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Dialog Cetak Laporan */}
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Filter Cetak Laporan Pensiun</DialogTitle>
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
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
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

PensiunIndex.layout = {
    breadcrumbs: [
        {
            title: 'BKPSDM Dashboard',
            href: '/bkpsdm/dashboard',
        },
        {
            title: 'Pengajuan Pensiun',
            href: '/bkpsdm/pensiun',
        },
    ],
};
