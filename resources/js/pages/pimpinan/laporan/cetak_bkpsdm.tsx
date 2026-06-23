import { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft } from 'lucide-react';

interface Golongan {
    nama_golongan: string;
    pangkat: string;
}

interface Pegawai {
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
    user?: { name: string };
    created_at: string;
}

interface Props {
    pensiunans: Pensiunan[];
    filters: {
        start_date?: string;
        end_date?: string;
        status?: string;
    };
}

export default function CetakLaporanBkpsdm({ pensiunans, filters }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const formatRupiah = (value: string | number) => {
        const numeric = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(numeric);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'PENDING';
            case 'diproses': return 'DIPROSES';
            case 'selesai': return 'SELESAI (MUTASI)';
            case 'ditolak': return 'DITOLAK';
            default: return status.toUpperCase();
        }
    };

    const todayDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const periodLabel = filters.start_date && filters.end_date
        ? `${new Date(filters.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} s/d ${new Date(filters.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : 'Semua Periode';

    return (
        <>
            <Head title="Cetak Laporan Usulan Pensiunan BKPSDM" />
            
            {/* Top Navigation Bar - Hidden during printing */}
            <div className="print:hidden flex items-center justify-between p-4 bg-background dark:bg-background border-b border-emerald-900/40 shadow-sm mb-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.history.back()} className="gap-1 border-emerald-900/40 text-emerald-750 hover:bg-emerald-950/30">
                        <ChevronLeft className="size-4" />
                        Kembali
                    </Button>
                    <span className="text-sm font-medium text-emerald-750">
                        Pratinjau Cetak Laporan Usulan Pensiun BKPSDM
                    </span>
                </div>
                <Button onClick={() => window.print()} className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-emerald-950 font-bold">
                    <Printer className="size-4" />
                    Cetak Laporan (PDF)
                </Button>
            </div>

            {/* Document Sheet Layout */}
            <div className="max-w-4xl mx-auto p-8 bg-card text-emerald-700 border border-emerald-900/40 shadow-lg print:shadow-none print:p-0 my-4 print:my-0 print:bg-white print:text-black print:border-none">
                {/* Official Letterhead (Kop Surat) */}
                <div className="flex items-center justify-center border-b-4 border-double border-emerald-900 print:border-neutral-900 pb-4 mb-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-black uppercase tracking-wider my-0.5 text-emerald-700 print:text-neutral-900">
                            Pemerintah Kota Padang
                        </h1>
                        <h2 className="text-lg font-bold uppercase tracking-wide text-emerald-700 print:text-neutral-900">
                            Badan Kepegawaian & Pengembangan Sumber Daya Manusia
                        </h2>
                        <p className="text-xs text-emerald-700/80 print:text-neutral-600">
                            Jl. Balai Kota Padang, Air Pacah, Kec. Koto Tangah, Kota Padang, Sumatera Barat
                        </p>
                        <p className="text-xs text-emerald-700/70 print:text-neutral-500">
                            Telp: (0751) 460300 | Website: bkpsdm.padang.go.id
                        </p>
                    </div>
                </div>

                {/* Document Title */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold uppercase underline tracking-wide text-emerald-700 print:text-neutral-900">
                        Laporan Rekapitulasi Pengajuan Pensiunan PNS
                    </h3>
                    <p className="text-sm text-emerald-700 print:text-neutral-750 mt-1">
                        Periode: <span className="font-semibold">{periodLabel}</span>
                    </p>
                    {filters.status && filters.status !== 'all' && (
                        <p className="text-xs text-emerald-700/80 print:text-neutral-500 mt-0.5">
                            Filter Status: <span className="font-bold uppercase">{getStatusLabel(filters.status)}</span>
                        </p>
                    )}
                </div>

                {/* Table Content */}
                <table className="w-full text-xs border-collapse border border-emerald-900 print:border-neutral-800">
                    <thead>
                        <tr className="bg-emerald-950/20 print:bg-neutral-100 border-b border-emerald-900 print:border-neutral-800 font-bold">
                            <th className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-center w-[5%]">No</th>
                            <th className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-left w-[25%]">NIP / Nama</th>
                            <th className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-left w-[15%]">Golongan</th>
                            <th className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-left w-[20%]">Satuan Kerja</th>
                            <th className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-center w-[12%]">TMT Pensiun</th>
                            <th className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-right w-[13%]">Gaji Pokok</th>
                            <th className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-center w-[10%]">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pensiunans.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="border border-emerald-900 print:border-neutral-800 px-3 py-6 text-center text-emerald-700/60 print:text-neutral-500 italic">
                                    Tidak ada data pengajuan dalam kriteria laporan ini.
                                </td>
                            </tr>
                        ) : (
                            pensiunans.map((pensiunan, idx) => (
                                <tr key={pensiunan.id} className="border-b border-emerald-900 print:border-neutral-800">
                                    <td className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-center">{idx + 1}</td>
                                    <td className="border border-emerald-900 print:border-neutral-800 px-2 py-2 font-medium">
                                        <div className="text-emerald-700 print:text-neutral-900">{pensiunan.pegawai?.nama}</div>
                                        <div className="text-[9px] text-emerald-700/70 print:text-neutral-600 font-mono">NIP. {pensiunan.pegawai?.nip}</div>
                                    </td>
                                    <td className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-emerald-700 print:text-neutral-900">
                                        {pensiunan.pegawai?.golongan?.nama_golongan || '-'}
                                    </td>
                                    <td className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-emerald-700 print:text-neutral-900">
                                        {pensiunan.satuan_kerja}
                                    </td>
                                    <td className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-center text-emerald-700 print:text-neutral-900">
                                        {new Date(pensiunan.tanggal_pensiun).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-right font-mono text-emerald-700 print:text-neutral-900">
                                        {formatRupiah(pensiunan.gaji_pokok)}
                                    </td>
                                    <td className="border border-emerald-900 print:border-neutral-800 px-2 py-2 text-center font-bold">
                                        <span className={
                                            pensiunan.status === 'selesai' ? 'text-green-700 print:text-green-800' :
                                            pensiunan.status === 'ditolak' ? 'text-red-700 print:text-red-800' :
                                            pensiunan.status === 'diproses' ? 'text-blue-700 print:text-blue-800' : 'text-yellow-750 print:text-yellow-800'
                                        }>
                                            {getStatusLabel(pensiunan.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Sign-off Section */}
                <div className="mt-12 flex justify-end text-sm text-emerald-700 print:text-neutral-900">
                    <div className="text-center w-[300px]">
                        <p>Padang, {todayDate}</p>
                        <p className="font-semibold mt-1">Kepala BKPSDM Kota Padang</p>
                        <div className="h-20"></div> {/* Sign space */}
                        <p className="font-bold underline">___________________________</p>
                        <p className="text-xs text-emerald-700/80 print:text-neutral-600">BKPSDM Kota Padang</p>
                    </div>
                </div>
            </div>
        </>
    );
}
