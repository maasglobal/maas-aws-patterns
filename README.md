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

Serverless Framework example: [examples/serverless/api-authorizer/serverless.yml](examples/serverless/api-authorizer/serverless.yml)

## API with a database connection using PostgreSQL protocol

When connecting to a database with PostgreSQL protocol, the Lambda function needs to be in the same VPC. The VPC should be divided into an application tier and a data tier. The application tier subnets should be at the least in two availability zones when running the production payload.

![API with VPC](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/api-with-database-vpc.drawio.svg)

Serverless example: [examples/serverless/api-database/serverless.yml](examples/serverless/api-database/serverless.yml#L57-L69)

## API with an Aurora connection using Data API

The Amazon Aurora database cluster allows connection using the Data API. It doesn’t require a persistent connection, but instead, it uses a secured HTTP endpoint. In some cases, the connection might have more latency than e.g. PostgresSQL connection, but the cold start time of the Lambda function is shorter when it doesn’t have to be inside the VPC.

![API with Data API](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/api-with-database-data-api.drawio.svg)

Serverless example: [examples/serverless/api-database/serverless.yml](examples/serverless/api-database/serverless.yml#L50-L56)

### Performance comparison

The performance of the data api and the postgresql protocol is quite even. The results of a quick performance test using artillery.io confirms it.

```yaml
POSTGRES:
  Scenarios launched: 1000
  Scenarios completed: 1000
  Requests completed: 1000
  Mean response/sec: 95.24
  Response time (msec):
    min: 65
    max: 2337 # VPC Lambda cold start
    median: 78
    p95: 133
    p99: 1509.5
  Scenario counts:
    0: 1000 (100%)
  Codes:
    200: 1000

DATA-API:
  Scenarios launched: 1000
  Scenarios completed: 1000
  Requests completed: 1000
  Mean response/sec: 95.51
  Response time (msec):
    min: 61
    max: 335
    median: 75
    p95: 99
    p99: 162
  Scenario counts:
    0: 1000 (100%)
  Codes:
    200: 1000
```

## API with asynchronous processing

If API doesn't need to send the response synchronously, the compute layer might not be needed. Amazon API Gateway supports service integrations, where e.g. messages to the SQS queue can be sent straight from the request.

![API service integration](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/api-service-integration.drawio.svg)

## Webhook Proxy

In some cases, webhooks needs to be distributed asynchronously to multiple recipients. For example some SaaS services has hard limit how many webhook URLs can be defined to their system, and when developing with multiple development stages, that limit is reached quickly.  To avoid defining those recipients beforehand, the payload can be pushed forward e.g. using DynamoDB streams.

In this approach, the API gateway receives the webhook and responses with 200 status code. The webhook payload is stored to a DynamoDB table that has streams enabled. The development stage Lambda functions listens that stream and processes the payload if it's meant to that stage.

![Webhook proxy](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/api-webhook-proxy.drawio.svg)

# S3

## S3 bucket event trigger with multiple subscriptions

To subscribe to multiple sources when the object is created, modified, or deleted, the use of SNS topic is the easiest way.

![S3 multiple subscriptions](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-multiple-subscriptions.drawio.svg)

CDK example: [examples/cdk/lib/s3-multiple-subscriptions-stack.ts](examples/cdk/lib/s3-multiple-subscriptions-stack.ts)

## S3 bucket event trigger with a single subscription

If it’s known that there is no possibility that multiple processors would subscribe to S3 events, an SQS or a Lambda trigger can be used in the subscription.

![S3 single subscription](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-single-subscription.drawio.svg)

CDK example: [examples/cdk/lib/s3-single-subscription-stack.ts](examples/cdk/lib/s3-single-subscription-stack.ts)

## S3 object index in a DynamoDB table

The raw event data in S3 buckets, for example, logs or other events, can contain data that needs to be anonymized or deleted based on legislation. The amount of data might be so big that it doesn't make sense to go through the whole bucket when someone requests data removal. In this kind of situation storing an index of objects to a DynamoDB table is one option. The table contains metadata of the object, which user's data is in that file, and things like that, which can be used in the DynamoDB query to identify files that need to be processed.

![S3 index](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-index-dynamo.drawio.svg)

## S3 File Upload with API Gateway

When uploading files that are larger than API Gateway can handle, the following pattern is a one way to achieve it. The API Gateway and a Lambda function are used to generate a signed URL for the upload and returned to the client. That URL is then used to upload the file to the S3 bucket.

![S3 Upload](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-upload.drawio.svg)

CDK example: [examples/cdk/lib/s3-upload-file-stack.ts](examples/cdk/lib/s3-upload-file-stack.ts)

Client example: [examples/clients/upload-file-s3.ts](examples/clients/upload-file-s3.ts)

# Queues and Pipelines

## Dead Letter Queue (DLQ)

Asynchronously triggered Lambdas retries the execution automatically on failure a few times. To catch failed execution a dead letter queue is an option that can be used to notify failures, retry executions later, and keep the history of failed executions.

![Dead-letter-queue](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/queue-lambda-dlq.drawio.svg)

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

This also allows stacks to be portable between accounts, and don't rely on stack names to be the same.

![Cross-account EventBridge](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/ssm-infra-parameters.drawio.svg)

CDK example (export VPC details): [examples/cdk/lib/network-stack.ts](examples/cdk/lib/network-stack.ts#L33-L44)

Serverless example (import VPC details): [examples/serverless/api-database/serverless.yml](examples/serverless/api-database/serverless.yml#L64-L65)

CDK example (export database details): [examples/cdk/lib/database-stack.ts](examples/cdk/lib/database-stack.ts#L66-L84)

Serverless example (import database details): [examples/serverless/api-database/serverless.yml](examples/serverless/api-database/serverless.yml#L12-L35)
Serverless example (import database details): [examples/serverless/api-database/src/data-api/database.ts](examples/serverless/api-database/src/data-api/database.ts#L31-L36)
