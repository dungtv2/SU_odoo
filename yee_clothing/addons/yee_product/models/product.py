from odoo import api, models, fields


class ProductTemplate(models.Model):
    _inherit = "product.template"

    def read(self, fields=None, load='_classic_read'):
        res = super(ProductTemplate, self).read(fields=fields, load=load)
        return res

    # image_more = fields.Many2many(string="Images", comodel_name="ir.attachment")


ProductTemplate()


class ProductProduct(models.Model):
    _inherit = "product.product"

    sale_price = fields.Float(string="Sale Price", related="lst_price", store=True)
    image_more = fields.Many2many(string="Images", comodel_name="ir.attachment")

    @api.model
    def create(self, values):
        res = super(ProductProduct, self).create(values)
        res.image_more.write({'res_field': 'image_more', 'res_id': res.id})
        return res

    def write(self, values):
        if 'image_more' in values:
            img_more = values['image_more'][0][2]
            self.env['ir.attachment'].browse(img_more).write({'res_field': 'image_more'})
            self.env['ir.attachment'].search([['res_model', '=', 'product.product'],
                                              ['res_field', '=', 'image_more'],
                                              ['res_id', '=', self.ids], ['id', 'not in', img_more]]).unlink()
        res = super(ProductProduct, self).write(values)
        return res


ProductProduct()
