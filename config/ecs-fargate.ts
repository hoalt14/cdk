export const backendConfig = {
  /** VPC */
  vpcConstructId: "hoalt",
  cidr: "10.0.0.0/16",
  maxAzs: 2,
  natGateways: 1,

  /** Application Target Group */
  // tgGrpName: "hoalt-atg",
  // tgGrpPort: 8000,

  /** Application Load Balancer */
  albName: "hoalt-alb",
  publicLB: true,
  listenerPort: 80,

  /** ECS Fargate Cluster */
  ecsClusterName: "hoalt-cluster",

  /** ECR */
  ecrConstructName: "hoalt-ecr",
  ecrRepoName: "hoalt-backend-ecr",
  ecrTag: "latest",

  /** ECS Fargate Service */
  ecsServiceConstructId: "ecs-fargate-service",

  /** IAM Role */
  roleNameEcsFargate: "hoalt-ecs-fargate",
  policyNameEcsFargate: "service-role/AmazonECSTaskExecutionRolePolicy",

  /** LogGroup */
  logGroupName: "hoalt-ecs-fargate",
  streamPrefix: "test",

  /** Task Definition */
  taskdefName: "hoalt-taskdef",
  taskdefMem: 512,
  taskdefCPU: 256,

  /** Container */
  containerName: "WebContainer",
  containerPort: 8000,
  // environmentKey: "PORT",
  // environmentValue: "8000",

  /** ECS Fargate Service */
  ecsServiceName: "hoalt-service-alb",
  desiredCount: 2,
  assignPublicIp: true,
};

export const vpcConfig = {
  /** VPC */
  vpcConstructId: "hoalt",
  cidr: "10.0.0.0/16",
  maxAzs: 2,
  natGateways: 1,
};

export const secGrpConfig = {
  /** Public */
  secGrpPublicName: "hoalt-public",
  secGrpPublicDesc: "security group for public",
  secGrpPublicAllowAllOutbound: true,
  secGrpPublicDisableInlineRules: true,
  secGrpPublicIngressRuleIpv4: "11.22.33.44/32",
  secGrpPublicIngressRuleIpv4PortHttp: 80,
  secGrpPublicIngressRuleIpv4PortEcs: 8000,
  secGrpPublicIngressRuleIpv4Desc: "VIB Office",

  /** Private */
  secGrpPrivateName: "hoalt-private",
  secGrpPrivateDesc: "security group for private",
  secGrpPrivateAllowAllOutbound: true,
  secGrpPrivateDisableInlineRules: true,
  secGrpPrivateIngressRulePort: 8000,
  secGrpPrivateIngressRuleDesc: "Allow ECS",
};

export const targetGrpConfig = {
  /** Application Target Group */
  tgGrpName: "hoalt-atg",
  tgGrpPort: 8000,
};