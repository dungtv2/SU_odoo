from odoo import fields, models, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    size_image_thumb = fields.Char(string='Thumbnail size(128*128)', default="(128,128)")
    size_image_medium = fields.Char(string='Medium size(250*160)', default="(250,160)")
    size_image_top = fields.Char(string='Top size(480*300)', default="(480,300)")
    size_image_left = fields.Char(string='Left size(240*300)', default="(240,300)")

    @api.model
    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        ir_config = self.env['ir.config_parameter'].sudo()
        res.update(
            size_image_thumb=ir_config.get_param('tv_news.size_image_thumb', default="(128,128)"),
            size_image_medium=ir_config.get_param('tv_news.size_image_medium', default="(250,160)"),
            size_image_top=ir_config.get_param('tv_news.size_image_top', default="(480,300)"),
            size_image_left=ir_config.get_param('tv_news.size_image_left', default="(240,300)")
        )
        return res

    @api.multi
    def set_values(self):
        super(ResConfigSettings, self).set_values()
        ir_config = self.env['ir.config_parameter'].sudo()
        ir_config.set_param('tv_news.size_image_thumb', self.size_image_thumb)
        ir_config.set_param('tv_news.size_image_medium', self.size_image_medium)
        ir_config.set_param('tv_news.size_image_top', self.size_image_top)
        ir_config.set_param('tv_news.size_image_left', self.size_image_left)


ResConfigSettings()
