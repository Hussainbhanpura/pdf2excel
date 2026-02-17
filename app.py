from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
import werkzeug
from pdf_to_excel import extract_tables_from_pdf
import tempfile
import shutil

app = Flask(__name__)
# Enable CORS for all routes, but allow configuring origins via env var
frontend_url = os.environ.get('FRONTEND_URL', '*')
CORS(app, resources={r"/*": {"origins": frontend_url}})

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/api/convert', methods=['POST'])
def convert_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.lower().endswith('.pdf'):
        filename = werkzeug.utils.secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            # Generate output path
            output_filename = filename.replace('.pdf', '.xlsx').replace('.PDF', '.xlsx')
            output_path = os.path.join(OUTPUT_FOLDER, output_filename)
            
            # Run conversion
            # reusing the logic from pdf_to_excel.py
            # We might need to adjust extract_tables_from_pdf to accept output path explicitly if it doesn't already return it clearly or if we want to force it to a specific loc.
            # Looking at previous view_file of pdf_to_excel.py:
            # def extract_tables_from_pdf(pdf_path, output_excel_path=None, flavor='lattice'):
            
            result_path = extract_tables_from_pdf(filepath, output_excel_path=output_path)
            
            if result_path and os.path.exists(result_path):
                return send_file(result_path, as_attachment=True, download_name=output_filename)
            else:
                return jsonify({'error': 'Conversion failed or produced no output'}), 500
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            # Cleanup upload? Maybe keep for debug for now, or clean up.
            # user didn't specify, but good practice to clean up eventually. 
            # For now, let's keep it simple.
            pass
            
    return jsonify({'error': 'Invalid file type. Only PDF allowed.'}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
