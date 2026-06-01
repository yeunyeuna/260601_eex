const API_URL = "https://pokeapi.co/api/v2/pokemon";

const searchInput     = document.querySelector("#search-input");
const searchBtn       = document.querySelector("#search-btn");
const resultContainer = document.querySelector("#result-container");

// ===== Quick tag 클릭 이벤트 =====
document.querySelectorAll(".tag").forEach(tag => {
  tag.addEventListener("click", () => {
    const name = tag.dataset.name;
    searchInput.value = name;
    searchPokemon(name);
  });
});

// ===== BOM Audio =====
function playPokemonCry(cryUrl) {
  if (!cryUrl) return;
  const audio = new Audio(cryUrl);
  audio.volume = 0.4;
  audio.play().catch(err => console.error("울음소리 재생 실패:", err));
}

// ===== DOM Builders =====
function clearContainer(el) { el.innerHTML = ""; }

function createTypeBadgeNode(typeName) {
  const badge = document.createElement("span");
  badge.className = `type-badge bg-${typeName}`;
  badge.textContent = typeName;
  return badge;
}

function createStatItemNode(label, value) {
  const item = document.createElement("div");
  item.className = "stat-item";
  const valSpan = document.createElement("span");
  valSpan.className = "stat-value";
  valSpan.textContent = value;
  const lblSpan = document.createElement("span");
  lblSpan.className = "stat-label";
  lblSpan.textContent = label;
  item.appendChild(valSpan);
  item.appendChild(lblSpan);
  return item;
}

function showPlaceholderCard(container, emoji, message, description = "") {
  clearContainer(container);
  const card = document.createElement("div");
  card.className = "result-card";

  const isUrl = emoji.startsWith("http") || emoji.startsWith("/") || emoji.startsWith(".");
  if (isUrl) {
    const imgDiv = document.createElement("div");
    imgDiv.className = "poke-img";
    const img = document.createElement("img");
    img.src = emoji;
    imgDiv.appendChild(img);
    card.appendChild(imgDiv);
  } else {
    const emojiDiv = document.createElement("div");
    emojiDiv.className = "placeholder-emoji";
    emojiDiv.textContent = emoji;
    card.appendChild(emojiDiv);
  }

  const msg = document.createElement("div");
  msg.className = "placeholder-msg loading";
  msg.textContent = message;
  card.appendChild(msg);

  if (description) {
    const desc = document.createElement("p");
    desc.className = "placeholder-desc";
    desc.innerHTML = description;
    card.appendChild(desc);
  }

  container.appendChild(card);
}

// ===== Pokemon Card Builder =====
function createPokemonCardNode(pokemon) {
  const card = document.createElement("div");
  card.className = "result-card";

  // 1. Image
  const imgDiv = document.createElement("div");
  imgDiv.className = "poke-img";
  const img = document.createElement("img");
  img.src = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;
  img.alt = pokemon.name;
  imgDiv.appendChild(img);

  // 2. Name & ID
  const nameDiv = document.createElement("div");
  nameDiv.className = "poke-name";
  nameDiv.textContent = pokemon.name;
  const idSpan = document.createElement("span");
  idSpan.className = "poke-id";
  idSpan.textContent = `#${String(pokemon.id).padStart(4, "0")}`;
  nameDiv.appendChild(idSpan);

  // 3. Type badges
  const typesDiv = document.createElement("div");
  typesDiv.className = "poke-types";
  pokemon.types.forEach(item => typesDiv.appendChild(createTypeBadgeNode(item.type.name)));

  // 4. Stats
  const statsDiv = document.createElement("div");
  statsDiv.className = "poke-stats";
  statsDiv.appendChild(createStatItemNode("Height", `${pokemon.height / 10}m`));
  statsDiv.appendChild(createStatItemNode("Weight", `${pokemon.weight / 10}kg`));

  // 5. Cry button
  const cryUrl = pokemon.cries && pokemon.cries.latest;
  const cryBtn = document.createElement("button");
  cryBtn.className = "cry-btn";
  if (cryUrl) {
    cryBtn.innerHTML = "🔊 울음소리 듣기";
    cryBtn.addEventListener("click", () => playPokemonCry(cryUrl));
  } else {
    cryBtn.innerHTML = "🔇 울음소리 없음";
    cryBtn.disabled = true;
  }

  card.appendChild(imgDiv);
  card.appendChild(nameDiv);
  card.appendChild(typesDiv);
  card.appendChild(statsDiv);
  card.appendChild(cryBtn);
  return card;
}

// ===== URL Hash Sync =====
function syncUrlHash(hashValue) {
  if (window.location.hash.substring(1) !== hashValue) {
    window.location.hash = hashValue;
  }
}

// ===== Search =====
async function searchPokemon(pokemonName) {
  const name = pokemonName.trim().toLowerCase();
  if (!name) return;

  showPlaceholderCard(resultContainer, "⏳", "불러오는 중…");

  try {
    const response = await axios.get(`${API_URL}/${name}`);
    clearContainer(resultContainer);
    resultContainer.appendChild(createPokemonCardNode(response.data));
    syncUrlHash(name);
  } catch (error) {
    console.error("Pokemon Search Error:", error);
    showPlaceholderCard(
      resultContainer,
      "❌",
      "찾을 수 없어요",
      `"${name}"은(는) 존재하지 않는 포켓몬이에요.<br>영문명을 다시 확인해 주세요.`
    );
  }
}

function handleSearchTrigger() { searchPokemon(searchInput.value); }

// ===== Event Bindings =====
searchBtn.addEventListener("click", handleSearchTrigger);
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") handleSearchTrigger(); });

window.addEventListener("hashchange", () => {
  const hashName = window.location.hash.substring(1);
  if (hashName) { searchInput.value = hashName; searchPokemon(hashName); }
});

window.addEventListener("DOMContentLoaded", () => {
  const initialHash = window.location.hash.substring(1);
  if (initialHash) {
    searchInput.value = initialHash;
    searchPokemon(initialHash);
  } else {
    showPlaceholderCard(resultContainer, "🔍", "포켓몬을 검색해 보세요", "위 버튼을 눌러 빠르게 검색할 수도 있어요!");
  }
});
