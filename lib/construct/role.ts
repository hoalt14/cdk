import { Construct } from '@aws-cdk/core';
import { IRole, ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam';

export interface RoleConstructProps {
  readonly roleNameEcsFargate: string;
  readonly policyNameEcsFargate: string;
  
  readonly tags?: {
    [key: string]: string;
  };
}

export class RoleConstruct extends Construct {
  public readonly ecsFargateTaskRole: IRole;

  constructor(parent: Construct, id: string, props: RoleConstructProps) {
    super(parent, id);

    /** Task Role for ECS Fargate */
    this.ecsFargateTaskRole = new Role(parent, id + '-Role', {
      assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
      description: "Allows ECS tasks to call AWS services on your behalf.",
      roleName: props.roleNameEcsFargate,
    });

    this.ecsFargateTaskRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName(props.policyNameEcsFargate));

  }
}