/************************************************************************************************************************************
Before you deploy anything here:
- go to AWS Route 53 and buy a domain name. Then put it to .env like: `DOMAIN_NAME=tripiask.com`
************************************************************************************************************************************/



import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as dotenv from 'dotenv';
dotenv.config();



interface EcsStackProps extends cdk.StackProps {
  ecrRepo: cdk.aws_ecr.Repository;
}



const domainName = process.env.DOMAIN_NAME!;



export class EcsStack extends cdk.Stack {

  private ecrRepo: cdk.aws_ecr.Repository;
  private vpc: cdk.aws_ec2.Vpc;
  private albSecurityGroup: ec2.SecurityGroup;
  private ecsSecurityGroup: ec2.SecurityGroup;
  private ecsCluster: ecs.Cluster;
  private taskDefinition: ecs.FargateTaskDefinition;
  public container: cdk.aws_ecs.ContainerDefinition;
  private hostedZone: cdk.aws_route53.IHostedZone;
  private certificate: acm.ICertificate;
  private alb: elb.ApplicationLoadBalancer;
  public fargateService: ecs.FargateService;
  private targetGroup: elb.ApplicationTargetGroup;
  private albListener: cdk.aws_elasticloadbalancingv2.ApplicationListener;


  constructor(scope: Construct, id: string, props?: EcsStackProps) {
    super(scope, id, props);
    this.ecrRepo = props?.ecrRepo!;
    this.init();
  }


  private init() {
    this.createVpc();
    this.createAlbSecurityGroup();
    this.createCluster();
    this.createTaskDefinition();
    this.addTaskDefRights();
    this.addContainerToTaskDef();
    this.createCertificate();
    this.createALB();
    this.createEcsSecurityGroup();
    this.createEcsService();
    this.createTargetGroup();
    this.createListener();
    this.createDnsRecord();
  }

  private createVpc() {
    this.vpc = new ec2.Vpc(this, 'NextJsVpc', {
      maxAzs: 2,
    });
  }

  private createAlbSecurityGroup() {
    this.albSecurityGroup = new ec2.SecurityGroup(this, 'NextJsSecurityGroup', {
      vpc: this.vpc,
      description: 'Allow incoming HTTP/HTTPS and outgoing internet traffic',
      allowAllOutbound: true,
    });
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from anywhere'
    );
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere'
    );
  } 

  private createCluster() {
    this.ecsCluster = new ecs.Cluster(this, 'NextJsEcsCluster', {
      vpc: this.vpc, //must be in the same vpc as the rds
    });
  }

  private createTaskDefinition() {
    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'NextJsTask', {
      memoryLimitMiB: 512, //might need more - nextjs is resource intensive, will see.
      cpu: 256,
    });
  }

  private addTaskDefRights() {
    this.taskDefinition.executionRole?.addManagedPolicy( //can pull image from ecr
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly')
    );
    this.taskDefinition.executionRole?.addManagedPolicy( //can write to CloudWatch
      iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess')
    );
  }


  private addContainerToTaskDef() {
    this.container = this.taskDefinition.addContainer('NextJsContainer', {
      image: ecs.ContainerImage.fromEcrRepository(this.ecrRepo),
      logging: ecs.LogDriver.awsLogs({ streamPrefix: 'NextJsLogs' }),
      environment: {
        NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT!
      },
    });
    this.container.addPortMappings({ containerPort: 3000 });
  }

  private createCertificate() {
    this.hostedZone = route53.HostedZone.fromLookup(this, 'NextJsHostedZone', {
      domainName: domainName
    });
    this.certificate = new acm.Certificate(this, 'NextJsCertificate', {
      domainName: domainName,
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });
  }

  private createALB() {
    this.alb = new elb.ApplicationLoadBalancer(this, 'NextJsALB', {
      vpc: this.vpc,
      internetFacing: true,
      securityGroup: this.albSecurityGroup, //all outbound, inbound 300, 80, 443
    });
  }

  private createEcsSecurityGroup() {
    this.ecsSecurityGroup = new ec2.SecurityGroup(this, 'NextJsEcsServiceSecurityGroup', {
      vpc: this.vpc,
      description: 'Allow traffic from ALB to ECS Task',
      allowAllOutbound: true
    });
    this.ecsSecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(this.alb.connections.securityGroups[0].securityGroupId),
      ec2.Port.tcp(3000),
      'Allow traffic from ALB on port 3000'
    );
  }

  private createEcsService() {
    this.fargateService = new ecs.FargateService(this, 'NextJsFargateService', {
      cluster: this.ecsCluster,
      taskDefinition: this.taskDefinition,
      securityGroups: [this.ecsSecurityGroup], //all outbound, inbound on 3000
      desiredCount: 1,
      healthCheckGracePeriod: cdk.Duration.seconds(60)
    });
    const scaling = this.fargateService.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 2,
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70, // Target 70% CPU utilization
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });
  }

  private createTargetGroup() {
    this.targetGroup = new elb.ApplicationTargetGroup(this, 'NextJsTargetGroup', {
      vpc: this.vpc,
      port: 3000,
      protocol: elb.ApplicationProtocol.HTTP,
      targets: [this.fargateService],
      healthCheck: {
        path: '/api/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyHttpCodes: '200',
        healthyThresholdCount: 2, //how many checks before instance is considered healthy
        unhealthyThresholdCount: 2 //how many checks before instance is considered unhealthy
      },
      deregistrationDelay: cdk.Duration.seconds(30), //if container shuts down, people can finish form submissions, etc...
    });
  }

  private createListener() {
    this.albListener = this.alb.addListener('HttpsListener', {
      port: 443,
      certificates: [this.certificate],
      defaultAction: elb.ListenerAction.forward([this.targetGroup])
    });
    this.alb.addListener('HttpListener', { //redirect http to https
      port: 80,
      defaultAction: elb.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true
      })
    });
  }

  private createDnsRecord() { // Connect domain name to load balancer - when users type yourdomain.com, send them to the app
    new route53.ARecord(this, 'NextJsAliasRecord', {
      zone: this.hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.LoadBalancerTarget(this.alb)
      ),
      recordName: domainName
    });
  }

}
