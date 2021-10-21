#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { S3MultipleSubscriptionsStack } from '../lib/s3-multiple-subscriptions-stack';
import { S3SingleSubscriptionStack } from '../lib/s3-single-subscription-stack';

const app = new cdk.App();
new NetworkStack(app, 'example-network', {});
new S3MultipleSubscriptionsStack(app, 'example-s3-multiple-subscriptions', {});
new S3SingleSubscriptionStack(app, 'example-s3-single-subscription', {});
