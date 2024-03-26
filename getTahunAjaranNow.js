import { dataTahunAjaran } from "./mongooseSchema.js";

async function getTahunAjaranNow(req, res) {
    const dateNow = new Date("2024-01-01");
    let tahunAjaranFound = false;

    dataTahunAjaran.find().then((data)=>{

        if (!data) { return res.status(200).send({ message: "Tahun ajaran tidak ditemukan/database masih kosong. Silakan hubungi admin madrasah" });}
        
        data.forEach(element => {
            const tanggalAwal = new Date(element.tanggal_awal);
            const tanggalAkhir = new Date(element.tanggal_akhir);

            /** untuk mengecek tahun ajaran berapa sekarang */
            if ((tanggalAwal - dateNow) <= 0 && (tanggalAkhir - dateNow) >= 0) {
                tahunAjaranFound = true;
                res.status(200).send({ tahunAjaranNow : element });
            }

        });

        if (!tahunAjaranFound) {
            res.status(200).send({ message: "Tahun ajaran tidak ditemukan! Silakan hubungi admin madrasah" });
        };

    }).catch((err) => res.status(500).send({ messege : "internal server error", error : err}))
}

export default getTahunAjaranNow;