{
    'name': 'News',
    'summary': 'News',
    'version': '1.0',
    'category': 'Web',
    'description': """
        News
    """,
    'author': "truongdung.vd@gmail.com",
    'depends': ['tv_web'],
    'data': [
        'views/news_view.xml',
        'views/video_view.xml',
        'views/news_category_view.xml',
        'views/res_config_view.xml',
        'views/ir_attachment_view.xml'
        # 'security/show_fields_security.xml',
        # 'security/ir.model.access.csv',
    ],
    'qweb': [
        # 'static/src/xml/base.xml',
    ],
    # 'images': ['images/main_screen.jpg'],
    # 'price': 250,
    # 'currency': 'EUR',
    'installable': True,
    'auto_install': False,
    'application': False,
    # 'images': [
    #     'static/description/module_image.png',
    # ],
}
