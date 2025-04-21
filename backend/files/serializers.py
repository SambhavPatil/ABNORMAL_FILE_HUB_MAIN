from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    duplicate = serializers.SerializerMethodField()
    storage_saved = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'file', 'original_filename', 'file_type', 'size', 'uploaded_at', 'hash', 'duplicate', 'storage_saved']
        read_only_fields = ['id', 'uploaded_at', 'hash', 'duplicate', 'storage_saved']

    def get_duplicate(self, obj):
        # Return duplicate attribute if set, else False
        return getattr(obj, 'duplicate', False)

    def get_storage_saved(self, obj):
        # Return storage_saved attribute if set, else 0
        return getattr(obj, 'storage_saved', 0)
