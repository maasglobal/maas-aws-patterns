import {
  aws_lambda,
  aws_lambda_event_sources,
  aws_lambda_nodejs,
  aws_s3,
  aws_s3_notifications,
  aws_sns,
  aws_sns_subscriptions,
  aws_sqs,
  Duration,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";

export class S3MultipleSubscriptionsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // an S3 source bucket
    const bucket = new aws_s3.Bucket(this, "Bucket", {});

    // an SNS topic for S3 event subsciption
    const topic = new aws_sns.Topic(this, "Topic", {
      topicName: "s3-multiple-subscriptions",
      displayName: "s3-multiple-subscriptions",
    });

    bucket.addEventNotification(
      aws_s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.SnsDestination(topic)
    );

    // a Lambda function as a subscription
    const echoLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      "EchoLambda",
      {
        runtime: aws_lambda.Runtime.NODEJS_14_X,
        handler: "handler",
        entry: path.join(__dirname, "..", "lambdas", "echo", "index.ts"),
        timeout: Duration.seconds(10),
        bundling: {
          sourceMap: false,
          minify: false,
          target: "es2020",
          externalModules: ["aws-sdk"],
        },
      }
    );

    echoLambda.addEventSource(
      new aws_lambda_event_sources.SnsEventSource(topic)
    );

    // an SQS queue as a subscription
    const queue = new aws_sqs.Queue(this, "Queue", {
      queueName: "s3-multiple-subscriptions",
      retentionPeriod: Duration.hours(2), // clean up test queue after 2 hours
    });

    topic.addSubscription(new aws_sns_subscriptions.SqsSubscription(queue));
  }
}
