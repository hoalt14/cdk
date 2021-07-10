import { Construct } from "@aws-cdk/core";
import { CacheControl, CodeBuildAction, CodeCommitSourceAction, S3DeployAction } from "@aws-cdk/aws-codepipeline-actions";
import { ILogGroup } from "@aws-cdk/aws-logs";
import { IBucket } from "@aws-cdk/aws-s3";
import { IRepository } from "@aws-cdk/aws-codecommit";
import { BuildSpec, LinuxBuildImage, Project, Source } from "@aws-cdk/aws-codebuild";
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline";
import { IRole } from "@aws-cdk/aws-iam";

export interface WebStaticPipelineProps {
  readonly role: IRole;
  readonly repo: IRepository;
  readonly bucket: IBucket;
  readonly artifactBucket: IBucket;
  readonly logGrp: ILogGroup;
  readonly build: {
    name: string,
    description: string,
    branchOrRef: string
  };
  readonly pipeline: {
    name: string,
    branch: string
  };
}

export class WebStaticPipeline extends Construct {
  constructor(parent: Construct, id: string, props: WebStaticPipelineProps) {
    super(parent, id);

    const myBuild = new Project(parent, id + "-codebuild", {
      projectName: props.build.name,
      description: props.build.description,
      source: Source.codeCommit({
        repository: props.repo,
        branchOrRef: props.build.branchOrRef, // example: "refs/heads/release"
      }),
      buildSpec: BuildSpec.fromObjectToYaml( // should use buildspec.yml inside source
        {
          "version": 0.2,
          "phases": {
            "pre_build": {
              "commands": [
                "yarn install"
              ]
            },
            "build": {
              "commands": [
                "yarn build"
              ]
            },
            "post_build": {
              "commands": [
                "aws s3 rm s3://fe-showroom-admin --recursive"
              ]
            }
          },
          "artifacts": {
            "files": [
              "**/*"
            ],
            "base-directory": "build",
            "discard-paths": "no"
          }
        }
      ),
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_3,
      },
      logging: {
        cloudWatch: {
          logGroup: props.logGrp
        },
      },
      role: props.role
    });

    const sourceOutput = new Artifact("SourceArtifact");
    const buildOutput = new Artifact("BuildArtifact");

    new Pipeline(parent, id + "-codepipeline", {
      artifactBucket: props.artifactBucket,
      pipelineName: props.pipeline.name,
      stages: [
        {
          stageName: "Source",
          actions: [
            new CodeCommitSourceAction({
              actionName: "Checkout_SourceCode",
              repository: props.repo,
              branch: props.pipeline.branch, // example: "release"
              variablesNamespace: "SourceVariables",
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: "Build",
          actions: [
            new CodeBuildAction({
              actionName: "Build_Static_File",
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
            new S3DeployAction({
              actionName: "Deploy_to_S3",
              bucket: props.bucket,
              input: buildOutput,
              extract: true,
              cacheControl: [CacheControl.noCache()],
              variablesNamespace: "DeployVariables",
            }),
          ],
        },
      ],
    });
  }
}
