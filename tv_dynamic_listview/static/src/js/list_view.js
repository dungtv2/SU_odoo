odoo.define('tv_dynamic_listview.dynamic_listview', function(require) {
    var core = require('web.core');
    var session = require('web.session');
    var ListView = require('web.ListView');
    var ListRenderer = require('web.ListRenderer');
    var ListController = require('web.ListController');

    ListView.include({
        init: function (viewInfo, params) {
            this._super(viewInfo, params);
            this.rendererParams.viewInfo = viewInfo;
        }
    });

    ListRenderer.include({
        init: function (parent, state, params) {
            this._super(parent, state, params);
            this.viewInfo = params.viewInfo;
        },
    });

    ListController.include({
        init: function (parent, model, renderer, params) {
            this._super(parent, model, renderer, params);
            this.viewInfo = renderer.viewInfo;
            this.uid = session.uid
        },
        _get_node_string: function(field_name) {
            var field = this.viewInfo.fields[field_name];
            var _field = this.viewInfo.fieldsInfo.list[field_name];
            var result = field.string;
            if (_field.hasOwnProperty("string")) {
                result = _field.string;
            }
            return result;
        },
        renderButtons: function($node) {
            this._super($node);
            if (this.$buttons) {
                this.$buttons.on('click', '.su_fields_show li', this.proxy('onClickShowField'));
                this.$buttons.on('click', '.update_fields_show', this.proxy('updateShowField'));
                this.$buttons.on('keypress', '.su_dropdown li > input', this.proxy('onChangeStringField'));
                this.$buttons.on('focusout', '.su_dropdown li > input', this.proxy('onFocusOutTextField'));
                this.$buttons.on('click', '.su_fields_show li > span', this.proxy('onClickSpanCheck'));
                this.$buttons.on('click', '#apply_for_all_user', this.proxy('onClickApplyAll'));
                this.$buttons.find('#ul_fields_show').sortable();
                this.$buttons.find('#ul_fields_show').disableSelection();
            }
        },
        onClickApplyAll: function(e){
            e.stopPropagation();
        },
        onClickSpanCheck: function (e) {
            var self = $(e.currentTarget);
            if (e.currentTarget.className.search('span_ticked') >= 0){
                self.parent().removeClass("selected");
                self.removeClass("span_ticked");
            }
            e.stopPropagation();
        },
        onFocusOutTextField: function (e) {
            var self = $(e.currentTarget);
            self.removeClass("display-block");
            self.parent().find('a').removeClass("display-none");
        },
        onChangeStringField: function (e) {
            var self = $(e.currentTarget);
            var text = self.val() + e.key;
            self.parent().find('a').text(text);
        },
        getFieldsShow: function() {
            var fields_show = [];
            var sequence = 1;
            _(this.$buttons.find(".su_fields_show li.selected")).each(function(result) {
                var $result = $(result);
                fields_show.push({string: $result.find('input').val().trim(), sequence: sequence, name: $result.attr("name")});
                sequence += 1;
            });
            return fields_show;
        },
        updateShowField: function () {
            // var self = this;
            var values = {model: this.modelName, view_id: this.viewInfo.view_id, fields_show: this.getFieldsShow(),
                            for_all_user: this.$buttons.find("#apply_for_all_user:checked").length ? true : false};
            this._rpc({
                model: 'show.field',
                method: 'change_fields',
                kwargs: {values: values},
            }).then(function (result) {
                location.reload();
            });
        },
        onClickShowField: function(e){
            e.stopPropagation();
            var self = $(e.currentTarget);
            if (e.currentTarget.className.search('selected') < 0){
                self.addClass("selected");
                self.find('span').addClass("span_ticked");
            }else{
                self.find('input').addClass("display-block");
                self.find('a').addClass("display-none");
            }
        }
    });
});