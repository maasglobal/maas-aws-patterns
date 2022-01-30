import { aws_ec2, aws_rds, aws_secretsmanager, aws_ssm, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface DatabaseProps extends StackProps {
  vpc: aws_ec2.IVpc;
}

export class DatabaseStack extends Stack {
  constructor(scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id, props);
    const { vpc } = props;

    const secret = new aws_secretsmanager.Secret(this, 'ClusterSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'master_user' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
      },
    });

    const clusterSecurityGroup = new aws_ec2.SecurityGroup(this, 'ClusterSecurityGroup', { vpc });

    vpc.privateSubnets.forEach((privateSubnet) => {
      clusterSecurityGroup.addIngressRule(
        aws_ec2.Peer.ipv4(privateSubnet.ipv4CidrBlock),
        aws_ec2.Port.tcp(5432),
        `Allow private subnet ${privateSubnet.availabilityZone}`
      );
    });

    const cluster = new aws_rds.ServerlessCluster(this, 'Cluster', {
      enableDataApi: true,
      deletionProtection: true,
      engine: aws_rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: aws_rds.ParameterGroup.fromParameterGroupName(
        this,
        'ParameterGroup',
        'default.aurora-postgresql10'
      ),
      securityGroups: [clusterSecurityGroup],
      vpc,
      vpcSubnets: {
        subnetGroupName: 'data',
      },
      scaling: {
        autoPause: Duration.minutes(15),
        minCapacity: aws_rds.AuroraCapacityUnit.ACU_2,
        maxCapacity: aws_rds.AuroraCapacityUnit.ACU_16,
      },
      credentials: aws_rds.Credentials.fromSecret(secret),
    });

    new aws_ssm.StringParameter(this, 'ClusterSecretArnParameter', {
      stringValue: secret.secretArn,
      parameterName: '/examples/infra/database/secret/arn',
    });

    new aws_ssm.StringParameter(this, 'ClusterEndpointHostParameter', {
      stringValue: cluster.clusterEndpoint.hostname,
      parameterName: '/examples/infra/database/endpoint/hostname',
    });

    new aws_ssm.StringParameter(this, 'ClusterClusterArnParameter', {
      stringValue: cluster.clusterArn,
      parameterName: '/examples/infra/database/cluster/arn',
    });

    new aws_ssm.StringParameter(this, 'ClusterSecurityGroupIdParameter', {
      stringValue: clusterSecurityGroup.securityGroupId,
      parameterName: '/examples/infra/database/security-group/id',
    });
  }
}
