import os

# Make a directory to save models
if not os.path.exists(' model/'): 
      os.mkdir('model/')

# Download a quantized Llama 3.1
if not os.path.exists(' model/textgen.gguf'):
      os.system('curl -L -o  model/textgen.gguf https://huggingface.co/lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf?download=true')