# Job Management API (Plooral)

## Introduction

This project is a Node.js API developed as part of the technical assessment for backend developers at Plooral. The
objective is to create an API for managing job advertisements.

## Project Structure

```
/api
  /src
    /controllers           # Controllers handling API requests
    /enums                 # Enumerations/constants
    /middleware            # Middleware functions
    /routes                # Route definitions
    /services              # Services for handling business logic
  /config
    db.config.js           # Database configuration
/ddl
   models.sql             # SQL file containing database schema
/docs
   Insomnia_2024-02-20.json  # Insomnia workspace for API testing
```

This structure organizes the project into clear modules for controllers, enums, middleware, routes, and services, with a
separate directory for database configuration and SQL schema definitions. Additionally, the `docs` directory contains an
Insomnia workspace file for testing the API endpoints.

## Documentation

### Routes

#### Companies

- **GET /api/v1/companies**: Retrieve all companies.
- **POST /api/v1/companies**: Create a new company.
- **DELETE /api/v1/companies**: Delete all companies.
- **GET /api/v1/companies/search**: Search for companies.

- **GET /api/v1/companies/:id**: Retrieve a specific company by ID.
- **PUT /api/v1/companies/:id**: Update a specific company by ID.
- **DELETE /api/v1/companies/:id**: Delete a specific company by ID.

#### Jobs

- **GET /api/v1/job**: Retrieve all jobs.
- **POST /api/v1/job**: Create a new job.
- **DELETE /api/v1/job**: Delete all jobs.
- **GET /api/v1/job/search**: Search for jobs.

- **GET /api/v1/job/:id**: Retrieve a specific job by ID.
- **PUT /api/v1/job/:id**: Update a specific job by ID.
- **DELETE /api/v1/job/:id**: Delete a specific job by ID.

- **PUT /api/v1/job/:id/publish**: Publish a specific job by ID.
- **PUT /api/v1/job/:id/archive**: Archive a specific job by ID.

#### Feed

- **GET /api/v1/feed**: Get a feed of published jobs.

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- AWS (S3, Lambda, SQS)
- OpenAI API

## Requirements

- Node.js installed
- PostgreSQL database
- AWS account with necessary services configured

## How to Run the Project

1. **Install Dependencies**: First, make sure you have Node.js and npm installed on your machine. Then, navigate to the
   project directory and run the following command to install all dependencies:
    - Using Yarn:
      ```bash
      yarn install
      ```
    - Using npm:
      ```bash
      npm install
      ```

2. **Set Environment Variables**: Create a `.env` file in the root directory of the project and add the following
   environment variables:

   ```plaintext
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://{user}:{password}@{host}:{port}/{database}
   OPENAI_API_KEY={YOUR_PERSONAL_OPENAI_API_KEY}
   AWS_S3_BUCKET={YOUR_BUCKET_S3}
   AWS_S3_KEY={NAME_YOUR_JSON_FILE_S3}
   AWS_SQS_URL={YOUR_QUEUE_URL}
   ```

   Replace `{user}`, `{password}`, `{host}`, `{port}`, and `{database}` in the `DATABASE_URL` with your PostgreSQL
   database credentials. Also, replace `{YOUR_PERSONAL_OPENAI_API_KEY}`, `{YOUR_BUCKET_S3}`, `{NAME_YOUR_JSON_FILE_S3}`,
   and `{YOUR_QUEUE_URL}` with your specific values.

3. **Run the Project**: Once you've set up the environment variables, you can start the development server by running:

    - Using Yarn:
      ```bash
      yarn start
      ```
    - Using npm:
      ```bash
      npm start
      ```

   This will start the server on the specified port (default is 5000) in the development environment.

4. **Test the Endpoints**: You can now test the API endpoints using tools like Postman or cURL. Make requests to the
   defined routes to interact with the application.

5. **Optional**: If you want to run the project in a different environment (e.g., production), you can modify
   the `NODE_ENV` variable in the `.env` file accordingly.

That's it! You've successfully set up and run the project using environment variables defined in the `.env` file. Let me
know if you need further assistance!

## Bonus Questions

### Scalability Solutions for Job Moderation Feature

1. **Architecture:**

    - **Microservices:** Divide the system into smaller, independent services, each responsible for a specific task (
      e.g.,
      text moderation, image analysis, etc.). This allows each service to scale individually according to demand.
    - **Caching:** Use caching to store frequently moderated results. This reduces the number of calls to the database
      and
      the OpenAI API, decreasing response time.

2. **Database:**

    - **Horizontal scalability:** Use a database that can be scaled horizontally (e.g., NoSQL, sharding), adding more
      servers to handle increased load.
    - **Query optimization:** Optimize database queries to reduce response time. Use indexes and query caches to improve
      performance.

3. **OpenAI API:**

    - **Rate limiting:** Implement rate limiting for calls to the OpenAI API, controlling the number of requests per
      second.
    - **API caching:** Use a cache to store results from calls to the OpenAI API and reduce the number of requests.

4. **Monitoring:**

    - **Performance monitoring:** Monitor system performance in real-time, identifying bottlenecks and points of failure
      through monitoring tools like Prometheus or Grafana.
    - **Alerts:** Set up alerts to notify the team when the system is under excessive load, allowing the team to take
      proactive measures to avoid issues.

### Strategy for Global Job Feed Delivery with Sub-Millisecond Latency

1. **Architecture:**

    - **Content Delivery Network (CDN):** Use a global CDN, such as AWS CloudFront, to distribute the job feed content
      to servers worldwide. This reduces latency for users in different regions.
    - **Global Load Balancing:** Use a global load balancer, such as AWS Global Accelerator, to distribute traffic to
      CDN servers with the lowest latency for each user.

2. **Technologies:**

    - **Amazon ElastiCache for Redis:** Use Redis as an in-memory cache to store the job feed. This reduces response
      time for user requests.
    - **Amazon DynamoDB:** Use DynamoDB as a NoSQL database to store job feed metadata. This provides horizontal
      scalability and high availability.

3. **Implementation:**

    - Store the job feed in **Amazon ElastiCache** for **Redis**.
    - Store **job feed metadata** in **Amazon DynamoDB**.
    - Create an **API endpoint** using **AWS Lambda** that retrieves the job feed from **Redis**.
    - Use **AWS Global Accelerator** to distribute traffic to the **API endpoint**.
    - Use **AWS CloudFront** to distribute the job feed content to servers worldwide.

## License

This project is licensed under the [MIT License](LICENSE).