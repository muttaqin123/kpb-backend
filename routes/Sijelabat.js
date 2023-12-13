const router = require("express").Router();
const BahanBakuController = require("../controller/Sijelabat/BahanBaku");
const ProdusenController = require("../controller/Sijelabat/Produsen");
const ProfilUsahaController = require("../controller/Sijelabat/ProfilUsahaSijelabat");
const DistributorController = require("../controller/Sijelabat/Distributor");
const KiosController = require("../controller/Sijelabat/Kios");
const mdl = require("../middleware/auth")
const utilsApps = require('../utils/utils')
const multer = require('multer')
const fileListKatalog = multer({ storage: utilsApps.fileSijelabat }).single("Foto")


//============ProfilUsaha====================
router.get('/profil-usaha/show/byidmember/:idmember/:idlayanan', mdl.requireAuth, ProfilUsahaController.getProfilUsahaBahanBakuByMember)
router.get('/profil-usaha/master-bank/show', mdl.requireAuth, ProfilUsahaController.getMasterBank)
router.post('/profil-usaha/insert/', mdl.requireAuth, ProfilUsahaController.saveInputProfilUsaha)
router.put('/profil-usaha/update/:profilusahaid', mdl.requireAuth, ProfilUsahaController.saveUpdateProfilUsaha)

router.post('/checkout/keranjang/input/', mdl.requireAuth, ProfilUsahaController.saveKeranjang)
router.put('/checkout/mm/rincian/:idmember/:idlayanan', mdl.requireAuth, ProfilUsahaController.getProdukByID)
router.delete('/checkout/keranjang/hapus/:idkeranjang/', mdl.requireAuth, ProfilUsahaController.hapusKeranjang)
router.delete('/checkout/keranjang/hapus/:idkeranjang/', mdl.requireAuth, ProfilUsahaController.hapusKeranjang)
router.post('/checkout/keranjang/quantity/update', mdl.requireAuth, ProfilUsahaController.updateQuantityKeranjang)

//===========================BAHAN BAKU==================================
router.post('/bahan-baku/list-katalog/insert/', mdl.requireAuth, fileListKatalog, BahanBakuController.saveInsertListKatalog)
router.get('/bahan-baku/list-katalog/show/:idmember/:idlayanan', mdl.requireAuth, BahanBakuController.getListKatalog)
router.put('/bahan-baku/list-katalog/update/:idmm', mdl.requireAuth, fileListKatalog, BahanBakuController.saveUpdateListKatalog)
router.put('/bahan-baku/list-katalog/update-status/:idmm', mdl.requireAuth, BahanBakuController.saveUpdateStatusListKatalog)


//===========================PRODUSEN==================================
router.post('/produsen/list-katalog/insert/', mdl.requireAuth, fileListKatalog, ProdusenController.saveInsertListKatalog)
router.get('/produsen/list-katalog/show/:idmember/:idlayanan', mdl.requireAuth, ProdusenController.getListKatalog)
router.put('/produsen/list-katalog/update/:idmm', mdl.requireAuth, fileListKatalog, ProdusenController.saveUpdateListKatalog)
router.put('/produsen/list-katalog/update-status/:idmm', mdl.requireAuth, ProdusenController.saveUpdateStatusListKatalog)
router.get('/produsen/list-penyedia/show/', mdl.requireAuth, ProdusenController.getDaftarPenyedia)
router.get('/produsen/list-penyedia/produk/:idprofilusaha', mdl.requireAuth, ProdusenController.getDaftarProdukByPenyedia)


//===========================DISTRIBUTOR=============================
router.get('/distributor/list-profil-usaha-produsen/byidmember/:idmember/:idlayanan', mdl.requireAuth, DistributorController.getListProfilUsaha)
router.get('/distributor/list-mm-produsen/byidusaha/:idprofilusaha', mdl.requireAuth, DistributorController.getListMMByIDUsaha)
router.post('/distributor/list-katalog/insert/', mdl.requireAuth, DistributorController.saveInsertListKatalog)
router.get('/distributor/list-katalog/show/:idmember/:idlayanan', mdl.requireAuth, DistributorController.getListKatalog)
router.put('/distributor/list-katalog/update-status/:idmm', mdl.requireAuth, DistributorController.saveUpdateStatusListKatalog)
router.put('/distributor/list-katalog/update/:idmm', mdl.requireAuth, DistributorController.saveUpdateListKatalog)


//===========================KIOS=============================
router.get('/kios/list-profil-usaha-distributor/byidmember/:idmember/:idlayanan', mdl.requireAuth, KiosController.getListProfilUsaha)
router.get('/kios/list-mm-distributor/byidusaha/:idprofilusaha', mdl.requireAuth, KiosController.getListMMByIDUsaha)
router.post('/kios/list-katalog/insert/', mdl.requireAuth, KiosController.saveInsertListKatalog)
router.get('/kios/list-katalog/show/:idmember/:idlayanan', mdl.requireAuth, KiosController.getListKatalog)
router.put('/kios/list-katalog/update-status/:idmm', mdl.requireAuth, KiosController.saveUpdateStatusListKatalog)
router.put('/kios/list-katalog/update/:idmm', mdl.requireAuth, KiosController.saveUpdateListKatalog)


module.exports = router;