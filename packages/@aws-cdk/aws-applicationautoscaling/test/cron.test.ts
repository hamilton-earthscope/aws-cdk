import { Duration, Stack, Lazy } from '@aws-cdk/core';
import * as appscaling from '../lib';

describe('cron', () => {
  test('test utc cron, hour only', () => {
    expect(appscaling.Schedule.cron({ hour: '18', minute: '0' }).expressionString).toEqual('cron(0 18 * * ? *)');

  });

  test('test utc cron, hour and minute', () => {
    expect(appscaling.Schedule.cron({ hour: '18', minute: '24' }).expressionString).toEqual('cron(24 18 * * ? *)');

  });

  test('rate must be whole number of minutes', () => {
    expect(() => {
      appscaling.Schedule.rate(Duration.minutes(0.13456));
    }).toThrow(/'0.13456 minutes' cannot be converted into a whole number of seconds/);

  });

  test('rate can be in seconds', () => {
    const duration = appscaling.Schedule.rate(Duration.seconds(120));
    expect('rate(2 minutes)').toEqual(duration.expressionString);

  });

  test('rate must not be in seconds when specified as a token', () => {
    expect(() => {
      appscaling.Schedule.rate(Duration.seconds(Lazy.number({ produce: () => 5 })));
    }).toThrow(/Allowed units for scheduling/);

  });

  test('rate cannot be 0', () => {
    expect(() => {
      appscaling.Schedule.rate(Duration.days(0));
    }).toThrow(/Duration cannot be 0/);

  });

  test('rate can be token', () => {
    const stack = new Stack();
    const lazyDuration = Duration.minutes(Lazy.number({ produce: () => 5 }));
    const rate = appscaling.Schedule.rate(lazyDuration);
    expect('rate(5 minutes)').toEqual(stack.resolve(rate).expressionString);

  });

  test('rate can be in allowed type hours', () => {
    expect('rate(1 hour)').toEqual(appscaling.Schedule.rate(Duration.hours(1))
      .expressionString);

  });
});
