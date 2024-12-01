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
    ["Master Code", "SHOWALL_@first_release"]
];

// Convert reviewerCodes to a Map for easier lookup
const reviewerMap = new Map(reviewerCodes.map(code => [code[1], code[0]]));

// Fetch the CSV data
fetch('first-release.csv')
    .then(response => response.text())
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

        // Function to save the reviewed state in local storage
        function saveReviewedState(entryId, isChecked) {
            const reviewedStates = JSON.parse(localStorage.getItem('reviewedStates')) || {};
            reviewedStates[entryId] = isChecked;
            localStorage.setItem('reviewedStates', JSON.stringify(reviewedStates));
        }

        // Function to load the reviewed state from local storage
        function loadReviewedState(entryId) {
            const reviewedStates = JSON.parse(localStorage.getItem('reviewedStates')) || {};
            return reviewedStates[entryId] || false; // Default to false if not found
        }

        // Add event listener to the input field
        document.getElementById('reviewer-code').addEventListener('input', function() {
            const inputCode = this.value.trim();
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = ''; // Clear previous results

            // If the input is empty, do not show the table
            if (inputCode === '') {
                return; // Exit the function if the input is empty
            }

            // Create a new table for displaying results
            const resultsTable = document.createElement('table');
            resultsTable.className = 'results-table';
            resultsTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Reviewed</th>
                        <th>Proponent Code</th>
                        <th>Reviewer Name</th>
                        <th>Document</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;

            let filteredResults;

            // Check if the input code is "SHOWALL_@first_release"
            if (inputCode === "SHOWALL_@first_release") {
                filteredResults = filteredData; // Show all data
            } else {
                // Filter based on the input code
                const reviewerName = reviewerMap.get(inputCode);
                filteredResults = reviewerName ? filteredData.filter(entry => entry.reviewer === reviewerName) : [];
            }

            // Display results in the table
            const tableBody = resultsTable.querySelector('tbody');
            if (filteredResults.length > 0) {
                filteredResults.forEach((entry, index) => {
                    const row = document.createElement('tr');
                    const entryId = `entry-${index}`; // Unique ID for each entry
                    const isChecked = loadReviewedState(entryId); // Load the reviewed state

                    if (inputCode === "SHOWALL_@first_release") {
                        // For SHOWALL_@first_release, show the progress
                        row.innerHTML = `
                            <td>${isChecked ? 'Completed' : 'In Progress'}</td>
                            <td>${entry.mainFolder}</td>
                            <td>${entry.reviewer}</td>
                            <td>${entry.document}</td>
                            <td><a href="${entry.folderLink}" target="_blank">View Document</a></td>
                        `;
                    } else {
                        // For individual reviewer codes, keep the checkbox
                        row.innerHTML = `
                            <td><input type="checkbox" class="review-checkbox" id="${entryId}" ${isChecked ? 'checked' : ''}></td>
                            <td>${entry.mainFolder}</td>
                            <td>${entry.reviewer}</td>
                            <td>${entry.document}</td>
                            <td><a href="${entry.folderLink}" target="_blank">View Document</a></td>

                        `;

                        // Set the checkbox state based on local storage
                        const checkbox = row.querySelector('.review-checkbox');
                        checkbox.addEventListener('change', function() {
                            const checked = this.checked;
                            saveReviewedState(entryId, checked); // Save the state
                            row.style.backgroundColor = checked ? '#d4edda' : ''; // Change background color
                        });

                        // Set the initial background color based on the checkbox state
                        if (isChecked) {
                            row.style.backgroundColor = '#d4edda'; // Light green for reviewed
                        }
                    }

                    tableBody.appendChild(row);
                });
            } else {
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = '<td colspan="6">No results found for the given reviewer code.</td>'; // Adjust colspan
                tableBody.appendChild(noDataRow);
            }

            // Append the results table to the results div
            resultsDiv.appendChild(resultsTable);
        });
    })
    .catch(error => console.error('Error fetching the CSV:', error));

