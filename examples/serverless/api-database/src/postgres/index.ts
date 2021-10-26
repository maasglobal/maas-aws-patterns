import { APIGatewayProxyEventV2 } from "aws-lambda";
import { Knex } from "knex";
import { knex } from "./database";

let client: Knex;

async function initClient() {
  if (!client) {
    client = await knex();
  }
}

export const handler = async (event: APIGatewayProxyEventV2) => {
  console.log(JSON.stringify(event, null, 2));
  await initClient();
  const postgresUsers = await client.select("usename").from("pg_catalog.pg_user");
  console.log(postgresUsers);
  return {
    statusCode: 200,
    body: JSON.stringify({ userCount: postgresUsers.length }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
