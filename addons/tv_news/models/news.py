import io
import os
import base64
import pathlib
from datetime import datetime
from PIL import Image, ImageFont, ImageDraw
from odoo import fields, api, models, tools
from odoo.tools import image
from odoo.addons.assets import ASSETS_PATH


class TVNews(models.Model):
    _name = "tv.news"

    name = fields.Char(string="Name", required=True)
    title = fields.Char(string="Title", required=True)
    description = fields.Text(string="Description")
    tags = fields.Many2many(string="Tags", comodel_name="tv.news.tags")
    keys = fields.Many2many(string="Keys", comodel_name="tv.news.keys")
    state = fields.Selection(string="Sate", default="draft",
                             selection=[('draft', 'Draft'),
                                        ('approve', 'Approve'),
                                        ('cancel', 'Cancel')])
    body = fields.Html(string="Body", help="Body")
    note = fields.Text(string="Note")
    category_id = fields.Many2many(comodel_name="tv.news.category", string="Category")
    hot = fields.Boolean(string="Hot**")
    creation_date = fields.Datetime(string="Creation Date", default=datetime.now())
    schedule_date = fields.Datetime(string="Schedule Date", default=datetime.now())
    # active = fields.Boolean(string="Active", default=True)
    image = fields.Many2one(string="Original", comodel_name="ir.attachment")
    image_thumb = fields.Many2one(string="Thumb", comodel_name="ir.attachment")
    image_medium = fields.Many2one(string="Medium", comodel_name="ir.attachment")
    image_top = fields.Many2one(string="Top", comodel_name="ir.attachment")
    image_left = fields.Many2one(string="Left", comodel_name="ir.attachment")
    img = fields.Char(string="Original", related="image.url", store=True)
    img_thumb = fields.Char(string="Thumb", related="image_thumb.url", store=True)
    img_medium = fields.Char(string="Medium", related="image_medium.url", store=True)
    img_top = fields.Char(string="Top", related="image_top.url", store=True)
    img_left = fields.Char(string="Left", related="image_left.url", store=True)

    @api.onchange('image')
    def _get_image(self):
        for record in self:
            if record.image:
                if not record.image_thumb:
                    record.image_thumb = record.image.copy()
                if not record.image_medium:
                    record.image_medium = record.image.copy()
                if not record.image_top:
                    record.image_top = record.image.copy()
                if not record.image_left:
                    record.image_left = record.image.copy()

    @api.model
    def resize_image(self, data, name, default="(128,128)"):
        if data:
            size = self.env['ir.config_parameter'].sudo().get_param(name, default=default)
            size = eval(size)

            path_assets = ASSETS_PATH
            img_path = path_assets.replace("/assets", data.url)
            img = Image.open(img_path)
            data_img = open(path_assets.replace("/assets", data.url), "rb").read()
            if not size == img.size:
                data_img = image.image_resize_image(base64.b64encode(data_img), size=size)
                data_img = base64.b64decode(data_img)
                # rewrite file name
                dot_files = [".png", ".jpg", ".jpeg", ".gif"]
                data_write = {"name": data.name, "url": data.url, "local_url": data.url}
                new_path = img_path
                for d_f in dot_files:
                    if data.name.find(d_f) >= 0:
                        str_replace = "_%s%s" % ("x".join([str(x) for x in size]), d_f)
                        data_write["name"] = data_write["name"].replace(d_f, str_replace)
                        data_write["url"] = data_write["url"].replace(d_f, str_replace)
                        data_write["local_url"] = data_write["local_url"].replace(d_f, str_replace)
                        new_path = new_path.replace(d_f, str_replace)
                        break

                # write image
                with open(new_path, "wb") as f:
                    f.write(data_img)
                if not data.is_copy:
                    os.remove(img_path)
                data.write(data_write)
        return True

    @api.onchange('image_thumb')
    def _onchange_thumb(self):
        self.resize_image(self.image_thumb, "tv_news.size_image_thumb")
        self.img_thumb = self.image_thumb.url

    @api.onchange('image_medium')
    def _onchange_medium(self):
        self.resize_image(self.image_medium, "tv_news.size_image_medium", default="(250, 160)")
        self.img_medium = self.image_medium.url

    @api.onchange('image_top')
    def _onchange_top(self):
        self.resize_image(self.image_top, "tv_news.size_image_top", default="(480, 300)")
        self.img_top = self.image_top.url

    @api.onchange('image_left')
    def _onchange_left(self):
        self.resize_image(self.image_left, "tv_news.size_image_left", default="(240, 300)")
        self.img_left = self.image_left.url

    @api.onchange("title")
    def onchange_title(self):
        self.name = self.title

    @api.multi
    def action_approve(self):
        res = self.write({"state": "approve"})
        return res

    @api.multi
    def action_cancel(self):
        res = self.write({"state": "cancel"})
        return res

    @api.model
    def create(self, values):
        res = super(TVNews, self).create(values)
        self.reset_hot()
        return res

    @api.multi
    def write(self, values):
        res = super(TVNews, self).write(values)
        self.reset_hot()
        return res

    @api.multi
    def reset_hot(self):
        if self.hot:
            for item in self:
                domain = [('hot', '=', True), ('category_id', '=', item.category_id.id)]
                self.search(domain).write({'hot': False})
        return True

    @api.multi
    def remove_image(self):
        for item in self:
            urls = [item.image.url, item.image_thumb.url, item.image_medium.url,
                    item.image_top.url, item.image_top.url]
            for url in urls:
                if not url:
                    continue
                url = ASSETS_PATH.replace("/assets", url)
                if os.path.exists(url):
                    os.remove(url)
        return True

    @api.multi
    def unlink(self):
        self.remove_image()
        res = super(TVNews, self).unlink()
        return res


TVNews()


class TVNewsCategory(models.Model):
    _name = "tv.news.category"

    name = fields.Char(string="Name")
    parent_id = fields.Many2one(comodel_name="tv.news.category", string="Parent")
    color = fields.Integer(string='Color Index')


TVNewsCategory()


class TVNewsTags(models.Model):
    _name = "tv.news.tags"

    name = fields.Char(string="Name")
    color = fields.Integer(string='Color Index')


TVNewsTags()


class TVNewsKeys(models.Model):
    _name = "tv.news.keys"

    name = fields.Char(string="Name")
    color = fields.Integer(string='Color Index')


TVNewsKeys()
