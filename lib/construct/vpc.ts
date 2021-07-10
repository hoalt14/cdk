import { Construct } from "@aws-cdk/core";
import { IVpc, Peer, Port, SecurityGroup, Vpc } from "@aws-cdk/aws-ec2";

import { secGrpConfig } from '../../config/ecs-fargate';

export interface VpcConstructProps {
  readonly cidr?: string;
  readonly maxAzs?: number;
  readonly natGateways?: number;

  readonly tags?: {
    [key: string]: string;
  };
}

export class VpcConstruct extends Construct {
  public readonly vpc: IVpc;
  readonly secGrpPublic: SecurityGroup;
  readonly secGrpPrivate: SecurityGroup;

  constructor(parent: Construct, id: string, props: VpcConstructProps) {
    super(parent, id);

    /** VPC */
    this.vpc = new Vpc(parent, id + '-Vpc', {
      cidr: props.cidr,
      maxAzs: props.maxAzs,
      natGateways: props.natGateways
    });

    /** SecurityGroup - Public */
    this.secGrpPublic = new SecurityGroup(parent, id + '-secGrpPublic', {
      securityGroupName: secGrpConfig.secGrpPublicName,
      description: secGrpConfig.secGrpPublicDesc,
      vpc: this.vpc,
      allowAllOutbound: secGrpConfig.secGrpPublicAllowAllOutbound,
      disableInlineRules: secGrpConfig.secGrpPublicDisableInlineRules,
    });

    this.secGrpPublic.addIngressRule(
      Peer.ipv4(secGrpConfig.secGrpPublicIngressRuleIpv4),
      Port.tcp(secGrpConfig.secGrpPublicIngressRuleIpv4PortHttp),
      secGrpConfig.secGrpPublicIngressRuleIpv4Desc);
    this.secGrpPublic.addIngressRule(
      Peer.ipv4(secGrpConfig.secGrpPublicIngressRuleIpv4),
      Port.tcp(secGrpConfig.secGrpPublicIngressRuleIpv4PortEcs),
      secGrpConfig.secGrpPublicIngressRuleIpv4Desc);

    /** SecurityGroup - Private */
    this.secGrpPrivate = new SecurityGroup(parent, id + '-secGrpPrivate', {
      securityGroupName: secGrpConfig.secGrpPrivateName,
      description: secGrpConfig.secGrpPrivateDesc,
      vpc: this.vpc,
      allowAllOutbound: secGrpConfig.secGrpPrivateAllowAllOutbound,
      disableInlineRules: secGrpConfig.secGrpPrivateDisableInlineRules,
    });

    this.secGrpPrivate.addIngressRule(
      this.secGrpPublic,
      Port.tcp(secGrpConfig.secGrpPrivateIngressRulePort),
      secGrpConfig.secGrpPrivateIngressRuleDesc);
  }
}
