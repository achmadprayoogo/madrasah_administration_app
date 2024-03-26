import { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import exceljs from 'exceljs';
import { error } from "console";

async function importDataSantri(req, res) {
    
    const fileBuffer = await req.file.buffer;

    const dataSchema = new mongoose.Schema({
        id : {type : Number, required : true},
        nama_lengkap : {type : String, required : true},
        statistik_madrasah_diniyyah : {},
    });

    const mainData = await mongoose.models.data_santri || mongoose.model("data_santri",dataSchema);
    const dataSaved = [];
    const dataNotSaved = [];

    convertExceltoJson(fileBuffer).then(async (json)=>{

        for (let i = 1; i < json.length; i++) {

            const newData = new mainData(json[i]);

            await mainData.updateOne(
                { "id" : newData.id},
                {$setOnInsert : newData},
                { upsert : true, new : true, setDefaultsOnInsert : true }).then((result)=>{

                    if (result.upsertedId) {
                        console.log("id tidak sama, data disimpan !");
                        dataSaved.push(newData)
                    } else {
                        console.log("id sama, data tidak disimpan !");
                        dataNotSaved.push(newData)
                    }
                    
                });
        }

        if (dataSaved.length) {
            res.status(201).send({datatersimpan : dataSaved, datatidaktersimpan : dataNotSaved});
        } else {
            res.status(200).send({datatersimpan : dataSaved, datatidaktersimpan : dataNotSaved});
        }
        
    }).catch((error)=>{
        console.log(error);
        res.status(500).send({message : "server error!", error : error});
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

                worksheet.eachRow({ includeEmpty: true }, (row) => {
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
                                rowDataStatistik["idkelas"] = cell.value;
                                break;
                            case 7:
                                rowDataStatistik["kelas"] = cell.value;
                                break;
                            case 8:
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
