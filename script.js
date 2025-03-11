// Reviewer codes mapping
const reviewerCodes = [
    ["Dr. Allan Paulo L. Blaquera", "DRAPL-001"],
    ["Dr. Nova R. Domingo", "DRNRD-002"],
    ["Dr. Claudeth U. Gamiao", "DRCUG-003"],
    ["Dr. Mark Klimson L. Luyun", "DRMKL-004"],
    ["Mr. Wilfredo DJ P. Martin IV", "MRWDM-005"],
    ["Mr. Sergio G. Imperio", "MRSGI-006"],
    ["Dr. Marjorie L. Bambalan", "DRMLB-007"],
    ["Mrs. Elizabeth C. Iquin", "MRSEI-008"],
    ["Dr. Milrose Tangonan", "DRMT-009"],
    ["Engr. Verge C. Baccay", "ENGVCB-010"],
    ["Mr. Everett T. Laureta", "MRET-011"],
    ["Mrs. Maria Felina B. Agbayani", "MRMFBA-012"],
    ["Mrs. Rita B. Daliwag", "MRRBD-013"],
    ["Mrs. Lita Jose", "MRLJ-014"],
    ["Dr. Corazon Dela Cruz", "DRCDC-015"],
    ["Dr. Ester Yu", "DREY-016"],
    ["Mr. Angelo Peralta", "MRAP-017"],
    ["Dr. Janette Fermin", "DRJF-018"],
    ["Mr. Rogelio Fermin", "MRRF-019"],
    ["Mrs. Vivian Sorita", "MRSVS-020"],
    ["Dr. Benjamin Jularbal", "DRBJ-021"],
    ["Mrs. Kristine Joy O. Cortes", "MRSKC-022"],
    ["Mrs. Jean Sumait", "MRSJS-023"],
    ["Dr. Emman Earl Cacayurin", "DREEC-024"],
    ["Master Code", "SHOWALL"]
];

// Convert reviewerCodes to a Map for easier lookup
const reviewerMap = new Map(reviewerCodes.map(code => [code[1], code[0]]));

function loadCSV() {
    const release = document.getElementById('release-select').value; // Get selected release
    const level = document.getElementById('level-select').value; // Get selected level
    let csvFile;

    // Determine the CSV file based on the selected release
    if (release === 'first-release') {
        csvFile = 'first-release.csv';
    } else if (release === 'second-release') {
        csvFile = level === 'graduate' ? 'second-release-graduate.csv' : 'second-release-undergraduate.csv';
    } else if (release === 'third-release') {
        // Only load the graduate CSV for the third release
        if (level === 'graduate') {
            csvFile = 'third-release-graduate.csv';
        } else {
            // If undergraduate is selected, load the new CSV
            csvFile = 'third-release-undergraduate.csv';
        }
    }

    // Show level dropdown only for the second and third releases
    document.getElementById('level-select').style.display = (release === 'second-release' || release === 'third-release') ? 'block' : 'none';

    // Fetch the CSV file only if it is set
    if (csvFile) {
        fetch(csvFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                const rows = data.split('\n').slice(1); // Skip header
                const filteredData = rows.map(row => {
                    const columns = row.split(',');
                    return {
                        mainFolder: columns[0],
                        reviewer: columns[1],
                        document: columns[2],
                        folderLink: columns[3],
                        progress: columns[4] // Keep the progress column for reference
                    };
                });

                // Filter the data based on the reviewer code input
                const inputCode = document.getElementById('reviewer-code').value.trim();
                let sortedData;

                // Check if the input code is "SHOWALL"
                if (inputCode === "SHOWALL") {
                    sortedData = filteredData; // Show all data
                } else {
                    const reviewerName = reviewerMap.get(inputCode);
                    sortedData = reviewerName ? filteredData.filter(entry => entry.reviewer === reviewerName) : [];
                }

                // Display the filtered data as needed
                displayResults(sortedData);
            })
            .catch(error => console.error('Error loading CSV:', error));
    } else {
        // Handle case where no CSV file is set (e.g., show no data)
        displayResults([]);
    }
}

// Add event listeners to dropdowns
document.getElementById('release-select').addEventListener('change', loadCSV);
document.getElementById('level-select').addEventListener('change', loadCSV);

// Add event listener to the input field
document.getElementById('reviewer-code').addEventListener('input', loadCSV);

// Function to display results
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (data.length === 0) {
        resultsDiv.innerHTML = '<p class="no-data">No data available.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'results-table';
    const headerRow = table.insertRow();
    headerRow.innerHTML = '<th>Main Folder</th><th>Reviewer</th><th>Document</th><th>Folder Link</th><th>Progress</th>';

    data.forEach((item, index) => {
        const row = table.insertRow();
        
        // Create a unique key for localStorage using BOTH main folder and document
        // This ensures documents with the same name but in different folders are treated uniquely
        const storageKey = `${item.mainFolder}_${item.document}`;
        const safeStorageKey = storageKey.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Generate a completely unique ID for each checkbox
        const uniqueId = `checkbox_${index}_${safeStorageKey}`;
        
        // Check if this specific document+folder combination has been reviewed
        const isChecked = localStorage.getItem(safeStorageKey) === 'true';
        
        row.innerHTML = `
        <td>${item.mainFolder}</td>
        <td>${item.reviewer}</td>
        <td>${item.document}</td>
        <td><a href="${item.folderLink}" target="_blank">View Document</a></td>
        <td>
            <input type="checkbox" id="${uniqueId}" class="review-checkbox" data-key="${safeStorageKey}" ${isChecked ? 'checked' : ''}>
            <label for="${uniqueId}"></label> <!-- Add label for custom checkbox -->
        </td>
    `;
    });

    resultsDiv.appendChild(table);

    // Add event listeners to checkboxes after they're created
    document.querySelectorAll('.review-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Use the data-key attribute to store/retrieve from localStorage
            const storageKey = this.getAttribute('data-key');
            localStorage.setItem(storageKey, this.checked);
        });
    });
}

// Automatically load data on page load based on default selections
window.onload = loadCSV;

function openForm(url) {
    window.open(url, '_blank'); // Opens the form in a new tab
}