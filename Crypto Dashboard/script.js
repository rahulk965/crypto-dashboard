const INITIAL_COINS = [
  "bitcoin",
  "ethereum",
  "binancecoin",
  "solana",
  "cardano",
  "dogecoin",
  "polkadot",
  "avalanche",
  "chainlink",
];

const COIN_NAMES = {
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  binancecoin: "BNB",
  solana: "Solana",
  cardano: "Cardano",
  dogecoin: "Dogecoin",
  polkadot: "Polkadot",
  avalanche: "Avalanche",
  chainlink: "Chainlink",
};

let isDark = true;
let selectedDays = "1";
let coinData = {};
let coinLogos = {};
let coinGrowth = {};
let trending = [];
let showTrending = false;

document.getElementById("toggleMode").addEventListener("click", () => {
  isDark = !isDark;
  document.documentElement.classList.toggle("dark", isDark);
  document.body.className = isDark
    ? "bg-gray-950 text-white p-6"
    : "bg-gray text-gray-900 p-6";
  document.getElementById("toggleMode").textContent = isDark
    ? "Light Mode"
    : "Dark Mode";
  renderCoins();
});

document.getElementById("timeRange").addEventListener("change", (e) => {
  selectedDays = e.target.value;
  fetchAll();
});

document.getElementById("trendingToggle").addEventListener("click", () => {
  showTrending = !showTrending;
  document.getElementById("trendingToggle").textContent = showTrending
    ? "Back to Market"
    : "View Trending Coins";
  renderCoins();
});

document.getElementById("searchInput").addEventListener("input", renderCoins);

async function fetchPrices() {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${INITIAL_COINS.join(
      ","
    )}&vs_currencies=usd`
  );
  coinData = await res.json();
}

async function fetchLogos() {
  for (const coin of INITIAL_COINS) {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`);
    const data = await res.json();
    coinLogos[coin] = data.image.thumb;
  }
}

async function fetchGrowth() {
  for (const coin of INITIAL_COINS) {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${selectedDays}`
    );
    const data = await res.json();
    const prices = data.prices.map((p) => p[1]);
    if (prices.length >= 2) {
      coinGrowth[coin] = ((prices.at(-1) - prices[0]) / prices[0]) * 100;
    }
  }
}

async function fetchTrending() {
  const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
  const data = await res.json();
  trending = data.coins;
}

function renderCoins() {
  const area = document.getElementById("contentArea");
  area.innerHTML = "";

  if (showTrending) {
    const trendingTitle = document.createElement("h2");
    trendingTitle.textContent = "Trending Coins";
    trendingTitle.className = "text-1xl font-bold mb-4";
    area.appendChild(trendingTitle);

    const grid = document.createElement("div");
    grid.className = "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

    trending.forEach(({ item }) => {
      const card = document.createElement("div");
      card.className = "bg-gray-900 shadow rounded-xl p-4 flex items-center gap-4";

      const img = document.createElement("img");
      img.src = item.thumb;
      img.alt = item.name;
      img.className = "w-8 h-8 rounded-full";

      const textDiv = document.createElement("div");
      textDiv.innerHTML = `<p class="font-semibold">${item.name}</p><p class="text-sm text-gray-400">${item.symbol.toUpperCase()}</p>`;

      card.appendChild(img);
      card.appendChild(textDiv);
      grid.appendChild(card);
    });

    area.appendChild(grid);
    return;
  }

  const search = document.getElementById("searchInput").value.toLowerCase();
  const filtered = INITIAL_COINS.filter((c) => c.includes(search));

  const grid = document.createElement("div");
  grid.className = "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  filtered.forEach((coin) => {
    const card = document.createElement("div");
    card.className = "bg-gray-900 shadow-xl rounded-2xl p-4";

    const header = document.createElement("div");
    header.className = "flex items-center gap-3 mb-2";

    const logo = document.createElement("img");
    logo.src = coinLogos[coin];
    logo.className = "w-6 h-6 rounded-full";

    const info = document.createElement("div");
    info.innerHTML = `<h2 class="text-xl font-semibold capitalize">${COIN_NAMES[coin]}</h2><p class="text-md text-gray-400">(${coin})</p>`;

    header.appendChild(logo);
    header.appendChild(info);

    const price = document.createElement("p");
    price.className = "text-2xl font-bold text-green-400 mb-1";
    price.textContent = `$${coinData[coin]?.usd?.toLocaleString() || "-"}`;

    const growth = document.createElement("p");
    const change = coinGrowth[coin];
    if (change !== undefined) {
      const daysLabel = selectedDays === "1" ? "1 Day" : `${selectedDays} Days`;
      growth.textContent = `${change > 0 ? "+" : ""}${change.toFixed(
        2
      )}% in ${daysLabel}`;
      growth.className = `mb-1 text-sm font-medium ${
        change > 0 ? "text-green-500" : "text-red-500"
      }`;
    }

    card.appendChild(header);
    card.appendChild(price);
    card.appendChild(growth);
    grid.appendChild(card);
  });

  area.appendChild(grid);
}

async function fetchAll() {
  const area = document.getElementById("contentArea");
  area.innerHTML = "<p class='text-center text-gray-400'>Loading data...</p>";
  await Promise.all([
    fetchPrices(),
    fetchLogos(),
    fetchGrowth(),
    fetchTrending(),
  ]);
  renderCoins();
}

fetchAll();
