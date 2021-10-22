import '@aws-cdk/assert-internal/jest';
import * as cdk from '@aws-cdk/core';
import { DatabaseClusterEngine, ParameterGroup } from '../lib';

describe('parameter group', () => {
  test("does not create a parameter group if it wasn't bound to a cluster or instance", () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    new ParameterGroup(stack, 'Params', {
      engine: DatabaseClusterEngine.AURORA,
      description: 'desc',
      parameters: {
        key: 'value',
      },
    });

    // THEN
    expect(stack).toCountResources('AWS::RDS::DBParameterGroup', 0);
    expect(stack).toCountResources('AWS::RDS::DBClusterParameterGroup', 0);


  });

  test('create a parameter group when bound to an instance', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const parameterGroup = new ParameterGroup(stack, 'Params', {
      engine: DatabaseClusterEngine.AURORA,
      description: 'desc',
      parameters: {
        key: 'value',
      },
    });
    parameterGroup.bindToInstance({});

    // THEN
    expect(stack).toHaveResource('AWS::RDS::DBParameterGroup', {
      Description: 'desc',
      Family: 'aurora5.6',
      Parameters: {
        key: 'value',
      },
    });


  });

  test('create a parameter group when bound to a cluster', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const parameterGroup = new ParameterGroup(stack, 'Params', {
      engine: DatabaseClusterEngine.AURORA,
      description: 'desc',
      parameters: {
        key: 'value',
      },
    });
    parameterGroup.bindToCluster({});

    // THEN
    expect(stack).toHaveResource('AWS::RDS::DBClusterParameterGroup', {
      Description: 'desc',
      Family: 'aurora5.6',
      Parameters: {
        key: 'value',
      },
    });


  });

  test('creates 2 parameter groups when bound to a cluster and an instance', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const parameterGroup = new ParameterGroup(stack, 'Params', {
      engine: DatabaseClusterEngine.AURORA,
      description: 'desc',
      parameters: {
        key: 'value',
      },
    });
    parameterGroup.bindToCluster({});
    parameterGroup.bindToInstance({});

    // THEN
    expect(stack).toCountResources('AWS::RDS::DBParameterGroup', 1);
    expect(stack).toCountResources('AWS::RDS::DBClusterParameterGroup', 1);


  });

  test('Add an additional parameter to an existing parameter group', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const clusterParameterGroup = new ParameterGroup(stack, 'Params', {
      engine: DatabaseClusterEngine.AURORA,
      description: 'desc',
      parameters: {
        key1: 'value1',
      },
    });
    clusterParameterGroup.bindToCluster({});

    clusterParameterGroup.addParameter('key2', 'value2');

    // THEN
    expect(stack).toHaveResource('AWS::RDS::DBClusterParameterGroup', {
      Description: 'desc',
      Family: 'aurora5.6',
      Parameters: {
        key1: 'value1',
        key2: 'value2',
      },
    });


  });
});
