import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from . import app
from concurrent.futures import ThreadPoolExecutor, as_completed
import asyncio

logger = logging.getLogger(__name__)

@csrf_exempt
def generate_story(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            input_text = data.get('text', '')
            
            if not input_text:
                return JsonResponse({'error': 'No input provided'}, status=400)
            image_style = data.get('imageStyle', 'Storybook style')
            
            title, story = app.generate_story(data)

            # Create result containers
            audio_result = {'url': None, 'time': 0}
            image_results = []

            def generate_audio():
                try:
                    audio_url, total_time = app.text_to_speech(story)
                    audio_result['url'] = audio_url
                    audio_result['time'] = total_time
                except Exception as e:
                    logger.error(f"Error in audio generation: {e}")

            def generate_images():
                try:
                    # Get image results
                    image_urls = app.generate_story_image(story, image_style)
                    
                    # Process each image result
                    for result in image_urls:
                        if 'images' in result and result['images']:
                            image_data = {
                                'url': result['images'][0]['url'],
                                'prompt': result['prompt']
                            }
                            image_results.append(image_data)
                except Exception as e:
                    logger.error(f"Error in image generation: {e}")
                    # Ensure we always have 5 image slots even if generation fails
                    while len(image_results) < 5:
                        image_results.append({'url': None, 'prompt': None})

            # Run audio and image generation concurrently
            with ThreadPoolExecutor(max_workers=2) as executor:
                futures = [
                    executor.submit(generate_audio),
                    executor.submit(generate_images)
                ]
                
                # Wait for all tasks to complete
                for future in as_completed(futures):
                    try:
                        future.result()
                    except Exception as e:
                        logger.error(f"Error in concurrent execution: {e}")

            # Ensure we have exactly 5 image results
            while len(image_results) < 5:
                image_results.append({'url': None, 'prompt': None})
            image_results = image_results[:5]  # Limit to 5 images if we somehow got more

            response_data = {
                'title': title,
                'story': story,
                'audio_url': audio_result['url'],
                'total_time': audio_result['time'],
                'images': image_results
            }
            
            return JsonResponse(response_data)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            logger.error(f"Error generating story: {e}")
            return JsonResponse({'error': f'Internal server error: {str(e)}'}, status=500)
            
    return JsonResponse({'error': 'Invalid request method'}, status=400)