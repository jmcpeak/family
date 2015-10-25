'use strict';

var angular = require('angular');

describe('component', function () {
    var scope;
    var component;

    beforeEach(angular.mock.module(require('../../../app/index')));

    beforeEach(inject(function ($rootScope, $httpBackend) {
        $httpBackend.whenGET(/assets\/*/).respond(200);
        scope = $rootScope.$new();
    }));

    describe('<rcm-component>', function () {
        var rcmComponentController;

        it('exists', inject(function ($compile, $httpBackend) {
            $httpBackend.expectGET().respond(200);
            component = $compile('<rcm-component foo="1"></rcm-component>')(scope);
            scope.$digest();
            expect(component).toBeDefined();
            expect(component.length).toBe(1);
            expect(component.isolateScope()).toBeDefined();
            expect(component.scope()).toBeDefined();

            rcmComponentController = component.controller('rcmComponent');
            console.log("ctrl1", rcmComponentController);
            expect(rcmComponentController).toBeDefined();
            expect(rcmComponentController.alerts).toBeDefined();
            expect(rcmComponentController.alerts.length).toBe(2);
        }));

        it('toggle', function () {
            rcmComponentController.toggle('right');
            expect(rcmComponentController).toBeDefined();
        });

        it('add', function () {
            rcmComponentController.add();
            expect(rcmComponentController.alerts.length).toBe(3);
        });

        it('close', function () {
            rcmComponentController.close(0);
            expect(rcmComponentController.alerts.length).toBe(2);
        });

        it('closeSideNav', function () {
            rcmComponentController.closeSideNav('right');
            rcmComponentController.closeSideNav('left');
            expect(true).toBe(true);
        });

        it('getToastPosition', function () {
            rcmComponentController.getToastPosition();
            expect(rcmComponentController.toastPosition).toBeDefined();
            expect(rcmComponentController.toastPosition.top).toBe(true);
        });

        it('showToast', function () {
            rcmComponentController.showToast();
            expect(rcmComponentController.toastPosition).toBeDefined();
            expect(rcmComponentController.toastPosition.top).toBe(true);
        });
    });
});
