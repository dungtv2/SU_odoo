# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import base64
import io
import json
import logging
import os
import re
import time
import pathlib
import werkzeug.wrappers
from datetime import datetime
from PIL import Image, ImageFont, ImageDraw
from lxml import etree, html

from odoo.http import request
from odoo.addons.web_editor.controllers import main
from odoo import http, tools
from odoo.addons.assets import ASSETS_PATH


logger = logging.getLogger(__name__)


class WebEditor(main.Web_Editor):

    @http.route('/web_editor/attachment/add', type='http', auth='user', methods=['POST'])
    def attach(self, func, upload=None, url=None, disable_optimization=None, **kwargs):
        if kwargs.get("flag_store", "false") == "true":
            attachments = request.env['ir.attachment']  # registry for the attachment table

            res_model = kwargs.get('res_model', 'ir.ui.view')
            res_id = res_model != 'ir.ui.view' and kwargs.get('res_id') or None

            uploads = []
            message = None
            try:
                store_path = tools.config['store_path']
                url_img = tools.config['url_img']
                am_obj = request.env['ir.attachment']
                for c_file in request.httprequest.files.getlist('upload'):
                    data = c_file.read()
                    current_date = datetime.now()
                    folder_flow_date = '%s/%s/%s' % (current_date.year, current_date.month, current_date.day)
                    store_path = '%s/%s' % (store_path, folder_flow_date)
                    pathlib.Path(store_path).mkdir(parents=True, exist_ok=True)
                    try:
                        image = Image.open(io.BytesIO(data))
                        w, h = image.size
                        if w * h > 42e6:  # Nokia Lumia 1020 photo resolution
                            raise ValueError(
                                u"Image size excessive, uploaded images must be smaller "
                                u"than 42 million pixel")
                        if not disable_optimization and image.format in ('PNG', 'JPEG'):
                            data = tools.image_save_for_web(image)
                        with open("%s/%s" % (store_path, c_file.filename), "wb") as f:
                            f.write(data)
                    except IOError as e:
                        pass

                    pathlib.Path().mkdir(
                        parents=True, exist_ok=True)
                    attachment = attachments.create({
                        'name': c_file.filename,
                        'type': 'url',
                        'url': "%s/%s/%s" % (url_img, folder_flow_date, c_file.filename),
                        'public': True,
                        'res_id': res_id,
                        'res_model': res_model,
                        'is_store': True,
                    })
                    attachment.generate_access_token()
                    am_obj += attachment
                    uploads += attachment.read(['name', 'mimetype', 'checksum', 'url',
                                                'res_id', 'res_model', 'access_token'])
            except Exception as e:
                logger.exception(e)
                logger.exception("Failed to upload image to attachment")
            return """<script type='text/javascript'>
                          window.parent['%s'](%s, %s);
                      </script>""" % (func, json.dumps(uploads), json.dumps(message))
        res = super(WebEditor, self).attach(func, upload=upload, url=url,
                                            disable_optimization=disable_optimization, **kwargs)
        return res


WebEditor()
