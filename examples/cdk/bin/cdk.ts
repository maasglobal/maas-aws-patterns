#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { S3MultipleSubscriptionsStack } from '../lib/s3-multiple-subscriptions-stack';
import { S3SingleSubscriptionStack } from '../lib/s3-single-subscription-stack';

const app = new cdk.App();
new S3MultipleSubscriptionsStack(app, 's3-multiple-subscriptions', {});
new S3SingleSubscriptionStack(app, 's3-single-subscription', {});
