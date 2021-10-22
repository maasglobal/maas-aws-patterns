import { aws_ec2, aws_ssm, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class NetworkStack extends Stack {
  public vpc: aws_ec2.Vpc;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create three tier VPC
    this.vpc = new aws_ec2.Vpc(this, 'ContentVPC', {
      cidr: '10.1.0.0/16',
      maxAzs: 2,
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
      stringValue: this.vpc.vpcId,
      parameterName: '/examples/infra/vpc/id',
    });

    // Export private subnets
    this.vpc.privateSubnets.forEach((privateSubnet, index) => {
      new aws_ssm.StringParameter(this, `SubnetIdParameter${index}`, {
        stringValue: privateSubnet.subnetId,
        parameterName: `/examples/infra/vpc/private-subnet-${index}/id`,
      });
    });
  }
}
