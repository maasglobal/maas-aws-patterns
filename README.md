# MaaS Global AWS Design Patterns

Table of Contents

- [Introduction](#introduction)
- [API](#api)
  * [API with a custom authorizer](#api-with-a-custom-authorizer)
  * [API with a database connection using PostgreSQL protocol](#api-with-a-database-connection-using-postgresql-protocol)
  * [API with an Aurora connection using Data API](#api-with-an-aurora-connection-using-data-api)
  * [API with asynchronous processing](#api-with-asynchronous-processing)
  * [Webhook Proxy](#webhook-proxy)
- [S3](#s3)
  * [S3 bucket event trigger with multiple subscriptions](#s3-bucket-event-trigger-with-multiple-subscriptions)
  * [S3 bucket event trigger with a single subscription](#s3-bucket-event-trigger-with-a-single-subscription)
  * [S3 object index in a DynamoDB table](#s3-object-index-in-a-dynamodb-table)
  * [S3 File Upload with API Gateway](#s3-file-upload-with-api-gateway)
- [Queues and Pipelines](#queues-and-pipelines)
  * [Dead Letter Queue (DLQ)](#dead-letter-queue-dlq)
  * [High-volume event pipeline)](#high-volume-event-pipeline)
- [Deployment](#deployment)
  * [Usage of Systems Manager Parameter Store with deployment](#usage-of-systems-manager-parameter-store-with-deployment)



# Introduction

This is a collection of backend infrastructure and architecture design patterns that are considered best practices when we do development in MaaS Global. These patterns can be combined to build larger architectures.

# API

## API with a custom authorizer

A custom authorizer Lambda is a function that validates a header from the requests. Usually, this header name is Authorization and the value is a Json Web Token which is signed and expires after a certain time.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/api-custom-authorizer.drawio.svg)

Serverless Framework example: [examples/serverless/api-examples/serverless.yml](examples/serverless/api-examples/serverless.yml)

## API with a database connection using PostgreSQL protocol

When connecting to a database with PostgreSQL protocol, the Lambda function needs to be in the same VPC. The VPC should be divided into an application tier and a data tier. The application tier subnets should be at the least in two availability zones when running the production payload.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/api-with-database-vpc.drawio.svg)

## API with an Aurora connection using Data API

The Amazon Aurora database cluster allows connection using the Data API. It doesn’t require a persistent connection, but instead, it uses a secured HTTP endpoint. In some cases, the connection might have more latency than e.g. PostgresSQL connection, but the cold start time of the Lambda function is shorter when it doesn’t have to be inside the VPC.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/api-with-database-data-api.drawio.svg)

## API with asynchronous processing

If API doesn't need to send the response synchronously, the compute layer might not be needed. Amazon API Gateway supports service integrations, where e.g. messages to the SQS queue can be sent straight from the request.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/api-service-integration.drawio.svg)

## Webhook Proxy

In some cases, webhooks needs to be distributed asynchronously to multiple recipients. To avoid defining those recipients beforehand, the payload can be pushed forward e.g. using DynamoDB streams.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/api-webhook-proxy.drawio.svg)

# S3

## S3 bucket event trigger with multiple subscriptions

To subscribe to multiple sources when the object is created, modified, or deleted, the use of SNS topic is the easiest way.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-multiple-subscriptions.drawio.svg)

CDK example: [examples/cdk/lib/s3-multiple-subscriptions-stack.ts](examples/cdk/lib/s3-multiple-subscriptions-stack.ts)

## S3 bucket event trigger with a single subscription

If it’s known that there is no possibility that multiple processors would subscribe to S3 events, an SQS or a Lambda trigger can be used in the subscription.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-single-subscription.drawio.svg)

CDK example: [examples/cdk/lib/s3-single-subscription-stack.ts](examples/cdk/lib/s3-single-subscription-stack.ts)

## S3 object index in a DynamoDB table

The raw event data in S3 buckets, for example, logs or other events, can contain data that needs to be anonymized or deleted based on legislation. The amount of data might be so big that it doesn't make sense to go through the whole bucket when someone requests data removal. In this kind of situation storing an index of objects to a DynamoDB table is one option. The table contains metadata of the object, which user's data is in that file, and things like that, which can be used in the DynamoDB query to identify files that need to be processed.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-index-dynamo.drawio.svg)

## S3 File Upload with API Gateway

When uploading files that are larger than API Gateway can handle, the following pattern is a one way to achieve it. The API Gateway and a Lambda function are used to generate a signed URL for the upload and returned to the client. That URL is then used to upload the file to the S3 bucket.

![S3 Upload](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-upload.drawio.svg)

# Queues and Pipelines

## Dead Letter Queue (DLQ)

Asynchronously triggered Lambdas retries the execution automatically on failure a few times. To catch failed execution a dead letter queue is an option that can be used to notify failures, retry executions later, and keep the history of failed executions.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/queue-lambda-dlq.drawio.svg)

## High-volume event pipeline

The fan-in approach should be used with high-volume event pipelines. The event emitter can be, e.g. Lambda functions or CloudWatch logs, which needs to be stored and processed later.

![Kinesis Firehose pipeline](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/event-pipeline.drawio.svg)

## Cross-account Amazon EventBridge

The fan-in approach can also be used with a cross-account Amazon EventBridge pattern. For example, CloudWatch alarms from multiple AWS accounts can be pushed to a separate account that handles the alarms centralized.

![Cross-account EventBridge](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/cross-account-event-bridge.drawio.svg)

# Deployment

## Usage of Systems Manager Parameter Store with deployment

Sharing parameters between service deployments can be done multiple ways, for example, exporting output from the CloudFormation template and importing that to the next stack. In this approach, changes that require replacement in the exporting stack will cause issues - exported params cannot be changed if other stack imports those. Removing the importing stack will cause long downtime.

One option is to write parameters to the SSM parameter store and use those in the deployment that requires them. Of course, when the parameters change in the exporting stack, there will be downtime, but it will be less than with the removal and redeploy approach.

![Cross-account EventBridge](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/ssm-infra-parameters.drawio.svg)
