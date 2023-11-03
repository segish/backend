const router = require("express").Router();
const { addSpecification, deleteSpecification, getAll, updateSpecification } = require("../controllers/Specifications.js");

router.post("/add", addSpecification);
router.delete("/delete/:id", deleteSpecification);
router.get("/getall", getAll);
router.post("/update/:id", updateSpecification);

module.exports = router;