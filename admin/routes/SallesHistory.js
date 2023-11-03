const router = require("express").Router();
const { getAll,getAllbyDateAmount,getAllbyDateQuantity } = require("../controllers/SallesHistory.js");

router.get("/getall", getAll);
router.get("/lineamount", getAllbyDateAmount);
router.get("/linequantity", getAllbyDateQuantity);

module.exports = router;