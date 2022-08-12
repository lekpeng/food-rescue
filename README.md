# Food Rescue

### Introduction
---
Food Rescue is a food-sharing site inspired by Olio, where users can easily give away and receive food that would have otherwise been thrown away.

### Link to Site
---
https://food-rescue-proj.herokuapp.com/

### Technologies 
---
- Node.js
- Bootstrap
- MongoDB
- Leaflet

### Packages used
---
- Bcrypt
- Cloudinary
- Dotenv
- EJS
- Express
- Express-session
- JOI
- Method-override
- Multer
- Multer-storage-cloudinary
- Socket.io

### Planned Schema
---
![alt text](https://github.com/lekpeng96/food-rescue/blob/master/project_2_planning/schema%20(220812).png?raw=true)


### Routes
---
|  MODEL   | HTTP Verb | Route name | Route URL                 | Description                                           |
|----------|-----------|------------|---------------------------|-------------------------------------------------------|
| USERS    | GET       | New        | /signup                   | Show form to create user by prompting user to sign up |
|          | POST      | Create     | /signup                   | Create user after successful sign up                  |
|          | GET       | New        | /login                    | Show form to login by prompting user to log in        |
|          | POST      | Create     | /login                    | Create session after successful login                 |
|          | DELETE    | Destroy    | /logout                   | Destroys session when user logs out                   |
|          | GET       | Show       | /users/:username          | Show user's profile (listings)                        |
| LISTINGS | GET       | Index      | /listings                 | Filter and view listings                              |
|          | GET       | Show       | /listings/:listingId      | Show info about listing                               |
|          | GET       | New        | /listings/new             | Show form to create listing                           |
|          | POST      | Create     | /listings                 | Creates listing                                       |
|          | GET       | Edit       | /listings/:listingId/edit | Show form to edit listing                             |
|          | PUT       | Update     | /listings/:listingId      | Edits listing                                         |
|          | DELETE    | Destroy    | /listings/:listingId      | Destroy listing                                       |



### Future Feature Ideas
---
- Allow user to change location for listing if desired
- Private chat function
- Suggest category classification based on image uploaded
