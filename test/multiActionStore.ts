
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

class SimpleStateStore<T> extends MultiActionStore<T>{

    public get onStringEvent(): EventSubscription{
        return this.createEvent(ActionType.StringActionType, true);
    }
}

class StatefulStore<T> extends MultiActionStore<T>{

    public get onStringEvent(): EventSubscription{
        return this.createEvent(ActionType.StringActionType, true, 'key1');
    }

    public get onSymbolEvent(): EventSubscription{
        return this.createEvent(ActionType.SymbolActionType, true, 'key2');
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
        }, 200);
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

    it('simple state', (done) =>{
        let store: SimpleStateStore<any> = new SimpleStateStore(dispatcher);
        let listener = (data) =>{
            expect(data).to.equal('test');
            expect(store.getState()).to.equal('test');
            done();
        };
        store.onStringEvent.addListener(listener);
        dispatcher.dispatch({action: {type: ActionType.StringActionType, data: 'test'}});
        store.onStringEvent.removeListener(listener);
        store = null;
    });

    it('keyed state', (done) =>{
        let store: StatefulStore<any> = new StatefulStore(dispatcher);
        let listener1 = (data) =>{
            expect(data).to.eql('test1');
            expect(store.getState()).to.eql({key1: 'test1'});

        };
        let listener2 = (data) =>{
            expect(data).to.eql('test2');
            expect(store.getState()).to.eql({key1: 'test1', key2: 'test2'});
            done();
        };
        store.onStringEvent.addListener(listener1);
        store.onSymbolEvent.addListener(listener2);
        dispatcher.dispatch({action: {type: ActionType.StringActionType, data: 'test1'}});
        dispatcher.dispatch({action: {type: ActionType.SymbolActionType, data: 'test2'}});
        store.onStringEvent.removeListener(listener1);
        store.onSymbolEvent.removeListener(listener2);
        store = null;
    });
});
