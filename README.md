[![CircleCI](https://circleci.com/gh/mvibraim/cashback-system.svg?style=svg)](https://circleci.com/gh/mvibraim/cashback-system)

# Cashback System

Calculates the cashback amount for each purchase from a reseller

## Some concepts and technologies used

- Node.js
- Express with some middleware
- Clean Code
- Clean Architecture
- MongoDB with Mongoose
- Docker and Docker Compose
- External request with node-fetch
- Cursor-based pagination without external library
- Basic and JWT authentication strategies with Passport
- ES6 syntax

## Next steps

- Application logs
- Unit and integration tests. Run in CircleCI

## Prerequisites

- [Docker 18.06.0+](https://docs.docker.com/install/)
- [Docker-Compose](https://docs.docker.com/compose/install/)
- [Make](https://www.gnu.org/software/make/)

To check if the prerequisites are installed, just use the following commands:

```bash
docker -v
docker-compose -v
make -v
```

## Usage

1. Run `make` from root project

2. Create a reseller

   ```bash
   curl -X POST \
   -d '{
         "email": "marcus@gmail.com",
         "password": "12345678",
         "cpf": "12345678901",
         "full_name": "Marcus"
       }' \
   localhost:3001/resellers
   ```

3. Authenticate as reseller. This will generate a JWT token as response

   ```bash
   curl -X POST --user 12345678901 localhost:3001/resellers/auth
   ```

   The password will be prompted

4. Create a purchase. Replace <TOKEN> with the token generated in step 3

   ```bash
   curl -X POST -H "Authorization: Bearer <TOKEN>" \
   -d '{
         "code": "546",
         "data": "2020/04/10",
         "amount": 100000
       }' \
   localhost:3001/resellers/12345678901/purchases
   ```

5. Get purchases. Replace <TOKEN> with the token generated in step 3

   ```bash
   curl -X GET -H "Authorization: Bearer <TOKEN>" localhost:3001/resellers/12345678901/purchases
   ```

   The query params `next` and `previous` can be used to navigate between pages. Default page size is 5
