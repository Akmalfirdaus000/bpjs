import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Plus, Edit, Trash, User } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: 'admin_bkpsdm' | 'admin_bpjs' | 'pimpinan';
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    users: Paginated<UserData>;
    filters: { search?: string };
}

export default function UserIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isOpen, setIsOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'admin_bkpsdm' as 'admin_bkpsdm' | 'admin_bpjs' | 'pimpinan',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/bkpsdm/user',
            { search },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingUser(null);
        setIsOpen(true);
    };

    const openEditModal = (user: UserData) => {
        clearErrors();
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '', // default empty, only change if filled
            role: user.role,
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(`/bkpsdm/user/${editingUser.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    toast.success('Data user admin berhasil diperbarui.');
                },
                onError: () => {
                    toast.error('Gagal memperbarui data. Periksa inputan Anda.');
                }
            });
        } else {
            post('/bkpsdm/user', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    toast.success('User admin baru berhasil ditambahkan.');
                },
                onError: () => {
                    toast.error('Gagal menambahkan user admin. Periksa inputan Anda.');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus akun admin ini?')) {
            router.delete(`/bkpsdm/user/${id}`, {
                onSuccess: () => {
                    toast.success('User admin berhasil dihapus.');
                },
                onError: (errors) => {
                    const message = Object.values(errors).join(', ') || 'Gagal menghapus user.';
                    toast.error(message);
                }
            });
        }
    };

    return (
        <>
            <Head title="Manajemen User Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-emerald-700">
                            Manajemen User Admin
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Kelola data akun administrator yang memiliki akses ke sistem BKPSDM dan BPJS Kesehatan.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} className="w-full md:w-auto gap-2">
                        <Plus className="size-4" />
                        Tambah Admin
                    </Button>
                </div>

                <Card className="border border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:max-w-sm">
                            <Input
                                placeholder="Cari nama, email, atau role..."
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
                                        <th scope="col" className="px-6 py-4 w-[30%]">Nama Lengkap</th>
                                        <th scope="col" className="px-6 py-4 w-[30%]">Alamat Email</th>
                                        <th scope="col" className="px-6 py-4 w-[20%]">Role Akses</th>
                                        <th scope="col" className="px-6 py-4 text-right w-[10%]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-neutral-400">
                                                Tidak ada data user.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user, idx) => (
                                            <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-emerald-950/20 transition-colors">
                                                <td className="px-6 py-4 font-mono">
                                                    {(users.current_page - 1) * 10 + idx + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                                                            <User className="size-4 text-neutral-600 dark:text-neutral-400" />
                                                        </div>
                                                        <span className="font-semibold text-neutral-900 dark:text-emerald-700">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                        user.role === 'admin_bkpsdm'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-500 dark:border-blue-800/40'
                                                            : user.role === 'admin_bpjs'
                                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-emerald-950/40 dark:text-emerald-500 dark:border-emerald-800/40'
                                                            : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-500 dark:border-purple-800/40'
                                                    }`}>
                                                        {user.role === 'admin_bkpsdm' ? 'Admin BKPSDM' : user.role === 'admin_bpjs' ? 'Admin BPJS' : 'Pimpinan'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => openEditModal(user)}
                                                            className="size-8"
                                                        >
                                                            <Edit className="size-4 text-neutral-600 dark:text-neutral-400" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleDelete(user.id)}
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
                    {users.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                            <span className="text-sm text-neutral-500">
                                Menampilkan {users.data.length} dari {users.total} user
                            </span>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, idx) => {
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
                            {editingUser ? 'Edit Data User Admin' : 'Tambah User Admin Baru'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                placeholder="Contoh: Budi Santoso"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email">Alamat Email <span className="text-red-500">*</span></Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Contoh: admin@bkpsdm.go.id"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password">
                                Kata Sandi {editingUser ? '(Kosongkan jika tidak ingin diubah)' : <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={editingUser ? 'Masukkan sandi baru jika ingin diubah' : 'Kata sandi minimal 3 karakter'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="role">Role Akses <span className="text-red-500">*</span></Label>
                            <Select
                                value={data.role}
                                onValueChange={(val) => setData('role', val as 'admin_bkpsdm' | 'admin_bpjs' | 'pimpinan')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin_bkpsdm">Admin BKPSDM</SelectItem>
                                    <SelectItem value="admin_bpjs">Admin BPJS Kesehatan</SelectItem>
                                    <SelectItem value="pimpinan">Pimpinan (Monitoring & Laporan)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingUser ? 'Simpan Perubahan' : 'Tambah Admin'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

UserIndex.layout = {
    breadcrumbs: [
        {
            title: 'BKPSDM Dashboard',
            href: '/bkpsdm/dashboard',
        },
        {
            title: 'Manajemen User Admin',
            href: '/bkpsdm/user',
        },
    ],
};
