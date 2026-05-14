import { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchCultureEvents } from '../api/mapApi';
import type { CultureEvent } from '../types/map';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: CultureEvent[] }
  | { status: 'error' };

export const useCultureEvents = (latitude: number | null, longitude: number | null) => {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    const controller = new AbortController();

    fetchCultureEvents(latitude, longitude, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data });
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setState({ status: 'error' });
      });

    return () => controller.abort();
  }, [latitude, longitude]);

  return state;
};
