# Semester-Project-2 - "Auction network society"
A new fictional auction webside. Users can  create listings and participate in auctions by bidding on other users’ items.

The project is built using **HTML, CSS (Bootstrap & Sass), and JavaScript (ES Modules)**.

## Features
- User registration and login with JWT 
- Create new auction listings with media.
- View active listings with real-time bidding information
- Place bids on other userslistings
- Delete your own listings.
- Filter auctions by, newest, ending soon, or by user
- Pagination of auction  listings
- Responsive UI built with Bootstrap 5
- Rate-limited fetching to prevent API overuse


## Installation & Setup (Local)

Follow these steps to run the project locally on your machine. OBS. you need Node.js.

### 1. Clone the repository
git clone https://github.com/Havard52/Semester-Project-2.git

### 2. Install dependencies
Run in terminal:

npm install

This will install:
Bootstrap 5
Sass
PostCSS and Autoprefixer

### 3. Configure API Key

The project uses the Noroff API. Open auth.mjs and ensure your API key is set:
export const API_KEY = 'YOUR_API_KEY_HERE';
You also need to register and log in via frontend forms to get a valid access token.

### 4. Run a local development server

Since the project uses ES modules (.mjs), you need a local server to serve the files.
Using Node.js http-server:
Install globally if you don't use it.

in terminal run:

npm install -g http-server


Start the server in the project directory:

http-server -c-1

Open your browser at http://localhost:8080 (default port).
Using VS Code Live Server:
Open the project in VS Code.
Right-click index.html → Open with Live Server
The project will open in your default browser.

Good luck!!