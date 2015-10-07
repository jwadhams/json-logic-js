QUnit.test( "single operands", function( assert ) {
  assert.equal( jsonLogic({"==" : [1, 1]}), true );
  assert.equal( jsonLogic({"==" : [1, 2]}), false );

  assert.equal( jsonLogic({"===" : [1, 1]}), true );
  assert.equal( jsonLogic({"===" : [1, 2]}), false );
  assert.equal( jsonLogic({"===" : [1, "1"]}), false );

  assert.equal( jsonLogic({"!=" : [1, 2]}), true );
  assert.equal( jsonLogic({"!=" : [1, 1]}), false );

  assert.equal( jsonLogic({"!==" : [1, 2]}), true );
  assert.equal( jsonLogic({"!==" : [1, 1]}), false );
  assert.equal( jsonLogic({"!==" : [1, "1"]}), true );
  
  assert.equal( jsonLogic({">" : [2, 1]}), true );
  assert.equal( jsonLogic({">" : [1, 1]}), false );
  assert.equal( jsonLogic({">" : [1, 2]}), false );
  assert.equal( jsonLogic({">" : ["2", 1]}), true );

  assert.equal( jsonLogic({">=" : [2, 1]}), true );
  assert.equal( jsonLogic({">=" : [1, 1]}), true );
  assert.equal( jsonLogic({">=" : [1, 2]}), false );
  assert.equal( jsonLogic({">=" : ["2", 1]}), true );

  assert.equal( jsonLogic({"<" : [2, 1]}), false );
  assert.equal( jsonLogic({"<" : [1, 1]}), false );
  assert.equal( jsonLogic({"<" : [1, 2]}), true );
  assert.equal( jsonLogic({"<" : ["1", 2]}), true );

  assert.equal( jsonLogic({"<=" : [2, 1]}), false );
  assert.equal( jsonLogic({"<=" : [1, 1]}), true );
  assert.equal( jsonLogic({"<=" : [1, 2]}), true );
  assert.equal( jsonLogic({"<=" : ["1", 2]}), true );

  assert.equal( jsonLogic({"!" : [false]}), true );
  assert.equal( jsonLogic({"!" : false}), true );
  assert.equal( jsonLogic({"!" : [true]}),false );
  assert.equal( jsonLogic({"!" : true}), false );
  assert.equal( jsonLogic({"!" : 0}), true );

  assert.equal( jsonLogic({"or" : [true, true]}), true );
  assert.equal( jsonLogic({"or" : [false, true]}), true );
  assert.equal( jsonLogic({"or" : [true, false]}), true );
  assert.equal( jsonLogic({"or" : [false, false]}), false );

  assert.equal( jsonLogic({"and" : [true, true]}), true );
  assert.equal( jsonLogic({"and" : [false, true]}), false );
  assert.equal( jsonLogic({"and" : [true, false]}), false );
  assert.equal( jsonLogic({"and" : [false, false]}), false );

  assert.equal( jsonLogic({"?:" : [true, 1, 2]}), 1 );
  assert.equal( jsonLogic({"?:" : [false, 1, 2]}), 2 );
  assert.equal( jsonLogic({"?:" : [false, 1]}), undefined );

});

QUnit.test( "compound logic", function( assert ) {

  assert.equal( jsonLogic( {"and" : [ { ">" : [3,1] }, true ] }), true);
  assert.equal( jsonLogic( {"and" : [ { ">" : [3,1] }, false ] }), false);

  assert.equal( jsonLogic( {"and" : [ { ">" : [3,1] }, {"!" : true} ] }), false);
  
  assert.equal( jsonLogic( {"and" : [ { ">" : [3,1] }, { "<" : [1,3] } ] }), true);

  assert.equal( jsonLogic({"?:" : [ {">":[3,1]}, "visible", "hidden"]}), "visible" );
  
});

QUnit.test( "data-driven", function( assert ) {

  assert.equal( jsonLogic({"var" : ["a"]}, {a:1}), 1 );
  assert.equal( jsonLogic({"var" : ["a"]}), undefined ); //Missing Data argument
  assert.equal( jsonLogic({"var" : ["b"]}, {a:1}), undefined );
  assert.equal( jsonLogic({"var" : "a"}, {a:1}), 1 );
  assert.equal( jsonLogic({"var" : "a"}), undefined );
  assert.equal( jsonLogic({"var" : "b"}, {a:1}), undefined );

	assert.equal(
		jsonLogic(
			{ "and": [
				{"<": [{"var":"temp"}, 110]}, 
				{"==": [ {"var":"pie.filling"}, "apple" ] } 
			] },
			{ "temp" : 100, "pie" : { "filling" : "apple" } }
		),
		true
	);
});


