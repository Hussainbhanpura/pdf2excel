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

This project uses **Camelot**, which requires some system dependencies:

**On Windows:**
- Install [Ghostscript](https://www.ghostscript.com/download/gsdnld.html)
  - Download and install the Windows installer
  - Add Ghostscript to your PATH

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

# Specify extraction method (lattice or stream)
python pdf_to_excel.py input.pdf output.xlsx lattice
```

### Extraction Methods

1. **lattice** (default) - Best for tables with clear borders
   - Uses table borders to identify cells
   - Higher accuracy for structured tables

2. **stream** - Best for tables without borders
   - Uses whitespace to identify columns
   - Better for simple, borderless tables

## How It Works

1. **PDF Analysis**: Camelot analyzes the PDF structure
2. **Table Detection**: Identifies tables using lattice or stream method
3. **Data Extraction**: Extracts table data while preserving structure
4. **Excel Export**: Creates an Excel file with separate sheets for each table
5. **Validation**: Reports accuracy percentage for each extracted table

## Output Format

- Each table is saved to a separate Excel sheet
- Sheet names: `Table_1_Page_1`, `Table_2_Page_2`, etc.
- Original table structure and formatting preserved
- Empty rows/columns automatically removed

## Example

```python
from pdf_to_excel import extract_tables_from_pdf

# Convert PDF to Excel
extract_tables_from_pdf('document.pdf', 'output.xlsx', flavor='lattice')
```

## Tips for Best Results

- Use **lattice** method for tables with visible borders
- Use **stream** method for tables without borders
- Ensure your PDF is not scanned images (use OCR first if needed)
- High-quality PDFs produce better extraction results

## Troubleshooting

**No tables found?**
- Try switching between 'lattice' and 'stream' methods
- Ensure the PDF contains actual tables (not images of tables)

**Ghostscript error?**
- Make sure Ghostscript is installed and in your PATH
- Restart your terminal after installing

**Poor accuracy?**
- Try the alternative extraction method
- Check if the PDF quality is sufficient
