import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import GPT2Tokenizer, GPT2LMHeadModel
import re
import numpy as np
import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
from playsound import playsound
from time import sleep
import os
import json
import pygame
import threading

os.environ['PYTHONIOENCODING'] = 'utf-8'

if torch.cuda.is_available():
    device_name = torch.device("cuda")
else:
    device_name = torch.device("cpu")
print(f"Using {device_name}")
device = device_name

with open('../../vocabulary.json') as f:
    VOCABULARY = json.load(f)
vocab_size = len(VOCABULARY)
end_of_sentence = '.'

model2 = GPT2LMHeadModel.from_pretrained("../../gpt2_model")
tokenizer = GPT2Tokenizer.from_pretrained("../../gpt2_model")
# model2 = GPT2LMHeadModel.from_pretrained("gpt2")
# tokenizer = GPT2Tokenizer.from_pretrained("gpt2")

# Word to tensor encodings ...

# Translate word to an index from vocabulary
def word_to_index(word):
    if (word != end_of_sentence):
        word = clean_title(word)
    return VOCABULARY[word]

# Translate word to 1-hot tensor
def word_to_tensor(word):
    tensor = torch.zeros(1, 1, vocab_size)
    tensor[0][0][word_to_index(word)] = 1
    return tensor

# Turn a title into a <title_length x 1 x vocab_size>,
# or an array of one-hot vectors
def title_to_tensor(title):
    title_words = clean_title(title).split(' ')
    tensor = torch.zeros(len(title_words) + 1, 1, vocab_size)
    for index in range(len(title_words)):
        tensor[index][0][word_to_index(title_words[index])] = 1

    tensor[len(title_words)][0][VOCABULARY[end_of_sentence]] = 1
    return tensor

# Turn a sequence of words from title into tensor <sequence_length x 1 x vocab_size>
def sequence_to_tensor(sequence):
    tensor = torch.zeros(len(sequence), 1, vocab_size)
    for index in range(len(sequence)):
        tensor[index][0][word_to_index(sequence[index])] = 1
    return tensor

class LSTM_model(nn.Module):
    '''
    Simple LSTM model to generate bedtime story titles.
    Arguments:
        - input_size - should be equal to the vocabulary size
        - output_size - should be equal to the vocabulary size
        - hidden_size - hyperparameter, size of the hidden state of LSTM.
    '''
    def __init__(self, input_size, hidden_size, output_size):
        super(LSTM_model, self).__init__()

        self.hidden_size = hidden_size

        self.lstm = nn.LSTM(input_size, hidden_size)
        self.linear = nn.Linear(hidden_size, output_size)
        self.softmax = nn.LogSoftmax(dim=1)

    def forward(self, input, hidden):
        output, hidden = self.lstm(input.view(1, 1, -1), hidden)

        output = self.linear(output[-1].view(1, -1))

        output = self.softmax(output)
        return output, hidden

    # the initialization of the hidden state
    # using cuda speeds up the computation
    def initHidden(self, device):
        return (torch.zeros(1, 1, num_hidden).to(device), torch.zeros(1, 1, num_hidden).to(device))

num_hidden = 128  # hyperparameter
state_dict = torch.load("../../data/trained_lstm_title_model.pth", map_location=device, weights_only=True)
rnn = LSTM_model(vocab_size, num_hidden, vocab_size)
rnn.load_state_dict(state_dict)
rnn = rnn.to(device)

def clean_title(title):
    '''
    Removes punctuation, lowercases and numbers from titles
    '''
    # upper- to lowercase
    title = str(title).lower()

    # remove numbers
    title = re.sub(r"[0123456789]+\ *", " ", title)

    # remove punctuation
    title = re.sub(r"[,.&$%<>@#?-_*/\()~='+;!:`]+\ *", " ", title)
    title = re.sub("''", ' ', title)
    title = re.sub('-', ' ', title)

    # remove duplicated spaces
    title = re.sub(' +', ' ', title)

    return title.strip()

# Generates title given the first word
def generate_title(first_word):

    max_num_words = 5 # in a title
    sentence = [first_word]

    # Initialize input step and hidden state
    input_tensor = word_to_tensor(first_word)
    hidden = (torch.zeros(1, 1, num_hidden).to(device), torch.zeros(1, 1, num_hidden).to(device))
    output_word = None
    i = 1

    # Generate title
    while output_word != '.' and i < max_num_words:
        input_tensor = input_tensor.to(device)
        output, next_hidden = rnn(input_tensor[0], hidden)
        final_output = output.clone().to(device)

        # Use the probabilities from the output to choose the next word
        probabilities = final_output.softmax(dim=1).detach().cpu().numpy().ravel()
        word_index = np.random.choice(range(vocab_size), p = probabilities)

        output_word = [key for (key, value) in VOCABULARY.items() if value == word_index][0]
        sentence.append(output_word)

        # update
        input_tensor = word_to_tensor(output_word)
        hidden = next_hidden
        i += 1

    if sentence[-1] != ".": sentence.append(".")

    return sentence

# def complete_prompt(prompt, min_length=100, max_length=500, top_p=0.8, temperature=1.0):
#     inputs = tokenizer.encode(prompt, return_tensors="pt", padding=True, truncation=True)
#     attention_mask = inputs != tokenizer.pad_token_id
#     outputs = model2.generate(
#         inputs,
#         do_sample=True,
#         min_length=min_length,
#         max_length=max_length,
#         top_p=top_p,
#         temperature=temperature,
#         pad_token_id=tokenizer.eos_token_id
#     )
#     completed_story = tokenizer.decode(outputs[0], skip_special_tokens=True)
#     return completed_story

def complete_prompt(prompt, min_length=100, max_length=500, top_p=0.8, temperature=1.0):
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token  # Set pad_token to eos_token

    inputs = tokenizer.encode(prompt, return_tensors="pt", padding=True, truncation=True)
    attention_mask = inputs != tokenizer.pad_token_id

    outputs = model2.generate(
        inputs,
        attention_mask=attention_mask,
        do_sample=True,
        min_length=min_length,
        max_length=max_length,
        top_p=top_p,
        temperature=temperature,
        pad_token_id=tokenizer.pad_token_id
    )
    completed_story = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return completed_story

non_info_words = list(open("../../non_info_words.txt", "r", encoding='utf-8').read())


def typewriter_effect(words, speed):
    for char in words:
        sleep(speed)
        print(char, end='', flush=True)

from string import punctuation # to format the story later ...

def generate_story(prompt):
    completed_story = complete_prompt(prompt)
    r = re.compile(r'[{}]+'.format(re.escape(punctuation)))
    story_just_words = r.sub('', completed_story)
    story_just_words = story_just_words.lower().split(" ")
    word_occurences = {}
    # get the words that occur the most often in the dictionary
    for word in  story_just_words:
        if not (word in non_info_words):
            if word not in word_occurences:
                word_occurences[word] = 1
            else:
                word_occurences[word] += 1

    # sorting the dictionary from least to most occurences
    word_occurences = {k: v for k, v in sorted(word_occurences.items(), key=lambda item: item[1])}

    # Get the words from most to least occurrences
    story_vocab = list(word_occurences.keys())[::-1]

    i = 0
    first_word = story_vocab[i]
    while first_word not in VOCABULARY:
        i += 1
        if i == len(story_vocab):
          first_word = "the"
          break
        first_word = story_vocab[i]

    # The first word in the title will be the word that occurs the most often in the story
    # get generated title and include it to the final title
    final_title = generate_title(first_word)
    final_title = ' '.join(final_title).upper()
    final_title += "\n"

    # return the completed title and the story
    #typewriter_effect(final_title, 0.1)
    #typewriter_effect(completed_story, 0.1)
    #print(completed_story)
    return (final_title, completed_story)

def play_audio(file):
    pygame.mixer.init()
    pygame.mixer.music.load(file)
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)

def capture_speech():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Please tell the beginning of your bedtime story and we will help you write the rest:...")
        try:
            # Listen to the speech
            audio = recognizer.listen(source, timeout=10)
            print("Recognizing...")
            text = recognizer.recognize_google(audio)
            print(f"Recognized Text: {text}")
            return text
        except sr.UnknownValueError:
            print("Sorry, I could not understand the audio.")
            return None
        except sr.RequestError as e:
            print(f"Error with the recognition service: {e}")
            return None

def translate_text(text, target_language="ne"):
    if text is None:
        print("No text to translate.")
        return None
    translator = Translator()
    translation = translator.translate(text, dest=target_language)
    translated_text = translation.text
    print(f"Translated Text: {translated_text}")
    return translated_text

def text_to_speech(text, target_language="en"):
    if text is None:
        print("No text to convert to speech.")
        return
    tts = gTTS(text=text, lang=target_language)
    audio_file = "output.mp3"
    tts.save(audio_file)
    print("Playing the audio...")
    # display(Audio(audio_file, autoplay=True))
    # os.play(audio_file)
    # playsound(audio_file)
    audio_thread = threading.Thread(target=play_audio, args=("output.mp3",), daemon=True)
    audio_thread.start()


if __name__ == "__main__":
    print("------------ HELLO! I am your personal bedtime story assitant ------------\n")
    print("--------------------------------------------------------------------------\n")
    #prompt = capture_speech()
    prompt = "Once upon a time there lived a king"
    print("--------------------------------------------------------------------------\n")
    typewriter_effect("COMPLETING STORY", 0.05)
    typewriter_effect("... ...  ...        ... ...  ...\n", 0.05)

    print("--------------------------------------------------------------------------\n")
    print("--------------------------------------------------------------------------\n")
    typewriter_effect("GENERATING TITLE", 0.05)
    typewriter_effect("... ...  ...        ... ...  ...\n", 0.05)
    story = generate_story(prompt)
    '''story = ("The Hare and the Tortoise", """There was once a hare who was friends with a tortoise. One day, he challenged 
        the tortoise to a race. Seeing how slow the tortoise was going, the hare thought he’d win this easily. So, he took 
        a nap while the tortoise kept on going. When the hare woke, he saw that the tortoise was already at the finish line.
         Much to his chagrin, the tortoise won the race while he was busy sleeping.""") '''
    typewriter_effect(story[0], 0.1)
    typewriter_effect("NARRATING", 0.1)
    typewriter_effect("... ...  ...        ... ...  ...\n", 0.05)
    text_to_speech(story[1])
    typewriter_effect(story[1], 0.08)