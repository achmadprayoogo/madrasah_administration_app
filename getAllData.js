import { dataSantri } from "./mongooseSchema.js";

function getAllData(req, res) {
    dataSantri.find().then((data)=>{

        if (!data) {
            res.status(200).send({message : "data tidak ditemukan"})
        } else {
            res.status(200).send(data);
        }
        
    }).catch((error)=> res.status(500).send({message : "server error", error : error}))
}

export default getAllData;