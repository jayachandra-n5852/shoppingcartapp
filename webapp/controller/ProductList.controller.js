sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "shoppingcartapp/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, formatter, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("shoppingcartapp.controller.ProductList", {
        formatter: formatter,

        onViewDetails: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                MessageToast.show("Product context not found");
                return;
            }

            var iProductId = oContext.getProperty("ProductID");

            this.getOwnerComponent().getRouter().navTo("ProductDetail", {
                id: iProductId
            });
        },

        onNavToCart: function () {
            this.getOwnerComponent().getRouter().navTo("Cart");
        },

        onSearch: function () {
            var sName = this.byId("productSearch").getValue();
            var sMaxPrice = this.byId("maxPriceInput").getValue();
            var aFilters = [];

            if (sName) {
                aFilters.push(new Filter(
                    "ProductName",
                    FilterOperator.Contains,
                    sName
                ));
            }

            if (sMaxPrice) {
                aFilters.push(new Filter(
                    "UnitPrice",
                    FilterOperator.LE,
                    parseFloat(sMaxPrice)
                ));
            }

            var oBinding = this.byId("productList").getBinding("items");

            if (oBinding) {
                oBinding.filter(aFilters);
            }
        }
    });
});