import {
  aws_lambda,
  aws_lambda_nodejs,
  aws_s3,
  aws_s3_notifications,
  Duration,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export class S3SingleSubscriptionStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // an S3 source bucket
    const bucket = new aws_s3.Bucket(this, 'Bucket', {});

    // a Lambda function as a subscription
    const echoLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'EchoLambda',
      {
        runtime: aws_lambda.Runtime.NODEJS_14_X,
        handler: 'handler',
        entry: path.join(__dirname, '..', 'lambdas', 'echo', 'index.ts'),
        timeout: Duration.seconds(10),
        bundling: {
          sourceMap: false,
          minify: false,
          target: 'es2020',
          externalModules: ['aws-sdk'],
        },
      }
    );

    bucket.addEventNotification(
      aws_s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(echoLambda)
    );
  }
}
