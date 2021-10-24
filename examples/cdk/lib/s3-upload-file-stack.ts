import {
  aws_apigateway,
  aws_iam,
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

    const bucket = new aws_s3.CfnBucket(this, 'Bucket', {
      versioningConfiguration: {
        status: 'Enabled',
      },
      objectLockEnabled: true,
      objectLockConfiguration: {
        objectLockEnabled: 'Enabled',
        rule: {
          defaultRetention: {
            days: 1,
            mode: 'GOVERNANCE',
          },
        },
      },
    });

    const signedUrlLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'SignedUrlLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_14_X,
        handler: 'handler',
        entry: path.join(__dirname, '..', 'lambdas', 'signed-url', 'index.ts'),
        timeout: Duration.seconds(10),
        environment: {
          BUCKET: bucket.ref,
        },
        bundling: {
          sourceMap: false,
          minify: false,
          target: 'es2020',
          externalModules: ['aws-sdk'],
        },
      }
    );

    signedUrlLambda.addToRolePolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ['s3:PutObject'],
        resources: [`${bucket.attrArn}/upload/*`],
      })
    );

    // Proxy API Gateway
    const api = new aws_apigateway.LambdaRestApi(this, 'ProxyApiGateway', {
      handler: signedUrlLambda,
      restApiName: 'example-s3-upload',
      apiKeySourceType: aws_apigateway.ApiKeySourceType.HEADER,
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
    });
    const apiKey = api.addApiKey('example-signed-url-api-key');
    const usagePlan = api.addUsagePlan('example-s3-upload');
    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({ stage: api.deploymentStage });
  }
}
