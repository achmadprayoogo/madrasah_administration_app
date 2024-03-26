import { dataSantri } from "./mongooseSchema.js";

function updateWaliKelas(req, res) {
    try {
        const ID = parseInt(req.body.id);
        const TAHUN_AJARAN = req.body.tahun_ajaran;
        const KELAS = req.body.kelas;
        const WALIKELAS = req.body.new_walikelas;

        if (WALIKELAS !== null) {
            dataSantri.updateOne(
                { 
                    id: ID, 
                    "statistik_madrasah_diniyyah.tahun_ajaran": TAHUN_AJARAN 
                },
                { 
                    $set: {
                        "statistik_madrasah_diniyyah.$[elem].walikelas": parseInt(WALIKELAS),
                        "statistik_madrasah_diniyyah.$[elem].kelas": KELAS
                    } 
                },
                { 
                    arrayFilters: [ { "elem.tahun_ajaran": TAHUN_AJARAN } ] 
                }
                ).then((data)=>{

                if (data.matchedCount > 0) {

                    if (data.modifiedCount > 0) {
                        res.status(200).send({ messege : "data has been updated"});
                    } else {
                        res.status(200).send({ messege : "update is not success, maybe your input data is same"})
                    }

                } else {
                    res.status(200).send({ messege : "update is not success, your input category is not founded"})
                }
            })
            
        } else {
            res.status(200).send({ messege : "update is not success, your input data is not complete"})
        };
    } catch (error) {
        res.status(500).send({ messege : "internal server error", error : err})
    }
}

export default updateWaliKelas;