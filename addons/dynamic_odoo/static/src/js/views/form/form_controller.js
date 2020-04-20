odoo.define('dynamic_odoo.form_controller', function(require) {
    var FormController = require('web.FormController');

    FormController.include({
        init: function (parent, model, renderer, params) {
            this._super(parent, model, renderer, params);
            this.viewInfo = renderer.viewInfo;
        },
        _get_node_string: function(fieldName, attr) {
            let fieldInfo = this.viewInfo.fields[fieldName] || {},
                fieldState = this.initialState.fieldsInfo.form[fieldName] || {},
                value = fieldState[attr] || fieldInfo[attr];
            if (fieldState.hasOwnProperty('modifiers') && 'attr' in fieldState.modifiers) {
                value = fieldState.modifiers[attr];
            }
            if (value && attr !== 'string') {
                let $checkbox = $("<input type='checkbox' />"), $text = $("<input type='text' />");
                $checkbox.attr({name: name+"_"+attr, 'data-ok': attr});
                $checkbox.val(value);
                if (!["False", "false", false, 0].includes(value)) {
                    $checkbox.attr({checked: true});
                }
                return $checkbox.html()+$text.html();
            }
            return value;
        },
        getFieldLine: function (field) {
            var self = this;
            var _field = this.initialState.fieldsInfo.form[field];
            if (_field !== undefined && _field.hasOwnProperty("views") && _field.views.hasOwnProperty("list")) {
                var field_ok_1 = _field.views.list.fields;
                var field_ok = _field.views.list.fieldsInfo.list;
                var html = "<div><h3 style='margin: 0px; padding: 5px 0px;'>Line</h3>"
                html += "<ul class='line'>";
                for (var i=0; i<Object.keys(field_ok).length; i++) {
                    var __f = field_ok[Object.keys(field_ok)[i]];
                    var __f_1 = field_ok_1[__f.name];
                    html += "<li>"
                    html += "<table style='width: 100%; margin-bottom: 8px;'>"
                    html += "<tr><td colspan='3'><input style='width: 100%; text-align: center; font-weight: bold' type='text' name='"+__f.name+"' value='"+(__f.string || __f_1.string)+"' /></td></tr>"
                    html += '<tr><td>'+self.getOk(__f, __f_1, "required")+'</td><td><i class="fa fa-cog lili" aria-label="Config" role="img" title="Config"></i></i></td><td>Required</td></tr>'
                    html += '<tr><td>'+self.getOk(__f, __f_1, "invisible")+'</td><td><i class="fa fa-cog lili" aria-label="Config" role="img" title="Config"></i></td><td>Invisible</td></tr>'
                    html += '<tr><td>'+self.getOk(__f, __f_1, "readonly")+'</td><td><i class="fa fa-cog lili" aria-label="Config" role="img" title="Config"></i></td><td>Readonly</td></tr>'
                    html += '</table>'
                    html += '</li>'
                }
                html += "</ul>"
                html += "</div>"
                return html
            }
            return "";
        },
        getOk: function (field, field1, attr) {
            var value = false;
            if (field1 && field1.hasOwnProperty(attr)) {
                value = field1[attr];
            }
            if (field) {
                if (field.hasOwnProperty(attr)) {
                    value = field[attr];
                }
                // var _field = JSON.parse(field['modifiers'] || '{}');
                // if (_field.hasOwnProperty(attr)) {
                //     value = _field[attr];
                // }
                if (field.hasOwnProperty('modifiers') && field.modifiers.hasOwnProperty(attr)) {
                    value = field.modifiers[attr];
                }
            }
            if (attr != "string") {
                var data = ""
                if (value === "True" || value === "true" || value === true || value == 1) {
                    data += "<input type='checkbox' value='"+value+"' name='" + field.name + "_" + attr + "' data-ak='" + attr + "' checked /> ";
                    data += "<input class='titi' type='text' style='display: none; position: absolute' data='hide' value='"+value+"' />";
                    return data;
                }else if (value === "False" || value === "false" || value === false || value == 0) {
                    data += "<input type='checkbox' value='"+value+"' name='" + field.name + "_" + attr + "' data-ak='" + attr + "' />";
                    data += "<input class='titi' type='text' style='display: none; position: absolute' data='hide' value='"+value+"' />";
                    return data;
                }else if (value) {
                    if (value.indexOf("[[") >= 0 || Array.isArray(value)) {
                        data += "<input type='checkbox' value='"+JSON.stringify(value)+"' name='" + field.name + "_" + attr + "' data-ak='" + attr + "' checked />";
                        data += "<input class='titi' type='text' style='display: none; position: absolute' data='hide' value='"+JSON.stringify(value)+"' />";
                    }else {
                        data += '<input type="checkbox" value="'+value+'" name="' + field.name + '_' + attr + '" data-ak="' + attr + '" checked />';
                        data += '<input class="titi" type="text" style="display: none; position: absolute" data="hide" value="'+value+'" />';
                    }
                    return data;
                }
                return "<input type='input' value='"+JSON.stringify(value)+"' name='" + field.name + "_" + attr + "' data-ak='" + attr + "' />";
            }
            return value;
        },
        renderButtons: function($node) {
            this._super($node);
            if (this.$buttons && this.$buttons.find('.su_fields_show').length > 0) {
                this.show_ok = false;
                var self = this;
                // if (this.fields_view.arch.attrs.hasOwnProperty("apply_for_all")) {
                //     this.$buttons.find("#apply_for").prop("checked", true);
                // }
                this.$buttons.on('click', '.su_btn-show-fields', function () {
                    if (!self.show_ok) {
                        self.show_ok = true;
                        $(this).parent().find(".wrapper-menu").addClass("display-block");
                    }else {
                        self.show_ok = false;
                        $(this).parent().find(".wrapper-menu").removeClass("display-block");
                    }
                });
                this.$buttons.on('click', '.su_fields_show .li_ok > a', this.onClickShowField.bind(this));
                this.$buttons.on('click', '.update_fields_show', this.updateShowField.bind(this));
                this.$buttons.on('click', '.su_dropdown input[type="checkbox"]', function () {
                    if ($(this).is(":checked")) {
                        $(this).parent().find('input[type="text"]').val(true);
                    }else {
                        $(this).parent().find('input[type="text"]').val(false);
                    }
                });
                this.$buttons.on('keypress', '.su_dropdown .li_ok > input', this.onChangeStringField.bind(this));
                this.$buttons.on('input', '.su_dropdown .titi', function (e) {
                    var cb = $(this).parent().find('input[type="checkbox"]');
                    var val = this.value;
                    if (!val || val == "false" || val == 0 || val == '0') {
                        cb.removeAttr("checked")
                    }else {
                        cb.prop("checked", true)
                    }
                    cb.val(val);
                });
                this.$buttons.on('focusout', '.su_dropdown .li_ok > input', this.onFocusOutTextField.bind(this));
                this.$buttons.on('click', '.su_dropdown .lili', this.onClickLili.bind(this));
                this.$buttons.on('click', '.su_fields_show li > span', this.onClickSpanCheck.bind(this));
                this.$buttons.on('click', '.show_ok + .lali', this.onclickSh.bind(this));
                this.$buttons.on('click', '.apply_for', this.onClickApply.bind(this))
                this.$buttons.find('#ul_fields_show').sortable();
                this.$buttons.find('#ul_fields_show').disableSelection();
            }
        },
        onClickApply: function (e) {
            var self = $(e.currentTarget);
            this._rpc({
                model: 'view.dynamic',
                method: 'get_all_users',
                kwargs: {},
            }).then(function (result) {
                var html = "<div class='apply_for_user'>"
                html += "<ul>"
                html += "<li><input type='checkbox' value='all' /><a>Apply for all users</a></li>"
                for (var i=0; i<result.length; i++) {
                    var user = result[i];
                    html += "<li><input type='checkbox' value='"+user.id+"' /><a>"+user.name+"</a></li>"
                }
                html += "</ul></div>";
                self.parent().after(html);
            });
        },
        onClickLili: function (e) {
            var self = $(e.currentTarget);
            var $parent = self.parent().parent();
            var data = $parent.find("input[type='text']").attr("data");
            if (data == "hide") {
                data = "show";
                $parent.find("input[type='text']").css({"display": "block"});
            }else {
                data = "hide";
                $parent.find("input[type='text']").css({"display": "none"});
            }
            $parent.find("input[type='text']").attr({data: data});
        },
        onclickSh: function (e) {
            var self = $(e.currentTarget);
            self.css({"display": "block"});
        },
        onClickSpanCheck: function (e) {
            var self = $(e.currentTarget);
            if (e.currentTarget.className.search('span_ticked') >= 0){
                self.parent().removeClass("selectedd");
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
        onChangeStringFieldOK: function (e) {
            var self = $(e.currentTarget);
            var text = self.val() + e.key;
            self.parent().find('input[type="checkbox"]').val(text);
        },
        getFieldsShow: function(e) {
            var fields_show = [];
            _(this.$buttons.find(".su_fields_show .li_ok")).each(function(result) {
                var $result = $(result);
                var invisible = false;
                var readonly = false;
                var required = false;
                var line = [];
                if ($result.find("[data-ok='invisible']").attr("type") === "checkbox") {
                    var check = $result.find("[data-ok='invisible']").is(":checked");
                    if (check) {
                        var val = $result.find("[data-ok='invisible']").parent().find("input[type='text']").val();
                        invisible = val.indexOf("]]") >= 0 ? JSON.parse(val) : val;
                    }else {
                        invisible = false;
                    }
                }
                if ($result.find("[data-ok='required']").attr("type") === "checkbox") {
                    var check = $result.find("[data-ok='required']").is(":checked");
                    if (check) {
                        var val = $result.find("[data-ok='required']").parent().find("input[type='text']").val();
                        required = val.indexOf("]]") >= 0 ? JSON.parse(val) : val;
                    }else {
                        required = false;
                    }
                }
                if ($result.find("[data-ok='readonly']").attr("type") === "checkbox") {
                    var check = $result.find("[data-ok='readonly']").is(":checked");
                    if (check) {
                        var val = $result.find("[data-ok='readonly']").parent().find("input[type='text']").val();
                        readonly = val.indexOf("]]") >= 0 ? JSON.parse(val) : val;
                    }else {
                        readonly = false;
                    }
                }
                if ($result.find('.line').length > 0) {
                    $result.find('.line').find('li').each(function (idx, $li) {
                        var $li = $($li);
                        var $input = $($li).find('input[type="text"]');
                        var data = {name: $input.attr("name"), string: $input.val()}
                        if ($li.find("[data-ak='invisible']").attr("type") === "checkbox") {
                            var check = $li.find("[data-ak='invisible']").is(":checked");
                            if (check) {
                                var val = $li.find("[data-ak='invisible']").parent().find("input[type='text']").val();
                                data.invisible = val.indexOf("]]") >= 0 ? JSON.parse(val) : val;
                            }else {
                                data.invisible = false;
                            }
                        }
                        if ($li.find("[data-ak='required']").attr("type") === "checkbox") {
                            var check = $li.find("[data-ak='required']").is(":checked");
                            if (check) {
                                var val = $li.find("[data-ak='required']").parent().find("input[type='text']").val();
                                data.required = val.indexOf("]]") >= 0 ? JSON.parse(val) : val;
                            }else {
                                data.required = false;
                            }
                        }
                        if ($li.find("[data-ak='readonly']").attr("type") === "checkbox") {
                            var check = $li.find("[data-ak='readonly']").is(":checked");
                            if (check) {
                                var val = $li.find("[data-ak='readonly']").parent().find("input[type='text']").val();
                                data.readonly = val.indexOf("]]") >= 0 ? JSON.parse(val) : val;
                            }else {
                                data.readonly = false;
                            }
                        }
                        line.push(data);
                    });
                }
                fields_show.push({string: $result.find('input').val().trim(), name: $result.attr("name"),
                    invisible: invisible, readonly: readonly, required: required, line: line});
            });
            return fields_show;
        },
        updateShowField: function (e) {
            var values = {model: this.modelName, for_all: $("body").find("#apply_for").is(":checked"), view_id: this.viewInfo.view_id,
                fields_show: this.getFieldsShow(e)};
            this._rpc({
                model: 'view.dynamic',
                method: 'change_fields',
                kwargs: {values: values},
            }).then(function (result) {
                location.reload();
            });
        },
        onClickShowField: function(e){
            e.stopPropagation();
            var $this = $(e.currentTarget).parent();
            if ($this.attr("class").search('selectedd') < 0){
                $this.find(".lala").css({display: "block"})
                $this.addClass("selectedd");
                $this.find('.xixi').addClass("display-block");
            }else{
                $this.find(".lala").css({display: "none"});
                $this.removeClass("selectedd");
                $this.find('.xixi').removeClass("display-block");
            }
        }
    });
});
