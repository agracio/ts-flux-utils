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
            if (this._maxQueueLength > 0 && this._queue.length > this._maxQueueLength){
                let length = this._queue.length;
                this._queue = [];
                throw new Error(`Dispatcher queue ${length} exceeded allowed ${this._maxQueueLength}`);
            }
            // if (this._warnQueueLength > 0 && this._queue.length > this._warnQueueLength) {
            //     this._logWarning();
            // }
        }else {
            super.dispatch(payload);
            if (this._queue.length > 1) {
                let nextItem: TPayload = this._queue.shift();
                super.dispatch(nextItem);
            }
        }
    }
}