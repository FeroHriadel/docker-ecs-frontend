#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EcrStack } from '../lib/ecr-stack';
import * as dotenv from 'dotenv';
import { EcsStack } from '../lib/ecs-stack';
dotenv.config();



/***********************************************************************************************
Please deploy the stacks in the following order:
1. ECR stack - then take the manual step as described in README.md
2. Buy a domain name on AWS Route53 before deploying ECS Stack
3. Deploy the EcsStack
************************************************************************************************/



const account = process.env.AWS_ACCOUNT;
const region = process.env.AWS_REGION;



const app = new cdk.App();
const ecrStack = new EcrStack(app, 'NextJsEcrStack', {env: {account, region}});
const ecsStack = new EcsStack(app, 'NextJsEcsStack', {
  env: {account, region},
  ecrRepo: ecrStack.ecrRepository
})
