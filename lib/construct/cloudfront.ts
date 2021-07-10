import { Construct, Duration } from "@aws-cdk/core";
import { IBucket } from "@aws-cdk/aws-s3";
import { AllowedMethods, Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from "@aws-cdk/aws-cloudfront";
import { S3Origin } from "@aws-cdk/aws-cloudfront-origins";

export interface CloudFrontConstructProps {
  readonly bucket: IBucket;
  readonly comment: string;
  readonly tags?: {
    [key: string]: string;
  };
}

export class CloudFrontConstruct extends Construct {
  // readonly myBucket: IBucket;
  constructor(parent: Construct, id: string, props: CloudFrontConstructProps) {
    super(parent, id);

    const myOAI = new OriginAccessIdentity(parent, id + "-oai", {
      comment: props.comment
    });

    const myOrigin = new S3Origin(props.bucket, {
      originAccessIdentity: myOAI,
    });

    new Distribution(parent, id + "-distribution", {
      defaultBehavior: {
        origin: myOrigin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_ALL,
      },
      comment: props.comment,
      defaultRootObject: "index.html",
      enableIpv6: false,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.seconds(10),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.seconds(10),
        },
      ],
    });
  }
}
