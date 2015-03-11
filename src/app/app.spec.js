describe('App', function () {
    beforeEach(module('templates-app'));
    beforeEach(module('jmFamily'));
    beforeEach(inject(function($httpBackend) {
    }));

    it('routing main', inject(function($route, $location, $rootScope) {
        $location.path('/blahblahblah');
        $rootScope.$digest();
        expect($route.current.controller).toBe('jmPartialController');
    }));

});