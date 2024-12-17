#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EcrStack } from '../lib/ecr-stack';
import * as dotenv from 'dotenv';
dotenv.config();



/***********************************************************************************************
Please deploy the stacks in the following order:
1. ECR stack - then take the manual step as described in README.md
************************************************************************************************/



const account = process.env.AWS_ACCOUNT;
const region = process.env.AWS_REGION;



const app = new cdk.App();
new EcrStack(app, 'NextJsEcrStack', {env: {account, region}});