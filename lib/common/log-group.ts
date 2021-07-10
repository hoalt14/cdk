import * as cdk from '@aws-cdk/core';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';


export class LogGroupStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const logGrpList = [
      { logGroupName: "hoalt-ecs-fargate", retention: RetentionDays.ONE_MONTH },
      { logGroupName: "hoalt-web-static", retention: RetentionDays.ONE_MONTH },
      { logGroupName: "fe-showroom-admin", retention: RetentionDays.ONE_MONTH },
    ];

    logGrpList.forEach(logGrp => new LogGroup(this, logGrp.logGroupName, logGrp));
    
  }
}