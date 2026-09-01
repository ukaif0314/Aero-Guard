import glob
import re

print("Scanning TSX files for potential Tailwind 4 parsing triggers...")
for path in glob.glob("frontend/src/**/*.tsx", recursive=True):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    
    # Check for [ ... ] arbitrary classes
    brackets = re.findall(r'\[([^\]]+)\]', text)
    for b in brackets:
        if any(c in b for c in ['>', '<', '&', '+', '~', '*', '/', '(', ')', '%']):
            print(f"  {path}: [{b}]")
