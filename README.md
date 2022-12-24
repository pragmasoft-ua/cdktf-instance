# CDK for Terraform stack starts one t3.micro aws instance

https://developer.hashicorp.com/terraform/cdktf

## Stack

1. Retrieves latest 2022 Amazon Linux AMI id
2. Generates ecdsa key pair, stores private key locally
3. Creates security group allowing ssh access to 22 port
4. Creates t3.micro instance attached to this security group

## Compile

`npm run get` Import/update Terraform providers and modules (you should check-in this directory)
`npm run compile` Compile typescript code to javascript (or "npm run watch")
`npm run watch` Watch for changes and compile typescript in the background
`npm run build` Compile typescript

## Synthesize

`cdktf synth [stack]` Synthesize Terraform resources from stacks to cdktf.out/ (ready for 'terraform apply')

## Diff

`cdktf diff [stack]` Perform a diff (terraform plan) for the given stack

## Deploy

`cdktf deploy [stack]  Deploy the given stack`

## Destroy

`cdktf destroy [stack] Destroy the stack`

## Test

`npm run test` Runs unit tests (edit **tests**/main-test.ts to add your own tests)
`npm run test:watch` Watches the tests and reruns them on change

## Upgrades

`npm run upgrade` Upgrade cdktf modules to latest version
`npm run upgrade:next` Upgrade cdktf modules to latest "@next" version (last commit)

## Output

Stack output will provide instance's public ip

## Connect to instance

`ssh -i cdktf.out\stacks\awsstack\tf.pem ec2-user@<public-ip>`

Check ip address

`curl https://api.ipify.org/`

## Destroy stack

`cdktf destroy`
