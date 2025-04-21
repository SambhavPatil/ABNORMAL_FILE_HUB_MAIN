from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import File
from .serializers import FileSerializer
import hashlib
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = {
        'file_type': ['exact'],
        'size': ['gte', 'lte'],
        'uploaded_at': ['gte', 'lte'],
    }
    search_fields = ['original_filename']

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Compute SHA256 hash of the file content
        hasher = hashlib.sha256()
        for chunk in file_obj.chunks():
            hasher.update(chunk)
        file_hash = hasher.hexdigest()

        # Check if file with this hash already exists
        try:
            existing_file = File.objects.get(hash=file_hash)
            # Set attributes on instance for serializer methods
            existing_file.duplicate = True
            existing_file.storage_saved = existing_file.size
            serializer = self.get_serializer(existing_file)
            data = serializer.data
            data['message'] = "File already exists."
            return Response(data, status=status.HTTP_200_OK)
        except File.DoesNotExist:
            pass

        data = {
            'file': file_obj,
            'original_filename': file_obj.name,
            'file_type': file_obj.content_type,
            'size': file_obj.size,
            'hash': file_hash,
        }

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
