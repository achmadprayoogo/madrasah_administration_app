import { dataSantri, dataTahunAjaran } from "./mongooseSchema.js";

async function removeJamLibur(req, res) {
    try {
        const { tahun_ajaran, tanggal_awal, jam_awal, tanggal_akhir, jam_akhir, target, keterangan } = req.body;

        const newHariLibur = {
            awal: {
                tanggal: new Date(tanggal_awal),
                jam: parseInt(jam_awal)
            },
            akhir: {
                tanggal: new Date(tanggal_akhir),
                jam: parseInt(jam_akhir)
            },
            target: targetToArray(target), // id kelas
            keterangan: keterangan
        };

        const result = await dataTahunAjaran.updateOne(
            { tahun_ajaran: tahun_ajaran },
            { $pull: { kbm_nonaktif: newHariLibur } }
        );

        if (result.matchedCount > 0) {

            const updatedData = await dataTahunAjaran.findOne({ tahun_ajaran: tahun_ajaran });

            res.status(200).send(updatedData.kbm_nonaktif);

            noteAbsen(newHariLibur.target[0], newHariLibur.awal , newHariLibur.akhir);
            
        } else {
            res.status(200).send({ message: "Data tahun ajaran tidak ditemukan" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Tidak dapat terhubung ke database", error: error });
    }
/**----------------------------------------------------------------------------------------- */
    async function noteAbsen(idkelas, awalLibur, akhirLibur){

        const firstDate = new Date(awalLibur.tanggal);
        const lastDate = new Date(akhirLibur.tanggal);
        const firstTime = parseInt(awalLibur.jam);
        const lastTime = parseInt(akhirLibur.jam);
        const times = [1,2];

        const dates = getDates(firstDate, lastDate);

        dates.forEach(date => {
            times.forEach(time => {
                const isTheFirstDateandTheFirstTime = firstTime <= time && (firstDate - date) == 0;
                const isTheLastDateandTheLastTime = lastTime >= time && (lastDate - date) == 0;
                const isBetwenFirstandLastDate = !((firstDate - date) == 0 || (lastDate - date) == 0);

                const newObject = { tanggal : date, jam : parseInt(time), absensi : "L"};

                if ( isTheFirstDateandTheFirstTime || isTheLastDateandTheLastTime || isBetwenFirstandLastDate) {
                    updateDataAbsen(idkelas, newObject);
                }
            });
        });

        
    }
/**----------------------------------------------------------------------------------------- */
async function updateDataAbsen(idKelas, newData) {

    await dataSantri.updateMany(
        { 
            "statistik_madrasah_diniyyah.idkelas" : {$eq : parseInt(idKelas)}
        },
        {   
            $setOnInsert : { "data_absensi" : []},
            $pull: {"statistik_madrasah_diniyyah.$[elem].data_absensi": newData }
        },
        {
            arrayFilters: [{ "elem.idkelas": parseInt(idKelas) }],
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    ).catch((error) => console.log({messege : "internal server error", error : error}));
}
/**----------------------------------------------------------------------------------------- */
    function getDates(startDate, endDate) {

        const dates = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }
/**----------------------------------------------------------------------------------------- */
    function targetToArray(target) {
        
        const array = [];
        if ((Array.isArray(target))) {
            target.forEach(element => {
                array.push(parseInt(element))
            });
        } else {
            array.push(parseInt(target))
        }
        return array;
    }
/**----------------------------------------------------------------------------------------- */
}

export default removeJamLibur;