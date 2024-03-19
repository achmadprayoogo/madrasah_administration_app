import mongoose from "mongoose";

function addKelas(req, res) {
    const tahunajaranCollection = mongoose.connection.collection('data_tahun_ajarans');

    const newData = {}
    const newKelas = {}
    newKelas[req.body.kelas] = req.body.walikelas; 
    newData[req.body.tingkat] = newKelas;

    tahunajaranCollection.findOne({tahun_ajaran : req.body.tahun_ajaran}).then((data)=>{
        if (!data.data_kelas) {
            tahunajaranCollection.updateOne(
                {tahun_ajaran : req.body.tahun_ajaran},
                {$set: { data_kelas : newData}})
                .then((data)=>{
                if (data) {
                    tahunajaranCollection.findOne({tahun_ajaran : req.body.tahun_ajaran}).then((data)=>{
                        res.status(200).send(data);
                    })
                } else {
                    console.log("data tidak ditemukan");
                    res.status(200).send("data tidak ditemukan");
                }
            });            
        } else {
            if (!data.data_kelas[req.body.tingkat]) {
                tahunajaranCollection.updateOne(
                    {tahun_ajaran : req.body.tahun_ajaran},
                    {$set: { [`data_kelas.${req.body.tingkat}`] : newKelas}})
                    .then((data)=>{
                    if (data) {
                        tahunajaranCollection.findOne({tahun_ajaran : req.body.tahun_ajaran}).then((data)=>{
                            console.log(data.data_kelas[req.body.tingkat]);
                            res.status(200).send(data);
                        })
                    } else {
                        console.log("data tidak ditemukan");
                        res.status(200).send("data tidak ditemukan");
                    }
                });                
            } else {
                tahunajaranCollection.updateOne(
                    {tahun_ajaran : req.body.tahun_ajaran},
                    {$set: { [`data_kelas.${req.body.tingkat}.${req.body.kelas}`] : req.body.walikelas}})
                    .then((data)=>{
                    if (data) {
                        tahunajaranCollection.findOne({tahun_ajaran : req.body.tahun_ajaran}).then((data)=>{
                            res.status(200).send(data);
                        })
                    } else {
                        console.log("data tidak ditemukan");
                        res.status(200).send("data tidak ditemukan");
                    }
                });    
            };
        };
    }).catch((error)=>{
        res.status(500).send({messege:"tidak bisa terhubung ke database", error : error});
        console.log(error);
    });
};

export default addKelas;