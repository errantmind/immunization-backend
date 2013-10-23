var config = module.exports;

config["My tests"] = {
    rootPath: "../",
    environment: "node",
    sources: [
      "src/routes/patients.js"
    ],
    tests: [
      "test/*-test.js"
    ]
};
