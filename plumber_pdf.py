import pdfplumber
import pandas as pd
import numpy as np
import os
import sys

def pdf_to_excel_pdfplumber(pdf_path, output_excel_path=None):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    if output_excel_path is None:
        output_excel_path = pdf_path.replace(".pdf", "_merged.xlsx").replace(".PDF", "_merged.xlsx")

    print(f"📄 Reading PDF: {pdf_path}")

    all_dfs = []

    # -------------------------
    # 1. Extract and Collect Tables
    # -------------------------
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()

            for table_num, table in enumerate(tables, start=1):
                if table:
                    df = pd.DataFrame(table)
                    
                    # Basic Header Cleaning (Assumes first row is header)
                    if len(df) > 1:
                        df.columns = df.iloc[0]
                        df = df[1:].reset_index(drop=True)
                    
                    all_dfs.append(df)
                    print(f"📊 Found table on page {page_num}, table {table_num}")

    # -------------------------
    # 2. Merge and Clean
    # -------------------------
    if not all_dfs:
        print("⚠️ No tables found.")
        return

    print("🔗 Merging all tables into a single DataFrame...")
    
    # Merge all DataFrames into one large DataFrame
    merged_df = pd.concat(all_dfs, ignore_index=True)

    print("✅ Merged. Now cleaning with NumPy...")

    # -------------------------
    # 3. Apply NumPy Cleaning Logic
    # -------------------------
    # Convert entire DataFrame to NumPy array of objects
    arr = merged_df.to_numpy(dtype=object)

    # Loop through the array to clean commas
    for i in range(arr.shape[0]):
        for j in range(arr.shape[1]):
            val = arr[i, j]

            if isinstance(val, str):
                # Remove commas from string
                new_val = val.replace(",", "").strip()

                # If it looks like a number, convert to float
                # Basic check: remove one decimal point, then check if digits
                if new_val.replace(".", "", 1).isdigit():
                    arr[i, j] = float(new_val)
                else:
                    arr[i, j] = new_val

    # Convert back to DataFrame
    cleaned_df = pd.DataFrame(arr, columns=merged_df.columns)

    # -------------------------
    # 4. Save to Single Excel Sheet
    # -------------------------
    with pd.ExcelWriter(output_excel_path, engine="openpyxl") as writer:
        cleaned_df.to_excel(writer, sheet_name="All_Data", index=False)

    print(f"🎉 Single-sheet Excel created: {output_excel_path}")
    return output_excel_path

# -------------------------
# CLI Execution
# -------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        out_path = sys.argv[2] if len(sys.argv) > 2 else None
    else:
        pdf_path = input("PDF path: ").strip().strip('"')
        out_path = input("Output Excel (Enter for auto): ").strip().strip('"') or None

    try:
        pdf_to_excel_pdfplumber(pdf_path, out_path)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)