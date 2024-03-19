import mongoose from "mongoose";

const dataSantriSchema = new mongoose.Schema({
    id : {type : Number, required : true},
    nama_lengkap : {type : String, required : true},
    statistik_madrasah_diniyyah : {},
});
const dataSantri = mongoose.models.data_santri || mongoose.model("data_santri",dataSantriSchema);

const dataTahunAjaranSchema = new mongoose.Schema({
    tahun_ajaran : {type : String, required : true},
    tanggal_awal : {type : String, required : true},
    tanggal_akhir : {type : String, required : true},
});

const dataTahunAjaran = mongoose.models.data_tahun_ajaran || mongoose.model('data_tahun_ajaran', dataTahunAjaranSchema);

export  { dataTahunAjaran, dataSantri };