from pydub import AudioSegment
from openai import OpenAI
# from transformers import GPT2Tokenizer, GPT2LMHeadModel

import re
import torch
from llama_cpp import Llama
import random
import multiprocessing
import json
import os
# from googletrans import Translator
from gtts import gTTS
from deep_translator import GoogleTranslator

from .bingart import BingArt
from django.conf import settings
MEDIA_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'media')
os.makedirs(MEDIA_ROOT, exist_ok=True)
current_dir = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(current_dir, 'model', 'textgen.gguf')

llm = Llama(model_path=model_path, 
            n_gpu_layers=-1,
            n_threads=multiprocessing.cpu_count(),
            n_ctx=2048,
            seed = -1,
            verbose=True,
            use_mmap=True,  # Uses memory mapping
            use_mlock=False,
            #stop=["The end."]
            )

children_story_topics = [
    "Wizards and Elephants", "Adventures in Magical Forest", "Talking Tree", "Brave Little Dragon",
    "Secret Garden", "Lost Treasure of Pirate Island", "Enchanted Castle", "Friendly Ghost",
    "Time-Traveling Kids", "Underwater Kingdom", "Flying Unicorn", "Mysterious Cave",
    "Little Robot's Big Adventure", "Animal Orchestra", "Magic Paintbrush",
    "Adventures of Space Explorer", "Fairy and Giant", "Secret of Old Lighthouse",
    "Jungle Expedition", "Snowy Mountain Rescue", "Little Mermaid's Wish",
    "Haunted House Mystery", "Adventures of Tiny Dinosaur", "Magic School Bus",
    "Lost City of Atlantis", "Friendly Alien", "Magical Bookstore", "Adventures of Superhero Kid",
    "Secret World of Insects", "Little Witch's Potion"
]

topic = "wizards and elephants" # FIX

LANGUAGE_CODES = {
    'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de', 'Italian': 'it',
    'Portuguese': 'pt', 'Polish': 'pl', 'Turkish': 'tr', 'Russian': 'ru', 'Dutch': 'nl',
    'Czech': 'cs', 'Arabic': 'ar', 'Chinese': 'zh-cn', 'Japanese': 'ja', 'Hungarian': 'hu',
    'Korean': 'ko'
}

word_count = ["150", "450", "750", "1500", "2250", "3000", "4500"] 

main_character = [
    "Susheel", "Pratik", "Sneha", "Priyanka", "Yujal", "Ram", "Sita", "Lakshman",
    "Aarav", "Aasha", "Abhishek", "Anjali", "Arjun", "Bishnu", "Devi", "Dipak",
    "Gita", "Hari", "Ishaan", "Jyoti", "Kiran", "Krishna", "Lakshmi", "Maya",
    "Nisha", "Om", "Parvati", "Priya", "Rajesh", "Sarita", "Shiva", "Sita",
    "Surya", "Uma", "Vishnu", "Yogesh", "Zara", "Prakash", "Binita", "Deepika"
]
setting = [ "in the forest", 
            "on an island", 
            "on the moon", 
            "in a medieval village", 
            "under the sea", 
            "in a magical kingdom",
            "in a jungle", 
            "in a spaceship", 
            "in a circus", 
            "in a pirate ship", 
            "in a futuristic city", 
            "in a candy land",
            "in a magical treehouse village",
            "at a rainbow playground",
            "in a floating cloud castle",
            "on a friendly dragon's back",
            "in a butterfly garden",
            "at a talking animal school",
            "in a candy house made of sweets",
            "on a flying carpet above the city",
            "in a magical library with living books",
            "at a musical fountain park",
            "in a giant's vegetable garden",
            "on a magical train that changes colors",
            "in a crystal cave full of glowing stones",
            "at a carnival run by friendly monsters",
            "in a bamboo forest with pandas",
            "on a floating island with waterfalls"
           ]

age = 2 

age_groups_authors = {
    "0-2": ["Eric Carle", "Sandra Boynton", "Margaret Wise Brown", "Karen Katz", "Leslie Patricelli"],
    "2-5": ["Dr. Seuss", "Julia Donaldson", "Beatrix Potter", "Maurice Sendak", "Eric Carle"],
    "5-7": ["Roald Dahl", "Mo Willems", "Dav Pilkey", "E.B. White", "Beverly Cleary"],
    "7-12": ["J.K. Rowling", "Rick Riordan", "Jeff Kinney", "Roald Dahl", "C.S. Lewis"]
}

moral = ["friendship", "diversity", "empathy", "respect", "courage", "honesty", "teamwork", 
         "kindness", "integrity"]
# storyTopic: "", // New field for story topic
#     storyText: "",
#     storyLength: "short",
#     storySettings: "",
#     language: "en",
#     age: "all",
#     imageStyle: "Storybook style",

def translate_text_googletrans(text, source_language="en", target_language="ne"):
    result = GoogleTranslator(source=source_language, target=target_language).translate(text)
    return result

def generate_story(data):
    topic = data.get('storyTopic', "").strip() or random.choice(children_story_topics)
    age_range = data.get('age', 0)
    story_length = data.get('storyLength', 'short')
    user_main_character = data.get('main_character', "").strip()
    user_setting = data.get('storySettings', "").strip()
    prompt_user = data.get('storyText', "").strip()
    selected_moral_lessons = data.get('moral_lessons', [])
    translation = data.get('language', 'en')

    if story_length == "short":
        word_count = 150
    elif story_length == "medium":
        word_count = 300
    elif story_length == "long":
        word_count = 500
    # Use user's input for main character if provided, otherwise randomly select from the list
    story_main_character = user_main_character if user_main_character else random.choice(main_character)

    # Use user's input for setting if provided, otherwise randomly select from the list
    story_setting = user_setting if user_setting else random.choice(setting)
    
    format_control = """
    The story must be written in proper paragraphs with complete sentences.
    Avoid rhyming patterns or verse formats unless specifically requested.
    Each paragraph should contain 2-4 sentences that flow naturally.
    Use appropriate dialogue when characters speak.
    """

    # Determine the age range and authors based on child_age

    age_ranges = ["0-2", "2-5", "5-7", "7-12"]
    if age_range == "all":
        age_range = random.choice(age_ranges)
    authors = age_groups_authors[age_range]
    selected_author = random.choice(authors)

    # Use the full language name for the story generation
    language = "English" 

    # Generate a title
    title_prompt = f"Generate a title for a story about {topic} in {language} with a maximum of 6 words and no special characters or asterisks."
    title_output = llm.create_chat_completion(
        messages=[
            {"role": "system", "content": "You are a title generation assistant."},
            {"role": "user", "content": title_prompt}
        ]
    )
    
    title = title_output["choices"][0]['message']['content'].strip()
    
    # Validate title: remove special characters and limit to 6 words
    title = re.sub(r'[^\w\s]', '', title)  # Remove special characters
    title_words = title.split()
    
    if len(title_words) > 6:
        title = ' '.join(title_words[:6])  # Limit to first 6 words

    # Create the moral lessons part of the prompt only if lessons were selected
    moral_lessons_prompt = ""
    if selected_moral_lessons:
        moral_lessons_string = ", ".join(selected_moral_lessons)
        moral_lessons_prompt = f"The story should incorporate moral lesson(s) about the importance of {moral_lessons_string}."
                                                                   
    # Set initial prompt
    # prompt_user = ""

    prompt_initial = f"""    
        Develop a prompt that enables large language models to create engaging and age-appropriate stories for children in {language}.
        Generate an enhanced prompt with the following key points and do not ignore these: 
        - Generate an entire story with approximately {word_count} words for children aged {age_range} about {topic} with a playful tone and narrative writing style like {selected_author}. 
        - Start with a meaningful title: {title}
        - The main character is {story_main_character}. 
        - The story takes place {story_setting}.  
        - The story text may contain the following text {prompt_user}
        - The story should be set in a world that is both familiar and unknown to the child reader. 
        - The story should incorporate a moral lesson about the importance of {moral_lessons_prompt}.
        -  {format_control}
        - End the story with the saying: "The end!"
        """

    # Prompt generation
    output = llm.create_chat_completion(
        messages=[
            {"role": "system", "content": """
             You are an assistant specialized in creating prompts for large language models. 
             Your focus is on generating prompts that helps large language models craft stories specifically for children.
             Your task is to generate prompts exclusively. Do not write stories and do not ask questions.
             """},
            {"role": "user", "content": prompt_initial}
        ],
        temperature=0.8, 
        top_p=0.90,
        top_k=40,
        min_p=0.05,
        typical_p=1.0,
        repeat_penalty=1.0
    )

    prompt = output["choices"][0]['message']['content']

    # Story generation
    output_1 = llm.create_chat_completion(
        messages=[
            {"role": "system", "content": f"""
             You are a creative story writing assistant dedicated to crafting appropriate stories for children in {language}. 
             Your goal is to write narratives with surprising twists and happy endings.
             Easy to follow and understand, with a clear beginning, middle, and end.  
             Use only child-appropriate sources, and ensure the content is gender-neutral, inclusive, and ethically sound. 
             Adhere to ethical guidelines and avoid perpetuating harmful biases.
             Ensure that all produced stories exclude content related to hate, self-harm, sexual themes, and violence.
             Only generate the story, nothing else and always begin with a title for the story. 
             Start directly with the title without using special characters and do not write something like this: "Here is a 200-word story for children aged 2-5 with a playful tone:"
             """},
            {"role": "user", "content": prompt}
        ],
        #top_p=0.95,
        #top_k=100,
        #min_p=0.05,
        #typical_p=1.0,
        #repeat_penalty=1.1
    )
    story = output_1["choices"][0]['message']['content']

    # Extract title and text
    lines = story.split('\n', 1)
    original_title = lines[0].strip()  
    text = lines[1].strip() if len(lines) > 1 else ""

    global TITLE, TEXT
    TITLE = original_title
    TEXT = text

    # sanitized_title = sanitize_filename(original_title)
    if translation == "en":
        return (original_title, text)
    
    else:
        translated_title = translate_text_googletrans(original_title, source_language="en", target_language="ne")
        translated_text = translate_text_googletrans(text, source_language="en", target_language="ne")
        return (translated_title, translated_text)

#OpenAI use garney bela matra

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
#         api_path = os.path.join(current_dir, 'data', 'api_token.txt')
#         api_key = open(api_path, "r").read().strip()
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

def text_to_speech(text, voice="nova"):
    """
    Convert text to speech with background music and proper timing control.
    """
    if not text:
        print("No text to convert to speech")
        return None, 0

    # Intro and outro text with consistent timing
    intro = ("<break time='3s'/> Twinkle twinkle little stars <break time='1s'/> "
         "It's your StoryPal, back with another special story. <break time='1s'/> "
         "Get cozy under your blanket <break time='1s'/> "
         "as we journey into a world of imagination <break time='5s'/>")

    outro = ("<break time='6s'/> Stars are twinkling, "
            "saying goodnight <break time='1s'/> "
            "This is your StoryPal, <break time='1s'/> "
            "watching over your dreams until next time <break time='5s'/>")

    # Function to add pauses after sentences in main text
    def add_timing_to_main_text(text):
        # Add breaks after punctuation marks
        text = text.replace(". ", ". <break time='0.8s'/> ")
        text = text.replace("! ", "! <break time='1s'/> ")
        text = text.replace("? ", "? <break time='1s'/> ")
        text = text.replace("... ", "... <break time='1.2s'/> ")
        return text

    # Combine all parts with timing
    full_text = f"{intro}{add_timing_to_main_text(text)}{outro}"

    try:
        # Initialize OpenAI client with API key
        api_path = os.path.join(current_dir, 'data', 'api_token.txt')
        api_key = open(api_path, "r").read().strip()
        client = OpenAI(api_key=api_key)
        
        # Generate the narration audio
        response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=full_text
        )
        
        #os.makedirs(output_dir, exist_ok=True)
        narration_file = "narration.mp3"
        narration_path = os.path.join(settings.MEDIA_ROOT, narration_file)
        with open(narration_path, 'wb') as file:
            for chunk in response.iter_bytes():
                file.write(chunk)

        narration = AudioSegment.from_file(narration_path)
        bg_music_path = os.path.join(settings.MEDIA_ROOT, "background_music.mp3")
        background_music = AudioSegment.from_mp3(bg_music_path)

        # Lower background music volume (reduce by 25dB)
        background_music = background_music - 25

        # Add 8 seconds of silence at the start of narration
        intro_silence = AudioSegment.silent(duration=5000)  # 5 seconds of silence
        ontro_silence = AudioSegment.silent(duration=8000) # 8 seconds of silence
        narration = intro_silence + narration + ontro_silence

        # Loop background music if shorter, trim if longer
        while len(background_music) < len(narration):
                background_music += background_music
        background_music = background_music[:len(narration) + 16000]  # Add extra 16s for fade in/out

        # Gradual fade-down after 8 seconds
        fade_down_start = 5000  # Start fading down after 5 seconds
        fade_down_duration = len(narration) - 5000  # Fade duration spans until narration ends
        background_music = background_music.fade(to_gain=-35, start=fade_down_start, duration=fade_down_duration)

        # Gradual volume restoration and fade-out after narration ends
        fade_up_start = len(narration) -len(ontro_silence) # Start restoring volume after narration ends
        fade_up_duration = 3000  # Restore volume over 8 seconds
        fade_out_duration = 5000  # Fade out completely over 5 seconds
        background_music = background_music.fade(to_gain=0, start=fade_up_start, duration=fade_up_duration)
        background_music = background_music.fade_out(duration=fade_out_duration)

        # Overlay narration and background music
        final_audio = narration.overlay(background_music)

        # Export the final mixed audio
        # final_path = os.path.join(output_dir, "final_output.mp3")
        final_audio_file = "final_output.mp3"
        final_path = os.path.join(settings.MEDIA_ROOT, final_audio_file)
        final_audio.export(final_path, format="mp3")

        # Return the final audio file path and its duration
        duration_seconds = len(final_audio) / 1000

        audio_url = settings.MEDIA_URL + final_audio_file

        return audio_url, duration_seconds

    except Exception as e:
        print(f"Error in text_to_speech_with_bg_music: {str(e)}")
        return None, 0
    

 # api key halna man lagena vane yo function use garum   
# def text_to_speech(text, target_language="en"):
#     if not text:
#         print("No text to convert to speech.")
#         return None, 0

#     # Generate the audio file
#     tts = gTTS(text=text, lang=target_language)
#     audio_file = "output.mp3"
#     audio_path = os.path.join(MEDIA_ROOT, audio_file)
#     tts.save(audio_path)

#     # Calculate the duration of the audio file
#     audio = AudioSegment.from_file(audio_path)
#     duration_seconds = len(audio) / 1000  # Convert milliseconds to seconds

#     # Return the URL and duration
#     audio_url = os.path.join(settings.MEDIA_URL, audio_file)
#     return audio_url, duration_seconds


def generate_story_image(story, image_style):
    try:
        authentication_path = os.path.join(current_dir, 'data', 'authentication_token.txt')
        auth_cookie_U = open(authentication_path, "r").read().strip()
        bing_art = BingArt(auth_cookie_U=auth_cookie_U)
        
        # Create diverse prompts from the story
        prompts = [
            f"{image_style}: {story[:100]}",
            f"{image_style}: {story[100:200]}",
            # f"Watercolor painting style: {story[200:300]}",
            # f"Cute cartoon style: {story[300:400]}",
            # f"Fantasy art style: {story[400:500]}"
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