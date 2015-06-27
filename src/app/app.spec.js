describe('App', function () {
    beforeEach(module('templates-app'));
    beforeEach(module('jmFamily'));
    beforeEach(inject(function () {
    }));

    it('test', inject(function ($rootScope) {
        $rootScope.$digest();
        expect(true).toBe(true);
    }));
});