import {Dispatcher} from "./dispatcher";
import {ReduceStore} from "flux/utils";
import {Event} from './event';
import * as EventEmitter from 'events'

export class MultiActionStore<T> extends ReduceStore<T, Payload>{

    private _name: string = this.constructor['name'];
    private _eventEmitter: EventEmitter = new EventEmitter();
    private _events: {[event: string]: Event} = {};

    public get name(): string{
        return this._name;
    }

    getInitialState(): T{
        return <T>{};
    }

    constructor(private _dispatcher: Dispatcher<Payload>){
        super(_dispatcher);
    }

    reduce(state: T, payload: Payload){
        let name: string = this.getEventName(payload.action.type);
        let event = this._events[name];
        if(event) event.emit(payload.action.data);
        return state;
    }

    protected createEvent(actionType: symbol | string): Event{
        let name: string = this.getEventName(actionType);

        if(!this._events[name]){
            this._events[name] = new Event(this._eventEmitter, name);
        }
        return this._events[name];
    }

    private getEventName = (actionType: symbol | string): string =>{
        if(typeof actionType === 'symbol'){
            return `${this._name}-${actionType.toString().replace('Symbol(', '').replace(')', '')}`;
        }else{
            return `${this._name}-${actionType}`
        }
    };
}