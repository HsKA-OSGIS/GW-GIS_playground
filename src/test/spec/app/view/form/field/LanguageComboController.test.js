Ext.Loader.syncRequire([
    'Koala.view.form.field.LanguageComboController'
]);

describe('Koala.view.form.field.LanguageComboController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.form.field.LanguageComboController).to.not.be(undefined);
        });
    });
});
