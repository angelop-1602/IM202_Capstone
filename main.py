import csv

# Mapping of column headers to document types
doc_mapping = {
    "PR": "PRA FORM",
    "PR2": "PRA FORM",
    "IC": "ICA FORM",
    "IACUC": "PRA-EX FORM",
    "IACUC2": "PRA_EX FORM",
    "EX": "CFEFR FORM",
    "EX2": "CFEFR FOR",
}

# Input and output CSV file paths
input_csv = "csv1.csv"  # Replace with actual path
output_csv = "csv2.csv"

# Read from csv1 and transform the data
with open(input_csv, newline="", encoding="utf-8-sig") as infile, open(output_csv, mode="w", newline="", encoding="utf-8") as outfile:
    reader = csv.DictReader(infile, delimiter=",")  # Using comma as the delimiter
    writer = csv.writer(outfile)

    # Write the new headers
    writer.writerow(["Folder", "Reviewer", "Document", "Link"])

    # Print the headers for debugging
    print("Headers:", reader.fieldnames)

    for row in reader:
        # Strip spaces from all keys in the row
        row = {key.strip(): value for key, value in row.items()}
        
        # Print the row for debugging
        print("Row data:", row)

        folder = row.get("SPUP REC Code")  # Use get to avoid KeyError
        link = row.get("Folder  E Link")  # Ensure this matches the CSV header

        if folder is None:
            print("Folder key not found in row:", row)
            continue  # Skip this row if the key is not found

        for col, doc_type in doc_mapping.items():
            reviewer = row.get(col, "").strip()
            if reviewer:  # Only add if there's a reviewer name
                writer.writerow([folder, reviewer, doc_type, link])

print("CSV transformation complete. Data saved in", output_csv)
