odoo.define('tv_dynamic_formview.dynamic_formview', function(require) {
    var core = require('web.core');
    var FormView = require('web.FormView');
    var FormRenderer = require('web.FormRenderer');
    var FormController = require('web.FormController');

    FormView.include({
        init: function (viewInfo, params) {
            this._super(viewInfo, params);
            this.rendererParams.viewInfo = viewInfo;
        }
    });

    FormRenderer.include({
        init: function (parent, state, params) {
            this._super(parent, state, params);
            this.viewInfo = params.viewInfo;
        },
    });

    FormController.include({
        init: function (parent, model, renderer, params) {
            this._super(parent, model, renderer, params);
            this.viewInfo = renderer.viewInfo;
        },
        _get_node_string: function(field, attr) {
            var _field = this.viewInfo.fields[field];
            var _field_1 = this.viewInfo.fieldsInfo.form[field];
            var value = false;
            if (_field && _field.hasOwnProperty(attr)) {
                value = _field[attr];
            }
            if (_field_1 && _field_1.hasOwnProperty(attr)) {
                value = _field_1[attr];
            }
            if (attr != "string") {
                if (value === "True") {
                    return "<input type='checkbox' name='" + field + "_" + attr + "' data-ok='" + attr + "' checked />";
                }
                return "<input type='checkbox' name='" + field + "_" + attr + "' data-ok='" + attr + "' />";
            }
            return value;
        },
        renderButtons: function($node) {
            this._super($node);
            if (this.$buttons) {
                this.show_ok = false;
                var self = this;
                this.$buttons.on('click', '.su_btn-show-fields', function () {
                    if (!self.show_ok) {
                        self.show_ok = true;
                        $(this).parent().find(".wrapper-menu").addClass("display-block");
                    }else {
                        self.show_ok = false;
                        $(this).parent().find(".wrapper-menu").removeClass("display-block");
                    }
                });
                this.$buttons.on('click', '.su_fields_show li > a', this.proxy('onClickShowField'));
                this.$buttons.on('click', '.update_fields_show', this.proxy('updateShowField'));
                this.$buttons.on('keypress', '.su_dropdown li > input', this.proxy('onChangeStringField'));
                this.$buttons.on('focusout', '.su_dropdown li > input', this.proxy('onFocusOutTextField'));
                this.$buttons.on('click', '.su_fields_show li > span', this.proxy('onClickSpanCheck'));
                this.$buttons.find('#ul_fields_show').sortable();
                this.$buttons.find('#ul_fields_show').disableSelection();
            }
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
        getFieldsShow: function(e) {
            var fields_show = [];
            _(this.$buttons.find(".su_fields_show li")).each(function(result) {
                var $result = $(result);
                var invisible = $result.find("[data-ok='invisible']").is(":checked");
                var readonly = $result.find("[data-ok='readonly']").is(":checked");
                var required = $result.find("[data-ok='required']").is(":checked");
                fields_show.push({string: $result.find('input').val().trim(), name: $result.attr("name"),
                    invisible: invisible, readonly: readonly, required: required});
            });
            return fields_show;
        },
        updateShowField: function (e) {
            // var self = this;
            var values = {model: this.modelName, view_id: this.viewInfo.view_id, fields_show: this.getFieldsShow(e)};
            this._rpc({
                model: 'form.dynamic',
                method: 'change_fields',
                kwargs: {values: values},
            }).then(function (result) {
                location.reload();
            });
        },
        onClickShowField: function(e){
            e.stopPropagation();
            var $this = $(e.currentTarget).parent();
            if ($this.attr("class").search('selected') < 0){
                $this.find(".lala").css({display: "block"})
                $this.addClass("selected");
                $this.find('input').addClass("display-block");
                // $this.find('span').addClass("span_ticked");
            }else{
                $this.find(".lala").css({display: "none"});
                $this.removeClass("selected");
                // $this.find('span').removeClass("span_ticked");
                $this.find('input').removeClass("display-block");
                // self.find('a').addClass("display-none");
            }
        }
    });
});