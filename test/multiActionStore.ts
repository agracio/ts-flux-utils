
import * as chai from 'chai';

import {MultiActionStore} from "../src/index";
import {Dispatcher} from "../src/index";

let expect = chai.expect;

const dispatcher = new Dispatcher<Payload>();

class StatelessStore<T> extends MultiActionStore<T>{

    public get onTestEvent(): EventSubscription{
        return this.createEvent('TestActionType');
    }

    public get onAnotherTestEvent(): EventSubscription{
        return this.createEvent('AnotherTestActionType');
    }
}

describe('MultiActionStore', () => {
    it('create', function() {
        let store: MultiActionStore<any> = new MultiActionStore(dispatcher);
        expect(store).to.exist;
    });

    it('add listener', (done) =>{
        let store: StatelessStore<any> = new StatelessStore(dispatcher);
        store.onTestEvent.addListener((data) => {
            expect(data).to.equal('test');
            done();
        });
        dispatcher.dispatch({action: {type: 'TestActionType', data: 'test'}})
    });

    it('remove listener', (done) =>{
        let store: StatelessStore<any> = new StatelessStore(dispatcher);
        store.onTestEvent.addListener((data) => {
            expect(data).to.equal('test');
            done();
        });
        dispatcher.dispatch({action: {type: 'TestActionType', data: 'test'}})
    });
});
