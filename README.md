# Introduction

This is a collection of backend infrastructure and architecture design patterns that are considered best practices when we do development in MaaS Global.

# S3

## S3 File Upload with API Gateway

When uploading files that are larger than API Gateway can handle, the following pattern is a one way to achieve it. The API Gateway and a Lambda function are used to generate a signed URL for the upload and returned to the client. That URL is then used to upload the file to the S3 bucket.

![S3 Upload](https://github.com/laardee/maas-aws-patterns/blob/main/diagrams/s3-upload.drawio.svg)
