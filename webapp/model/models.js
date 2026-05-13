sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createCartModel: function () {
            var sSavedCart = localStorage.getItem("shoppingCart");

            var oData = {
                items: sSavedCart ? JSON.parse(sSavedCart) : [],
                grandTotal: 0,
                totalItems: 0
            };

            return new JSONModel(oData);
        },

        createViewModel: function () {
            return new JSONModel({
                search: "",
                maxPrice: "",
                lastDeletedItem: null
            });
        }
    };
});