import sys
import os

# Find the directory of this file to temporarily remove it from sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
paths_to_remove = [p for p in sys.path if os.path.abspath(p) == current_dir]

for p in paths_to_remove:
    sys.path.remove(p)

try:
    # Attempt to import the real Hugging Face spaces package
    from spaces import *
    # Access GPU to verify it exists in the imported module
    _ = GPU
except (ImportError, AttributeError, NameError):
    # Fallback to dummy decorators for CPU/local environments
    def GPU(func):
        return func
finally:
    # Restore the sys.path
    for p in reversed(paths_to_remove):
        if p not in sys.path:
            sys.path.insert(0, p)
