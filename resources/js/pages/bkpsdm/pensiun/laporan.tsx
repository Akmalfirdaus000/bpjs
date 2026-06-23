import { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft } from 'lucide-react';

interface Golongan {
    id: number;
    nama_golongan: string;
    pangkat: string;
}

interface Pegawai {
    id: number;
    nip: string;
    nama: string;
    tanggal_lahir: string;
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

export default function LaporanPensiun({ pensiunans, filters }: Props) {
    useEffect(() => {
        // Automatically open printer dialog after page loads
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
            <Head title="Cetak Laporan Pengajuan Pensiun" />
            
            {/* Top Navigation Bar - Hidden during printing */}
            <div className="print:hidden flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm mb-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.history.back()} className="gap-1">
                        <ChevronLeft className="size-4" />
                        Kembali
                    </Button>
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                        Pratinjau Cetak Laporan Pensiunan
                    </span>
                </div>
                <Button onClick={() => window.print()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Printer className="size-4" />
                    Cetak Laporan (PDF)
                </Button>
            </div>

            {/* Document Sheet Layout */}
            <div className="max-w-4xl mx-auto p-8 bg-white text-neutral-950 dark:bg-white dark:text-neutral-950 shadow-lg print:shadow-none print:p-0 my-4 print:my-0">
                {/* Official Letterhead (Kop Surat) */}
                <div className="flex items-center justify-center border-b-4 border-double border-neutral-900 pb-4 mb-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold uppercase tracking-wide">Pemerintah Kota Padang</h2>
                        <h1 className="text-2xl font-black uppercase tracking-wider my-0.5">
                            Badan Kepegawaian dan Pengembangan Sumber Daya Manusia (BKPSDM)
                        </h1>
                        <p className="text-xs text-neutral-600">
                            Jl. Bagindo Aziz Chan No. 1, Aie Pacah, Kec. Koto Tanggah, Kota Padang, Sumatera Barat
                        </p>
                        <p className="text-xs text-neutral-500">
                            Telp: (0751) 460300 | Email: bkpsdm@padang.go.id | Kode Pos: 25176
                        </p>
                    </div>
                </div>

                {/* Document Title */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold uppercase underline tracking-wide">
                        Laporan Rekapitulasi Pengajuan Pensiunan PNS
                    </h3>
                    <p className="text-sm text-neutral-700 mt-1">
                        Periode: <span className="font-semibold">{periodLabel}</span>
                    </p>
                    {filters.status && filters.status !== 'all' && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Filter Status: <span className="font-bold uppercase">{getStatusLabel(filters.status)}</span>
                        </p>
                    )}
                </div>

                {/* Table Content */}
                <table className="w-full text-xs border-collapse border border-neutral-800">
                    <thead>
                        <tr className="bg-neutral-100 border-b border-neutral-800 font-bold">
                            <th className="border border-neutral-800 px-3 py-2 text-center w-[5%]">No</th>
                            <th className="border border-neutral-800 px-3 py-2 text-left w-[25%]">NIP / Nama</th>
                            <th className="border border-neutral-800 px-3 py-2 text-left w-[15%]">Golongan / Pangkat</th>
                            <th className="border border-neutral-800 px-3 py-2 text-center w-[12%]">TMT Pensiun</th>
                            <th className="border border-neutral-800 px-3 py-2 text-left w-[20%]">Satuan Kerja</th>
                            <th className="border border-neutral-800 px-3 py-2 text-right w-[13%]">Gaji Pokok</th>
                            <th className="border border-neutral-800 px-3 py-2 text-center w-[10%]">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pensiunans.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="border border-neutral-800 px-3 py-6 text-center text-neutral-500 italic">
                                    Tidak ada data pensiunan dalam kriteria laporan ini.
                                </td>
                            </tr>
                        ) : (
                            pensiunans.map((pensiunan, idx) => (
                                <tr key={pensiunan.id} className="border-b border-neutral-800">
                                    <td className="border border-neutral-800 px-3 py-2 text-center">{idx + 1}</td>
                                    <td className="border border-neutral-800 px-3 py-2 font-medium">
                                        <div>{pensiunan.pegawai?.nama}</div>
                                        <div className="text-[10px] text-neutral-600 font-mono">NIP. {pensiunan.pegawai?.nip}</div>
                                    </td>
                                    <td className="border border-neutral-800 px-3 py-2">
                                        {pensiunan.pegawai?.golongan ? (
                                            <div>
                                                <div>{pensiunan.pegawai.golongan.nama_golongan}</div>
                                                <div className="text-[10px] text-neutral-500">{pensiunan.pegawai.golongan.pangkat}</div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="border border-neutral-800 px-3 py-2 text-center">
                                        {new Date(pensiunan.tanggal_pensiun).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="border border-neutral-800 px-3 py-2">{pensiunan.satuan_kerja}</td>
                                    <td className="border border-neutral-800 px-3 py-2 text-right font-mono">
                                        {formatRupiah(pensiunan.gaji_pokok)}
                                    </td>
                                    <td className="border border-neutral-800 px-3 py-2 text-center font-bold">
                                        <span className={
                                            pensiunan.status === 'selesai' ? 'text-green-700' :
                                            pensiunan.status === 'ditolak' ? 'text-red-700' :
                                            pensiunan.status === 'diproses' ? 'text-blue-700' : 'text-yellow-700'
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
                <div className="mt-12 flex justify-end text-sm">
                    <div className="text-center w-[300px]">
                        <p>Padang, {todayDate}</p>
                        <p className="font-semibold mt-1">Kepala BKPSDM Kota Padang</p>
                        <div className="h-20"></div> {/* Sign space */}
                        <p className="font-bold underline">___________________________</p>
                        <p className="text-xs text-neutral-600">NIP. 19780512 200501 1 002</p>
                    </div>
                </div>
            </div>
        </>
    );
}
