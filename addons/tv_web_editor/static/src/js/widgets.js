odoo.define('tv_web_editor.widget', function (require) {
    'use strict';

    var core = require('web.core');
    var Dialog = require('web.Dialog');
    var Widget = require('web.Widget');
    var utils = require('web.utils');
    var widget = require("web_editor.widget");

    widget.ImageDialog.prototype.events['click button.filepicker1'] = 'onclick_my_upload';

    widget.ImageDialog.include({
        onclick_my_upload: function () {
            var filepicker = this.$('input[type=file]');
            this.$('input[name="flag_store"]').val("true");
            if (!_.isEmpty(filepicker)) {
                filepicker[0].click();
            }
        },
    });
});