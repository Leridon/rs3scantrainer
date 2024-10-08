import {ewent} from "../../../reactive";

export class MessageBuffer {
  new_message = ewent<MessageBuffer.Message>()

  private _messages: MessageBuffer.Message[] = []

  add(message: MessageBuffer.Message): boolean {
    let i = this._messages.length

    while (i > 0) {
      const msg = this._messages[i - 1]

      if (MessageBuffer.Message.equals(message, msg)) return false

      if (msg.timestamp < message.timestamp) break

      i--
    }

    this._messages.splice(i, 0, message)

    this.new_message.trigger(message)

    return true
  }

  get(): MessageBuffer.Message[] {
    return this._messages
  }
}

export namespace MessageBuffer {

  export type Message = {
    timestamp: number,
    text: string
  }

  export namespace Message {
    export function equals(a: Message, b: Message): boolean {
      if (!a || !b) debugger

      return a.timestamp == b.timestamp && a.text == b.text
    }
  }
}