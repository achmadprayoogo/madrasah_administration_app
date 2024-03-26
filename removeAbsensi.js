import { dataSantri } from "./mongooseSchema.js";

async function removeAbsensi(req, res) {
    const { tahunajaran, idkelas, dataabsen } = req.body;
    const tanggal = new Date(req.body.tanggal);
    const jam = parseInt(req.body.jam);
    const arrayID = dataabsen;

    for (let i = 0; i < arrayID.length; i++) {
        const element = arrayID[i];
        arrayID[i] = JSON.parse(element);
    }

    const response = await noteAbsen(arrayID);
    
    res.status(response.status).send(response);
/**----------------------------------------------------------------------------------- */
    async function noteAbsen(array) {
        const dataRemoved = []
        const dataNotRemoved = []
        let message;
        let status = 200;
        let error;

        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            const newObject = { tanggal : tanggal, jam : jam};
            
            await dataSantri.updateOne(
                {
                    "id" : element.id, 
                    "statistik_madrasah_diniyyah.idkelas" : {$eq : parseInt(idkelas)}
                },
                {   
                    $setOnInsert : { "data_absensi" : []},
                    $pull: {"statistik_madrasah_diniyyah.$[elem].data_absensi": newObject }
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
                    dataRemoved.push(newObject)
                    status = 201;
                } else {
                    dataNotRemoved.push(newObject)
                }
            })
            .catch((err) => {
                message = "internal server error";
                status = 500;
                error = err;
                console.log(err)
            })
        }
        return { message : message, status : status, error : error, data_removed : dataRemoved, data_not_removed : dataNotRemoved }
    }
}

export default removeAbsensi;