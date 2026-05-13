sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "shoppingcartapp/model/formatter",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, formatter, MessageToast, History) {
    "use strict";

    return Controller.extend("shoppingcartapp.controller.Cart", {
        formatter: formatter,

        onInit: function () {
            this._recalculateCart();
        },

        onBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("ProductList");
            }
        },

        onNavProducts: function () {
            this.getOwnerComponent().getRouter().navTo("ProductList");
        },

        onQuantityChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var iQty = Number(sValue);

            var oContext = oInput.getBindingContext("cart");
            var oItem = oContext.getObject();

            if (!sValue || isNaN(sValue) || iQty <= 0) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Quantity must be greater than 0");
                return;
            }

            if (iQty > Number(oItem.UnitsInStock)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Quantity cannot exceed stock");
                MessageToast.show("Quantity cannot exceed stock");
                return;
            }

            oInput.setValueState("None");

            oItem.Quantity = iQty;
            this._recalculateCart();
        },

        onDeleteItem: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("cart");
            var sPath = oContext.getPath();
            var iIndex = Number(sPath.split("/").pop());

            var oCartModel = this.getOwnerComponent().getModel("cart");
            var aItems = oCartModel.getProperty("/items");

            var oDeletedItem = aItems.splice(iIndex, 1)[0];

            this.getOwnerComponent().getModel("view").setProperty("/lastDeletedItem", oDeletedItem);

            this._recalculateCart();
            MessageToast.show("Item deleted");
        },

        onUndoDelete: function () {
            var oViewModel = this.getOwnerComponent().getModel("view");
            var oDeletedItem = oViewModel.getProperty("/lastDeletedItem");

            if (!oDeletedItem) {
                MessageToast.show("No deleted item to restore");
                return;
            }

            var oCartModel = this.getOwnerComponent().getModel("cart");
            var aItems = oCartModel.getProperty("/items");

            var oExisting = aItems.find(function (item) {
                return item.ProductID === oDeletedItem.ProductID;
            });

            if (oExisting) {
                oExisting.Quantity += oDeletedItem.Quantity;
            } else {
                aItems.push(oDeletedItem);
            }

            oViewModel.setProperty("/lastDeletedItem", null);

            this._recalculateCart();
            MessageToast.show("Item restored");
        },

        onClearCart: function () {
            var oCartModel = this.getOwnerComponent().getModel("cart");

            oCartModel.setProperty("/items", []);
            oCartModel.setProperty("/grandTotal", 0);
            oCartModel.setProperty("/totalItems", 0);

            localStorage.removeItem("shoppingCart");

            MessageToast.show("Cart cleared");
        },

        _recalculateCart: function () {
            var oCartModel = this.getOwnerComponent().getModel("cart");
            var aItems = oCartModel.getProperty("/items") || [];

            var fGrandTotal = 0;
            var iTotalItems = 0;

            aItems.forEach(function (item) {
                item.Quantity = Number(item.Quantity);

                if (item.Quantity >= 10 && item.Quantity < 20) {
                    item.Discount = 10;
                } else if (item.Quantity >= 20) {
                    item.Discount = 20;
                } else {
                    item.Discount = 0;
                }

                var fTotal = Number(item.UnitPrice) * Number(item.Quantity);
                var fDiscountAmount = fTotal * item.Discount / 100;

                item.LineTotal = Number((fTotal - fDiscountAmount).toFixed(2));

                fGrandTotal += item.LineTotal;
                iTotalItems += item.Quantity;
            });

            oCartModel.setProperty("/items", aItems);
            oCartModel.setProperty("/grandTotal", Number(fGrandTotal.toFixed(2)));
            oCartModel.setProperty("/totalItems", iTotalItems);

            localStorage.setItem("shoppingCart", JSON.stringify(aItems));
        }
    });
});