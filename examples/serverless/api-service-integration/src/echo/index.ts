import { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
  console.log(JSON.stringify(event, null, 2));
};
