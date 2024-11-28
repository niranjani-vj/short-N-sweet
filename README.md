
### Short-N-Sweet 🍬 
## - That's what she said!

A **Custom URL Shortener API** with advanced analytics, user authentication via Google Sign-In, and rate limiting. This system enables users to create short URLs for easier sharing of long URLs while grouping links under specific topics like **acquisition, activation, and retention**. The solution is dockerized for scalability and hosted on [Render](https://shortandsweet.onrender.com/).

---

## Objective 🎯

Design and implement a scalable URL Shortener API with the following features:

1. **Custom URL Shortening**: Generate short, memorable URLs for sharing.
2. **Google Sign-In**: Secure user authentication.
3. **Analytics**: Track usage for individual URLs, topics, and overall performance.
4. **Rate Limiting**: Prevent abuse of the shortening service.
5. **Cloud Deployment**: Dockerized for efficient cloud hosting.

---

## Tech Stack ⚙️

- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: Google Sign-In (JWT)
- **URL Shortener Logic**: Custom algorithm for URL shortening
- **Rate Limiting**: Custom rate limiting middleware
- **Analytics**: Track URL performance and categorize by topics
- **Deployment**: Dockerized for cloud deployment (Render)
- **CSS**: Custom styles with plain CSS
- **Frontend**: EJS for templating

---

## File Structure 📁

```
short&sweet/
├── config/
│   ├── db.js
│   └── redis.js
├── controllers/
│   ├── authController.js
│   └── urlController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── Click.js
│   ├── Link.js
│   └── User.js
├── node_modules/
├── public/
│   ├── css/
│   │   └── styles.css
│   └── user.png
├── routes/
│   ├── authRoutes.js
│   └── urlRoutes.js
├── views/
│   ├── partials/
│   │   ├── footer.ejs
│   │   └── header.ejs
│   ├── analytics_overall.ejs
│   ├── analytics_topic.ejs
│   ├── analytics_url.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── profile.ejs
│   └── short_urls.ejs
├── .dockerignore
├── .env
├── .gitignore
├── app.js
├── compose.yaml
├── Dockerfile
├── package-lock.json
├── package.json
├── README.Docker.md
└── README.md
```


## MongoDB Schemas 🗄️

### User Schema
- `google_id`: Unique identifier from Google.
- `email`: User email address.
- `name`: User's full name.
- `links`: Array of associated short URL IDs.

### Link Schema
- `short_id`: Unique identifier for the short URL.
- `long_url`: Original long URL.
- `topic`: Associated topic (e.g., acquisition).
- `owner`: Reference to the user who owns this link.
- `clicks`: Total number of clicks.
- `createdAt`: Creation timestamp.

### Click Schema
- `link_id`: Reference to the short URL.
- `user_agent`: Information about the user's device.
- `timestamp`: Click time.

---

## Sidebar Routes 🔗

- **Home**: `/`
- **Profile**: `/profile`
- **My Links**: `/api/manage_urls`
- **Analytics**:
  - **Urls**: `/api/urls`
  - **Topics**: `/api/analytics`
  - **Overview**: `/api/analytics/overall/<google_id>`

---

## Auth Routes 🚪

1. **Login**:
   - `GET /login`: Display login page.
   - `POST /login`: Handle login submission.
2. **Logout**:
   - `GET /logout`: Log out the user.
3. **Google Authentication**:
   - `POST /auth/google`: Authenticate using Google Sign-In.

---

## URL Management Routes 🌐

1. **Fetch Original URL**:
   - `GET /api/shorten/:shortUrl`: Retrieve the original URL for a given short URL.
2. **Create Short URL**:
   - `POST /api/shorten`: Generate a short URL.
3. **Fetch URL Details**:
   - `GET /api/links`: Retrieve detailed information about all URLs.
4. **Update URL Details**:
   - `PUT /api/link/:short_id`: Update the information for a specific URL.
5. **Delete URL**:
   - `DELETE /api/link/:short_id`: Remove a specific short URL.

---

## Analytics Routes 📊

1. **Short URL Analytics**:
   - `GET /api/analytics/:shortUrl`: Retrieve analytics for a specific short URL.
2. **Topic Analytics**:
   - `GET /api/analytics/topic/:topicName`: Retrieve analytics for a specific topic.
3. **Overall Analytics**:
   - `GET /api/analytics/overall/:id`: Retrieve overall analytics for a user.
4. **Fetch Topics**:
   - `GET /api/topics_list`: Retrieve the list of topics.
5. **Fetch URLs by Topic**:
   - `GET /api/analytics`: Display analytics grouped by topics.

---

## Deployment 🚀

This project is hosted on [Render](https://shortandsweet.onrender.com/) due to the need for card-less deployment options, as alternatives like AWS and Heroku require credit cards.

---

## Features Summary 🛠️
1. **Google Sign-In** with JWT for authentication.
2. **Dockerized Deployment** for scalability and cloud hosting.
3. Advanced **URL Analytics** grouped by topics and overall performance.
4. Rate-limited API to ensure service integrity.

---

## License 📜

This project is licensed under the MIT License.

---

## Postman Documentation 📑

For detailed API documentation, you can access the Postman collection using the link below:

[View Postman Documentation](https://documenter.getpostman.com/view/14643687/2sAYBXAqMf)

This documentation provides detailed information on all available endpoints, their methods, request parameters, and response formats.


---

**Live Demo**: [shortandsweet.onrender.com](https://shortandsweet.onrender.com/)
"""
