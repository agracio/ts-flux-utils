export class DispatcherAction implements Action{

    constructor(private _type: string | symbol, private _data?: any){}

    public get type(): string | symbol{
        return this._type;
    }

    public get data(): any{
        return this._data;
    }
}

export class DispatcherPayload implements Payload{

    constructor(private _action: Action){}

    public get action(): Action{
        return this._action;
    }
}