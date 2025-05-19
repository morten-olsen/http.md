import { EventEmitter } from 'eventemitter3';
import React, { createContext, useRef, useSyncExternalStore } from 'react';

type StateEvents = {
  update: () => void;
};

class State<T> extends EventEmitter<StateEvents> {
  state: T;

  constructor(initialState: T) {
    super();
    this.state = initialState;
  }

  public get value() {
    return this.state;
  }

  public setState = (state: T) => {
    this.state = state;
    this.emit('update');
  };

  public subscribe = (callback: () => void) => {
    this.on('update', callback);
    return () => {
      this.off('update', callback);
    };
  };
}

type StateContextValue<T> = {
  state: State<T>;
};

const StateContext = createContext<StateContextValue<ExpectedAny> | null>(null);

type StateProviderProps<T> = {
  state: State<T>;
  children: React.ReactNode;
};

const StateProvider = <T,>({ state, children }: StateProviderProps<T>) => {
  return <StateContext.Provider value={{ state }}>{children}</StateContext.Provider>;
};

const useStateContext = <T = ExpectedAny,>() => {
  const context = React.useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context as StateContextValue<T>;
};

const useStateValue = <T = ExpectedAny,>(selector: (state: T) => ExpectedAny = (state) => state) => {
  const context = useStateContext<T>();
  const value = useRef<T>(selector(context.state.value));
  useSyncExternalStore(
    context.state.subscribe,
    () => {
      const next = selector(context.state.value);
      if (next !== value.current) {
        value.current = next;
      }
      return value.current;
    },
    () => value.current,
  );

  return value.current;
};

export { State, StateProvider, useStateContext, useStateValue };
