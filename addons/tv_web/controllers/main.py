import base64
import logging
import json
import pathlib
import io
from PIL import Image
import odoo
from odoo.http import request
from odoo.addons.web.controllers.main import serialize_exception
from odoo.tools.translate import _
from odoo import http, tools
from datetime import datetime


_logger = logging.getLogger(__name__)


class Binary(http.Controller):

    @http.route('/web/binary/my_upload_attachment', type='http', auth="user")
    @serialize_exception
    def my_upload_attachment(self, callback, model, id, ufile):
        files = request.httprequest.files.getlist('ufile')
        Model = request.env['ir.attachment']
        out = """<script language="javascript" type="text/javascript">
                    var win = window.top.window;
                    win.jQuery(win).trigger(%s, %s);
                </script>"""
        args = []
        for ufile in files:
            store_path = tools.config['store_path']
            url_img = tools.config['url_img']
            current_date = datetime.now()
            folder_flow_date = '%s/%s/%s' % (current_date.year, current_date.month, current_date.day)
            store_path = '%s/%s' % (store_path, folder_flow_date)
            file_name = ufile.filename
            try:
                pathlib.Path(store_path).mkdir(parents=True, exist_ok=True)
                data = ufile.read()
                try:
                    image = Image.open(io.BytesIO(data))
                    w, h = image.size
                    if w * h > 42e6:  # Nokia Lumia 1020 photo resolution
                        raise ValueError(
                            u"Image size excessive, uploaded images must be smaller "
                            u"than 42 million pixel")
                    # if not disable_optimization and image.format in ('PNG', 'JPEG'):
                    #     data = tools.image_save_for_web(image)
                    with open("%s/%s" % (store_path, file_name), "wb") as f:
                        f.write(data)
                except IOError as e:
                    pass

                attachment = Model.create({
                    'name': file_name,
                    'type': 'url',
                    'url': "%s/%s/%s" % (url_img, folder_flow_date, file_name),
                    'res_model': model,
                    'res_id': int(1),
                    'is_store': True,
                })
            except Exception:
                args = args.append({'error': _("Something horrible happened")})
                _logger.exception("Fail to upload attachment %s" % file_name)
            else:
                args.append({
                    'filename': file_name,
                    'mimetype': ufile.content_type,
                    'id': attachment.id
                })
        return out % (json.dumps(callback), json.dumps(args))
