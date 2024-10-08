import Behaviour from "./lib/ui/Behaviour";
import {CaptureInterval, ScreenCaptureService} from "./lib/alt1/capture";
import {ChatReader} from "./lib/alt1/readers/ChatReader";
import Widget from "./lib/ui/Widget";
import * as jquery from "jquery";
import TextField from "./lib/ui/controls/TextField";
import Properties from "./trainer/ui/widgets/Properties";
import {observe} from "./lib/reactive";
import {BigNisButton} from "./trainer/ui/widgets/BigNisButton";
import {Notification, NotificationBar} from "./trainer/ui/NotificationBar";
import KeyValueStore from "./lib/util/KeyValueStore";
import {util} from "./lib/util/util";
import {C} from "./lib/ui/constructors";
import {storage} from "./lib/util/storage";
import * as lodash from "lodash";
import notification = Notification.notification;
import findBestMatch = util.findBestMatch;
import stringSimilarity = util.stringSimilarity;
import formatTimeWithoutMilliseconds = util.formatTimeWithoutMilliseconds;
import bold = C.bold;

const item_mapping: {
  item: string,
  broadcast_text: string
}[] = [
  {item: "Barrows dye", broadcast_text: "Barrows dye"},
  {item: "Shadow dye", broadcast_text: "Shadow dye"},
  {item: "Ice dye", broadcast_text: "Ice dye"},
  {item: "Third Age dye", broadcast_text: "Third age dye"},
  {item: "Blood dye", broadcast_text: "Blood dye"},
  {item: "Backstab cape", broadcast_text: "Backstab cape"},
  {item: "Sack of effigies", broadcast_text: "Effigies Cape"},
  {item: "Explosive barrel", broadcast_text: "Explosive Barrel Cape"},
  {item: "Third age full helmet", broadcast_text: "Third Age full helmet"},
  {item: "Third age platebody", broadcast_text: "Third Age platebody"},
  {item: "Third age platelegs", broadcast_text: "Third Age platelegs"},
  {item: "Third age kiteshield", broadcast_text: "Third Age kiteshield"},
  {item: "Third age ranger coif", broadcast_text: "Third Age ranger coif"},
  {item: "Third age ranger body", broadcast_text: "Third Age range top"},
  {item: "Third age ranger chaps", broadcast_text: "Third Age ranger chaps"},
  {item: "Third age vambraces", broadcast_text: "Third Age vambraces"},
  {item: "Third age mage hat", broadcast_text: "Third Age mage hat"},
  {item: "Third age robe top", broadcast_text: "Third Age robe top"},
  {item: "Third age robe", broadcast_text: "Third Age robe"},
  {item: "Third age amulet", broadcast_text: "Third Age amulet"},
  {item: "Third age druidic wreath", broadcast_text: "Third Age druidic wreath"},
  {item: "Third age druidic robe top", broadcast_text: "Third Age druidic robe top"},
  {item: "Third age druidic robe bottom", broadcast_text: "Third Age druidic robe"},
  {item: "Third age druidic cloak", broadcast_text: "Third Age druidic cloak"},
  {item: "Third age druidic staff", broadcast_text: "Third Age druidic staff"},
  {item: "Second-Age full helm", broadcast_text: "Second Age full helm"},
  {item: "Second-Age platebody", broadcast_text: "Second Age platebody"},
  {item: "Second-Age platelegs", broadcast_text: "Second Age platelegs"},
  {item: "Second-Age sword", broadcast_text: "Second Age sword"},
  {item: "Second-Age range coif", broadcast_text: "Second Age range coif"},
  {item: "Second-Age range top", broadcast_text: "Second Age range top"},
  {item: "Second-Age range legs", broadcast_text: "Second Age range legs"},
  {item: "Second-Age bow", broadcast_text: "Second Age shortbow"},
  {item: "Second-Age mage mask", broadcast_text: "Second Age mage hat"},
  {item: "Second-Age robe top", broadcast_text: "Second Age robe top"},
  {item: "Second-Age robe bottom", broadcast_text: "Second Age robe bottoms"},
  {item: "Second-Age staff", broadcast_text: "Second Age staff"},
  {item: "Orlando Smith's hat", broadcast_text: "Orlando Smith's hat"},

]

namespace Backend {
  const LOCAL_TEST_TOKEN = "testtoken"
  const host = "https://api.cluetrainer.app"

  export async function verify_login(token: string): Promise<User> {
    if (token == LOCAL_TEST_TOKEN) return {
      token: token,
      name: "Zyklop Marco",
      event: {
        name: "Clue Chasers Winter Opening",
        date: {
          from: 1728399531613,
          to: 1828399531613
        }
      }
    }
    else {
      const res = await fetch(`${host}/api/broadcastreader/verify_token`, {
        method: "POST",
        body: JSON.stringify({
          token: token
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      });

      if (!res.ok) return null

      return (await res.json()) as User
    }

    return null
  }

  export async function submit(user: User, broadcasts: DetectedBroadcast[]): Promise<boolean> {
    if (user.token == LOCAL_TEST_TOKEN) return true
  }
}

type User = {
  token: string,
  name: string,
  event: Event
}

type Event = {
  name: string,
  date: {
    from: number,
    to: number
  },
}

type DetectedBroadcast = {
  message_timestamp: number,
  player: string,
  item: string
}

namespace DetectedBroadcast {
  export function isSame(a: DetectedBroadcast, b: DetectedBroadcast): boolean {
    return Math.abs(a.message_timestamp - b.message_timestamp) < 5000 && a.item == b.item && a.player == b.player
  }
}

class LoginWidget extends Widget {
  storage = new storage.Variable<User>("broadcastreaderuser", () => null)

  user = observe<User>(null)

  constructor() {
    super();

    this.css2({
      "width": "100%"
    })

    this.user.subscribe(user => this.storage.set(user))

    this.user.subscribe(u => this.render(u), true)

    const cached_user = this.storage.get()

    if (cached_user) this.login(cached_user.token)
  }

  login = async (token: string) => {
    const user = await Backend.verify_login(token)

    console.log(`Login: ${user?.name}`)

    if (!user) notification("Invalid token", "error").show()
    else this.user.set(user)
  }

  render(user: User) {
    this.empty()

    const layout = new Properties().appendTo(this)

    layout.header("Clue Chasers broadcast reader for events - By Zyklop Marco")

    if (!user) {
      const password_input = new TextField(true)
        .onConfirm(token => this.login(token))

      layout.paragraph("Enter the login token provided to you below. Only start the tracker when you are on the designated world.")

      layout.row(password_input)

      layout.row(new BigNisButton("Start tracking", "confirm").onClick(() => this.login(password_input.get())))
    } else {
      layout.row(`Logged in as '${user.name}' for '${user.event.name}'`)
      layout.row(new BigNisButton("Logout", "cancel").onClick(() => {
        this.user.set(null)
      }))
    }
  }
}

type EventBuffer = {
  user: User,
  detected: DetectedBroadcast[]
}

namespace EventBuffer {
  export function add(buffer: EventBuffer, detection: DetectedBroadcast): boolean {
    const is_new = !buffer.detected.some(existing => DetectedBroadcast.isSame(existing, detection))

    if (is_new) {
      buffer.detected.push(detection)

      buffer.detected = lodash.sortBy(buffer.detected, e => -e.message_timestamp)
    }

    return is_new
  }
}

export class BroadcastReaderApp extends Behaviour {
  capture_service: ScreenCaptureService = new ScreenCaptureService()
  chatreader: ChatReader = new ChatReader(this.capture_service).setDebugEnabled()
  storage = new KeyValueStore("broadcastreadercache")

  detection_table: Widget

  private buffer: {
    user: User,
    detected: DetectedBroadcast[]
  }

  protected begin() {
    NotificationBar.instance().appendTo(jquery("body"))

    const container = c().css("width", "100%").css2({
      "overflow-y": "auto",
      "overflow-x": "hidden",
    }).appendTo(Widget.wrap(jquery("#main-content")))

    const layout = new Properties().css("width", "100%").appendTo(container)

    const login = new LoginWidget()

    layout.row(login)

    layout.row(this.detection_table = c())

    login.user.subscribe(async user => {
      if (user) {
        const existing_buffer = await this.storage.get<EventBuffer>(user.token)

        if (existing_buffer) {
          this.buffer = existing_buffer
        } else {
          this.buffer = {
            user: user,
            detected: []
          }
        }
      } else {
        this.buffer = null
      }

      this.renderDetections()
    })

    this.chatreader.subscribe({options: () => ({interval: CaptureInterval.fromApproximateInterval(100), paused: () => login.user.value() == null})})

    this.chatreader.new_message.on(message => {
      if (!this.buffer) return

      // Discard messages outside the event time
      if (message.timestamp < this.buffer.user.event.date.from || message.timestamp > this.buffer.user.event.date.to) return

      const match = message.text.match("News: [\u26AF\u{1F480}]?(.*) comp[il]eted a Treasure Trai[il] and received( a|(an))? (.*)!")

      // Discard messages not matching any
      if (!match) {
        console.log("Does not match regex")
        return
      }

      const player = match[1]
      const item = match[4]

      const best = findBestMatch(item_mapping, m => stringSimilarity(m.broadcast_text, item), 0.9)

      // Discard if matching item could not be found
      if (!best) {
        console.log(`no matching item found for ${item}`)
        return;
      }

      const is_new = EventBuffer.add(this.buffer, {
        item: best.value.item,
        player: player,
        message_timestamp: message.timestamp
      })

      if (is_new) {
        console.log(`Submitting ${best.value.item} for ${player}`)

        Backend.submit(this.buffer.user, this.buffer.detected)
        this.storage.set(this.buffer.user.token, this.buffer)

        this.renderDetections()
      } else {
        console.log(`Discarding because ${best.value.item} isn't new`)
      }
    })
  }

  private renderDetections() {
    this.detection_table.empty()

    if (!this.buffer) return

    const layout = new Properties().appendTo(this.detection_table)

    const grid = c().css2({
      "display": "grid",
      "column-gap": "5px",
      "row-gap": "2px",
      "grid-template-columns": "25% 35% 40%"
    })

    layout.header("Detected Broadcasts")

    layout.row(grid)

    grid.append(
      c().append(bold("Time")),
      c().append(bold("Player")),
      c().append(bold("Item")),
    )

    for (let broadcast of this.buffer.detected) {
      grid.append(
        c().append(formatTimeWithoutMilliseconds(broadcast.message_timestamp)),
        c().append(broadcast.player),
        c().append(broadcast.item),
      )
    }
  }

  protected end() {

  }
}