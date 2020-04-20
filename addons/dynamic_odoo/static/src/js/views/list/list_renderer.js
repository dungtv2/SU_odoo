odoo.define('dynamic_odoo.list_renderer', function(require) {

    var ListRenderer = require('web.ListRenderer');
    var FieldMany2One = require('web.relational_fields').FieldMany2One;
    var Widget = require('web.Widget');
    var BasicModel = require('web.BasicModel');
            var widget = new Widget();
            var model = new BasicModel(widget);

    ListRenderer.include({
        init: function (parent, state, params) {
            this._super(parent, state, params);
            this.viewInfo = params.viewInfo;
            this.search_domain = {};
            this.parent = parent;
            this.showSearchAdvance = true;

            this.fieldRender = {char: {render: this.renderFieldInput.bind(this)}, float: {render: this.renderFieldInput.bind(this)},
                                int: {render: this.renderFieldInput.bind(this)}, many2one: {render: this.renderFieldMany2one.bind(this)},
                                date: {render: this.renderFieldDate.bind(this)}, datetime: {render: this.renderFieldDate.bind(this)},
                                selection: {render: this.renderFieldSelection.bind(this)}
                }
        },
        renderFieldMany2one: function (field, container) {
            let self = this;
            const {name} = field;
            var many2one = new FieldMany2One(self, name, this.state, {
                mode: 'edit',
                viewType: this.viewType,
            });
            many2one.appendTo(container);
            const _setValue = function (value, options) {
                if (this.lastSetValue === value || (this.value === false && value === '')) {
                    return $.when();
                }
                this.lastSetValue = value;
                value = this._parseValue(value);
                this.$input.val(value.display_name);
                value ? (self.search_domain[name] = value.display_name) : (delete self.search_domain[name]);
                self._searchRenderData();
                var def = $.Deferred();
                return def;
            }
            many2one.$input.val(this.search_domain[name] || null);
            many2one._setValue = _setValue.bind(many2one);
        },
        renderFieldInput: function (field, container) {
            let self = this, view = $('<input>'), {name} = field;
            view.change(function () {
                let val = view.val();
                val ? (self.search_domain[name] = val) : (delete self.search_domain[name]);
                self._searchRenderData();
            });
            view.val(this.search_domain[name] || null);
            container.append(view);
        },
        renderFieldDate: function (field, container) {
            let self = this, {name} = field, view = $('<input name='+name+'>'), format = "DD/MM/YYYY",
                options = {autoUpdateInput: false, locale: {cancelLabel: 'Clear', format: format}};
            view.daterangepicker(options);
            view.change((ev) => {
                let value = ev.target.value;
                if (!value) {
                    delete self.search_domain[name];
                    self._searchRenderData();
                }
            });
            view.on('apply.daterangepicker', (ev, picker) => {
                const {startDate, endDate} = picker, val = startDate.format(format) + ' - ' + endDate.format(format);
                val ? (self.search_domain[name] = val) : (delete self.search_domain[name]);
                self._searchRenderData();
            });
            view.on('cancel.daterangepicker', () => {
                delete self.search_domain[name];
                self._searchRenderData();
            });
            view.val(this.search_domain[name] || null);
            container.append(view);
        },
        renderFieldSelection: function (field, container) {
            let self = this, {name} = field,
                view = $('<select><option></option></select>');
            field.selection.map((option) => {
                const [value, name] = option;
                view.append($('<option value='+value+'>'+name+'</option>'));
            });
            view.change(function () {
                let val = view.val();
                val ? (self.search_domain[name] = val) : (delete self.search_domain[name]);
                self._searchRenderData();
            });
            view.val(this.search_domain[name] || null);
            container.append(view);
        },
        _renderHeader: function (isGrouped) {
            let res = this._super(isGrouped);
            if (this.showSearchAdvance) {
                let $tr = $('<tr>').append(_.map(this.columns, this._renderSearch.bind(this)));
                if (this.hasSelectors) {
                    $tr.prepend($('<th>'));
                }
                res.append($tr);
            }
            return res;
        },
        _prepareSearchDomains: function () {
            let result = [], fields = this.state.fields;
            Object.keys(this.search_domain).map((d, idx) =>{
                let field = fields[d], val = this.search_domain[d];
                if (field.type == 'datetime'){
                    val = val.split(" - ");
                    let formatClient = "DD/MM/YYYY", formatServer = "YYYY/MM/DD",
                        from = (moment(val[0], formatClient)).format(formatServer),
                        to = (moment(val[1] || val[0], formatClient)).format(formatServer);
                    result.push([d, '>=', `${from}_00:00:00`]);
                    result.push([d, '<=', `${to}_23:59:59`]);
                }else if (field.type == 'date') {
                    result.push([d, '=', val]);
                }else if (['int', 'float'].indexOf(field.type) >= 0) {
                    result.push([d, '=', parseFloat(val)]);
                }else {
                    result.push([d, 'ilike', val]);
                }
            });
            return result
        },
        _searchRenderData: function () {
            var searchView = this.parent.searchview;
            var search = searchView.build_search_data();
            searchView.trigger_up('search', search);
        },
        _renderSearch: function (node) {
            let name = node.attrs.name, $th = $('<th>'),
                field = {...this.state.fields[name], name: name};
            if (!field || !(field.type in this.fieldRender)) {
                return $th;
            }
            this.fieldRender[field.type].render(field, $th)
            return $th;
        },
        _hasContent: function () {
            let result = this._super();
            if (Object.keys(this.search_domain).length > 0) {
                return true;
            }
            return result;
        },

    });

});
