let gamesData = {};
let players = [];
let impostorIndex = -1;
let currentTurnIndex = 0;
let currentGameData = {};
let selectedCategory = "";
let hintsEnabled = true;
let currentMode = 'Classic'; // Classic, Pokemon, ClashRoyale

const screens = {
    setup: document.getElementById('screen-setup'),
    pass: document.getElementById('screen-pass'),
    reveal: document.getElementById('screen-reveal'),
    discussion: document.getElementById('screen-discussion'),
    result: document.getElementById('screen-result')
};

// 1. Cargar datos (JSON)
async function loadGames() {
    try {
        const response = await fetch('data.json');
        gamesData = await response.json();

        const select = document.getElementById('category-select');
        select.innerHTML = '';
        Object.keys(gamesData).forEach(category => {
            if (category !== 'Pokemon' && category !== 'ClashRoyale') {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Error cargando JSON, usando backup", error);
        gamesData = {
            "General": [
                { "palabra": "Pizza", "pista": "Comida rápida" },
                { "palabra": "Facebook", "pista": "Red Social" }
            ]
        };
        const select = document.getElementById('category-select');
        const option = document.createElement('option');
        option.value = "General";
        option.textContent = "General";
        select.appendChild(option);
    }
}
loadGames();

function setMode(mode) {
    currentMode = mode;

    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));

    let btnId = 'btn-classic';
    if (mode === 'Pokemon') {
        btnId = 'btn-pokemon';
    } else if (mode === 'ClashRoyale') {
        btnId = 'btn-clash';
    }
    document.getElementById(btnId).classList.add('active');

    document.body.classList.remove('theme-classic', 'theme-pokemon', 'theme-clash');
    if (mode === 'Pokemon') {
        document.body.classList.add('theme-pokemon');
    } else if (mode === 'ClashRoyale') {
        document.body.classList.add('theme-clash');
    } else {
        document.body.classList.add('theme-classic');
    }

    const mainTitle = document.querySelector('.container > h1');
    if (mode === 'Pokemon') {
        mainTitle.textContent = '⚡ El Impostor Pokémon';
    } else if (mode === 'ClashRoyale') {
        mainTitle.textContent = '👑 El Impostor Royale';
    } else {
        mainTitle.textContent = '🕵️ El Impostor';
    }

    const catLabel = document.querySelector('label[for="category-select"]');
    const catSelect = document.getElementById('category-select');

    if (mode === 'Classic') {
        catLabel.style.display = 'block';
        catSelect.style.display = 'block';
    } else {
        catLabel.style.display = 'none';
        catSelect.style.display = 'none';
    }
}

function addPlayerInput() {
    const container = document.getElementById('inputs-container');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Jugador ${container.children.length + 1}`;
    input.className = 'player-input';
    container.appendChild(input);
}

function removePlayerInput() {
    const container = document.getElementById('inputs-container');
    if (container.children.length > 3) {
        container.removeChild(container.lastElementChild);
    }
}

// 2. Comenzar Juego (Botón Aceptar)
function startGame() {
    selectedCategory = document.getElementById('category-select').value;
    hintsEnabled = document.getElementById('hints-toggle').checked;

    const inputs = document.querySelectorAll('.player-input');
    const tempPlayers = [];

    inputs.forEach(input => {
        const name = input.value.trim();
        if (name) tempPlayers.push(name);
    });

    if (tempPlayers.length < 3) { 
        document.getElementById('error-msg').innerText = "Se necesitan al menos 3 jugadores.";
        return;
    }

    document.getElementById('error-msg').innerText = "";

    // Lógica interna: Reordenar aleatoriamente
    players = tempPlayers.sort(() => Math.random() - 0.5);

    // Asignar impostor
    impostorIndex = Math.floor(Math.random() * players.length);

    // Elegir palabra aleatoria
    let possibleWords = [];

    if (currentMode === 'Classic') {
        possibleWords = gamesData[selectedCategory] || [];
        if (possibleWords.length === 0) {
            document.getElementById('error-msg').innerText = "Error: No hay palabras en esta categoría.";
            return;
        }
    } else if (currentMode === 'Pokemon') {
        possibleWords = gamesData['Pokemon'] || [];
    } else if (currentMode === 'ClashRoyale') {
        possibleWords = gamesData['ClashRoyale'] || [];
    }

    if (!possibleWords || possibleWords.length === 0) {
        document.getElementById('error-msg').innerText = "Error: No se cargaron datos para este modo.";
        return;
    }

    currentGameData = possibleWords[Math.floor(Math.random() * possibleWords.length)];

    currentTurnIndex = 0;
    showScreen('pass');
    updatePassScreen();
}

function updatePassScreen() {
    document.getElementById('player-turn-name').innerText = players[currentTurnIndex];
}

// 3. Mostrar Palabra o Pista
function revealRole() {
    showScreen('reveal');
    const wordElement = document.getElementById('secret-word');
    const titleElement = document.getElementById('role-title');

    if (currentTurnIndex === impostorIndex) {
        titleElement.innerText = "ERES EL IMPOSTOR";
        titleElement.style.color = "#ff6b6b";

        if (hintsEnabled) {
            wordElement.innerText = `Pista: ${currentGameData.pista}`;
        } else {
            wordElement.innerText = "¡Mantenlo en secreto!";
        }
    } else {
        titleElement.innerText = "Tu palabra secreta es:";
        titleElement.style.color = "white";
        wordElement.innerText = currentGameData.palabra;
    }
}

// 4. Siguiente jugador
function nextTurn() {
    currentTurnIndex++;
    if (currentTurnIndex < players.length) {
        updatePassScreen();
        showScreen('pass');
    } else {
        showDiscussionScreen();
    }
}

function showDiscussionScreen() {
    showScreen('discussion');
    const randomStarter = players[Math.floor(Math.random() * players.length)];
    document.getElementById('starting-player').innerText = randomStarter;
}

function showImpostorRevealScreen() {
    showScreen('result');
    document.getElementById('impostor-name').innerText = players[impostorIndex];
    document.getElementById('final-word').innerText = currentGameData.palabra;
}

function restartGame() {

    players.sort(() => Math.random() - 0.5);
    impostorIndex = Math.floor(Math.random() * players.length);

    let possibleWords = [];
    if (currentMode === 'Classic') {
        possibleWords = gamesData[selectedCategory] || [];
    } else {
        possibleWords = gamesData[currentMode] || [];
    }

    if (possibleWords.length > 0) {
        currentGameData = possibleWords[Math.floor(Math.random() * possibleWords.length)];
    }
    currentTurnIndex = 0;

    showScreen('pass');
    updatePassScreen();
}
function resetToHome() {
    showScreen('setup');
}
function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    Object.values(screens).forEach(s => s.classList.add('hidden'));

    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('active');
}
