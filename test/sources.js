import test from "ava";
import * as sources from "../sources";
import * as http from "axios";
import "string_score";

let testInstance = null;
console.log = function (message, optionalParams) {
  if (testInstance !== null) {
    testInstance.log(message, optionalParams);
  }
};

const globalTestHttpInstance = http.create({});
globalTestHttpInstance.interceptors.request.use((request) => {
  if (responseQueue.length === 0) {
    return request;
  }

  // fail all requests to connect remote.
  request.adapter = (config) => {
    console.log(config.url);

    return new Promise((consume, reject) => {
      if (responseQueue.length === 0) {
        reject(new Error("No response is expected"));
      } else {
        consume(responseQueue.pop())
      }
    })
  };
  return request;
}, (e) => Promise.reject(e));

const responseQueue = [];

test.beforeEach((t) => {
  while (responseQueue.length !== 0) {
    responseQueue.pop()
  }
});

test.afterEach(() => testInstance = null);

test.serial("http-source sample", (t) => {
  testInstance = t;

  const httpSource = new sources.HttpSource({
    httpInstance: globalTestHttpInstance,
  });

  responseQueue.push({
    data: "ok",
    status: "ok"
  });

  return httpSource.list()
    .then((r) => {
      t.is(r.data, "ok");
      t.is(r.status, "ok");
    })
    .catch((e) => t.fail(e));
});

test.serial("http-source converter", (t) => {
  testInstance = t;

  responseQueue.push({
    data: [{
      title: "This is us",
      channel: "NBC"
    }],
    status: "ok",
  });

  const pathConverters = new Map();
  pathConverters.set("list", {
    converter: (response) => {
      return response.map((v) => v.title);
    }
  });

  const httpSource = new sources.HttpSource({
    httpInstance: globalTestHttpInstance,
    pathMap: pathConverters
  });

  return httpSource.list()
    .then((response) => {
      t.deepEqual(response.data, ["This is us"])
    })
    .catch((e) => t.fail(e))

});

test("last-fm search", (t) => {
  testInstance = t;
  t.plan(3);

  const source = new sources.LastFMSource();
  return source.search("viva la vida")
    .then((response) => {
      t.not(response.data.length, 0);
      t.not(response.data[0], null);
      t.is(response.data[0].artist, "Coldplay");
    });
});

test("kick-ass search", (t) => {
  testInstance = t;

  const source = new sources.KickAssSource();
  return source.search("viva la vida").then((response) => {
    t.is(response.data.length, 30);
    t.not(response.data[0], null);
    t.not(response.data[0].title, null);
    t.not(response.data[0].downloadLink, null);
  })
});

test("kick-ass search with scores", (t) => {
  testInstance = t;

  const source = new sources.KickAssSource();
  return source.search("viva la vida", null, {giveScore: true}).then((response) => {
    t.is(response.data.length, 30);
    t.not(response.data[0], null);
    t.not(response.data[0].title, null);
    t.not(response.data[0].downloadLink, null);
    t.is(response.data[0].hasOwnProperty("score"), true);

    console.info(response.data);
  })
});