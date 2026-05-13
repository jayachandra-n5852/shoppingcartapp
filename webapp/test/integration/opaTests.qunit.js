/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["shoppingcartapp/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
