var fs        = require("fs");
var path      = require("path");
var Mocha     = require("mocha");
var mocha     = new Mocha();
var locations = [
	// modbus stream
	path.normalize(path.join(__dirname, "integration")),
	// modbus pdu
	path.normalize(path.join(__dirname, "pdu", "integration")),
];

locations.map(function (location) {
	fs
	.readdirSync(location)
	.filter(function (file) { return file.substr(-3) == ".js"; })
	.map(function (file) {
		mocha.addFile(path.join(location, file));
	});
});

mocha.run(process.exit);
