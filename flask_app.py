from flask import Flask, request, jsonify, render_template, send_from_directory
import os, json
from datetime import datetime

app = Flask(__name__)

# ------------------------
# File paths
# ------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "backend")
DATA_FILE = os.path.join(DATA_DIR, "reflections.json")

# ------------------------
# JSON helpers
# ------------------------
def load_reflections():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_reflections(reflections):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(reflections, f, indent=4)

# ------------------------
# Page routes (Clean URLs + HTML fallback)

# ------------------------

@app.route("/tracker")
@app.route("/tracker.html")
def tracker():
    return render_template("tracker.html")


@app.route("/")
@app.route("/index.html")
def home():
    return render_template("index.html")

@app.route("/journal")
@app.route("/journal.html")
def journal():
    return render_template("journal.html")

@app.route("/about")
@app.route("/about.html")
def about():
    return render_template("about.html")

@app.route("/projects")
@app.route("/projects.html")
def projects():
    return render_template("projects.html")

@app.route("/project1")
@app.route("/project1.html")
def project1():
    return render_template("project1.html")

@app.route("/project2")
@app.route("/project2.html")
def project2():
    return render_template("project2.html")

@app.route("/project3")
@app.route("/project3.html")
def project3():
    return render_template("project3.html")

@app.route("/project4")
@app.route("/project4.html")
def project4():
    return render_template("project4.html")

# ------------------------
# Optional: serve manifest at root too (some checkers like this)
# ------------------------
@app.route("/manifest.json")
def manifest():
    return send_from_directory(os.path.join(app.root_path, "static"), "manifest.json")

# ------------------------
# API routes (Lab 6 kept same)
# ------------------------

# REQUIRED: GET reflections
@app.route("/reflections", methods=["GET"])
def get_reflections():
    return jsonify(load_reflections())

# REQUIRED: POST reflection
@app.route("/add_reflection", methods=["POST"])
def add_reflection():
    data = request.get_json(force=True)

    new_reflection = {
        "name": data.get("name", "").strip(),
        "reflection": data.get("reflection", "").strip(),
        "date": datetime.now().strftime("%a %b %d %Y")
    }

    if not new_reflection["name"] or len(new_reflection["reflection"]) < 10:
        return jsonify({
            "error": "Name required and reflection must be at least 10 characters."
        }), 400

    reflections = load_reflections()
    reflections.append(new_reflection)
    save_reflections(reflections)

    return jsonify(new_reflection), 201

# EXTRA FEATURE (delete reflection)
@app.route("/reflections/<int:index>", methods=["DELETE"])
def delete_reflection(index):
    reflections = load_reflections()

    if index < 0 or index >= len(reflections):
        return jsonify({"error": "Reflection not found"}), 404

    deleted = reflections.pop(index)
    save_reflections(reflections)

    return jsonify({"deleted": deleted}), 200
