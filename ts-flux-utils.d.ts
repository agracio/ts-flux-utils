interface DispatcherOptions{
    maxQueueLength?: number,
    warnQueueLength?: number,
}

interface Payload{
    action: Action,
}

interface Action{
    type: string | symbol;
    data?: any
}

interface EventSubscription{
    addListener(listener: Function);
    removeListener(listener: Function);
}

declare module 'ts-flux-utils'{

    import * as flux from "flux";
    import {ReduceStore} from "flux/utils";

    export class Dispatcher<TPayload> extends flux.Dispatcher<TPayload>{

        /**
         * Create an instance of the Dispatcher class to use throughout the application.
         *
         * Specify a type in the 'TPayload' generic argument to use strongly-typed payloads,
         * otherwise specify 'any'
         *
         * Examples:
         *     var dispatcher = new flux.Dispatcher<any>()
         *     var typedDispatcher = new flux.Dispatcher<MyCustomActionType>()
         */
        constructor(options?: DispatcherOptions);

        /**
         * Get current queue size of items queued for dispatching
         */

        queueSize: number;

        /**
         * Registers a callback that will be invoked with every payload sent to the dispatcher.
         * Returns a string token to identify the callback to be used with waitFor() or unregister.
         */
        register(callback: (payload: TPayload) => void): string;

        /**
         * Unregisters a callback with the given ID token
         */
        unregister(id: string): void;

        /**
         * Waits for the callbacks with the specified IDs to be invoked before continuing execution
         * of the current callback. This method should only be used by a callback in response
         * to a dispatched payload.
         */
        waitFor(IDs: string[]): void;

        /**
         * Dispatches a payload to all registered callbacks
         */
        dispatch(payload: TPayload): void;

        /**
         * Gets whether the dispatcher is currently dispatching
         */
        isDispatching(): boolean;
    }

    export class Event implements EventSubscription{
        addListener(listener: Function);
        removeListener(listener: Function);
        emit(data: any): boolean;
    }

    export class MultiActionStore<T>{
        constructor(dispatcher: Dispatcher<Payload>);

        name: string;

        state: Readonly<T>;


        /**
         * Getter that exposes the state of this store or a specific key in state.
         * Supports deep object key lookup using `key1.key2.key3` dotted notation.
         */
        getState(stateKey?: string): Readonly<T>

        /**
         * Reduces the current state, and an action to the new state of this store.
         * All subclasses must implement this method.
         * This method should be pure and have no side-effects.
         */
        protected reduce(action: Payload);

        /**
         * Checks if two versions of state are the same.
         * You do not need to override this if your state is immutable.
         */
        //protected areEqual(one: T, two: T): boolean;

        protected createEvent(actionType: symbol | string, updateState?: boolean, stateKey?: string): EventSubscription;
        protected updateState(payload: Payload);
    }

    export class DispatcherAction implements Action{

        constructor(_type: string | symbol, _data?: any);

        type: string | symbol;

        data: any;
    }

    export class DispatcherPayload implements Payload{

        constructor(_action: Action);

        action: Action;
    }
}