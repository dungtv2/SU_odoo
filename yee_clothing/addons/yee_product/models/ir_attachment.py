from odoo import api, models, fields


class IRAttachment(models.Model):
    _inherit = "ir.attachment"

    @api.model
    def create(self, values):
        if 'res_model' in values and values['res_model'] in ['product.product', 'product.template']:
            values['db_datas'] = values['datas']
        res = super(IRAttachment, self).create(values)
        return res


IRAttachment()
