if(typeof module === "object") {
    EventTarget = require("events").EventEmitter;
}

class WebSocketJSONStream extends EventTarget {
	constructor(ws, options) {
		super();
		this.ws = ws;
        this.options = options || {};

        this.ws.on("open", (evt) => {
            this.emit("open", evt);
        });

		this.ws.on("message", (data) => {
			let obj;
			
			try {
				obj = JSON.parse(data);
			}
			catch(e) {
				this.emit("error", e);
				return;
			}

			if(obj !== "object" || (obj.data === undefined && typeof obj.type !== "string")) {
				this.emit("error", new Error("Expected object"));
				return;
			}

			if(obj.type === "meta") {
				this.emit("meta", obj.data);
			}
			else {
                let data = obj.data;
                if(options.restringify) {
                    data = JSON.stringify(data);
                }

				this.push(data);
			}
		});

		this.ws.on("close", () => {
			this.push(null);
			this.end();

			self.emit("close");
			self.emit("end");
		});

		this.on("error", () => {
			this.ws.close(1008, "Invalid data");
		});

		this.on("end", () => {
			this.ws.close(1000, "Normal closure");
		});
	}

    close(code, reason) {
        self.ws.close(code, reason);
    }

    sendRaw(data) {
        self.ws.send(
            JSON.stringify(data)
        );
    }

    send(data) {
        if(this.options.restringify) {
            data = JSON.parse(data);
        }
        
        this.sendRaw({
            type: "data",
            data: data
        });
    }

    sendMeta(data) {
        this.sendRaw({
            type: "meta",
            data: data
        })
    }

    on(event, callback) {
        this.addEventListener(event, callback);
    }

    once(event, callback) {
        this.addEventListener(event, callback, {once: true});
    }

    off(event, callback) {
        this.removeEventListener(event, callback);
    }

    emit(event) {
        if(!event instanceof Event) {
            event = new Event(event);
        }

        this.dispatchEvent(event);
    }
};

if(typeof module === "object") {
    module.exports = WebSocketJSONStream;
}