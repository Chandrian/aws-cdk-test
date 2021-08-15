import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import * as lambda from '@aws-cdk/aws-lambda';

import { HitCounter } from '../lib/hitcounter';

test('DynamoDB Table Created', () => {
    const stack = new cdk.Stack();
    // WHEN
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromInline('test')
        })
    });
    // THEN
    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table"));
});

test('DynamoDB Table Created With Encryption', () => {
    const stack = new cdk.Stack();
    // WHEN
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromInline('test')
        })
    });
    // THEN
    expectCDK(stack).to(haveResource('AWS::DynamoDB::Table', {
        SSESpecification: {
            SSEEnabled: true
        }
    }));
});

test('Lambda Has Environment Variables', () => {
    const stack = new cdk.Stack();
    // WHEN
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromInline('test')
        })
    });
    // THEN
    expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
        Environment: {
            Variables: {
                DOWNSTREAM_FUNCTION_NAME: {
                    Ref: "TestFunction22AD90FC",
                },
                HITS_TABLE_NAME: {
                    Ref: "MyTestConstructHits24A357F0",
                }
            }
        }
    }));
})


test('read capacity can be configured', () => {
    const stack = new cdk.Stack();

    expect(() => {
        new HitCounter(stack, 'MyTestConstruct', {
            downstream: new lambda.Function(stack, 'TestFunction', {
                runtime: lambda.Runtime.NODEJS_12_X,
                handler: 'lambda.handler',
                code: lambda.Code.inline('test')
            }),
            readCapacity: 3
        });
    }).toThrowError(/readCapacity must be greater than 5 and lower than 20/);
});
