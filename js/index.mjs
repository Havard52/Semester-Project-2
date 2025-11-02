import { API_KEY } from './auth.mjs';

const baseURL = "https://v2.api.noroff.dev/";
let allAuctions = [];
let currentIndex = 0;

const feed = document.querySelector(".feedCointainer");
const loadMoreBtn = document.createElement("button");
loadMoreBtn.textContent = "Load 24 More";
loadMoreBtn.classList.add("btn", "btn-primary", "mt-3", "load-more-btn");
loadMoreBtn.style.display = "none";
feed.after(loadMoreBtn);

const newListingSection = document.getElementById("newListingSection");
const storedUser = localStorage.getItem("ans_user");
const token = localStorage.getItem("ans_token");
let currentUser = storedUser ? JSON.parse(storedUser) : null;

// Header update
function updateHeader() {
  const userInfo = document.getElementById("user-info");
  if (!currentUser) {
    userInfo.innerHTML = `<a href="login.html" class="btn btn-outline-light">Log in</a>`;
    return;
  }

  //user get link to bio page and logut btn
  userInfo.innerHTML = `
    <a href="user.html?user=${encodeURIComponent(currentUser.name)}">
      <span class="fw-bold me-2">${currentUser.name}</span>
    </a>
    <button id="logoutBtn" class="btn btn-outline-light">Logout</button>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });
}

updateHeader();
if (currentUser && newListingSection) newListingSection.style.display = "block";

// Filter
const filterSelect = document.getElementById("filterSelect");
const userSearchInput = document.getElementById("userSearchInput");
const filterForm = document.getElementById("filterForm");

filterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  currentIndex = 0;
  let filteredAuctions = [...allAuctions];

  const filterValue = filterSelect.value;
  const userQuery = userSearchInput.value.trim().toLowerCase();

  if (filterValue === "newest") filteredAuctions.sort((a,b) => new Date(b.created) - new Date(a.created));
  else if (filterValue === "endsSoon") filteredAuctions.sort((a,b) => new Date(a.endsAt) - new Date(b.endsAt));
  else if (filterValue === "user" && userQuery) filteredAuctions = filteredAuctions.filter(a => a.seller?.name.toLowerCase() === userQuery);

  feed.innerHTML = "";
  displayCards(filteredAuctions);
});

//  Rate-limited fetch auctions
let lastFetchTime = 0;
const FETCH_INTERVAL = 30 * 1000; 

async function fetchAuctions() {
  const now = Date.now();
  if (now - lastFetchTime < FETCH_INTERVAL && allAuctions.length > 0) {
    console.log("Using cached auctions to prevent rate-limit");
    displayNextCards(12);
    return;
  }

  try {
    const res = await fetch(`${baseURL}auction/listings?_seller=true&_bids=true`, {
      headers: { "X-Noroff-API-Key": API_KEY }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.message || "Failed to fetch auctions");

    allAuctions = data.data.sort((a,b) => new Date(b.created) - new Date(a.created));
    lastFetchTime = now;
    displayNextCards(12);
  } catch (err) {
    console.error("Error fetching auctions:", err);
    alert("Could not fetch auctions. Please try again later.");
  }
}

// Display cards
function displayNextCards(count) {
  const nextItems = allAuctions.slice(currentIndex, currentIndex + count);
  displayCards(nextItems);
  currentIndex += nextItems.length;
  loadMoreBtn.style.display = currentIndex < allAuctions.length ? "block" : "none";
}

function displayCards(items) {
  items.forEach(item => {
    const bids = (item.bids || []).sort((a,b) => b.amount - a.amount);
    const bidsHTML = bids.map(bid => `
      <div class="d-flex justify-content-between mb-1">
        <span>${bid.bidder.name}</span>
        <span>${bid.amount} credits</span>
      </div>
    `).join("");

    const card = document.createElement("div");
    card.classList.add("card", "d-flex", "flex-column", "mb-3");
    card.style.flex = "0 1 calc(33% - 1rem)";
    card.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>${item.title}</span>
        <div class="d-flex align-items-center">
          <a href="user.html?user=${encodeURIComponent(item.seller?.name)}">
            <img src="${item.seller?.avatar?.url || 'default-avatar.jpg'}" alt="Avatar" class="rounded-circle me-2" style="width:32px;height:32px;">
            <span class="fw-bold">${item.seller?.name || 'Unknown'}</span>
          </a>
        </div>
      </div>
      <img src="${item.media[0]?.url || 'default-image.jpg'}" alt="${item.title}" class="card-img-top">
      <div class="card-body">
        <p>${item.description || ''}</p>
        <p>Ends at: ${new Date(item.endsAt).toLocaleString()}</p>
        <h6>Bids:</h6>
        <div class="bids-list mb-2">${bidsHTML || '<span>No bids yet</span>'}</div>

        ${currentUser && item.seller?.name !== currentUser.name ? `
        <form class="bid-form d-flex">
          <input type="number" min="${(bids[0]?.amount || 0) + 1}" class="form-control me-2" placeholder="Your bid" required>
          <button class="btn btn-success" type="submit">Place Bid</button>
        </form>` : ''}

        ${currentUser && item.seller?.name === currentUser.name ? `
          <button class="btn btn-danger delete-btn mt-2">Delete Listing</button>` : ''}
      </div>
    `;

    feed.appendChild(card);
  });
}

loadMoreBtn.addEventListener("click", () => displayNextCards(24));

// Create your own listing
if (newListingSection) {
  const newListingForm = document.getElementById("newListingForm");
  newListingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const title = document.getElementById("listingTitle").value;
    const endsAt = document.getElementById("listingEndsAt").value;
    const mediaUrl = document.getElementById("listingMedia").value;
    const description = document.getElementById("listingDescription").value;

    try {
      const res = await fetch(`${baseURL}auction/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Noroff-API-Key": API_KEY
        },
        body: JSON.stringify({
          title,
          endsAt,
          media: [{ url: mediaUrl, alt: title }],
          description
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.errors?.[0]?.message || "Could not create listing.");
      alert("Listing created!");
      fetchAuctions(); 
    } catch (err) {
      alert(err.message);
    }
  });
}

fetchAuctions();
