# Welcome to your CDK TypeScript project

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Reference

* [API](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html)
* [Best practices for developing cloud applications](https://aws.amazon.com/blogs/devops/best-practices-for-developing-cloud-applications-with-aws-cdk/)
* [DevAx](https://github.com/DevAx101/MicroServices)
* [Examples](https://github.com/aws-samples/aws-cdk-examples)
* [Patterns](https://cdkpatterns.com/)
* [Pipeline](https://aws.amazon.com/blogs/developer/cdk-pipelines-continuous-delivery-for-aws-cdk-applications/)
* [Workshop](https://cdkworkshop.com/)

## CodeCommit Serverless Backup

```shell
cd scripts
zip -r z.zip ./
aws s3 cp z.zip s3://${S3_BUCKET_NAME} --profile ${AWS_PROFILE}
```
