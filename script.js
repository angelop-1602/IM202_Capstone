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
    ["Dr. Marites Tenedor", "DRMT-025"],
    ["Dr. MJ Manuel", "DRMJM-026"],
    ["Master Code", "SHOWALL"]
];

// Key for storing reviewer code in localStorage
const REVIEWER_CODE_KEY = 'erec_reviewer_code';

// Convert reviewerCodes to a Map for easier lookup
const reviewerMap = new Map(reviewerCodes.map(code => [code[1], code[0]]));

// Cache for CSV data to prevent redundant fetches
const csvCache = new Map();

// Debounce function to prevent excessive loadCSV calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

// Optimized CSV loading function
function loadCSV() {
    // Show loading indicator
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p class="loading">Loading data...</p>';
    
    const release = document.getElementById('release-select').value;
    const level = document.getElementById('level-select').value;
    const week = document.getElementById('week-select').value;
    let csvFile;

    // Determine the CSV file based on the selected release
    if (release === 'first-release') {
        csvFile = 'first-release.csv';
    } else if (release === 'second-release') {
        csvFile = level === 'graduate' ? 'second-release-graduate.csv' : 'second-release-undergraduate.csv';
    } else if (release === 'third-release') {
        csvFile = level === 'graduate' ? 'third-release-graduate.csv' : 'third-release-undergraduate.csv';
    } else if (release === 'fourth-release') {
        csvFile = level === 'graduate' ? 'fourth-release-graduate.csv' : 'fourth-release-undergraduate.csv';
    } else if (release === 'april') {
        if (week === '1st-week') {
            csvFile = 'april_1stweek.csv';
        } else if (week === '2nd-week') {
            csvFile = 'april_2ndweek.csv';
        } else if (week === '3rd-week') {
            csvFile = 'april_3rdweek.csv';
        } else if (week === '4th-week') {
            csvFile = 'april_4thweek.csv';
        }
    }

    // Update UI dropdowns display
    document.getElementById('level-select').style.display = 
        (release === 'second-release' || release === 'third-release' || release === 'fourth-release') ? 'block' : 'none';
    
    document.getElementById('week-select').style.display = 
        (release === 'april') ? 'block' : 'none';

    // Only proceed if we have a valid CSV file
    if (!csvFile) {
        displayResults([]);
        return;
    }

    // Check if data is already in cache
    if (csvCache.has(csvFile)) {
        filterAndDisplayData(csvCache.get(csvFile));
        return;
    }

    // Fetch data with improved error handling
    fetch(csvFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            // Parse and cache the CSV data
            const rows = data.split('\n').slice(1); // Skip header
            const parsedData = rows.filter(row => row.trim() !== '').map(row => {
                const columns = row.split(',');
                return {
                    mainFolder: columns[0],
                    reviewer: columns[1],
                    document: columns[2],
                    folderLink: columns[3],
                    progress: columns[4]
                };
            });
            
            // Store in cache for future use
            csvCache.set(csvFile, parsedData);
            
            // Filter and display the data
            filterAndDisplayData(parsedData);
        })
        .catch(error => {
            console.error('Error loading CSV:', error);
            resultsDiv.innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
        });
}

// Save reviewer code to localStorage
function saveReviewerCode(code) {
    if (code && code.trim() !== '') {
        localStorage.setItem(REVIEWER_CODE_KEY, code);
    }
}

// Separate function to filter and display data
function filterAndDisplayData(data) {
    const inputCode = document.getElementById('reviewer-code').value.trim();
    let filteredData;

    // Check if the input code is "SHOWALL"
    if (inputCode === "SHOWALL") {
        filteredData = data; // Show all data
    } else {
        const reviewerName = reviewerMap.get(inputCode);
        filteredData = reviewerName ? data.filter(entry => entry.reviewer === reviewerName) : [];
    }

    // Save valid reviewer code to localStorage
    if (filteredData.length > 0 || inputCode === "SHOWALL") {
        saveReviewerCode(inputCode);
    }

    // Display the filtered data
    displayResults(filteredData);
}

// Create a debounced version of the loadCSV function
const debouncedLoadCSV = debounce(loadCSV, 300);

// Add event listeners
document.getElementById('release-select').addEventListener('change', loadCSV);
document.getElementById('level-select').addEventListener('change', loadCSV);
document.getElementById('week-select').addEventListener('change', loadCSV);
document.getElementById('reviewer-code').addEventListener('input', debouncedLoadCSV);

// Remove the duplicate April option code
// Create the week dropdown if it doesn't exist
if (!document.getElementById('week-select')) {
    const weekSelect = document.createElement('select');
    weekSelect.id = 'week-select';
    weekSelect.className = 'dropdown';
    weekSelect.style.display = 'none'; // Hidden by default
    
    // Week options
    const weekOptions = [
        { value: '1st-week', text: '1st Week' },
        { value: '2nd-week', text: '2nd Week', disabled: false },
        { value: '3rd-week', text: '3rd Week', disabled: false },
        { value: '4th-week', text: '4th Week', disabled: false }
    ];
    
    // Add options to the week dropdown
    weekOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        if (option.disabled) {
            optionElement.disabled = true;
        }
        weekSelect.appendChild(optionElement);
    });
    
    // Insert the week dropdown into the dropdown container
    document.querySelector('.dropdown-container').appendChild(weekSelect);
}

// Function to update week options based on selected release
function updateWeekOptions() {
    const release = document.getElementById('release-select').value;
    const weekSelect = document.getElementById('week-select');
    
    if (!weekSelect) return;
    
    // Get all week options
    const options = weekSelect.querySelectorAll('option');
    
    // Enable/disable options based on release
    if (release === 'april') {
        // For April, all weeks are available
        options.forEach((option, index) => {
            option.disabled = false;
            option.textContent = option.value === '1st-week' ? '1st Week' : 
                                option.value === '2nd-week' ? '2nd Week' : 
                                option.value === '3rd-week' ? '3rd Week' : 
                                '4th Week';
        });
    }
}

// Add event listener to update week options when release changes
document.getElementById('release-select').addEventListener('change', updateWeekOptions);

// Optimized function to display results
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (data.length === 0) {
        resultsDiv.innerHTML = '<p class="no-data">No data available.</p>';
        return;
    }

    // Create table using document fragment for better performance
    const fragment = document.createDocumentFragment();
    const table = document.createElement('table');
    table.className = 'results-table';
    
    // Create proper thead element
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Add headers
    const headers = ['Main Folder', 'Reviewer', 'Document', 'Folder Link', 'Progress'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create tbody element
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // Batch process for DOM operations
    const batchSize = 20;
    for (let i = 0; i < data.length; i += batchSize) {
        // Process in batches to avoid blocking the main thread
        setTimeout(() => {
            const batch = data.slice(i, i + batchSize);
            batch.forEach((item, index) => {
                const actualIndex = i + index;
                const row = document.createElement('tr');
                
                // Create a unique key for localStorage using BOTH main folder and document
                const storageKey = `${item.mainFolder}_${item.document}`;
                const safeStorageKey = storageKey.replace(/[^a-zA-Z0-9]/g, '_');
                
                // Generate a completely unique ID for each checkbox
                const uniqueId = `checkbox_${actualIndex}_${safeStorageKey}`;
                
                // Check if this specific document+folder combination has been reviewed
                const isChecked = localStorage.getItem(safeStorageKey) === 'true';
                
                // Create cells with data-labels for mobile view
                const cells = [
                    { content: item.mainFolder, label: 'Main Folder' },
                    { content: item.reviewer, label: 'Reviewer' },
                    { content: item.document, label: 'Document' },
                    { content: `<a href="${item.folderLink}" target="_blank">View Document</a>`, label: 'Folder Link' },
                    { content: `<input type="checkbox" id="${uniqueId}" class="review-checkbox" data-key="${safeStorageKey}" ${isChecked ? 'checked' : ''}><label for="${uniqueId}"></label>`, label: 'Progress' }
                ];
                
                cells.forEach(cell => {
                    const td = document.createElement('td');
                    td.setAttribute('data-label', cell.label);
                    td.innerHTML = cell.content;
                    row.appendChild(td);
                });
                
                tbody.appendChild(row);
            });
            
            // Add event listeners to the batch's checkboxes
            if (i + batchSize >= data.length || i === 0) {
                addCheckboxListeners();
            }
        }, 0);
    }
    
    // Append the table to the document fragment
    fragment.appendChild(table);
    
    // Append the fragment to the results div (single DOM operation)
    resultsDiv.appendChild(fragment);
}

// Function to add clear code button
function addClearCodeButton() {
    const codeInput = document.getElementById('reviewer-code');
    const parent = codeInput.parentNode;
    
    // Create clear button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'code-input-container';
    
    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.innerHTML = '&times;'; // × symbol
    clearButton.className = 'clear-code-button';
    clearButton.title = 'Clear saved reviewer code';
    clearButton.onclick = function() {
        localStorage.removeItem(REVIEWER_CODE_KEY);
        codeInput.value = '';
        this.style.display = 'none';
        loadCSV();
    };
    
    // Wrap the input and add the button
    parent.insertBefore(buttonContainer, codeInput);
    buttonContainer.appendChild(codeInput);
    buttonContainer.appendChild(clearButton);
    
    // Show/hide clear button based on input value
    if (!codeInput.value) {
        clearButton.style.display = 'none';
    }
    
    // Add input event to toggle clear button visibility
    codeInput.addEventListener('input', function() {
        clearButton.style.display = this.value ? 'block' : 'none';
    });
}

// Separate function to add checkbox event listeners
function addCheckboxListeners() {
    document.querySelectorAll('.review-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Use the data-key attribute to store/retrieve from localStorage
            const storageKey = this.getAttribute('data-key');
            localStorage.setItem(storageKey, this.checked);
        });
    });
}

// Function to open a form in a new tab
function openForm(url) {
    window.open(url, '_blank');
}

// Initialize the system with loading indicator
window.addEventListener('DOMContentLoaded', function() {
    // Check if browser supports will-change CSS property
    const supportsWillChange = "willChange" in document.documentElement.style;
    if (!supportsWillChange) {
        // Adjust styles for browsers without will-change support
        document.querySelectorAll('.results-table, .input-field, .dropdown, .form-button').forEach(el => {
            el.style.transition = 'none';
        });
    }
    
    // Load saved reviewer code if available
    const savedCode = localStorage.getItem(REVIEWER_CODE_KEY);
    if (savedCode) {
        document.getElementById('reviewer-code').value = savedCode;
    }
    
    // Add clear code button
    addClearCodeButton();
    
    // Update week options based on initial release
    updateWeekOptions();
    
    // Load initial data
    loadCSV();
});

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('update-modal');
    const updateBtn = document.getElementById('update-button');
    const closeBtn = document.querySelector('.close-modal');

    // Function to open modal with animation
    function openModal() {
        modal.style.display = 'block';
        // Trigger reflow to allow the transition to work
        void modal.offsetWidth;
        modal.classList.add('show');
    }

    // Function to close modal with animation
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Match the transition duration
    }

    // Open modal when button is clicked
    updateBtn.addEventListener('click', openModal);

    // Close modal when X is clicked
    closeBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Also close modal when pressing ESC key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
});