import { dataSantri } from "./mongooseSchema.js";

function updateDataSantri(req, res) {
    const newDataSantri = {
        id : req.body.newId,
        nama_lengkap : req.body.newNama_lengkap
    }
    dataSantri.updateOne({ id : req.body.id }, newDataSantri).then((data)=>{
        if (data.modifiedCount > 0) {
            dataSantri.findOne({ id : newDataSantri.id }).then((data)=>{
                res.send(data);
            });
        } else {
            res.send({message : "data tidak ditemukan!"});
        }
    });
}

export default updateDataSantri;