const SubStores = require("../models/SubStore")
const History = require("../models/History")

//to sub store and history
const Transaction = async (quantity, item, warehouseName) => {
    const existingItem = await SubStores.findOne({ itemCode: item.itemCode, warehouseName });
    if (existingItem) {
        existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(quantity);
        await existingItem.save();
    } else {
        const newItem = new SubStores({
            name: item.name,
            itemCode: item.itemCode,
            specification: item.specification,
            type: item.type,
            warehouseName: warehouseName,
            quantity: quantity,
        });
        await newItem.save();
    }

    const newHistoryItem = new History({
        name: item.name,
        itemCode: item.itemCode,
        specification: item.specification,
        type: item.type,
        from: item.warehouseName,
        to: warehouseName,
        quantity: quantity,
        warehouseType: "mainstore"
    });
    await newHistoryItem.save();
    return "saved!"
}

module.exports = Transaction;