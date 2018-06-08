import os
from odoo import models, api, fields
from odoo.addons.assets import ASSETS_PATH


class IRAttachment(models.Model):
    _inherit = "ir.attachment"

    is_copy = fields.Boolean(string="Copy", default=False, copy=False)
    is_store = fields.Boolean(string="Store", default=False)

    @api.multi
    def copy(self, default=None):
        default = default or {}
        default["is_copy"] = True
        res = super(IRAttachment, self).copy(default=default)
        return res

    @api.multi
    def unlink(self):
        for item in self:
            if item.is_store:
                # remove image store when unlink record
                try:
                    path_assets = ASSETS_PATH
                    path_assets = path_assets.replace("/assets", item.url)
                    os.remove(path_assets)
                except Exception as e:
                    pass
        res = super(IRAttachment, self).unlink()
        return res


IRAttachment()
