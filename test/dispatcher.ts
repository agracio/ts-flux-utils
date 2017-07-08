import * as chai from 'chai';

import {MultiActionStore} from "../src/index";
import {Dispatcher} from "../src/index";

let expect = chai.expect;

const dispatcher = new Dispatcher<Payload>();

const ActionType: any = {
    Action1: 'Action1',
    Action2: 'Action2',
    Action3: 'Action3',
};

class SimpleStateStore<T> extends MultiActionStore<T>{

    public get onEvent(): EventSubscription{
        return this.createEvent(ActionType.Action3, true);
    }
}

class StatefulStore<T> extends MultiActionStore<T>{

    public get onEvent1(): EventSubscription{
        return this.createEvent(ActionType.Action1, true, 'key1');
    }

    public get onEvent2(): EventSubscription{
        return this.createEvent(ActionType.Action2, true, 'key2');
    }
}

describe('Dispatcher', () => {

    it('dispatcher queue', (done) =>{
        let statefulStore: StatefulStore<any> = new StatefulStore(dispatcher);
        let simpleStore: SimpleStateStore<any> = new SimpleStateStore(dispatcher);

        let listener1 = (data) =>{
            dispatcher.dispatch({action: {type: ActionType.Action3, data: 'test'}});
            expect(data).to.eql('test1');
            expect(statefulStore.getState()).to.eql({key1: 'test1'});
        };

        let listener2 = (data) =>{
            expect(data).to.eql('test2');
            expect(statefulStore.getState()).to.eql({key1: 'test1', key2: 'test2'});
            expect(simpleStore.getState()).to.equal('test');
            done();
        };

        let listener3 = (data) =>{
            simpleStore.onEvent.removeListener(listener3);
            expect(data).to.equal('test');
            expect(simpleStore.getState()).to.equal('test');
        };

        statefulStore.onEvent1.addListener(listener1);
        statefulStore.onEvent2.addListener(listener2);
        simpleStore.onEvent.addListener(listener3);

        dispatcher.dispatch({action: {type: ActionType.Action1, data: 'test1'}});
        dispatcher.dispatch({action: {type: ActionType.Action2, data: 'test2'}});
        statefulStore.onEvent1.removeListener(listener1);
        statefulStore.onEvent2.removeListener(listener2);
        simpleStore.onEvent.removeListener(listener3);
        statefulStore = null;
        simpleStore = null;
    });

});
