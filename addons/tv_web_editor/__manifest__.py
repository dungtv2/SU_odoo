{
    'name': 'Web Editor',
    'summary': 'Web Editor',
    'version': '1.0',
    'category': 'Web',
    'description': """
        Web Editor
    """,
    'author': "truongdung.vd@gmail.com",
    'depends': ['web_editor'],
    'data': [
        'views/templates.xml',
        # 'security/ir.model.access.csv',
    ],
    'qweb': [
        'static/src/xml/editor.xml',
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
