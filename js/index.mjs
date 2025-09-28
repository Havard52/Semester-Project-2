const baseURL = "https://v2.api.noroff.dev/";
let allAuctions = []; 
let currentIndex = 0; 

const feed = document.querySelector(".feedCointainer");

// Load more button
const loadMoreBtn = document.createElement("button");
loadMoreBtn.textContent = "Load 24 More";
loadMoreBtn.classList.add("btn", "btn-primary", "mt-3", "load-more-btn");
loadMoreBtn.style.display = "none"; 
feed.after(loadMoreBtn);

async function fetchAuctions() {
  try {
    const response = await fetch(`${baseURL}auction/listings`);
    const data = await response.json();
    allAuctions = data.data; 
    displayNextCards(12); 

  } catch (error) {
    console.error("Error fetching auctions:", error);
  }
}

// Function for next cards
function displayNextCards(count) {
  const nextItems = allAuctions.slice(currentIndex, currentIndex + count);
  nextItems.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("card", "d-flex", "flex-column", "align-items-center", "mb-3");
    card.style.flex = "0 1 calc(33% - 1rem)"; 
    card.innerHTML = `
      <div class="card-body text-center">
        <h5 class="card-title">${item.title}</h5>
        <p>Ends at: ${item.endsAt}</p>
        <img src="${item.media[0]?.url || 'default-image.jpg'}" alt="${item.title}" class="card-img-top mb-2">
        <p>${item.description || ''}</p>
      </div>
    `;
    feed.appendChild(card);
  });

  currentIndex += nextItems.length;

  // If there are more items to load, show the button
  if (currentIndex < allAuctions.length) {
    loadMoreBtn.style.display = "block";
  } else {
    loadMoreBtn.style.display = "none"; 
  }
}

// Click event for load more button
loadMoreBtn.addEventListener("click", () => {
  displayNextCards(24);
});

fetchAuctions();