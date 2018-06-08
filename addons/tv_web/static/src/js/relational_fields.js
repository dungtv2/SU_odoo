odoo.define('tv_web.relational_fields', function (require) {
    'use strict';

    var AbstractField = require('web.AbstractField');
    var core = require('web.core');
    var Dialog = require('web.Dialog');
    var Widget = require('web.Widget');
    var utils = require('web.utils');
    var relational_fields = require("web.relational_fields");
    var registry = require('web.field_registry');

    var _t = core._t;
    var qweb = core.qweb;

    var One2ManyBinaryMultiFiles = AbstractField.extend({
        template: "O2MFieldBinaryFileUploader",
        supportedFieldTypes: ['many2one'],
        fieldsToFetch: {
            name: {type: 'char'},
            datas_fname: {type: 'char'},
            mimetype: {type: 'char'},
        },
        events: {
            'click .o_attach': '_onAttach',
            'click .oe_delete': '_onDelete',
            'change .o_input_file': '_onFileChanged',
        },
        /**
         * @constructor
         */
        init: function () {
            this._super.apply(this, arguments);

            this.uploadedFiles = {};
            this.uploadingFiles = [];
            this.fileupload_id = _.uniqueId('oe_fileupload_temp');
            $(window).on(this.fileupload_id, this._onFileLoaded.bind(this));

            this.metadata = {};
        },

        destroy: function () {
            this._super();
            $(window).off(this.fileupload_id);
        },

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        /**
         * Compute the URL of an attachment.
         *
         * @private
         * @param {Object} attachment
         * @returns {string} URL of the attachment
         */
        _getFileUrl: function (attachment) {
            return '/web/content/' + attachment.id + '?download=true';
        },
        /**
         * Process the field data to add some information (url, etc.).
         *
         * @private
         */
        _generatedMetadata: function () {
            var self = this;
            if (self.value.data) {
                self.metadata[self.value.data.id] = {
                    allowUnlink: self.uploadedFiles[self.value.data.id] || false,
                    url: self._getFileUrl(self.value.data),
                };
            }
        },
        /**
         * @private
         * @override
         */
        _render: function () {
            // render the attachments ; as the attachments will changes after each
            // _setValue, we put the rendering here to ensure they will be updated
            this._generatedMetadata();
            this.$('.oe_placeholder_files, .oe_attachments')
                .replaceWith($(qweb.render('O2MFieldBinaryFileUploader.files', {
                    widget: this,
                })));
            this.$('.oe_fileupload').show();

        },

        //--------------------------------------------------------------------------
        // Handlers
        //--------------------------------------------------------------------------

        /**
         * @private
         */
        _onAttach: function () {
            // This widget uses a hidden form to upload files. Clicking on 'Attach'
            // will simulate a click on the related input.
            this.$('.o_input_file').click();
        },
        /**
         * @private
         * @param {MouseEvent} ev
         */
        _onDelete: function (ev) {
            ev.preventDefault();
            ev.stopPropagation();

            var fileID = $(ev.currentTarget).data('id');
            var record = _.findWhere(this.value.data, {res_id: fileID});
            if (record) {
                this._setValue({
                    operation: 'FORGET',
                    ids: [record.id],
                });
                var metadata = this.metadata[record.id];
                if (!metadata || metadata.allowUnlink) {
                    this._rpc({
                        model: 'ir.attachment',
                        method: 'unlink',
                        args: [record.res_id],
                    });
                }
            }
        },
        /**
         * @private
         * @param {Event} ev
         */
        _onFileChanged: function (ev) {
            var self = this;
            ev.stopPropagation();

            var files = ev.target.files;
            if (files.length) {
                _.each(Object.keys(self.metadata), function (attach_id) {
                    self._rpc({model: 'ir.attachment', method: 'unlink', args: [parseInt(attach_id)],});
                    delete self.metadata[attach_id]
                });
            }
            self.uploadingFiles = files;
            this.$('form.o_form_binary_form').submit();
            this.$('.oe_fileupload').hide();
        },
        /**
         * @private
         */
        _onFileLoaded: function () {
            var self = this;
            // the first argument isn't a file but the jQuery.Event
            var files = Array.prototype.slice.call(arguments, 1);
            // files has been uploaded, clear uploading
            this.uploadingFiles = [];

            var attachment_ids = this.value.res_ids;
            _.each(files, function (file) {
                if (file.error) {
                    self.do_warn(_t('Uploading Error'), file.error);
                } else {
                    attachment_ids = file.id;
                    self.uploadedFiles[file.id] = true;
                }
            });
            self._setValue({id: attachment_ids});
        },
    });

    registry.add("one2many_uploads", One2ManyBinaryMultiFiles)
});