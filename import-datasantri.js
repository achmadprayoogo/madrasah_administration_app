import { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import exceljs from 'exceljs';
import { error } from "console";

async function importDataSantri(req, res) {

    const dataSchema = new mongoose.Schema({
        id : {type : Number, required : true},
        nama_lengkap : {type : String, required : true},
        statistik_madrasah_diniyyah : {},
    });
    const fileBuffer = req.file.buffer;
    const mainData = mongoose.models.data_santri || mongoose.model("data_santri",dataSchema);

    convertExceltoJson(fileBuffer).then(async (json)=>{
        for (let i = 1; i < json.length; i++) {
            const newData = new mainData(json[i]);
            await mainData.findOneAndUpdate(
                { "id" : newData.id},
                {$setOnInsert : newData},
                { upsert : true, new : true, setDefaultsOnInsert : true }).then((result)=>{
                    if (!result) {
                        console.log("data tidak cocok !")
                    } else {
                        console.log("data berhasil disimpan !")
                    }
                });
        }
        await mainData.find().then((data)=>{
            res.status(200).send(data);
        });
    }).catch((error)=>{
        console.log(error);
    });
    
    /**-----------------------convert-excel-to-json------------------------- */
    async function convertExceltoJson(fileBuffer) {
        // Buat instance dari Excel workbook
        const workbook = new exceljs.Workbook();
            // Pilih lembar kerja (worksheet) yang ingin Anda konversi
            try {
                await workbook.xlsx.load(fileBuffer);
                const worksheet = workbook.getWorksheet('Sheet1'); 
                // Konversi data worksheet ke array of objects
                const jsonData = [];

                worksheet.eachRow({ includeEmpty: true }, row => {
                    const rowData = {};
                    const rowDataStatistik = {}
                    const statistikMadrasahDiniyyah = []
            
                    row.eachCell((cell, colNumber) => {
                        switch (colNumber) {
                            case 1:
                                rowData["id"] = cell.value;
                                break;
                            case 2:
                                rowData["nama_lengkap"] = cell.value;
                                break;
                            case 3:
                                rowDataStatistik["tahun_ajaran"] = cell.value;
                                break;
                            case 4:
                                rowDataStatistik["status"] = cell.value;
                                break;
                            case 5:
                                rowDataStatistik["tingkat"] = cell.value;
                                break;
                            case 6:
                                rowDataStatistik["walikelas"] = cell.value;
                                break;
                            default:
                                break;
                        }
                    });
                    statistikMadrasahDiniyyah.push(rowDataStatistik)
                    rowData["statistik_madrasah_diniyyah"] = statistikMadrasahDiniyyah;
                    jsonData.push(rowData);
                });
                return jsonData;
            } catch (error) {
                console.log(error);
            }
    };
};

export default importDataSantri;
