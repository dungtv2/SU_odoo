from odoo import fields, models, api
from lxml import etree


class SUShowFields(models.Model):
    _name = "show.field"

    fields_show = fields.Char(string="Fields Show", default="[]")
    model = fields.Char(string="Model Name")
    view_id = fields.Many2one(string="View id", comodel_name="ir.ui.view")

    @api.model
    def change_fields(self, values):
        print(values)
        records = self.search([("model", "=", values.get("model", False)),
                               ("create_uid", "=", self.env.user.id),
                               ("view_id", '=', values.get("view_id", False))])
        values['fields_show'] = str(values.get('fields_show', {}))
        if records:
            records[0].write(values)
        else:
            self.create(values)
        return True


SUShowFields()
