const modbus_core = require("modbus-stream-core");

exports.transports = modbus_core.transports
exports.stream = modbus_core.stream
exports.pdu    = modbus_core.pdu;

exports.drivers = {
	serial : require("./driver/serial"),
	tcp    : require("./driver/tcp"),
	udp    : require("./driver/udp")
};


exports.tcp = {
	connect : function () {
		var port    = 502;
		var host    = "localhost";
		var options = {};
		var next    = noop;

		Array.prototype.slice.apply(arguments).map(function (arg) {
			switch (typeof arg) {
				case "number":
					port = arg;
					break;
				case "string":
					host = arg;
					break;
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		if (typeof options.retry == "undefined") {
			options.retry = 30000;
		}

		var socket = exports.drivers.tcp.connect(port, host, options);

		socket.attach(exports.transports.tcp.prepare(options), next);
	},
	server : function () {
		var options = {};
		var next    = noop;

		Array.prototype.slice.apply(arguments).map(function (arg) {
			switch (typeof arg) {
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		if (typeof options.retry == "undefined") {
			options.retry = 30000;
		}

		return exports.drivers.tcp.server(options).attach(exports.transports.tcp.prepare(options), next);
	}
};

exports.udp = {
	connect : function () {
		var port    = 502;
		var host    = "localhost";
		var options = {};
		var next    = noop;

		Array.prototype.slice.apply(arguments).map(function (arg) {
			switch (typeof arg) {
				case "number":
					port = arg;
					break;
				case "string":
					host = arg;
					break;
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		if (typeof options.retry == "undefined") {
			options.retry = 3000;
		}

		var socket = exports.drivers.udp.connect(port, host, options);

		socket.attach(exports.transports.tcp.prepare(options), next);
	},
	server : function () {
		var options = {};
		var next    = noop;

		Array.prototype.slice.apply(arguments).map(function (arg) {
			switch (typeof arg) {
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		if (typeof options.retry == "undefined") {
			options.retry = 3000;
		}

		return exports.drivers.udp.server(options).attach(exports.transports.tcp.prepare(options), next);
	}
};

exports.serial = {
	connect : function () {
		var possible_options = [ "retries", "retry", "beforerequest", "afterrequest", "mutex", "maxDataInterval", "slaveId" ];
		var device           = "/dev/ttyS0";
		var options          = {};
		var serial_options   = {};
		var next             = noop;

		Array.prototype.slice.apply(arguments).map(function (arg) {
			switch (typeof arg) {
				case "string":
					device = arg;
					break;
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		possible_options.map(function (option) {
			if (typeof options[option] != "undefined") {
				serial_options[option] = options[option];
				delete options[option];
			}
		});

		var stream = exports.drivers.serial.connect(device, options);

		if (options.mode === "ascii") {
			stream.attach(exports.transports.ascii.prepare(serial_options), next);
		} else {
			stream.attach(exports.transports.serial.prepare(serial_options), next);
		}
	}
};

function noop() {}
