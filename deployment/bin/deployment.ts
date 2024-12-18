#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EcrStack } from '../lib/ecr-stack';
import * as dotenv from 'dotenv';
import { EcsStack } from '../lib/ecs-stack';
import { PipelineStack } from '../lib/pipeline-stack';
dotenv.config();



/***********************************************************************************************
Please deploy the stacks in the following order:
1. ECR stack - then take the manual step as described in README.md
2. Buy a domain name on AWS Route53 before deploying ECS Stack
3. Deploy the EcsStack
4. Push code to github, add github access token to AWS Secrets Manager and put its arn into .env (see README.md for details)
5. Deploy the PipelineStack
************************************************************************************************/



const account = process.env.AWS_ACCOUNT;
const region = process.env.AWS_REGION;



const app = new cdk.App();
const ecrStack = new EcrStack(app, 'NextJsEcrStack', {env: {account, region}});
const ecsStack = new EcsStack(app, 'NextJsEcsStack', {
  env: {account, region},
  ecrRepo: ecrStack.ecrRepository
});
const pipelineStack = new PipelineStack(app, 'NextJsPipelineStack', {
  env: {account, region},
  ecrRepositoryUri: ecrStack.ecrRepository.repositoryUri,
  ecrRepositoryArn: ecrStack.ecrRepository.repositoryArn,
  ecsFargateService: ecsStack.fargateService,
  ecsContainer: ecsStack.container,
  githubRepo: process.env.GITHUB_REPO as string,
  githubOwner: process.env.GITHUB_OWNER as string,
  githubBranch: process.env.GITHUB_BRANCH as string,
  githubTokenSecretArn: process.env.GITHUB_TOKEN_SECRET_ARN as string,
});
