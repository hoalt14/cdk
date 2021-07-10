import { Construct } from "@aws-cdk/core";
import { ISecurityGroup, IVpc, SubnetType } from "@aws-cdk/aws-ec2";
import { ContainerImage, FargateService, FargateTaskDefinition, ICluster, LogDriver, Protocol } from "@aws-cdk/aws-ecs";
import { IApplicationTargetGroup } from "@aws-cdk/aws-elasticloadbalancingv2";
import { IRole } from "@aws-cdk/aws-iam";
import { ILogGroup } from "@aws-cdk/aws-logs";
import { IRepository } from "@aws-cdk/aws-ecr";

export interface EcsFargateServiceConstructProps {
  /** VPC */
  readonly vpc: IVpc;

  /** IAM Role */
  readonly ecsTaskRole: IRole;
  readonly ecsExecutionRole: IRole;

  /** LogGroup */
  readonly logGrp: ILogGroup;
  readonly streamPrefix: string;

  /** ECR */
  readonly ecr: IRepository;
  readonly ecrTag: string;

  /** ECS Fargate Cluster */
  readonly ecsCluster: ICluster;

  /** Task Definition */
  readonly taskDefName: string;
  readonly taskDefMem: number;
  readonly taskDefCpu: number;

  /** Container */
  readonly containerName: string;
  readonly containerPort: number;
  readonly containerMem: number;
  readonly containerCpu: number;
  // readonly environmentKey: string;
  // readonly environmentValue: string;

  /** ECS Fargate Service */
  readonly serviceName: string;
  readonly desiredCount: number;
  readonly secGrp: ISecurityGroup;
  readonly assignPublicIp: boolean;

  /** Application Target Group - Listener */
  readonly atg: IApplicationTargetGroup;

  readonly tags?: {
    [key: string]: string;
  };
}

export class EcsFargateServiceConstruct extends Construct {
  readonly ecsFargateService: FargateService;
  readonly containerName: string;

  constructor(parent: Construct, id: string, props: EcsFargateServiceConstructProps) {
    super(parent, id);

    /** 1. Task Definition */
    const taskDef = new FargateTaskDefinition(parent, id + '-TaskDef', {
      family: props.taskDefName,
      taskRole: props.ecsTaskRole,
      executionRole: props.ecsExecutionRole,
      memoryLimitMiB: props.taskDefMem,
      cpu: props.taskDefCpu,
    });

    taskDef.addContainer(props.containerName, {
      image: ContainerImage.fromEcrRepository(props.ecr, props.ecrTag),
      memoryLimitMiB: props.containerMem,
      cpu: props.containerCpu,
      portMappings: [{
        containerPort: props.containerPort,
        protocol: Protocol.TCP
      }],
      logging: LogDriver.awsLogs({
        logGroup: props.logGrp,
        streamPrefix: props.streamPrefix,
      }),
      // environment: {
      //   [props.environmentKey]: props.environmentValue,
      // }
    });

    /** 2. Service */
    this.ecsFargateService = new FargateService(parent, id + '-Service', {
      taskDefinition: taskDef,
      serviceName: props.serviceName,
      cluster: props.ecsCluster,
      desiredCount: props.desiredCount,
      vpcSubnets: props.vpc.selectSubnets({
        subnetType: SubnetType.PUBLIC,
      }),
      securityGroups: [props.secGrp],
      assignPublicIp: props.assignPublicIp,
    });

    this.ecsFargateService.attachToApplicationTargetGroup(props.atg)
  }
}
