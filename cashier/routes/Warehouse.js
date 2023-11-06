const router = require("express").Router();
const { getAll } = require("../controllers/Warehouses.js");

router.get("/getall", getAll);

module.exports = router;