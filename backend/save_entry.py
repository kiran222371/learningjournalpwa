import json
from datetime import datetime
from pathlib import Path

DATA_FILE = Path(__file__).parent / "reflections.json"

def load_entries():
    if not DATA_FILE.exists():
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []

def save_entries(entries):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

def main():
    reflection = input("Type your reflection: ").strip()
    if not reflection:
        print("No reflection entered. Nothing saved.")
        return

    entry = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "text": reflection
    }

    entries = load_entries()
    entries.append(entry)
    save_entries(entries)

    print("Saved! Total reflections:", len(entries))

if __name__ == "__main__":
    main()
