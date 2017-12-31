import {Dispatcher} from "./dispatcher";
import {Event} from './event';
import * as EventEmitter from 'events'
import {Utils} from "./utils";

interface EventDefinition{
    event: Event,
    updateState: boolean,
    stateKey?: string
}

export class MultiActionStore<T>{

    private _name: string = this.constructor['name'];
    private _eventEmitter: EventEmitter = new EventEmitter();
    private _events: Map<string | symbol, EventDefinition> = new Map<string, EventDefinition>();
    private _state: T = <T>{};

    public get name(): string{
        return this._name;
    }

    protected get state(): Readonly<T>{
        return this._state;
    }

    getState(stateKey?: string): Readonly<T>{
        if(stateKey){
            return Utils.getObjectByKey(this._state, stateKey);
        }
        return this._state;
    }


    constructor(private _dispatcher: Dispatcher<Payload>){
        this._eventEmitter.setMaxListeners(0);
        _dispatcher.register((payload) => {
            this.reduce(payload);
        });
    }

    protected reduce(payload: Payload){
        let eventDefinition = this.getEvent(payload.action.type);

        this.updateState(payload);

        if(eventDefinition) {
            eventDefinition.event.emit(payload.action.data);
        }
    }

    protected updateState(payload: Payload) {
        let eventDefinition = this.getEvent(payload.action.type);
        if(eventDefinition){
            if(eventDefinition.updateState){
                if(eventDefinition.stateKey){
                    this._state[eventDefinition.stateKey] = payload.action.data;
                }else{
                    this._state = payload.action.data;
                }
            }
        }
    }

    protected createEvent(actionType: symbol | string, updateState: boolean = false, stateKey?: string): EventSubscription{
        let name: string | symbol = this.getEventName(actionType);

        if(!this._events.has(name)){
            this._events.set(name, {
                event: new Event(this._eventEmitter, name),
                updateState: updateState,
                stateKey: stateKey
            });
        }
        return this._events.get(name).event;
    }

    private getEventName = (actionType: symbol | string): string | symbol =>{
        if(typeof actionType === 'symbol'){
            return actionType;
        }else{
            return `${this._name}-${actionType}`
        }
    };

    private getEvent = (actionType: symbol | string) =>{
        let name: string | symbol = this.getEventName(actionType);
        return this._events.get(name);
    };
}