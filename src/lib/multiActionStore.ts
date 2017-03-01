import {Dispatcher} from "./dispatcher";
import {Event} from './event';
import * as EventEmitter from 'events'
import * as Immutable from 'immutable';

interface EventDictionary{
    [event: string]: EventDefinition
}

interface EventDefinition{
    event: Event,
    updateState: boolean,
    stateKey?: string
}

export class MultiActionStore<T>{

    private _name: string = this.constructor.name;
    private _eventEmitter: EventEmitter = new EventEmitter();
    private _events: EventDictionary = <EventDictionary>{};
    private _state: T = <T>{};

    public get name(): string{
        return this._name;
    }

    protected get state(): T{
        return this._state;
    }

    getState(): T{
        // console.log(this._state);
        // let record = Immutable.Record(this._state);
        //Immutable.fromJS(this._state)
        // console.log(myHash.toObject())
        // console.log(new record());
        //return JSON.parse(JSON.stringify(this._state));
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

        if(!this._events[name]){
            this._events[name] = {
                event: new Event(this._eventEmitter, name),
                updateState: updateState,
                stateKey: stateKey
            };
        }
        return this._events[name].event;
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
        return this._events[name];
    };
}