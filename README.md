# Saddam-rest-api

Free Open source REST API built with | Nodejs + Express + Mongodb ⚡️ Made with developer experience first Prettier + VSCode setup.

> - C.R.U.D, Filter, Paginate, Sort and Search API

# Table of contents

- [Author](#Author)
- [Demo](#Demo)
- [Technologies](#Technologies)
- [Contributing](#Contributing)
- [Status](#status)
- [Features](#Features)
- [Related Projects](#Related_Projects)
- [Support](#Support)
- [Feedback](#Feedback)
- [Run Locally](#Run_Locally)
- [API Reference](#API_Reference)
- [Screenshots](#Screenshots)
- [Environment Variables](#Environment)
- [Deployment](#Deployment)

# Author

### <a href="https://github.com/saddamarbaa">@Saddam Arbaa</a>

# Technologies

- Node.js
- Express
- MongoDB
- JSON Web Token (JWT)
- bcryptjs
- Heroku Hosting

# Demo

### <a href="https://saddam-rest-api.herokuapp.com">LIVE API Demo</a>

### <a href="https://github.com/saddamarbaa/Ecommerce-website-next.js-typeScript">Front-End REPO</a>

### <a href="https://saddam-next-ecommerce.vercel.app/">LIVE Webside DEMO </a>

#### Testing Email: testverstion@gmail.com

#### Testing Password: 12345test

# Features

##### (Users)

- Complete user authentication
- Users can sign in
- Users can sign out
- Users can verify email
- Users can Change Password
- View all products
- View products detail
- Filter products by category
- Search for products
- Add products to their basket
- Checkout total payment
- Checkout order page
- Products pagination

##### (Admin)

- Complete Admin Authorization
- Add products
- Update products
- Delete products
- Limit Products
- Add Users
- Update Users
- Delete Users
- Update User Role

# API_Reference

#### Get all products

```http
  GET https://saddam-rest-api.herokuapp.com/api/v1/products
```

| Parameter  | Type     | Description           |
| :--------- | :------- | :-------------------- |
| `limit`    | `number` | default= 100          |
| `category` | `string` | default= All Products |
| `page`     | `number` | default= 1            |
| `search`   | `string` | search string         |
| `sortBy`   | `string` | default= createdAt    |
| `OrderBy`  | `string` | default= desc         |

#### example (Paginate - Sort - Filter - Full-text search

```http
  GET https://saddam-rest-api.herokuapp.com/api/v1/products?page=1&limit=99&sortBy=createdAt&OrderBy=desc&filterBy=category&category=Sports
  GET   https://saddam-rest-api.herokuapp.com/api/v1/products?page=2&limit=99&sortBy=createdAt&OrderBy=desc&filterBy=category&category=Jewelery
  GET   https://saddam-rest-api.herokuapp.com/api/v1/products?page=2&limit=99&sortBy=createdAt&OrderBy=desc&filterBy=category&category=Books&search=nodejs
```

#### Get single product

```http
  GET https://saddam-rest-api.herokuapp.com/api/v1/products/${id}
```

| Parameter | Type     | Description                          |
| :-------- | :------- | :----------------------------------- |
| `id`      | `string` | **Required**. Id of product to fetch |

#### Add new product (Only admins)

```http
  POST https://saddam-rest-api.herokuapp.com/api/v1/admin/products
```

| Parameter      | Type     | Description                                           |
| :------------- | :------- | :---------------------------------------------------- |
| `name`         | `string` | **Required**. product name                            |
| `price`        | `number` | **Required**. product price                           |
| `description`  | `string` | **Required**. product description                     |
| `productImage` | `img`    | **Required**. product Image                           |
| `category`     | `string` | **Required**. product category                        |
| `count`        | `number` | **Optional**. default value = 1                       |
| `stock       ` | `string` | **Optional**. default value = 'in stock - order soon' |

#### Update product (Only admins)

```http
  PATCH https://saddam-rest-api.herokuapp.com/api/v1/admin/products/${id}
```

| Parameter | Type     | Description                             |
| :-------- | :------- | :-------------------------------------- |
| `id`      | `string` | **Required**. Id of product to update   |
| `token`   | `string` | **Required**. JWT token pass in headers |

#### Delete product (Only admins)

```http
  DELETE https://saddam-rest-api.herokuapp.com/api/v1/admin/products/${id}
```

| Parameter | Type     | Description                             |
| :-------- | :------- | :-------------------------------------- |
| `id`      | `string` | **Required**. Id of product to delete   |
| `token`   | `string` | **Required**. JWT token pass in headers |

#### User signup

```http
  POST https://saddam-rest-api.herokuapp.com/api/v1/auth/signup
```

| Parameter         | Type      | Description   |
| :---------------- | :-------- | :------------ |
| `firstName`       | `string`  | **Required**. |
| `lastName`        | `string`  | **Required**. |
| `familyName`      | `string`  | **Optional**. |
| `email`           | `string`  | **Required**. |
| `password`        | `string`  | **Required**. |
| `confirmPassword` | `string`  | **Required**. |
| `gender`          | `string`  | **Optional**. |
| `dateOfBirth`     | `string`  | **Optional**. |
| `acceptTerms`     | `boolean` | **Required**. |
| `mobileNumber`    | `number`  | **Optional**. |
| `nationality`     | `string`  | **Optional**. |
| `favoriteAnimal`  | `string`  | **Optional**. |
| `address`         | `string`  | **Optional**. |
| `bio`             | `string`  | **Optional**. |
| `jobTitle`        | `string`  | **Optional**. |

```http
  After signup you will receive email to verify your account
```

#### User Login

```http
  POST https://saddam-rest-api.herokuapp.com/api/v1/auth/login
```

| Parameter  | Type     | Description   |
| :--------- | :------- | :------------ |
| `email`    | `string` | **Required**. |
| `password` | `string` | **Required**. |

#### User Verify Email

```http
  POST https://saddam-rest-api.herokuapp.com/api/v1/auth/verify-email`,
```

| Parameter | Type     | Description   |
| :-------- | :------- | :------------ |
| `userId`  | `string` | **Required**. |
| `token`   | `string` | **Required**. |

# Environment

- To run this project, you will need to add the following environment variables to your .env file (check environment.config.js file for more examples)

- MONGODB_CONNECTION_STRING
- TOKEN_SECRET
- WEBSITE_URL
- API_VERSION ="v1"
- JWT_EXPIRE_TIME
- SEND_GRID_API_KEY
- ADMIN_SEND_GRID_EMAIL
- ADMIN_ROLE
- ADMIN_EMAIL
- NODE_ENV = 'development'
- CLIENT_URL
- ACCESS_TOKEN_SECRET_KEY
- REFRESH_TOKEN_SECRET_KEY
- ACCESS_TOKEN_KEY_EXPIRE_TIME
- REFRESH_TOKEN_KEY_EXPIRE_TIME

# Contributing

Contributions are always welcome!

# Deployment

To deploy this project on Heroku Flow the Flowing documentation <a href="https://devcenter.heroku.com/articles/deploying-nodejs">Deploying Node.js Apps on Heroku</a>

# Related_Projects

### Blog API built with | Nodejs + Express + Mongodb

#### <a href="https://blog-post-api-sadam.herokuapp.com">LIVE API</a>

#### <a href="https://github.com/saddamarbaa/blog-api">API REPO</a>

#### <a href="https://github.com/saddamarbaa/blog-post-front-end-vanillaJS">Front-End REPO</a>

#### <a href="https://saddamarbaa-blog.netlify.app/"> LIVE Webside DEMO </a>

### Twitter API built with | Nodejs + Express + Mongodb

#### <a href="https://twitter-clone-app-saddam.herokuapp.com/">LIVE API Demo</a>

#### <a href="https://github.com/saddamarbaa/twitter-clone-api">API REPO</a>

#### <a href="https://github.com/saddamarbaa/twitter-clone-app">Front-End REPO</a>

#### <a href="https://twitter-clone-saddam.netlify.app/">LIVE Webside DEMO </a>

### Netflix API built with | Nodejs + Express + Mongodb

#### <a href="https://github.com/saddamarbaa/netflix-clone-api">API REPO</a>

#### <a href="https://nefilx-saddam.herokuapp.com/">LIVE API Demo</a>

# Support

For support, email saddamarbaas@gmail.com.

# Feedback

If you have any feedback, please reach out to me at saddamarbaas@gmail.com

Twitter
https://twitter.com/ArbaaSaddam/

Linkedin.
https://www.linkedin.com/in/saddamarbaa/

Github
https://github.com/saddamarbaa

Instagram
https://www.instagram.com/saddam.dev/

Facebook
https://www.facebook.com/saddam.arbaa

# Run_Locally

Clone the project

```bash
https://github.com/saddamarbaa/node-express-rest-api
```

Go to the project directory

```bash
  cd node-express-rest-api
```

Install dependencies

```bash
yarn install
# or
npm install
```

Start the server

```bash
  node app.js
  or
  nodemon app.js
```

# Status

Project is: in progress I'm working on it in my free time

# Screenshots

## Signup Page

![image](https://user-images.githubusercontent.com/51326421/168418001-ddf09448-6f3a-4d0c-9ce8-1e691666dd13.png)

![image](https://user-images.githubusercontent.com/51326421/168420032-1339ad80-24e0-4f06-bb90-630256ae2973.png)

## LogIn Page

![image](https://user-images.githubusercontent.com/51326421/168417978-8ad90e22-44e0-4961-aa1d-6a3ad8d235d4.png)

![image](https://user-images.githubusercontent.com/51326421/168419975-7eee5c8a-d3cb-4e1f-a50f-0f01f6d85650.png)

## Forgot Password Page

![image](https://user-images.githubusercontent.com/51326421/168418030-7e87c64b-55ed-4c89-a899-0e9434b147bc.png)

![image](https://user-images.githubusercontent.com/51326421/168419992-59d97525-031a-41d7-ba31-53ab1a75c1e6.png)

![image](https://user-images.githubusercontent.com/51326421/168418079-ec2ca89d-2997-4e44-af34-4bbe2a06bf29.png)

## Reset Password email Link

![image](https://user-images.githubusercontent.com/51326421/168418151-aaf3a8d4-03b5-4011-aff2-7b42e53a4425.png)

## Reset Password Page

![image](https://user-images.githubusercontent.com/51326421/168418261-2c4cb6cb-42b6-44b3-8b98-b91da31f2252.png)

![image](https://user-images.githubusercontent.com/51326421/168420074-88a7ff38-e9cc-421c-917f-3070223021fb.png)

## Update Profile Page

![image](https://user-images.githubusercontent.com/51326421/168419955-ca2231ab-457f-4d48-8188-025e2a931d45.png)

## Home Page

![image](https://user-images.githubusercontent.com/51326421/168419207-cf99c8c8-3032-4441-bbc9-2aecb7b6df78.png)

## Home Page (Filter by category(Bookks))

![image](https://user-images.githubusercontent.com/51326421/168419224-aa093745-8923-4c01-95b3-54897b275fde.png)

## Home Page (Filter by category(Sports))

![image](https://user-images.githubusercontent.com/51326421/168419258-dc20e307-92f0-4be6-903d-8312bc6ae6b2.png)

## Home Page (Filter by category(Toys))

![image](https://user-images.githubusercontent.com/51326421/168419286-d0912456-8aac-4d70-8693-a9923fc3af48.png)

## Home Page (Filter by category(Men's clothing))

![image](https://user-images.githubusercontent.com/51326421/168419300-bed584b1-db33-457e-bd91-c24a8e416473.png)

## Home Page (Search Product (Jewelery))

![image](https://user-images.githubusercontent.com/51326421/168419621-b392a53a-cbc4-4173-ac75-1500b68ad356.png)

## Product Detail Page

![image](https://user-images.githubusercontent.com/51326421/168417430-4be9f4e9-2f3c-468d-a587-21ea0e0edafe.png)

## Shopping Cart Page

![image](https://user-images.githubusercontent.com/51326421/168417498-f5ab4afa-e964-43f9-81ac-87ead9c9852d.png)

## Orders Page

![image](https://user-images.githubusercontent.com/51326421/168417573-f9358b57-ba05-4ae9-a613-a034ec5230bc.png)

## Admin Products Page

![image](https://user-images.githubusercontent.com/51326421/168417651-8ea633e1-13c6-4707-8127-69e6e133ff58.png)

## Admin Users Page

![image](https://user-images.githubusercontent.com/51326421/168417796-0140add5-abf7-490a-9aee-094bd86754d3.png)

## Admin Users Table Page

![image](https://user-images.githubusercontent.com/51326421/168417814-c7e859f3-6a79-48df-8560-0bb2de53bfc4.png)

## Admin Add Product Page

![image](https://user-images.githubusercontent.com/51326421/168417851-4396ddbd-d7cb-4d50-bb78-df36b4583c8e.png)

![image](https://user-images.githubusercontent.com/51326421/168419929-81f17f43-dbbd-4d80-b7fb-2d614e88b607.png)

## Admin Update Product Page

![image](https://user-images.githubusercontent.com/51326421/168417887-ff0a9660-4955-474f-a87f-4f0aaeebc2e8.png)

## Admin Add User Page

![image](https://user-images.githubusercontent.com/51326421/168417951-0f454bc3-fb59-42cb-b764-2059135a6043.png)

![image](https://user-images.githubusercontent.com/51326421/168419886-f8be1530-7131-4625-b044-292fbc6ed3c3.png)

## Admin Update User Page

![image](https://user-images.githubusercontent.com/51326421/168417927-567f47b6-748e-4fc1-9ea0-a45d71f5c660.png)
