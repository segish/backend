const Shops = require("../models/Shop")
const History = require("../models/History")

//to shop and history
const TransactionToShop = async (quantity, item, warehouseName) => {
    try {
        const existingItem = await Shops.findOne({ itemCode: item.itemCode, warehouseName });
        if (existingItem) {
            existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(quantity);
            await existingItem.save();
        } else {
            const newItem = new Shops({
                name: item.name,
                itemCode: item.itemCode,
                specification: item.specification,
                type: item.type,
                warehouseName: warehouseName,
                quantity: quantity,
            });
            const y = await newItem.save();
        }

        const newHistoryItem = new History({
            name: item.name,
            itemCode: item.itemCode,
            specification: item.specification,
            type: item.type,
            from: item.from,
            to: warehouseName,
            quantity: quantity,
            warehouseType: "subStore"
        });
        await newHistoryItem.save();
        return true;
    } catch (error) {
        return false;
    }

}
module.exports = TransactionToShop;