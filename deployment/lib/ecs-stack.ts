import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as dotenv from 'dotenv';
dotenv.config();



export class RdsStack extends cdk.Stack {

  public vpc: cdk.aws_ec2.Vpc;
  private securityGroup: ec2.SecurityGroup;
  

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.init();
  }


  private init() {
    this.createVpc();
  }

  private createVpc() {
    this.vpc = new ec2.Vpc(this, 'NextJsVpc', {
      maxAzs: 2,
    });
  }

  private createSecurityGroup() {
    this.securityGroup = new ec2.SecurityGroup(this, 'NextJsSecurityGroup', {
      vpc: this.vpc,
      description: 'Allow incoming HTTP/HTTPS and outgoing internet traffic',
      allowAllOutbound: true,
    });
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      'Allow HTTP traffic from anywhere'
    );
  } 


}
