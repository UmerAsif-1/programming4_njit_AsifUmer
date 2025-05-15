const HOME_SECTION = 'home';
const REGISTER_SECTION = 'register';
const LOGIN_SECTION = 'login';
const OBSERVATIONS_SECTION = 'observations';
const ADD_SECTION = 'add';
const EDIT_SECTION = 'edit';

let CURRENT_SECTION = HOME_SECTION;
const DEFAULT_OBSERVATIONS_KEY = 'defaultObservations'; // Key for default observations

window.onload = () => {
    showSection(HOME_SECTION);
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener('click', logoutUser);
    }

    document.querySelector('header nav ul').addEventListener('click', handleNavigation);
    document.getElementById('registerForm').addEventListener('submit', handleRegisterSubmit);
    document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
    document.getElementById('observationForm').addEventListener('submit', handleAddObservationSubmit);
    document.getElementById('editObservationForm').addEventListener('submit', handleEditObservationSubmit);

    initializeObservationsView(); // call this function on page load
    updateLoginStatus();
};

function handleNavigation(event) {
    event.preventDefault(); // Prevent default link behavior
    const target = event.target.getAttribute('href').substring(1);
    showSection(target);
}

function showSection(sectionId) {
    hideAllSections();
    document.getElementById(sectionId).style.display = 'block';
    CURRENT_SECTION = sectionId;

    if (CURRENT_SECTION === OBSERVATIONS_SECTION) {
        displayObservations();
    }
    if (CURRENT_SECTION === LOGIN_SECTION || CURRENT_SECTION === REGISTER_SECTION) {
        if (isLoggedIn()) {
            alert("Already logged in.  Redirecting to Home.");
            showSection(HOME_SECTION);
        }
    }
    if (CURRENT_SECTION === ADD_SECTION) {
        if (!isLoggedIn()) {
            alert("Login Required.  Redirecting to Home.");
            showSection(HOME_SECTION);
        }
    }
}

function hideAllSections() {
    document.getElementById(HOME_SECTION).style.display = 'none';
    document.getElementById(REGISTER_SECTION).style.display = 'none';
    document.getElementById(LOGIN_SECTION).style.display = 'none';
    document.getElementById(OBSERVATIONS_SECTION).style.display = 'none';
    document.getElementById(ADD_SECTION).style.display = 'none';
    document.getElementById(EDIT_SECTION).style.display = 'none';
}

// --- Local Storage Functions ---
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function removeData(key) {
    localStorage.removeItem(key);
}

// --- User Authentication ---
function handleRegisterSubmit(event) {
    event.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    if (!username || !password) {
        alert("Please provide both username and password.");
        return;
    }

    const users = loadData("users") || [];
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        alert("Username already exists. Please use a different username.");
        return;
    }

    const newUser = { username, password };
    users.push(newUser);
    saveData("users", users);
    alert("Registration successful! You can now log in.");
    showSection(LOGIN_SECTION);
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
        alert("Please provide both username and password.");
        return;
    }

    const users = loadData("users") || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert("Invalid credentials. Please check your username and password.");
        return;
    }

    saveData("loggedInUser", { username: user.username });
    alert("Login successful!");
    showSection(HOME_SECTION);
    updateLoginStatus();
}

function logoutUser() {
    removeData("loggedInUser");
    alert("Logged out!");
    showSection(HOME_SECTION);
    updateLoginStatus();
}

function isLoggedIn() {
    return loadData("loggedInUser") !== null;
}

function updateLoginStatus() {
    const logoutLink = document.getElementById("logout-link");
    if (isLoggedIn()) {
        logoutLink.style.display = "inline-block";
    } else {
        logoutLink.style.display = "none";
    }
}

// --- Observation Management ---
let editingObservationId = null;

function initializeObservationsView() {
    // Check if default observations exist
    let defaultObservations = loadData(DEFAULT_OBSERVATIONS_KEY);
    if (!defaultObservations) {
        // If not, create and store them
        defaultObservations = [
            { id: 1, name: "Orion Nebula", nickname: "Beginner1", description: "A beautiful nebula", declination: "5 20 00", rightAscension: "05h 35m 17s", locationName: "My Backyard", coordinates: "34.0522,-118.2437", timestamp: "2024-01-15T21:00:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 2, name: "Andromeda Galaxy", nickname: "SpaceEnthusiast", description: "Nearest galaxy to Milky Way", declination: "41 27 00", rightAscension: "00h 42m 44s", locationName: "Griffith Observatory", coordinates: "34.1186,-118.2922", timestamp: "2024-01-20T22:30:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 3, name: "Mars", nickname: "RedPlanetFan", description: "The Red Planet", declination: "19 00 00", rightAscension: "21h 00m 00s", locationName: "Atacama Desert", coordinates: "-24.6333,-69.1333", timestamp: "2024-02-01T03:00:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 4, name: "Jupiter", nickname: "GasGiantLover", description: "Largest planet in our solar system", declination: "-20 00 00", rightAscension: "17h 00m 00s", locationName: "Mauna Kea", coordinates: "19.8206,-155.4681", timestamp: "2024-02-10T05:45:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 5, name: "Saturn", nickname: "RingedBeauty", description: "Known for its beautiful rings", declination: "10 00 00", rightAscension: "02h 00m 00s", locationName: "Grand Canyon", coordinates: "36.0544,-112.1401", timestamp: "2024-02-18T10:00:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 6, name: "Pleiades", nickname: "StarClusterFan", description: "Seven Sisters star cluster", declination: "24 00 00", rightAscension: "03h 47m 00s", locationName: "Yosemite National Park", coordinates: "37.8651,-119.5383", timestamp: "2024-03-01T14:20:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 7, name: "Milky Way Core", nickname: "GalaxyGazer", description: "Center of our galaxy", declination: "-29 00 00", rightAscension: "17h 45m 00s", locationName: "Death Valley", coordinates: "36.2403,-116.8151", timestamp: "2024-03-10T19:00:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 8, name: "Horsehead Nebula", nickname: "DarkNebulaHunter", description: "A dark nebula in Orion", declination: "-02 27 00", rightAscension: "05h 40m 00s", locationName: "Joshua Tree National Park", coordinates: "33.8818,-115.9007", timestamp: "2024-03-22T02:15:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 9, name: "Eagle Nebula", nickname: "PillarsofCreation", description: "Contains the Pillars of Creation", declination: "-13 49 00", rightAscension: "18h 18m 00s", locationName: "Zion National Park", coordinates: "37.2995,-113.0263", timestamp: "2024-04-05T08:30:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 10, name: "Crab Nebula", nickname: "SupernovaRemnant", description: "Remnant of a supernova explosion", declination: "22 00 00", rightAscension: "05h 34m 32s", locationName: "Yellowstone National Park", coordinates: "44.4280,-110.5885", timestamp: "2024-04-12T13:00:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 }
        ];
        saveData(DEFAULT_OBSERVATIONS_KEY, defaultObservations);
    }
}

function handleAddObservationSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("obsName").value;
    const nickname = document.getElementById("nickname").value;
    const description = document.getElementById("description").value;
    const declination = document.getElementById("declination").value;
    const rightAscension = document.getElementById("rightAscension").value;
    const locationName = document.getElementById("locationName").value;
    const coordinates = document.getElementById("coordinates").value;

    if (!name || !nickname || !description || !declination || !rightAscension || !locationName || !coordinates) {
        alert("Please fill in all fields.");
        return;
    }

    if (!isLoggedIn()) {
        alert("You must be logged in to add an observation.");
        showSection(HOME_SECTION);
        return;
    }

    const newObservation = {
        id: Date.now(),
        name,
        nickname,
        description,
        declination,
        rightAscension,
        locationName,
        coordinates,
        timestamp: new Date().toISOString(),
        modifiedTimestamp: null,
        modifiedReason: null,
        accessCount: 0
    };

    let observations = loadData("observations") || [];
    observations.push(newObservation);
    saveData("observations", observations);
    alert("Observation added successfully!");
    document.getElementById("observationForm").reset();
    showSection(OBSERVATIONS_SECTION);
    displayObservations();
}

function displayObservations() {
    const defaultObservations = loadData(DEFAULT_OBSERVATIONS_KEY) || [];
    let observations = loadData("observations") || [];

    
    if (isLoggedIn()) {
        observations = [...defaultObservations, ...observations]; // User entries appear after defaults
    }    

    const observationList = document.getElementById("observationList");
    observationList.innerHTML = "";

    if (observations.length === 0) {
        observationList.innerHTML = "<p>No observations available yet.</p>";
        return;
    }
     observations.forEach(observation => observation.accessCount++);
     saveData('observations', observations);

    // Sort observations by timestamp (most recent first)
    observations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const DEFAULT_PAGE_SIZE = 5;
    let currentPage = 1;
    let filteredObservations = [...observations];

    function displayCurrentPage(obsToDisplay) {
        observationList.innerHTML = ""; // Clear the list
        const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE;
        const endIndex = startIndex + DEFAULT_PAGE_SIZE;
        const pageObservations = obsToDisplay.slice(startIndex, endIndex);

        pageObservations.forEach(observation => {
            const obsDiv = document.createElement("div");
            obsDiv.classList.add("observation-item");
            obsDiv.innerHTML = `
                    <h3>${observation.name}</h3>
                    <p><strong>Observed by:</strong> ${observation.nickname}</p>
                    <p>${observation.description}</p>
                    <p><strong>Declination:</strong> ${observation.declination}, <strong>Right Ascension:</strong> ${observation.rightAscension}</p>
                    <p><strong>Location:</strong> ${observation.locationName} (${observation.coordinates})</p>
                    <p><strong>Date/Time:</strong> ${new Date(observation.timestamp).toLocaleString()}</p>
                    <p><strong>Access Count:</strong> ${observation.accessCount}</p>
                    ${isLoggedIn() ? `<button onclick="editObservation(${observation.id})">Edit</button>
                    <button onclick="deleteObservation(${observation.id})">Delete</button>` : ''}
                `;
            observationList.appendChild(obsDiv);
        });

        // Pagination controls
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage >= Math.ceil(obsToDisplay.length / DEFAULT_PAGE_SIZE);
        pageInfo.textContent = `Page: ${currentPage} of ${Math.ceil(obsToDisplay.length / DEFAULT_PAGE_SIZE)}`;
    }
    displayCurrentPage(filteredObservations);

    // Event listeners for pagination buttons
    document.getElementById('prevPage').onclick = () => {
        currentPage--;
        displayCurrentPage(filteredObservations);
    };
    document.getElementById('nextPage').onclick = () => {
        currentPage++;
        displayCurrentPage(filteredObservations);
    };

    // --- Search functionality ---
    document.getElementById('searchButton').addEventListener('click', () => {
        const nameSearch = document.getElementById('searchName').value.toLowerCase();
        const dateFrom = document.getElementById('searchDateFrom').value;
        const dateTo = document.getElementById('searchDateTo').value;
        const ownerSearch = document.getElementById('searchOwner').value.toLowerCase();

        filteredObservations = observations.filter(observation => {
            const obsDate = new Date(observation.timestamp);

            const nameMatch = !nameSearch || observation.name.toLowerCase().includes(nameSearch);
            const dateFromMatch = !dateFrom || obsDate >= new Date(dateFrom);
            const dateToMatch = !dateTo || obsDate <= new Date(dateTo);
            const ownerMatch = !ownerSearch || observation.nickname.toLowerCase().includes(ownerSearch);

            return nameMatch && dateFromMatch && dateToMatch && ownerMatch;
        });
        currentPage = 1;
        displayCurrentPage(filteredObservations);
    });
}

function editObservation(id) {
    const observations = loadData("observations") || [];
    const observationToEdit = observations.find(obs => obs.id === id);

    if (!observationToEdit) {
        alert("Observation not found.");
        return;
    }
    editingObservationId = id;

    document.getElementById("editObsName").value = observationToEdit.name;
    document.getElementById("editNickname").value = observationToEdit.nickname;
    document.getElementById("editDescription").value = observationToEdit.description;
    document.getElementById("editDeclination").value = observationToEdit.declination;
    document.getElementById("editRightAscension").value = observationToEdit.rightAscension;
    document.getElementById("editLocationName").value = observationToEdit.locationName;
    document.getElementById("editCoordinates").value = observationToEdit.coordinates;

    showSection(EDIT_SECTION);
}

function handleEditObservationSubmit(event) {
    event.preventDefault();

    const updatedObservation = {
        id: editingObservationId,
        name: document.getElementById("editObsName").value,
        nickname: document.getElementById("editNickname").value,
        description: document.getElementById("editDescription").value,
        declination: document.getElementById("editDeclination").value,
        rightAscension: document.getElementById("editRightAscension").value,
        locationName: document.getElementById("editLocationName").value,
        coordinates: document.getElementById("editCoordinates").value,
        modifiedTimestamp: new Date().toISOString(),
        modifiedReason: document.getElementById("editReason").value,
        accessCount: 0
    };

    let observations = loadData("observations") || [];
    const index = observations.findIndex(obs => obs.id === editingObservationId);

    if (index !== -1) {
        const originalObservation = observations[index];
        updatedObservation.timestamp = originalObservation.timestamp;
         updatedObservation.accessCount = originalObservation.accessCount;
        observations[index] = updatedObservation;
        saveData("observations", observations);
        alert("Observation updated successfully!");
        showSection(OBSERVATIONS_SECTION);
        displayObservations();
    } else {
        alert("Observation not found.");
    }
    editingObservationId = null;
    document.getElementById('editObservationForm').reset();
}

function deleteObservation(id) {
    if (confirm("Are you sure you want to delete this observation?")) {
        let observations = loadData("observations") || [];
        const updatedObservations = observations.filter(obs => obs.id !== id);
        saveData("observations", updatedObservations);
        alert("Observation deleted successfully!");
        displayObservations();
    }
}

function initializeObservationsView() {
    // Check if default observations exist
    let defaultObservations = loadData(DEFAULT_OBSERVATIONS_KEY);
    if (!defaultObservations) {
        // If not, create and store them
        defaultObservations = [
             { id: 1, name: "Orion Nebula", nickname: "Beginner1", description: "A beautiful nebula", declination: "5 20 00", rightAscension: "05h 35m 17s", locationName: "My Backyard", coordinates: "34.0522,-118.2437", timestamp: "2024-01-15T21:00:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 2, name: "Andromeda Galaxy", nickname: "SpaceEnthusiast", description: "Nearest galaxy to Milky Way", declination: "41 27 00", rightAscension: "00h 42m 44s", locationName: "Griffith Observatory", coordinates: "34.1186,-118.2922", timestamp: "2024-01-20T22:30:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 3, name: "Mars", nickname: "RedPlanetFan", description: "The Red Planet", declination: "19 00 00", rightAscension: "21h 00m 00s", locationName: "Atacama Desert", coordinates: "-24.6333,-69.1333", timestamp: "2024-02-01T03:00:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 4, name: "Jupiter", nickname: "GasGiantLover", description: "Largest planet in our solar system", declination: "-20 00 00", rightAscension: "17h 00m 00s", locationName: "Mauna Kea", coordinates: "19.8206,-155.4681", timestamp: "2024-02-10T05:45:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 5, name: "Saturn", nickname: "RingedBeauty", description: "Known for its beautiful rings", declination: "10 00 00", rightAscension: "02h 00m 00s", locationName: "Grand Canyon", coordinates: "36.0544,-112.1401", timestamp: "2024-02-18T10:00:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 6, name: "Pleiades", nickname: "StarClusterFan", description: "Seven Sisters star cluster", declination: "24 00 00", rightAscension: "03h 47m 00s", locationName: "Yosemite National Park", coordinates: "37.8651,-119.5383", timestamp: "2024-03-01T14:20:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 7, name: "Milky Way Core", nickname: "GalaxyGazer", description: "Center of our galaxy", declination: "-29 00 00", rightAscension: "17h 45m 00s", locationName: "Death Valley", coordinates: "36.2403,-116.8151", timestamp: "2024-03-10T19:00:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 8, name: "Horsehead Nebula", nickname: "DarkNebulaHunter", description: "A dark nebula in Orion", declination: "-02 27 00", rightAscension: "05h 40m 00s", locationName: "Joshua Tree National Park", coordinates: "33.8818,-115.9007", timestamp: "2024-03-22T02:15:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 9, name: "Eagle Nebula", nickname: "PillarsofCreation", description: "Contains the Pillars of Creation", declination: "-13 49 00", rightAscension: "18h 18m 00s", locationName: "Zion National Park", coordinates: "37.2995,-113.0263", timestamp: "2024-04-05T08:30:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 },
            { id: 10, name: "Crab Nebula", nickname: "SupernovaRemnant", description: "Remnant of a supernova explosion", declination: "22 00 00", rightAscension: "05h 34m 32s", locationName: "Yellowstone National Park", coordinates: "44.4280,-110.5885", timestamp: "2024-04-12T13:00:00Z", modifiedTimestamp: null, modifiedReason: null, accessCount: 0 }
        ];
        saveData(DEFAULT_OBSERVATIONS_KEY, defaultObservations);
    }
}
