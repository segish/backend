const Shops = require("../models/Shop")
const SellsHistory = require("../models/SellsHistory")

//to sells history
const SellsTransaction = async (quantity, item, warehouseName) => {
    const newHistoryItem = new History({
        name: item.name,
        itemCode: item.itemCode,
        specification: item.specification,
        type: item.type,
        from: item.warehouseName,
        to: warehouseName,
        quantity: quantity,
    });
    await newHistoryItem.save();
    return "saved!"
}
module.exports = SellsTransaction;