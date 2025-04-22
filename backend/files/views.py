from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Sum, Count, F, Q
from django.db import transaction
from django.utils import timezone
import mimetypes
import json

from .models import File, FileContent
from .serializers import FileSerializer, FileUploadSerializer, StorageStatsSerializer

class FileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for file operations with deduplication support.
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        """
        Implements filtering by filename, file type, size range, and upload date.
        """
        queryset = File.objects.all()
        
        # Search by filename
        filename = self.request.query_params.get('name', None)
        if filename:
            queryset = queryset.filter(name__icontains=filename)
        
        # Filter by file type
        file_type = self.request.query_params.get('type', None)
        if file_type:
            # Filter by file extension
            queryset = queryset.filter(name__endswith=f'.{file_type}')
        
        # Filter by size range
        min_size = self.request.query_params.get('min_size', None)
        max_size = self.request.query_params.get('max_size', None)
        
        if min_size:
            queryset = queryset.filter(content__size__gte=int(min_size))
        if max_size:
            queryset = queryset.filter(content__size__lte=int(max_size))
        
        # Filter by upload date
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(upload_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(upload_date__lte=end_date)
            
        return queryset
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        """
        Handle file upload with deduplication.
        """
        try:
            serializer = FileUploadSerializer(data=request.data)
            if serializer.is_valid():
                uploaded_file = serializer.validated_data['file']
                
                # Determine content type
                content_type = uploaded_file.content_type
                if not content_type or content_type == 'application/octet-stream':
                    # Try to guess from file extension
                    content_type, _ = mimetypes.guess_type(uploaded_file.name)
                    content_type = content_type or 'application/octet-stream'
                    
                # Compute hash for deduplication
                file_hash = File.compute_file_hash(uploaded_file)
                
                # Reset file pointer after computing hash
                uploaded_file.seek(0)
                
                # Check if file content already exists
                with transaction.atomic():
                    file_content, created = FileContent.objects.get_or_create(
                        hash=file_hash,
                        defaults={
                            'data': uploaded_file.read(),
                            'size': uploaded_file.size
                        }
                    )
                    
                    # If file content exists, increment reference count
                    if not created:
                        file_content.reference_count += 1
                        file_content.save()
                        
                    # Create new file entry pointing to the content
                    file_obj = File.objects.create(
                        name=uploaded_file.name,
                        content=file_content,
                        content_type=content_type
                    )
                    
                    response_data = FileSerializer(file_obj).data
                    response_data['is_duplicate'] = not created
                    
                    return Response(response_data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log the exception details
            import traceback
            print(f"Error during file upload: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": f"Server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy to handle reference counting.
        """
        file_obj = self.get_object()
        file_content = file_obj.content
        
        with transaction.atomic():
            # Decrement reference count
            file_content.reference_count -= 1
            
            # If no more references, delete the content
            if file_content.reference_count <= 0:
                file_content.delete()
            else:
                file_content.save()
                
            # Delete the file metadata
            file_obj.delete()
            
        return Response(status=status.HTTP_204_NO_CONTENT)


class StorageStatsView(views.APIView):
    """
    API endpoint for storage statistics.
    """
    def get(self, request):
        total_files = File.objects.count()
        unique_files = FileContent.objects.count()
        
        # Calculate actual storage size (sum of unique file sizes)
        actual_storage = FileContent.objects.aggregate(total=Sum('size'))['total'] or 0
        
        # Calculate theoretical storage size (if no deduplication)
        theoretical_storage = File.objects.aggregate(
            total=Sum('content__size')
        )['total'] or 0
        
        storage_saved = theoretical_storage - actual_storage
        storage_saved_percent = (storage_saved / theoretical_storage * 100) if theoretical_storage > 0 else 0
        
        stats = {
            'total_files': total_files,
            'unique_files': unique_files,
            'total_size': theoretical_storage,
            'actual_storage_size': actual_storage,
            'storage_saved': storage_saved,
            'storage_saved_percent': storage_saved_percent
        }
        
        serializer = StorageStatsSerializer(stats)
        return Response(serializer.data)