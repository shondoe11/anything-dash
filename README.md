# React Project

Anything-Dash

## MVP - Minimum Viable Product
* 5 components
* 4 props
* 2 useState
* 2 React router routes
* 1 lifting state

## Timeline
1 Week

## Tech Stack
- HTML
- CSS
- JavaScript
- React + Vite
- Bruno (testing APIs)
- Airtable (data collection)
- Git + GitHub
- Additional tools/libraries in the [Attributions](#Attributions) section.

## Project Planning

### Idea 
- Dashboard of things, modular widget concept goal, currently desktop screen ready

### Stories (State)
#### To-Do List
- **As a user, I want to be greeted with my to-do list on the homepage (4 sections):**
  - **New Tasks:**  
    Input Field: New Task
    Input Field: Due Date (if any)
    Button: `Create`
  - **Overdue Tasks:**  
    Buttons: `Edit`, `Done`, `Delete` (*hide this section if no overdue tasks*)
  - **Completed Tasks:**
    Buttons: `Edit`, `Delete`
  **`Done` means tasks get pushed to the Completed Tasks section**
  **All `Edit` buttons will render 2 Input Fields:**
    Input Field: Edit Task
    Input Field: Due Date (if any)
    Button: `Save`
  - To-do data must be saved in Airtable and retrieved on loading of the page.
  - Ability to hide the widget and re-enable it via a Navbar dropdown.
  - Ability to minimize each section
  - **Layout:** Center of the page.

---

#### Weather Section
- **As a user, I want to see a Weather section above my to-do list:**
  - **Current Weather by Country:**
    - Filter search option to change the country.  
    - Max display: 1–2 countries (based on user preferences, stored in Airtable).
    - Data pulled from `WeatherAPI.com`.
  - **4-Day Weather Forecast by Singapore Region:**
    - Regions: West, East, Central, North, South.
    - No search needed (limited to 4 regions).
    - Max display: 1–2 regions (user preference stored in Airtable).
    - Data pulled from `NEAweather API`.
  - **Current Weather by Singapore Town:**
    - Select dropdown for towns like Ang Mo Kio, Bedok, etc.  
    - Max display: 1–2 towns (user preference stored in Airtable).  
    - Data pulled from `NEAweather API`.
  - Ability to hide the widget and re-enable it via a Navbar dropdown.
  - **Layout:** Top of the page, arranged left-to-right (everything in 1 row):  
    - Current Weather by Country  
    - 4-Day Weather Forecast by Singapore Region  
    - Current Weather by Singapore Town.

---

#### Cryptocurrency Section
- **As a user, I want to see the latest Cryptocurrency data:**
  - Default display: Top 10 performing coins per page.  
    - Navigation: Flip pages using `<`, `>` keys or arrow clicks.
  - Ability to switch currencies via a filter search dropdown.
  - Ability to search for any coin type and return a single result.
  - Ability to hide the widget and re-enable it via a Navbar dropdown.
  - Data pulled from `CoinGecko API`.
  - All preferences saved to Airtable.
  - **Layout:** Left side of the page (next to the to-do list).

---

#### Football Fixtures
- **As a user, I want to see the latest football fixtures of the current season:**
  - Limited to the top 20 positions on the leaderboard (API restriction).
  - Ability to switch between all competitions available via filter options (e.g., Premier League, Bundesliga, etc.).
  - Ability to hide the widget and re-enable it via a Navbar dropdown.
  - Data pulled from `Football-Data API`.
  - Preferences saved to Airtable.
  - **Layout:** Right side of the page (next to the to-do list).

---

#### Anime Recommendations
- **As a user, I want to see the latest anime recommendations from MyAnimeList:**
  - Display: Top 10 recommended animes.
  - Navigation: Click left/right arrows to navigate to previous/next sets of 10.
  - Ability to hide the widget and re-enable it via a Navbar dropdown.
  - Ability to add an anime to the Todolist
  - Data pulled from `Jikan Anime API`.
  - **Layout:** Bottom of the page in a horizontal carousel format (below the to-do list).

---

#### Lyrics Search (Bonus)
- **As a user, I want to see a fieldset containing 2 search fields:**
  - **Search Field 1:** Artist name.
  - **Search Field 2:** Song name.
  - **Search Button:**  
    - Ties both search fields to pull data from the API.  
    - User should also be able to hit `Enter` to execute the search.
  - **Search Results:**  
    - Displayed in a pop-up, including the song's lyrics.
  - **Layout:** Bottom of the page, between the to-do list and anime recommendations.

---

#### Feedback Form
- **As a user, I want to see a feedback option in the Navbar:**
  - Opens a controlled form in a popup with the following fields:
    - **Name** (required): Input field.
    - **Email** (required): Input field.
    - **Date of Birth** (optional): Input field.
    - **Rating Scale** (required): 1–5 stars.
    - **What could be improved?** (required): Input field.
    - **Bug Report** (optional): Input field.
    - **Additional Feedback** (optional): Input field.

---

#### Drag & Drop (Bonus)
- **As a user, I want the ability to drag & drop widgets anywhere on the page:**
  - Widgets should also retain their show/hide options via the Navbar.


### Wireframe -> Components
```
src/
├── components/
│   ├── Layout/
│   │   └── Navbar.jsx
│   └── UI/
│       └── Pagination/
│           ├── Pagination.jsx
│           └── Pagination.module.css
├── services/
│   └── service.js
├── widgets/
│   ├── Todo/
│   │   ├── TodoWidget.jsx
│   │   ├── TodoWidget.module.css
│   ├── Weather/
│   │   ├── WeatherWidget.jsx
│   │   └── WeatherWidget.module.css
│   ├── Crypto/
│   │   ├── CryptoWidget.jsx
│   │   └── CryptoWidget.module.css
│   ├── Football/
│   │   ├── FootballWidget.jsx
│   │   └── FootballWidget.module.css
│   └── Anime/
│   │   ├── AnimeWidget.jsx
│   │   └── AnimeWidget.module.css
├── pages/
│   ├── Dashboard.jsx
│   ├── TodoPage.jsx
│   ├── WeatherPage.jsx
│   ├── CryptoPage.jsx
│   ├── FootballPage.jsx
│   └── AnimePage.jsx
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```
#### 1. App
**Purpose:** Highest-level component wraps the entire application.  
**Key responsibilities:**
- Provide global context or providers (React Router, theme context, user preferences context, etc.).
- Render the Navbar/Header, MainContent (using `<Routes />`), and an optional Footer.

---

#### 2. Layout Components

##### **Navbar**
- **Show/Hide toggles:** Contains controls (toggles, buttons) to show or hide each widget (Todo, Weather, Crypto, Football, Anime, Lyrics).
- **Feedback:** Links to `/anything/feedback` route or opens a modal.

##### **MainContent**
- Contains the main routed components (Dashboard, Weather, Crypto, etc.).
- Responsible for applying layout or styling that is consistent across all pages.

##### **Footer (optional)** *for future updates*
- Any global footer information (e.g., copyright, disclaimers, etc.).

---

#### 3. Dashboard Page ( `/anything` )
**Purpose:** The drag & drop board showing each widget in modular cards.

##### **Drag & Drop:** *for future updates*
- A `WidgetContainer` or `Board` component that manages the positions of each widget.
- Use library (e.g., `react-beautiful-dnd`, `react-grid-layout`, or `react-dnd`) to allow users to rearrange widgets.
- Saves layout preferences (widget order, positions) in Airtable so the arrangement persists on reload.

##### **Widgets**  
**(Shown or hidden based on user’s stored preferences in Airtable):**
- **WeatherWidget:**  
  Internally break out into `<CurrentWeatherByCountry />`, `<FourDayForecast />`, `<TownWeather />`, etc.
- **ToDoWidget:**  
  Shows New, Overdue, Completed tasks.
- **CryptoWidget:**  
  Shows top 10 coins, currency filter, search for specific coin.
- **FootballWidget:**  
  Shows competition standings, user can switch competitions.
- **AnimeWidget:**  
  Top 10 recommended animes, next/previous pagination.
- **LyricsWidget (Bonus):**  
  Search fields for artist + song, displays pop-up with lyrics.

---

##### 4. Dedicated Widget Pages
Each widget is displayed on the Dashboard, but dedicated routes show each widget’s info in more depth:

##### **WeatherPage** (`/anything/weather`)
- Extended weather details, additional search filters, or advanced data.
- Could display multiple countries or more in-depth forecast data.

##### **TodoPage** (`/anything/todo`)
- Dedicated page for viewing and managing tasks.
- **TodoEditPage** (`/anything/todo/:todoId/edit`) for editing a single todo.

##### **CryptoPage** (`/anything/crypto`)
- More detailed crypto stats, historical data charts, or advanced filters.

##### **FootballPage** (`/anything/football`)
- Extended standings, match fixtures, stats, or multiple leagues.

##### **AnimePage** (`/anything/anime`)
- Advanced search, filtering by genre, or more detailed anime info.

##### **LyricsPage** (`/anything/lyrics`)
- Advanced music search, highlight lyrics, or display multiple possible matches.

---

#### 5. FeedbackForm
**Accessed via:**
- Navbar button that opens a modal.
- Dedicated route: `/anything/feedback`.

##### **Form Fields:**
- Name, Email, Date of Birth, Rating scale, improvement ideas, bug reports, additional feedback.

**Submission:** Store the feedback in Airtable.

---

#### 6. Additional Components / Utilities
- **DragDropContext** or equivalent from a chosen DnD library.
- **Widget Base Component:** Each widget extends this to reuse styling or logic for drag & drop, show/hide toggles, etc.
- **ErrorBoundary** or **NotFound Page:** Handles unexpected errors or unknown routes.

---

### URLs

#### **Dashboard (Main Drag & Drop):**
`/anything`
- Displays the main board with all widgets in a draggable layout.

#### **To-Do:**
`/anything/todo`
- Dedicated page for viewing and managing tasks.
`/anything/todo/new`
- Dedicated page for starting a new task.
`/anything/todo/edit`
- Dedicated page for editing tasks in a list.

#### **Weather:**
`/anything/weather`
- Extended weather view: advanced forecast, multiple countries, or additional data.

#### **Crypto:**
`/anything/crypto`
- Dedicated page for more detailed crypto charts, advanced filtering, historical data.

#### **Football:**
`/anything/football`
- Focused view on leagues, standings, fixtures, etc.

#### **Anime:**
`/anything/anime`
- More detailed anime browsing, search, or recommendations.

#### **Lyrics:**
`/anything/lyrics` *for future updates*
- Focused search for song lyrics, advanced queries, or multiple result displays.

#### **Feedback:**
`/anything/feedback` *for future updates*
- Displays the feedback form page or triggers a popup.

#### **404 / NotFound:**
- Catch-all for routes not defined above.

---

### Drag & Drop Considerations *for future updates*

#### **Local vs. Airtable Storage:**
- The user’s widget arrangement (and show/hide preferences) can be saved in Airtable, ensuring that the layout persists across sessions.

#### **Implementation:**
- Use a library like `react-beautiful-dnd`, `react-dnd`, or `react-grid-layout` to enable drag & drop.
- A top-level `<DragDropContext>` in the `DashboardPage` manages widget ordering and positions.

#### **Widget Switching:**
- Users can drag widgets around or hide them via the Navbar toggles.
- Dedicated page routes for each widget offer deeper detail without losing the user’s board arrangement on the main dashboard.

---

## Attributions

All assets used in this project are credited to their respective original sources.

### Libraries & Dependencies
- [Font Awesome](https://fontawesome.com/) - Icons (`@fortawesome/fontawesome-free`, `@fortawesome/react-fontawesome`)
- [React](https://react.dev/) - Frontend framework (`react`, `react-dom`)
- [React Router](https://reactrouter.com/) - Routing (`react-router`, `react-router-dom`)
- [React Toastify](https://fkhadra.github.io/react-toastify/) - Toast notifications (`react-toastify`)
- [React Paginate](https://www.npmjs.com/package/react-paginate) - Pagination component (`react-paginate`)
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library (`react-icons`)
- [Pure React Carousel](https://www.npmjs.com/package/pure-react-carousel) - Carousel component (`pure-react-carousel`)
- [React Bootstrap](https://react-bootstrap.netlify.app/) - UI components (`react-bootstrap`)


### APIs & Data Sources
- [WeatherAPI](https://www.weatherapi.com/) - Weather data
- [NEA Weather](https://www.nea.gov.sg/weather) - Singapore weather forecast
- [CoinGecko](https://www.coingecko.com/) - Cryptocurrency prices
- [Football-Data API](https://www.football-data.org/) - Football fixtures & standings
- [Jikan API](https://jikan.moe/) - Anime recommendations
- [Lyrics.ovh](https://lyricsovh.docs.apiary.io/) - Song lyrics

### Tools & Resources
- [Bruno](https://www.usebruno.com/) - API testing
- [Airtable](https://airtable.com/) - Data storage
- [GitHub](https://github.com/) - Version control & hosting
