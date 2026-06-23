import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Edit, Trash, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface Golongan {
    id: number;
    nama_golongan: string;
    pangkat: string;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    golongans: Paginated<Golongan>;
    filters: { search?: string };
}

export default function GolonganIndex({ golongans, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isOpen, setIsOpen] = useState(false);
    const [editingGolongan, setEditingGolongan] = useState<Golongan | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_golongan: '',
        pangkat: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/bkpsdm/golongan',
            { search },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingGolongan(null);
        setIsOpen(true);
    };

    const openEditModal = (golongan: Golongan) => {
        clearErrors();
        setEditingGolongan(golongan);
        setData({
            nama_golongan: golongan.nama_golongan,
            pangkat: golongan.pangkat,
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingGolongan) {
            put(`/bkpsdm/golongan/${editingGolongan.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    toast.success('Data golongan berhasil diperbarui.');
                },
                onError: () => {
                    toast.error('Gagal memperbarui data. Periksa inputan Anda.');
                }
            });
        } else {
            post('/bkpsdm/golongan', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    toast.success('Golongan baru berhasil ditambahkan.');
                },
                onError: () => {
                    toast.error('Gagal menambahkan golongan. Periksa inputan Anda.');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus golongan ini?')) {
            router.delete(`/bkpsdm/golongan/${id}`, {
                onSuccess: () => {
                    toast.success('Golongan berhasil dihapus.');
                },
                onError: (errors) => {
                    const message = Object.values(errors).join(', ') || 'Gagal menghapus golongan.';
                    toast.error(message);
                }
            });
        }
    };

    return (
        <>
            <Head title="Master Golongan & Pangkat" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-emerald-700">
                            Master Golongan & Pangkat
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Kelola data master golongan dan pangkat PNS yang digunakan untuk data pegawai.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} className="w-full md:w-auto gap-2">
                        <Plus className="size-4" />
                        Tambah Golongan
                    </Button>
                </div>

                <Card className="border border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:max-w-sm">
                            <Input
                                placeholder="Cari golongan atau pangkat..."
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
                                        <th scope="col" className="px-6 py-4 w-[10%]">No</th>
                                        <th scope="col" className="px-6 py-4 w-[40%]">Nama Golongan</th>
                                        <th scope="col" className="px-6 py-4 w-[40%]">Pangkat</th>
                                        <th scope="col" className="px-6 py-4 text-right w-[10%]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {golongans.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-neutral-400">
                                                Tidak ada data golongan.
                                            </td>
                                        </tr>
                                    ) : (
                                        golongans.data.map((golongan, idx) => (
                                            <tr key={golongan.id} className="hover:bg-neutral-50/50 dark:hover:bg-emerald-950/20 transition-colors">
                                                <td className="px-6 py-4 font-mono">
                                                    {(golongans.current_page - 1) * 10 + idx + 1}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-emerald-700">
                                                    {golongan.nama_golongan}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {golongan.pangkat}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => openEditModal(golongan)}
                                                            className="size-8"
                                                        >
                                                            <Edit className="size-4 text-neutral-600 dark:text-neutral-400" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleDelete(golongan.id)}
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
                    
                    {/* Pagination */}
                    {golongans.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                            <span className="text-sm text-neutral-500">
                                Menampilkan {golongans.data.length} dari {golongans.total} golongan
                            </span>
                            <div className="flex items-center gap-1">
                                {golongans.links.map((link, idx) => {
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

            {/* Modal Dialog Form */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingGolongan ? 'Edit Data Golongan' : 'Tambah Golongan Baru'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="nama_golongan">Nama Golongan <span className="text-red-500">*</span></Label>
                            <Input
                                id="nama_golongan"
                                placeholder="Contoh: IV/a, III/d"
                                value={data.nama_golongan}
                                onChange={(e) => setData('nama_golongan', e.target.value)}
                            />
                            {errors.nama_golongan && <p className="text-xs text-red-500">{errors.nama_golongan}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="pangkat">Pangkat <span className="text-red-500">*</span></Label>
                            <Input
                                id="pangkat"
                                placeholder="Contoh: Pembina, Penata Tingkat I"
                                value={data.pangkat}
                                onChange={(e) => setData('pangkat', e.target.value)}
                            />
                            {errors.pangkat && <p className="text-xs text-red-500">{errors.pangkat}</p>}
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingGolongan ? 'Simpan Perubahan' : 'Tambah Golongan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

GolonganIndex.layout = {
    breadcrumbs: [
        {
            title: 'BKPSDM Dashboard',
            href: '/bkpsdm/dashboard',
        },
        {
            title: 'Data Master Golongan',
            href: '/bkpsdm/golongan',
        },
    ],
};
