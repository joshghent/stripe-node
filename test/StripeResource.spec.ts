// @ts-nocheck
import {expect} from 'chai';
import * as nock from 'nock';
import {StripeResource} from '../src/StripeResource.js';
import {getSpyableStripe, getTestServerStripe} from './testUtils.js';

const stripe = getSpyableStripe();
const stripeMethod = StripeResource.method;

describe('StripeResource', () => {
  describe('createResourcePathWithSymbols', () => {
    let testResource;
    before(() => {
      testResource = new (StripeResource.extend({
        path: 'widgets',
        create: stripeMethod({
          method: 'POST',
          path: '',
        }),
      }))(stripe);
    });
    it('Generates a path when there is a symbol', () => {
      testResource.create({});
      const path = testResource.createResourcePathWithSymbols('{id}');
      expect(path).to.equal('/widgets/{id}');
    });

    it('Generates a path when there is nothing beyond the resource path', () => {
      testResource.create({});
      const path = testResource.createResourcePathWithSymbols('');
      // This explicitly shouldn't have a trailing slash.
      expect(path).to.equal('/widgets');
    });

    it('Handles accidental double slashes', () => {
      testResource.create({});
      const path = testResource.createResourcePathWithSymbols('/{id}');
      expect(path).to.equal('/widgets/{id}');
    });
  });

  describe('_joinUrlParts', () => {
    it('includes trailing empty values', () => {
      const path = stripe.invoices._joinUrlParts(['a', '']);
      expect(path).to.equal('a/');
    });

    it('joins parts', () => {
      const path = stripe.invoices._joinUrlParts(['a', 'b', 'c']);
      expect(path).to.equal('a/b/c');
    });

    it('handles redundant slashes', () => {
      const path = stripe.invoices._joinUrlParts([
        '/v1/',
        '/customers/',
        '/{id}',
      ]);
      expect(path).to.equal('/v1/customers/{id}');
    });
  });

  describe('method with fullPath', () => {
    it('interpolates in parameters', (callback) => {
      const handleRequest = (req, res) => {
        expect(req.url).to.equal('/v1/parent/hello/child/world');

        // Write back JSON to close out the server.
        res.write('{}');
        res.end();
      };

      getTestServerStripe({}, handleRequest, (err, stripe, closeServer) => {
        const resource = new (StripeResource.extend({
          test: stripeMethod({
            method: 'GET',
            fullPath: '/v1/parent/{param1}/child/{param2}',
          }),
        }))(stripe);

        return resource.test('hello', 'world', (err, res) => {
          closeServer();
          // Spot check that we received a response.
          expect(res).to.deep.equal({});
          return callback(err);
        });
      });
    });
  });

  describe('custom host on method', () => {
    const makeResource = (stripe) => {
      return new (StripeResource.extend({
        path: 'resourceWithHost',

        testMethod: stripeMethod({
          method: 'GET',
          host: 'some.host.stripe.com',
        }),
      }))(stripe);
    };

    it('is not impacted by the global host', (done) => {
      const stripe = require('../src/stripe.cjs.node.js')('sk_test', {
        host: 'bad.host.stripe.com',
      });

      const scope = nock('https://some.host.stripe.com')
        .get('/v1/resourceWithHost')
        .reply(200, '{}');

      makeResource(stripe).testMethod({}, (err, response) => {
        done(err);
        scope.done();
      });
    });

    it('still lets users override the host on a per-request basis', (done) => {
      const stripe = require('../src/stripe.cjs.node.js')('sk_test');

      const scope = nock('https://some.other.host.stripe.com')
        .get('/v1/resourceWithHost')
        .reply(200, '{}');

      makeResource(stripe).testMethod(
        {},
        {host: 'some.other.host.stripe.com'},
        (err, response) => {
          done(err);
          scope.done();
        }
      );
    });
  });

  describe('method with fullPath', () => {
    it('interpolates in parameters', (callback) => {
      const handleRequest = (req, res) => {
        expect(req.url).to.equal('/v1/parent/hello/child/world');

        // Write back JSON to close out the server.
        res.write('{}');
        res.end();
      };

      getTestServerStripe({}, handleRequest, (err, stripe, closeServer) => {
        const resource = new (StripeResource.extend({
          test: stripeMethod({
            method: 'GET',
            fullPath: '/v1/parent/{param1}/child/{param2}',
          }),
        }))(stripe);

        return resource.test('hello', 'world', (err, res) => {
          closeServer();
          // Spot check that we received a response.
          expect(res).to.deep.equal({});
          return callback(err);
        });
      });
    });
  });

  describe('streaming', () => {
    /**
     * Defines a fake resource with a `pdf` method
     * with binary streaming enabled.
     */
    const makeResourceWithPDFMethod = (stripe) => {
      return new (StripeResource.extend({
        path: 'resourceWithPDF',

        pdf: stripeMethod({
          method: 'GET',
          host: 'files.stripe.com',
          streaming: true,
        }),
      }))(stripe);
    };

    it('success', (callback) => {
      const handleRequest = (req, res) => {
        setTimeout(() => res.write('pretend'), 10);
        setTimeout(() => res.write(' this'), 20);
        setTimeout(() => res.write(' is a pdf'), 30);
        setTimeout(() => res.end(), 40);
      };

      getTestServerStripe({}, handleRequest, (err, stripe, closeServer) => {
        const foos = makeResourceWithPDFMethod(stripe);
        if (err) {
          return callback(err);
        }

        return foos.pdf({id: 'foo_123'}, {host: 'localhost'}, (err, res) => {
          closeServer();
          if (err) {
            return callback(err);
          }
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('error', callback);
          res.on('end', () => {
            expect(Buffer.concat(chunks).toString()).to.equal(
              'pretend this is a pdf'
            );
            return callback();
          });
        });
      });
    });

    it('setting streaming in raw request works correctly', (callback) => {
      const handleRequest = (req, res) => {
        setTimeout(() => res.write('pretend'), 10);
        setTimeout(() => res.write(' this'), 20);
        setTimeout(() => res.write(' is a pdf'), 30);
        setTimeout(() => res.end(), 40);
      };

      getTestServerStripe({}, handleRequest, (err, stripe, closeServer) => {
        if (err) {
          return callback(err);
        }

        stripe
          .rawRequest(
            'GET',
            '/v1/files/file_123/contents',
            {},
            {host: 'localhost', streaming: true}
          )
          .then((result) => {
            closeServer();
            const chunks = [];
            result.on('data', (chunk) => chunks.push(chunk));
            result.on('error', callback);
            result.on('end', () => {
              expect(Buffer.concat(chunks).toString()).to.equal(
                'pretend this is a pdf'
              );
              return callback();
            });
          })
          .catch((error) => {
            return callback(error);
          });
      });
    });

    it('failure', (callback) => {
      const handleRequest = (_req, res, nPreviousRequests) => {
        setTimeout(() => res.writeHead(500));
        setTimeout(
          () =>
            res.write(
              '{"error": "api_error", "error_description": "this is bad"}'
            ),
          10
        );
        setTimeout(() => res.end(), 20);
        // fail twice, then close the server
        return {shouldStayOpen: nPreviousRequests < 1};
      };

      getTestServerStripe({}, handleRequest, (err, stripe, closeServer) => {
        if (err) {
          return callback(err);
        }

        const foos = makeResourceWithPDFMethod(stripe);

        return foos.pdf(
          {id: 'foo_123'},
          {host: 'localhost', maxNetworkRetries: 1},
          (err, res) => {
            closeServer();
            expect(err).to.exist;
            expect(err.raw.type).to.equal('api_error');
            expect(err.raw.message).to.equal('this is bad');
            return callback();
          }
        );
      });
    });
  });
  describe('makeRequest args', () => {
    it('does not mutate user-supplied deprecated opts', () => {
      const args = [
        {
          stripe_account: 'bad',
        },
      ];
      const mockSelf = new (StripeResource.extend({}))(stripe);
      mockSelf._makeRequest(args, {}, {});
      expect(args).to.deep.equal([
        {
          stripe_account: 'bad',
        },
      ]);
    });
  });

  describe('usage', () => {
    it('is passed to the request sender', (callback) => {
      const mockSelf = new (StripeResource.extend({
        boop: stripeMethod({
          method: 'GET',
          fullPath: '/v1/widgets/{widget}/boop',
          usage: ['llama', 'bufo'],
        }),
      }))(stripe);

      mockSelf.boop('foo', {bar: 'baz'}, (err, res) => {
        if (err) {
          return callback(err);
        }
        expect(stripe._requestSender._stripe.LAST_REQUEST.usage).to.deep.equal([
          'llama',
          'bufo',
        ]);
        return callback();
      });
    });
  });
});
