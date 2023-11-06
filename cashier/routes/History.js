const router = require("express").Router();
const { getAll } = require("../controllers/History.js");

router.get("/getall", getAll);

module.exports = router;