sap.ui.define([
    "sap/ui/core/UIComponent",
    "shoppingcartapp/model/models"
], function (UIComponent, models) {
    "use strict";

    return UIComponent.extend("shoppingcartapp.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // Device model
            this.setModel(models.createDeviceModel(), "device");

            // Cart JSON model
            this.setModel(models.createCartModel(), "cart");

            // View model for undo/delete/search extra data
            this.setModel(models.createViewModel(), "view");

            // Enable routing
            this.getRouter().initialize();
        }
    });
});