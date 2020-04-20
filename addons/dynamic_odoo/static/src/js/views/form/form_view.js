odoo.define('dynamic_odoo.form_view', function(require) {
    var FormView = require('web.FormView');

    FormView.include({
        init: function (viewInfo, params) {
            this._super(viewInfo, params);
            this.rendererParams.viewInfo = viewInfo;
        }
    });
});
