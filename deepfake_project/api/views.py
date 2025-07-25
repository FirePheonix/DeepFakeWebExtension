from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
import os

# Load the model once (adjust path as needed)
model_path = os.path.join(os.path.dirname(__file__), 'efficientnetb2-deepfake.h5')
model = load_model(model_path)

class DeepfakeDetection(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        print('POST /api/detect/ called')

        # Accept either "file" or "video" field from frontend
        uploaded_file = request.FILES.get('file') or request.FILES.get('video')
        print('Uploaded file:', uploaded_file)

        if not uploaded_file:
            print('No file or video uploaded')
            return Response({'error': 'No file or video uploaded'}, status=400)

        try:
            # Open and process image
            image = Image.open(uploaded_file).convert('RGB')
            print('Image opened')
            image = image.resize((260, 260))  # ✅ EfficientNetB2 expects 260x260
            image = np.array(image)
            image = preprocess_input(image)  # ✅ Apply EfficientNet-specific preprocessing
            image = np.expand_dims(image, axis=0)
            print('Image processed')

            # Predict deepfake probability
            prediction = model.predict(image)[0][0]
            print('Prediction:', prediction)

            return Response({'fake_probability': float(prediction)})

        except Exception as e:
            print('Error:', str(e))
            return Response({'error': f'Error: {str(e)}'}, status=500)
