"""
PDF to Excel Converter using pdfplumber
Post-process Excel using NumPy to remove commas from numeric values
"""

import pdfplumber
import pandas as pd
import numpy as np
import os
import sys


def pdf_to_excel_pdfplumber(pdf_path, output_excel_path=None):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    if output_excel_path is None:
        output_excel_path = pdf_path.replace(".pdf", ".xlsx").replace(".PDF", ".xlsx")

    print(f"📄 Reading PDF: {pdf_path}")

    all_tables = []

    # -------------------------
    # Extract tables
    # -------------------------
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()

            for table_num, table in enumerate(tables, start=1):
                if table:
                    df = pd.DataFrame(table)
                    if len(df) > 0:
                        df.columns = df.iloc[0]
                        df = df[1:].reset_index(drop=True)
                        
                    all_tables.append((page_num, table_num, df))
                    print(f"   📊 Found table on page {page_num}, table {table_num}")

    # -------------------------
    # Write raw Excel first
    # -------------------------
    with pd.ExcelWriter(output_excel_path, engine="openpyxl") as writer:
        if not all_tables:
            pd.DataFrame({"Info": ["No tables found"]}).to_excel(
                writer, sheet_name="NoData", index=False
            )
        else:   
            for i, (page_num, table_num, df) in enumerate(all_tables):
                sheet_name = f"Page{page_num}_T{table_num}"
                if len(sheet_name) > 31:
                    sheet_name = f"T{i+1}"

                df.to_excel(writer, sheet_name=sheet_name, index=False)

    print("✅ Raw Excel created. Now cleaning with NumPy...")

    # -------------------------
    # Re-open Excel and clean using NumPy
    # -------------------------
    xls = pd.ExcelFile(output_excel_path)
    cleaned_writer = pd.ExcelWriter(
        output_excel_path.replace(".xlsx", "_cleaned.xlsx"),
        engine="openpyxl"
    )

    for sheet in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet)

        # Convert to NumPy array
        arr = df.to_numpy(dtype=object)

        # Remove commas from numeric-like strings
        for i in range(arr.shape[0]):
            for j in range(arr.shape[1]):
                val = arr[i, j]

                if isinstance(val, str):
                    new_val = val.replace(",", "").strip()

                    # If it becomes numeric after removing commas
                    if new_val.replace(".", "", 1).isdigit():
                        arr[i, j] = float(new_val)
                    else:
                        arr[i, j] = new_val

        cleaned_df = pd.DataFrame(arr, columns=df.columns)
        cleaned_df.to_excel(cleaned_writer, sheet_name=sheet, index=False)

    cleaned_writer.close()

    print(f"🎉 Cleaned Excel created: {output_excel_path.replace('.xlsx', '_cleaned.xlsx')}")
    return output_excel_path.replace(".xlsx", "_cleaned.xlsx")


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