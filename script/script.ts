/**
 * Returns the first element that is a descendant of node that matches selectors.
 * @param selector CSS selector to select the element
 * @returns The element
 */
function qSel(selector: string) { return document.querySelector(selector) }

/**
 * Returns all element descendants of node that match selectors.
 * @param sel CSS selector to select elements
 * @returns List of elements
 */
function qSelAll(sel: string) { return document.querySelectorAll(sel) }

interface Template {
    [key: string]: string
}
interface HTMLElement {
    replace(data: Template, prefix?: string): void
}

HTMLElement.prototype.replace = function (data: Template, prefix: string = "$_") {
    const alternate_prefix = "id_dlr_";
    const _this: () => HTMLElement = () => this;
    for (const i in data) {
        const old = _this().innerHTML;
        const span: () => HTMLElement | null = () =>
            _this().querySelector(`span.reactive#${alternate_prefix}${i}`)
        if (span() == null) _this().innerHTML =
            old.replace(`${prefix}${i}`, `
                <span class="reactive" id="${alternate_prefix}${i}"></span>`)
        span().innerText = data[i]
    }
}

function getRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
}

function wait(ms: number): Promise<null> {
    return new Promise((res, _) => { setTimeout(res, ms) })
}

const SERVER_INFO_ADDRESS = "data/server.json"
const URL_CHECK_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w\-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/i

enum AccountType {
    FREE_LIMITED = 0,
    FREE = 1,
    PEOPLE = 2
}

enum DialogType {
    UNRECOVERABLE,
    ALERT,
    CONFIRM,
    PROMPT
}

type Dialog = {
    show: () => void;
    destroy: () => void;
    element: HTMLDivElement;
    register: (event: string, callback: () => void) => void
}

type ServerData = {server: string, city: string, provider: string, status: boolean}[]

function primeFactorization(num: number) {
    var data = {}

    if (num % 2 == 0) data = {2: 0}
    while (num % 2 == 0) {
        data[2] += 1
        num /= 2
    }

    const start = 3
    const end = Math.ceil(Math.sqrt(num))

    for (var i = start; i <= end; i += 2) {
        if (data[i] == undefined && num % i == 0) {
            data[i] = 0
        }

        while (num % i == 0) {
            data[i] += 1
            num /= i
        }
    }

    if (num > 2) {
        data[num] = 1
    }

    return data
}

function totalDigit(num: number) {
    var total = 0

    while (num > 0) {
        total += num % 10
        num /= 10
        num = Math.floor(num)
    }

    return total
}

function analyzeDigit(num: number) {
    var result = []

    while (num > 0) {
        result.push(num % 10)
        num /= 10
        num = Math.floor(num)
    }

    result.reverse()
    return result
}

function checkAccountNum(value: string) {
    if (/[^0-9-\s]+/.test(value)) return false;

    var nCheck = 0, nDigit = 0, bEven = false;
    value = value.replace(/\D/g, "");

    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n),
            nDigit = parseInt(cDigit, 10);

        if (bEven) {
            if ((nDigit *= 2) > 9) nDigit -= 9;
        }

        nCheck += nDigit;
        bEven = !bEven;
    }

    return (nCheck % 10) == 0;
}

function createDialog(title: string, content: string, type: DialogType, id: string = ""): Dialog {
    const container = qSel("#dialog_container")
    const dialogContainer = document.createElement("div")
    const dialogBackground = document.createElement("div")
    const titleElm = document.createElement("h1")
    const contentElm = document.createElement("p")
    const buttonContainer = document.createElement("div")
    const extraContainer = document.createElement("div")
    var buttons: HTMLButtonElement[] = []

    const show = () => {
        container?.append(dialogBackground)
        dialogBackground?.classList.remove("hidden")
    }
    const destroy = () => {
        container?.removeChild(dialogBackground)
        dialogBackground?.classList.add("hidden")
    }

    const register = (event: string, callback: () => void) => {
        buttonContainer.querySelector(`button[data-buttonAction=${event}]`)
            ?.addEventListener("click", callback)
    }

    titleElm.innerText = title
    contentElm.innerText = content

    dialogBackground.classList.add("dialog_background", "hidden")
    dialogContainer.classList.add("dialog")
    dialogContainer.id = id
    titleElm.classList.add("dialog_title")
    contentElm.classList.add("dialog_content")
    buttonContainer.classList.add("dialog_buttons")
    extraContainer.classList.add("dialog_extra")

    switch (type) {
        case DialogType.UNRECOVERABLE:
            break
        case DialogType.ALERT:
            var ok = document.createElement("button")
            ok.setAttribute("data-buttonAction", "ok")
            ok.innerText = "OK"

            ok.addEventListener("click", destroy)
            buttons.push(ok)
            break
        case DialogType.CONFIRM:
            var yes = document.createElement("button")
            yes.setAttribute("data-buttonAction", "yes")
            yes.innerText = "Yes"

            var no = document.createElement("button")
            no.innerText = "No"
            no.setAttribute("data-buttonAction", "no")

            yes.addEventListener("click", destroy)
            no.addEventListener("click", destroy)
            buttons.push(yes, no)
            break
        case DialogType.PROMPT:
            var ok = document.createElement("button")
            ok.setAttribute("data-buttonAction", "ok")
            ok.innerText = "OK"
            ok.addEventListener("click", destroy)

            var cancel = document.createElement("button")
            cancel.setAttribute("data-buttonAction", "cancel")
            cancel.innerText = "Cancel"
            cancel.addEventListener("click", destroy)

            var prompt = document.createElement("input")
            prompt.type = "text"

            extraContainer.append(prompt)
            buttons.push(ok, cancel)
            break
    }

    buttonContainer.append(...buttons)
    dialogContainer.append(titleElm, contentElm, extraContainer, buttonContainer)
    dialogBackground.append(dialogContainer)

    return {
        element: dialogContainer,
        show,
        destroy,
        register,
    }
}

//? https://stackoverflow.com/a/47593316
function cyrb128(str: string) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k: number; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

function mulberry32(a: number) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function checkServer(dt: Date, number_of_date: number, name: string) {
    const UTC_PLUS9_OFFSET = 32400//32400
    var secs = (60 * 60 * dt.getUTCHours()) + UTC_PLUS9_OFFSET
    if (secs > 86400) secs -= 86400

    var seed = cyrb128(number_of_date.toString(16))
    var c = mulberry32(seed[0] + name.split("").map(v => v.charCodeAt(0)).reduce((t, c) => t + c))

    const check = c() > 0.6 / 86400 * secs + 0.2
    return check
}

function verifyAccount(account: string) {
    const acc = account
    if (account.length != 20) return false

    var bcde_check = 0
    var h_check = 0
    var o_check = 0
    var s_check = 0

    switch (acc[0]) {
        case "4":
            bcde_check = 17
            h_check = 8
            o_check = Number(acc[1])
            s_check = 3
            break
        case "6":
            bcde_check = 23
            h_check = 1
            o_check = Number(acc[1])
            s_check = 7
            break
        case "7":
            bcde_check = 31
            h_check = 6
            o_check = Number(acc[3])
            s_check = 3
            break
    }

    var bcde = Number(acc.substring(1, 5))
    var fg = Number(acc.substring(5, 7))
    var h = Number(acc[7])
    var ij = Number(acc.substring(8, 10))
    var o = Number(acc[14])
    var pqr = Number(acc.substring(15, 18))
    var s = Number(acc[18])
    var t = Number(acc[19])

    var abcde = Number(acc.substring(0, 5))
    var abc = Number(acc.substring(0, 3))
    var klmn = Number(acc.substring(10, 14))
    var bcdef = Number(acc.substring(1, 6))
    var jklm = Number(acc.substring(9, 13))

    var total_klmn = totalDigit(klmn)

    if (bcde % bcde_check != 0) return false
    if (abcde % fg != 0) return false
    if (h != h_check) return false
    if (Math.sqrt(ij) % 1 != 0) return false
    if (total_klmn % o_check != o) return false
    if (bcdef % abc != pqr) return false
    if (jklm % s_check != s) return false
    if (!checkAccountNum(acc)) return false

    return true
}

function generateAccount(type: AccountType) {
    main: while (true) {
        var num = "abcdefghijklmnopqrst"

        var a = 0
        var bcde = 0
        var fg = 0
        var h = 0
        var ij = 0
        var klmn = 0
        var o = 0
        var pqr = 0
        var s = 0
        var t = 0

        var bcde_raw = getRandom(1000, 9999)
        var bcde_mod = 0
        var klmn_mod = 0
        var jklm_mod = 0

        switch (type) {
            case AccountType.FREE_LIMITED:
                a = 4
                bcde_mod = 17
                h = 8
                klmn_mod = analyzeDigit(bcde_raw)[0]
                jklm_mod = 3
                break
            case AccountType.FREE:
                a = 6
                bcde_mod = 23
                h = 1
                klmn_mod = analyzeDigit(bcde_raw)[0]
                jklm_mod = 7
                break
            case AccountType.PEOPLE:
                a = 7
                bcde_mod = 31
                h = 6
                klmn_mod = analyzeDigit(bcde_raw)[2]
                jklm_mod = 3
                break
        }

        bcde = bcde_raw - (bcde_raw % bcde_mod)

        var abcde = a * 10000 + bcde
        var fg_array = Object.keys(primeFactorization(abcde))

        ij = Math.pow(getRandom(4, 9), 2)
        klmn = getRandom(1000, 9999)
        var klmn_total_digit = totalDigit(klmn)

        fg = ((num: string[]) => {
            const new_num = num
                .map(v => Number(v))
                .filter((v, _, __) => v > 10 && v < 99 && v % 2 == 1);
                if (new_num.length == 0) return -1
                return new_num[getRandom(0, new_num.length - 1)]
        })(fg_array)
        if (fg == -1) continue

        o = klmn_total_digit % klmn_mod
        if (isNaN(o)) continue

        var analyze_bcde = analyzeDigit(bcde)
        var abc = a * 100 + analyze_bcde[0] * 10 + analyze_bcde[1]

        var bcdef = bcde * 10 + analyzeDigit(fg)[0]
        pqr = bcdef % abc
        if (isNaN(pqr) || pqr <= 100) continue

        var analyze_klmn = analyzeDigit(klmn)
        var jklm = analyzeDigit(ij)[1] * 1000 + analyze_klmn[0] * 100 + analyze_klmn[1] * 10 + analyze_klmn[2]

        s = jklm % jklm_mod
        if (isNaN(s)) continue

        num = num.replace("a", a.toString())
        num = num.replace("bcde", bcde.toString())
        num = num.replace("fg", fg.toString())
        num = num.replace("h", h.toString())
        num = num.replace("ij", ij.toString())
        num = num.replace("klmn", klmn.toString())
        num = num.replace("o", o.toString())
        num = num.replace("pqr", pqr.toString())
        num = num.replace("s", s.toString())

        for (var i = 0; i <= 9; i++) {
            var new_num = num.replace("t", i.toString())
            if (checkAccountNum(new_num)) {
                num = new_num
                break
            }
        }

        if (!verifyAccount(num)) continue
        break main
    }

    return num
}

switch (document.body.getAttribute("data-type")) {
    case "home":
        break
    case "privacy":
        break

    case "pricing":
        async function serverContact() {
            const a = "Creating Account...", b = DialogType.UNRECOVERABLE, c = [
                {
                    "content": "Dialing up to the main server...",
                    "time": 3250
                },
                {
                    "content": "Gathering information...",
                    "time": 3800
                },
                {
                    "content": "Verifying...",
                    "time": 3100
                },
                {
                    "content": "Collecting metadata...",
                    "time": 200
                },
                {
                    "content": "Now generating account number...",
                    "time": 1500
                },
                {
                    "content": "Registering the account with the database...",
                    "time": 2500
                },
                {
                    "content": "Making sure you're not an Western spy...",
                    "time": 850
                },
                {
                    "content": "Checking IP",
                    "time": 500
                },
                {
                    "content": "Installing spyware...",
                    "time": 150
                },
                {
                    "content": "Collecting intel...",
                    "time": 150
                },
                {
                    "content": "Installing propaganda tool...",
                    "time": 150
                },
                {
                    "content": "Spreading propaganda...",
                    "time": 150
                },
                {
                    "content": "Installing cryptominer...",
                    "time": 150
                },
                {
                    "content": "Mining Bitcoin for the General Secretary...",
                    "time": 150
                },
                {
                    "content": "Installing WannaCry...",
                    "time": 150
                },
                {
                    "content": "Checking if program can encrypt user data...",
                    "time": 150
                },
                {
                    "content": "Self-destructing...",
                    "time": 150
                },
                {
                    "content": "Launching a nuclear test...",
                    "time": 150
                },
                {
                    "content": "Baking a cake...",
                    "time": 150
                },
                {
                    "content": "Cleaning the road...",
                    "time": 150
                },
                {
                    "content": "Executing people...",
                    "time": 150
                },
                {
                    "content": "Trafficking Cocaine and Meth...",
                    "time": 150
                },
                {
                    "content": "Trafficking defectors...",
                    "time": 150
                },
                {
                    "content": "Arresting journalist...",
                    "time": 150
                },
                {
                    "content": "Abusing humans...",
                    "time": 150
                },
                {
                    "content": "Arresting journalist...",
                    "time": 150
                },
                {
                    "content": "Checking if you're royal to the Supreme Leader...",
                    "time": 150
                },
                {
                    "content": "Finalizing...",
                    "time": 2140
                },
                {
                    "content": "Cleaning Up...",
                    "time": 2850
                }
            ],
            d = new Audio("sound/dial-up-internet-sound.mp3")

            var dialog: Dialog;
            dialog = createDialog(a, "Starting Up...", b)
            dialog.show()
            await d.play()
            dialog.destroy()

            for (const i of c) {
                dialog = createDialog(a, i.content, b)
                dialog.show()
                await wait(i.time)
                dialog.destroy()
            }

            d.pause()
            d.currentTime = 0
        }

        async function getFreeLimitedAccount() {
            var confirm_prompt = createDialog("Notice", "By using our service, you agree to all the conditions in the Privacy Policy. Do you agree?", DialogType.CONFIRM)
            confirm_prompt.show()
            confirm_prompt.register("yes", async () => {
                await serverContact()
                createDialog("Account", `Here is your Free Limited Account: ${generateAccount(0)}`, DialogType.ALERT).show()
            })
        }

        async function getFreeAccount() {
            var prompt = createDialog("Verify", "Please enter your \"verification code\" that we've provided you in your email to get this type of account.", DialogType.PROMPT)
            prompt.show()
            prompt.register("ok", () => {
                createDialog("Error", "Invalid verification code. Please try again", DialogType.ALERT).show()
            })
        }

        async function getPeopleAccount() {
            var prompt = createDialog("Verify", "Please enter your \"verification code\" that we've provided you in your email to get this type of account.", DialogType.PROMPT)
            prompt.show()
            prompt.register("ok", () => {
                createDialog("Error", "Invalid verification code. Please try again", DialogType.ALERT).show()
            })
        }

        qSel("#get_free_limited_acc").addEventListener("click", getFreeLimitedAccount)
        qSel("#get_free_acc").addEventListener("click", getFreeAccount)
        qSel("#get_people_acc").addEventListener("click", getPeopleAccount)
        break

    case "server":
        var server_display = qSel("#server_display")

        const data_fetch = async () => {
            var dt = new Date()
            const number_of_date = (dt.getUTCFullYear() - 1970) * 365 + (dt.getUTCMonth() + 1) * 31 + dt.getUTCDate()
            const list_data_block = server_display.querySelectorAll(".server_block.data")
            const d: ServerData = await fetch(SERVER_INFO_ADDRESS).then(e => e.json())
            const e = d.map(v => {
                const n = structuredClone(v)
                n.status = checkServer(dt, number_of_date, v.server)
                return n
            })

            for (const i of list_data_block) {
                i.remove()
            }

            for (const i of e) {
                const new_block = document.createElement("div")
                new_block.classList.add("server_block", "data")

                var status_item = document.createElement("div")
                var server_item = document.createElement("div")
                var city_item = document.createElement("div")
                var provider_item = document.createElement("div")

                var status_text = document.createElement("p")
                status_text.innerText = i.status ? "Online" : "Offline"
                status_text.classList.add(i.status ? "green_text" : "red_text")
                status_item.append(status_text)

                var server_text = document.createElement("p")
                server_text.innerText = i.server
                server_item.append(server_text)

                var city_text = document.createElement("p")
                city_text.innerText = i.city
                city_item.append(city_text)

                var provider_text = document.createElement("p")
                provider_text.innerText = i.provider
                provider_item.append(provider_text)

                new_block.append(status_item, server_item, city_item, provider_item)
                server_display.append(new_block)
            }
        }

        setInterval(data_fetch, 300000)
        data_fetch()
        break

    case "apps":
        const iframe = qSel("#app_iframe") as HTMLIFrameElement
        iframe.src = "about:blank"
        var website = ""

        qSel("#app_login_button").addEventListener("click", () => {
            const prompt = createDialog("Login request from: \"internal:vpn_app\"", "Enter your account number here", DialogType.PROMPT)
            prompt.show()
            prompt.element.querySelector("input").value = localStorage.getItem("k") ?? ""
            prompt.register("ok", () => {
                const key = prompt.element.querySelector("input").value
                if (verifyAccount(key)) {
                    qSel("#app_login_page").classList.add("hidden")
                    localStorage.setItem("k", key)
                } else {
                    createDialog("Error", "Invalid account number!", DialogType.ALERT).show()
                }
            })
        })

        qSel("#selected_vpn_server").addEventListener("change", async () => {
            var prev = ""
            var dialog = createDialog("Changing server", "Now changing the VPN server...", DialogType.UNRECOVERABLE)

            dialog.show()
            prev = iframe.src
            iframe.src = "about:blank"

            await wait(getRandom(3500, 7000))
            dialog.destroy()
            iframe.src = prev
        })

        qSel("#app_go").addEventListener("click", async () => {
            const url = (qSel("#url_bar") as HTMLInputElement).value

            if (URL_CHECK_REGEX.test(url)) {
                var dialog = createDialog("Loading webpage", "Now loading, this might take a while...", DialogType.UNRECOVERABLE)
                dialog.show()
                iframe.src = "about:blank"

                await wait(getRandom(5000, 12000))
                dialog.destroy()

                if (getRandom(0, 100) > 70) {
                    createDialog("Error", `Unable to connect to website: "${url}". Try again after some time.`, DialogType.ALERT).show()
                } else {
                    if (url.replace(URL_CHECK_REGEX, "$2").endsWith(".kp")) {
                        iframe.src = url
                    } else {
                        iframe.src = "block.html"
                        website = url
                    }
                    //iframe.src = url
                }
            } else {
                createDialog("Error", "Invalid URL", DialogType.ALERT).show()
            }
        })

        qSel("#app_refresh").addEventListener("click", () => {
            iframe.contentWindow.location.reload()
        })

        const server_data = async () => {
            var dt = new Date()
            const number_of_date = (dt.getUTCFullYear() - 1970) * 365 + (dt.getUTCMonth() + 1) * 31 + dt.getUTCDate()
            const d: ServerData = await fetch(SERVER_INFO_ADDRESS).then(e => e.json())
            var e = d.map(v => {
                const n = structuredClone(v)
                n.status = checkServer(dt, number_of_date, v.server)
                return n
            })
            e = e.sort((a, b) => a.server < b.server ? -1 : 1)

            var still_good_for_connect = true
            const elm = qSel("#selected_vpn_server") as HTMLSelectElement
            const selectedOption = elm.selectedOptions[0].value

            for (const i of elm.querySelectorAll("option")) {
                i.remove()
            }

            for (const i of e) {
                const opt_elm = document.createElement("option")
                opt_elm.value = i.server
                opt_elm.innerText = i.server
                opt_elm.disabled = !i.status

                if (i.server == selectedOption && !i.status) {
                    still_good_for_connect = false
                }

                elm.append(opt_elm)
            }

            if (still_good_for_connect) {
                elm.querySelectorAll("option").forEach((v, i) => {
                    if (v.value == selectedOption) {
                        elm.selectedIndex = i
                        return
                    }
                })
            } else {
                var dialog = createDialog("Warning", `The current VPN server: "${selectedOption}" that you're using has been shutdown for technical reason. We'll automatically connect you to a different VPN server after you've click OK.`, DialogType.ALERT)
                dialog.show()
                dialog.register("ok", () => location.reload())
            }

            console.log(selectedOption)
        }

        setInterval(server_data, 120000)
        server_data()

        iframe.onload = () => {
            iframe.contentWindow.postMessage(website)
        }
        break

    case "block":
        var blocked_website = ""
        const url_display = qSel("#url_display") as HTMLElement
        onmessage = (e) => {
            blocked_website = e.data
            blocked_website = blocked_website.trim()
            url_display.replace({ "url": blocked_website })
        }
        break
}