'use strict';

describe('ui-seed', function () {

    beforeEach(angular.mock.module(require('../../../app/app')));

    describe('app : ui-seed', function () {
        it('exists', inject(function () {
            expect(true).toBe(true);
        }));
    });
});
