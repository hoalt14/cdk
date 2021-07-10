import * as cdk from "@aws-cdk/core";

/** Import Config */
import { frontendConfig } from '../../config/web-static';

/** Import Construct */
import { CloudFrontConstruct } from '../construct/cloudfront';
import { WebStaticPipeline } from "./pipeline";

import { Role } from "@aws-cdk/aws-iam";
import { Repository } from "@aws-cdk/aws-codecommit";
import { Bucket } from "@aws-cdk/aws-s3";
import { LogGroup } from "@aws-cdk/aws-logs";

export class WebStaticStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** IAM Role */
    const myRole = Role.fromRoleArn(this, id, "arn:aws:iam::748019200657:role/CodeBuildServiceRole", { mutable: false });

    /** CodeCommit Repo */
    const repoShowRoomAdmin = Repository.fromRepositoryName(this, 'fe-showroom-admin-repo', 'fe-showroom-admin');
    // const repoBankAdmin = Repository.fromRepositoryName(this, 'fe-bank-admin-repo', 'fe-bank-admin');

    /** S3 Bucket */
    const bucketForPipeline = Bucket.fromBucketName(this, 'bucketForPipeline', 'codepipeline-ap-southeast-1-cicd'); // artifact bucket
    const bucketShowRoomAdmin = Bucket.fromBucketName(this, 'fe-showroom-admin-bucket', 'fe-showroom-admin');
    // const bucketBankAdmin = Bucket.fromBucketName(this, 'fe-bank-admin-bucket', 'fe-bank-admin');

    /** LogGroup */
    const logGrpShowRoomAdmin = LogGroup.fromLogGroupName(this, 'fe-showroom-admin-logGrp', 'fe-showroom-admin');
    // const logGrpBankAdmin = LogGroup.fromLogGroupName(this, 'fe-bank-admin-logGrp', 'fe-bank-admin');

    /**
     * ShowRoom Admin
     */

    /** Infra */
    new CloudFrontConstruct(this, 'fe-showroom-admin-infra', {
      bucket: bucketShowRoomAdmin,
      comment: frontendConfig.commentShowRoomAdmin
    });

    /** Pipeline */
    new WebStaticPipeline(this, 'fe-showroom-admin-pipeline', {
      role: myRole,
      repo: repoShowRoomAdmin,
      bucket: bucketShowRoomAdmin,
      artifactBucket: bucketForPipeline,
      logGrp: logGrpShowRoomAdmin,
      build: {
        name: frontendConfig.buildNameShowRoomAdmin,
        description: frontendConfig.buildDescShowRoomAdmin,
        branchOrRef: frontendConfig.buildBranchShowRoomAdmin
      },
      pipeline: {
        name: frontendConfig.pipelineNameShowRoomAdmin,
        branch: frontendConfig.pipelineBranchShowRoomAdmin
      }
    })

    /**
     * Bank Admin
     */

    /** Infra */
    // new CloudFrontConstruct(this, 'fe-bank-admin', {
    //   bucket: bucketBankAdmin
    // });

    /** Pipeline */
    // new FrontendPipeline(this, 'fe-bank-admin-pipeline', {
    //   bucket: bucketBankAdmin,
    //   artifactBucket: bucketForPipeline,
    //   repo: repoBankAdmin,
    //   logGrp: logGrpBankAdmin,
    //   role: myRole,
    //   build: {
    //     name: frontendConfig.buildNameBankAdmin,
    //     description: frontendConfig.buildDescBankAdmin,
    //     branchOrRef: frontendConfig.buildBranchBankAdmin
    //   },
    //   pipeline: {
    //     name: frontendConfig.pipelineNameBankAdmin,
    //     branch: frontendConfig.pipelineBranchBankAdmin
    //   }
    // })

  }
}
