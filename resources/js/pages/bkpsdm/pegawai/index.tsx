import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Edit, Trash, ShieldAlert } from 'lucide-react';
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
    no_kk: string | null;
    nama: string;
    tempat_lahir: string | null;
    tanggal_lahir: string;
    jenis_kelamin: string | null;
    status_kawin: string | null;
    no_hp: string | null;
    alamat: string | null;
    hub_keluarga: string;
    golongan_id: number;
    golongan?: Golongan;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    pegawais: Paginated<Pegawai>;
    golongans: Golongan[];
    filters: { search?: string };
}

export default function PegawaiIndex({ pegawais, golongans, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isOpen, setIsOpen] = useState(false);
    const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nip: '',
        nik: '',
        no_kk: '',
        nama: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: 'Laki-laki',
        status_kawin: 'Menikah',
        no_hp: '',
        alamat: '',
        hub_keluarga: 'PESERTA',
        golongan_id: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/bkpsdm/pegawai',
            { search },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingPegawai(null);
        setIsOpen(true);
    };

    const openEditModal = (pegawai: Pegawai) => {
        clearErrors();
        setEditingPegawai(pegawai);
        setData({
            nip: pegawai.nip,
            nik: pegawai.nik || '',
            no_kk: pegawai.no_kk || '',
            nama: pegawai.nama,
            tempat_lahir: pegawai.tempat_lahir || '',
            tanggal_lahir: pegawai.tanggal_lahir,
            jenis_kelamin: pegawai.jenis_kelamin || 'Laki-laki',
            status_kawin: pegawai.status_kawin || 'Menikah',
            no_hp: pegawai.no_hp || '',
            alamat: pegawai.alamat || '',
            hub_keluarga: pegawai.hub_keluarga,
            golongan_id: String(pegawai.golongan_id),
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPegawai) {
            put(`/bkpsdm/pegawai/${editingPegawai.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    toast.success('Data pegawai berhasil diperbarui.');
                },
                onError: () => {
                    toast.error('Gagal memperbarui data pegawai. Periksa kembali form.');
                }
            });
        } else {
            post('/bkpsdm/pegawai', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    toast.success('Pegawai baru berhasil ditambahkan.');
                },
                onError: () => {
                    toast.error('Gagal menambahkan pegawai. Periksa kembali form.');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data pegawai ini?')) {
            destroy(`/bkpsdm/pegawai/${id}`, {
                onSuccess: () => {
                    toast.success('Data pegawai berhasil dihapus.');
                },
                onError: () => {
                    toast.error('Gagal menghapus data pegawai.');
                }
            });
        }
    };

    return (
        <>
            <Head title="Data Master Pegawai" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            Data Master Pegawai
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Kelola data induk Pegawai Negeri Sipil (PNS) BKPSDM Kota Padang.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} className="w-full md:w-auto gap-2">
                        <Plus className="size-4" />
                        Tambah Pegawai
                    </Button>
                </div>

                <Card className="border border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:max-w-sm">
                            <Input
                                placeholder="Cari NIP, NIK, atau Nama..."
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
                                        <th scope="col" className="px-6 py-4">NIP / NIK</th>
                                        <th scope="col" className="px-6 py-4">Nama</th>
                                        <th scope="col" className="px-6 py-4">Pangkat/Golongan</th>
                                        <th scope="col" className="px-6 py-4">Hub. Keluarga</th>
                                        <th scope="col" className="px-6 py-4">No. HP</th>
                                        <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {pegawais.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-neutral-400">
                                                Tidak ada data pegawai.
                                            </td>
                                        </tr>
                                    ) : (
                                        pegawais.data.map((pegawai) => (
                                            <tr key={pegawai.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {pegawai.nip}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                        NIK: {pegawai.nik || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-neutral-900 dark:text-neutral-100">{pegawai.nama}</div>
                                                    <div className="text-xs text-neutral-500">
                                                        {pegawai.tempat_lahir || '-'}, {new Date(pegawai.tanggal_lahir).toLocaleDateString('id-ID')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {pegawai.golongan ? (
                                                        <div>
                                                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                                {pegawai.golongan.nama_golongan}
                                                            </div>
                                                            <div className="text-xs text-neutral-500">
                                                                {pegawai.golongan.pangkat}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {pegawai.hub_keluarga}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {pegawai.no_hp || <span className="text-neutral-400">-</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => openEditModal(pegawai)}
                                                            className="size-8"
                                                        >
                                                            <Edit className="size-4 text-neutral-600 dark:text-neutral-400" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleDelete(pegawai.id)}
                                                            className="size-8 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/20"
                                                        >
                                                            <Trash className="size-4 text-red-600 dark:text-red-400" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                    {pegawais.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                            <span className="text-sm text-neutral-500">
                                Menampilkan {pegawais.data.length} dari {pegawais.total} pegawai
                            </span>
                            <div className="flex items-center gap-1">
                                {pegawais.links.map((link, idx) => {
                                    if (link.label.includes('Previous')) {
                                        return (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url)}
                                                className="gap-1"
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
                                                className="gap-1"
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

            {/* Modal Input & Edit Pegawai */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPegawai ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="nip">NIP <span className="text-red-500">*</span></Label>
                                <Input
                                    id="nip"
                                    value={data.nip}
                                    onChange={(e) => setData('nip', e.target.value)}
                                    placeholder="Masukkan NIP"
                                />
                                {errors.nip && <p className="text-xs text-red-500">{errors.nip}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="nik">NIK</Label>
                                <Input
                                    id="nik"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    placeholder="Masukkan NIK"
                                />
                                {errors.nik && <p className="text-xs text-red-500">{errors.nik}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="nama">Nama Lengkap <span className="text-red-500">*</span></Label>
                                <Input
                                    id="nama"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Masukkan Nama Lengkap"
                                />
                                {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="no_kk">No. KK</Label>
                                <Input
                                    id="no_kk"
                                    value={data.no_kk}
                                    onChange={(e) => setData('no_kk', e.target.value)}
                                    placeholder="Masukkan No. KK"
                                />
                                {errors.no_kk && <p className="text-xs text-red-500">{errors.no_kk}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                                <Input
                                    id="tempat_lahir"
                                    value={data.tempat_lahir}
                                    onChange={(e) => setData('tempat_lahir', e.target.value)}
                                    placeholder="Masukkan Tempat Lahir"
                                />
                                {errors.tempat_lahir && <p className="text-xs text-red-500">{errors.tempat_lahir}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="tanggal_lahir">Tanggal Lahir <span className="text-red-500">*</span></Label>
                                <Input
                                    id="tanggal_lahir"
                                    type="date"
                                    value={data.tanggal_lahir}
                                    onChange={(e) => setData('tanggal_lahir', e.target.value)}
                                />
                                {errors.tanggal_lahir && <p className="text-xs text-red-500">{errors.tanggal_lahir}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="golongan_id">Golongan/Pangkat <span className="text-red-500">*</span></Label>
                                <Select
                                    value={data.golongan_id}
                                    onValueChange={(val) => setData('golongan_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Golongan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {golongans.map((g) => (
                                            <SelectItem key={g.id} value={String(g.id)}>
                                                {g.nama_golongan} - {g.pangkat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.golongan_id && <p className="text-xs text-red-500">{errors.golongan_id}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                                <Select
                                    value={data.jenis_kelamin}
                                    onValueChange={(val) => setData('jenis_kelamin', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Jenis Kelamin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="status_kawin">Status Kawin</Label>
                                <Select
                                    value={data.status_kawin}
                                    onValueChange={(val) => setData('status_kawin', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Menikah">Menikah</SelectItem>
                                        <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                                        <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                                        <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="hub_keluarga">Hubungan Keluarga <span className="text-red-500">*</span></Label>
                                <Select
                                    value={data.hub_keluarga}
                                    onValueChange={(val) => setData('hub_keluarga', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Hubungan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PESERTA">PESERTA</SelectItem>
                                        <SelectItem value="SUAMI">SUAMI</SelectItem>
                                        <SelectItem value="ISTERI">ISTERI</SelectItem>
                                        <SelectItem value="ANAK">ANAK</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="no_hp">No. HP</Label>
                                <Input
                                    id="no_hp"
                                    value={data.no_hp}
                                    onChange={(e) => setData('no_hp', e.target.value)}
                                    placeholder="Masukkan No. HP"
                                />
                                {errors.no_hp && <p className="text-xs text-red-500">{errors.no_hp}</p>}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="alamat">Alamat</Label>
                            <textarea
                                id="alamat"
                                rows={3}
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Masukkan Alamat Lengkap"
                            />
                            {errors.alamat && <p className="text-xs text-red-500">{errors.alamat}</p>}
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingPegawai ? 'Simpan Perubahan' : 'Tambah Pegawai'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

PegawaiIndex.layout = {
    breadcrumbs: [
        {
            title: 'BKPSDM Dashboard',
            href: '/bkpsdm/dashboard',
        },
        {
            title: 'Data Master Pegawai',
            href: '/bkpsdm/pegawai',
        },
    ],
};
