from rest_framework import serializers
from .models import File, FileContent

class FileSerializer(serializers.ModelSerializer):
    size = serializers.IntegerField(read_only=True)
    file_extension = serializers.CharField(read_only=True)
    content_type = serializers.CharField(read_only=True)
    is_duplicate = serializers.BooleanField(read_only=True, required=False)
    
    class Meta:
        model = File
        fields = ['id', 'name', 'content_type', 'upload_date', 'size', 'file_extension', 'is_duplicate']
        read_only_fields = ['id', 'upload_date', 'content_type', 'size', 'file_extension']

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    
    def validate_file(self, value):
        if value.size > 100 * 1024 * 1024:  # 100MB limit
            raise serializers.ValidationError("File size cannot exceed 100MB")
        return value

class StorageStatsSerializer(serializers.Serializer):
    total_files = serializers.IntegerField()
    unique_files = serializers.IntegerField()
    total_size = serializers.IntegerField()
    actual_storage_size = serializers.IntegerField()
    storage_saved = serializers.IntegerField()
    storage_saved_percent = serializers.FloatField()