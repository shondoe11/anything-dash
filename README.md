# React Project

Anything-Dash

## MVP - Minimum Viable Product
* 5 components
* 4 props
* 2 useState
* 2 React router routes
* 1 lifting state

## Project Planning

### Idea 
- Dashboard of things, modular widget concept goal, mobile first layout

### Stories
- As user, I want to be greeted with my to-do list (by default) on the homepage (3 sections): 
    a. New Tasks (Buttons: Create, Edit, Delete) 
    b. Overdue Tasks (Buttons: Edit, Done) * hide if none
    c. Ongoing Tasks (Buttons: Edit, Done)
* Layout: Center of page
- As user, I want to see a Weather section above my to-do list:
    a. Current Weather by country,  (max display 2 countries via user preference. data pulled from WeatherAPI.com. user preference -> stored in my airtable)
    b. Current Weather by Singapore region (west,east,central,north,south) (max displat 2 regions vis user preference. data pulled from NEAweather API. user preference -> stored airtable)
    c. Current Weather by 


Coin Display
(user able to select currencies, cointype ) -> saved preference stored in airtable

Jikan Anime
- User add to todolist -> data stored in airtable


3. APIs confirmed by Bruno:
- WeatherAPI [exp 4 Feb, calls/month = 5M]
- CoinGecko [no exp, calls/month =  1/10K(replenish 1st of month), req/min = 30]
- API-sports: API-football.com [exp 23 Jan 2026, typeof sport/req/day = 100]
- NEA Weather
- Jikan Anime
- Lyrics.ovh


4. wireframe -> Components
   1. Page (/src/pages) -> Component (/src/components)
   2. inside page -> nested components
   3. RESTful url -> page

### URLs

<!-- - /pets -> AllPetsPage (PetList -> GET all pets)
- /pets/:petId -> OnePetPage (Pet -> Get 1 pet)
- /pets/new -> NewPetPage (Form -> POST pet)
- /pets/:petId/edit -> EditPetPage -->

Do this using react-router / setup debug

## Server Back-end

Use JSON Server -> Mock API will be used if i am hosting any json data (that doesn't need to be updated)

touch `db.json`










### Components

Components = Data -> JSX

State / props?

Fetch Data? when?

- onload
- click button



## All Pets

All pets needs to fetch data (background) to show list the of pets

fetch -> state -> array of pets

### JSX

mock the state using useState([])

use the state to create the JSX

### Doing the fetch

Search "using fetch in mdn" -> boilerplate code -> copy and modify the URL

### Do fetch click button

call the fetch function -> setState()

### Do fetch in background

useEffect() -> create the fetch function call it in side -> [] -> do it once

### Org and cleanup

fetch -> service

## Create Pet

### Already Done

- wireframe -> form is visible
- routing is done -> /pets/new

### Happy Story

- User goes pets/new by clicking the "New Pet" button
- User fill in the form
- User click the Add
- User will go back to list -> see the new pet there

### Sad Story

when errors, stay on the same page

### Intent

reproduce what bruno did but using JS

JS -> `http://localhost:3000/pets` + POST + Body payload

