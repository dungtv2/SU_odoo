from odoo.models import BaseModel, AbstractModel
from odoo import api
from lxml import etree
import json
import odoo
# import odoo.SUPERUSER_ID

_load_views = AbstractModel.load_views
_fields_view_get = AbstractModel.fields_view_get


@api.model
def load_views(self, views, options=None):
    res = _load_views(self, views, options=options)
    return res

def list_view(self, data, res, view_id):
    doc = etree.XML(res['arch'])
    fields_show = eval(data[0].fields_show)
    field_base = {}
    for x in doc.xpath("//field"):
        if 'name' in x.attrib:
            field_base[x.attrib.get('name')] = x
            x.set("invisible", "1")
            doc.remove(x)
    for _field_name in fields_show:
        if _field_name['name'] in field_base:
            _field = field_base[_field_name['name']]
            _field.set("invisible", "0")
            _field.set("string", _field_name['string'])
            field_base.pop(_field_name['name'])
        else:
            _field = etree.Element(
                'field', {'name': _field_name['name'], 'string': _field_name['string']})
        doc.xpath("//tree")[0].append(_field)
    for _field_name in field_base:
        doc.xpath("//tree")[0].append(field_base[_field_name])
    res['arch'] = etree.tostring(doc)
    _arch, _fields = self.env['ir.ui.view'].postprocess_and_fields(
        self._name, etree.fromstring(res['arch']), view_id)
    res['arch'] = _arch
    res['fields'] = _fields

def form_view(self, data, res, view_id):
    doc = etree.XML(res['arch'])
    fields_show = eval(data[0].fields_show)

    def set_attr(node, attr_check):
        for attr in ["attrs", "modifiers"]:
            attr_json = node.get(attr) or '{}'
            attr_json = attr_json.replace("true", '1').replace("false", '0')
            attr_json = eval(attr_json)
            for _attr in attr_check:
                attr_json[_attr] = node[_attr]
                node.set(attr, json.dumps(attr_json))

    for field in fields_show:
        field_name = field['name']
        field_node = doc.xpath("//field[@name='%s']" % field_name)
        label_node = doc.xpath("//label[@for='%s']" % field_name)
        if len(field_node):
            field_node = field_node[-1]
            if 'name' in field_node.attrib:
                set_attr(field_node, ["string", "invisible", "readonly", "required"])
            field_node.set("string", str(field_node['string']))
            if field_name in res['fields']:
                field_get = res['fields'][field_name]
                if 'tree' in field_get['view'] and 'line' in field_get:
                    line_doc = etree.XML(field_get['views']['tree']['arch'])
                    for line_field in field_get['line']:
                        line_node = line_doc.xpath("//field[@name='%s']" % line_field['name'])
                        if len(line_node):
                            line_node = line_node[-1]
                            if 'name' in line_node.attrib:
                                set_attr(line_node, ["string", "invisible", "readonly", "required"])
                    field_get['views']['tree']['arch'] = etree.tostring(line_doc)
        if len(label_node):
            label_node = label_node[-1]
            set_attr(label_node, ["string", "invisible"])

@api.model
def fields_view_get(self, view_id=None, view_type='form', toolbar=False, submenu=False):
    res = _fields_view_get(self, view_id=view_id, view_type=view_type, toolbar=toolbar, submenu=submenu)
    hide_button = True
    if 'view.dynamic' in self.env.registry.models:
        view_dynamic = self.env['view.dynamic']
        domain = [('model', '=', self._name), ('view_id', '=', res.get('view_id', False)), ('create_uid', '=', self.env.user.id)]
        data_obj = view_dynamic.search(domain, limit=1)
        if data_obj and view_type in ['form']:
            form_view(self, data_obj, res, view_id)
        if data_obj and view_type in ['list', 'tree']:
            list_view(self, data_obj, res, view_id)
    res['fields_get'] = self.env[self._name].fields_get()
    res['hide_button'] = hide_button
    return res


AbstractModel.load_views = load_views
AbstractModel.fields_view_get = fields_view_get
