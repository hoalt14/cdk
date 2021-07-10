import * as cdk from '@aws-cdk/core';
import { Repository } from '@aws-cdk/aws-codecommit';

export class RepoCodeCommitStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repoList = [
      { repositoryName: "hoalt-ecs-fargate", description: "repo for ecs fargate" },
      { repositoryName: "hoalt-web-static", description: "repo for web static" },
      { repositoryName: "fe-showroom-admin", description: "repo for web static" },
    ];

    repoList.forEach(repo => new Repository(this, repo.repositoryName, repo));
    
  }
}