var Buff    = require("./Buffer");

var ExceptionCode = {}
ExceptionCode.IllegalFunction                    = 0x01;
ExceptionCode.IllegalDataAddress                 = 0x02;
ExceptionCode.IllegalDataValue                   = 0x03;
ExceptionCode.ServerDeviceFailure                = 0x04;
ExceptionCode.Aknowledge                         = 0x05;
ExceptionCode.ServerDeviceBusy                   = 0x06;
ExceptionCode.MemoryParityError                  = 0x08;
ExceptionCode.GatewayPathUnavailable             = 0x0A;
ExceptionCode.GatewayTargetDeviceFailedToRespond = 0x0B;

exports.ExceptionCode = ExceptionCode;

exports.findExceptionNameByCode = function (exceptionCode) {
	for (var k in ExceptionCode) {
		if (ExceptionCode[k] === exceptionCode) {
			return k
		}
	}
	return undefined
}

exports.build = function (fcode, code) {
	return Buff.from([ fcode | 0x80, (typeof code == "string" ? ExceptionCode[code] : code) ]);
};

exports.prepareException = function(funct) {
	return {
		build: function (code) {
			return exports.build(funct.Code, code)
		},
		parse: function (buffer) {
			var exception = buffer[buffer.length - 1];
			var exceptionName = exports.findExceptionNameByCode(exception)
			if (typeof exceptionName === 'string') {
				exception = exceptionName
			}
			return exception;
		}
	};
}
