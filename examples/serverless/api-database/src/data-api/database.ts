import Knex from 'knex';
// @ts-ignore
import knexDataApiClient from 'knex-aurora-data-api-client';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'eu-west-1';

const ssm = new SSMClient({
  region,
});

const client = (params?: any) => {
  const _knex = Knex({
    client: knexDataApiClient.postgres,
    connection: Object.assign(
      {
        // @ts-ignore
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: 'postgres',
        region,
      },
      params.connection || {}
    ),
  });
  return _knex;
};

export const knex = async () => {
  const clusterArnParameter = await ssm.send(new GetParameterCommand({ Name: '/examples/infra/database/cluster/arn' }));
  const secretParameter = await ssm.send(new GetParameterCommand({ Name: '/examples/infra/database/secret/arn' }));

  if (!clusterArnParameter.Parameter?.Value || !secretParameter.Parameter?.Value) {
    throw new Error('Failed to fetch SSM parameters');
  }

  return client({
    connection: {
      secretArn: secretParameter.Parameter?.Value,
      resourceArn: clusterArnParameter.Parameter?.Value,
    },
  });
};
