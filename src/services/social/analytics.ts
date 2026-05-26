import { createId } from '../../lib/id';
import type { AnalyticsEvent, AnalyticsEventName } from '../../types/social';

export type AnalyticsSink = {
  track: (event: AnalyticsEvent) => void;
};

const consoleSink: AnalyticsSink = {
  track: (event) => {
    if (__DEV__) {
      console.log('[analytics]', event.name, event.properties ?? {});
    }
  },
};

let sink: AnalyticsSink = consoleSink;

export function setAnalyticsSink(nextSink: AnalyticsSink) {
  sink = nextSink;
}

export function createAnalyticsEvent(name: AnalyticsEventName, properties?: AnalyticsEvent['properties']): AnalyticsEvent {
  return {
    id: createId('event'),
    name,
    properties,
    timestamp: new Date().toISOString(),
  };
}

export function trackEvent(name: AnalyticsEventName, properties?: AnalyticsEvent['properties']) {
  const event = createAnalyticsEvent(name, properties);
  sink.track(event);
  return event;
}
