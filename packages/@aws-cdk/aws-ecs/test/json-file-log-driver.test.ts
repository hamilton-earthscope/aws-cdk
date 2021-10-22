import '@aws-cdk/assert-internal/jest';
import * as cdk from '@aws-cdk/core';
import * as ecs from '../lib';

let stack: cdk.Stack;
let td: ecs.TaskDefinition;
const image = ecs.ContainerImage.fromRegistry('test-image');

describe('json file log driver', () => {
  beforeEach(() => {
    stack = new cdk.Stack();
    td = new ecs.Ec2TaskDefinition(stack, 'TaskDefinition');


  });

  test('create a json-file log driver with options', () => {
    // WHEN
    td.addContainer('Container', {
      image,
      logging: new ecs.JsonFileLogDriver({
        env: ['hello'],
      }),
      memoryLimitMiB: 128,
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::ECS::TaskDefinition', {
      ContainerDefinitions: [
        {
          LogConfiguration: {
            LogDriver: 'json-file',
            Options: {
              env: 'hello',
            },
          },
        },
      ],
    });


  });

  test('create a json-file log driver without options', () => {
    // WHEN
    td.addContainer('Container', {
      image,
      logging: new ecs.JsonFileLogDriver(),
      memoryLimitMiB: 128,
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::ECS::TaskDefinition', {
      ContainerDefinitions: [
        {
          LogConfiguration: {
            LogDriver: 'json-file',
          },
        },
      ],
    });


  });

  test('create a json-file log driver using json-file', () => {
    // WHEN
    td.addContainer('Container', {
      image,
      logging: ecs.LogDrivers.jsonFile(),
      memoryLimitMiB: 128,
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::ECS::TaskDefinition', {
      ContainerDefinitions: [
        {
          LogConfiguration: {
            LogDriver: 'json-file',
            Options: {},
          },
        },
      ],
    });


  });
});
