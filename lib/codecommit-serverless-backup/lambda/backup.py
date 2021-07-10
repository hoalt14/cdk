import boto3

client = boto3.client('codebuild')

def handler(event, context): 
    response = client.start_build(projectName='hoalt-codecommit-backup-project')
    output = "Triggered CodeBuild project: 'CodeCommitBackup' to back all CodeCommit repos in this account/region. Status={}".format(response["build"]["buildStatus"])
    print(output)
    return output