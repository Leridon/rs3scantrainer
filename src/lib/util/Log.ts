import {lazy} from "../properties/Lazy";
import {util} from "./util";

type Message = {
  category: string,
  body: object | string | number
}

namespace Message {
  import cleanedJSON = util.cleanedJSON;

  export function toString(msg: Message): string {
    const cat = msg.category ? `[${msg.category}] ` : ""

    if (typeof msg.body == "string") return cat + msg.body
    else return cat + cleanedJSON(msg.body)
  }

  export function equals(a: Message, b: Message): boolean {
    return a.body == b.body && a.category == b.category
  }
}


export abstract class Log {
  constructor(private clone_to: Log = undefined) {}

  protected _log(message: Message): void {
    this.clone_to?._log(message)
  }

  log(msg: object | string | number, category: string = undefined): this {
    this._log({body: msg, category: category ?? ""})
    return this
  }
}

export namespace Log {

  import index = util.index;

  export class Void extends Log {
    protected _log(message: Message): void {
      super._log(message)
    }
  }

  export class Console extends Log {
    _log(message: Message): void {
      super._log(message)
      console.log(Message.toString(message))
    }
  }

  type Buffer = {
    timestamps: number[],
    message: Message
  }[]

  namespace Buffer {
    export function toString(buffer: Buffer): string {


      function formatTime(timestamp: number): string {
        const date = new Date(timestamp)

        function pad(str: string): string {
          return ("0000" + str).substring(str.length, str.length + 4)
        }

        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${pad( date.getMilliseconds().toString())}`
      }

      return buffer.map(entry => {
        if (entry.timestamps.length > 1) {
          return `${Message.toString(entry.message)} (${entry.timestamps.length}x between ${formatTime(entry.timestamps[0])} and ${formatTime(index(entry.timestamps, -1))})`
        } else {
          return `${Message.toString(entry.message)} (${formatTime(entry.timestamps[0])})`
        }

      }).join("\n")
    }
  }

  export class SingleBuffered extends Log {
    entries: {
      timestamps: number[],
      message: Message
    }[] = []

    _log(message: Message) {
      super._log(message)
      if (this.entries.length > 0 && Message.equals(message, index(this.entries, -1).message)) {
        index(this.entries, -1).timestamps.push(Date.now())
      } else {
        this.entries.push({timestamps: [Date.now()], message: message})
      }
    }

    last() {
      return index(this.entries, -1)
    }

    first() {
      return index(this.entries, 0)
    }
  }

  export class DoubleBuffered extends Log {
    private buffers: [SingleBuffered, SingleBuffered] = [new SingleBuffered(), new SingleBuffered()]

    protected _log(message: Message) {
      super._log(message)
      this.buffers[0]._log(message)

      if (this.buffers[0].entries.length > 1000) {
        this.buffers[1] = this.buffers[0]
        this.buffers[0] = new SingleBuffered()
      }
    }

    get(): Buffer {
      return [...this.buffers[1].entries, ...this.buffers[0].entries]
    }

    toString(): string {
      return Buffer.toString(this.get())
    }
  }

  const _instance = lazy(() => new DoubleBuffered(new Console()))

  export function log(): DoubleBuffered {
    return _instance.get()
  }
}