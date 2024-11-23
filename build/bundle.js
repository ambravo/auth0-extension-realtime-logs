module.exports = function (e) {
    var t = {};

    function n(s) {
        if (t[s]) return t[s].exports;
        var o = (t[s] = {
            i: s,
            l: false,
            exports: {},
        });
        e[s].call(o.exports, o, o.exports, n);
        o.l = true;
        return o.exports;
    }

    n.m = e;
    n.c = t;
    n.i = function (e) {
        return e;
    };
    n.d = function (e, t, s) {
        if (!n.o(e, t)) {
            Object.defineProperty(e, t, {
                configurable: false,
                enumerable: true,
                get: s,
            });
        }
    };
    n.n = function (e) {
        var t = e && e.__esModule ? function () { return e.default; } : function () { return e; };
        n.d(t, "a", t);
        return t;
    };
    n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
    };
    n.p = "";

    return n((n.s = 7));
}([
    function (e, t, n) {
        var s = n(14),
            o = n(9),
            a = n(12),
            r = n(8),
            i = n(11),
            c = new (n(13))(),
            l = n(10),
            d = n(6),
            u = n(2),
            p = n(4),
            h = n(3),
            m = n(5);

        c.use(function (e, t, n) {
            var o = e.get("x-forwarded-proto");
            e.baseUrl = [
                o ? o.split(",")[0].trim() : "https",
                "://",
                e.get("host"),
                s.parse(e.originalUrl).pathname,
            ].join("");
            e.audience = `https://${e.webtaskContext.data.AUTH0_DOMAIN}/api/v2/`;
            n();
        });

        c.get("/", function (e, t) {
            t.redirect([
                e.webtaskContext.data.AUTH0_RTA || "https://auth0.auth0.com",
                "/authorize",
                "?client_id=",
                e.baseUrl,
                "&response_type=token&expiration=86400000&response_mode=form_post",
                "&scope=", encodeURIComponent("openid profile"),
                "&redirect_uri=", e.baseUrl,
                "&audience=", e.audience,
                "&nonce=" + encodeURIComponent(l.randomBytes(16).toString("hex"))
            ].join(""));
        });

        c.get("/.well-known/oauth2-client-configuration", function (e, t) {
            t.json({
                redirect_uris: [e.baseUrl.replace("/.well-known/oauth2-client-configuration", "")],
                client_name: "Auth0 Extension",
                post_logout_redirect_uris: [e.baseUrl.replace("/.well-known/oauth2-client-configuration", "")]
            });
        });

        c.post("/", o.urlencoded({ extended: false }), a({
            secret: r({ strictSSL: true }),
            algorithms: ["RS256"],
            getToken: function (e) { return e.body.access_token; },
            issuer: e.webtaskContext.data.AUTH0_RTA || "https://auth0.auth0.com/",
        }), function (e, t) {
            if (
                e.user.aud === e.audience ||
                (Array.isArray(e.user.aud) && e.user.aud.indexOf(e.audience) > -1)
            ) {
                t.send(i.render(p, {
                    a0Token: e.body.access_token,
                    token: e.x_wt.token,
                    container: e.x_wt.container,
                    baseUrl: e.baseUrl,
                    rta: e.webtaskContext.data.AUTH0_RTA || "https://auth0.auth0.com",
                    manageUrl: e.webtaskContext.data.AUTH0_MANAGE_URL,
                    webtaskAPIUrl: d.resolveWebtaskAPIHost(e.get("host"), e.webtaskContext),
                }));
            } else {
                t.status(403).send(i.render(m, { baseUrl: e.baseUrl }));
            }
        });

        c.get("/meta", function (e, t) {
            t.json(u);
        });

        c.get("/logout", function (e, t) {
            t.send(i.render(h, {
                container: e.x_wt.container,
                baseUrl: e.baseUrl,
            }));
        });

        c.use(function (err, req, res, next) {
            if (err && err.status) {
                res.status(err.status).json({ error: err.code || err.name, message: err.message || err.name });
            } else {
                res.status(500).json({ error: "InternalServerError", message: err.message || err.name });
            }
        });

        e.exports = c;
    },
    function (e, t) {
        e.exports = require("webtask-tools");
    },
    function (e, t) {
        e.exports = {
            title: "Real-time Webtask Logs",
            name: "auth0-extension-realtime-logs",
            version: "1.3.7",
            preVersion: "1.3.6",
            author: "Auth0, Inc",
            description: "Access real-time webtask logs",
            type: "application",
            repository: "https://github.com/auth0/auth0-extension-realtime-logs",
            docsUrl: "https://auth0.com/docs/extensions/realtime-webtask-logs",
            logoUrl: "https://cdn.auth0.com/website/website/favicons/auth0-favicon.svg",
            keywords: ["auth0", "extension", "webtask", "logs", "real-time"],
        };
    },
    function (e, t) {
        e.exports = `
<!DOCTYPE html5>
<html>
<head>
    <script>
        sessionStorage.removeItem('token');
        window.location.href = 'https://auth0.auth0.com/logout?returnTo=<%- baseUrl.replace("logout", "/")%>&client_id=<%- baseUrl.replace("logout", "/")%>';
    </script>
</head>
<body></body>
</html>`;
    },
    function (e, t) {
        e.exports = `
<!DOCTYPE html5>
<html>
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="shortcut icon" href="https://cdn.auth0.com/website/website/favicons/auth0-favicon.svg" />
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/manage/v0.3.973/css/index.min.css" />
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styleguide/3.1.6/index.css">
    <title>Real-time Webtask Logs</title>
    <style>
        body, html {
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            padding-bottom: 0;
        }
        .logs {
            flex: 1;
        }
    </style>
    <script>
        sessionStorage.setItem('token', '<%- a0Token %>');
    </script>
</head>
<body>
    <div id="widget_container" class="logs"></div>
    <script>
        ExtendEditorLogsComponent.show(document.getElementById('widget_container'), {
            token: '<%- token %>',
            hostUrl: '<%- webtaskAPIUrl %>',
            showErrors: true,
            autoReconnect: false,
            theme: 'dark',
        });
    </script>
</body>
</html>`;
    },
    function (e, t) {
        e.exports = `
<!DOCTYPE html5>
<html>
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="shortcut icon" href="https://cdn.auth0.com/website/website/favicons/auth0-favicon.svg">
    <title>Access Denied</title>
</head>
<body>
    <div class="container">
        <div class="row text-center">
            <h1><a href="https://auth0.com" title="Go to Auth0!"><img src="https://cdn.auth0.com/website/website/favicons/auth0-favicon.svg" alt="Auth0 badge" /></a></h1>
            <h1>Not authorised</h1>
            <p><a href="https://auth0.auth0.com/logout?returnTo=<%- baseUrl %>">Log out from Auth0 and try again</a></p>
        </div>
    </div>
</body>
</html>`;
    },
    function (e, t) {
        e.exports = {
            resolveWebtaskAPIHost: function (e, t) {
                var n = t.secrets.WT_URL;
                return n && n.indexOf("api/run") >= 0
                    ? t.secrets.WT_URL.split("/api")[0]
                    : `https://${e}`;
            },
        };
    },
    function (e, t, n) {
        var s = n(1);
        e.exports = s.fromExpress(n(0));
    },
    function (e, t) {
        e.exports = require("auth0-api-jwt-rsa-validation@0.0.1");
    },
    function (e, t) {
        e.exports = require("body-parser@1.12.4");
    },
    function (e, t) {
        e.exports = require("crypto");
    },
    function (e, t) {
        e.exports = require("ejs@2.3.1");
    },
    function (e, t) {
        e.exports = require("express-jwt@3.1.0");
    },
    function (e, t) {
        e.exports = require("express@4.14.0");
    },
    function (e, t) {
        e.exports = require("url");
    }
]);