import { APIGatewayProxyEventV2, SNSEvent, SQSEvent } from 'aws-lambda';

export const handler = (
  event: SQSEvent | SNSEvent | APIGatewayProxyEventV2
) => {
  console.log(JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    body: JSON.stringify({ event }),
  };
};
