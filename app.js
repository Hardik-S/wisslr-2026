const GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";
const TARGET_COUNTRY = "India";
const CLUE_AUDIO_SRC = "./assets/audio/kannada-10s.mp3";

const state = {
  players: [],
  currentPlayerIndex: 0,
  started: false,
  canGuess: false,
  turn: 1,
  map: null,
  countryLayer: null,
  clueAudio: null,
};

const elements = {
  playerNameInput: document.getElementById("playerName"),
  addPlayerButton: document.getElementById("addPlayerButton"),
  startGameButton: document.getElementById("startGameButton"),
  playClueButton: document.getElementById("playClueButton"),
  resetScoresButton: document.getElementById("resetScoresButton"),
  statusText: document.getElementById("statusText"),
  feedbackText: document.getElementById("feedbackText"),
  playerList: document.getElementById("playerList"),
};

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getCountryName(feature) {
  const properties = feature?.properties || {};
  const candidates = [
    properties.name,
    properties.NAME,
    properties.admin,
    properties.ADMIN,
    properties.country,
    properties.COUNTRY,
  ];

  const name = candidates.find((entry) => typeof entry === "string" && entry.trim());
  return name || "Unknown country";
}

function getCountryCodes(feature) {
  const properties = feature?.properties || {};
  const codes = [
    feature?.id,
    properties.iso_a3,
    properties.ISO_A3,
    properties.ISO3,
    properties.iso3,
    properties["ISO3166-1-Alpha-3"],
    properties.adm0_a3,
    properties.ADM0_A3,
  ];

  return codes.filter(Boolean).map((code) => normalizeValue(code));
}

function isIndia(feature) {
  const normalizedName = normalizeValue(getCountryName(feature));
  if (normalizedName === "india" || normalizedName === "republic of india") {
    return true;
  }

  return getCountryCodes(feature).includes("ind");
}

function setFeedback(text, tone = "") {
  elements.feedbackText.textContent = text;
  elements.feedbackText.classList.remove("win", "lose");
  if (tone) {
    elements.feedbackText.classList.add(tone);
  }
}

function updateStatus() {
  if (state.players.length === 0) {
    elements.statusText.textContent = "Add at least one player to begin.";
    return;
  }

  if (!state.started) {
    elements.statusText.textContent = `${state.players.length} player(s) ready. Click Start Game.`;
    return;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  elements.statusText.textContent = `Turn ${state.turn}: ${currentPlayer.name}, play the Kannada clip and click ${TARGET_COUNTRY}.`;
}

function updateButtons() {
  const hasPlayers = state.players.length > 0;
  elements.startGameButton.disabled = !hasPlayers;
  elements.playClueButton.disabled = !state.started;
  elements.resetScoresButton.disabled = !hasPlayers;
}

function renderPlayers() {
  elements.playerList.innerHTML = "";

  if (state.players.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No players yet";
    elements.playerList.appendChild(empty);
    return;
  }

  state.players.forEach((player, index) => {
    const item = document.createElement("li");
    if (state.started && index === state.currentPlayerIndex) {
      item.classList.add("active");
    }

    const name = document.createElement("span");
    name.textContent = player.name;

    const score = document.createElement("span");
    score.className = "score-label";
    score.textContent = `${player.score} pt`;

    item.append(name, score);
    elements.playerList.appendChild(item);
  });
}

function addPlayer() {
  const inputName = elements.playerNameInput.value.trim();
  if (!inputName) {
    setFeedback("Enter a player name first.", "lose");
    return;
  }

  const duplicate = state.players.some((player) => normalizeValue(player.name) === normalizeValue(inputName));
  if (duplicate) {
    setFeedback("That player name already exists.", "lose");
    return;
  }

  state.players.push({ name: inputName, score: 0 });
  elements.playerNameInput.value = "";
  setFeedback(`Added ${inputName}.`, "");
  renderPlayers();
  updateStatus();
  updateButtons();
}

function initializeAudio() {
  state.clueAudio = new Audio(CLUE_AUDIO_SRC);
  state.clueAudio.preload = "auto";
  state.clueAudio.addEventListener("error", () => {
    setFeedback("Could not load the Kannada MP3 clue.", "lose");
  });
}

function playClueAudio() {
  if (!state.clueAudio) {
    setFeedback("Audio is not ready yet.", "lose");
    return;
  }

  state.clueAudio.pause();
  state.clueAudio.currentTime = 0;

  const playPromise = state.clueAudio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch((error) => {
      setFeedback("Audio blocked by browser autoplay policy. Click Play Audio Clue.", "lose");
      console.error(error);
    });
  }
}

function startGame() {
  if (state.players.length === 0) {
    setFeedback("Add at least one player before starting.", "lose");
    return;
  }

  state.started = true;
  state.turn = 1;
  state.currentPlayerIndex = 0;
  state.canGuess = true;

  renderPlayers();
  updateStatus();
  updateButtons();
  setFeedback("Game started. Play the Kannada clue and click a country.", "");
  playClueAudio();
}

function resetScores() {
  state.players.forEach((player) => {
    player.score = 0;
  });

  state.turn = 1;
  state.currentPlayerIndex = 0;
  state.canGuess = state.started && state.players.length > 0;

  renderPlayers();
  updateStatus();
  setFeedback("Scores reset.", "");

  if (state.started && state.players.length > 0) {
    playClueAudio();
  }
}

function nextTurn() {
  if (!state.started || state.players.length === 0) {
    return;
  }

  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  state.turn += 1;
  state.canGuess = true;

  renderPlayers();
  updateStatus();
  playClueAudio();
}

function handleCountrySelection(feature) {
  if (!state.started) {
    setFeedback("Start the game first.", "lose");
    return;
  }

  if (!state.canGuess) {
    return;
  }

  state.canGuess = false;

  const currentPlayer = state.players[state.currentPlayerIndex];
  const countryName = getCountryName(feature);

  if (isIndia(feature)) {
    currentPlayer.score += 1;
    setFeedback(`${currentPlayer.name}: correct. +1 point for ${TARGET_COUNTRY}.`, "win");
  } else {
    setFeedback(`${currentPlayer.name}: ${countryName} is not ${TARGET_COUNTRY}. No point.`, "lose");
  }

  renderPlayers();
  updateStatus();

  window.setTimeout(() => {
    nextTurn();
  }, 1250);
}

function createMap() {
  state.map = L.map("map", {
    minZoom: 2,
    worldCopyJump: true,
  }).setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 7,
  }).addTo(state.map);
}

async function loadCountries() {
  setFeedback("Loading map data...", "");

  try {
    const response = await fetch(GEOJSON_URL);
    if (!response.ok) {
      throw new Error(`GeoJSON load failed (${response.status}).`);
    }

    const geojson = await response.json();

    state.countryLayer = L.geoJSON(geojson, {
      style: {
        color: "#456788",
        weight: 1,
        fillColor: "#b2c9df",
        fillOpacity: 0.5,
      },
      onEachFeature: (feature, layer) => {
        layer.on("mouseover", () => {
          layer.setStyle({ fillColor: "#ff6b35", fillOpacity: 0.7 });
        });

        layer.on("mouseout", () => {
          state.countryLayer.resetStyle(layer);
        });

        layer.on("click", () => {
          handleCountrySelection(feature);
        });
      },
    }).addTo(state.map);

    state.map.fitBounds(state.countryLayer.getBounds(), { padding: [12, 12] });
    setFeedback("Map ready. Add players and start the game.", "");
  } catch (error) {
    setFeedback("Could not load country shapes. Refresh after checking internet access.", "lose");
    elements.statusText.textContent = "Map data failed to load.";
    console.error(error);
  }
}

function bindEvents() {
  elements.addPlayerButton.addEventListener("click", addPlayer);
  elements.startGameButton.addEventListener("click", startGame);
  elements.playClueButton.addEventListener("click", () => {
    if (!state.started) {
      setFeedback("Start the game first.", "lose");
      return;
    }
    playClueAudio();
  });

  elements.resetScoresButton.addEventListener("click", resetScores);

  elements.playerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addPlayer();
    }
  });
}

function initialize() {
  renderPlayers();
  updateStatus();
  updateButtons();
  initializeAudio();
  bindEvents();
  createMap();
  loadCountries();
}

initialize();
