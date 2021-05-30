var Modbus = require("./Modbus");
var ExceptionCode = require("./ExceptionCode");

exports.load = function (functs) {
	for (var f in functs) {
		if (typeof functs[f] != "object" || !functs[f].hasOwnProperty("Code")) continue;

		functs[f].Exception = ExceptionCode.prepareException(functs[f]);
	}
};

exports.error = function (reason) {
	if (typeof reason === "string" && reason in ExceptionCode.ExceptionCode) {
		var err = new Error(reason);
		err.code = ExceptionCode.ExceptionCode[reason];

		return err;
	}
	if (typeof reason === 'number') {
		var exceptionName = ExceptionCode.findExceptionNameByCode(reason)
		if (typeof exceptionName === 'string') {
			var err = new Error(exceptionName);
			err.code = ExceptionCode.ExceptionCode[exceptionName];
			return err;
		}
	}

	return new Error("" + reason);
};

exports.build = ExceptionCode.build;

exports.parse = function (buffer) {
	var data = {
		code      : buffer[0] & 0x7F,
		exception : buffer[1]
	};

	for (var k in Modbus) {
		if (typeof Modbus[k] == "object" && Modbus[k].Code == data.code) {
			data.code = k;
			break;
		}
	}

	var exceptionName = ExceptionCode.findExceptionNameByCode(data.exception);
	if (typeof exceptionName === 'string') {
		data.exception = exceptionName;
	}

	return data;
};
