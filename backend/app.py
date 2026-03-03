import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import fitz  # PyMuPDF
import docx
import io

load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase configuration
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_ANON_KEY", "")
supabase: Client = create_client(url, key)

import re

def parse_questions(content):
    print(f"--- DEBUG: Starting Parse on content length {len(content)} ---")
    
    # Normalize line endings and remove extra spaces
    content = content.replace('\r\n', '\n')
    
    # Split by "Q:" as it's a very clear question marker in your PDF
    chunks = re.split(r'Q:\s*', content)
    
    questions = []
    
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk or len(chunk) < 10: continue
        
        # 1. Extract Correct Answer if it exists in this chunk
        # Pattern: Correct: [A-D]
        ans_match = re.search(r'Correct:\s*([A-D])', chunk, re.I)
        correct_val = 0
        if ans_match:
            correct_val = ord(ans_match.group(1).upper()) - 65
            # Remove the answer part from the chunk so it doesn't mess with option extraction
            chunk = chunk[:ans_match.start()]

        # 2. Extract Options (They are smashed together like A: TextB: Text)
        # We look for A: B: C: D: or A. B. C. D.
        # This regex split looks for the option marker and captures the text following it
        parts = re.split(r'\s*([A-D][:|\.])\s*', chunk)
        
        if len(parts) >= 3:
            q_text = parts[0].strip()
            # Clean up the question text (sometimes has title leftovers)
            q_text = q_text.split('------------------')[-1].strip()
            
            options = []
            # parts[1] is 'A:', parts[2] is text, parts[3] is 'B:', etc.
            for i in range(2, len(parts), 2):
                opt_content = parts[i].strip()
                # If there are leftovers like "Correct: C" or next Q, clean it
                opt_content = re.split(r'Correct:|Q:', opt_content, flags=re.I)[0].strip()
                options.append(opt_content)
            
            if q_text and len(options) >= 2:
                questions.append({
                    "text": q_text,
                    "options": options[:4],
                    "correct": correct_val,
                    "status": "not-visited"
                })

    print(f"--- DEBUG: Successfully parsed {len(questions)} questions ---")
    if len(questions) > 0:
        print(f"--- DEBUG: First Question Sample: {questions[0]['text'][:50]}... Options: {len(questions[0]['options'])}")
        
    return questions

@app.route('/api/upload', methods=['POST'])
def upload_test():
    if 'file' not in request.files:
        print("DEBUG: No file in request")
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    filename = file.filename.lower()
    print(f"DEBUG: Receiving file {filename}")
    
    content = ""
    
    try:
        if filename.endswith('.pdf'):
            pdf_data = file.read()
            doc = fitz.open(stream=pdf_data, filetype="pdf")
            for page in doc:
                content += page.get_text()
        elif filename.endswith('.docx'):
            doc = docx.Document(io.BytesIO(file.read()))
            for para in doc.paragraphs:
                content += para.text + "\n"
        else:
            content = file.read().decode('utf-8')
    except Exception as e:
        print(f"DEBUG: Extraction Error: {str(e)}")
        return jsonify({"error": f"Failed to extract text: {str(e)}"}), 500
    
    questions = parse_questions(content)
    
    if not questions:
        print("DEBUG: Failed to parse any questions")
        return jsonify({"error": "No questions could be parsed. Content was extracted but format didn't match. Please check server logs."}), 400
    
    try:
        print(f"DEBUG: Attempting to save {len(questions)} questions to Supabase...")
        
        # Clear old questions - using a safer filter for identity columns
        try:
            supabase.table('questions').delete().neq('id', -1).execute()
            print("DEBUG: Table cleared.")
        except Exception as d_e:
            print(f"DEBUG: Delete Warning (ok if table is new): {str(d_e)}")

        # Insert new data
        resp = supabase.table('questions').insert(questions).execute()
        print(f"DEBUG: Success! Inserted {len(resp.data)} rows.")
        
        return jsonify({
            "status": "success",
            "message": f"Successfully uploaded {len(questions)} questions from {filename}"
        }), 200
    except Exception as e:
        err_msg = str(e)
        print(f"DEBUG: SUPABASE DB ERROR: {err_msg}")
        return jsonify({
            "status": "error",
            "error": err_msg,
            "suggestion": "Verify your Supabase table 'questions' exists with columns: text(text), options(jsonb), correct(int), status(text)."
        }), 500

@app.route('/api/test', methods=['GET'])
def get_test():
    # Fetch questions from Supabase
    try:
        response = supabase.table('questions').select("*").execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/submit', methods=['POST'])
def submit_results():
    data = request.json
    try:
        response = supabase.table('results').insert(data).execute()
        return jsonify({"message": "Result saved", "id": response.data[0]['id']}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
