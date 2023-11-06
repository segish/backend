const router = require("express").Router();
const { getAll,getAllbyDateAmount,getAllbyDateQuantity } = require("../controllers/SallesHistory.js");

router.get("/getall", getAll);

module.exports = router;