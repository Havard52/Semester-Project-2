import { API_KEY } from './auth.mjs';

const baseURL = "https://v2.api.noroff.dev/";
const queryParams = new URLSearchParams(window.location.search);
const username = queryParams.get("user");

const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userCredits = document.getElementById("userCredits");
const userListingsContainer = document.querySelector(".user-listings");
const updateForm = document.getElementById("updateProfileForm");
const avatarInput = document.getElementById("avatarUrl");
const bannerInput = document.getElementById("bannerUrl");
const bioInput = document.getElementById("bio");

// get current user
const storedUser = localStorage.getItem("ans_user");
const token = localStorage.getItem("ans_token");
const currentUser = storedUser ? JSON.parse(storedUser) : null;

// Rate limit cache 
let lastProfileFetch = 0;
const PROFILE_INTERVAL = 30 * 1000; 
let cachedProfile = null;

// Fetching the profil data
async function fetchProfile(name) {
  const now = Date.now();
  if (cachedProfile && now - lastProfileFetch < PROFILE_INTERVAL) {
    return cachedProfile;
  }

  try {
    const res = await fetch(`${baseURL}auction/profiles/${name}?_listings=true&_wins=true`, {
      headers: currentUser
        ? { "Authorization": `Bearer ${token}`, "X-Noroff-API-Key": API_KEY }
        : { "X-Noroff-API-Key": API_KEY }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.message || "Could not fetch profile.");

    cachedProfile = data.data;
    lastProfileFetch = now;
    return cachedProfile;
  } catch (err) {
    console.error(err);
    alert("Could not fetch profile. Please try again later.");
    return null;
  }
}

// Rendering the profile data
function renderProfile(profile) {
  userAvatar.src = profile.avatar?.url || "default-avatar.jpg";
  userName.textContent = profile.name;
  userCredits.textContent = `${profile.credits || 0} credits`;
     bioInput.value = profile.bio || "";
  avatarInput.value = profile.avatar?.url || "";
  bannerInput.value = profile.banner?.url || "";

  if (currentUser && currentUser.name === profile.name) updateForm.style.display = "block";
  else updateForm.style.display = "none";

  userListingsContainer.innerHTML = "";
    profile.listings.forEach(listing => {
    const card = document.createElement("div");
    card.classList.add("card", "mb-3");
    card.style.flex = "0 1 calc(30% - 1rem)";
    card.innerHTML = `
      <img src="${listing.media[0]?.url || 'default-image.jpg'}" class="card-img-top" alt="${listing.title}">
      <div class="card-body">
        <h5>${listing.title}</h5>
        <p>${listing.description || ''}</p>
        <p>Ends at: ${new Date(listing.endsAt).toLocaleString()}</p>
      </div>
    `;
    userListingsContainer.appendChild(card);
  });
}

// update profile
updateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return alert("You must be logged in to update your profile.");

  const payload = {
    bio: bioInput.value,
    avatar: { url: avatarInput.value, alt: "" },
    banner: { url: bannerInput.value, alt: "" }
  };

  try {
    const res = await fetch(`${baseURL}auction/profiles/${currentUser.name}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.message || "Could not update profile.");
    alert("Profile updated successfully!");
    cachedProfile = data.data; 
    renderProfile(data.data);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}) 
;

// Init
async function init() {
  if (!username) return alert("No username specified in query.");
  const profileData = await fetchProfile(username);
  if (profileData) renderProfile(profileData);
}

init();
