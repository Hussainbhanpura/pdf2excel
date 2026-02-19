from flask import Flask, request, send_file, jsonify
import io
from flask_cors import CORS
import os
import werkzeug
from dotenv import load_dotenv
from plumber_pdf import pdf_to_excel_pdfplumber  # ✅ UPDATED IMPORT

load_dotenv()  # Load variables from .env

app = Flask(__name__)

# Enable CORS — origins loaded from FRONTEND_URL in .env
frontend_url = os.getenv('FRONTEND_URL', '*')

if frontend_url == '*':
    allowed_origins = ['*']
else:
    allowed_origins = [u.strip() for u in frontend_url.split(',')]

CORS(app, resources={r"/*": {"origins": allowed_origins}},
     expose_headers=["Content-Disposition"])

UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
OUTPUT_FOLDER = os.getenv('OUTPUT_FOLDER', 'outputs')

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
            output_filename = filename.rsplit('.', 1)[0] + '.xlsx'
            output_path = os.path.join(OUTPUT_FOLDER, output_filename)

            # ✅ Call plumber conversion function
            result_path = pdf_to_excel_pdfplumber(
                filepath,
                output_excel_path=output_path
            )

            if result_path and os.path.exists(result_path):
                # Read Excel into memory so Windows releases the file lock
                with open(result_path, 'rb') as f:
                    excel_bytes = io.BytesIO(f.read())
                excel_bytes.seek(0)

                # Delete both files now that data is in memory
                try:
                    os.remove(filepath)
                    print(f"🗑️ Deleted PDF: {filepath}")
                except Exception as e:
                    print(f"⚠️ Could not delete PDF: {e}")
                try:
                    os.remove(result_path)
                    print(f"🗑️ Deleted Excel: {result_path}")
                except Exception as e:
                    print(f"⚠️ Could not delete Excel: {e}")

                return send_file(
                    excel_bytes,
                    as_attachment=True,
                    download_name=output_filename,
                    mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
            else:
                return jsonify({'error': 'Conversion failed'}), 500

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file type. Only PDF allowed.'}), 400


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port)
