{
    'name': 'Web',
    'summary': 'Web',
    'version': '1.0',
    'category': 'Web',
    'description': """
        Web
    """,
    'author': "truongdung.vd@gmail.com",
    'depends': ['web'],
    'data': [
        'views/templates.xml',
    ],
    'qweb': [
        'static/src/xml/base.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
}
