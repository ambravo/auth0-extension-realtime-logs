module.exports = function(e) {
  var t = {};

  function n(s) {
    if (t[s]) return t[s].exports;
    var o = t[s] = {
      i: s,
      l: false,
      exports: {}
    };
    return e[s].call(o.exports, o, o.exports, n), o.l = true, o.exports;
  }

  n.m = e;
  n.c = t;
  n.i = function(e) {
    return e;
  };

  n.d = function(e, t, s) {
    if (!n.o(e, t)) {
      Object.defineProperty(e, t, {
        configurable: false,
        enumerable: true,
        get: s
      });
    }
  };

  n.n = function(e) {
    var t = e && e.__esModule ? 
      function() { return e.default; } : 
      function() { return e; };
    n.d(t, 'a', t);
    return t;
  };

  n.o = function(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  };

  n.p = '';

  return n(n.s = 7);
}([
  function(e, t, n) {
    var s = n(14),  // url
        o = n(9),   // body-parser
        a = n(12),  // express-jwt
        r = n(8),   // auth0-api-jwt-rsa-validation
        i = n(11),  // ejs
        c = new (n(13)), // express
        l = n(10),  // crypto
        d = n(6),   // webtask api resolver
        u = n(2),   // package metadata
        p = n(4),   // main template
        h = n(3),   // logout template
        m = n(5);   // unauthorized template

    // Middleware to set up base URL and audience
    c.use(function(e, t, n) {
      var o = e.get('x-forwarded-proto');
      e.get('x-forwarded-port');
      e.baseUrl = [
        o ? o.split(',')[0].trim() : 'https',
        '://',
        e.get('host'),
        s.parse(e.originalUrl).pathname
      ].join('');
      e.audience = 'https://' + e.webtaskContext.data.AUTH0_DOMAIN + '/api/v2/';
      n();
    });

    // Root route - redirects to Auth0 authorize endpoint
    c.get('/', function(e, t) {
      t.redirect([
        e.webtaskContext.data.AUTH0_RTA || 'https://auth0.auth0.com',
        '/authorize',
        '?client_id=',
        e.baseUrl,
        '&response_type=token&expiration=86400000&response_mode=form_post',
        '&scope=',
        encodeURIComponent('openid profile'),
        '&redirect_uri=',
        e.baseUrl,
        '&audience=',
        e.audience,
        '&nonce=' + encodeURIComponent(l.randomBytes(16).toString('hex'))
      ].join(''));
    });

    // OAuth2 client configuration endpoint
    c.get('/.well-known/oauth2-client-configuration', function(e, t) {
      t.json({
        redirect_uris: [e.baseUrl.replace('/.well-known/oauth2-client-configuration', '')],
        client_name: 'Auth0 Extension',
        post_logout_redirect_uris: [e.baseUrl.replace('/.well-known/oauth2-client-configuration', '')]
      });
    });

    // Handle Auth0 callback
    c.post('/', 
      o.urlencoded({ extended: false }),
      function(e, t, n) {
        const s = e.webtaskContext.data.AUTH0_RTA || 'https://auth0.auth0.com';
        return a({
          secret: r({ strictSSL: true }),
          algorithms: ['RS256'],
          getToken: function(e) {
            return e.body.access_token;
          },
          issuer: s.endsWith('/') ? s : `${s}/`
        })(e, t, n);
      },
      function(e, t) {
        if (e.user.aud === e.audience || 
            (Array.isArray(e.user.aud) && e.user.aud.indexOf(e.audience) > -1)) {
          t.send(i.render(p, {
            a0Token: e.body.access_token,
            token: e.x_wt.token,
            container: e.x_wt.container,
            baseUrl: e.baseUrl,
            rta: e.webtaskContext.data.AUTH0_RTA || 'https://auth0.auth0.com',
            manageUrl: e.webtaskContext.data.AUTH0_MANAGE_URL,
            webtaskAPIUrl: d.resolveWebtaskAPIHost(e.get('host'), e.webtaskContext)
          }));
        } else {
          t.status(403);
          t.send(i.render(m, { baseUrl: e.baseUrl }));
        }
      }
    );

    // Metadata endpoint
    c.get('/meta', function(e, t) {
      t.json(u);
    });

    // Logout endpoint
    c.get('/logout', function(e, t) {
      t.send(i.render(h, {
        container: e.x_wt.container,
        baseUrl: e.baseUrl
      }));
    });

    // Error handler
    c.use(function(e, t, n, s) {
      if (e && e.status) {
        n.status(e.status);
        n.json({
          error: e.code || e.name,
          message: e.message || e.name
        });
      } else {
        n.status(500);
        n.json({
          error: 'InternalServerError',
          message: e.message || e.name
        });
      }
    });

    e.exports = c;
  },
  function(e, t) {
    e.exports = require('webtask-tools');
  },
  function(e, t) {
    e.exports = {
      title: 'Real-time Webtask Logs',
      name: 'auth0-extension-realtime-logs',
      version: '1.3.7',
      preVersion: '1.3.6',
      author: 'Auth0, Inc',
      description: 'Access real-time webtask logs',
      type: 'application',
      repository: 'https://github.com/auth0/auth0-extension-realtime-logs',
      docsUrl: 'https://auth0.com/docs/extensions/realtime-webtask-logs',
      logoUrl: 'https://cdn.auth0.com/extensions/auth0-extension-realtime-logs/assets/logo.svg',
      keywords: ['auth0', 'extension', 'webtask', 'logs', 'real-time']
    };
  }
