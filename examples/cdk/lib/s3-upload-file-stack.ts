import {
  aws_apigateway,
  aws_lambda,
  aws_lambda_nodejs,
  aws_s3,
  Duration,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export class S3UploadFileStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new aws_s3.Bucket(this, 'Bucket', {});

    const signedUrlLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'SignedUrlLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_14_X,
        handler: 'handler',
        entry: path.join(__dirname, '..', 'lambdas', 'signed-url', 'index.ts'),
        timeout: Duration.seconds(10),
        environment: {
          BUCKET: bucket.bucketName,
        },
        bundling: {
          sourceMap: false,
          minify: false,
          target: 'es2020',
          externalModules: ['aws-sdk'],
        },
      }
    );

    bucket.grantWrite(signedUrlLambda);

    // Proxy API Gateway
    const api = new aws_apigateway.LambdaRestApi(this, 'ProxyApiGateway', {
      handler: signedUrlLambda,
    });
    api.addApiKey('example-signed-url-api-key');
  }
}
