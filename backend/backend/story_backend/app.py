from pydub import AudioSegment
from openai import OpenAI
from transformers import GPT2Tokenizer, GPT2LMHeadModel
from string import punctuation # to format the story later ...
import re
import torch
import json
import os
import sys
from .bingart import BingArt
from django.conf import settings
MEDIA_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'media')
os.makedirs(MEDIA_ROOT, exist_ok=True)
current_dir = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(current_dir, 'gpt2_model')
model2 = GPT2LMHeadModel.from_pretrained(model_path)
tokenizer = GPT2Tokenizer.from_pretrained(model_path)


if torch.cuda.is_available():
    device_name = torch.device("cuda")
else:
    device_name = torch.device("cpu")
print(f"Using {device_name}")
device = device_name


# def text_to_speech(text, voice="nova"):
#     """
#     Convert text to speech using OpenAI's API with proper streaming
    
#     Args:
#         text (str): The text to convert to speech
#         voice (str): The voice to use (alloy, echo, fable, onyx, nova, or shimmer)
    
#     Returns:
#         tuple: (audio_url, duration_seconds)
#     """
#     if not text:
#         print("No text to convert to speech.")
#         return None, 0

#     try:
#         # Initialize OpenAI client with API key directly
#         # api_key = open("data/api_token.txt", "r").read().strip()
#         # print("API key: " + api_key)
#         # print( type(api_key))
#         client = OpenAI(api_key=api_key)  # Replace with your actual API key
        
#         # Generate the audio file using OpenAI's API
#         response = client.audio.speech.create(
#             model="tts-1",  # or "tts-1-hd" for higher quality
#             voice=voice,
#             input=text
#         )
        
#         # Ensure media directory exists
#         os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
        
#         # Save the audio file
#         audio_file = "output.mp3"
#         audio_path = os.path.join(settings.MEDIA_ROOT, audio_file)
        
#         # Stream and save the response using the correct method
#         with open(audio_path, 'wb') as file:
#             for chunk in response.iter_bytes():
#                 file.write(chunk)
        
#         # Calculate the duration of the audio file
#         audio = AudioSegment.from_file(audio_path)
#         duration_seconds = len(audio) / 1000  # Convert milliseconds to seconds
        
#         # Construct the URL using Django's MEDIA_URL setting
#         audio_url = settings.MEDIA_URL + audio_file
        
#         return audio_url, duration_seconds
        
#     except Exception as e:
#         print(f"Error in text_to_speech: {str(e)}")
#         return None, 0
    

 # api key halna man lagena vane yo function use garum   
def text_to_speech(text, target_language="en"):
    if not text:
        print("No text to convert to speech.")
        return None, 0

    # Generate the audio file
    tts = gTTS(text=text, lang=target_language)
    audio_file = "output.mp3"
    audio_path = os.path.join(MEDIA_ROOT, audio_file)
    tts.save(audio_path)

    # Calculate the duration of the audio file
    audio = AudioSegment.from_file(audio_path)
    duration_seconds = len(audio) / 1000  # Convert milliseconds to seconds

    # Return the URL and duration
    audio_url = os.path.join(settings.MEDIA_URL, audio_file)
    return audio_url, duration_seconds


def generate_story(prompt):
    stop_token = None
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token  # Set pad_token to eos_token if not already set

    # Encode the prompt into tokenized inputs
    inputs = tokenizer.encode(prompt, return_tensors="pt", padding=True, truncation=True).to(device)
    attention_mask = inputs != tokenizer.pad_token_id

    # Generate the story
    outputs = model2.generate(
        inputs,
        attention_mask=attention_mask,
        do_sample=True,  # Enables sampling for creative outputs
        min_length=100,  # Ensures minimum story length
        max_length=500,  # Limits story length
        top_p=0.9,  # Nucleus sampling for coherent outputs
        temperature=0.7,  # Controls randomness (lower = more deterministic)
        repetition_penalty=1.2,  # Reduces repetitive phrases
        pad_token_id=tokenizer.pad_token_id,
        eos_token_id=tokenizer.eos_token_id,  # Stops when an End-of-Story token is generated
    )

    # Decode the output tokens into text
    completed_story = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Post-process to clean up trailing or redundant text
    completed_story = completed_story.strip()
    if stop_token and stop_token in completed_story:
        completed_story = completed_story.split(stop_token)[0].strip()

    title = "The proncess and Frog"
    return (title, completed_story)

def generate_story_image(story):
    try:
        bing_art = BingArt(auth_cookie_U='1bDW7Inh3p_mssSEXyb3FEAkS7Xv1SuUg6fUmScOU-wsY14AkmDC3rBgZ69Wq6BKM4S435ajBslX8QgY8ooce_T2zGkHVTOPN6l1JSQVX_PxSae4T58pQDbWJUQhNft8Fupp0F2K6bvQXigLPEbl3YZ8GO2QLfrXFSNdneDOUfm62qAgmkAZIDtweBfEfvh-gmDtfnlsIPkUGD5DQgNsiotg2NHsN5pzU-lkUHQnKUA0')
        
        # Create diverse prompts from the story
        prompts = [
            f"Children's storybook illustration style: {story[:100]}",
            f"Magical fairytale style: {story[100:200]}",
            f"Watercolor painting style: {story[200:300]}",
            f"Cute cartoon style: {story[300:400]}",
            f"Fantasy art style: {story[400:500]}"
        ]
        
        # Generate images
        results = bing_art.generate_multiple_images(prompts)
        
        # Process results
        processed_results = []
        for result in results:
            if 'images' in result and result['images']:
                processed_results.append({
                    'prompt': result['prompt'],
                    'images': result['images']
                })
        
        return processed_results
        
    except Exception as e:
        logger.error(f"Error in generate_story_image: {e}")
        return []
    finally:
        if 'bing_art' in locals():
            bing_art.close_session()


if __name__ == "__main__":
    text_to_speech("Hello thee!")