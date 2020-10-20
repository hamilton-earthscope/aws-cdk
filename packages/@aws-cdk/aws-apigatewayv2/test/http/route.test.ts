import '@aws-cdk/assert/jest';
import { Stack } from '@aws-cdk/core';
import {
  HttpApi, HttpIntegrationType, HttpMethod, HttpRoute, HttpRouteIntegrationConfig, HttpRouteKey, IHttpRouteIntegration,
  PayloadFormatVersion, CfnAuthorizer,
} from '../../lib';

describe('HttpRoute', () => {
  test('default', () => {
    const stack = new Stack();
    const httpApi = new HttpApi(stack, 'HttpApi');

    new HttpRoute(stack, 'HttpRoute', {
      httpApi,
      integration: new DummyIntegration(),
      routeKey: HttpRouteKey.with('/books', HttpMethod.GET),
    });

    expect(stack).toHaveResource('AWS::ApiGatewayV2::Route', {
      ApiId: stack.resolve(httpApi.httpApiId),
      RouteKey: 'GET /books',
      Target: {
        'Fn::Join': [
          '',
          [
            'integrations/',
            {
              Ref: 'HttpRouteHttpRouteIntegration6EE0FE47',
            },
          ],
        ],
      },
    });

    expect(stack).toHaveResource('AWS::ApiGatewayV2::Integration', {
      ApiId: stack.resolve(httpApi.httpApiId),
    });
  });

  test('integration is configured correctly', () => {
    const stack = new Stack();
    const httpApi = new HttpApi(stack, 'HttpApi');

    new HttpRoute(stack, 'HttpRoute', {
      httpApi,
      integration: new DummyIntegration(),
      routeKey: HttpRouteKey.with('/books', HttpMethod.GET),
    });

    expect(stack).toHaveResource('AWS::ApiGatewayV2::Integration', {
      ApiId: stack.resolve(httpApi.httpApiId),
      IntegrationType: 'HTTP_PROXY',
      PayloadFormatVersion: '2.0',
      IntegrationUri: 'some-uri',
    });
  });

  test('throws when path not start with /', () => {
    const stack = new Stack();
    const httpApi = new HttpApi(stack, 'HttpApi');

    expect(() => new HttpRoute(stack, 'HttpRoute', {
      httpApi,
      integration: new DummyIntegration(),
      routeKey: HttpRouteKey.with('books', HttpMethod.GET),
    })).toThrowError(/path must always start with a "\/" and not end with a "\/"/);
  });

  test('throws when path ends with /', () => {
    const stack = new Stack();
    const httpApi = new HttpApi(stack, 'HttpApi');

    expect(() => new HttpRoute(stack, 'HttpRoute', {
      httpApi,
      integration: new DummyIntegration(),
      routeKey: HttpRouteKey.with('/books/', HttpMethod.GET),
    })).toThrowError(/path must always start with a "\/" and not end with a "\/"/);
  });

  test('authorizer is configured correctly', () => {
    const stack = new Stack();
    const httpApi = new HttpApi(stack, 'HttpApi');

    const authorizer = new CfnAuthorizer(stack, 'authorizer', {
      apiId: httpApi.httpApiId,
      authorizerType: 'JWT',
      name: 'my-authorizer',
      identitySource: ['$request.header.Authorization'],
    });

    new HttpRoute(stack, 'HttpRoute', {
      httpApi,
      integration: new DummyIntegration(),
      routeKey: HttpRouteKey.with('/books', HttpMethod.GET),
      authorizer,
    });

    expect(stack).toHaveResource('AWS::ApiGatewayV2::Authorizer', {
      ApiId: stack.resolve(httpApi.httpApiId),
      AuthorizerType: 'JWT',
      name: 'my-authorizer',
    });
  });

});

class DummyIntegration implements IHttpRouteIntegration {
  public bind(): HttpRouteIntegrationConfig {
    return {
      type: HttpIntegrationType.HTTP_PROXY,
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
      uri: 'some-uri',
      method: HttpMethod.DELETE,
    };
  }
}