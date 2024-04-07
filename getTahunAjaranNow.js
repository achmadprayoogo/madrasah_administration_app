import { dataTahunAjaran, dataSantri } from "./mongooseSchema.js";

async function getTahunAjaranNow(req, res) {
  const dateNow = new Date(req.query.tanggal);
  let tahunAjaranFound = false;
  const dataIDWalikelas = [];
  const dataWalikelas = [];

  dataTahunAjaran
    .find()
    .then((data) => {
      if (!data) {
        return res.status(200).send({
          message:
            "Tahun ajaran tidak ditemukan/database masih kosong. Silakan hubungi admin madrasah",
        });
      }

      data.forEach(async (element) => {
        const tanggalAwal = new Date(element.tanggal_awal);
        const tanggalAkhir = new Date(element.tanggal_akhir);

        /** untuk mengecek tahun ajaran berapa sekarang */
        if (tanggalAwal - dateNow <= 0 && tanggalAkhir - dateNow >= 0) {
          tahunAjaranFound = true;
          const arrayTingkat = Object.keys(element.data_kelas);
          arrayTingkat.forEach((tingkat) => {
            const arrayKelas = element.data_kelas[tingkat];
            arrayKelas.forEach((kelas) => {
              dataIDWalikelas.push(kelas.walikelas);
            });
          });

          await Promise.all(
            dataIDWalikelas.map(async (idWalikelas) => {
              await dataSantri.findOne({ id: idWalikelas }).then((data) => {
                if (data) {
                  dataWalikelas.push({ id: data.id, nama: data.nama_lengkap });
                } else {
                  dataWalikelas.push({
                    id: idWalikelas,
                    nama: "data tidak ditemukan",
                  });
                }
              });
            }),
          );

          res.status(200).send({
            tahunAjaranNow: element.tahun_ajaran,
            data_kelas: element.data_kelas,
            dataWalikelas,
          });
        }
      });

      if (!tahunAjaranFound) {
        res.status(200).send({
          message:
            "Tahun ajaran tidak ditemukan! Silakan hubungi admin madrasah",
        });
      }
    })
    .catch((err) =>
      res.status(500).send({ messege: "internal server error", error: err }),
    );
}

export default getTahunAjaranNow;
