const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const bodypaser = require("body-parser");
const authRouter = require("./routes/auth");
const itemRouter = require("./routes/Items");
const warehouseRouter = require("./routes/Warehouse");
const typeRouter = require("./routes/Types");
const pendingRouter = require("./routes/Pendings");
const MainStoreRouter = require("./routes/MainStores");
const SubStoreRouter = require("./routes/SubStores");
const ShopRouter = require("./routes/Shops");
const CreditRouter = require("./routes/Credits");
const HistoryRouter = require("./routes/History");
const ToShopPendingRouter = require("./routes/ToShopPending");
const SallesPendingRouter = require("./routes/SallesPending");
const sallsHistoryRouter = require("./routes/SallesHistory");
const expenseRouter = require("./routes/Expense");
const cookieParser = require("cookie-parser");

dotenv.config();
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
},).then(() => console.log("Connected to MongoDB"))
    .catch((err) => { console.log(" can't Connecte to MongDB because of =>" + err) })

//midleware
app.use(bodypaser.json({ limit: '50mb' }));
app.use(bodypaser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(helmet());
app.use(morgan("common"));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true);
    next();
});
app.use(
    cors({
        origin: process.env.CORS_ORIGIN_URL,
    })
);

//routs
app.use("/api/auth", authRouter)
app.use("/api/items", itemRouter)
app.use("/api/warehouse", warehouseRouter)
app.use("/api/type", typeRouter)
app.use("/api/pending", pendingRouter)
app.use("/api/mainstore", MainStoreRouter)
app.use("/api/Substore", SubStoreRouter)
app.use("/api/Shop", ShopRouter)
app.use("/api/credit", CreditRouter)
app.use("/api/history", HistoryRouter)
app.use("/api/salleshistory", sallsHistoryRouter)
app.use("/api/toshoppending", ToShopPendingRouter)
app.use("/api/sallespending", SallesPendingRouter);
app.use("/api/expense", expenseRouter);

app.listen(8000, () => {
    console.log("Admin backend server is running!");
});
