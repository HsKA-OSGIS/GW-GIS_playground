Ext.Loader.syncRequire([
    'Koala.view.container.styler.LabelController'
]);

describe('Koala.view.container.styler.LabelController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.container.styler.LabelController).to.not.be(undefined);
        });
    });
});
