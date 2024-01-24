const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../../utils/utils');
const { constVoid } = require("prisma/prisma-client/generator-build");
const bcrypt = require("bcryptjs");
const { get } = require("https");

//====================================================List Katalog================================

exports.getListKatalog = async (req, res) => {
    try {
        const idmember = Number(atob(req.params.idmember))
        const idlayanan = Number(atob(req.params.idlayanan))
        const usaha = await findProfilUsaha(idmember, idlayanan);
        if (usaha) {
            const query = await prisma.material_master.findMany({
                where: {
                    master_barang_distributor_jelabat: {
                        some: {
                            profil_usaha_id: Number(usaha.profil_usaha_id)
                        }
                    }
                },
                include: {
                    child_dtl_kategori: {
                        select: {
                            child_dtlk_id: true,
                            child_dtlk_nama: true,
                            detail_kategori: {
                                select: {
                                    dtlk_id: true,
                                    dtlk_nama: true,
                                    kategori_master: {
                                        select: {
                                            kategori_id: true,
                                            kategori_nama: true,
                                            master_sektor: {
                                                select: {
                                                    id: true,
                                                    sektor: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    harga_jelabat: {
                        where: {
                            profil_usaha_id: Number(usaha.profil_usaha_id)
                        },
                        select: {
                            harga: true
                        }
                    },
                    stok_pakan: {
                        where: {
                            profil_usaha_id: Number(usaha.profil_usaha_id)
                        },
                        select: {
                            stok: true
                        }
                    },
                    master_barang_distributor_jelabat: true
                }
            })

            res.json(query ? response.successWithData([query, usaha], 200) : response.errorWithData('Get Data Gagal', 400));

        } else {
            res.json(response.errorWithData('Harap Lengkapi Profil Usaha dan Tunggu Verivikasi Admin', 507))
        }
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getListProfilUsaha = async (req, res) => {
    try {
        const pu = await prisma.master_barang_pabrik_bahan_jadi.findMany({
            include: {
                profil_usaha: true
            },
            distinct: ['profil_usaha_id'],
        })

        res.json(pu ? response.successWithData(pu, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getListMMByIDUsaha = async (req, res) => {
    try {
        const profilusaha = Number(atob(req.params.idprofilusaha))
        const query = await prisma.material_master.findMany({
            where: {
                master_barang_pabrik_bahan_jadi: {
                    some: {
                        profil_usaha_id: profilusaha
                    }
                }
            }
        })

        res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.saveInsertListKatalog = async (req, res) => {
    try {
        const data = req.body;
        const currentTime = await sekarang();

        const commonData = {
            mm_id: data.mm_id,
            profil_usaha_id: data.profil_usaha_id,
        }

        const querypabrik = await prisma.master_barang_distributor_jelabat.create({
            data: {
                ...commonData,
                master_barang_pabrik_bahan_jadi_id: data.master_produsen,
                keterangan: data.keterangan,
                status: true
            }
        });

        const queryharga = await prisma.harga_jelabat.create({
            data: {
                ...commonData,
                harga: data.harga,
                created_at: currentTime,
                update_at: currentTime
            }
        });

        const queryriwayatharga = await prisma.harga_riwayat_jelabat.create({
            data: {
                harga_id: queryharga.harga_id,
                harga: Number(data.harga),
                created_at: currentTime
            }
        });

        const querystok = await prisma.stok_pakan.create({
            data: {
                ...commonData,
                stok: Number(data.stok),
            }
        });

        const success = querypabrik && queryharga && queryriwayatharga && querystok;
        res.json(success ? response.success(200) : response.errorWithData('Input data gagal', 400));
    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}

exports.saveUpdateListKatalog = async (req, res) => {
    try {

        const data = req.body
        const currentTime = await sekarang()
        const idmm = Number(atob(req.params.idmm))

        const querypabrik = await prisma.master_barang_distributor_jelabat.updateMany({
            where: {
                mm_id: idmm,
            },
            data: {
                keterangan: data.keterangan,
            }
        });

        const querystok = await prisma.stok_pakan.updateMany({
            where: {
                mm_id: idmm,
                profil_usaha_id: data.profil_usaha_id,
            },
            data: {
                stok: Number(data.stok),
            }
        });

        if (data.ubahHarga) {
            const queryharga = await prisma.harga_jelabat.updateMany({
                where: {
                    mm_id: idmm,
                    profil_usaha_id: data.profil_usaha_id,
                },
                data: {
                    harga: data.harga,
                    update_at: currentTime
                }
            })

            const updatedHargaRecords = await prisma.harga_jelabat.findMany({
                where: {
                    mm_id: idmm,
                    profil_usaha_id: data.profil_usaha_id,
                }
            })

            for (const hargaRecord of updatedHargaRecords) {
                await prisma.harga_riwayat_jelabat.create({
                    data: {
                        harga_id: hargaRecord.harga_id,
                        harga: Number(data.harga),
                        created_at: currentTime
                    }
                })
            }
        }

        const success = querypabrik && querystok;
        res.json(success ? response.success(200) : response.errorWithData('Input data gagal', 400));


    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}

exports.saveUpdateStatusListKatalog = async (req, res) => {
    try {
        const idmm = Number(atob(req.params.idmm))
        const data = req.body
        const querymm = await prisma.master_barang_distributor_jelabat.updateMany({
            where: {
                mm_id: idmm
            },
            data: {
                status: data.status,
            }
        });

        res.json(querymm ? response.success(200) : response.errorWithData('Input data gagal', 400));

    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}

//======================================Function=============================
const findProfilUsaha = async (idmember, idlayanan) => {
    const usaha = await prisma.profil_usaha.findFirst({ where: { member_id: idmember, layanan_id: idlayanan, verifikasi_admin: true } });
    return usaha;
};