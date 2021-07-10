import * as cdk from "@aws-cdk/core";
import { RemovalPolicy } from "@aws-cdk/core";
import * as codecommit from "@aws-cdk/aws-codecommit";
import * as codebuild from "@aws-cdk/aws-codebuild";
import { LogGroup, RetentionDays } from "@aws-cdk/aws-logs";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as iam from '@aws-cdk/aws-iam';
import * as ecs from '@aws-cdk/aws-ecs';

export interface ECSFargatePipelineProps {
  myservice: ecs.IBaseService;
}

export class ECSFargatePipeline extends cdk.Construct {
  public readonly myRepo: any;
  constructor(scope: cdk.Construct, id: string, props: ECSFargatePipelineProps) {
    super(scope, id);

    const mypolicyDocument = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "CloudWatchLogsPolicy",
                "Effect": "Allow",
                "Action": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource": [
                    "*"
                ]
            },
            {
                "Sid": "CodeCommitPolicy",
                "Effect": "Allow",
                "Action": [
                    "codecommit:GitPull"
                ],
                "Resource": [
                    "*"
                ]
            },
            {
                "Sid": "S3GetObjectPolicy",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:GetObjectVersion"
                ],
                "Resource": [
                    "*"
                ]
            },
            {
                "Sid": "S3PutObjectPolicy",
                "Effect": "Allow",
                "Action": [
                    "s3:PutObject"
                ],
                "Resource": [
                    "*"
                ]
            },
            {
                "Sid": "ECRPullPolicy",
                "Effect": "Allow",
                "Action": [
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:BatchGetImage"
                ],
                "Resource": [
                    "*"
                ]
            },
            {
                "Sid": "ECRAuthPolicy",
                "Effect": "Allow",
                "Action": [
                    "ecr:GetAuthorizationToken"
                ],
                "Resource": [
                    "*"
                ]
            },
            {
                "Sid": "S3BucketIdentity",
                "Effect": "Allow",
                "Action": [
                    "s3:GetBucketAcl",
                    "s3:GetBucketLocation"
                ],
                "Resource": "*"
            }
        ]
    }

    const customPolicyDocument = iam.PolicyDocument.fromJson(mypolicyDocument);

    const myPolicy = new iam.ManagedPolicy(this, "HoaltCodeBuildPolicy", {
      managedPolicyName: 'hoaltcodebuildpolicy',
      document: customPolicyDocument
    })

    const myRole = new iam.Role(this, "HoaltCodeBuildRole", {
      roleName: 'hoaltcodebuildrole',
      description: 'hoalt-codebuild-role-test',
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
    });

    myRole.addManagedPolicy(myPolicy)
    myRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryPowerUser'))

    // CodeCommit
    // const myRepo = new codecommit.Repository(this, "HoaltRepository", {
    //   repositoryName: "hoalt-repo-backend",
    //   description: "test something",
    // });

    // LogGroup
    const myLogGroup = new LogGroup(this, "HoaltLogGroup", {
      logGroupName: "hoalt-loggroup",
      retention: RetentionDays.FIVE_DAYS, // default: 24 months
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // CodeBuild
    const myBuild = new codebuild.Project(this, "HoaltProject", {
      projectName: "hoalt-build-project",
      description: "test something",
      source: codebuild.Source.codeCommit({
        repository: codecommit.Repository.fromRepositoryName(this, 'hoalt-repo', 'hoalt-backend'),
        branchOrRef: "refs/heads/master",
      }),
      role: myRole,
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        privileged: true,
      },
      logging: {
        cloudWatch: {
          logGroup: myLogGroup,
          prefix: "hoalt-loggroup-codebuild",
        },
      },
    });

    // CodePipeline
    const sourceOutput = new codepipeline.Artifact("SourceArtifact");
    const buildOutput = new codepipeline.Artifact("BuildArtifact");

    new codepipeline.Pipeline(this, "HoaltPipeline", {
      pipelineName: "hoalt-pipeline",
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipeline_actions.CodeCommitSourceAction({
              actionName: "Checkout_Code",
              repository: codecommit.Repository.fromRepositoryName(this, 'hoalt-repo-pipeline', 'hoalt-backend'),
              branch: "master",
              variablesNamespace: "SourceVariables",
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: "Build",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "Build_Image",
              input: sourceOutput,
              project: myBuild,
              variablesNamespace: "BuildVariables",
              outputs: [buildOutput],
            }),
          ],
        },
        {
          stageName: "Deploy",
          actions: [
            new codepipeline_actions.EcsDeployAction({
              actionName: 'Deploy_to_ECS',
              service: props.myservice,
              input: buildOutput
            }),
          ],
        },
      ],
    });
  }
}
