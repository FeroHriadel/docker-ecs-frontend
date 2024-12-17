/********************************************************************************************************************************************************************
First time you deploy the ECR stack push the FE image to it - just to see it works.
It's easy to do:

- get the nodejs api endpoint (yes, backend must be deployed first)
- go to the root of the FE project
- build image like: $ docker build -t nextjs-app:latest --build-arg NEXT_PUBLIC_API_ENDPOINT=http://192.168.0.102:80/api .
- run the image: $ docker run -d -p 3000:3000 nextjs-app:latest
- docker tag nextjs-app:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/nextjs-app:latest
- aws ecr get-login-password --region us-east-1 --profile fhyahoo | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com
- docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/nextjs-app:latest
**********************************************************************************************************************************************************************/



import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as dotenv from 'dotenv';
dotenv.config();



export class EcrStack extends cdk.Stack {
  
  public ecrRepository: cdk.aws_ecr.Repository;


  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    this.init();
  }


  private init() {
    this.createEcrRepository();
    this.outputEcrRepoUri();
  }

  private createEcrRepository() {
    this.ecrRepository = new ecr.Repository(this, 'NextjsRepo', {
      repositoryName: 'nextjs-app',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [{ maxImageAge: cdk.Duration.days(30) }],
    });
  }

  private outputEcrRepoUri() {
    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: this.ecrRepository.repositoryUri,
      description: 'The URI of the ECR repository',
    });
    new cdk.CfnOutput(this, 'EcrManualStep', {
      value: this.ecrRepository.repositoryUri,
      description: 'Please push the frontend image into the ECR if this is the first time you ran this file',
    });
  }

}