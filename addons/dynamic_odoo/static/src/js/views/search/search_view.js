odoo.define('dynamic_odoo.search_view', function (require) {
    "use strict";

    var core = require('web.core');
    var SearchView = require('web.SearchView');

    SearchView.include({
        init: function (parent, dataset, fvg, options) {
            this._super.apply(this, arguments);
            parent.searchview = this;
        },
        build_search_data: function () {
            let res = this._super();
            if (this.listViewRender) {
                var domains = this.listViewRender._prepareSearchDomains();
                if (res.domains.length >= 1) {
                    res.domains[0] = res.domains[0].concat(domains);
                }else {
                    res.domains[0] = domains;
                }
            }
            return res
        }
    });
});
