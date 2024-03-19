import { dataTahunAjaran } from "./mongooseSchema.js";

function getTahunAjaranNow(req, res) {
    const dateNow = new Date();
    
    dataTahunAjaran.find().then((data)=>{
        data.forEach(element => {
            const tanggalAwal = new Date(element.tanggal_awal);
            const tanggalAkhir = new Date(element.tanggal_akhir);
            if ((tanggalAwal - dateNow) <= 0 && (tanggalAkhir - dateNow) >= 0) {
                res.send(element);
            };
        });
    })
}

export default getTahunAjaranNow;