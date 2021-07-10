import * as cdk from "@aws-cdk/core";

/** Import Config */
import { backendConfig, vpcConfig, targetGrpConfig } from '../../config/ecs-fargate';

/** Import Construct */
import { VpcConstruct } from '../construct/vpc';
import { RoleConstruct } from '../construct/role';
import { TargetGrpConstruct } from '../construct/targetGrp';
import { ElbApplicationConstruct } from '../construct/elb-application';
import { EcsFargateClusterConstruct } from '../construct/ecs-cluster';
import { EcsFargateServiceConstruct } from '../construct/ecs-service';
import { Repository } from "@aws-cdk/aws-ecr";
import { LogGroup } from "@aws-cdk/aws-logs";

export class ECSFargateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** VPC */
    const myVpc = new VpcConstruct(this, vpcConfig.vpcConstructId, {
      maxAzs: vpcConfig.maxAzs,
      cidr: vpcConfig.cidr,
      natGateways: vpcConfig.natGateways,
    });

    /** Application Target Group */
    const myAtg = new TargetGrpConstruct(this, targetGrpConfig.tgGrpName, {
      vpc: myVpc.vpc,
      tgGrpName: targetGrpConfig.tgGrpName,
      tgGrpPort: targetGrpConfig.tgGrpPort,
    });

    /** Application Load Balancer */
    const myAlb = new ElbApplicationConstruct(this, backendConfig.albName, {
      vpc: myVpc.vpc,
      albName: backendConfig.albName,
      publicLB: backendConfig.publicLB,
      secGrp: myVpc.secGrpPublic,
      listenerPort: backendConfig.listenerPort,
      atg: myAtg.atg,
    });

    /** ECS Fargate Cluster */
    const ecsFargateCluster = new EcsFargateClusterConstruct(this, backendConfig.ecsClusterName, {
      vpc: myVpc.vpc,
      clusterName: backendConfig.ecsClusterName,
    });

    /** ECR */
    const ecr = Repository.fromRepositoryName(this, backendConfig.ecrConstructName, backendConfig.ecrRepoName);

    /** IAM Role */
    const role = new RoleConstruct(this, backendConfig.roleNameEcsFargate, {
      roleNameEcsFargate: backendConfig.roleNameEcsFargate,
      policyNameEcsFargate: backendConfig.policyNameEcsFargate,
    });

    /** LogGroup */
    const logGrp = LogGroup.fromLogGroupName(this, id, 'hoalt-ecs-fargate')

    /** ECS Fargate Service */
    const ecsFargateService = new EcsFargateServiceConstruct(this, backendConfig.ecsServiceConstructId, {
      /** VPC */
      vpc: myVpc.vpc,

      /** Cluster */
      ecsCluster: ecsFargateCluster.cluster,

      /** ECR */
      ecr: ecr,
      ecrTag: backendConfig.ecrTag,

      /** LogGroup */
      logGrp: logGrp,
      streamPrefix: backendConfig.streamPrefix,

      /** Task Definition */
      taskDefName: backendConfig.taskdefName,
      ecsTaskRole: role.ecsFargateTaskRole,
      ecsExecutionRole: role.ecsFargateTaskRole,
      taskDefMem: backendConfig.taskdefMem,
      taskDefCpu: backendConfig.taskdefCPU,

      /** Container */
      containerName: backendConfig.containerName,
      containerPort: backendConfig.containerPort,
      containerMem: backendConfig.taskdefMem,
      containerCpu: backendConfig.taskdefCPU,

      /** Service */
      serviceName: backendConfig.ecsServiceName,
      desiredCount: backendConfig.desiredCount,
      secGrp: myVpc.secGrpPrivate,
      assignPublicIp: backendConfig.assignPublicIp,

      /** Application Target Group */
      atg: myAtg.atg,
    })
  }
}
