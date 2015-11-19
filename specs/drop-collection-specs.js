var mongoose = require("mongoose");
var _ = require("underscore");

var Migroose = require("../migroose");
var DataLoader = require("../migroose/dataLoader");
var manageConnection = require("./helpers/connection");

describe("drop collections", function(){
  manageConnection(this);

  beforeEach(function(done){
    var m1 = {foo: "bar"};
    var m2 = {foo: "baz"};

    var dataLoader = new DataLoader({
      dropThings: "dropthings"
    });

    dataLoader.load(function(err, data){
      if (err) { throw err; }

      data.dropThings.collection.insert([m1, m2], function(err){
        if (err) { throw err; }

        done();
      });
    });
  });

  fdescribe("when specifying a collection to drop", function(){
    var things;

    beforeEach(function(done){
      var migration = new Migroose.Migration();

      migration.drop("dropthings");

      migration.migrate(function(err){
        if (err) { return done(err); }
        done();
      });
    }, 500000);

    it("should drop the specified collection", function(done){
      var dbName = mongoose.connection.db.databaseName;
      var dropThingsName = dbName + ".dropthings";

      mongoose.connection.db.collectionNames(function(err, collections){
        var hasDropThings = false;
        collections.forEach(function(col){
          if (col.name === dropThingsName) {
            hasDropThings = true;
          }
        });

        expect(hasDropThings).toBe(false);
        done();
      });
    });
  });

  describe("when trying to drop a collection that doesn't exist", function(){
    var things;

    var err; 
    beforeEach(function(done){
      var migration = new Migroose.Migration();

      migration.drop("i-dont-exist");

      migration.migrate(function(e){
        err = e;
        if (err) { return done(err); }
        done();
      });
    });

    it("should not throw an error", function(done){
      expect(err).toBe(undefined);
      done();
    });
  });

});
