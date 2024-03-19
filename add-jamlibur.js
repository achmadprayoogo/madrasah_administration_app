import mongoose from "mongoose";

function addJamLibur(req,res) {
    const tahunajaranCollection = mongoose.connection.collection('data_tahun_ajarans');

    const newHarilibur = {
        awal : {
            tanggal : req.body.tanggal_awal,
            jam : req.body.jam_awal
        },
        akhir : {
            tanggal : req.body.tanggal_akhir,
            jam : req.body.jam_akhir
        },
        keterangan : req.body.keterangan
    }

    tahunajaranCollection.updateOne(
        {tahun_ajaran : req.body.tahun_ajaran},
        {$push: { kbm_nonaktif : newHarilibur}})
        .then((data)=>{
            if (data.matchedCount > 0) {
                tahunajaranCollection.findOne({tahun_ajaran : req.body.tahun_ajaran}).then((data)=>{
                    res.status(200).send(data.kbm_nonaktif);
                })
            } else {
                res.send("data tahun ajaran tidak ditemukan");
            }
        });
}

export default addJamLibur;