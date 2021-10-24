#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { DatabaseStack } from '../lib/database-stack';
import { S3MultipleSubscriptionsStack } from '../lib/s3-multiple-subscriptions-stack';
import { S3SingleSubscriptionStack } from '../lib/s3-single-subscription-stack';
import { S3UploadFileStack } from '../lib/s3-upload-file-stack';

const app = new cdk.App();
const network = new NetworkStack(app, 'example-network', {});
new DatabaseStack(app, 'example-database', { vpc: network.vpc });
new S3MultipleSubscriptionsStack(app, 'example-s3-multiple-subscriptions', {});
new S3SingleSubscriptionStack(app, 'example-s3-single-subscription', {});
new S3UploadFileStack(app, 'example-s3-upload-file', {});
