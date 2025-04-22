from django.contrib import admin
from .models import File, FileContent

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'content_type', 'size', 'upload_date')
    list_filter = ('content_type', 'upload_date')
    search_fields = ('name',)
    readonly_fields = ('content', 'upload_date', 'size')

@admin.register(FileContent)
class FileContentAdmin(admin.ModelAdmin):
    list_display = ('hash', 'size', 'reference_count')
    readonly_fields = ('hash', 'data', 'size')
    search_fields = ('hash',)