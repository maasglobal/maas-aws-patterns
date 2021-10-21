import { APIGatewayProxyEventV2 } from 'aws-lambda';

export const handler = (
  event: APIGatewayProxyEventV2
) => {
  console.log(JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    body: JSON.stringify({ event }),
  };
};
