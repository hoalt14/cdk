import * as cdk from '@aws-cdk/core';
import { Repository } from '@aws-cdk/aws-codecommit';

export class RepoECRStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repoList = [
      { repositoryName: "hoalt-backend-ecr", description: "repo for backend" },
    ];

    repoList.forEach(repo => new Repository(this, repo.repositoryName, repo));
    
  }
}