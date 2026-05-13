sap.ui.define([], function () {
    "use strict";

    return {
        price: function (value) {
            if (value === null || value === undefined) {
                return "₹0.00";
            }
            return "₹" + parseFloat(value).toFixed(2);
        },

        stockState: function (stock) {
            stock = Number(stock);
            if (stock === 0) {
                return "Error";
            }
            if (stock < 10) {
                return "Warning";
            }
            return "Success";
        },

        stockText: function (stock) {
            return "Stock: " + stock;
        },

        discountText: function (discount) {
            if (!discount) {
                return "No Discount";
            }
            return discount + "% Discount";
        }
    };
});