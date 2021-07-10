import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { BlockPublicAccess, Bucket } from '@aws-cdk/aws-s3';

export class S3BucketStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucketList = [
      {
        bucketName: "hoalt-ecs-fargate",
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        // autoDeleteObjects: true,
        // removalPolicy: RemovalPolicy.DESTROY
      },
      {
        bucketName: "hoalt-web-static",
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        // autoDeleteObjects: true,
        // removalPolicy: RemovalPolicy.DESTROY
      },
      {
        bucketName: "fe-showroom-admin",
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        // autoDeleteObjects: true,
        // removalPolicy: RemovalPolicy.DESTROY
      },
    ];

    bucketList.forEach(bucket => new Bucket(this, bucket.bucketName, bucket));
    
  }
}