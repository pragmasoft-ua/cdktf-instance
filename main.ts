import { DataAwsAmi } from "@cdktf/provider-aws/lib/data-aws-ami";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { KeyPair } from "@cdktf/provider-aws/lib/key-pair";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { File } from "@cdktf/provider-local/lib/file";
import { LocalProvider } from "@cdktf/provider-local/lib/provider";
import { PrivateKey } from "@cdktf/provider-tls/lib/private-key";
import { TlsProvider } from "@cdktf/provider-tls/lib/provider";
import { App, TerraformOutput, TerraformStack } from "cdktf";
import { Construct } from "constructs";

class AwsStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "AWS");
    new TlsProvider(this, "tls");
    new LocalProvider(this, "local");

    const amazonLinuxAmi = new DataAwsAmi(this, "amazonLinuxAmi", {
      mostRecent: true,
      owners: ["amazon"],
      filter: [{ name: "name", values: ["al2022-ami-minimal-*-x86_64"] }],
    });

    const ecdsaKey = new PrivateKey(this, "ecdsaKey", {
      algorithm: "ED25519",
    });

    const keyPair = new KeyPair(this, "keyPair", {
      keyName: "tf-key-pair",
      publicKey: ecdsaKey.publicKeyOpenssh,
    });

    new File(this, "privateKey", {
      filename: "tf.pem",
      content: ecdsaKey.privateKeyOpenssh,
    });

    const securityGroup = new SecurityGroup(this, "ssh", {
      name: "ssh",
      ingress: [
        // only allow incoming traffic from ssh
        {
          protocol: "TCP",
          fromPort: 22,
          toPort: 22,
          cidrBlocks: ["0.0.0.0/0"],
          ipv6CidrBlocks: ["::/0"],
        },
      ],
      egress: [
        // allow all outgoing traffic
        {
          fromPort: 0,
          toPort: 0,
          protocol: "-1",
          cidrBlocks: ["0.0.0.0/0"],
          ipv6CidrBlocks: ["::/0"],
        },
      ],
    });

    const ec2Instance = new Instance(this, "compute", {
      ami: amazonLinuxAmi.id,
      instanceType: "t3.micro",
      keyName: keyPair.keyName,
      vpcSecurityGroupIds: [securityGroup.id],
    });

    new TerraformOutput(this, "public_ip", {
      value: ec2Instance.publicIp,
    });

    new TerraformOutput(this, "pubkey", {
      value: keyPair.publicKey,
      sensitive: false,
    });

    new TerraformOutput(this, "ami", {
      value: amazonLinuxAmi.id,
    });
  }
}

const app = new App();
new AwsStack(app, "awsstack");
app.synth();
