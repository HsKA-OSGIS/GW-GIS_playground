Ext.Loader.syncRequire([
    'Koala.view.panel.MultiSearchController'
]);

describe('Koala.view.panel.MultiSearchController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.panel.MultiSearchController).to.not.be(undefined);
        });
    });
});
