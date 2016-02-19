var fixtures = require('./fixtures');

describe('User relationships', function () {
    before(fixtures.fakeserver.init);
    after(fixtures.fakeserver.deinit);
    beforeEach(fixtures.testData.createUserTestData);
    beforeEach(fixtures.testData.setUserIds);
    beforeEach(fixtures.testData.createPlaceTestData);
    beforeEach(fixtures.testData.setPlaceIds);

	describe('VisitedPlaces', function () {
        it('"GET /users/{id}/visitedPlaces" should return empty list', function (done) {

            var userId = fixtures.testData.getUserIds()[0];

            var options = {
                url: 'http://127.0.0.1:8012/api/users/' + userId + '/visitedPlaces',
                json: true
            };

            request.get(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }
                expect(response.statusCode).to.be(200);
                expect(body).to.be.an(Array);
                expect(body.length).to.be(0);
                done();
            });
        });
        it('"PUT /users/{id}/visitedPlaces" should set linked VisitedPlaces', function (done) {

            var userId = fixtures.testData.getUserIds()[0];
            var firstPlaceId = fixtures.testData.getPlaceIds()[0];
            var secondPlaceId = fixtures.testData.getPlaceIds()[1];
            
            var options = {
                url: 'http://127.0.0.1:8012/api/users/' + userId + '/visitedPlaces',
                json: true,
                body: [firstPlaceId]
            };

            request.post(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }
                
                var options = {
                    url: 'http://127.0.0.1:8012/api/users/' + userId + '/visitedPlaces',
                    json: true,
                    body: [secondPlaceId]
                };
    
                request.put(options, function (err, response, body) {
                    if (err) {
                        return done(err);
                    }
                    
                    expect(response.statusCode).to.be(200);
                    expect(body._id.toString()).to.be(userId.toString());
    
                    var options = {
                        url: 'http://127.0.0.1:8012/api/users/' + userId + '/visitedPlaces',
                        json: true
                    };
    
                    request.get(options, function (err, response, body) {
                        if (err) {
                            return done(err);
                        }
    
                        expect(response.statusCode).to.be(200);
                        expect(body).to.be.an(Array);
                        expect(body.length).to.be(1);
                        expect(body[0]._id.toString()).to.be(secondPlaceId.toString());
						expect(body[0].user.toString()).to.be(userId.toString());
                        done();
                    });
                });
            });
        });
        it('"POST /users/{id}/visitedPlaces" should add link(s) to one or more VisitedPlaces', function (done) {

            var userId = fixtures.testData.getUserIds()[0];
            var placeIds = [fixtures.testData.getPlaceIds()[0]];

            var options = {
                url: 'http://127.0.0.1:8012/api/users/' + userId + '/visitedPlaces',
                json: true,
                body: placeIds
            };

            request.post(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }

                expect(response.statusCode).to.be(200);
                expect(body._id.toString()).to.be(userId.toString());

                var options = {
                    url: 'http://127.0.0.1:8012/api/users/' + userId + '/visitedPlaces',
                    json: true
                };

                request.get(options, function (err, response, body) {
                    if (err) {
                        return done(err);
                    }

                    expect(response.statusCode).to.be(200);
                    expect(body).to.be.an(Array);
                    expect(body.length).to.be(1);
                    expect(body[0]._id.toString()).to.be(placeIds[0].toString());
                    expect(body[0].user.toString()).to.be(userId.toString());
                    done();
                });
            });
        });
        it('"DELETE /users/{id}/visitedPlaces/{placeId}" should remove a link from user to Place', function (done) {

            var userId = fixtures.testData.getUserIds()[0];
            var placeId = fixtures.testData.getPlaceIds()[0];

            //First link them
            var options = {
                url: 'http://127.0.0.1:8012/api/users/' + userId + '/visitedPlaces',
                json: true,
                body: [placeId, fixtures.testData.getPlaceIds()[1]]
            };

            request.post(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }

                options = {
                    url: 'http://127.0.0.1:8012/api/users/' + userId + '/visitedPlaces/' + placeId,
                    json: true
                };

                request.del(options, function (err, response, body) {
                    if (err) {
                        return done(err);
                    }

                    expect(response.statusCode).to.be(200);
                    expect(body._id.toString()).to.be(userId.toString());

                    var options = {
                        url: 'http://127.0.0.1:8012/api/users/' + userId + '/visitedPlaces',
                        json: true
                    };

                    request.get(options, function (err, response, body) {
                        if (err) {
                            return done(err);
                        }

                        expect(response.statusCode).to.be(200);
                        expect(body).to.be.an(Array);
                        expect(body.length).to.be(1);
                        done();
                    });
                });
            });
        });
        it('"GET /users/{id}/visitedPlaces" with wrong id should return 404', function (done) {

            var options = {
                url: 'http://127.0.0.1:8012/api/users/00000759a6d4007c2e410b25/visitedPlaces',
                json: true
            };

            request.get(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }

                expect(response.statusCode).to.be(404);
                expect(body.error).to.be('Not Found');
                done();
            });
        });

        it('"GET /users/{id}/visitedPlaces" with Invalid id should return 500', function (done) {

            var options = {
                url: 'http://127.0.0.1:8012/api/users/00000/visitedPlaces',
                json: true
            };
            request.get(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }
                
                expect(response.statusCode).to.be(500);
                expect(body.error.name).to.be('CastError');
                done();
            });
        });
	});
});
