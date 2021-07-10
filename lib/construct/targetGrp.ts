import { Construct } from "@aws-cdk/core";
import { IVpc } from "@aws-cdk/aws-ec2";
import { ApplicationProtocol, ApplicationTargetGroup, TargetType } from "@aws-cdk/aws-elasticloadbalancingv2";

export interface TargetGrpConstructProps {
  readonly vpc: IVpc;
  readonly tgGrpName: string;
  readonly tgGrpPort: number;
  readonly tags?: {
    [key: string]: string;
  };
}

export class TargetGrpConstruct extends Construct {
  readonly vpc: IVpc;
  readonly atg: ApplicationTargetGroup;

  constructor(parent: Construct, id: string, props: TargetGrpConstructProps) {
    super(parent, id);

    /** Application Target Group */
    this.atg = new ApplicationTargetGroup(parent, id + "-Atg", {
      vpc: props.vpc,
      targetGroupName: props.tgGrpName,
      targetType: TargetType.IP,
      protocol: ApplicationProtocol.HTTP,
      port: props.tgGrpPort,
    });
  }
}
