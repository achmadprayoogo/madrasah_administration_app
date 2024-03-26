import { dataTahunAjaran } from "./mongooseSchema.js";

async function addKelas(req, res) {
    try {
        const { tahun_ajaran, tingkat, id , kelas, walikelas } = req.body;

        const newObject = { id : parseInt(id), kelas : kelas, walikelas : parseInt(walikelas) };
        const newField = { [tingkat] : [newObject]};
        const existingData = await dataTahunAjaran.findOne({ tahun_ajaran: tahun_ajaran });

        if (!existingData) {

            res.status(200).send({ message : "tahun ajaran tidak ditemukan!"});
        } else {
            /** untuk mencegah adanya id yang sama */
            const resultFindId = await findSameId();

            if (resultFindId.length == 0) {

                await dataTahunAjaran.updateOne( { tahun_ajaran: tahun_ajaran } ,{$push : { [`data_kelas.${tingkat}`] : newObject}});
                
                sendNewData();

            } else {
                res.status(200).send({message : "id Kelas yang dimasukkan sudah tersedia", data : existingData})
            }

        } 

        /** mencari id  kelas yang sama */
        async function findSameId() {

            const ID = parseInt(req.body.id)
            const data = await dataTahunAjaran.findOne({ tahun_ajaran: tahun_ajaran });
            let keys = [];

            if (!data.data_kelas) {

                return keys;
            } else {

                keys = Object.keys(data.data_kelas);

                for (let i = 0; i < keys.length; i++) {
                    const element = data.data_kelas[keys[i]];
                    const result = element.filter(item => item.id == ID);
                    /** jika ada yang sama dengan data di DB maka akan mengembalikan data yang ditemukan
                     *  jika tidak ditemukan maka akan mengembalikan array yang kosong
                     */
                    if (result.length || i == (keys.length - 1)) {
                        return result;
                    }
                }
            }
        }

        async function sendNewData() {
            const updatedData = await dataTahunAjaran.findOne({ tahun_ajaran: tahun_ajaran });
            
            res.status(200).send(updatedData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Tidak dapat terhubung ke database", error: error });
    }
}

export default addKelas;



// import { dataTahunAjaran } from "./mongooseSchema.js";

// function addKelas(req, res) {

//     const newData = {}
//     const newKelas = {}
//     newKelas[req.body.kelas] = req.body.walikelas; 
//     newData[req.body.tingkat] = newKelas;

//     dataTahunAjaran.findOne({tahun_ajaran : req.body.tahun_ajaran}).then((data)=>{

//         if (!data.data_kelas) {

//             dataTahunAjaran.updateOne(
//                 {tahun_ajaran : req.body.tahun_ajaran},
//                 {$set: { data_kelas : newData}})
//                 .then((data)=>{

//                 if (data) {

//                     dataTahunAjaran.findOne({tahun_ajaran : req.body.tahun_ajaran}).then((data)=>{
//                         res.status(200).send(data);
//                     })

//                 } else {

//                     console.log("data tidak ditemukan");
//                     res.status(200).send("data tidak ditemukan");

//                 }
//             });

//         } else {

//             if (!data.data_kelas[req.body.tingkat]) {

//                 dataTahunAjaran.updateOne(
//                     {tahun_ajaran : req.body.tahun_ajaran},
//                     {$set: { [`data_kelas.${req.body.tingkat}`] : newKelas}})
//                     .then((data)=>{

//                     if (data) {

//                         dataTahunAjaran.findOne({tahun_ajaran : req.body.tahun_ajaran}).then((data)=>{
//                             console.log(data.data_kelas[req.body.tingkat]);
//                             res.status(200).send(data);
//                         })

//                     } else {

//                         console.log("data tidak ditemukan");
//                         res.status(200).send("data tidak ditemukan");

//                     }
//                 });          

//             } else {

//                 dataTahunAjaran.updateOne(
//                     {tahun_ajaran : req.body.tahun_ajaran},
//                     {$set: { [`data_kelas.${req.body.tingkat}.${req.body.kelas}`] : req.body.walikelas}})
//                     .then((data)=>{

//                     if (data) {

//                         dataTahunAjaran.findOne({tahun_ajaran : req.body.tahun_ajaran}).then((data)=>{
//                             res.status(200).send(data);
//                         })

//                     } else {

//                         console.log("data tidak ditemukan");
//                         res.status(200).send("data tidak ditemukan");

//                     }
//                 });    
//             };
//         };
//     }).catch((error)=>{

//         res.status(500).send({messege:"tidak bisa terhubung ke database", error : error});
//         console.log(error);

//     });
// };

// export default addKelas;