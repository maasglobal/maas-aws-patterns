import { aws_ec2, aws_ssm, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class NetworkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create three tier VPC
    const vpc = new aws_ec2.Vpc(this, 'ContentVPC', {
      cidr: '10.0.0.0/16',
      maxAzs: 1, // use 2 for HA, 1 is for saving money and time in this example
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: aws_ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'application',
          subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: 'data',
          subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Export vpc id
    new aws_ssm.StringParameter(this, 'VpcIdParameter', {
      stringValue: vpc.vpcId,
      parameterName: '/examples/infra/vpc/id',
    });

    // Export private subnets
    vpc.privateSubnets.forEach((privateSubnet, index) => {
      new aws_ssm.StringParameter(this, `SubnetIdParameter${index}`, {
        stringValue: privateSubnet.subnetId,
        parameterName: `/examples/infra/vpc/private-subnet-${index}/id`,
      });
    });
  }
}
