import Knex from "knex";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const region =
  process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "eu-west-1";

const ssm = new SSMClient({
  region,
});

const secretsManager = new SecretsManagerClient({ region });

const client = ({ host, user, password }) => {
  const _knex = Knex({
    client: "pg",
    connection: Object.assign({
      host,
      port: 5432,
      user,
      password,
      database: "postgres",
    }),
  });
  return _knex;
};

export const knex = async () => {
  const clusterNameParameter = await ssm.send(
    new GetParameterCommand({
      Name: "/examples/infra/database/endpoint/hostname",
    })
  );
  const secretParameter = await ssm.send(
    new GetParameterCommand({ Name: "/examples/infra/database/secret/arn" })
  );

  const databaseCredentials = await secretsManager.send(
    new GetSecretValueCommand({
      SecretId: secretParameter.Parameter?.Value,
    })
  );

  const { username, password } = JSON.parse(
    databaseCredentials.SecretString as string
  );

  if (
    !clusterNameParameter.Parameter?.Value ||
    !secretParameter.Parameter?.Value
  ) {
    throw new Error("Failed to fetch SSM parameters");
  }

  return client({
    host: clusterNameParameter.Parameter?.Value,
    user: username,
    password,
  });
};
