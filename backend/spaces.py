import sys
import os

# Find the directory of this file to temporarily remove it from sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
paths_to_remove = [p for p in sys.path if os.path.abspath(p) == current_dir]

for p in paths_to_remove:
    sys.path.remove(p)

# Temporarily remove 'spaces' from sys.modules to prevent circular import cache hits
old_spaces_module = sys.modules.pop('spaces', None)

try:
    # Now Python will search and import the real system-wide spaces package
    import spaces as real_spaces
    # Verify the GPU decorator exists in the system package
    _ = real_spaces.GPU
    
    # Copy all public attributes from the system package to this local module
    for attr in dir(real_spaces):
        if not attr.startswith('__'):
            globals()[attr] = getattr(real_spaces, attr)
except (ImportError, AttributeError, NameError):
    # Fallback to dummy decorators for CPU/local environments
    def GPU(func):
        return func
finally:
    # Restore the sys.path
    for p in reversed(paths_to_remove):
        if p not in sys.path:
            sys.path.insert(0, p)
    # Restore our local module in sys.modules so app.py gets this wrapper
    if old_spaces_module:
        sys.modules['spaces'] = old_spaces_module
