"""
PDF to Excel Converter
Converts tables from PDF files to Excel format using Camelot library
"""

import camelot
import pandas as pd
import numpy as np
import os
import sys
from pathlib import Path


def extract_tables_from_pdf(pdf_path, output_excel_path=None, flavor='lattice'):
    """
    Extract tables from a PDF file and save them to an Excel file.
    
    Args:
        pdf_path (str): Path to the input PDF file
        output_excel_path (str, optional): Path for the output Excel file. 
                                          If None, will use the same name as PDF with .xlsx extension
        flavor (str): Extraction method - 'lattice' for tables with borders, 
                     'stream' for tables without borders. Default is 'lattice'
    
    Returns:
        str: Path to the created Excel file
    """
    
    # Validate input file
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    if not pdf_path.lower().endswith('.pdf'):
        raise ValueError("Input file must be a PDF file")
    
    # Generate output path if not provided
    if output_excel_path is None:
        output_excel_path = pdf_path.replace('.pdf', '.xlsx').replace('.PDF', '.xlsx')
    
    print(f"📄 Reading PDF file: {pdf_path}")
    print(f"🔍 Using extraction method: {flavor}")
    
    try:
        # Extract tables from PDF
        # Try lattice first (works better for tables with clear borders)
        tables = camelot.read_pdf(pdf_path, pages='all', flavor=flavor)
        
        if len(tables) == 0:
            # If no tables found with lattice, try stream method
            if flavor == 'lattice':
                print("⚠️  No tables found with 'lattice' method, trying 'stream' method...")
                tables = camelot.read_pdf(pdf_path, pages='all', flavor='stream')
        
        if len(tables) == 0:
            print("❌ No tables found in the PDF file")
            return None
        
        print(f"✅ Found {len(tables)} table(s) in the PDF")
        
        # Create Excel writer object
        with pd.ExcelWriter(output_excel_path, engine='openpyxl') as writer:
            for i, table in enumerate(tables):
                # Convert table to DataFrame
                df = table.df
                
                
                
                # Convert numeric columns from text to numbers BEFORE cleaning
                # This ensures we don't lose data during the cleaning process
                for col in df.columns:
                    # Clean the column data first - strip whitespace and handle formatting
                    df[col] = df[col].astype(str).str.strip()
                    # Remove common formatting: commas, spaces (but preserve decimal points)
                    df[col] = df[col].str.replace(',', '', regex=False)
                    df[col] = df[col].str.replace(' ', '', regex=False)
                    
                    # Only convert columns where ALL non-empty values are numeric
                    # This prevents mixed columns from being converted incorrectly
                    non_empty = df[col].replace('', pd.NA).replace('nan', pd.NA).dropna()
                    if len(non_empty) > 0:
                        # Try converting - if it works for all values, keep it
                        try:
                            converted = pd.to_numeric(non_empty, errors='raise')
                            df[col] = pd.to_numeric(df[col], errors='coerce')
                        except (ValueError, TypeError):
                            # Keep as text if conversion fails
                            pass
                
                # Clean up the dataframe
                # Remove completely empty rows and columns
                df = df.dropna(how='all', axis=0)  # Remove empty rows
                df = df.dropna(how='all', axis=1)  # Remove empty columns
                
                # Skip if dataframe is empty after cleaning
                if df.empty:
                    print(f"   ⚠️  Table {i+1} is empty after cleaning, skipping...")
                    continue
                
                # Create sheet name
                sheet_name = f"Table_{i+1}_Page_{table.page}"
                
                # Ensure sheet name is valid (max 31 chars for Excel)
                if len(sheet_name) > 31:
                    sheet_name = f"Table_{i+1}"
                
                
                # Write to Excel
                df.to_excel(writer, sheet_name=sheet_name, index=False, header=False)
                
                # Get the worksheet to apply number formatting
                worksheet = writer.sheets[sheet_name]
                
                # Apply number formatting to cells with numeric values
                # This ensures Excel treats them as numbers, not text
                for row_idx, row in enumerate(df.values, start=1):
                    for col_idx, value in enumerate(row, start=1):
                        cell = worksheet.cell(row=row_idx, column=col_idx)
                        
                        # Try to convert to number - be aggressive about it
                        if pd.notna(value) and value != '':
                            # If already numeric, use it
                            if isinstance(value, (int, float, np.integer, np.floating)):
                                cell.value = float(value) if isinstance(value, (float, np.floating)) else int(value)
                                if isinstance(value, (float, np.floating)) and value % 1 != 0:
                                    cell.number_format = '0.00'
                                else:
                                    cell.number_format = '0'
                            # If string, try to convert it
                            elif isinstance(value, str):
                                try:
                                    # Try to parse as number
                                    num_value = float(value)
                                    cell.value = num_value
                                    # Set format based on whether it has decimals
                                    if num_value % 1 != 0:
                                        cell.number_format = '0.00'
                                    else:
                                        cell.number_format = '0'
                                except (ValueError, TypeError):
                                    # Keep as text if not a number
                                    pass
                
                print(f"   📊 Table {i+1} from page {table.page} -> Sheet: {sheet_name}")
                print(f"      Shape: {df.shape[0]} rows × {df.shape[1]} columns")
                print(f"      Accuracy: {table.accuracy:.2f}%")
        
        print(f"\n✅ Successfully created Excel file: {output_excel_path}")
        return output_excel_path
        
    except Exception as e:
        print(f"❌ Error during conversion: {str(e)}")
        raise


def main():
    """Main function to handle command-line usage"""
    
    print("=" * 60)
    print("PDF to Excel Converter")
    print("=" * 60)
    print()
    
    # Check command-line arguments
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        output_path = sys.argv[2] if len(sys.argv) > 2 else None
        flavor = sys.argv[3] if len(sys.argv) > 3 else 'lattice'
    else:
        # Interactive mode
        pdf_path = input("Enter the path to your PDF file: ").strip().strip('"')
        
        if not pdf_path:
            print("No file path provided. Exiting.")
            return
        
        output_path = input("Enter output Excel file path (press Enter for auto-generated name): ").strip().strip('"')
        if not output_path:
            output_path = None
        
        print("\nExtraction methods:")
        print("  1. lattice - Best for tables with clear borders (default)")
        print("  2. stream - Best for tables without borders")
        flavor_choice = input("Choose method (1/2, default=1): ").strip()
        flavor = 'stream' if flavor_choice == '2' else 'lattice'
    
    try:
        # Force stdout to use verify encoding if possible, or just don't use emojis
        if sys.stdout.encoding != 'utf-8':
            sys.stdout.reconfigure(encoding='utf-8')
            
        result = extract_tables_from_pdf(pdf_path, output_path, flavor)
        
        if result:
            print("\n" + "=" * 60)
            print("Conversion completed successfully!")
            print("=" * 60)
        else:
            print("\n" + "=" * 60)
            print("No tables were extracted")
            print("=" * 60)
            
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"Conversion failed: {str(e)}")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    # Fix for Windows console encoding
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    main()
