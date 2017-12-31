
import * as chai from 'chai';

import {Dispatcher} from "../lib/dispatcher";
import {MultiActionStore} from "../lib/multiActionStore";

let expect = chai.expect;

const dispatcher = new Dispatcher<Payload>();

const ActionType: any = {
    Action1: 'Action1',
    Action2: 'Action2'
};

class StatelessStore<T> extends MultiActionStore<T>{

    public get onStringEvent(): EventSubscription{
        return this.createEvent(ActionType.Action1);
    }

    public get onSymbolEvent(): EventSubscription{
        return this.createEvent(ActionType.Action2);
    }
}

class SimpleStateStore<T> extends MultiActionStore<T>{

    public get onStringEvent(): EventSubscription{
        return this.createEvent(ActionType.Action1, true);
    }
}

class StatefulStore<T> extends MultiActionStore<T>{

    public get onStringEvent(): EventSubscription{
        return this.createEvent(ActionType.Action1, true, 'key1');
    }

    public get onSymbolEvent(): EventSubscription{
        return this.createEvent(ActionType.Action2, true, 'key2');
    }
}

describe('MultiActionStore', () => {
    it('create', function() {
        let store: MultiActionStore<any> = new MultiActionStore(dispatcher);
        expect(store).to.exist;
    });

    function addListener(event: EventSubscription, actionType: string | symbol, done){
        let listener = (data) =>{
            event.removeListener(listener);
            expect(data).to.equal('test');
            done();
        };
        event.addListener(listener);
        dispatcher.dispatch({action: {type: actionType, data: 'test'}});

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
        return addListener(store.onStringEvent, ActionType.Action1, done)
    });

    it('add listener | symbol', (done) =>{
        let store: StatelessStore<any> = new StatelessStore(dispatcher);
        return addListener(store.onSymbolEvent, ActionType.Action2, done)
    });

    it('remove listener | string', (done) =>{
        let store: StatelessStore<any> = new StatelessStore(dispatcher);
        return removeListener(store.onStringEvent, ActionType.Action1, done);
    });

    it('remove listener | symbol', (done) =>{
        let store: StatelessStore<any> = new StatelessStore(dispatcher);
        return removeListener(store.onSymbolEvent, ActionType.Action2, done);
    });

    it('simple state', (done) =>{
        let store: SimpleStateStore<any> = new SimpleStateStore(dispatcher);
        let listener = (data) =>{
            store.onStringEvent.removeListener(listener);
            expect(data).to.equal('test');
            expect(store.getState()).to.equal('test');
            done();
        };
        store.onStringEvent.addListener(listener);
        dispatcher.dispatch({action: {type: ActionType.Action1, data: 'test'}});
        store = null;
    });

    it('keyed state', (done) =>{
        let date = new Date();
        let store: StatefulStore<any> = new StatefulStore(dispatcher);
        let listener1 = (data) =>{
            expect(data).to.eql('test1');
            expect(store.getState()).to.eql({key1: 'test1'});

        };
        let listener2 = (data) =>{
            expect(data).to.eql(date);
            expect(store.getState()).to.eql({key1: 'test1', key2: date});
            done();
        };
        store.onStringEvent.addListener(listener1);
        store.onSymbolEvent.addListener(listener2);
        dispatcher.dispatch({action: {type: ActionType.Action1, data: 'test1'}});
        dispatcher.dispatch({action: {type: ActionType.Action2, data: date}});
        store.onStringEvent.removeListener(listener1);
        store.onSymbolEvent.removeListener(listener2);
        store = null;
    });
});
