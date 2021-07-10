#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';

import { LogGroupStack } from "../lib/common/log-group";
import { RepoCodeCommitStack } from "../lib/common/repo-codecommit";
import { RepoECRStack } from "../lib/common/repo-ecr";
import { S3BucketStack } from "../lib/common/s3-bucket";

import { CodecommitServerlessBackupStack } from '../lib/codecommit-serverless-backup';
import { WebStaticStack } from "../lib/web-static";
import { ECSFargateStack } from "../lib/ecs-fargate";

const app = new App();

new LogGroupStack(app, "LogGroup", {
  description: "LogGroup Stack",
});

new RepoCodeCommitStack(app, "RepoCodeCommit", {
  description: "Repositories CodeCommit Stack",
});

new RepoECRStack(app, "RepoECR", {
  description: "Repositories ECR Stack",
});

new S3BucketStack(app, "S3Bucket", {
  description: "S3 Bucket Stack",
});

new CodecommitServerlessBackupStack(app, "CodecommitServerlessBackup", {
  description: "Codecommit Serverless Backup Stack",
});

new WebStaticStack(app, "WebStatic", {
  description: "Web Static Stack",
});

new ECSFargateStack(app, "ECSFargate", {
  description: "ECS Fargate Stack",
});
