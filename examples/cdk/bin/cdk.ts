#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { S3MultipleSubscriptionsStack } from "../lib/s3-multiple-subscriptions-stack";

const app = new cdk.App();
new S3MultipleSubscriptionsStack(app, "s3-multiple-subscriptions-stack", {});
