import * as flux from "flux";

export class Dispatcher<TPayload> extends flux.Dispatcher<TPayload> {

    private _queue: TPayload[] = [];
    private _maxQueueLength: number = 0;
    private _warnQueueLength: number = 0;

    constructor(options?: DispatcherOptions){
        super();
        if(options){
            this._maxQueueLength = options.maxQueueLength || 0;
            this._warnQueueLength = options.warnQueueLength || 0;
        }
    }

    public dispatch(payload: TPayload): void {
        if (this.isDispatching()) {
            this._queue.push(payload);
            let length = this._queue.length;
            if (this._maxQueueLength > 0 && length > this._maxQueueLength){
                this._queue = [];
                throw `Dispatcher queue ${length} exceeds allowed ${this._maxQueueLength}`;
            }
            if (this._warnQueueLength > 0 && length > this._warnQueueLength) {
                console.warn(`Dispatcher queue ${length} exceeds ${this._warnQueueLength}`);
            }
        }else {
            super.dispatch(payload);
            if (this._queue.length > 1) {
                let nextItem: TPayload = this._queue.shift();
                super.dispatch(nextItem);
            }
        }
    }
}