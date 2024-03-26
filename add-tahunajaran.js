import mongoose from "mongoose";

function addTahunAjaran(req, res) {

    const dataSchema = new mongoose.Schema({
        tahun_ajaran : {type : String, required : true},
        tanggal_awal : {type : String, required : true},
        tanggal_akhir : {type : String, required : true},
    });

    const dataTahunAjaran = mongoose.models.data_tahun_ajaran || mongoose.model('data_tahun_ajaran', dataSchema);
    
    const tanggal_awal = new Date(req.body.tanggal_awal);
    const tanggal_akhir = new Date(req.body.tanggal_akhir);

    const newTahunAjaran = new dataTahunAjaran({
        tahun_ajaran : req.body.tahun_ajaran,
        tanggal_awal : tanggal_awal.toISOString(),
        tanggal_akhir : tanggal_akhir.toISOString()
    })
    
    dataTahunAjaran.findOne({tahun_ajaran : req.body.tahun_ajaran}).then((data)=>{
        /** is data already exists */
        if (data != null) {
            res.status(200).send({messege:"data tahun ajaran sudah ada sebelumnya"});
        } else {
            /** save when data doesn't exists */
            newTahunAjaran.save().then(()=>{
                /** get all data including new data */
                dataTahunAjaran.find().then((data)=>{

                    res.status(200).json(data);

                }).catch((error)=>{
                    
                    console.log(error);
                    res.status(500).send({messege:"internal server error", error : error});
                })
            }).catch((error)=>{

                console.log(error);
                res.status(500).send({messege:"internal server error", error : error});
            });
        };
    }).catch((error)=>{
        console.log(error);
    });

}

export default addTahunAjaran;
