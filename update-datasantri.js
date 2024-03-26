import { dataSantri } from "./mongooseSchema.js";

function updateDataSantri(req, res) {
    try {
        const newDataSantri = {
            id : req.body.newId,
            nama_lengkap : req.body.newNama_lengkap
        }
    
        dataSantri.updateOne({ id : req.body.id }, newDataSantri).then((data)=>{
            if (data.modifiedCount > 0) {
                dataSantri.findOne({ id : newDataSantri.id }).then((data)=>{
                    res.status(200).send(data);
                });
            } else {
                res.status(200).send({message : "data tidak ditemukan!"});
            }
        });
        
    } catch (error) {
        res.status(500).send({ messege : "internal server error", error : err});
    }
    
}

export default updateDataSantri;