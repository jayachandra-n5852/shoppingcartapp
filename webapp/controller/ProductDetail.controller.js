sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "shoppingcartapp/model/formatter",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, formatter, MessageToast, History) {
    "use strict";

    return Controller.extend("shoppingcartapp.controller.ProductDetail", {
        formatter: formatter,

        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("ProductDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sProductId = oEvent.getParameter("arguments").id;
            var iProductId = parseInt(sProductId, 10);

            if (isNaN(iProductId)) {
                MessageToast.show("Invalid Product ID");
                this.getOwnerComponent().getRouter().navTo("ProductList", {}, true);
                return;
            }

            this.byId("quantityInput").setValue("1");
            this.byId("quantityInput").setValueState("None");

            this.getView().bindElement({
                path: "/Products(" + iProductId + ")",
                events: {
                    dataRequested: function () {
                        this.getView().setBusy(true);
                    }.bind(this),

                    dataReceived: function () {
                        this.getView().setBusy(false);

                        var oContext = this.getView().getBindingContext();

                        if (!oContext || !oContext.getObject()) {
                            MessageToast.show("Product details not found");
                            this.getOwnerComponent().getRouter().navTo("ProductList", {}, true);
                        }
                    }.bind(this)
                }
            });
        },

        onBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("ProductList", {}, true);
            }
        },

        onNavToCart: function () {
            this.getOwnerComponent().getRouter().navTo("Cart");
        },

        onQuantityLiveChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var iQty = Number(oInput.getValue());

            if (!iQty || isNaN(iQty) || iQty <= 0) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Quantity must be numeric and greater than 0");
                return;
            }

            var oContext = this.getView().getBindingContext();

            if (oContext) {
                var iStock = Number(oContext.getProperty("UnitsInStock"));

                if (iQty > iStock) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Quantity cannot exceed stock");
                    return;
                }
            }

            oInput.setValueState("None");
        },

        onAddToCart: function () {
            var oContext = this.getView().getBindingContext();

            if (!oContext) {
                MessageToast.show("Product data not loaded");
                return;
            }

            var oProduct = oContext.getObject();
            var oInput = this.byId("quantityInput");
            var iQty = Number(oInput.getValue());

            if (!oProduct) {
                MessageToast.show("Product data not available");
                return;
            }

            if (!iQty || isNaN(iQty) || iQty <= 0) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Enter valid quantity");
                MessageToast.show("Enter valid quantity");
                return;
            }

            if (iQty > Number(oProduct.UnitsInStock)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Quantity cannot exceed stock");
                MessageToast.show("Quantity cannot exceed stock");
                return;
            }

            oInput.setValueState("None");
            this._addProductToCart(oProduct, iQty);
        },

        _addProductToCart: function (oProduct, iQty) {
            var oCartModel = this.getOwnerComponent().getModel("cart");
            var aItems = oCartModel.getProperty("/items") || [];
            var iStock = Number(oProduct.UnitsInStock);

            var oExisting = aItems.find(function (item) {
                return Number(item.ProductID) === Number(oProduct.ProductID);
            });

            if (oExisting) {
                if (Number(oExisting.Quantity) + iQty > iStock) {
                    MessageToast.show("Total quantity cannot exceed stock");
                    return;
                }

                oExisting.Quantity = Number(oExisting.Quantity) + iQty;
            } else {
                aItems.push({
                    ProductID: Number(oProduct.ProductID),
                    ProductName: oProduct.ProductName,
                    UnitPrice: Number(oProduct.UnitPrice),
                    UnitsInStock: iStock,
                    Quantity: iQty,
                    Discount: 0,
                    LineTotal: Number(oProduct.UnitPrice) * iQty
                });
            }

            oCartModel.setProperty("/items", aItems);
            this._recalculateCart();

            MessageToast.show("Added to cart");
            this.getOwnerComponent().getRouter().navTo("Cart");
        },

        _recalculateCart: function () {
            var oCartModel = this.getOwnerComponent().getModel("cart");
            var aItems = oCartModel.getProperty("/items") || [];
            var fGrandTotal = 0;
            var iTotalItems = 0;

            aItems.forEach(function (item) {
                item.Quantity = Number(item.Quantity);
                item.UnitPrice = Number(item.UnitPrice);

                if (item.Quantity >= 20) {
                    item.Discount = 20;
                } else if (item.Quantity >= 10) {
                    item.Discount = 10;
                } else {
                    item.Discount = 0;
                }

                var fTotal = item.UnitPrice * item.Quantity;
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