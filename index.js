import express from "express";
import cors from "cors";
import { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv/config";
import bodyParser from "body-parser";
import { error } from "console";
import multer from "multer";
import exceljs from 'exceljs';
import { dataSantri, dataTahunAjaran } from "./mongooseSchema.js"
/** import function */
import importDataSantri from "./import-datasantri.js";
import addTahunAjaran from "./add-tahunajaran.js";
import updateWaliKelas from "./update-walikelas.js";
import addKelas from "./add-kelas.js";
import addJamLibur from "./add-jamlibur.js";
import getTahunAjaranNow from "./getTahunAjaranNow.js";
import updateDataSantri from "./update-datasantri.js";
import qs from 'qs';

/** set-up */
const app = express();
app.use(cors());
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT;
const MONGOURI = process.env.MONGO_URI;
// set up to receive excel file
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

/** middleware */
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
app.set('query parser',(str) => qs.parse(str, { /* custom options */ }));


/** try to connect database */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGOURI);
        console.log(`connected to database at ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
    }
};

/** user pengajar */
app.get("/tahunajaran/now", (req,res)=>{
    getTahunAjaranNow(req,res);
});
app.get("/data/names/?", (req,res)=>{
    const tingkat = req.query.tingkat
    const walikelas = req.query.walikelas;
    const tahunAjaran = req.query.tahunajaran;
    
    dataSantri.find({
        "statistik_madrasah_diniyyah": {
            $elemMatch: {
                "tahun_ajaran": tahunAjaran,
                "tingkat": tingkat,
                "walikelas": { $eq: parseInt(walikelas) }
            }
        }
    }).then((data)=>{
        const responseData = [];
        data.forEach(element => {
            const entry = element.statistik_madrasah_diniyyah.find(entry => entry.tahun_ajaran === tahunAjaran);
            const nameData = {
                id : element.id,
                nama_lengkap : element.nama_lengkap,
                tahun_ajaran: entry ? entry.tahun_ajaran : null,
                tingkat: entry ? entry.tingkat : null,
                walikelas: entry ? parseInt(entry.walikelas) : null
            }
            responseData.push(nameData);
        });
        res.send(responseData);
    })
});
app.post("/dataabsen", (req,res)=>{});

/** user admin */
app.post("/admin", (req,res)=>{
});

/** menambah jam libur pada DB tahun_ajaran */
app.post("/add-jamlibur", (req,res)=>{
    addJamLibur(req,res);
});

app.patch("/updatedataabsen", (req,res)=>{});

app.patch("/update-datasantri", (req,res)=>{
    updateDataSantri(req, res)
});

/** meng-update data walikelas pada DB data_santri
 *  mungkin dibutuhkan saat kenaikan kelas atau
 *  ada santri yang pindah kelas
 */
app.patch("/update-walikelas", (req,res)=>{
    updateWaliKelas(req,res);    
});

/** menambah tingkat dan kelas dalam DB tahun_ajaran */
app.post("/add-kelas", (req,res)=>{
    addKelas(req,res);
});

/** menambah tahun ajaran baru jika tahun ajaran saat ini berakhir */
app.post("/add-tahunajaran", (req,res)=>{
    addTahunAjaran(req,res);
});

/** import banyak data santri dari file excel */
app.post("/import-datasantri", upload.single('file'), (req,res)=>{
    importDataSantri(req,res);
});

/** try to connect database before app listen */
connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`app listen at port : ${PORT}`);
    })
});
