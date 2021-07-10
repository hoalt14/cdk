import { Construct } from '@aws-cdk/core';
import { IVpc, SecurityGroup, SubnetType } from '@aws-cdk/aws-ec2';
import { ApplicationListener, ApplicationLoadBalancer, ApplicationProtocol, IApplicationTargetGroup } from '@aws-cdk/aws-elasticloadbalancingv2';

export interface ElbApplicationConstructProps {
  readonly vpc: IVpc;
  readonly albName: string;
  readonly publicLB: boolean;
  readonly listenerPort: number;
  readonly secGrp: SecurityGroup;
  readonly atg: IApplicationTargetGroup;

  readonly tags?: {
    [key: string]: string;
  };
}

export class ElbApplicationConstruct extends Construct {
  readonly vpc: IVpc;
  readonly atg: IApplicationTargetGroup;

  readonly alb: ApplicationLoadBalancer;
  readonly alistener: ApplicationListener;

  constructor(parent: Construct, id: string, props: ElbApplicationConstructProps) {
    super(parent, id);

    /** Application Load Balancer */
    this.alb = new ApplicationLoadBalancer(parent, id + '-Alb', {
      vpc: props.vpc,
      loadBalancerName: props.albName,
      internetFacing: props.publicLB,
      securityGroup: props.secGrp,
      vpcSubnets: props.vpc.selectSubnets({
        subnetType: SubnetType.PUBLIC
      }),
    });

    /** addListener */
    this.alistener = this.alb.addListener(id + '-HttpListener', {
      protocol: ApplicationProtocol.HTTP,
      port: props.listenerPort,
      open: false,
      defaultTargetGroups: [props.atg]
    });
  }
}