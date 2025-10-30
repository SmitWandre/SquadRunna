from django.apps import AppConfig

class AuthappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.authapp'

    def ready(self):
        import app.authapp.signals  # noqa
