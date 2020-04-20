from odoo import fields, models, api


class DynamicView(models.Model):
    _name = "view.dynamic"

    fields_show = fields.Char(string="Fields Show", default="[]")
    model = fields.Char(string="Model Name")
    view_id = fields.Many2one(string="View id", comodel_name="ir.ui.view")
    for_all = fields.Boolean(string="Apply for All Users", default=False)

    @api.model
    def change_fields(self, values):
        records = self.search([("model", "=", values.get("model", False)),
                               ("create_uid", "=", self.env.user.id),
                               ("view_id", '=', values.get("view_id", False))])
        values['fields_show'] = str(values.get('fields_show', {}))
        if records:
            records[0].write(values)
        else:
            self.create(values)
        return True


DynamicView()
