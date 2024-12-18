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
DOMAIN_NAME=tripiask.com
GITHUB_TOKEN_SECRET_ARN=arn:aws:secretsmanager:us-east-1:478883603693:secret:github-token-W7JCX1X
GITHUB_OWNER=FeroHriadel
GITHUB_REPO=docker-ecs-frontend
GITHUB_BRANCH=main
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
Before deploying the ECS Stack a domain name must be purchased on AWS Route53.
- go to AWS Route 53 and buy a domain name. Then put it to .env like: `DOMAIN_NAME=tripiask.com`
- $ `cdk deploy NextJsEcsStack --profile fhyahoo`

<br />


### PIPELINE deployment
Before deploying this stack a manual step must be taken: Go to github, create access token and put it in Secrets Manager.
Put the github token & other github details into .env. Like this:

- Create a github token like this:
  go to your Github / click ur profile picture (right up) / Settings (left sidebar) Developer Settings / Personal Access Tokens / Tokens (classic) Generate new token / choose classic / Select scopes: repo & admin:repo_hook / name it e.g.: `github-token` / Generate token Copy the value of the token (something like: `ghp_66PWc461Drgh0nvEFiiKnsabzPJtZf2583Wq`)

- Put the github token in AWS / SECRETS MANAGER under the name github-token like this:
  copy the value of the github-token and go to AWS / SECRETS MANAGER / Store a new secret / Other type of secret / Next in Key/value pair section click Plaintext tab and paste the github-token there / Next / Secret name: github-token / Next / complete the procedure…

- add the Secret Manager github-token arn into .env + add your github details:
  GITHUB_TOKEN_SECRET_ARN=arn:aws:secretsmanager:us-east-1:991342932037:secret:github-token-SZacAA
  GITHUB_OWNER=FeroHriadel
  GITHUB_REPO=dockerproject
  GITHUB_BRANCH=main

- $ `cdk deploy NextJsPipelineStack --profile fhyahoo`
