import mongoose from "mongoose";

function updateWaliKelas(req, res) {
    const data_santriCollection = mongoose.connection.collection('data_santris');
    
    const WALIKELAS = req.body.new_walikelas
    const TAHUN_AJARAN = req.body.tahun_ajaran
    const id = req.body.id
    const ID = parseInt(id);
    if (WALIKELAS !== null) {
        data_santriCollection.updateOne({ id : ID, [`statistik_madrasah_diniyyah.tahun_ajaran`] : TAHUN_AJARAN },{ $set : {[`data_statistik.walikelas`] : WALIKELAS}}).then((data)=>{
            if (data.matchedCount > 0) {
                if (data.modifiedCount > 0) {
                    res.send("data has been updated");
                } else {
                    res.send("update is not success, maybe your input data is same")
                }
            } else {
                res.send("update is not success, your input category is not founded")
            }
        })
    } else {
        res.send("update is not success, your input data is not complete")
    };
}

export default updateWaliKelas;