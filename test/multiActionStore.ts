
import * as chai from 'chai';

import {MultiActionStore} from "../src/index";
import {Dispatcher} from "../src/index";

let expect = chai.expect;

const dispatcher = new Dispatcher<Payload>();

const ActionType: any = {
    StringActionType: 'StringActionType',
    SymbolActionType: Symbol('SymbolActionType')
};

class StatelessStore<T> extends MultiActionStore<T>{

    public get onStringEvent(): EventSubscription{
        return this.createEvent(ActionType.StringActionType);
    }

    public get onSymbolEvent(): EventSubscription{
        return this.createEvent(ActionType.SymbolActionType);
    }
}

describe('MultiActionStore', () => {
    it('create', function() {
        let store: MultiActionStore<any> = new MultiActionStore(dispatcher);
        expect(store).to.exist;
    });

    function addListener(event: EventSubscription, actionType: string | symbol, done){
        let listener = (data) =>{
            expect(data).to.equal('test');
            done();
        };
        event.addListener(listener);
        dispatcher.dispatch({action: {type: actionType, data: 'test'}});
        event.removeListener(listener);
    }

    function removeListener(event: EventSubscription, actionType: string | symbol, done){
        let dataArray: any[] = [];
        let listener = (data) =>{
            dataArray.push(data)
        };
        event.addListener(listener);
        dispatcher.dispatch({action: {type: actionType, data: 'test1'}});
        dispatcher.dispatch({action: {type: actionType, data: 'test2'}});
        event.removeListener(listener);
        dispatcher.dispatch({action: {type: actionType, data: 'test3'}});
        setTimeout(() =>{
            expect(dataArray).to.eql(['test1', 'test2']);
            done();
        }, 500);
    }

    it('add listener | string', (done) =>{
        let store: StatelessStore<any> = new StatelessStore(dispatcher);
        return addListener(store.onStringEvent, ActionType.StringActionType, done)
    });

    it('add listener | symbol', (done) =>{
        let store: StatelessStore<any> = new StatelessStore(dispatcher);
        return addListener(store.onSymbolEvent, ActionType.SymbolActionType, done)
    });

    it('remove listener | string', (done) =>{
        let store: StatelessStore<any> = new StatelessStore(dispatcher);
        return removeListener(store.onStringEvent, ActionType.StringActionType, done);
    });

    it('remove listener | symbol', (done) =>{
        let store: StatelessStore<any> = new StatelessStore(dispatcher);
        return removeListener(store.onSymbolEvent, ActionType.SymbolActionType, done);
    });
});
