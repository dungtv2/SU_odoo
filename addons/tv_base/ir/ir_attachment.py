from odoo import fields, models, api


class IRAttachment(models.Model):
    _inherit = "ir.attachment"

    original_name = fields.Char(string="Original Name")


IRAttachment()
