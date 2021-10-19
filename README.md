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
  * [S3 File Upload with API Gateway](#s3-file-upload-with-api-gateway)
- [Queues](#queues)
  * [Dead Letter Queue (DLQ)](#dead-letter-queue-dlq)

# Introduction

This is a collection of backend infrastructure and architecture design patterns that are considered best practices when we do development in MaaS Global.

# API

## API with a custom authorizer

A custom authorizer Lambda is a function that validates a header from the requests. Usually, this header name is Authorization and the value is a Json Web Token which is signed and expires after a certain time.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/api-custom-authorizer.drawio.svg)

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

## S3 bucket event trigger with a single subscription

If it’s known that there is no possibility that multiple processors would subscribe to S3 events, an SQS or a Lambda trigger can be used in the subscription.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-single-subscription.drawio.svg)

## S3 File Upload with API Gateway

When uploading files that are larger than API Gateway can handle, the following pattern is a one way to achieve it. The API Gateway and a Lambda function are used to generate a signed URL for the upload and returned to the client. That URL is then used to upload the file to the S3 bucket.

![S3 Upload](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-upload.drawio.svg)

# Queues

## Dead Letter Queue (DLQ)

Asynchronously triggered Lambdas retries the execution automatically on failure a few times. To catch failed execution a dead letter queue is an option that can be used to notify failures, retry executions later, and keep the history of failed executions.

![Custom authorizer](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/queue-lambda-dlq.drawio.svg)
