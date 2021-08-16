import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const target = 'x86_64-unknown-linux-musl';
        const hello = new lambda.Function(this, 'HelloHandler', {
            code: lambda.Code.fromAsset('lambda/hello', {
                bundling: {
                    command: [
                        'bash', '-c',
                        `rustup target add ${target} && cargo build --release --target ${target} && cp target/${target}/release/hello /asset-output/bootstrap`
                    ],
                    image: cdk.DockerImage.fromRegistry('rust:1.54-slim')
                }
            }),
            functionName: 'hello',
            handler: 'main',
            runtime: lambda.Runtime.PROVIDED_AL2  // defines an AWS Lambda resource
        });


        const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
            downstream: hello
        });

        // defines an API Gateway REST API resource backed by our "hello" function.
        new apigw.LambdaRestApi(this, 'Endpoint', {
            handler: helloWithCounter.handler
        });
        new TableViewer(this, 'ViewHitCounter', {
            title: 'Hello Hits',
            table: helloWithCounter.table,
            sortBy: '-hits',
        });
    }
}
