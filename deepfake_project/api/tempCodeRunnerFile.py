from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
import os

# Load model once
model_path = os.path.join(os.path.dirname(__file__), 'efficientnetb2-deepfake.h5')
model = load_model(model_path)

class DeepfakeDetection(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        # Accept both 'file' and 'video' keys for uploaded files
        uploaded_file = request.FILES.get('file') or request.FILES.get('video')
        if not uploaded_file:
            return Response({'error': 'No file or video uploaded'}, status=400)

        try:
            image = Image.open(uploaded_file).convert('RGB')
            image = image.resize((224, 224))
            image = np.array(image) / 255.0
