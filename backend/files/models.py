from django.db import models
import hashlib
import os
from datetime import datetime

class FileContent(models.Model):
    """
    Model that stores the actual content of files.
    This allows multiple file references to point to the same content.
    """
    hash = models.CharField(max_length=64, unique=True, db_index=True)
    data = models.BinaryField()
    size = models.PositiveIntegerField()
    reference_count = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return f"FileContent({self.hash[:10]}..., {self.size} bytes, {self.reference_count} refs)"

class File(models.Model):
    """
    Model representing file metadata with a reference to file content.
    """
    name = models.CharField(max_length=255, db_index=True)
    content = models.ForeignKey(FileContent, on_delete=models.CASCADE, related_name='files')
    content_type = models.CharField(max_length=100, db_index=True)
    upload_date = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-upload_date']
    
    def __str__(self):
        return self.name
    
    @property
    def size(self):
        return self.content.size
    
    @property
    def file_extension(self):
        _, ext = os.path.splitext(self.name)
        return ext.lower()[1:] if ext else ""

    @classmethod
    def compute_file_hash(cls, file):
        """Compute SHA-256 hash of a file"""
        hasher = hashlib.sha256()
        for chunk in file.chunks():
            hasher.update(chunk)
        return hasher.hexdigest()