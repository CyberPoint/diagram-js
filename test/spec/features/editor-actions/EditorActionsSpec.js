'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var editorActionsModule = require('../../../../lib/features/editor-actions'),
    modelingModule = require('../../../../lib/features/modeling');


describe('features/editor-actions', function() {

  beforeEach(bootstrapDiagram({ modules: [ editorActionsModule, modelingModule ] }));


  var rootShape, parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {
    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100,
      width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110,
      width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 200, y: 110,
      width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);
  }));


  describe('trigger', function() {

    it('should trigger an action', inject(function(modeling, editorActions) {
      // given
      modeling.moveElements([ childShape ], { x: 300, y: 0 }, rootShape);

      // when
      editorActions.trigger('undo');

      // then
      expect(childShape.parent).to.equal(parentShape);
      expect(childShape).to.have.position({ x: 110, y: 110 });
    }));


    it('should NOT trigger an action', inject(function(modeling, editorActions) {
      // given
      modeling.moveElements([ childShape ], { x: 300, y: 0 }, rootShape);

      // when
      function trigger() {
        editorActions.trigger('foo');
      }

      // then
      expect(trigger).to.throw('foo is not a registered action');
    }));

  });


  describe('register actions', function() {

    it('should register a list of actions', inject(function(editorActions) {
      // given
      var numOfActions = editorActions.length();

      // when
      editorActions.register({
        'foo': function() {
          return 'bar';
        },
        'bar': function() {
          return 'foo';
        }
      });

      // then
      expect(editorActions.length()).to.equal(numOfActions + 2);
    }));


    it('should register action', inject(function(editorActions) {
      // when
      editorActions.register('foo', function() {
        return 'bar';
      });

      var result = editorActions.trigger('foo');

      // then
      expect(result).to.equal('bar');
      expect(editorActions.isRegistered('foo')).to.be.true;
    }));


    it('should throw error on duplicate registration', inject(function(editorActions) {
      // when
      function register() {
        editorActions.register('undo', function() {
          return 'bar';
        });
      }

      // then
      expect(register).to.throw('undo is already registered');
    }));


    it('should unregister an action', inject(function(editorActions) {
      // when
      editorActions.unregister('undo');

      var result = editorActions.isRegistered('undo');

      // then
      expect(result).to.be.false;
    }));


    it('should throw an error on deregisering unregistered', inject(function(editorActions) {
      // when
      function unregister() {
        editorActions.unregister('bar');
      }

      // then
      expect(unregister).to.throw('bar is not a registered action');
    }));

  });


  describe('utilities', function() {

    it('listActions', inject(function(editorActions) {
      // when
      var actionsLength = editorActions.length();

      // then
      expect(actionsLength).to.equal(6);
    }));


    it('isRegistered -> true', inject(function(editorActions) {
      // when
      var undo = editorActions.isRegistered('undo'),
          foo = editorActions.isRegistered('foo');

      // then
      expect(undo).to.be.true;
      expect(foo).to.be.false;
    }));

  });

});
