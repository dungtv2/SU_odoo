odoo.define('dynamic_odoo.list_view', function(require) {

    var ListView = require('web.ListView');

    ListView.include({
        init: function (viewInfo, params) {
            this._super(viewInfo, params);
            this.rendererParams.viewInfo = viewInfo;
            // this.renderer.controller = this;
            // if (parent.searchview) {
            //     parent.searchview.listViewRender = renderer;
            // }
        }
    });

});
