
import * as EventEmitter from 'events'

export class Event implements EventSubscription{

    constructor(private _emitter: EventEmitter, private _event: string | symbol){

    }

    public addListener(listener: Function){
        return this._emitter.addListener(this._event, listener);
    }

    public removeListener(listener: Function){
        return this._emitter.removeListener(this._event, listener);
    }

    public emit(data: any): boolean{
        return this._emitter.emit(this._event, data);
    }
}