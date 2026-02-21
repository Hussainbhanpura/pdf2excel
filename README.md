# PDF to Excel Converter

A Python application that extracts tables from PDF files and converts them to Excel format with high accuracy.

## Features

✅ Extract all tables from multi-page PDFs  
✅ Preserve table structure and data accuracy  
✅ Support for both bordered and borderless tables  
✅ Automatic detection of table layouts  
✅ Export each table to separate Excel sheets  

## Web UI (React + Flask)

### Prerequisites
- Python 3.x
- Node.js & npm

### Setup & Run

**1. Backend**
```bash
pip install -r requirements.txt
python app.py
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` to use the converter.

## CLI Usage (Legacy)

### Installation

### Prerequisites

This project uses **PdfPlumber**, which requires some system dependencies:

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

## Usage

### Interactive Mode

Simply run the script and follow the prompts:

```bash
python pdf_to_excel.py
```

### Command-Line Mode

```bash
# Basic usage (auto-generates output filename)
python pdf_to_excel.py input.pdf

# Specify output file
python pdf_to_excel.py input.pdf output.xlsx

## How It Works

1. **PDF Analysis**: PdfPlumber analyzes the PDF structure
2. **Table Detection**: Identifies tables
3. **Data Extraction**: Extracts table data while preserving structure
4. **Excel Export**: Creates an Excel file with all the data combined
5. **Validation**: Reports accuracy percentage for each extracted table

## Output Format

- All of the data is merged into a single sheet
- Sheet name: `ALL_Data`.
- Original table structure and formatting preserved
- Empty rows/columns automatically removed

## Example

```python
from pdf_to_excel import extract_tables_from_pdf

# Convert PDF to Excel
extract_tables_from_pdf('document.pdf', 'output.xlsx', flavor='lattice')
```

## Tips for Best Results

- Ensure your PDF is not scanned images (use OCR first if needed)
- High-quality PDFs produce better extraction results

## Troubleshooting

**No tables found?**
- Ensure the PDF contains actual tables (not images of tables)

**Poor accuracy?**
- Try the alternative extraction method
- Check if the PDF quality is sufficient
