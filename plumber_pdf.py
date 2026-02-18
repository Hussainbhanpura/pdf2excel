"""
PDF to Excel Converter using pdfplumber
Fully hardened version
Guarantees at least one visible sheet is written.
"""

import pdfplumber
import pandas as pd
import os
import sys


def pdf_to_excel_pdfplumber(pdf_path, output_excel_path=None):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    if output_excel_path is None:
        output_excel_path = pdf_path.replace('.pdf', '.xlsx').replace('.PDF', '.xlsx')

    print(f"📄 Reading PDF: {pdf_path}")

    all_tables = []

    # -------------------------
    # Extract tables from PDF
    # -------------------------
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()

            for table_num, table in enumerate(tables, start=1):
                if table and any(any(cell for cell in row) for row in table):
                    df = pd.DataFrame(table)
                    all_tables.append((page_num, table_num, df))
                    print(f"   📊 Found table on page {page_num}, table {table_num}: {len(df)} rows")

    # -------------------------
    # Write to Excel
    # -------------------------
    any_sheet_written = False

    with pd.ExcelWriter(output_excel_path, engine="openpyxl") as writer:

        if not all_tables:
            print("⚠️ No tables found. Creating placeholder sheet.")
            pd.DataFrame(
                {"Info": ["No extractable tables found in PDF"]}
            ).to_excel(writer, sheet_name="NoData", index=False)
            any_sheet_written = True

        else:
            for i, (page_num, table_num, df) in enumerate(all_tables):

                original_df = df.copy()

                # -------------------------
                # Clean table safely
                # -------------------------
                df = df.replace('', pd.NA)
                df = df.dropna(how='all', axis=0)
                df = df.dropna(how='all', axis=1)
                df = df.fillna('')

                if df.empty or df.shape[1] == 0:
                    print(f"   ⚠️ Table {i+1} empty after cleaning – using placeholder.")
                    df = pd.DataFrame({"Info": ["No structured data in this table"]})

                # -------------------------
                # Detect header row safely
                # -------------------------
                if len(df) > 0 and df.shape[1] > 0:
                    first_row = df.iloc[0]

                    header_like = first_row.apply(
                        lambda x: isinstance(x, str) and
                        not str(x).replace('.', '').replace(',', '').replace('-', '').isdigit()
                    ).any()

                    if header_like:
                        new_columns = []
                        for idx, col in enumerate(first_row):
                            if col and str(col).strip():
                                new_columns.append(str(col))
                            else:
                                new_columns.append(f"Column_{idx}")

                        df.columns = new_columns
                        df = df[1:].reset_index(drop=True)

                        if df.empty:
                            df = original_df

                # -------------------------
                # Safe numeric conversion
                # -------------------------
                for col in df.columns:
                    try:
                        df[col] = pd.to_numeric(df[col])
                    except Exception:
                        pass

                # -------------------------
                # Final safety check
                # -------------------------
                if df.empty or df.shape[1] == 0:
                    df = pd.DataFrame({"Info": ["Table contained no usable data"]})

                # Excel sheet name (max 31 chars)
                sheet_name = f"Page{page_num}_T{table_num}"
                if len(sheet_name) > 31:
                    sheet_name = f"T{i+1}"

                df.to_excel(writer, sheet_name=sheet_name, index=False)
                any_sheet_written = True

                print(f"   ✅ Exported: {sheet_name} ({df.shape[0]} rows)")

        # Absolute final fallback
        if not any_sheet_written:
            pd.DataFrame(
                {"Message": ["No data could be written from PDF"]}
            ).to_excel(writer, sheet_name="Placeholder", index=False)

    print(f"\n✅ Excel file created: {output_excel_path}")
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
