# News Aggregator API

A simple Node.js Express API for user registration, authentication, user news preferences, and fetching news articles from an external API (NewsAPI).

## Features

- User registration with hashed passwords
- JWT-based authentication
- User login
- Set and update news preferences (categories, etc.)
- Fetch news articles based on user preferences
- Protected routes for user data and news
- Input validation and error handling

## Requirements

- Node.js (v14+ recommended)
- npm

## Setup

 

2. **Install dependencies:** 
   npm install
   ```

3. **Create a `.env` file in the project root:**
   ```
   JWT_SECRET=your_jwt_secret
   NEWS_API_KEY=your_newsapi_key
   ```

   - Get your NewsAPI key from [https://newsapi.org/](https://newsapi.org/).

4. **Run the server:** 
   node app.js 

## API Endpoints

### Auth

- **POST `/users/signup`**  
  Register a new user.  
  **Body:**  
  ```json
  {
    "name": "Clark Kent",
    "email": "clark@superman.com",
    "password": "Krypt()n8",
    "preferences": ["movies", "comics"]
  }
  ```

- **POST `/users/login`**  
  Login and receive a JWT