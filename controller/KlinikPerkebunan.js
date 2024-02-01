const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang, cekNull } = require('../utils/utils');
const helpers = require('../helpers/Helpers')

exports.addPengajuan = async (req, res) => {
  try {
    // Make New ID
    // const newId = await prisma.$queryRaw`SELECT id FROM master_sertifikasi_benih ORDER BY id DESC limit 1`;
    // Make Form
    const data = JSON.parse(req.body.data)
    
    data.fotodaun = cekNull(req.files['fotodaun'], '../public/file_klinik')
    data.fotobuah = cekNull(req.files['fotobuah'], '../public/file_klinik')
    data.fotobatang = cekNull(req.files['fotobatang'], '../public/file_klinik')
    data.fotoakar = cekNull(req.files['fotoakar'], '../public/file_klinik')

    const status = data.intensitasserangan === 'Berat' ? 'Verifikasi UPTD' : 'Belum Dijawab'

    const query = await prisma.klinik_perkebunan.create({
      data: {
        nik: data.nik,
        nama: data.nama,
        nohp: data.nohp,
        intensitasserangan: data.intensitasserangan,
        komoditas: data.komoditas.komoditas,
        fotodaun: data.fotodaun,
        fotobuah: data.fotobuah,
        fotobatang: data.fotobatang,
        fotoakar: data.fotoakar,
        deskripsi: data.deskripsi,
        luaslahan: data.luaslahan,
        luasserangan: data.luasserangan,
        alamatlahan: data.alamatlahan,
        provinsi: data.provinsi,
        kabupaten: data.kabupaten,
        kecamatan: data.kecamatan,
        desa: data.desa,
        status,
        created_at: await sekarang(),
        updated_at: await sekarang(),
      }
    })

   
    // Create History
    if (query) {
      res.json(response.successWithData({
        id: Number(query.id)
      }))
    } else {
      res.json(response.errorWithData('Terjadi error', 500))
    }
  } catch (error) {
    console.log(error);
    res.json(response.error(400))
  }
}

exports.getAllPengajuan = async (req, res) => {
  try {
    let query, total
    const key = req.query.filter
    const page = req.query.page
    const perpage = req.query.perpage
    let newQuery = helpers.filterData(req.query);
    let querys = helpers.convertQuery(newQuery)

    const role = req.params.role
    const type = req.params.type
    const kecamatanFilter = req.query.kecamatan ? `AND kecamatan ILIKE '%${req.query.kecamatan}%'` : '';
    const komoditasFilter = req.query.komoditas ? `AND komoditas ILIKE '%${req.query.komoditas}%'` : '';

    if(role === 'disbunkabupaten'){
      if (type === 'terbaru'){
        query = await prisma.$queryRawUnsafe(`SELECT * FROM klinik_perkebunan WHERE (STATUS = 'Verifikasi UPTD' or STATUS = 'Belum Dijawab') AND CAST(tanggal_kunjungan AS TEXT) ILIKE '%${req.query.tanggal_kunjungan}%' ${kecamatanFilter} ORDER BY id desc limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`)

        total = await prisma.$queryRawUnsafe(`SELECT count(*) FROM klinik_perkebunan WHERE (STATUS = 'Verifikasi UPTD' or STATUS = 'Belum Dijawab') AND CAST(tanggal_kunjungan AS TEXT) ILIKE '%${req.query.tanggal_kunjungan}%' ${kecamatanFilter}`)
      }else{
        query = await prisma.$queryRawUnsafe(`SELECT * FROM klinik_perkebunan WHERE (STATUS = 'Verifikasi UPTD' or STATUS = 'Belum Dijawab' or STATUS ='Terjawab') AND CAST(tanggal_kunjungan AS TEXT) ILIKE '%${req.query.tanggal_kunjungan}%' ${kecamatanFilter} ORDER BY id desc limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`)

        total = await prisma.$queryRawUnsafe(`SELECT count(*) FROM klinik_perkebunan WHERE (STATUS = 'Verifikasi UPTD' or STATUS = 'Belum Dijawab' or STATUS ='Terjawab') AND CAST(tanggal_kunjungan AS TEXT) ILIKE '%${req.query.tanggal_kunjungan}%' ${kecamatanFilter}`)
      }
    }else{
      if (type === 'terbaru'){
        query = await prisma.$queryRawUnsafe(`SELECT * FROM klinik_perkebunan WHERE STATUS = 'Verifikasi UPTD' AND CAST(tanggal_kunjungan AS TEXT) ILIKE '%${req.query.tanggal_kunjungan}%' ${kecamatanFilter} ${komoditasFilter} ORDER BY id desc limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`)

        total = await prisma.$queryRawUnsafe(`SELECT count(*) FROM klinik_perkebunan WHERE STATUS = 'Verifikasi UPTD' AND CAST(tanggal_kunjungan AS TEXT) ILIKE '%${req.query.tanggal_kunjungan}%' ${kecamatanFilter} ${komoditasFilter}`)
      }else{
        query = await prisma.$queryRawUnsafe(`SELECT * FROM klinik_perkebunan WHERE (STATUS = 'Verifikasi UPTD' or STATUS = 'Belum Dijawab' or STATUS ='Terjawab') AND CAST(tanggal_kunjungan AS TEXT) ILIKE '%${req.query.tanggal_kunjungan}%' ${kecamatanFilter} ${komoditasFilter} ORDER BY id desc limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`)

        total = await prisma.$queryRawUnsafe(`SELECT count(*) FROM klinik_perkebunan WHERE (STATUS = 'Verifikasi UPTD' or STATUS = 'Belum Dijawab' or STATUS ='Terjawab') AND CAST(tanggal_kunjungan AS TEXT) ILIKE '%${req.query.tanggal_kunjungan}%' ${kecamatanFilter} ${komoditasFilter}`)
      }
    }

    res.json(response.commonSuccessDataPaginate(query, total[0].count, Number(page), Number(perpage), key))
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
}

exports.getAllPengjuanByNik = async (req, res) => {
  try {
    const nik = req.params.nik
    const komoditas = req.params.komoditas
    const intensitas = req.params.intensitas
    const status = req.params.status
    const terbaru = req.params.terbaru
    let data = await prisma.klinik_perkebunan.findMany({
      where: {
        nik: nik,
        komoditas: komoditas,
        intensitas: intensitas,
        status: status,
        terbaru: terbaru
      },
      orderBy: {
        id: 'desc'
      }
    })
    res.json(response.successWithData(data, 202))
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
}

exports.detailKlinik = async (req, res) => {
  try {
    const id = req.params.id
    const dataSertif = await prisma.klinik_perkebunan.findFirst({
      where: {
        id: Number(id)
      },
    })
    res.json(response.successWithData(dataSertif, 201));
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
};

exports.jawabPengajuan = async (req, res) => {
  try {
    const id = req.params.id
    const data = req.body
    const update = {
      status: data.status,
      hasil: data.hasil,
      rekomendasi: data.rekomendasi
    }

    const updateWithTanggal = {
      ...update,
      tanggal_kunjungan: new Date(data.tanggal_kunjungan)
    }
       await prisma.klinik_perkebunan.update({
        where: {
          id: Number(id),
        },
        data: data.tanggal_kunjungan ? updateWithTanggal : update
      })
   
    res.json(response.successData('Berhasil Ubah Status'))
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
};

exports.keUptd = async (req, res) => {
  try {
    const id = req.params.id
    const data = req.body
       await prisma.klinik_perkebunan.update({
        where: {
          id: Number(id),
        },
        data: {
          status: data.status,
          hasil: data.hasil,
          rekomendasi: data.rekomendasi
        }
      })
   
    res.json(response.successData('Berhasil Ubah Status'))
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
};

exports.addArtikel = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data)
    
    data.gambar = cekNull(req.files['gambar'], '../public/file_klinik')

    const query = await prisma.klinik_perkebunan_artikel.create({
      data: {
        judul: data.judul,
        gambar: data.gambar,
        narasi: data.narasi,
        created_at: await sekarang(),
        updated_at: await sekarang(),
      }
    })
   
    if (query) {
      res.json(response.successWithData({
        id: Number(query.id)
      }))
    } else {
      res.json(response.errorWithData('Terjadi error', 500))
    }
  } catch (error) {
    console.log(error);
    res.json(response.error(400))
  }
}

exports.editArtikel = async (req, res) => {
  try {
    const artikelId = req.params.id; // Assuming you pass the ID as a route parameter
    const existingArtikel = await prisma.klinik_perkebunan_artikel.findUnique({
      where: { id: parseInt(artikelId) }
    });

    if (!existingArtikel) {
      return res.json(response.errorWithData('Artikel not found', 404));
    }

    const data = JSON.parse(req.body.data);
    
    // Check if a new image is uploaded, if not, use the existing one
    data.gambar = req.files && req.files['gambar'] ? 
                  cekNull(req.files['gambar'], '../public/file_klinik') : 
                  existingArtikel.gambar;

    const query = await prisma.klinik_perkebunan_artikel.update({
      where: { id: parseInt(artikelId) },
      data: {
        judul: data.judul,
        gambar: data.gambar,
        narasi: data.narasi,
        updated_at: await sekarang(),
      }
    });

    if (query) {
      res.json(response.successWithData({
        id: Number(query.id)
      }));
    } else {
      res.json(response.errorWithData('Update error', 500));
    }
  } catch (error) {
    console.log(error);
    res.json(response.error(400));
  }
};


exports.getArtikel = async (req, res) => {
  try {
    const id = req.params.id
       const data = await prisma.klinik_perkebunan_artikel.findFirst({
        where: {
          id: Number(id),
        },
      })
      res.json(response.successWithData(data, 200)) 
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
};

exports.getAllArtikel = async (req, res) => {
  try {
    if (!req.query.page) {
      const data = await prisma.klinik_perkebunan_artikel.findMany()
      res.json(response.successWithData(data, 200)) 
    } else {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Calculating the skip value
    const skip = (page - 1) * pageSize;

    const [articles, totalItems] = await Promise.all([
      prisma.klinik_perkebunan_artikel.findMany({
        take: pageSize,
        skip: skip,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.klinik_perkebunan_artikel.count(),
    ]);

    res.json(response.successWithData({
      articles,
      totalItems,
      page,
      pageSize,
    }, 200)); 
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
};

exports.deleteArtikel = async (req, res) => {
  try {
    const artikelId = req.params.id; // ID passed as route parameter

    // Optional: Check if the article exists
    const existingArtikel = await prisma.klinik_perkebunan_artikel.findUnique({
      where: { id: parseInt(artikelId) }
    });

    if (!existingArtikel) {
      return res.json(response.errorWithData('Artikel not found', 404));
    }

    // Perform the delete operation
    await prisma.klinik_perkebunan_artikel.delete({
      where: { id: parseInt(artikelId) }
    });

    // Respond with success
    res.json(response.success(200))
  } catch (error) {
    console.log(error);
    res.json(response.error(400));
  }
};