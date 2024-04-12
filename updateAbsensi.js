import { dataSantri } from "./mongooseSchema.js";

async function updateAbsensi(req, res) {
    const { tahunajaran, idkelas, dataabsen } = req.body;
    const tanggal = new Date(req.body.tanggal);
    const jam = parseInt(req.body.jam);
    const arrayID = dataabsen;

    // for (let i = 0; i < arrayID.length; i++) {
    //     const element = arrayID[i];
    //     arrayID[i] = JSON.parse(element);
    // }

    const response = await noteAbsen(arrayID);
    
    res.status(response.status).send(response);
/**----------------------------------------------------------------------------------- */
    async function noteAbsen(array) {
        const dataSaved = []
        const dataNotSaved = []
        let message;
        let status = 200;
        let error;

        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            const newObject = { id : element.id, tanggal : tanggal, jam : jam, absensi : element.absen};
            
            await dataSantri.updateOne(
                {
                    "id" : element.id, 
                    "statistik_madrasah_diniyyah.idkelas" : {$eq : parseInt(idkelas)}
                },
                {   
                    $setOnInsert : { "data_absensi" : []},
                    $set: {"statistik_madrasah_diniyyah.$[elem].data_absensi.$[innerElem]": newObject }
                },
                {
                    arrayFilters: [{ "elem.idkelas": parseInt(idkelas)} , {"innerElem.tanggal" : tanggal, "innerElem.jam" : jam}],
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            )
            .then((data)=> {
                if (data.modifiedCount !== 0) {
                    dataSaved.push(newObject)
                    status = 201;
                } else {
                    dataNotSaved.push(newObject)
                }
            })
            .catch((err) => {
                message = "internal server error";
                status = 500;
                error = err;
                console.log(err)
            })
        }
        return { message : message, status : status, error : error, data_saved : dataSaved, data_not_saved : dataNotSaved }
    }
}

export default updateAbsensi;