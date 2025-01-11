import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from . import app

logger = logging.getLogger(__name__)

@csrf_exempt
def generate_story(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            input_text = data.get('text', '')
            input_speech = data.get('speech', '')

            if not input_text and not input_speech:
                return JsonResponse({'error': 'No input provided'}, status=400)

            # Use the input to generate the story
            if input_speech:
                prompt = input_speech
            else:
                prompt = input_text

            title, story = app.generate_story(prompt)
            audio_url, total_time = app.text_to_speech(story)  # Get the audio file URL and duration

            response_data = {
                'title': title,
                'story': story,
                'audio_url': audio_url,
                'total_time': total_time,  # Total duration of the audio in seconds
            }

            return JsonResponse(response_data)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            logger.error(f"Error generating story: {e}")
            return JsonResponse({'error': 'Internal server error'}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=400)