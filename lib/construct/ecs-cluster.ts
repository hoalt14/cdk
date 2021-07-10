import { Construct } from '@aws-cdk/core';
import { IVpc } from '@aws-cdk/aws-ec2';
import { Cluster } from '@aws-cdk/aws-ecs';

export interface EcsFargateClusterConstructProps {
  readonly vpc: IVpc;
  readonly clusterName: string;
  
  readonly tags?: {
    [key: string]: string;
  };
}

export class EcsFargateClusterConstruct extends Construct {
  public readonly cluster: Cluster;

  constructor(parent: Construct, id: string, props: EcsFargateClusterConstructProps) {
    super(parent, id);

    /** Cluster */
    this.cluster = new Cluster(parent, id + '-EcsFargateCluster', {
      vpc: props.vpc,
      clusterName: props.clusterName,
      capacityProviders: ['FARGATE_SPOT', 'FARGATE'],
    }); 

  }
}