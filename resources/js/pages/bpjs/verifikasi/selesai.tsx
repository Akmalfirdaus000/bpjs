import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Download, FileText, CheckCircle2, User } from 'lucide-react';

interface Golongan {
    nama_golongan: string;
    pangkat: string;
}

interface Pegawai {
    nip: string;
    nik: string;
    nama: string;
    golongan: Golongan;
}

interface UserData {
    name: string;
}

interface Pensiunan {
    id: number;
    pegawai: Pegawai;
    tanggal_pensiun: string;
    satuan_kerja: string;
    gaji_pokok: number;
    status: string;
    dokumen_sk: string | null;
    dokumen_ktp: string | null;
    verified_at: string;
    verifier: UserData | null;
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
    filters: { search?: string };
}

export default function PensiunanSelesai({ pensiunans, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/bpjs/verifikasi-selesai',
            { search },
            { preserveState: true, replace: true }
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title="Data Mutasi Pensiun Selesai" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="size-6 text-emerald-700" />
                        Mutasi Pensiun Selesai
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Daftar lengkap berkas pengajuan pensiun yang telah selesai dimutasi kepesertaannya oleh BPJS Kesehatan.
                    </p>
                </div>

                <Card className="border border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:max-w-sm">
                            <Input
                                placeholder="Cari nama atau NIP pegawai..."
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
                                        <th className="px-6 py-4">No</th>
                                        <th className="px-6 py-4">Pegawai</th>
                                        <th className="px-6 py-4">Golongan / Satker</th>
                                        <th className="px-6 py-4">Gaji Pokok</th>
                                        <th className="px-6 py-4">TMT Pensiun</th>
                                        <th className="px-6 py-4">Tanggal Verifikasi</th>
                                        <th className="px-6 py-4">Verifikator</th>
                                        <th className="px-6 py-4 text-center">Berkas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {pensiunans.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-8 text-center text-neutral-400">
                                                Tidak ada data mutasi pensiun selesai.
                                            </td>
                                        </tr>
                                    ) : (
                                        pensiunans.data.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                                                <td className="px-6 py-4 font-mono">
                                                    {(pensiunans.current_page - 1) * 10 + idx + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-emerald-700">{item.pegawai.nama}</span>
                                                        <span className="text-xs font-mono text-neutral-500">NIP: {item.pegawai.nip}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span>{item.pegawai.golongan?.nama_golongan} - {item.pegawai.golongan?.pangkat}</span>
                                                        <span className="text-xs text-neutral-500">{item.satuan_kerja}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono">
                                                    {formatCurrency(item.gaji_pokok)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {formatDate(item.tanggal_pensiun)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {formatDate(item.verified_at)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <User className="size-3 text-neutral-400" />
                                                        <span>{item.verifier?.name || 'Sistem'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {item.dokumen_sk && (
                                                            <a href={`/storage/${item.dokumen_sk}`} target="_blank" rel="noreferrer" title="Unduh SK">
                                                                <Button variant="outline" size="icon" className="size-8">
                                                                    <FileText className="size-4 text-neutral-600 dark:text-neutral-400" />
                                                                </Button>
                                                            </a>
                                                        )}
                                                        {item.dokumen_ktp && (
                                                            <a href={`/storage/${item.dokumen_ktp}`} target="_blank" rel="noreferrer" title="Unduh KTP">
                                                                <Button variant="outline" size="icon" className="size-8">
                                                                    <Download className="size-4 text-neutral-600 dark:text-neutral-400" />
                                                                </Button>
                                                            </a>
                                                        )}
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
                    {pensiunans.links.length > 3 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                            <span className="text-sm text-neutral-500">
                                Menampilkan {pensiunans.data.length} dari {pensiunans.total} pensiunan
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
        </>
    );
}

PensiunanSelesai.layout = {
    breadcrumbs: [
        {
            title: 'BPJS Dashboard',
            href: '/bpjs/dashboard',
        },
        {
            title: 'Mutasi Pensiun Selesai',
            href: '/bpjs/verifikasi-selesai',
        },
    ],
};
