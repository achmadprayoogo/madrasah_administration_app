import { dataSantri, dataTahunAjaran } from "./mongooseSchema.js";

async function getDataNames(req, res) {
  const { tahunajaran, tingkat, kelas, walikelas, jam } = req.query;
  const idkelas = parseInt(req.query.idkelas);
  const tanggal = new Date(req.query.tanggal);

  const data = await dataTahunAjaran
    .findOne({ tahun_ajaran: tahunajaran })
    .catch((err) =>
      res.status(500).send({ message: "internal server error", error: err }),
    );

  if (data) {
    const isKbmAktif = checkIsKBMAcktive(data);

    if (isKbmAktif) {
      const result = await foundedData();
      res.status(result.status).send(result);
    } else {
      res.status(200).send({ message: "kbm tidak aktif !" });
    }
  } else {
    res.status(200).send({ message: "data tahun ajaran tidak detemukan !" });
  }

  function checkIsKBMAcktive(data) {
    const kbmNonAktif = data.kbm_nonaktif;

    for (let i = 0; i < kbmNonAktif.length; i++) {
      const element = kbmNonAktif[i];
      const tanggalAwal = new Date(element.awal.tanggal);
      const tanggalAkhir = new Date(element.akhir.tanggal);
      const jamAwal = element.awal.jam;
      const jamAkhir = element.akhir.jam;
      const targets = element.target;
      /** jika tanggal cocok dengan data kbm non aktif dan id kelas cocok dengan target kbm non aktif,
       *  loop langsung berhenti.
       *  jika sebaliknya makan terus mencocokkan hingga akhir data
       */
      const isFirst =
        tanggalAwal - tanggal == 0 &&
        tanggalAkhir - tanggal != 0 &&
        jamAwal <= jam;
      const isLast =
        tanggalAwal - tanggal != 0 &&
        tanggalAkhir - tanggal == 0 &&
        jamAkhir >= jam;
      const isBetwen = tanggalAwal - tanggal < 0 && tanggalAkhir - tanggal > 0;
      const isNow =
        tanggalAwal - tanggal == 0 &&
        tanggalAkhir - tanggal == 0 &&
        (jamAwal == jam || jamAkhir == jam);

      let isTarget;
      if (targets && targets.length && Array.isArray(targets)) {
        isTarget = targets.filter(
          (isTarget = (target) => target == parseInt(idkelas)),
        );
      } else {
        isTarget = [];
      }

      if ((isFirst || isLast || isBetwen || isNow) && isTarget.length != 0) {
        return false;
      }
    }
    return true;
  }

  async function foundedData() {
    const data = await dataSantri
      .find({
        statistik_madrasah_diniyyah: {
          $elemMatch: {
            tahun_ajaran: tahunajaran,
            tingkat: tingkat,
            kelas: kelas,
            idkelas: { $eq: parseInt(idkelas) },
            walikelas: { $eq: parseInt(walikelas) },
          },
        },
      })
      .catch((err) => {
        return { status: 500, message: "internal server error", error: err };
      });

    if (data.length !== 0) {
      const responseData = [];

      data.forEach((element) => {
        const entry = element.statistik_madrasah_diniyyah.find(
          (entry) => entry.idkelas === idkelas,
        );
        const nameData = {
          id: element.id,
          nama_lengkap: element.nama_lengkap,
          tahun_ajaran: entry ? entry.tahun_ajaran : null,
          tingkat: entry ? entry.tingkat : null,
          idkelas: entry ? entry.idkelas : null,
          kelas: entry ? entry.kelas : null,
          walikelas: entry ? parseInt(entry.walikelas) : null,
          //data_absensi: entry ? entry.data_absensi.find(item => (item.tanggal - tanggal) == 0 && item.jam == jam) : null,
        };

        responseData.push(nameData);
      });

      return { status: 200, data: responseData };
    } else {
      return { status: 200, message: "data tidak detemukan !" };
    }
  }
}

export default getDataNames;
