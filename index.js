import express from "express";
import cors from "cors";
import { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv/config";
import bodyParser from "body-parser";
import { error } from "console";
import multer from "multer";
import qs from "qs";

/** import function */
import { dataSantri, dataTahunAjaran } from "./mongooseSchema.js";
import importDataSantri from "./import-datasantri.js";
import addTahunAjaran from "./add-tahunajaran.js";
import updateWaliKelas from "./update-walikelas.js";
import addKelas from "./add-kelas.js";
import addJamLibur from "./add-jamlibur.js";
import getTahunAjaranNow from "./getTahunAjaranNow.js";
import updateDataSantri from "./update-datasantri.js";
import getDataNames from "./getDataNames.js";
import removeJamLibur from "./removeJamLibur.js";
import addAbsensi from "./addAbsensi.js";
import updateAbsensi from "./updateAbsensi.js";
import getAllData from "./getAllData.js";
import removeAbsensi from "./removeAbsensi.js";

/** set-up -----------------*/
const app = express();
app.use(cors());
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT;
const MONGOURI = process.env.MONGO_URI;

/** set-up to receive excel file */
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/** middleware */
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("query parser", (str) =>
  qs.parse(str, {
    /* custom options */
  }),
);

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
app.get("/tahunajaran/now", (req, res) => {
  getTahunAjaranNow(req, res);
});

app.get("/data/names/?", async (req, res) => {
  getDataNames(req, res);
});

app.post("/dataabsen", async (req, res) => {
  addAbsensi(req, res);
});

app.patch("/dataabsen", (req, res) => {
  updateAbsensi(req, res);
});

app.delete("/dataabsen", (req, res) => {
  removeAbsensi(req, res);
});

/** user admin */
app.get("/alldatasantris", (req, res) => {
  getAllData(req, res);
});

/** menambah jam libur pada DB tahun_ajaran
 * dan data absen pada DB data santri
 */
app.post("/newjamlibur", (req, res) => {
  addJamLibur(req, res);
});

/** menghapus jam libur pada DB tahun_ajaran
 * dan data absen pada DB data santri
 */
app.delete("/jamlibur", (req, res) => {
  removeJamLibur(req, res);
});

/** untuk mengupdate id dan nama lengkap satu santri */
app.patch("/datasantri", (req, res) => {
  updateDataSantri(req, res);
});

/** meng-update data walikelas pada DB data_santris
 *  mungkin dibutuhkan saat kenaikan kelas atau
 *  ada santri yang pindah kelas
 */
app.patch("/newwalikelas", (req, res) => {
  updateWaliKelas(req, res);
});

/** menambah tingkat dan kelas dalam DB tahun_ajarans
 *  juga bisa digunakan untuk meng update walikelas sebuah kelas
 *  dengan field http body yang sama. caranya cukup dengan
 *  menulis kode walikelas yang beda dari yang ada di DB
 */
app.post("/newkelas", (req, res) => {
  addKelas(req, res);
});

/** menambah tahun ajaran baru jika tahun ajaran saat ini berakhir */
app.post("/newtahunajaran", (req, res) => {
  addTahunAjaran(req, res);
});

/** import banyak data santri dari file excel */
app.post("/datasantris", upload.single("file"), (req, res) => {
  importDataSantri(req, res);
});

/** try to connect database before app listen */
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`app listen at port : ${PORT}`);
  });
});
