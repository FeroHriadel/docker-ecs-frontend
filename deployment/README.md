# FE DEPLOYMENT

- make sure you are in the `/deployment` folder.

<br />


### DEPLOY BACKEND FIRST
- FE needs to know the api endpoint that's why baclend needs to be deployed first

<br />


### .ENV
- create a .env in the `/deployment` folder
- populate it like this:

```
AWS_REGION=us-east-1 
AWS_ACCOUNT=333243953765
NEXT_PUBLIC_API_ENDPOINT=https://backendEndpoint
```

<br />


### ECR Deployment
First time you deploy the ECR stack push the FE image to it - just to see it works.
It's easy to do:
- get the nodejs api endpoint (yes, backend must be deployed first)
- go to the root of the FE project
- build image like: $ docker build -t nextjs-app:latest --build-cd dearg NEXT_PUBLIC_API_ENDPOINT=<backendEndpoint>/api .
- run the image: $ docker run -d -p 3000:3000 nextjs-app:latest
- docker tag nextjs-app:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/nextjs-app:latest
- aws ecr get-login-password --region us-east-1 --profile fhyahoo | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com
- docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/nextjs-app:latest

<br />


### ECS Deployment

