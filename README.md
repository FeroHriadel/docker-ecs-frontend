# DOCKER-ECS-FRONTEND

Dockerized NextJS app for backend: https://github.com/FeroHriadel/docker-ecs-backend
Includes IaC deployment to AWS ECS and CICD


### ENVIRONMENT VARIABLES
- make sure to add `/.env` with:

```
NEXT_PUBLIC_API_ENDPOINT = http://localhost:80/api
```

<br />


### BACKEND FOR FRONTEND DEVELOPMENT
- pull backend from github (docker-ecs-backend)
- $ `cd docker-ecs-backend/backend`
- $ `docker-compose up -d` (will launch mysql db and nodejs api on localhost:80)
- the nodejs api will fail initially (database didn't have time to init properly) - restart it (not the whole container, just the nodejs api subcontainer)
- then you're good to go. Go to FE folder and: $ `npm run dev` 
- now your nextjs on localhost:3000 can connect to the api with db on localhost:80

<br />


### DEPLOYMENT
- please see `/deployment/README.md on detailed instructions