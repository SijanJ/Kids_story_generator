from llama_cpp import Llama
import random
import  os, re, multiprocessing


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


model_directory = './model/'
model_name = "textgen.gguf"
llm = Llama(model_path=os.path.join(model_directory, model_name), 
            n_gpu_layers=-1,
            n_threads=multiprocessing.cpu_count(),
            n_ctx=2048,
            seed = -1,
            verbose=True,
            use_mmap=True,  # Uses memory mapping
            use_mlock=False,
            #stop=["The end."]
            )


def sanitize_filename(filename):
    sanitized = re.sub(r'[\\/*?:"<>|]', "", filename)
    sanitized = sanitized.replace(' ', '_')
    return sanitized

def generate_story(data):
    topic = data.get('topic', "").strip() or random.choice(children_story_topics)
    child_age = data.get('child_age', 2)
    word_count = data.get('word_count')
    language_name = data.get('language_name', 'English')
    user_main_character = data.get('main_character', "").strip()
    user_setting = data.get('setting', "").strip()
    prompt_user = data.get('user_prompt', "").strip()
    selected_moral_lessons = data.get('moral_lessons', [])

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

    if 0<= child_age <= 2:
        age_range = "0-2"
    elif 2 < child_age <= 5:
        age_range = "2-5"
    elif 5 < child_age <= 7:
        age_range = "5-7"
    else:
        age_range = "7-12"
    authors = age_groups_authors[age_range]
    selected_author = random.choice(authors)

    # Use the full language name for the story generation
    language = language_name

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
    prompt_user = ""

    prompt_initial = f"""    
        Develop a prompt that enables large language models to create engaging and age-appropriate stories for children in {language}.
        Generate an enhanced prompt with the following key points and do not ignore these: 
        - Generate an entire story with approximately {word_count} words for children aged {age_range} about {topic} with a playful tone and narrative writing style like {selected_author}. 
        - {prompt_user}
        - Start with a meaningful title: {title}
        - The main character is {story_main_character}. 
        - The story takes place {story_setting}.  
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

    sanitized_title = sanitize_filename(original_title)
    

    return {
        "success": True,
        "title": original_title,
        "sanitized_title": sanitized_title,
        "language": "ENGLISH",
        "text": TEXT,  
    }

story = generate_story({
    'topic': "king and a soldier",
    'child_age': 4,
    'word_count': 400,
    'moral_lessons': ["courage", "honesty"],
})
# generate_and_save_story_image(story['sanitized_title'], story['text'])
print(story)