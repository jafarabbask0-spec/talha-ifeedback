( () => {
    "use strict";
    const e = new class {
        constructor() {
            this.eventListener = {
                addMessageListener: e => window.addEventListener("message", e),
                removeMessageListener: e => window.removeEventListener("message", e),
                postMessage: e => window.postMessage(e, window.location.origin)
            }
        }
        requestMethod(e, t) {
            const o = new Uint8Array(8)
              , n = Array.from(crypto.getRandomValues(o)).map(e => e.toString(16)).join("")
              , i = {
                type: "mises-proxy-request",
                id: n,
                method: e,
                params: t
            };
            return new Promise( (e, t) => {
                const o = setTimeout( () => {
                    e("receive response timeout")
                }
                , 5e3)
                  , s = i => {
                    const r = this.parseMessage ? this.parseMessage(i.data) : i.data;
                    if (!r || "mises-safe-proxy-request-response" !== r.type)
                        return;
                    if (r.id !== n)
                        return;
                    this.eventListener.removeMessageListener(s);
                    const a = r.result;
                    a ? a.error ? t(new Error(a.error)) : (clearTimeout(o),
                    e(a.return)) : t(new Error("Result is null"))
                }
                ;
                this.eventListener.addMessageListener(s),
                this.eventListener.postMessage(i)
            }
            )
        }
        async verifyDomain(e, t, o) {
            return await this.requestMethod("verifyDomain", {
                domain: e,
                logo: t,
                content: o
            })
        }
        async verifyContract(e, t) {
            return await this.requestMethod("verifyContract", {
                contractAddress: e,
                domain: t
            })
        }
        async notifyFuzzyDomain(e, t) {
            return await this.requestMethod("notifyFuzzyDomain", {
                domain: e,
                suggested_url: t
            })
        }
        async calculateHtmlSimilarly(e, t) {
            return await this.requestMethod("calculateHtmlSimilarly", {
                html: e,
                hash: t
            })
        }
        async recordVisitWeb3siteEvent(e) {
            return await this.requestMethod("recordVisitWeb3siteEvent", {
                domain: e
            })
        }
        async recordUseContractEvent(e, t) {
            return await this.requestMethod("recordUseContractEvent", {
                contractAddress: e,
                domain: t
            })
        }
        consoleLog(e) {
            return this.requestMethod("consoleLog", e)
        }
        listenCurrentPage(e) {
            return new Promise( (t, o) => {
                const n = i => {
                    const s = i.data;
                    if (!s || "mises-proxy-listen-current-page" !== s.type)
                        return;
                    if (s.method !== e)
                        return;
                    this.eventListener.removeMessageListener(n);
                    const r = s.data;
                    r ? t(r) : o(new Error("Result is null"))
                }
                ;
                this.eventListener.addMessageListener(n)
            }
            )
        }
        postUserDecision(e) {
            const t = new Uint8Array(8)
              , o = {
                type: "mises-proxy-listen-current-page",
                id: Array.from(crypto.getRandomValues(t)).map(e => e.toString(16)).join(""),
                method: "userDecision",
                data: {
                    value: e
                }
            };
            this.eventListener.postMessage(o)
        }
        async listenUserDecision() {
            return await this.listenCurrentPage("userDecision")
        }
    }
      , t = (e, t="domain") => {
        let o = e;
        o.match(/^[a-zA-Z0-9-]+:\/\/.+$/) && (o = o.replace(/^[a-zA-Z0-9-]+:\/\//, ""));
        const n = o.indexOf("/");
        n >= 0 && (o = o.slice(0, n));
        const i = o.indexOf("?");
        i >= 0 && (o = o.slice(0, i));
        const s = o.split(".").map(e => e.trim()).filter(e => e.length > 0);
        if (s.length < 2)
            return "";
        const r = s[s.length - 1].indexOf(":");
        return r >= 0 && (s[s.length - 1] = s[s.length - 1].slice(0, r)),
        "topdomain" === t ? s[s.length - 2] + "." + s[s.length - 1] : s.join(".")
    }
    ;
    new class {
        constructor() {
            this.blackNotifyingMap = new Map,
            this.isRecordVisitDomain = !1,
            this.container = null,
            this.config = {
                maxRetryNum: 5,
                retryCount: 0
            },
            this.domainInfo = {
                domainSafeLevel: "",
                hostname: window.location.ancestorOrigins.length > 0 ? t(window.location.ancestorOrigins[0]) : window.location.hostname,
                type: "normal",
                suggested_url: "",
                checkStatus: "waitCheck",
                isFuzzyCheck: !1,
                html_body_fuzzy_hash: "",
                logo_phash: "",
                title_keyword: ""
            },
            this.init()
        }
        init() {
            window.location.ancestorOrigins.length > 0 || this.initWeb3Proxy()
        }
        initWeb3Proxy() {
            console.log("initWeb3Proxy");
            const e = {
                apply: async (e, t, o) => {
                    try {
                        const n = [...o][0];
                        console.log("Transaction Method Data :>> ", n);
                        const i = this.isNotableAction(n).result
                          , s = void 0 !== n ? n.method : "unKonwn";
                        if (this.recordVisitWeb3site(),
                        this.isShouldVerifyDomain() && this.verifyDomain(s),
                        i) {
                            let i;
                            if ("eth_signTypedData_v4" === s) {
                                const e = n.params[1];
                                i = JSON.parse(e).domain.verifyingContract
                            } else
                                i = n.params[0].to;
                            if (this.recordUseContract(i),
                            this.isShouldVerifyContract())
                                return this.verifyContract(i),
                                Reflect.apply(e, t, o)
                        }
                        return Reflect.apply(e, t, o)
                    } catch (n) {
                        return console.log("handler error: ", n),
                        Reflect.apply(e, t, o)
                    }
                }
            }
              , t = {
                apply: async (e, t, o) => {
                    try {
                        const n = [...o][0];
                        return console.log("handlerEnable Transaction Method Data :>> ", n),
                        this.recordVisitWeb3site(),
                        this.isShouldVerifyDomain() && this.verifyDomain("eth_requestAccounts"),
                        Reflect.apply(e, t, o)
                    } catch (n) {
                        return console.log("handler error: ", n),
                        Reflect.apply(e, t, o)
                    }
                }
            }
              , o = {
                apply: (e, t, o) => {
                    var n, i;
                    const [s,r] = o;
                    return console.log("handlerSend args :>> ", o),
                    "string" == typeof s ? null === (n = window.ethereum) || void 0 === n ? void 0 : n.request({
                        method: s,
                        params: r
                    }) : r ? null === (i = window.ethereum) || void 0 === i ? void 0 : i.sendAsync(s, r) : Reflect.apply(e, t, o)
                }
            }
              , n = setInterval( () => i(), 1e3);
            function i() {
                let i = !1;
                if (void 0 !== window.ethereum) {
                    const n = new Proxy(window.ethereum.request,e)
                      , s = new Proxy(window.ethereum.enable,t)
                      , r = new Proxy(window.ethereum.send,o)
                      , a = new Proxy(window.ethereum.sendAsync,e);
                    window.ethereum.request = n,
                    window.ethereum.send = r,
                    window.ethereum.sendAsync = a,
                    window.ethereum.enable = s,
                    i = !0,
                    console.log("Find ethereum")
                }
                if (void 0 !== window.web3 && void 0 !== window.web3.currentProvider) {
                    const t = new Proxy(window.web3.currentProvider,e);
                    window.web3.currentProvider = t,
                    i = !0,
                    console.log("Find web3")
                }
                clearInterval(n),
                i || console.log("Did not find ethereum or web3")
            }
            i(),
            setTimeout( () => {
                clearInterval(n)
            }
            , 1e4)
        }
        isNotableAction(e) {
            try {
                if (void 0 !== e.method) {
                    if ("eth_sendTransaction" === e.method) {
                        let t = "transfer";
                        return (0 === e.params.length || void 0 === e.params[0].data) && (t = "transfer"),
                        {
                            result: !0,
                            action: t
                        }
                    }
                    if ("eth_signTypedData_v4" === e.method)
                        return {
                            result: !0,
                            action: "sign"
                        }
                }
                return {
                    result: !1
                }
            } catch (e) {
                return {
                    result: !1
                }
            }
        }
        isShouldVerifyContract() {
            return "white" !== this.domainInfo.domainSafeLevel
        }
        isShouldVerifyDomain() {
            return "finshedCheck" !== this.domainInfo.checkStatus
        }
        async recordUseContract(t) {
            e.recordUseContractEvent(t, this.domainInfo.hostname)
        }
        async recordVisitWeb3site() {
            this.isRecordVisitDomain || (this.isRecordVisitDomain = !0,
            e.recordVisitWeb3siteEvent(this.domainInfo.hostname))
        }
        async verifyContract(t) {
            if (this.hasBlackNotifying(t))
                return void console.log("verifyContract hasBlackNotifying: ", t);
            this.addBlackNotifying(t),
            setTimeout( () => {
                this.removeBlackNotifying(t)
            }
            , 6e4);
            const o = await e.verifyContract(t, this.domainInfo.hostname);
            console.log("verifyContractResult :>>", o),
            o && o.level || this.removeBlackNotifying(t)
        }
        hasBlackNotifying(e) {
            return "" !== e && this.blackNotifyingMap.has(e)
        }
        removeBlackNotifying(e) {
            this.blackNotifyingMap.delete(e)
        }
        addBlackNotifying(e) {
            this.blackNotifyingMap.set(e, "1")
        }
        async verifyDomain(t) {
            if (this.config.retryCount >= this.config.maxRetryNum)
                return void console.log("verifyDomain maxRetryNum  ", this.config.maxRetryNum);
            const o = this.domainInfo.hostname;
            if (this.config.retryCount > 0 && "eth_requestAccounts" != t)
                return void console.log("verifyDomain not eth_requestAccounts >> ", o, t);
            if (this.hasBlackNotifying(o))
                return void console.log("verifyDomain hasBlackNotifying: ", o);
            this.addBlackNotifying(o),
            setTimeout( () => {
                this.removeBlackNotifying(o)
            }
            , 5e3),
            this.config.retryCount++,
            console.log("verifyDomain count ", this.config.retryCount);
            const n = document.documentElement
              , i = await e.verifyDomain(this.domainInfo.hostname, this.getSiteLogo(), n.innerText);
            console.log("checkResult :>>", i),
            i && i.level && (this.domainInfo.domainSafeLevel = i.level,
            this.domainInfo.suggested_url = i.suggested_url,
            this.domainInfo.html_body_fuzzy_hash = i.html_body_fuzzy_hash || "",
            this.domainInfo.logo_phash = i.logo_phash || "",
            this.domainInfo.title_keyword = i.title_keyword || "",
            "fuzzy" == this.domainInfo.domainSafeLevel && this.doFuzzyCheck()),
            i && i.level || this.removeBlackNotifying(o)
        }
        async doFuzzyCheck() {
            if (!this.domainInfo.isFuzzyCheck)
                return this.domainInfo.isFuzzyCheck = !0,
                this.fuzzyCheckTitle() ? this.notifyFuzzyDomain("title") : this.fuzzyCheckLogo() ? this.notifyFuzzyDomain("logo") : await this.fuzzyCheckHtml() ? this.notifyFuzzyDomain("html") : void 0
        }
        fuzzyCheckTitle() {
            if ("" != this.domainInfo.title_keyword) {
                const e = this.domainInfo.title_keyword.toLowerCase()
                  , t = document.title.toLowerCase();
                if (console.log("document: ", t),
                t.toLowerCase().replace(",", "").split(" ").find(t => t == e))
                    return !0
            }
            return !1
        }
        fuzzyCheckLogo() {
            const e = t(this.domainInfo.suggested_url, "topdomain");
            if ("" == e)
                return !1;
            const o = document.querySelectorAll("head > link");
            for (const n of o) {
                if (!n.hasAttribute("href"))
                    continue;
                const o = n.getAttribute("href") || "";
                if (-1 != o.indexOf("http") && e === t(o))
                    return !0
            }
            return !1
        }
        getSiteLogo() {
            const e = document.getElementsByTagName("link");
            let t = "";
            if (e.length > 0)
                for (let o = 0; o < e.length && !(o > 10); o++)
                    if (e[o].rel.indexOf("icon") > -1) {
                        const n = e[o].href
                          , i = e[o].sizes;
                        if ("" == t && (t = n),
                        i && "32x32" == i.toString()) {
                            t = n;
                            break
                        }
                    }
            return console.log("site_logo: ", t),
            t
        }
        async fuzzyCheckHtml() {
            if ("" == this.domainInfo.html_body_fuzzy_hash)
                return !1;
            const t = document.body.outerHTML
              , o = await e.calculateHtmlSimilarly(t, this.domainInfo.html_body_fuzzy_hash);
            return console.log("score: ", o),
            !!(o && "number" == typeof o && o > 60)
        }
        async notifyFuzzyDomain(t) {
            console.log("doFuzzyCheck notifyFuzzyDomain start tag ", t);
            const o = await e.notifyFuzzyDomain(this.domainInfo.hostname, this.domainInfo.suggested_url);
            console.log("doFuzzyCheck result >>: ", o)
        }
    }
}
)();
