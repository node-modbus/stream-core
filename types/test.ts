import * as net from "net";
import {
	pdu,
	StreamOptions,
	TCPTransportOptions,
	TCPTransport,
	stream,
	Stream,
	transports
} from "modbus-stream-core";

interface TCPDriverOptions extends TCPTransportOptions, StreamOptions {
	connectTimeout?: number;
}

interface TCPServerDriverOptions extends net.ServerOpts, TCPTransportOptions, StreamOptions {
}

type ConnectNextFunction = (err: Error | null, connection?: Stream) => void;

interface ConnectResult<Transport, AttachResult> {
	attach: (transport: Transport, next?: ConnectNextFunction) => AttachResult;
}

type ServerNextFunction = (connection: Stream) => void;
interface ServerResult<Transport, AttachResult> {
	attach: (transport: Transport, next?: ServerNextFunction) => AttachResult;
}

export class TCPDriver {
	static connect(
		_port?: number,
		_host?: string | TCPDriverOptions | ConnectNextFunction,
		_options?: TCPDriverOptions | ConnectNextFunction
	): ConnectResult<typeof TCPTransport, net.Socket> {
		if (typeof _host == "object" || typeof _host == 'function') {
			_options = _host;
			_host = "localhost";
		}

		const port = _port ?? 502;
		const host = _host ?? "localhost";
		let _next: ConnectNextFunction | undefined;
		let options: TCPDriverOptions = {};
		if (typeof _options == "function") {
			_next = _options;
			options = {};
		} else if (_options) {
			options = _options;
		}

		return {
			attach: function (
				transport: typeof TCPTransport,
				next?: ConnectNextFunction
			) {
				if (_next) {
					next = _next;
				}
				var onError = function () {
					return next!(pdu.Exception.error("GatewayPathUnavailable"));
				};

				var onTimeout = function () {
					// destroy here instead of end, otherwise we end up still getting the system's ETIMEDOUT onError
					socket.destroy();
					return next!(pdu.Exception.error("GatewayPathUnavailable"));
				};

				const socket: net.Socket = net.connect(port, host, function () {
					socket.removeListener("error", onError);
					// remove this listener, otherwise it will also act as an inactivity timeout, not just connecting timeout.
					socket.removeListener("timeout", onTimeout);

					return next!(
						null,
						new stream(new transport(socket, options), options)
					);
				});

				if (typeof options.connectTimeout == "undefined") {
					options.connectTimeout = 10000; // 10 secs
				}
				if (options.connectTimeout > 0) {
					socket.setTimeout(options.connectTimeout);
				}

				socket.on("error", onError);
				socket.on("timeout", onTimeout);

				return socket;
			},
		};
	}

	static server(_options?: TCPServerDriverOptions | ServerNextFunction): ServerResult<typeof TCPTransport, net.Server> {
		let _next: ServerNextFunction | undefined;
		let options: TCPServerDriverOptions = {}
		if (typeof _options == "function") {
			_next = _options;
			options = {};
		} else if (_options) {
			options = _options;
		}
		return {
			attach: function (transport: typeof TCPTransport, next?: ServerNextFunction) {
				if (_next) {
					next = _next;
				}
				var server = net.createServer(options, function (socket) {
					return next!(new stream(new transport(socket, options), options));
				});

				return server;
			},
		};
	}
}

const tcpSocket = TCPDriver.connect(503, "127.0.0.1", { debug: "automaton-2454" }).attach(
	transports.tcp, (err: Error | null, connection?: Stream) => {
		console.log(connection)
		setTimeout(()=>{
			console.log('Disconnect the socket and close the server')
			tcpSocket.destroy()
			tcpServer.close()
		}, 1000)
	})

const tcpServer = TCPDriver.server({ debug: "server" }).attach(transports.tcp,
	(connection: Stream) => {
		console.log(connection)
	}).listen(503, () => {
		console.log('Hello, the world')
		// ready
	});
