import * as cdk from "@aws-cdk/core";
import { RemovalPolicy } from "@aws-cdk/core";

import * as lambda from "@aws-cdk/aws-lambda";
import * as path from 'path';

import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { PolicyDocument, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { BuildEnvironmentVariableType, LinuxBuildImage, Project, Source } from "@aws-cdk/aws-codebuild";
import { BlockPublicAccess, Bucket } from "@aws-cdk/aws-s3";
import { LogGroup, RetentionDays } from "@aws-cdk/aws-logs";

export class CodecommitServerlessBackupStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket
    const myBucket = new Bucket(this, "hoalt-codecommit-backup-bucket", {
      bucketName: 'hoalt-codecommit-backup-bucket',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY
    });

    // Policy Document
    const codecommitreadonlyPolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "codecommit:BatchGet*",
            "codecommit:Get*",
            "codecommit:Describe*",
            "codecommit:List*",
            "codecommit:GitPull",
          ],
          Resource: "*",
          Effect: "Allow",
        },
      ],
    };

    const logsPolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ],
          Resource: "*",
          Effect: "Allow",
        },
      ],
    };

    const s3artifactsPolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "s3:GetObject",
            "s3:GetObjectVersion"
          ],
          Resource: [
            "arn:aws:s3:::hoalt-codecommit-backup-bucket/*"
          ],
          Effect: "Allow",
        },
      ],
    };

    const s3backupPolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "s3:putObject"
          ],
          Resource: [
            "arn:aws:s3:::hoalt-codecommit-backup-bucket/*"
          ],
          Effect: "Allow",
        },
      ],
    };

    const s3listPolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "s3:ListBucket"
          ],
          Resource: [
            "arn:aws:s3:::hoalt-codecommit-backup-bucket"
          ],
        },
        {
          Effect: "Allow",
          Action: [
            "s3:GetObject", "s3:DeleteObject"
          ],
          Resource: [
            "arn:aws:s3:::hoalt-codecommit-backup-bucket/*"
          ],
        },
      ],
    };

    const codebuildPolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "codebuild:StartBuild"
          ],
          Resource: "arn:aws:codebuild:ap-northeast-1:002322884285:project/hoalt-codecommit-backup-project",
          Effect: "Allow",
        },
      ],
    };

    const lambdaexecutePolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "logs:*"
          ],
          Resource: "arn:aws:logs:*:*:*",
          Effect: "Allow",
        },
        {
          Action: [
            "s3:GetObject",
            "s3:PutObject"
          ],
          Resource: "arn:aws:s3:::*",
          Effect: "Allow",
        },
      ],
    };

    // Role
    const codecommitbackupsCodeBuildRole = new Role(this, "hoalt-codecommit-backups-CodeBuildRole", {
      roleName: "hoalt-codecommit-backups-CodeBuildRole",
      description: "hoalt-codecommit-backups-CodeBuildRole",
      assumedBy: new ServicePrincipal("codebuild.amazonaws.com"),
      inlinePolicies: {
        "codecommit-readonly": PolicyDocument.fromJson(codecommitreadonlyPolicyDocument),
        "logs": PolicyDocument.fromJson(logsPolicyDocument),
        "s3-artifacts": PolicyDocument.fromJson(s3artifactsPolicyDocument),
        "s3-backup": PolicyDocument.fromJson(s3backupPolicyDocument),
        "s3-list": PolicyDocument.fromJson(s3listPolicyDocument),
      },
    });

    const codecommitbackupsLambdaRole = new Role(this, "hoalt-codecommit-backups-LambdaRole", {
      roleName: "hoalt-codecommit-backups-LambdaRole",
      description: "hoalt-codecommit-backups-LambdaRole",
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        "codebuild": PolicyDocument.fromJson(codebuildPolicyDocument),
        "lambdaexecute": PolicyDocument.fromJson(lambdaexecutePolicyDocument),
      },
    });

    // LogGroup
    const mylogGroup = new LogGroup(this, "hoalt-codecommit-backup-loggroup", {
      logGroupName: "hoalt-codecommit-backup-loggroup",
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.FIVE_DAYS,
    });

    // CodeBuild
    const myBuild = new Project(this, "hoalt-codecommit-backup-project", {
      projectName: "hoalt-codecommit-backup-project",
      description: "hoalt-codecommit-backup-project",
      source: Source.s3({
        bucket: myBucket,
        path: "z.zip",
      }),
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_3,
        environmentVariables: {
          CodeCommitBackupsS3Bucket: {
            type: BuildEnvironmentVariableType.PLAINTEXT,
            value: "hoalt-codecommit-backup-bucket",
          },
        },
      },
      role: codecommitbackupsCodeBuildRole,
      logging: {
        cloudWatch: {
          logGroup: mylogGroup,
        },
      },
    });

    // Lambda
    const fn = new lambda.Function(this, "hoalt-codecomit-backup-function", {
      functionName: "hoalt-codecomit-backup-function",
      description: "hoalt-codecomit-backup-function",
      runtime: lambda.Runtime.PYTHON_3_8,
      role: codecommitbackupsLambdaRole,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: 'backup.handler',
    });

    const targetLambdaFn = new LambdaFunction(fn)

    // CloudWatch - Rule - EventBridge
    const rule = new Rule(this, "hoalt-codecommit-backup-ScheduleRule", {
      ruleName: 'hoalt-codecommit-backup-ScheduleRule',
      description: 'hoalt-codecommit-backup-ScheduleRule',
      schedule: Schedule.expression('cron(0 1 ? * MON-SAT *)'),
      targets: [targetLambdaFn]
    })
  }
}
