Ext.Loader.syncRequire([
    'Koala.view.component.MapController'
]);

describe('Koala.view.component.MapController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.component.MapController).to.not.be(undefined);
        });
    });
});
