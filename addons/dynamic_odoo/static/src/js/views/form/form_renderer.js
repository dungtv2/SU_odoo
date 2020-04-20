odoo.define('dynamic_odoo.form_renderer', function(require) {

    var FormRenderer = require('web.FormRenderer');

    FormRenderer.include({
        init: function (parent, state, params) {
            this._super(parent, state, params);
            this.viewInfo = params.viewInfo;
        },
        renderAttribute: function () {

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
        // <li class="li_ok" t-att-name="field">
        renderField: function () {
            const fields = this.viewInfo.fields;
            Object.values(fields).map((field) => {
                let line = $('<li></li>')
            });
        },
        renderElement: function () {
            this._super();
            this.renderField();
        }
    });
});
