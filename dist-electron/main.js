import lu, { protocol as du, app as We, session as zu, BrowserWindow as sa, ipcMain as Te, shell as Uu } from "electron";
import * as qe from "path";
import * as ft from "fs/promises";
import { fileURLToPath as Ku } from "url";
import me from "node:process";
import ce from "node:path";
import { promisify as ge, isDeepStrictEqual as $a } from "node:util";
import x from "node:fs";
import Rt from "node:crypto";
import wa from "node:assert";
import fu from "node:os";
import "node:events";
import "node:stream";
const ht = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, hu = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), mu = 1e6, Gu = (e) => e >= "0" && e <= "9";
function pu(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= mu;
  }
  return !1;
}
function zn(e, t) {
  return hu.has(e) ? !1 : (e && pu(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function Hu(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let s = "", r = "start", l = !1, n = 0;
  for (const i of e) {
    if (n++, l) {
      s += i, l = !1;
      continue;
    }
    if (i === "\\") {
      if (r === "index")
        throw new Error(`Invalid character '${i}' in an index at position ${n}`);
      if (r === "indexEnd")
        throw new Error(`Invalid character '${i}' after an index at position ${n}`);
      l = !0, r = r === "start" ? "property" : r;
      continue;
    }
    switch (i) {
      case ".": {
        if (r === "index")
          throw new Error(`Invalid character '${i}' in an index at position ${n}`);
        if (r === "indexEnd") {
          r = "property";
          break;
        }
        if (!zn(s, t))
          return [];
        s = "", r = "property";
        break;
      }
      case "[": {
        if (r === "index")
          throw new Error(`Invalid character '${i}' in an index at position ${n}`);
        if (r === "indexEnd") {
          r = "index";
          break;
        }
        if (r === "property" || r === "start") {
          if ((s || r === "property") && !zn(s, t))
            return [];
          s = "";
        }
        r = "index";
        break;
      }
      case "]": {
        if (r === "index") {
          if (s === "")
            s = (t.pop() || "") + "[]", r = "property";
          else {
            const a = Number.parseInt(s, 10);
            !Number.isNaN(a) && Number.isFinite(a) && a >= 0 && a <= Number.MAX_SAFE_INTEGER && a <= mu && s === String(a) ? t.push(a) : t.push(s), s = "", r = "indexEnd";
          }
          break;
        }
        if (r === "indexEnd")
          throw new Error(`Invalid character '${i}' after an index at position ${n}`);
        s += i;
        break;
      }
      default: {
        if (r === "index" && !Gu(i))
          throw new Error(`Invalid character '${i}' in an index at position ${n}`);
        if (r === "indexEnd")
          throw new Error(`Invalid character '${i}' after an index at position ${n}`);
        r === "start" && (r = "property"), s += i;
      }
    }
  }
  switch (l && (s += "\\"), r) {
    case "property": {
      if (!zn(s, t))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function bn(e) {
  if (typeof e == "string")
    return Hu(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [s, r] of e.entries()) {
      if (typeof r != "string" && typeof r != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${s}, got ${typeof r}`);
      if (typeof r == "number" && !Number.isFinite(r))
        throw new TypeError(`Path segment at index ${s} must be a finite number, got ${r}`);
      if (hu.has(r))
        return [];
      typeof r == "string" && pu(r) ? t.push(Number.parseInt(r, 10)) : t.push(r);
    }
    return t;
  }
  return [];
}
function Ea(e, t, s) {
  if (!ht(e) || typeof t != "string" && !Array.isArray(t))
    return s === void 0 ? e : s;
  const r = bn(t);
  if (r.length === 0)
    return s;
  for (let l = 0; l < r.length; l++) {
    const n = r[l];
    if (e = e[n], e == null) {
      if (l !== r.length - 1)
        return s;
      break;
    }
  }
  return e === void 0 ? s : e;
}
function kt(e, t, s) {
  if (!ht(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const r = e, l = bn(t);
  if (l.length === 0)
    return e;
  for (let n = 0; n < l.length; n++) {
    const i = l[n];
    if (n === l.length - 1)
      e[i] = s;
    else if (!ht(e[i])) {
      const u = typeof l[n + 1] == "number";
      e[i] = u ? [] : {};
    }
    e = e[i];
  }
  return r;
}
function Ju(e, t) {
  if (!ht(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const s = bn(t);
  if (s.length === 0)
    return !1;
  for (let r = 0; r < s.length; r++) {
    const l = s[r];
    if (r === s.length - 1)
      return Object.hasOwn(e, l) ? (delete e[l], !0) : !1;
    if (e = e[l], !ht(e))
      return !1;
  }
}
function Un(e, t) {
  if (!ht(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const s = bn(t);
  if (s.length === 0)
    return !1;
  for (const r of s) {
    if (!ht(e) || !(r in e))
      return !1;
    e = e[r];
  }
  return !0;
}
const tt = fu.homedir(), aa = fu.tmpdir(), { env: wt } = me, Bu = (e) => {
  const t = ce.join(tt, "Library");
  return {
    data: ce.join(t, "Application Support", e),
    config: ce.join(t, "Preferences", e),
    cache: ce.join(t, "Caches", e),
    log: ce.join(t, "Logs", e),
    temp: ce.join(aa, e)
  };
}, Wu = (e) => {
  const t = wt.APPDATA || ce.join(tt, "AppData", "Roaming"), s = wt.LOCALAPPDATA || ce.join(tt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ce.join(s, e, "Data"),
    config: ce.join(t, e, "Config"),
    cache: ce.join(s, e, "Cache"),
    log: ce.join(s, e, "Log"),
    temp: ce.join(aa, e)
  };
}, Xu = (e) => {
  const t = ce.basename(tt);
  return {
    data: ce.join(wt.XDG_DATA_HOME || ce.join(tt, ".local", "share"), e),
    config: ce.join(wt.XDG_CONFIG_HOME || ce.join(tt, ".config"), e),
    cache: ce.join(wt.XDG_CACHE_HOME || ce.join(tt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ce.join(wt.XDG_STATE_HOME || ce.join(tt, ".local", "state"), e),
    temp: ce.join(aa, t, e)
  };
};
function Yu(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), me.platform === "darwin" ? Bu(e) : me.platform === "win32" ? Wu(e) : Xu(e);
}
const Xe = (e, t) => {
  const { onError: s } = t;
  return function(...l) {
    return e.apply(void 0, l).catch(s);
  };
}, Fe = (e, t) => {
  const { onError: s } = t;
  return function(...l) {
    try {
      return e.apply(void 0, l);
    } catch (n) {
      return s(n);
    }
  };
}, Qu = 250, Ye = (e, t) => {
  const { isRetriable: s } = t;
  return function(l) {
    const { timeout: n } = l, i = l.interval ?? Qu, a = Date.now() + n;
    return function u(...d) {
      return e.apply(void 0, d).catch((c) => {
        if (!s(c) || Date.now() >= a)
          throw c;
        const $ = Math.round(i * Math.random());
        return $ > 0 ? new Promise((_) => setTimeout(_, $)).then(() => u.apply(void 0, d)) : u.apply(void 0, d);
      });
    };
  };
}, Qe = (e, t) => {
  const { isRetriable: s } = t;
  return function(l) {
    const { timeout: n } = l, i = Date.now() + n;
    return function(...u) {
      for (; ; )
        try {
          return e.apply(void 0, u);
        } catch (d) {
          if (!s(d) || Date.now() >= i)
            throw d;
          continue;
        }
    };
  };
}, Et = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!Et.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !Zu && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!Et.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!Et.isNodeError(e))
      throw e;
    if (!Et.isChangeErrorOk(e))
      throw e;
  }
}, qt = {
  onError: Et.onChangeError
}, Ne = {
  onError: () => {
  }
}, Zu = me.getuid ? !me.getuid() : !1, _e = {
  isRetriable: Et.isRetriableError
}, $e = {
  attempt: {
    /* ASYNC */
    chmod: Xe(ge(x.chmod), qt),
    chown: Xe(ge(x.chown), qt),
    close: Xe(ge(x.close), Ne),
    fsync: Xe(ge(x.fsync), Ne),
    mkdir: Xe(ge(x.mkdir), Ne),
    realpath: Xe(ge(x.realpath), Ne),
    stat: Xe(ge(x.stat), Ne),
    unlink: Xe(ge(x.unlink), Ne),
    /* SYNC */
    chmodSync: Fe(x.chmodSync, qt),
    chownSync: Fe(x.chownSync, qt),
    closeSync: Fe(x.closeSync, Ne),
    existsSync: Fe(x.existsSync, Ne),
    fsyncSync: Fe(x.fsync, Ne),
    mkdirSync: Fe(x.mkdirSync, Ne),
    realpathSync: Fe(x.realpathSync, Ne),
    statSync: Fe(x.statSync, Ne),
    unlinkSync: Fe(x.unlinkSync, Ne)
  },
  retry: {
    /* ASYNC */
    close: Ye(ge(x.close), _e),
    fsync: Ye(ge(x.fsync), _e),
    open: Ye(ge(x.open), _e),
    readFile: Ye(ge(x.readFile), _e),
    rename: Ye(ge(x.rename), _e),
    stat: Ye(ge(x.stat), _e),
    write: Ye(ge(x.write), _e),
    writeFile: Ye(ge(x.writeFile), _e),
    /* SYNC */
    closeSync: Qe(x.closeSync, _e),
    fsyncSync: Qe(x.fsyncSync, _e),
    openSync: Qe(x.openSync, _e),
    readFileSync: Qe(x.readFileSync, _e),
    renameSync: Qe(x.renameSync, _e),
    statSync: Qe(x.statSync, _e),
    writeSync: Qe(x.writeSync, _e),
    writeFileSync: Qe(x.writeFileSync, _e)
  }
}, xu = "utf8", ba = 438, el = 511, tl = {}, rl = me.geteuid ? me.geteuid() : -1, nl = me.getegid ? me.getegid() : -1, sl = 1e3, al = !!me.getuid;
me.getuid && me.getuid();
const Sa = 128, ol = (e) => e instanceof Error && "code" in e, Pa = (e) => typeof e == "string", Kn = (e) => e === void 0, il = me.platform === "linux", yu = me.platform === "win32", oa = ["SIGHUP", "SIGINT", "SIGTERM"];
yu || oa.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
il && oa.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class cl {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const s of this.callbacks)
          s();
        t && (yu && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? me.kill(me.pid, "SIGTERM") : me.kill(me.pid, t));
      }
    }, this.hook = () => {
      me.once("exit", () => this.exit());
      for (const t of oa)
        try {
          me.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const ul = new cl(), ll = ul.register, we = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), l = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${l}`;
  },
  get: (e, t, s = !0) => {
    const r = we.truncate(t(e));
    return r in we.store ? we.get(e, t, s) : (we.store[r] = s, [r, () => delete we.store[r]]);
  },
  purge: (e) => {
    we.store[e] && (delete we.store[e], $e.attempt.unlink(e));
  },
  purgeSync: (e) => {
    we.store[e] && (delete we.store[e], $e.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in we.store)
      we.purgeSync(e);
  },
  truncate: (e) => {
    const t = ce.basename(e);
    if (t.length <= Sa)
      return e;
    const s = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!s)
      return e;
    const r = t.length - Sa;
    return `${e.slice(0, -t.length)}${s[1]}${s[2].slice(0, -r)}${s[3]}`;
  }
};
ll(we.purgeSyncAll);
function vu(e, t, s = tl) {
  if (Pa(s))
    return vu(e, t, { encoding: s });
  const l = { timeout: s.timeout ?? sl };
  let n = null, i = null, a = null;
  try {
    const u = $e.attempt.realpathSync(e), d = !!u;
    e = u || e, [i, n] = we.get(e, s.tmpCreate || we.create, s.tmpPurge !== !1);
    const c = al && Kn(s.chown), $ = Kn(s.mode);
    if (d && (c || $)) {
      const g = $e.attempt.statSync(e);
      g && (s = { ...s }, c && (s.chown = { uid: g.uid, gid: g.gid }), $ && (s.mode = g.mode));
    }
    if (!d) {
      const g = ce.dirname(e);
      $e.attempt.mkdirSync(g, {
        mode: el,
        recursive: !0
      });
    }
    a = $e.retry.openSync(l)(i, "w", s.mode || ba), s.tmpCreated && s.tmpCreated(i), Pa(t) ? $e.retry.writeSync(l)(a, t, 0, s.encoding || xu) : Kn(t) || $e.retry.writeSync(l)(a, t, 0, t.length, 0), s.fsync !== !1 && (s.fsyncWait !== !1 ? $e.retry.fsyncSync(l)(a) : $e.attempt.fsync(a)), $e.retry.closeSync(l)(a), a = null, s.chown && (s.chown.uid !== rl || s.chown.gid !== nl) && $e.attempt.chownSync(i, s.chown.uid, s.chown.gid), s.mode && s.mode !== ba && $e.attempt.chmodSync(i, s.mode);
    try {
      $e.retry.renameSync(l)(i, e);
    } catch (g) {
      if (!ol(g) || g.code !== "ENAMETOOLONG")
        throw g;
      $e.retry.renameSync(l)(i, we.truncate(e));
    }
    n(), i = null;
  } finally {
    a && $e.attempt.closeSync(a), i && we.purge(i);
  }
}
function gu(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ct = { exports: {} }, Gn = {}, ze = {}, ot = {}, Hn = {}, Jn = {}, Bn = {}, Ra;
function _n() {
  return Ra || (Ra = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class s extends t {
      constructor(o) {
        if (super(), !e.IDENTIFIER.test(o))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = s;
    class r extends t {
      constructor(o) {
        super(), this._items = typeof o == "string" ? [o] : o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const o = this._items[0];
        return o === "" || o === '""';
      }
      get str() {
        var o;
        return (o = this._str) !== null && o !== void 0 ? o : this._str = this._items.reduce((p, E) => `${p}${E}`, "");
      }
      get names() {
        var o;
        return (o = this._names) !== null && o !== void 0 ? o : this._names = this._items.reduce((p, E) => (E instanceof s && (p[E.str] = (p[E.str] || 0) + 1), p), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function l(y, ...o) {
      const p = [y[0]];
      let E = 0;
      for (; E < o.length; )
        a(p, o[E]), p.push(y[++E]);
      return new r(p);
    }
    e._ = l;
    const n = new r("+");
    function i(y, ...o) {
      const p = [_(y[0])];
      let E = 0;
      for (; E < o.length; )
        p.push(n), a(p, o[E]), p.push(n, _(y[++E]));
      return u(p), new r(p);
    }
    e.str = i;
    function a(y, o) {
      o instanceof r ? y.push(...o._items) : o instanceof s ? y.push(o) : y.push($(o));
    }
    e.addCodeArg = a;
    function u(y) {
      let o = 1;
      for (; o < y.length - 1; ) {
        if (y[o] === n) {
          const p = d(y[o - 1], y[o + 1]);
          if (p !== void 0) {
            y.splice(o - 1, 3, p);
            continue;
          }
          y[o++] = "+";
        }
        o++;
      }
    }
    function d(y, o) {
      if (o === '""')
        return y;
      if (y === '""')
        return o;
      if (typeof y == "string")
        return o instanceof s || y[y.length - 1] !== '"' ? void 0 : typeof o != "string" ? `${y.slice(0, -1)}${o}"` : o[0] === '"' ? y.slice(0, -1) + o.slice(1) : void 0;
      if (typeof o == "string" && o[0] === '"' && !(y instanceof s))
        return `"${y}${o.slice(1)}`;
    }
    function c(y, o) {
      return o.emptyStr() ? y : y.emptyStr() ? o : i`${y}${o}`;
    }
    e.strConcat = c;
    function $(y) {
      return typeof y == "number" || typeof y == "boolean" || y === null ? y : _(Array.isArray(y) ? y.join(",") : y);
    }
    function g(y) {
      return new r(_(y));
    }
    e.stringify = g;
    function _(y) {
      return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = _;
    function b(y) {
      return typeof y == "string" && e.IDENTIFIER.test(y) ? new r(`.${y}`) : l`[${y}]`;
    }
    e.getProperty = b;
    function w(y) {
      if (typeof y == "string" && e.IDENTIFIER.test(y))
        return new r(`${y}`);
      throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
    }
    e.getEsmExportName = w;
    function f(y) {
      return new r(y.toString());
    }
    e.regexpCode = f;
  })(Bn)), Bn;
}
var Wn = {}, Na;
function Oa() {
  return Na || (Na = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = _n();
    class s extends Error {
      constructor(d) {
        super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
      }
    }
    var r;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(r || (e.UsedValueState = r = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class l {
      constructor({ prefixes: d, parent: c } = {}) {
        this._names = {}, this._prefixes = d, this._parent = c;
      }
      toName(d) {
        return d instanceof t.Name ? d : this.name(d);
      }
      name(d) {
        return new t.Name(this._newName(d));
      }
      _newName(d) {
        const c = this._names[d] || this._nameGroup(d);
        return `${d}${c.index++}`;
      }
      _nameGroup(d) {
        var c, $;
        if (!(($ = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || $ === void 0) && $.has(d) || this._prefixes && !this._prefixes.has(d))
          throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
        return this._names[d] = { prefix: d, index: 0 };
      }
    }
    e.Scope = l;
    class n extends t.Name {
      constructor(d, c) {
        super(c), this.prefix = d;
      }
      setValue(d, { property: c, itemIndex: $ }) {
        this.value = d, this.scopePath = (0, t._)`.${new t.Name(c)}[${$}]`;
      }
    }
    e.ValueScopeName = n;
    const i = (0, t._)`\n`;
    class a extends l {
      constructor(d) {
        super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? i : t.nil };
      }
      get() {
        return this._scope;
      }
      name(d) {
        return new n(d, this._newName(d));
      }
      value(d, c) {
        var $;
        if (c.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const g = this.toName(d), { prefix: _ } = g, b = ($ = c.key) !== null && $ !== void 0 ? $ : c.ref;
        let w = this._values[_];
        if (w) {
          const o = w.get(b);
          if (o)
            return o;
        } else
          w = this._values[_] = /* @__PURE__ */ new Map();
        w.set(b, g);
        const f = this._scope[_] || (this._scope[_] = []), y = f.length;
        return f[y] = c.ref, g.setValue(c, { property: _, itemIndex: y }), g;
      }
      getValue(d, c) {
        const $ = this._values[d];
        if ($)
          return $.get(c);
      }
      scopeRefs(d, c = this._values) {
        return this._reduceValues(c, ($) => {
          if ($.scopePath === void 0)
            throw new Error(`CodeGen: name "${$}" has no value`);
          return (0, t._)`${d}${$.scopePath}`;
        });
      }
      scopeCode(d = this._values, c, $) {
        return this._reduceValues(d, (g) => {
          if (g.value === void 0)
            throw new Error(`CodeGen: name "${g}" has no value`);
          return g.value.code;
        }, c, $);
      }
      _reduceValues(d, c, $ = {}, g) {
        let _ = t.nil;
        for (const b in d) {
          const w = d[b];
          if (!w)
            continue;
          const f = $[b] = $[b] || /* @__PURE__ */ new Map();
          w.forEach((y) => {
            if (f.has(y))
              return;
            f.set(y, r.Started);
            let o = c(y);
            if (o) {
              const p = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              _ = (0, t._)`${_}${p} ${y} = ${o};${this.opts._n}`;
            } else if (o = g?.(y))
              _ = (0, t._)`${_}${o}${this.opts._n}`;
            else
              throw new s(y);
            f.set(y, r.Completed);
          });
        }
        return _;
      }
    }
    e.ValueScope = a;
  })(Wn)), Wn;
}
var Ia;
function ee() {
  return Ia || (Ia = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = _n(), s = Oa();
    var r = _n();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return r.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return r.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return r.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } });
    var l = Oa();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return l.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return l.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return l.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return l.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class n {
      optimizeNodes() {
        return this;
      }
      optimizeNames(h, S) {
        return this;
      }
    }
    class i extends n {
      constructor(h, S, j) {
        super(), this.varKind = h, this.name = S, this.rhs = j;
      }
      render({ es5: h, _n: S }) {
        const j = h ? s.varKinds.var : this.varKind, K = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${j} ${this.name}${K};` + S;
      }
      optimizeNames(h, S) {
        if (h[this.name.str])
          return this.rhs && (this.rhs = M(this.rhs, h, S)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class a extends n {
      constructor(h, S, j) {
        super(), this.lhs = h, this.rhs = S, this.sideEffects = j;
      }
      render({ _n: h }) {
        return `${this.lhs} = ${this.rhs};` + h;
      }
      optimizeNames(h, S) {
        if (!(this.lhs instanceof t.Name && !h[this.lhs.str] && !this.sideEffects))
          return this.rhs = M(this.rhs, h, S), this;
      }
      get names() {
        const h = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return U(h, this.rhs);
      }
    }
    class u extends a {
      constructor(h, S, j, K) {
        super(h, j, K), this.op = S;
      }
      render({ _n: h }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + h;
      }
    }
    class d extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `${this.label}:` + h;
      }
    }
    class c extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `break${this.label ? ` ${this.label}` : ""};` + h;
      }
    }
    class $ extends n {
      constructor(h) {
        super(), this.error = h;
      }
      render({ _n: h }) {
        return `throw ${this.error};` + h;
      }
      get names() {
        return this.error.names;
      }
    }
    class g extends n {
      constructor(h) {
        super(), this.code = h;
      }
      render({ _n: h }) {
        return `${this.code};` + h;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(h, S) {
        return this.code = M(this.code, h, S), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class _ extends n {
      constructor(h = []) {
        super(), this.nodes = h;
      }
      render(h) {
        return this.nodes.reduce((S, j) => S + j.render(h), "");
      }
      optimizeNodes() {
        const { nodes: h } = this;
        let S = h.length;
        for (; S--; ) {
          const j = h[S].optimizeNodes();
          Array.isArray(j) ? h.splice(S, 1, ...j) : j ? h[S] = j : h.splice(S, 1);
        }
        return h.length > 0 ? this : void 0;
      }
      optimizeNames(h, S) {
        const { nodes: j } = this;
        let K = j.length;
        for (; K--; ) {
          const H = j[K];
          H.optimizeNames(h, S) || (F(h, H.names), j.splice(K, 1));
        }
        return j.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((h, S) => z(h, S.names), {});
      }
    }
    class b extends _ {
      render(h) {
        return "{" + h._n + super.render(h) + "}" + h._n;
      }
    }
    class w extends _ {
    }
    class f extends b {
    }
    f.kind = "else";
    class y extends b {
      constructor(h, S) {
        super(S), this.condition = h;
      }
      render(h) {
        let S = `if(${this.condition})` + super.render(h);
        return this.else && (S += "else " + this.else.render(h)), S;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const h = this.condition;
        if (h === !0)
          return this.nodes;
        let S = this.else;
        if (S) {
          const j = S.optimizeNodes();
          S = this.else = Array.isArray(j) ? new f(j) : j;
        }
        if (S)
          return h === !1 ? S instanceof y ? S : S.nodes : this.nodes.length ? this : new y(W(h), S instanceof y ? [S] : S.nodes);
        if (!(h === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(h, S) {
        var j;
        if (this.else = (j = this.else) === null || j === void 0 ? void 0 : j.optimizeNames(h, S), !!(super.optimizeNames(h, S) || this.else))
          return this.condition = M(this.condition, h, S), this;
      }
      get names() {
        const h = super.names;
        return U(h, this.condition), this.else && z(h, this.else.names), h;
      }
    }
    y.kind = "if";
    class o extends b {
    }
    o.kind = "for";
    class p extends o {
      constructor(h) {
        super(), this.iteration = h;
      }
      render(h) {
        return `for(${this.iteration})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iteration = M(this.iteration, h, S), this;
      }
      get names() {
        return z(super.names, this.iteration.names);
      }
    }
    class E extends o {
      constructor(h, S, j, K) {
        super(), this.varKind = h, this.name = S, this.from = j, this.to = K;
      }
      render(h) {
        const S = h.es5 ? s.varKinds.var : this.varKind, { name: j, from: K, to: H } = this;
        return `for(${S} ${j}=${K}; ${j}<${H}; ${j}++)` + super.render(h);
      }
      get names() {
        const h = U(super.names, this.from);
        return U(h, this.to);
      }
    }
    class m extends o {
      constructor(h, S, j, K) {
        super(), this.loop = h, this.varKind = S, this.name = j, this.iterable = K;
      }
      render(h) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iterable = M(this.iterable, h, S), this;
      }
      get names() {
        return z(super.names, this.iterable.names);
      }
    }
    class v extends b {
      constructor(h, S, j) {
        super(), this.name = h, this.args = S, this.async = j;
      }
      render(h) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(h);
      }
    }
    v.kind = "func";
    class P extends _ {
      render(h) {
        return "return " + super.render(h);
      }
    }
    P.kind = "return";
    class T extends b {
      render(h) {
        let S = "try" + super.render(h);
        return this.catch && (S += this.catch.render(h)), this.finally && (S += this.finally.render(h)), S;
      }
      optimizeNodes() {
        var h, S;
        return super.optimizeNodes(), (h = this.catch) === null || h === void 0 || h.optimizeNodes(), (S = this.finally) === null || S === void 0 || S.optimizeNodes(), this;
      }
      optimizeNames(h, S) {
        var j, K;
        return super.optimizeNames(h, S), (j = this.catch) === null || j === void 0 || j.optimizeNames(h, S), (K = this.finally) === null || K === void 0 || K.optimizeNames(h, S), this;
      }
      get names() {
        const h = super.names;
        return this.catch && z(h, this.catch.names), this.finally && z(h, this.finally.names), h;
      }
    }
    class C extends b {
      constructor(h) {
        super(), this.error = h;
      }
      render(h) {
        return `catch(${this.error})` + super.render(h);
      }
    }
    C.kind = "catch";
    class V extends b {
      render(h) {
        return "finally" + super.render(h);
      }
    }
    V.kind = "finally";
    class D {
      constructor(h, S = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...S, _n: S.lines ? `
` : "" }, this._extScope = h, this._scope = new s.Scope({ parent: h }), this._nodes = [new w()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(h) {
        return this._scope.name(h);
      }
      // reserves unique name in the external scope
      scopeName(h) {
        return this._extScope.name(h);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(h, S) {
        const j = this._extScope.value(h, S);
        return (this._values[j.prefix] || (this._values[j.prefix] = /* @__PURE__ */ new Set())).add(j), j;
      }
      getScopeValue(h, S) {
        return this._extScope.getValue(h, S);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(h) {
        return this._extScope.scopeRefs(h, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(h, S, j, K) {
        const H = this._scope.toName(S);
        return j !== void 0 && K && (this._constants[H.str] = j), this._leafNode(new i(h, H, j)), H;
      }
      // `const` declaration (`var` in es5 mode)
      const(h, S, j) {
        return this._def(s.varKinds.const, h, S, j);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(h, S, j) {
        return this._def(s.varKinds.let, h, S, j);
      }
      // `var` declaration with optional assignment
      var(h, S, j) {
        return this._def(s.varKinds.var, h, S, j);
      }
      // assignment code
      assign(h, S, j) {
        return this._leafNode(new a(h, S, j));
      }
      // `+=` code
      add(h, S) {
        return this._leafNode(new u(h, e.operators.ADD, S));
      }
      // appends passed SafeExpr to code or executes Block
      code(h) {
        return typeof h == "function" ? h() : h !== t.nil && this._leafNode(new g(h)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...h) {
        const S = ["{"];
        for (const [j, K] of h)
          S.length > 1 && S.push(","), S.push(j), (j !== K || this.opts.es5) && (S.push(":"), (0, t.addCodeArg)(S, K));
        return S.push("}"), new t._Code(S);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(h, S, j) {
        if (this._blockNode(new y(h)), S && j)
          this.code(S).else().code(j).endIf();
        else if (S)
          this.code(S).endIf();
        else if (j)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(h) {
        return this._elseNode(new y(h));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new f());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(y, f);
      }
      _for(h, S) {
        return this._blockNode(h), S && this.code(S).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(h, S) {
        return this._for(new p(h), S);
      }
      // `for` statement for a range of values
      forRange(h, S, j, K, H = this.opts.es5 ? s.varKinds.var : s.varKinds.let) {
        const Z = this._scope.toName(h);
        return this._for(new E(H, Z, S, j), () => K(Z));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(h, S, j, K = s.varKinds.const) {
        const H = this._scope.toName(h);
        if (this.opts.es5) {
          const Z = S instanceof t.Name ? S : this.var("_arr", S);
          return this.forRange("_i", 0, (0, t._)`${Z}.length`, (Q) => {
            this.var(H, (0, t._)`${Z}[${Q}]`), j(H);
          });
        }
        return this._for(new m("of", K, H, S), () => j(H));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(h, S, j, K = this.opts.es5 ? s.varKinds.var : s.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(h, (0, t._)`Object.keys(${S})`, j);
        const H = this._scope.toName(h);
        return this._for(new m("in", K, H, S), () => j(H));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(o);
      }
      // `label` statement
      label(h) {
        return this._leafNode(new d(h));
      }
      // `break` statement
      break(h) {
        return this._leafNode(new c(h));
      }
      // `return` statement
      return(h) {
        const S = new P();
        if (this._blockNode(S), this.code(h), S.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(P);
      }
      // `try` statement
      try(h, S, j) {
        if (!S && !j)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const K = new T();
        if (this._blockNode(K), this.code(h), S) {
          const H = this.name("e");
          this._currNode = K.catch = new C(H), S(H);
        }
        return j && (this._currNode = K.finally = new V(), this.code(j)), this._endBlockNode(C, V);
      }
      // `throw` statement
      throw(h) {
        return this._leafNode(new $(h));
      }
      // start self-balancing block
      block(h, S) {
        return this._blockStarts.push(this._nodes.length), h && this.code(h).endBlock(S), this;
      }
      // end the current self-balancing block
      endBlock(h) {
        const S = this._blockStarts.pop();
        if (S === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const j = this._nodes.length - S;
        if (j < 0 || h !== void 0 && j !== h)
          throw new Error(`CodeGen: wrong number of nodes: ${j} vs ${h} expected`);
        return this._nodes.length = S, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(h, S = t.nil, j, K) {
        return this._blockNode(new v(h, S, j)), K && this.code(K).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(v);
      }
      optimize(h = 1) {
        for (; h-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(h) {
        return this._currNode.nodes.push(h), this;
      }
      _blockNode(h) {
        this._currNode.nodes.push(h), this._nodes.push(h);
      }
      _endBlockNode(h, S) {
        const j = this._currNode;
        if (j instanceof h || S && j instanceof S)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${S ? `${h.kind}/${S.kind}` : h.kind}"`);
      }
      _elseNode(h) {
        const S = this._currNode;
        if (!(S instanceof y))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = S.else = h, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const h = this._nodes;
        return h[h.length - 1];
      }
      set _currNode(h) {
        const S = this._nodes;
        S[S.length - 1] = h;
      }
    }
    e.CodeGen = D;
    function z(O, h) {
      for (const S in h)
        O[S] = (O[S] || 0) + (h[S] || 0);
      return O;
    }
    function U(O, h) {
      return h instanceof t._CodeOrName ? z(O, h.names) : O;
    }
    function M(O, h, S) {
      if (O instanceof t.Name)
        return j(O);
      if (!K(O))
        return O;
      return new t._Code(O._items.reduce((H, Z) => (Z instanceof t.Name && (Z = j(Z)), Z instanceof t._Code ? H.push(...Z._items) : H.push(Z), H), []));
      function j(H) {
        const Z = S[H.str];
        return Z === void 0 || h[H.str] !== 1 ? H : (delete h[H.str], Z);
      }
      function K(H) {
        return H instanceof t._Code && H._items.some((Z) => Z instanceof t.Name && h[Z.str] === 1 && S[Z.str] !== void 0);
      }
    }
    function F(O, h) {
      for (const S in h)
        O[S] = (O[S] || 0) - (h[S] || 0);
    }
    function W(O) {
      return typeof O == "boolean" || typeof O == "number" || O === null ? !O : (0, t._)`!${A(O)}`;
    }
    e.not = W;
    const B = N(e.operators.AND);
    function J(...O) {
      return O.reduce(B);
    }
    e.and = J;
    const Y = N(e.operators.OR);
    function k(...O) {
      return O.reduce(Y);
    }
    e.or = k;
    function N(O) {
      return (h, S) => h === t.nil ? S : S === t.nil ? h : (0, t._)`${A(h)} ${O} ${A(S)}`;
    }
    function A(O) {
      return O instanceof t.Name ? O : (0, t._)`(${O})`;
    }
  })(Jn)), Jn;
}
var te = {}, Ta;
function se() {
  if (Ta) return te;
  Ta = 1, Object.defineProperty(te, "__esModule", { value: !0 }), te.checkStrictMode = te.getErrorPath = te.Type = te.useFunc = te.setEvaluated = te.evaluatedPropsToName = te.mergeEvaluated = te.eachItem = te.unescapeJsonPointer = te.escapeJsonPointer = te.escapeFragment = te.unescapeFragment = te.schemaRefOrVal = te.schemaHasRulesButRef = te.schemaHasRules = te.checkUnknownRules = te.alwaysValidSchema = te.toHash = void 0;
  const e = ee(), t = _n();
  function s(m) {
    const v = {};
    for (const P of m)
      v[P] = !0;
    return v;
  }
  te.toHash = s;
  function r(m, v) {
    return typeof v == "boolean" ? v : Object.keys(v).length === 0 ? !0 : (l(m, v), !n(v, m.self.RULES.all));
  }
  te.alwaysValidSchema = r;
  function l(m, v = m.schema) {
    const { opts: P, self: T } = m;
    if (!P.strictSchema || typeof v == "boolean")
      return;
    const C = T.RULES.keywords;
    for (const V in v)
      C[V] || E(m, `unknown keyword: "${V}"`);
  }
  te.checkUnknownRules = l;
  function n(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const P in m)
      if (v[P])
        return !0;
    return !1;
  }
  te.schemaHasRules = n;
  function i(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const P in m)
      if (P !== "$ref" && v.all[P])
        return !0;
    return !1;
  }
  te.schemaHasRulesButRef = i;
  function a({ topSchemaRef: m, schemaPath: v }, P, T, C) {
    if (!C) {
      if (typeof P == "number" || typeof P == "boolean")
        return P;
      if (typeof P == "string")
        return (0, e._)`${P}`;
    }
    return (0, e._)`${m}${v}${(0, e.getProperty)(T)}`;
  }
  te.schemaRefOrVal = a;
  function u(m) {
    return $(decodeURIComponent(m));
  }
  te.unescapeFragment = u;
  function d(m) {
    return encodeURIComponent(c(m));
  }
  te.escapeFragment = d;
  function c(m) {
    return typeof m == "number" ? `${m}` : m.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  te.escapeJsonPointer = c;
  function $(m) {
    return m.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  te.unescapeJsonPointer = $;
  function g(m, v) {
    if (Array.isArray(m))
      for (const P of m)
        v(P);
    else
      v(m);
  }
  te.eachItem = g;
  function _({ mergeNames: m, mergeToName: v, mergeValues: P, resultToName: T }) {
    return (C, V, D, z) => {
      const U = D === void 0 ? V : D instanceof e.Name ? (V instanceof e.Name ? m(C, V, D) : v(C, V, D), D) : V instanceof e.Name ? (v(C, D, V), V) : P(V, D);
      return z === e.Name && !(U instanceof e.Name) ? T(C, U) : U;
    };
  }
  te.mergeEvaluated = {
    props: _({
      mergeNames: (m, v, P) => m.if((0, e._)`${P} !== true && ${v} !== undefined`, () => {
        m.if((0, e._)`${v} === true`, () => m.assign(P, !0), () => m.assign(P, (0, e._)`${P} || {}`).code((0, e._)`Object.assign(${P}, ${v})`));
      }),
      mergeToName: (m, v, P) => m.if((0, e._)`${P} !== true`, () => {
        v === !0 ? m.assign(P, !0) : (m.assign(P, (0, e._)`${P} || {}`), w(m, P, v));
      }),
      mergeValues: (m, v) => m === !0 ? !0 : { ...m, ...v },
      resultToName: b
    }),
    items: _({
      mergeNames: (m, v, P) => m.if((0, e._)`${P} !== true && ${v} !== undefined`, () => m.assign(P, (0, e._)`${v} === true ? true : ${P} > ${v} ? ${P} : ${v}`)),
      mergeToName: (m, v, P) => m.if((0, e._)`${P} !== true`, () => m.assign(P, v === !0 ? !0 : (0, e._)`${P} > ${v} ? ${P} : ${v}`)),
      mergeValues: (m, v) => m === !0 ? !0 : Math.max(m, v),
      resultToName: (m, v) => m.var("items", v)
    })
  };
  function b(m, v) {
    if (v === !0)
      return m.var("props", !0);
    const P = m.var("props", (0, e._)`{}`);
    return v !== void 0 && w(m, P, v), P;
  }
  te.evaluatedPropsToName = b;
  function w(m, v, P) {
    Object.keys(P).forEach((T) => m.assign((0, e._)`${v}${(0, e.getProperty)(T)}`, !0));
  }
  te.setEvaluated = w;
  const f = {};
  function y(m, v) {
    return m.scopeValue("func", {
      ref: v,
      code: f[v.code] || (f[v.code] = new t._Code(v.code))
    });
  }
  te.useFunc = y;
  var o;
  (function(m) {
    m[m.Num = 0] = "Num", m[m.Str = 1] = "Str";
  })(o || (te.Type = o = {}));
  function p(m, v, P) {
    if (m instanceof e.Name) {
      const T = v === o.Num;
      return P ? T ? (0, e._)`"[" + ${m} + "]"` : (0, e._)`"['" + ${m} + "']"` : T ? (0, e._)`"/" + ${m}` : (0, e._)`"/" + ${m}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return P ? (0, e.getProperty)(m).toString() : "/" + c(m);
  }
  te.getErrorPath = p;
  function E(m, v, P = m.opts.strictSchema) {
    if (P) {
      if (v = `strict mode: ${v}`, P === !0)
        throw new Error(v);
      m.self.logger.warn(v);
    }
  }
  return te.checkStrictMode = E, te;
}
var Dt = {}, ja;
function Ce() {
  if (ja) return Dt;
  ja = 1, Object.defineProperty(Dt, "__esModule", { value: !0 });
  const e = ee(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Dt.default = t, Dt;
}
var Aa;
function Sn() {
  return Aa || (Aa = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = ee(), s = se(), r = Ce();
    e.keywordError = {
      message: ({ keyword: f }) => (0, t.str)`must pass "${f}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: f, schemaType: y }) => y ? (0, t.str)`"${f}" keyword must be ${y} ($data)` : (0, t.str)`"${f}" keyword is invalid ($data)`
    };
    function l(f, y = e.keywordError, o, p) {
      const { it: E } = f, { gen: m, compositeRule: v, allErrors: P } = E, T = $(f, y, o);
      p ?? (v || P) ? u(m, T) : d(E, (0, t._)`[${T}]`);
    }
    e.reportError = l;
    function n(f, y = e.keywordError, o) {
      const { it: p } = f, { gen: E, compositeRule: m, allErrors: v } = p, P = $(f, y, o);
      u(E, P), m || v || d(p, r.default.vErrors);
    }
    e.reportExtraError = n;
    function i(f, y) {
      f.assign(r.default.errors, y), f.if((0, t._)`${r.default.vErrors} !== null`, () => f.if(y, () => f.assign((0, t._)`${r.default.vErrors}.length`, y), () => f.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = i;
    function a({ gen: f, keyword: y, schemaValue: o, data: p, errsCount: E, it: m }) {
      if (E === void 0)
        throw new Error("ajv implementation error");
      const v = f.name("err");
      f.forRange("i", E, r.default.errors, (P) => {
        f.const(v, (0, t._)`${r.default.vErrors}[${P}]`), f.if((0, t._)`${v}.instancePath === undefined`, () => f.assign((0, t._)`${v}.instancePath`, (0, t.strConcat)(r.default.instancePath, m.errorPath))), f.assign((0, t._)`${v}.schemaPath`, (0, t.str)`${m.errSchemaPath}/${y}`), m.opts.verbose && (f.assign((0, t._)`${v}.schema`, o), f.assign((0, t._)`${v}.data`, p));
      });
    }
    e.extendErrors = a;
    function u(f, y) {
      const o = f.const("err", y);
      f.if((0, t._)`${r.default.vErrors} === null`, () => f.assign(r.default.vErrors, (0, t._)`[${o}]`), (0, t._)`${r.default.vErrors}.push(${o})`), f.code((0, t._)`${r.default.errors}++`);
    }
    function d(f, y) {
      const { gen: o, validateName: p, schemaEnv: E } = f;
      E.$async ? o.throw((0, t._)`new ${f.ValidationError}(${y})`) : (o.assign((0, t._)`${p}.errors`, y), o.return(!1));
    }
    const c = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function $(f, y, o) {
      const { createErrors: p } = f.it;
      return p === !1 ? (0, t._)`{}` : g(f, y, o);
    }
    function g(f, y, o = {}) {
      const { gen: p, it: E } = f, m = [
        _(E, o),
        b(f, o)
      ];
      return w(f, y, m), p.object(...m);
    }
    function _({ errorPath: f }, { instancePath: y }) {
      const o = y ? (0, t.str)`${f}${(0, s.getErrorPath)(y, s.Type.Str)}` : f;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, o)];
    }
    function b({ keyword: f, it: { errSchemaPath: y } }, { schemaPath: o, parentSchema: p }) {
      let E = p ? y : (0, t.str)`${y}/${f}`;
      return o && (E = (0, t.str)`${E}${(0, s.getErrorPath)(o, s.Type.Str)}`), [c.schemaPath, E];
    }
    function w(f, { params: y, message: o }, p) {
      const { keyword: E, data: m, schemaValue: v, it: P } = f, { opts: T, propertyName: C, topSchemaRef: V, schemaPath: D } = P;
      p.push([c.keyword, E], [c.params, typeof y == "function" ? y(f) : y || (0, t._)`{}`]), T.messages && p.push([c.message, typeof o == "function" ? o(f) : o]), T.verbose && p.push([c.schema, v], [c.parentSchema, (0, t._)`${V}${D}`], [r.default.data, m]), C && p.push([c.propertyName, C]);
    }
  })(Hn)), Hn;
}
var ka;
function dl() {
  if (ka) return ot;
  ka = 1, Object.defineProperty(ot, "__esModule", { value: !0 }), ot.boolOrEmptySchema = ot.topBoolOrEmptySchema = void 0;
  const e = Sn(), t = ee(), s = Ce(), r = {
    message: "boolean schema is false"
  };
  function l(a) {
    const { gen: u, schema: d, validateName: c } = a;
    d === !1 ? i(a, !1) : typeof d == "object" && d.$async === !0 ? u.return(s.default.data) : (u.assign((0, t._)`${c}.errors`, null), u.return(!0));
  }
  ot.topBoolOrEmptySchema = l;
  function n(a, u) {
    const { gen: d, schema: c } = a;
    c === !1 ? (d.var(u, !1), i(a)) : d.var(u, !0);
  }
  ot.boolOrEmptySchema = n;
  function i(a, u) {
    const { gen: d, data: c } = a, $ = {
      gen: d,
      keyword: "false schema",
      data: c,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: a
    };
    (0, e.reportError)($, r, void 0, u);
  }
  return ot;
}
var ye = {}, it = {}, qa;
function _u() {
  if (qa) return it;
  qa = 1, Object.defineProperty(it, "__esModule", { value: !0 }), it.getRules = it.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function s(l) {
    return typeof l == "string" && t.has(l);
  }
  it.isJSONType = s;
  function r() {
    const l = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...l, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, l.number, l.string, l.array, l.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return it.getRules = r, it;
}
var Ue = {}, Ca;
function $u() {
  if (Ca) return Ue;
  Ca = 1, Object.defineProperty(Ue, "__esModule", { value: !0 }), Ue.shouldUseRule = Ue.shouldUseGroup = Ue.schemaHasRulesForType = void 0;
  function e({ schema: r, self: l }, n) {
    const i = l.RULES.types[n];
    return i && i !== !0 && t(r, i);
  }
  Ue.schemaHasRulesForType = e;
  function t(r, l) {
    return l.rules.some((n) => s(r, n));
  }
  Ue.shouldUseGroup = t;
  function s(r, l) {
    var n;
    return r[l.keyword] !== void 0 || ((n = l.definition.implements) === null || n === void 0 ? void 0 : n.some((i) => r[i] !== void 0));
  }
  return Ue.shouldUseRule = s, Ue;
}
var Da;
function $n() {
  if (Da) return ye;
  Da = 1, Object.defineProperty(ye, "__esModule", { value: !0 }), ye.reportTypeError = ye.checkDataTypes = ye.checkDataType = ye.coerceAndCheckDataType = ye.getJSONTypes = ye.getSchemaTypes = ye.DataType = void 0;
  const e = _u(), t = $u(), s = Sn(), r = ee(), l = se();
  var n;
  (function(o) {
    o[o.Correct = 0] = "Correct", o[o.Wrong = 1] = "Wrong";
  })(n || (ye.DataType = n = {}));
  function i(o) {
    const p = a(o.type);
    if (p.includes("null")) {
      if (o.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!p.length && o.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      o.nullable === !0 && p.push("null");
    }
    return p;
  }
  ye.getSchemaTypes = i;
  function a(o) {
    const p = Array.isArray(o) ? o : o ? [o] : [];
    if (p.every(e.isJSONType))
      return p;
    throw new Error("type must be JSONType or JSONType[]: " + p.join(","));
  }
  ye.getJSONTypes = a;
  function u(o, p) {
    const { gen: E, data: m, opts: v } = o, P = c(p, v.coerceTypes), T = p.length > 0 && !(P.length === 0 && p.length === 1 && (0, t.schemaHasRulesForType)(o, p[0]));
    if (T) {
      const C = b(p, m, v.strictNumbers, n.Wrong);
      E.if(C, () => {
        P.length ? $(o, p, P) : f(o);
      });
    }
    return T;
  }
  ye.coerceAndCheckDataType = u;
  const d = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function c(o, p) {
    return p ? o.filter((E) => d.has(E) || p === "array" && E === "array") : [];
  }
  function $(o, p, E) {
    const { gen: m, data: v, opts: P } = o, T = m.let("dataType", (0, r._)`typeof ${v}`), C = m.let("coerced", (0, r._)`undefined`);
    P.coerceTypes === "array" && m.if((0, r._)`${T} == 'object' && Array.isArray(${v}) && ${v}.length == 1`, () => m.assign(v, (0, r._)`${v}[0]`).assign(T, (0, r._)`typeof ${v}`).if(b(p, v, P.strictNumbers), () => m.assign(C, v))), m.if((0, r._)`${C} !== undefined`);
    for (const D of E)
      (d.has(D) || D === "array" && P.coerceTypes === "array") && V(D);
    m.else(), f(o), m.endIf(), m.if((0, r._)`${C} !== undefined`, () => {
      m.assign(v, C), g(o, C);
    });
    function V(D) {
      switch (D) {
        case "string":
          m.elseIf((0, r._)`${T} == "number" || ${T} == "boolean"`).assign(C, (0, r._)`"" + ${v}`).elseIf((0, r._)`${v} === null`).assign(C, (0, r._)`""`);
          return;
        case "number":
          m.elseIf((0, r._)`${T} == "boolean" || ${v} === null
              || (${T} == "string" && ${v} && ${v} == +${v})`).assign(C, (0, r._)`+${v}`);
          return;
        case "integer":
          m.elseIf((0, r._)`${T} === "boolean" || ${v} === null
              || (${T} === "string" && ${v} && ${v} == +${v} && !(${v} % 1))`).assign(C, (0, r._)`+${v}`);
          return;
        case "boolean":
          m.elseIf((0, r._)`${v} === "false" || ${v} === 0 || ${v} === null`).assign(C, !1).elseIf((0, r._)`${v} === "true" || ${v} === 1`).assign(C, !0);
          return;
        case "null":
          m.elseIf((0, r._)`${v} === "" || ${v} === 0 || ${v} === false`), m.assign(C, null);
          return;
        case "array":
          m.elseIf((0, r._)`${T} === "string" || ${T} === "number"
              || ${T} === "boolean" || ${v} === null`).assign(C, (0, r._)`[${v}]`);
      }
    }
  }
  function g({ gen: o, parentData: p, parentDataProperty: E }, m) {
    o.if((0, r._)`${p} !== undefined`, () => o.assign((0, r._)`${p}[${E}]`, m));
  }
  function _(o, p, E, m = n.Correct) {
    const v = m === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let P;
    switch (o) {
      case "null":
        return (0, r._)`${p} ${v} null`;
      case "array":
        P = (0, r._)`Array.isArray(${p})`;
        break;
      case "object":
        P = (0, r._)`${p} && typeof ${p} == "object" && !Array.isArray(${p})`;
        break;
      case "integer":
        P = T((0, r._)`!(${p} % 1) && !isNaN(${p})`);
        break;
      case "number":
        P = T();
        break;
      default:
        return (0, r._)`typeof ${p} ${v} ${o}`;
    }
    return m === n.Correct ? P : (0, r.not)(P);
    function T(C = r.nil) {
      return (0, r.and)((0, r._)`typeof ${p} == "number"`, C, E ? (0, r._)`isFinite(${p})` : r.nil);
    }
  }
  ye.checkDataType = _;
  function b(o, p, E, m) {
    if (o.length === 1)
      return _(o[0], p, E, m);
    let v;
    const P = (0, l.toHash)(o);
    if (P.array && P.object) {
      const T = (0, r._)`typeof ${p} != "object"`;
      v = P.null ? T : (0, r._)`!${p} || ${T}`, delete P.null, delete P.array, delete P.object;
    } else
      v = r.nil;
    P.number && delete P.integer;
    for (const T in P)
      v = (0, r.and)(v, _(T, p, E, m));
    return v;
  }
  ye.checkDataTypes = b;
  const w = {
    message: ({ schema: o }) => `must be ${o}`,
    params: ({ schema: o, schemaValue: p }) => typeof o == "string" ? (0, r._)`{type: ${o}}` : (0, r._)`{type: ${p}}`
  };
  function f(o) {
    const p = y(o);
    (0, s.reportError)(p, w);
  }
  ye.reportTypeError = f;
  function y(o) {
    const { gen: p, data: E, schema: m } = o, v = (0, l.schemaRefOrVal)(o, m, "type");
    return {
      gen: p,
      keyword: "type",
      data: E,
      schema: m.type,
      schemaCode: v,
      schemaValue: v,
      parentSchema: m,
      params: {},
      it: o
    };
  }
  return ye;
}
var Nt = {}, Ma;
function fl() {
  if (Ma) return Nt;
  Ma = 1, Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.assignDefaults = void 0;
  const e = ee(), t = se();
  function s(l, n) {
    const { properties: i, items: a } = l.schema;
    if (n === "object" && i)
      for (const u in i)
        r(l, u, i[u].default);
    else n === "array" && Array.isArray(a) && a.forEach((u, d) => r(l, d, u.default));
  }
  Nt.assignDefaults = s;
  function r(l, n, i) {
    const { gen: a, compositeRule: u, data: d, opts: c } = l;
    if (i === void 0)
      return;
    const $ = (0, e._)`${d}${(0, e.getProperty)(n)}`;
    if (u) {
      (0, t.checkStrictMode)(l, `default is ignored for: ${$}`);
      return;
    }
    let g = (0, e._)`${$} === undefined`;
    c.useDefaults === "empty" && (g = (0, e._)`${g} || ${$} === null || ${$} === ""`), a.if(g, (0, e._)`${$} = ${(0, e.stringify)(i)}`);
  }
  return Nt;
}
var Ae = {}, de = {}, La;
function De() {
  if (La) return de;
  La = 1, Object.defineProperty(de, "__esModule", { value: !0 }), de.validateUnion = de.validateArray = de.usePattern = de.callValidateCode = de.schemaProperties = de.allSchemaProperties = de.noPropertyInData = de.propertyInData = de.isOwnProperty = de.hasPropFunc = de.reportMissingProp = de.checkMissingProp = de.checkReportMissingProp = void 0;
  const e = ee(), t = se(), s = Ce(), r = se();
  function l(o, p) {
    const { gen: E, data: m, it: v } = o;
    E.if(c(E, m, p, v.opts.ownProperties), () => {
      o.setParams({ missingProperty: (0, e._)`${p}` }, !0), o.error();
    });
  }
  de.checkReportMissingProp = l;
  function n({ gen: o, data: p, it: { opts: E } }, m, v) {
    return (0, e.or)(...m.map((P) => (0, e.and)(c(o, p, P, E.ownProperties), (0, e._)`${v} = ${P}`)));
  }
  de.checkMissingProp = n;
  function i(o, p) {
    o.setParams({ missingProperty: p }, !0), o.error();
  }
  de.reportMissingProp = i;
  function a(o) {
    return o.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  de.hasPropFunc = a;
  function u(o, p, E) {
    return (0, e._)`${a(o)}.call(${p}, ${E})`;
  }
  de.isOwnProperty = u;
  function d(o, p, E, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(E)} !== undefined`;
    return m ? (0, e._)`${v} && ${u(o, p, E)}` : v;
  }
  de.propertyInData = d;
  function c(o, p, E, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(E)} === undefined`;
    return m ? (0, e.or)(v, (0, e.not)(u(o, p, E))) : v;
  }
  de.noPropertyInData = c;
  function $(o) {
    return o ? Object.keys(o).filter((p) => p !== "__proto__") : [];
  }
  de.allSchemaProperties = $;
  function g(o, p) {
    return $(p).filter((E) => !(0, t.alwaysValidSchema)(o, p[E]));
  }
  de.schemaProperties = g;
  function _({ schemaCode: o, data: p, it: { gen: E, topSchemaRef: m, schemaPath: v, errorPath: P }, it: T }, C, V, D) {
    const z = D ? (0, e._)`${o}, ${p}, ${m}${v}` : p, U = [
      [s.default.instancePath, (0, e.strConcat)(s.default.instancePath, P)],
      [s.default.parentData, T.parentData],
      [s.default.parentDataProperty, T.parentDataProperty],
      [s.default.rootData, s.default.rootData]
    ];
    T.opts.dynamicRef && U.push([s.default.dynamicAnchors, s.default.dynamicAnchors]);
    const M = (0, e._)`${z}, ${E.object(...U)}`;
    return V !== e.nil ? (0, e._)`${C}.call(${V}, ${M})` : (0, e._)`${C}(${M})`;
  }
  de.callValidateCode = _;
  const b = (0, e._)`new RegExp`;
  function w({ gen: o, it: { opts: p } }, E) {
    const m = p.unicodeRegExp ? "u" : "", { regExp: v } = p.code, P = v(E, m);
    return o.scopeValue("pattern", {
      key: P.toString(),
      ref: P,
      code: (0, e._)`${v.code === "new RegExp" ? b : (0, r.useFunc)(o, v)}(${E}, ${m})`
    });
  }
  de.usePattern = w;
  function f(o) {
    const { gen: p, data: E, keyword: m, it: v } = o, P = p.name("valid");
    if (v.allErrors) {
      const C = p.let("valid", !0);
      return T(() => p.assign(C, !1)), C;
    }
    return p.var(P, !0), T(() => p.break()), P;
    function T(C) {
      const V = p.const("len", (0, e._)`${E}.length`);
      p.forRange("i", 0, V, (D) => {
        o.subschema({
          keyword: m,
          dataProp: D,
          dataPropType: t.Type.Num
        }, P), p.if((0, e.not)(P), C);
      });
    }
  }
  de.validateArray = f;
  function y(o) {
    const { gen: p, schema: E, keyword: m, it: v } = o;
    if (!Array.isArray(E))
      throw new Error("ajv implementation error");
    if (E.some((V) => (0, t.alwaysValidSchema)(v, V)) && !v.opts.unevaluated)
      return;
    const T = p.let("valid", !1), C = p.name("_valid");
    p.block(() => E.forEach((V, D) => {
      const z = o.subschema({
        keyword: m,
        schemaProp: D,
        compositeRule: !0
      }, C);
      p.assign(T, (0, e._)`${T} || ${C}`), o.mergeValidEvaluated(z, C) || p.if((0, e.not)(T));
    })), o.result(T, () => o.reset(), () => o.error(!0));
  }
  return de.validateUnion = y, de;
}
var Va;
function hl() {
  if (Va) return Ae;
  Va = 1, Object.defineProperty(Ae, "__esModule", { value: !0 }), Ae.validateKeywordUsage = Ae.validSchemaType = Ae.funcKeywordCode = Ae.macroKeywordCode = void 0;
  const e = ee(), t = Ce(), s = De(), r = Sn();
  function l(g, _) {
    const { gen: b, keyword: w, schema: f, parentSchema: y, it: o } = g, p = _.macro.call(o.self, f, y, o), E = d(b, w, p);
    o.opts.validateSchema !== !1 && o.self.validateSchema(p, !0);
    const m = b.name("valid");
    g.subschema({
      schema: p,
      schemaPath: e.nil,
      errSchemaPath: `${o.errSchemaPath}/${w}`,
      topSchemaRef: E,
      compositeRule: !0
    }, m), g.pass(m, () => g.error(!0));
  }
  Ae.macroKeywordCode = l;
  function n(g, _) {
    var b;
    const { gen: w, keyword: f, schema: y, parentSchema: o, $data: p, it: E } = g;
    u(E, _);
    const m = !p && _.compile ? _.compile.call(E.self, y, o, E) : _.validate, v = d(w, f, m), P = w.let("valid");
    g.block$data(P, T), g.ok((b = _.valid) !== null && b !== void 0 ? b : P);
    function T() {
      if (_.errors === !1)
        D(), _.modifying && i(g), z(() => g.error());
      else {
        const U = _.async ? C() : V();
        _.modifying && i(g), z(() => a(g, U));
      }
    }
    function C() {
      const U = w.let("ruleErrs", null);
      return w.try(() => D((0, e._)`await `), (M) => w.assign(P, !1).if((0, e._)`${M} instanceof ${E.ValidationError}`, () => w.assign(U, (0, e._)`${M}.errors`), () => w.throw(M))), U;
    }
    function V() {
      const U = (0, e._)`${v}.errors`;
      return w.assign(U, null), D(e.nil), U;
    }
    function D(U = _.async ? (0, e._)`await ` : e.nil) {
      const M = E.opts.passContext ? t.default.this : t.default.self, F = !("compile" in _ && !p || _.schema === !1);
      w.assign(P, (0, e._)`${U}${(0, s.callValidateCode)(g, v, M, F)}`, _.modifying);
    }
    function z(U) {
      var M;
      w.if((0, e.not)((M = _.valid) !== null && M !== void 0 ? M : P), U);
    }
  }
  Ae.funcKeywordCode = n;
  function i(g) {
    const { gen: _, data: b, it: w } = g;
    _.if(w.parentData, () => _.assign(b, (0, e._)`${w.parentData}[${w.parentDataProperty}]`));
  }
  function a(g, _) {
    const { gen: b } = g;
    b.if((0, e._)`Array.isArray(${_})`, () => {
      b.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${_} : ${t.default.vErrors}.concat(${_})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(g);
    }, () => g.error());
  }
  function u({ schemaEnv: g }, _) {
    if (_.async && !g.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(g, _, b) {
    if (b === void 0)
      throw new Error(`keyword "${_}" failed to compile`);
    return g.scopeValue("keyword", typeof b == "function" ? { ref: b } : { ref: b, code: (0, e.stringify)(b) });
  }
  function c(g, _, b = !1) {
    return !_.length || _.some((w) => w === "array" ? Array.isArray(g) : w === "object" ? g && typeof g == "object" && !Array.isArray(g) : typeof g == w || b && typeof g > "u");
  }
  Ae.validSchemaType = c;
  function $({ schema: g, opts: _, self: b, errSchemaPath: w }, f, y) {
    if (Array.isArray(f.keyword) ? !f.keyword.includes(y) : f.keyword !== y)
      throw new Error("ajv implementation error");
    const o = f.dependencies;
    if (o?.some((p) => !Object.prototype.hasOwnProperty.call(g, p)))
      throw new Error(`parent schema must have dependencies of ${y}: ${o.join(",")}`);
    if (f.validateSchema && !f.validateSchema(g[y])) {
      const E = `keyword "${y}" value is invalid at path "${w}": ` + b.errorsText(f.validateSchema.errors);
      if (_.validateSchema === "log")
        b.logger.error(E);
      else
        throw new Error(E);
    }
  }
  return Ae.validateKeywordUsage = $, Ae;
}
var Ke = {}, Fa;
function ml() {
  if (Fa) return Ke;
  Fa = 1, Object.defineProperty(Ke, "__esModule", { value: !0 }), Ke.extendSubschemaMode = Ke.extendSubschemaData = Ke.getSubschema = void 0;
  const e = ee(), t = se();
  function s(n, { keyword: i, schemaProp: a, schema: u, schemaPath: d, errSchemaPath: c, topSchemaRef: $ }) {
    if (i !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const g = n.schema[i];
      return a === void 0 ? {
        schema: g,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}`
      } : {
        schema: g[a],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(a)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}/${(0, t.escapeFragment)(a)}`
      };
    }
    if (u !== void 0) {
      if (d === void 0 || c === void 0 || $ === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: d,
        topSchemaRef: $,
        errSchemaPath: c
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Ke.getSubschema = s;
  function r(n, i, { dataProp: a, dataPropType: u, data: d, dataTypes: c, propertyName: $ }) {
    if (d !== void 0 && a !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: g } = i;
    if (a !== void 0) {
      const { errorPath: b, dataPathArr: w, opts: f } = i, y = g.let("data", (0, e._)`${i.data}${(0, e.getProperty)(a)}`, !0);
      _(y), n.errorPath = (0, e.str)`${b}${(0, t.getErrorPath)(a, u, f.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${a}`, n.dataPathArr = [...w, n.parentDataProperty];
    }
    if (d !== void 0) {
      const b = d instanceof e.Name ? d : g.let("data", d, !0);
      _(b), $ !== void 0 && (n.propertyName = $);
    }
    c && (n.dataTypes = c);
    function _(b) {
      n.data = b, n.dataLevel = i.dataLevel + 1, n.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), n.parentData = i.data, n.dataNames = [...i.dataNames, b];
    }
  }
  Ke.extendSubschemaData = r;
  function l(n, { jtdDiscriminator: i, jtdMetadata: a, compositeRule: u, createErrors: d, allErrors: c }) {
    u !== void 0 && (n.compositeRule = u), d !== void 0 && (n.createErrors = d), c !== void 0 && (n.allErrors = c), n.jtdDiscriminator = i, n.jtdMetadata = a;
  }
  return Ke.extendSubschemaMode = l, Ke;
}
var be = {}, Xn, za;
function Pn() {
  return za || (za = 1, Xn = function e(t, s) {
    if (t === s) return !0;
    if (t && s && typeof t == "object" && typeof s == "object") {
      if (t.constructor !== s.constructor) return !1;
      var r, l, n;
      if (Array.isArray(t)) {
        if (r = t.length, r != s.length) return !1;
        for (l = r; l-- !== 0; )
          if (!e(t[l], s[l])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === s.source && t.flags === s.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === s.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === s.toString();
      if (n = Object.keys(t), r = n.length, r !== Object.keys(s).length) return !1;
      for (l = r; l-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(s, n[l])) return !1;
      for (l = r; l-- !== 0; ) {
        var i = n[l];
        if (!e(t[i], s[i])) return !1;
      }
      return !0;
    }
    return t !== t && s !== s;
  }), Xn;
}
var Yn = { exports: {} }, Ua;
function pl() {
  if (Ua) return Yn.exports;
  Ua = 1;
  var e = Yn.exports = function(r, l, n) {
    typeof l == "function" && (n = l, l = {}), n = l.cb || n;
    var i = typeof n == "function" ? n : n.pre || function() {
    }, a = n.post || function() {
    };
    t(l, i, a, r, "", r);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(r, l, n, i, a, u, d, c, $, g) {
    if (i && typeof i == "object" && !Array.isArray(i)) {
      l(i, a, u, d, c, $, g);
      for (var _ in i) {
        var b = i[_];
        if (Array.isArray(b)) {
          if (_ in e.arrayKeywords)
            for (var w = 0; w < b.length; w++)
              t(r, l, n, b[w], a + "/" + _ + "/" + w, u, a, _, i, w);
        } else if (_ in e.propsKeywords) {
          if (b && typeof b == "object")
            for (var f in b)
              t(r, l, n, b[f], a + "/" + _ + "/" + s(f), u, a, _, i, f);
        } else (_ in e.keywords || r.allKeys && !(_ in e.skipKeywords)) && t(r, l, n, b, a + "/" + _, u, a, _, i);
      }
      n(i, a, u, d, c, $, g);
    }
  }
  function s(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Yn.exports;
}
var Ka;
function Rn() {
  if (Ka) return be;
  Ka = 1, Object.defineProperty(be, "__esModule", { value: !0 }), be.getSchemaRefs = be.resolveUrl = be.normalizeId = be._getFullPath = be.getFullPath = be.inlineRef = void 0;
  const e = se(), t = Pn(), s = pl(), r = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function l(w, f = !0) {
    return typeof w == "boolean" ? !0 : f === !0 ? !i(w) : f ? a(w) <= f : !1;
  }
  be.inlineRef = l;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function i(w) {
    for (const f in w) {
      if (n.has(f))
        return !0;
      const y = w[f];
      if (Array.isArray(y) && y.some(i) || typeof y == "object" && i(y))
        return !0;
    }
    return !1;
  }
  function a(w) {
    let f = 0;
    for (const y in w) {
      if (y === "$ref")
        return 1 / 0;
      if (f++, !r.has(y) && (typeof w[y] == "object" && (0, e.eachItem)(w[y], (o) => f += a(o)), f === 1 / 0))
        return 1 / 0;
    }
    return f;
  }
  function u(w, f = "", y) {
    y !== !1 && (f = $(f));
    const o = w.parse(f);
    return d(w, o);
  }
  be.getFullPath = u;
  function d(w, f) {
    return w.serialize(f).split("#")[0] + "#";
  }
  be._getFullPath = d;
  const c = /#\/?$/;
  function $(w) {
    return w ? w.replace(c, "") : "";
  }
  be.normalizeId = $;
  function g(w, f, y) {
    return y = $(y), w.resolve(f, y);
  }
  be.resolveUrl = g;
  const _ = /^[a-z_][-a-z0-9._]*$/i;
  function b(w, f) {
    if (typeof w == "boolean")
      return {};
    const { schemaId: y, uriResolver: o } = this.opts, p = $(w[y] || f), E = { "": p }, m = u(o, p, !1), v = {}, P = /* @__PURE__ */ new Set();
    return s(w, { allKeys: !0 }, (V, D, z, U) => {
      if (U === void 0)
        return;
      const M = m + D;
      let F = E[U];
      typeof V[y] == "string" && (F = W.call(this, V[y])), B.call(this, V.$anchor), B.call(this, V.$dynamicAnchor), E[D] = F;
      function W(J) {
        const Y = this.opts.uriResolver.resolve;
        if (J = $(F ? Y(F, J) : J), P.has(J))
          throw C(J);
        P.add(J);
        let k = this.refs[J];
        return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? T(V, k.schema, J) : J !== $(M) && (J[0] === "#" ? (T(V, v[J], J), v[J] = V) : this.refs[J] = M), J;
      }
      function B(J) {
        if (typeof J == "string") {
          if (!_.test(J))
            throw new Error(`invalid anchor "${J}"`);
          W.call(this, `#${J}`);
        }
      }
    }), v;
    function T(V, D, z) {
      if (D !== void 0 && !t(V, D))
        throw C(z);
    }
    function C(V) {
      return new Error(`reference "${V}" resolves to more than one schema`);
    }
  }
  return be.getSchemaRefs = b, be;
}
var Ga;
function Nn() {
  if (Ga) return ze;
  Ga = 1, Object.defineProperty(ze, "__esModule", { value: !0 }), ze.getData = ze.KeywordCxt = ze.validateFunctionCode = void 0;
  const e = dl(), t = $n(), s = $u(), r = $n(), l = fl(), n = hl(), i = ml(), a = ee(), u = Ce(), d = Rn(), c = se(), $ = Sn();
  function g(R) {
    if (m(R) && (P(R), E(R))) {
      f(R);
      return;
    }
    _(R, () => (0, e.topBoolOrEmptySchema)(R));
  }
  ze.validateFunctionCode = g;
  function _({ gen: R, validateName: I, schema: q, schemaEnv: L, opts: G }, X) {
    G.code.es5 ? R.func(I, (0, a._)`${u.default.data}, ${u.default.valCxt}`, L.$async, () => {
      R.code((0, a._)`"use strict"; ${o(q, G)}`), w(R, G), R.code(X);
    }) : R.func(I, (0, a._)`${u.default.data}, ${b(G)}`, L.$async, () => R.code(o(q, G)).code(X));
  }
  function b(R) {
    return (0, a._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${R.dynamicRef ? (0, a._)`, ${u.default.dynamicAnchors}={}` : a.nil}}={}`;
  }
  function w(R, I) {
    R.if(u.default.valCxt, () => {
      R.var(u.default.instancePath, (0, a._)`${u.default.valCxt}.${u.default.instancePath}`), R.var(u.default.parentData, (0, a._)`${u.default.valCxt}.${u.default.parentData}`), R.var(u.default.parentDataProperty, (0, a._)`${u.default.valCxt}.${u.default.parentDataProperty}`), R.var(u.default.rootData, (0, a._)`${u.default.valCxt}.${u.default.rootData}`), I.dynamicRef && R.var(u.default.dynamicAnchors, (0, a._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      R.var(u.default.instancePath, (0, a._)`""`), R.var(u.default.parentData, (0, a._)`undefined`), R.var(u.default.parentDataProperty, (0, a._)`undefined`), R.var(u.default.rootData, u.default.data), I.dynamicRef && R.var(u.default.dynamicAnchors, (0, a._)`{}`);
    });
  }
  function f(R) {
    const { schema: I, opts: q, gen: L } = R;
    _(R, () => {
      q.$comment && I.$comment && U(R), V(R), L.let(u.default.vErrors, null), L.let(u.default.errors, 0), q.unevaluated && y(R), T(R), M(R);
    });
  }
  function y(R) {
    const { gen: I, validateName: q } = R;
    R.evaluated = I.const("evaluated", (0, a._)`${q}.evaluated`), I.if((0, a._)`${R.evaluated}.dynamicProps`, () => I.assign((0, a._)`${R.evaluated}.props`, (0, a._)`undefined`)), I.if((0, a._)`${R.evaluated}.dynamicItems`, () => I.assign((0, a._)`${R.evaluated}.items`, (0, a._)`undefined`));
  }
  function o(R, I) {
    const q = typeof R == "object" && R[I.schemaId];
    return q && (I.code.source || I.code.process) ? (0, a._)`/*# sourceURL=${q} */` : a.nil;
  }
  function p(R, I) {
    if (m(R) && (P(R), E(R))) {
      v(R, I);
      return;
    }
    (0, e.boolOrEmptySchema)(R, I);
  }
  function E({ schema: R, self: I }) {
    if (typeof R == "boolean")
      return !R;
    for (const q in R)
      if (I.RULES.all[q])
        return !0;
    return !1;
  }
  function m(R) {
    return typeof R.schema != "boolean";
  }
  function v(R, I) {
    const { schema: q, gen: L, opts: G } = R;
    G.$comment && q.$comment && U(R), D(R), z(R);
    const X = L.const("_errs", u.default.errors);
    T(R, X), L.var(I, (0, a._)`${X} === ${u.default.errors}`);
  }
  function P(R) {
    (0, c.checkUnknownRules)(R), C(R);
  }
  function T(R, I) {
    if (R.opts.jtd)
      return W(R, [], !1, I);
    const q = (0, t.getSchemaTypes)(R.schema), L = (0, t.coerceAndCheckDataType)(R, q);
    W(R, q, !L, I);
  }
  function C(R) {
    const { schema: I, errSchemaPath: q, opts: L, self: G } = R;
    I.$ref && L.ignoreKeywordsWithRef && (0, c.schemaHasRulesButRef)(I, G.RULES) && G.logger.warn(`$ref: keywords ignored in schema at path "${q}"`);
  }
  function V(R) {
    const { schema: I, opts: q } = R;
    I.default !== void 0 && q.useDefaults && q.strictSchema && (0, c.checkStrictMode)(R, "default is ignored in the schema root");
  }
  function D(R) {
    const I = R.schema[R.opts.schemaId];
    I && (R.baseId = (0, d.resolveUrl)(R.opts.uriResolver, R.baseId, I));
  }
  function z(R) {
    if (R.schema.$async && !R.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function U({ gen: R, schemaEnv: I, schema: q, errSchemaPath: L, opts: G }) {
    const X = q.$comment;
    if (G.$comment === !0)
      R.code((0, a._)`${u.default.self}.logger.log(${X})`);
    else if (typeof G.$comment == "function") {
      const ae = (0, a.str)`${L}/$comment`, pe = R.scopeValue("root", { ref: I.root });
      R.code((0, a._)`${u.default.self}.opts.$comment(${X}, ${ae}, ${pe}.schema)`);
    }
  }
  function M(R) {
    const { gen: I, schemaEnv: q, validateName: L, ValidationError: G, opts: X } = R;
    q.$async ? I.if((0, a._)`${u.default.errors} === 0`, () => I.return(u.default.data), () => I.throw((0, a._)`new ${G}(${u.default.vErrors})`)) : (I.assign((0, a._)`${L}.errors`, u.default.vErrors), X.unevaluated && F(R), I.return((0, a._)`${u.default.errors} === 0`));
  }
  function F({ gen: R, evaluated: I, props: q, items: L }) {
    q instanceof a.Name && R.assign((0, a._)`${I}.props`, q), L instanceof a.Name && R.assign((0, a._)`${I}.items`, L);
  }
  function W(R, I, q, L) {
    const { gen: G, schema: X, data: ae, allErrors: pe, opts: ue, self: le } = R, { RULES: oe } = le;
    if (X.$ref && (ue.ignoreKeywordsWithRef || !(0, c.schemaHasRulesButRef)(X, oe))) {
      G.block(() => K(R, "$ref", oe.all.$ref.definition));
      return;
    }
    ue.jtd || J(R, I), G.block(() => {
      for (const he of oe.rules)
        Re(he);
      Re(oe.post);
    });
    function Re(he) {
      (0, s.shouldUseGroup)(X, he) && (he.type ? (G.if((0, r.checkDataType)(he.type, ae, ue.strictNumbers)), B(R, he), I.length === 1 && I[0] === he.type && q && (G.else(), (0, r.reportTypeError)(R)), G.endIf()) : B(R, he), pe || G.if((0, a._)`${u.default.errors} === ${L || 0}`));
    }
  }
  function B(R, I) {
    const { gen: q, schema: L, opts: { useDefaults: G } } = R;
    G && (0, l.assignDefaults)(R, I.type), q.block(() => {
      for (const X of I.rules)
        (0, s.shouldUseRule)(L, X) && K(R, X.keyword, X.definition, I.type);
    });
  }
  function J(R, I) {
    R.schemaEnv.meta || !R.opts.strictTypes || (Y(R, I), R.opts.allowUnionTypes || k(R, I), N(R, R.dataTypes));
  }
  function Y(R, I) {
    if (I.length) {
      if (!R.dataTypes.length) {
        R.dataTypes = I;
        return;
      }
      I.forEach((q) => {
        O(R.dataTypes, q) || S(R, `type "${q}" not allowed by context "${R.dataTypes.join(",")}"`);
      }), h(R, I);
    }
  }
  function k(R, I) {
    I.length > 1 && !(I.length === 2 && I.includes("null")) && S(R, "use allowUnionTypes to allow union type keyword");
  }
  function N(R, I) {
    const q = R.self.RULES.all;
    for (const L in q) {
      const G = q[L];
      if (typeof G == "object" && (0, s.shouldUseRule)(R.schema, G)) {
        const { type: X } = G.definition;
        X.length && !X.some((ae) => A(I, ae)) && S(R, `missing type "${X.join(",")}" for keyword "${L}"`);
      }
    }
  }
  function A(R, I) {
    return R.includes(I) || I === "number" && R.includes("integer");
  }
  function O(R, I) {
    return R.includes(I) || I === "integer" && R.includes("number");
  }
  function h(R, I) {
    const q = [];
    for (const L of R.dataTypes)
      O(I, L) ? q.push(L) : I.includes("integer") && L === "number" && q.push("integer");
    R.dataTypes = q;
  }
  function S(R, I) {
    const q = R.schemaEnv.baseId + R.errSchemaPath;
    I += ` at "${q}" (strictTypes)`, (0, c.checkStrictMode)(R, I, R.opts.strictTypes);
  }
  class j {
    constructor(I, q, L) {
      if ((0, n.validateKeywordUsage)(I, q, L), this.gen = I.gen, this.allErrors = I.allErrors, this.keyword = L, this.data = I.data, this.schema = I.schema[L], this.$data = q.$data && I.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, c.schemaRefOrVal)(I, this.schema, L, this.$data), this.schemaType = q.schemaType, this.parentSchema = I.schema, this.params = {}, this.it = I, this.def = q, this.$data)
        this.schemaCode = I.gen.const("vSchema", Q(this.$data, I));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, q.schemaType, q.allowUndefined))
        throw new Error(`${L} value must be ${JSON.stringify(q.schemaType)}`);
      ("code" in q ? q.trackErrors : q.errors !== !1) && (this.errsCount = I.gen.const("_errs", u.default.errors));
    }
    result(I, q, L) {
      this.failResult((0, a.not)(I), q, L);
    }
    failResult(I, q, L) {
      this.gen.if(I), L ? L() : this.error(), q ? (this.gen.else(), q(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(I, q) {
      this.failResult((0, a.not)(I), void 0, q);
    }
    fail(I) {
      if (I === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(I), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(I) {
      if (!this.$data)
        return this.fail(I);
      const { schemaCode: q } = this;
      this.fail((0, a._)`${q} !== undefined && (${(0, a.or)(this.invalid$data(), I)})`);
    }
    error(I, q, L) {
      if (q) {
        this.setParams(q), this._error(I, L), this.setParams({});
        return;
      }
      this._error(I, L);
    }
    _error(I, q) {
      (I ? $.reportExtraError : $.reportError)(this, this.def.error, q);
    }
    $dataError() {
      (0, $.reportError)(this, this.def.$dataError || $.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, $.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(I) {
      this.allErrors || this.gen.if(I);
    }
    setParams(I, q) {
      q ? Object.assign(this.params, I) : this.params = I;
    }
    block$data(I, q, L = a.nil) {
      this.gen.block(() => {
        this.check$data(I, L), q();
      });
    }
    check$data(I = a.nil, q = a.nil) {
      if (!this.$data)
        return;
      const { gen: L, schemaCode: G, schemaType: X, def: ae } = this;
      L.if((0, a.or)((0, a._)`${G} === undefined`, q)), I !== a.nil && L.assign(I, !0), (X.length || ae.validateSchema) && (L.elseIf(this.invalid$data()), this.$dataError(), I !== a.nil && L.assign(I, !1)), L.else();
    }
    invalid$data() {
      const { gen: I, schemaCode: q, schemaType: L, def: G, it: X } = this;
      return (0, a.or)(ae(), pe());
      function ae() {
        if (L.length) {
          if (!(q instanceof a.Name))
            throw new Error("ajv implementation error");
          const ue = Array.isArray(L) ? L : [L];
          return (0, a._)`${(0, r.checkDataTypes)(ue, q, X.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return a.nil;
      }
      function pe() {
        if (G.validateSchema) {
          const ue = I.scopeValue("validate$data", { ref: G.validateSchema });
          return (0, a._)`!${ue}(${q})`;
        }
        return a.nil;
      }
    }
    subschema(I, q) {
      const L = (0, i.getSubschema)(this.it, I);
      (0, i.extendSubschemaData)(L, this.it, I), (0, i.extendSubschemaMode)(L, I);
      const G = { ...this.it, ...L, items: void 0, props: void 0 };
      return p(G, q), G;
    }
    mergeEvaluated(I, q) {
      const { it: L, gen: G } = this;
      L.opts.unevaluated && (L.props !== !0 && I.props !== void 0 && (L.props = c.mergeEvaluated.props(G, I.props, L.props, q)), L.items !== !0 && I.items !== void 0 && (L.items = c.mergeEvaluated.items(G, I.items, L.items, q)));
    }
    mergeValidEvaluated(I, q) {
      const { it: L, gen: G } = this;
      if (L.opts.unevaluated && (L.props !== !0 || L.items !== !0))
        return G.if(q, () => this.mergeEvaluated(I, a.Name)), !0;
    }
  }
  ze.KeywordCxt = j;
  function K(R, I, q, L) {
    const G = new j(R, q, I);
    "code" in q ? q.code(G, L) : G.$data && q.validate ? (0, n.funcKeywordCode)(G, q) : "macro" in q ? (0, n.macroKeywordCode)(G, q) : (q.compile || q.validate) && (0, n.funcKeywordCode)(G, q);
  }
  const H = /^\/(?:[^~]|~0|~1)*$/, Z = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Q(R, { dataLevel: I, dataNames: q, dataPathArr: L }) {
    let G, X;
    if (R === "")
      return u.default.rootData;
    if (R[0] === "/") {
      if (!H.test(R))
        throw new Error(`Invalid JSON-pointer: ${R}`);
      G = R, X = u.default.rootData;
    } else {
      const le = Z.exec(R);
      if (!le)
        throw new Error(`Invalid JSON-pointer: ${R}`);
      const oe = +le[1];
      if (G = le[2], G === "#") {
        if (oe >= I)
          throw new Error(ue("property/index", oe));
        return L[I - oe];
      }
      if (oe > I)
        throw new Error(ue("data", oe));
      if (X = q[I - oe], !G)
        return X;
    }
    let ae = X;
    const pe = G.split("/");
    for (const le of pe)
      le && (X = (0, a._)`${X}${(0, a.getProperty)((0, c.unescapeJsonPointer)(le))}`, ae = (0, a._)`${ae} && ${X}`);
    return ae;
    function ue(le, oe) {
      return `Cannot access ${le} ${oe} levels up, current level is ${I}`;
    }
  }
  return ze.getData = Q, ze;
}
var Mt = {}, Ha;
function ia() {
  if (Ha) return Mt;
  Ha = 1, Object.defineProperty(Mt, "__esModule", { value: !0 });
  class e extends Error {
    constructor(s) {
      super("validation failed"), this.errors = s, this.ajv = this.validation = !0;
    }
  }
  return Mt.default = e, Mt;
}
var Lt = {}, Ja;
function On() {
  if (Ja) return Lt;
  Ja = 1, Object.defineProperty(Lt, "__esModule", { value: !0 });
  const e = Rn();
  class t extends Error {
    constructor(r, l, n, i) {
      super(i || `can't resolve reference ${n} from id ${l}`), this.missingRef = (0, e.resolveUrl)(r, l, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return Lt.default = t, Lt;
}
var Oe = {}, Ba;
function In() {
  if (Ba) return Oe;
  Ba = 1, Object.defineProperty(Oe, "__esModule", { value: !0 }), Oe.resolveSchema = Oe.getCompilingSchema = Oe.resolveRef = Oe.compileSchema = Oe.SchemaEnv = void 0;
  const e = ee(), t = ia(), s = Ce(), r = Rn(), l = se(), n = Nn();
  class i {
    constructor(y) {
      var o;
      this.refs = {}, this.dynamicAnchors = {};
      let p;
      typeof y.schema == "object" && (p = y.schema), this.schema = y.schema, this.schemaId = y.schemaId, this.root = y.root || this, this.baseId = (o = y.baseId) !== null && o !== void 0 ? o : (0, r.normalizeId)(p?.[y.schemaId || "$id"]), this.schemaPath = y.schemaPath, this.localRefs = y.localRefs, this.meta = y.meta, this.$async = p?.$async, this.refs = {};
    }
  }
  Oe.SchemaEnv = i;
  function a(f) {
    const y = c.call(this, f);
    if (y)
      return y;
    const o = (0, r.getFullPath)(this.opts.uriResolver, f.root.baseId), { es5: p, lines: E } = this.opts.code, { ownProperties: m } = this.opts, v = new e.CodeGen(this.scope, { es5: p, lines: E, ownProperties: m });
    let P;
    f.$async && (P = v.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const T = v.scopeName("validate");
    f.validateName = T;
    const C = {
      gen: v,
      allErrors: this.opts.allErrors,
      data: s.default.data,
      parentData: s.default.parentData,
      parentDataProperty: s.default.parentDataProperty,
      dataNames: [s.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: v.scopeValue("schema", this.opts.code.source === !0 ? { ref: f.schema, code: (0, e.stringify)(f.schema) } : { ref: f.schema }),
      validateName: T,
      ValidationError: P,
      schema: f.schema,
      schemaEnv: f,
      rootId: o,
      baseId: f.baseId || o,
      schemaPath: e.nil,
      errSchemaPath: f.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let V;
    try {
      this._compilations.add(f), (0, n.validateFunctionCode)(C), v.optimize(this.opts.code.optimize);
      const D = v.toString();
      V = `${v.scopeRefs(s.default.scope)}return ${D}`, this.opts.code.process && (V = this.opts.code.process(V, f));
      const U = new Function(`${s.default.self}`, `${s.default.scope}`, V)(this, this.scope.get());
      if (this.scope.value(T, { ref: U }), U.errors = null, U.schema = f.schema, U.schemaEnv = f, f.$async && (U.$async = !0), this.opts.code.source === !0 && (U.source = { validateName: T, validateCode: D, scopeValues: v._values }), this.opts.unevaluated) {
        const { props: M, items: F } = C;
        U.evaluated = {
          props: M instanceof e.Name ? void 0 : M,
          items: F instanceof e.Name ? void 0 : F,
          dynamicProps: M instanceof e.Name,
          dynamicItems: F instanceof e.Name
        }, U.source && (U.source.evaluated = (0, e.stringify)(U.evaluated));
      }
      return f.validate = U, f;
    } catch (D) {
      throw delete f.validate, delete f.validateName, V && this.logger.error("Error compiling schema, function code:", V), D;
    } finally {
      this._compilations.delete(f);
    }
  }
  Oe.compileSchema = a;
  function u(f, y, o) {
    var p;
    o = (0, r.resolveUrl)(this.opts.uriResolver, y, o);
    const E = f.refs[o];
    if (E)
      return E;
    let m = g.call(this, f, o);
    if (m === void 0) {
      const v = (p = f.localRefs) === null || p === void 0 ? void 0 : p[o], { schemaId: P } = this.opts;
      v && (m = new i({ schema: v, schemaId: P, root: f, baseId: y }));
    }
    if (m !== void 0)
      return f.refs[o] = d.call(this, m);
  }
  Oe.resolveRef = u;
  function d(f) {
    return (0, r.inlineRef)(f.schema, this.opts.inlineRefs) ? f.schema : f.validate ? f : a.call(this, f);
  }
  function c(f) {
    for (const y of this._compilations)
      if ($(y, f))
        return y;
  }
  Oe.getCompilingSchema = c;
  function $(f, y) {
    return f.schema === y.schema && f.root === y.root && f.baseId === y.baseId;
  }
  function g(f, y) {
    let o;
    for (; typeof (o = this.refs[y]) == "string"; )
      y = o;
    return o || this.schemas[y] || _.call(this, f, y);
  }
  function _(f, y) {
    const o = this.opts.uriResolver.parse(y), p = (0, r._getFullPath)(this.opts.uriResolver, o);
    let E = (0, r.getFullPath)(this.opts.uriResolver, f.baseId, void 0);
    if (Object.keys(f.schema).length > 0 && p === E)
      return w.call(this, o, f);
    const m = (0, r.normalizeId)(p), v = this.refs[m] || this.schemas[m];
    if (typeof v == "string") {
      const P = _.call(this, f, v);
      return typeof P?.schema != "object" ? void 0 : w.call(this, o, P);
    }
    if (typeof v?.schema == "object") {
      if (v.validate || a.call(this, v), m === (0, r.normalizeId)(y)) {
        const { schema: P } = v, { schemaId: T } = this.opts, C = P[T];
        return C && (E = (0, r.resolveUrl)(this.opts.uriResolver, E, C)), new i({ schema: P, schemaId: T, root: f, baseId: E });
      }
      return w.call(this, o, v);
    }
  }
  Oe.resolveSchema = _;
  const b = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function w(f, { baseId: y, schema: o, root: p }) {
    var E;
    if (((E = f.fragment) === null || E === void 0 ? void 0 : E[0]) !== "/")
      return;
    for (const P of f.fragment.slice(1).split("/")) {
      if (typeof o == "boolean")
        return;
      const T = o[(0, l.unescapeFragment)(P)];
      if (T === void 0)
        return;
      o = T;
      const C = typeof o == "object" && o[this.opts.schemaId];
      !b.has(P) && C && (y = (0, r.resolveUrl)(this.opts.uriResolver, y, C));
    }
    let m;
    if (typeof o != "boolean" && o.$ref && !(0, l.schemaHasRulesButRef)(o, this.RULES)) {
      const P = (0, r.resolveUrl)(this.opts.uriResolver, y, o.$ref);
      m = _.call(this, p, P);
    }
    const { schemaId: v } = this.opts;
    if (m = m || new i({ schema: o, schemaId: v, root: p, baseId: y }), m.schema !== m.root.schema)
      return m;
  }
  return Oe;
}
const yl = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", vl = "Meta-schema for $data reference (JSON AnySchema extension proposal)", gl = "object", _l = ["$data"], $l = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, wl = !1, El = {
  $id: yl,
  description: vl,
  type: gl,
  required: _l,
  properties: $l,
  additionalProperties: wl
};
var Vt = {}, Ot = { exports: {} }, Qn, Wa;
function wu() {
  if (Wa) return Qn;
  Wa = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function s(g) {
    let _ = "", b = 0, w = 0;
    for (w = 0; w < g.length; w++)
      if (b = g[w].charCodeAt(0), b !== 48) {
        if (!(b >= 48 && b <= 57 || b >= 65 && b <= 70 || b >= 97 && b <= 102))
          return "";
        _ += g[w];
        break;
      }
    for (w += 1; w < g.length; w++) {
      if (b = g[w].charCodeAt(0), !(b >= 48 && b <= 57 || b >= 65 && b <= 70 || b >= 97 && b <= 102))
        return "";
      _ += g[w];
    }
    return _;
  }
  const r = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function l(g) {
    return g.length = 0, !0;
  }
  function n(g, _, b) {
    if (g.length) {
      const w = s(g);
      if (w !== "")
        _.push(w);
      else
        return b.error = !0, !1;
      g.length = 0;
    }
    return !0;
  }
  function i(g) {
    let _ = 0;
    const b = { error: !1, address: "", zone: "" }, w = [], f = [];
    let y = !1, o = !1, p = n;
    for (let E = 0; E < g.length; E++) {
      const m = g[E];
      if (!(m === "[" || m === "]"))
        if (m === ":") {
          if (y === !0 && (o = !0), !p(f, w, b))
            break;
          if (++_ > 7) {
            b.error = !0;
            break;
          }
          E > 0 && g[E - 1] === ":" && (y = !0), w.push(":");
          continue;
        } else if (m === "%") {
          if (!p(f, w, b))
            break;
          p = l;
        } else {
          f.push(m);
          continue;
        }
    }
    return f.length && (p === l ? b.zone = f.join("") : o ? w.push(f.join("")) : w.push(s(f))), b.address = w.join(""), b;
  }
  function a(g) {
    if (u(g, ":") < 2)
      return { host: g, isIPV6: !1 };
    const _ = i(g);
    if (_.error)
      return { host: g, isIPV6: !1 };
    {
      let b = _.address, w = _.address;
      return _.zone && (b += "%" + _.zone, w += "%25" + _.zone), { host: b, isIPV6: !0, escapedHost: w };
    }
  }
  function u(g, _) {
    let b = 0;
    for (let w = 0; w < g.length; w++)
      g[w] === _ && b++;
    return b;
  }
  function d(g) {
    let _ = g;
    const b = [];
    let w = -1, f = 0;
    for (; f = _.length; ) {
      if (f === 1) {
        if (_ === ".")
          break;
        if (_ === "/") {
          b.push("/");
          break;
        } else {
          b.push(_);
          break;
        }
      } else if (f === 2) {
        if (_[0] === ".") {
          if (_[1] === ".")
            break;
          if (_[1] === "/") {
            _ = _.slice(2);
            continue;
          }
        } else if (_[0] === "/" && (_[1] === "." || _[1] === "/")) {
          b.push("/");
          break;
        }
      } else if (f === 3 && _ === "/..") {
        b.length !== 0 && b.pop(), b.push("/");
        break;
      }
      if (_[0] === ".") {
        if (_[1] === ".") {
          if (_[2] === "/") {
            _ = _.slice(3);
            continue;
          }
        } else if (_[1] === "/") {
          _ = _.slice(2);
          continue;
        }
      } else if (_[0] === "/" && _[1] === ".") {
        if (_[2] === "/") {
          _ = _.slice(2);
          continue;
        } else if (_[2] === "." && _[3] === "/") {
          _ = _.slice(3), b.length !== 0 && b.pop();
          continue;
        }
      }
      if ((w = _.indexOf("/", 1)) === -1) {
        b.push(_);
        break;
      } else
        b.push(_.slice(0, w)), _ = _.slice(w);
    }
    return b.join("");
  }
  function c(g, _) {
    const b = _ !== !0 ? escape : unescape;
    return g.scheme !== void 0 && (g.scheme = b(g.scheme)), g.userinfo !== void 0 && (g.userinfo = b(g.userinfo)), g.host !== void 0 && (g.host = b(g.host)), g.path !== void 0 && (g.path = b(g.path)), g.query !== void 0 && (g.query = b(g.query)), g.fragment !== void 0 && (g.fragment = b(g.fragment)), g;
  }
  function $(g) {
    const _ = [];
    if (g.userinfo !== void 0 && (_.push(g.userinfo), _.push("@")), g.host !== void 0) {
      let b = unescape(g.host);
      if (!t(b)) {
        const w = a(b);
        w.isIPV6 === !0 ? b = `[${w.escapedHost}]` : b = g.host;
      }
      _.push(b);
    }
    return (typeof g.port == "number" || typeof g.port == "string") && (_.push(":"), _.push(String(g.port))), _.length ? _.join("") : void 0;
  }
  return Qn = {
    nonSimpleDomain: r,
    recomposeAuthority: $,
    normalizeComponentEncoding: c,
    removeDotSegments: d,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: a,
    stringArrayToHexStripped: s
  }, Qn;
}
var Zn, Xa;
function bl() {
  if (Xa) return Zn;
  Xa = 1;
  const { isUUID: e } = wu(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, s = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function r(m) {
    return s.indexOf(
      /** @type {*} */
      m
    ) !== -1;
  }
  function l(m) {
    return m.secure === !0 ? !0 : m.secure === !1 ? !1 : m.scheme ? m.scheme.length === 3 && (m.scheme[0] === "w" || m.scheme[0] === "W") && (m.scheme[1] === "s" || m.scheme[1] === "S") && (m.scheme[2] === "s" || m.scheme[2] === "S") : !1;
  }
  function n(m) {
    return m.host || (m.error = m.error || "HTTP URIs must have a host."), m;
  }
  function i(m) {
    const v = String(m.scheme).toLowerCase() === "https";
    return (m.port === (v ? 443 : 80) || m.port === "") && (m.port = void 0), m.path || (m.path = "/"), m;
  }
  function a(m) {
    return m.secure = l(m), m.resourceName = (m.path || "/") + (m.query ? "?" + m.query : ""), m.path = void 0, m.query = void 0, m;
  }
  function u(m) {
    if ((m.port === (l(m) ? 443 : 80) || m.port === "") && (m.port = void 0), typeof m.secure == "boolean" && (m.scheme = m.secure ? "wss" : "ws", m.secure = void 0), m.resourceName) {
      const [v, P] = m.resourceName.split("?");
      m.path = v && v !== "/" ? v : void 0, m.query = P, m.resourceName = void 0;
    }
    return m.fragment = void 0, m;
  }
  function d(m, v) {
    if (!m.path)
      return m.error = "URN can not be parsed", m;
    const P = m.path.match(t);
    if (P) {
      const T = v.scheme || m.scheme || "urn";
      m.nid = P[1].toLowerCase(), m.nss = P[2];
      const C = `${T}:${v.nid || m.nid}`, V = E(C);
      m.path = void 0, V && (m = V.parse(m, v));
    } else
      m.error = m.error || "URN can not be parsed.";
    return m;
  }
  function c(m, v) {
    if (m.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const P = v.scheme || m.scheme || "urn", T = m.nid.toLowerCase(), C = `${P}:${v.nid || T}`, V = E(C);
    V && (m = V.serialize(m, v));
    const D = m, z = m.nss;
    return D.path = `${T || v.nid}:${z}`, v.skipEscape = !0, D;
  }
  function $(m, v) {
    const P = m;
    return P.uuid = P.nss, P.nss = void 0, !v.tolerant && (!P.uuid || !e(P.uuid)) && (P.error = P.error || "UUID is not valid."), P;
  }
  function g(m) {
    const v = m;
    return v.nss = (m.uuid || "").toLowerCase(), v;
  }
  const _ = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: n,
      serialize: i
    }
  ), b = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: _.domainHost,
      parse: n,
      serialize: i
    }
  ), w = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: a,
      serialize: u
    }
  ), f = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: w.domainHost,
      parse: w.parse,
      serialize: w.serialize
    }
  ), p = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: _,
      https: b,
      ws: w,
      wss: f,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: d,
          serialize: c,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: $,
          serialize: g,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(p, null);
  function E(m) {
    return m && (p[
      /** @type {SchemeName} */
      m
    ] || p[
      /** @type {SchemeName} */
      m.toLowerCase()
    ]) || void 0;
  }
  return Zn = {
    wsIsSecure: l,
    SCHEMES: p,
    isValidSchemeName: r,
    getSchemeHandler: E
  }, Zn;
}
var Ya;
function Eu() {
  if (Ya) return Ot.exports;
  Ya = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: s, normalizeComponentEncoding: r, isIPv4: l, nonSimpleDomain: n } = wu(), { SCHEMES: i, getSchemeHandler: a } = bl();
  function u(f, y) {
    return typeof f == "string" ? f = /** @type {T} */
    g(b(f, y), y) : typeof f == "object" && (f = /** @type {T} */
    b(g(f, y), y)), f;
  }
  function d(f, y, o) {
    const p = o ? Object.assign({ scheme: "null" }, o) : { scheme: "null" }, E = c(b(f, p), b(y, p), p, !0);
    return p.skipEscape = !0, g(E, p);
  }
  function c(f, y, o, p) {
    const E = {};
    return p || (f = b(g(f, o), o), y = b(g(y, o), o)), o = o || {}, !o.tolerant && y.scheme ? (E.scheme = y.scheme, E.userinfo = y.userinfo, E.host = y.host, E.port = y.port, E.path = t(y.path || ""), E.query = y.query) : (y.userinfo !== void 0 || y.host !== void 0 || y.port !== void 0 ? (E.userinfo = y.userinfo, E.host = y.host, E.port = y.port, E.path = t(y.path || ""), E.query = y.query) : (y.path ? (y.path[0] === "/" ? E.path = t(y.path) : ((f.userinfo !== void 0 || f.host !== void 0 || f.port !== void 0) && !f.path ? E.path = "/" + y.path : f.path ? E.path = f.path.slice(0, f.path.lastIndexOf("/") + 1) + y.path : E.path = y.path, E.path = t(E.path)), E.query = y.query) : (E.path = f.path, y.query !== void 0 ? E.query = y.query : E.query = f.query), E.userinfo = f.userinfo, E.host = f.host, E.port = f.port), E.scheme = f.scheme), E.fragment = y.fragment, E;
  }
  function $(f, y, o) {
    return typeof f == "string" ? (f = unescape(f), f = g(r(b(f, o), !0), { ...o, skipEscape: !0 })) : typeof f == "object" && (f = g(r(f, !0), { ...o, skipEscape: !0 })), typeof y == "string" ? (y = unescape(y), y = g(r(b(y, o), !0), { ...o, skipEscape: !0 })) : typeof y == "object" && (y = g(r(y, !0), { ...o, skipEscape: !0 })), f.toLowerCase() === y.toLowerCase();
  }
  function g(f, y) {
    const o = {
      host: f.host,
      scheme: f.scheme,
      userinfo: f.userinfo,
      port: f.port,
      path: f.path,
      query: f.query,
      nid: f.nid,
      nss: f.nss,
      uuid: f.uuid,
      fragment: f.fragment,
      reference: f.reference,
      resourceName: f.resourceName,
      secure: f.secure,
      error: ""
    }, p = Object.assign({}, y), E = [], m = a(p.scheme || o.scheme);
    m && m.serialize && m.serialize(o, p), o.path !== void 0 && (p.skipEscape ? o.path = unescape(o.path) : (o.path = escape(o.path), o.scheme !== void 0 && (o.path = o.path.split("%3A").join(":")))), p.reference !== "suffix" && o.scheme && E.push(o.scheme, ":");
    const v = s(o);
    if (v !== void 0 && (p.reference !== "suffix" && E.push("//"), E.push(v), o.path && o.path[0] !== "/" && E.push("/")), o.path !== void 0) {
      let P = o.path;
      !p.absolutePath && (!m || !m.absolutePath) && (P = t(P)), v === void 0 && P[0] === "/" && P[1] === "/" && (P = "/%2F" + P.slice(2)), E.push(P);
    }
    return o.query !== void 0 && E.push("?", o.query), o.fragment !== void 0 && E.push("#", o.fragment), E.join("");
  }
  const _ = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function b(f, y) {
    const o = Object.assign({}, y), p = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let E = !1;
    o.reference === "suffix" && (o.scheme ? f = o.scheme + ":" + f : f = "//" + f);
    const m = f.match(_);
    if (m) {
      if (p.scheme = m[1], p.userinfo = m[3], p.host = m[4], p.port = parseInt(m[5], 10), p.path = m[6] || "", p.query = m[7], p.fragment = m[8], isNaN(p.port) && (p.port = m[5]), p.host)
        if (l(p.host) === !1) {
          const T = e(p.host);
          p.host = T.host.toLowerCase(), E = T.isIPV6;
        } else
          E = !0;
      p.scheme === void 0 && p.userinfo === void 0 && p.host === void 0 && p.port === void 0 && p.query === void 0 && !p.path ? p.reference = "same-document" : p.scheme === void 0 ? p.reference = "relative" : p.fragment === void 0 ? p.reference = "absolute" : p.reference = "uri", o.reference && o.reference !== "suffix" && o.reference !== p.reference && (p.error = p.error || "URI is not a " + o.reference + " reference.");
      const v = a(o.scheme || p.scheme);
      if (!o.unicodeSupport && (!v || !v.unicodeSupport) && p.host && (o.domainHost || v && v.domainHost) && E === !1 && n(p.host))
        try {
          p.host = URL.domainToASCII(p.host.toLowerCase());
        } catch (P) {
          p.error = p.error || "Host's domain name can not be converted to ASCII: " + P;
        }
      (!v || v && !v.skipNormalize) && (f.indexOf("%") !== -1 && (p.scheme !== void 0 && (p.scheme = unescape(p.scheme)), p.host !== void 0 && (p.host = unescape(p.host))), p.path && (p.path = escape(unescape(p.path))), p.fragment && (p.fragment = encodeURI(decodeURIComponent(p.fragment)))), v && v.parse && v.parse(p, o);
    } else
      p.error = p.error || "URI can not be parsed.";
    return p;
  }
  const w = {
    SCHEMES: i,
    normalize: u,
    resolve: d,
    resolveComponent: c,
    equal: $,
    serialize: g,
    parse: b
  };
  return Ot.exports = w, Ot.exports.default = w, Ot.exports.fastUri = w, Ot.exports;
}
var Qa;
function Sl() {
  if (Qa) return Vt;
  Qa = 1, Object.defineProperty(Vt, "__esModule", { value: !0 });
  const e = Eu();
  return e.code = 'require("ajv/dist/runtime/uri").default', Vt.default = e, Vt;
}
var Za;
function Pl() {
  return Za || (Za = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = Nn();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var s = ee();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return s.CodeGen;
    } });
    const r = ia(), l = On(), n = _u(), i = In(), a = ee(), u = Rn(), d = $n(), c = se(), $ = El, g = Sl(), _ = (k, N) => new RegExp(k, N);
    _.code = "new RegExp";
    const b = ["removeAdditional", "useDefaults", "coerceTypes"], w = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), f = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, y = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, o = 200;
    function p(k) {
      var N, A, O, h, S, j, K, H, Z, Q, R, I, q, L, G, X, ae, pe, ue, le, oe, Re, he, nt, st;
      const je = k.strict, at = (N = k.code) === null || N === void 0 ? void 0 : N.optimize, St = at === !0 || at === void 0 ? 1 : at || 0, Pt = (O = (A = k.code) === null || A === void 0 ? void 0 : A.regExp) !== null && O !== void 0 ? O : _, Fn = (h = k.uriResolver) !== null && h !== void 0 ? h : g.default;
      return {
        strictSchema: (j = (S = k.strictSchema) !== null && S !== void 0 ? S : je) !== null && j !== void 0 ? j : !0,
        strictNumbers: (H = (K = k.strictNumbers) !== null && K !== void 0 ? K : je) !== null && H !== void 0 ? H : !0,
        strictTypes: (Q = (Z = k.strictTypes) !== null && Z !== void 0 ? Z : je) !== null && Q !== void 0 ? Q : "log",
        strictTuples: (I = (R = k.strictTuples) !== null && R !== void 0 ? R : je) !== null && I !== void 0 ? I : "log",
        strictRequired: (L = (q = k.strictRequired) !== null && q !== void 0 ? q : je) !== null && L !== void 0 ? L : !1,
        code: k.code ? { ...k.code, optimize: St, regExp: Pt } : { optimize: St, regExp: Pt },
        loopRequired: (G = k.loopRequired) !== null && G !== void 0 ? G : o,
        loopEnum: (X = k.loopEnum) !== null && X !== void 0 ? X : o,
        meta: (ae = k.meta) !== null && ae !== void 0 ? ae : !0,
        messages: (pe = k.messages) !== null && pe !== void 0 ? pe : !0,
        inlineRefs: (ue = k.inlineRefs) !== null && ue !== void 0 ? ue : !0,
        schemaId: (le = k.schemaId) !== null && le !== void 0 ? le : "$id",
        addUsedSchema: (oe = k.addUsedSchema) !== null && oe !== void 0 ? oe : !0,
        validateSchema: (Re = k.validateSchema) !== null && Re !== void 0 ? Re : !0,
        validateFormats: (he = k.validateFormats) !== null && he !== void 0 ? he : !0,
        unicodeRegExp: (nt = k.unicodeRegExp) !== null && nt !== void 0 ? nt : !0,
        int32range: (st = k.int32range) !== null && st !== void 0 ? st : !0,
        uriResolver: Fn
      };
    }
    class E {
      constructor(N = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), N = this.opts = { ...N, ...p(N) };
        const { es5: A, lines: O } = this.opts.code;
        this.scope = new a.ValueScope({ scope: {}, prefixes: w, es5: A, lines: O }), this.logger = z(N.logger);
        const h = N.validateFormats;
        N.validateFormats = !1, this.RULES = (0, n.getRules)(), m.call(this, f, N, "NOT SUPPORTED"), m.call(this, y, N, "DEPRECATED", "warn"), this._metaOpts = V.call(this), N.formats && T.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), N.keywords && C.call(this, N.keywords), typeof N.meta == "object" && this.addMetaSchema(N.meta), P.call(this), N.validateFormats = h;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: N, meta: A, schemaId: O } = this.opts;
        let h = $;
        O === "id" && (h = { ...$ }, h.id = h.$id, delete h.$id), A && N && this.addMetaSchema(h, h[O], !1);
      }
      defaultMeta() {
        const { meta: N, schemaId: A } = this.opts;
        return this.opts.defaultMeta = typeof N == "object" ? N[A] || N : void 0;
      }
      validate(N, A) {
        let O;
        if (typeof N == "string") {
          if (O = this.getSchema(N), !O)
            throw new Error(`no schema with key or ref "${N}"`);
        } else
          O = this.compile(N);
        const h = O(A);
        return "$async" in O || (this.errors = O.errors), h;
      }
      compile(N, A) {
        const O = this._addSchema(N, A);
        return O.validate || this._compileSchemaEnv(O);
      }
      compileAsync(N, A) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: O } = this.opts;
        return h.call(this, N, A);
        async function h(Q, R) {
          await S.call(this, Q.$schema);
          const I = this._addSchema(Q, R);
          return I.validate || j.call(this, I);
        }
        async function S(Q) {
          Q && !this.getSchema(Q) && await h.call(this, { $ref: Q }, !0);
        }
        async function j(Q) {
          try {
            return this._compileSchemaEnv(Q);
          } catch (R) {
            if (!(R instanceof l.default))
              throw R;
            return K.call(this, R), await H.call(this, R.missingSchema), j.call(this, Q);
          }
        }
        function K({ missingSchema: Q, missingRef: R }) {
          if (this.refs[Q])
            throw new Error(`AnySchema ${Q} is loaded but ${R} cannot be resolved`);
        }
        async function H(Q) {
          const R = await Z.call(this, Q);
          this.refs[Q] || await S.call(this, R.$schema), this.refs[Q] || this.addSchema(R, Q, A);
        }
        async function Z(Q) {
          const R = this._loading[Q];
          if (R)
            return R;
          try {
            return await (this._loading[Q] = O(Q));
          } finally {
            delete this._loading[Q];
          }
        }
      }
      // Adds schema to the instance
      addSchema(N, A, O, h = this.opts.validateSchema) {
        if (Array.isArray(N)) {
          for (const j of N)
            this.addSchema(j, void 0, O, h);
          return this;
        }
        let S;
        if (typeof N == "object") {
          const { schemaId: j } = this.opts;
          if (S = N[j], S !== void 0 && typeof S != "string")
            throw new Error(`schema ${j} must be string`);
        }
        return A = (0, u.normalizeId)(A || S), this._checkUnique(A), this.schemas[A] = this._addSchema(N, O, A, h, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(N, A, O = this.opts.validateSchema) {
        return this.addSchema(N, A, !0, O), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(N, A) {
        if (typeof N == "boolean")
          return !0;
        let O;
        if (O = N.$schema, O !== void 0 && typeof O != "string")
          throw new Error("$schema must be a string");
        if (O = O || this.opts.defaultMeta || this.defaultMeta(), !O)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const h = this.validate(O, N);
        if (!h && A) {
          const S = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(S);
          else
            throw new Error(S);
        }
        return h;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(N) {
        let A;
        for (; typeof (A = v.call(this, N)) == "string"; )
          N = A;
        if (A === void 0) {
          const { schemaId: O } = this.opts, h = new i.SchemaEnv({ schema: {}, schemaId: O });
          if (A = i.resolveSchema.call(this, h, N), !A)
            return;
          this.refs[N] = A;
        }
        return A.validate || this._compileSchemaEnv(A);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(N) {
        if (N instanceof RegExp)
          return this._removeAllSchemas(this.schemas, N), this._removeAllSchemas(this.refs, N), this;
        switch (typeof N) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const A = v.call(this, N);
            return typeof A == "object" && this._cache.delete(A.schema), delete this.schemas[N], delete this.refs[N], this;
          }
          case "object": {
            const A = N;
            this._cache.delete(A);
            let O = N[this.opts.schemaId];
            return O && (O = (0, u.normalizeId)(O), delete this.schemas[O], delete this.refs[O]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(N) {
        for (const A of N)
          this.addKeyword(A);
        return this;
      }
      addKeyword(N, A) {
        let O;
        if (typeof N == "string")
          O = N, typeof A == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), A.keyword = O);
        else if (typeof N == "object" && A === void 0) {
          if (A = N, O = A.keyword, Array.isArray(O) && !O.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (M.call(this, O, A), !A)
          return (0, c.eachItem)(O, (S) => F.call(this, S)), this;
        B.call(this, A);
        const h = {
          ...A,
          type: (0, d.getJSONTypes)(A.type),
          schemaType: (0, d.getJSONTypes)(A.schemaType)
        };
        return (0, c.eachItem)(O, h.type.length === 0 ? (S) => F.call(this, S, h) : (S) => h.type.forEach((j) => F.call(this, S, h, j))), this;
      }
      getKeyword(N) {
        const A = this.RULES.all[N];
        return typeof A == "object" ? A.definition : !!A;
      }
      // Remove keyword
      removeKeyword(N) {
        const { RULES: A } = this;
        delete A.keywords[N], delete A.all[N];
        for (const O of A.rules) {
          const h = O.rules.findIndex((S) => S.keyword === N);
          h >= 0 && O.rules.splice(h, 1);
        }
        return this;
      }
      // Add format
      addFormat(N, A) {
        return typeof A == "string" && (A = new RegExp(A)), this.formats[N] = A, this;
      }
      errorsText(N = this.errors, { separator: A = ", ", dataVar: O = "data" } = {}) {
        return !N || N.length === 0 ? "No errors" : N.map((h) => `${O}${h.instancePath} ${h.message}`).reduce((h, S) => h + A + S);
      }
      $dataMetaSchema(N, A) {
        const O = this.RULES.all;
        N = JSON.parse(JSON.stringify(N));
        for (const h of A) {
          const S = h.split("/").slice(1);
          let j = N;
          for (const K of S)
            j = j[K];
          for (const K in O) {
            const H = O[K];
            if (typeof H != "object")
              continue;
            const { $data: Z } = H.definition, Q = j[K];
            Z && Q && (j[K] = Y(Q));
          }
        }
        return N;
      }
      _removeAllSchemas(N, A) {
        for (const O in N) {
          const h = N[O];
          (!A || A.test(O)) && (typeof h == "string" ? delete N[O] : h && !h.meta && (this._cache.delete(h.schema), delete N[O]));
        }
      }
      _addSchema(N, A, O, h = this.opts.validateSchema, S = this.opts.addUsedSchema) {
        let j;
        const { schemaId: K } = this.opts;
        if (typeof N == "object")
          j = N[K];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof N != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let H = this._cache.get(N);
        if (H !== void 0)
          return H;
        O = (0, u.normalizeId)(j || O);
        const Z = u.getSchemaRefs.call(this, N, O);
        return H = new i.SchemaEnv({ schema: N, schemaId: K, meta: A, baseId: O, localRefs: Z }), this._cache.set(H.schema, H), S && !O.startsWith("#") && (O && this._checkUnique(O), this.refs[O] = H), h && this.validateSchema(N, !0), H;
      }
      _checkUnique(N) {
        if (this.schemas[N] || this.refs[N])
          throw new Error(`schema with key or id "${N}" already exists`);
      }
      _compileSchemaEnv(N) {
        if (N.meta ? this._compileMetaSchema(N) : i.compileSchema.call(this, N), !N.validate)
          throw new Error("ajv implementation error");
        return N.validate;
      }
      _compileMetaSchema(N) {
        const A = this.opts;
        this.opts = this._metaOpts;
        try {
          i.compileSchema.call(this, N);
        } finally {
          this.opts = A;
        }
      }
    }
    E.ValidationError = r.default, E.MissingRefError = l.default, e.default = E;
    function m(k, N, A, O = "error") {
      for (const h in k) {
        const S = h;
        S in N && this.logger[O](`${A}: option ${h}. ${k[S]}`);
      }
    }
    function v(k) {
      return k = (0, u.normalizeId)(k), this.schemas[k] || this.refs[k];
    }
    function P() {
      const k = this.opts.schemas;
      if (k)
        if (Array.isArray(k))
          this.addSchema(k);
        else
          for (const N in k)
            this.addSchema(k[N], N);
    }
    function T() {
      for (const k in this.opts.formats) {
        const N = this.opts.formats[k];
        N && this.addFormat(k, N);
      }
    }
    function C(k) {
      if (Array.isArray(k)) {
        this.addVocabulary(k);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const N in k) {
        const A = k[N];
        A.keyword || (A.keyword = N), this.addKeyword(A);
      }
    }
    function V() {
      const k = { ...this.opts };
      for (const N of b)
        delete k[N];
      return k;
    }
    const D = { log() {
    }, warn() {
    }, error() {
    } };
    function z(k) {
      if (k === !1)
        return D;
      if (k === void 0)
        return console;
      if (k.log && k.warn && k.error)
        return k;
      throw new Error("logger must implement log, warn and error methods");
    }
    const U = /^[a-z_$][a-z0-9_$:-]*$/i;
    function M(k, N) {
      const { RULES: A } = this;
      if ((0, c.eachItem)(k, (O) => {
        if (A.keywords[O])
          throw new Error(`Keyword ${O} is already defined`);
        if (!U.test(O))
          throw new Error(`Keyword ${O} has invalid name`);
      }), !!N && N.$data && !("code" in N || "validate" in N))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function F(k, N, A) {
      var O;
      const h = N?.post;
      if (A && h)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: S } = this;
      let j = h ? S.post : S.rules.find(({ type: H }) => H === A);
      if (j || (j = { type: A, rules: [] }, S.rules.push(j)), S.keywords[k] = !0, !N)
        return;
      const K = {
        keyword: k,
        definition: {
          ...N,
          type: (0, d.getJSONTypes)(N.type),
          schemaType: (0, d.getJSONTypes)(N.schemaType)
        }
      };
      N.before ? W.call(this, j, K, N.before) : j.rules.push(K), S.all[k] = K, (O = N.implements) === null || O === void 0 || O.forEach((H) => this.addKeyword(H));
    }
    function W(k, N, A) {
      const O = k.rules.findIndex((h) => h.keyword === A);
      O >= 0 ? k.rules.splice(O, 0, N) : (k.rules.push(N), this.logger.warn(`rule ${A} is not defined`));
    }
    function B(k) {
      let { metaSchema: N } = k;
      N !== void 0 && (k.$data && this.opts.$data && (N = Y(N)), k.validateSchema = this.compile(N, !0));
    }
    const J = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Y(k) {
      return { anyOf: [k, J] };
    }
  })(Gn)), Gn;
}
var Ft = {}, zt = {}, Ut = {}, xa;
function Rl() {
  if (xa) return Ut;
  xa = 1, Object.defineProperty(Ut, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Ut.default = e, Ut;
}
var Ze = {}, eo;
function ca() {
  if (eo) return Ze;
  eo = 1, Object.defineProperty(Ze, "__esModule", { value: !0 }), Ze.callRef = Ze.getValidate = void 0;
  const e = On(), t = De(), s = ee(), r = Ce(), l = In(), n = se(), i = {
    keyword: "$ref",
    schemaType: "string",
    code(d) {
      const { gen: c, schema: $, it: g } = d, { baseId: _, schemaEnv: b, validateName: w, opts: f, self: y } = g, { root: o } = b;
      if (($ === "#" || $ === "#/") && _ === o.baseId)
        return E();
      const p = l.resolveRef.call(y, o, _, $);
      if (p === void 0)
        throw new e.default(g.opts.uriResolver, _, $);
      if (p instanceof l.SchemaEnv)
        return m(p);
      return v(p);
      function E() {
        if (b === o)
          return u(d, w, b, b.$async);
        const P = c.scopeValue("root", { ref: o });
        return u(d, (0, s._)`${P}.validate`, o, o.$async);
      }
      function m(P) {
        const T = a(d, P);
        u(d, T, P, P.$async);
      }
      function v(P) {
        const T = c.scopeValue("schema", f.code.source === !0 ? { ref: P, code: (0, s.stringify)(P) } : { ref: P }), C = c.name("valid"), V = d.subschema({
          schema: P,
          dataTypes: [],
          schemaPath: s.nil,
          topSchemaRef: T,
          errSchemaPath: $
        }, C);
        d.mergeEvaluated(V), d.ok(C);
      }
    }
  };
  function a(d, c) {
    const { gen: $ } = d;
    return c.validate ? $.scopeValue("validate", { ref: c.validate }) : (0, s._)`${$.scopeValue("wrapper", { ref: c })}.validate`;
  }
  Ze.getValidate = a;
  function u(d, c, $, g) {
    const { gen: _, it: b } = d, { allErrors: w, schemaEnv: f, opts: y } = b, o = y.passContext ? r.default.this : s.nil;
    g ? p() : E();
    function p() {
      if (!f.$async)
        throw new Error("async schema referenced by sync schema");
      const P = _.let("valid");
      _.try(() => {
        _.code((0, s._)`await ${(0, t.callValidateCode)(d, c, o)}`), v(c), w || _.assign(P, !0);
      }, (T) => {
        _.if((0, s._)`!(${T} instanceof ${b.ValidationError})`, () => _.throw(T)), m(T), w || _.assign(P, !1);
      }), d.ok(P);
    }
    function E() {
      d.result((0, t.callValidateCode)(d, c, o), () => v(c), () => m(c));
    }
    function m(P) {
      const T = (0, s._)`${P}.errors`;
      _.assign(r.default.vErrors, (0, s._)`${r.default.vErrors} === null ? ${T} : ${r.default.vErrors}.concat(${T})`), _.assign(r.default.errors, (0, s._)`${r.default.vErrors}.length`);
    }
    function v(P) {
      var T;
      if (!b.opts.unevaluated)
        return;
      const C = (T = $?.validate) === null || T === void 0 ? void 0 : T.evaluated;
      if (b.props !== !0)
        if (C && !C.dynamicProps)
          C.props !== void 0 && (b.props = n.mergeEvaluated.props(_, C.props, b.props));
        else {
          const V = _.var("props", (0, s._)`${P}.evaluated.props`);
          b.props = n.mergeEvaluated.props(_, V, b.props, s.Name);
        }
      if (b.items !== !0)
        if (C && !C.dynamicItems)
          C.items !== void 0 && (b.items = n.mergeEvaluated.items(_, C.items, b.items));
        else {
          const V = _.var("items", (0, s._)`${P}.evaluated.items`);
          b.items = n.mergeEvaluated.items(_, V, b.items, s.Name);
        }
    }
  }
  return Ze.callRef = u, Ze.default = i, Ze;
}
var to;
function Nl() {
  if (to) return zt;
  to = 1, Object.defineProperty(zt, "__esModule", { value: !0 });
  const e = Rl(), t = ca(), s = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return zt.default = s, zt;
}
var Kt = {}, Gt = {}, ro;
function Ol() {
  if (ro) return Gt;
  ro = 1, Object.defineProperty(Gt, "__esModule", { value: !0 });
  const e = ee(), t = e.operators, s = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: i }) => (0, e.str)`must be ${s[n].okStr} ${i}`,
    params: ({ keyword: n, schemaCode: i }) => (0, e._)`{comparison: ${s[n].okStr}, limit: ${i}}`
  }, l = {
    keyword: Object.keys(s),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: i, data: a, schemaCode: u } = n;
      n.fail$data((0, e._)`${a} ${s[i].fail} ${u} || isNaN(${a})`);
    }
  };
  return Gt.default = l, Gt;
}
var Ht = {}, no;
function Il() {
  if (no) return Ht;
  no = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: l, data: n, schemaCode: i, it: a } = r, u = a.opts.multipleOfPrecision, d = l.let("res"), c = u ? (0, e._)`Math.abs(Math.round(${d}) - ${d}) > 1e-${u}` : (0, e._)`${d} !== parseInt(${d})`;
      r.fail$data((0, e._)`(${i} === 0 || (${d} = ${n}/${i}, ${c}))`);
    }
  };
  return Ht.default = s, Ht;
}
var Jt = {}, Bt = {}, so;
function Tl() {
  if (so) return Bt;
  so = 1, Object.defineProperty(Bt, "__esModule", { value: !0 });
  function e(t) {
    const s = t.length;
    let r = 0, l = 0, n;
    for (; l < s; )
      r++, n = t.charCodeAt(l++), n >= 55296 && n <= 56319 && l < s && (n = t.charCodeAt(l), (n & 64512) === 56320 && l++);
    return r;
  }
  return Bt.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Bt;
}
var ao;
function jl() {
  if (ao) return Jt;
  ao = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = Tl(), l = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const a = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${a} than ${i} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: a, schemaCode: u, it: d } = n, c = i === "maxLength" ? e.operators.GT : e.operators.LT, $ = d.opts.unicode === !1 ? (0, e._)`${a}.length` : (0, e._)`${(0, t.useFunc)(n.gen, s.default)}(${a})`;
      n.fail$data((0, e._)`${$} ${c} ${u}`);
    }
  };
  return Jt.default = l, Jt;
}
var Wt = {}, oo;
function Al() {
  if (oo) return Wt;
  oo = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const e = De(), t = ee(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: l }) => (0, t.str)`must match pattern "${l}"`,
      params: ({ schemaCode: l }) => (0, t._)`{pattern: ${l}}`
    },
    code(l) {
      const { data: n, $data: i, schema: a, schemaCode: u, it: d } = l, c = d.opts.unicodeRegExp ? "u" : "", $ = i ? (0, t._)`(new RegExp(${u}, ${c}))` : (0, e.usePattern)(l, a);
      l.fail$data((0, t._)`!${$}.test(${n})`);
    }
  };
  return Wt.default = r, Wt;
}
var Xt = {}, io;
function kl() {
  if (io) return Xt;
  io = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, a = l === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${a} ${i}`);
    }
  };
  return Xt.default = s, Xt;
}
var Yt = {}, co;
function ql() {
  if (co) return Yt;
  co = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const e = De(), t = ee(), s = se(), l = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: i, schema: a, schemaCode: u, data: d, $data: c, it: $ } = n, { opts: g } = $;
      if (!c && a.length === 0)
        return;
      const _ = a.length >= g.loopRequired;
      if ($.allErrors ? b() : w(), g.strictRequired) {
        const o = n.parentSchema.properties, { definedProperties: p } = n.it;
        for (const E of a)
          if (o?.[E] === void 0 && !p.has(E)) {
            const m = $.schemaEnv.baseId + $.errSchemaPath, v = `required property "${E}" is not defined at "${m}" (strictRequired)`;
            (0, s.checkStrictMode)($, v, $.opts.strictRequired);
          }
      }
      function b() {
        if (_ || c)
          n.block$data(t.nil, f);
        else
          for (const o of a)
            (0, e.checkReportMissingProp)(n, o);
      }
      function w() {
        const o = i.let("missing");
        if (_ || c) {
          const p = i.let("valid", !0);
          n.block$data(p, () => y(o, p)), n.ok(p);
        } else
          i.if((0, e.checkMissingProp)(n, a, o)), (0, e.reportMissingProp)(n, o), i.else();
      }
      function f() {
        i.forOf("prop", u, (o) => {
          n.setParams({ missingProperty: o }), i.if((0, e.noPropertyInData)(i, d, o, g.ownProperties), () => n.error());
        });
      }
      function y(o, p) {
        n.setParams({ missingProperty: o }), i.forOf(o, u, () => {
          i.assign(p, (0, e.propertyInData)(i, d, o, g.ownProperties)), i.if((0, t.not)(p), () => {
            n.error(), i.break();
          });
        }, t.nil);
      }
    }
  };
  return Yt.default = l, Yt;
}
var Qt = {}, uo;
function Cl() {
  if (uo) return Qt;
  uo = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, a = l === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${a} ${i}`);
    }
  };
  return Qt.default = s, Qt;
}
var Zt = {}, xt = {}, lo;
function ua() {
  if (lo) return xt;
  lo = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
  const e = Pn();
  return e.code = 'require("ajv/dist/runtime/equal").default', xt.default = e, xt;
}
var fo;
function Dl() {
  if (fo) return Zt;
  fo = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = $n(), t = ee(), s = se(), r = ua(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i, j: a } }) => (0, t.str)`must NOT have duplicate items (items ## ${a} and ${i} are identical)`,
      params: ({ params: { i, j: a } }) => (0, t._)`{i: ${i}, j: ${a}}`
    },
    code(i) {
      const { gen: a, data: u, $data: d, schema: c, parentSchema: $, schemaCode: g, it: _ } = i;
      if (!d && !c)
        return;
      const b = a.let("valid"), w = $.items ? (0, e.getSchemaTypes)($.items) : [];
      i.block$data(b, f, (0, t._)`${g} === false`), i.ok(b);
      function f() {
        const E = a.let("i", (0, t._)`${u}.length`), m = a.let("j");
        i.setParams({ i: E, j: m }), a.assign(b, !0), a.if((0, t._)`${E} > 1`, () => (y() ? o : p)(E, m));
      }
      function y() {
        return w.length > 0 && !w.some((E) => E === "object" || E === "array");
      }
      function o(E, m) {
        const v = a.name("item"), P = (0, e.checkDataTypes)(w, v, _.opts.strictNumbers, e.DataType.Wrong), T = a.const("indices", (0, t._)`{}`);
        a.for((0, t._)`;${E}--;`, () => {
          a.let(v, (0, t._)`${u}[${E}]`), a.if(P, (0, t._)`continue`), w.length > 1 && a.if((0, t._)`typeof ${v} == "string"`, (0, t._)`${v} += "_"`), a.if((0, t._)`typeof ${T}[${v}] == "number"`, () => {
            a.assign(m, (0, t._)`${T}[${v}]`), i.error(), a.assign(b, !1).break();
          }).code((0, t._)`${T}[${v}] = ${E}`);
        });
      }
      function p(E, m) {
        const v = (0, s.useFunc)(a, r.default), P = a.name("outer");
        a.label(P).for((0, t._)`;${E}--;`, () => a.for((0, t._)`${m} = ${E}; ${m}--;`, () => a.if((0, t._)`${v}(${u}[${E}], ${u}[${m}])`, () => {
          i.error(), a.assign(b, !1).break(P);
        })));
      }
    }
  };
  return Zt.default = n, Zt;
}
var er = {}, ho;
function Ml() {
  if (ho) return er;
  ho = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = ua(), l = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: u, schemaCode: d, schema: c } = n;
      u || c && typeof c == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(i, s.default)}(${a}, ${d})`) : n.fail((0, e._)`${c} !== ${a}`);
    }
  };
  return er.default = l, er;
}
var tr = {}, mo;
function Ll() {
  if (mo) return tr;
  mo = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = ua(), l = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: u, schema: d, schemaCode: c, it: $ } = n;
      if (!u && d.length === 0)
        throw new Error("enum must have non-empty array");
      const g = d.length >= $.opts.loopEnum;
      let _;
      const b = () => _ ?? (_ = (0, t.useFunc)(i, s.default));
      let w;
      if (g || u)
        w = i.let("valid"), n.block$data(w, f);
      else {
        if (!Array.isArray(d))
          throw new Error("ajv implementation error");
        const o = i.const("vSchema", c);
        w = (0, e.or)(...d.map((p, E) => y(o, E)));
      }
      n.pass(w);
      function f() {
        i.assign(w, !1), i.forOf("v", c, (o) => i.if((0, e._)`${b()}(${a}, ${o})`, () => i.assign(w, !0).break()));
      }
      function y(o, p) {
        const E = d[p];
        return typeof E == "object" && E !== null ? (0, e._)`${b()}(${a}, ${o}[${p}])` : (0, e._)`${a} === ${E}`;
      }
    }
  };
  return tr.default = l, tr;
}
var po;
function Vl() {
  if (po) return Kt;
  po = 1, Object.defineProperty(Kt, "__esModule", { value: !0 });
  const e = Ol(), t = Il(), s = jl(), r = Al(), l = kl(), n = ql(), i = Cl(), a = Dl(), u = Ml(), d = Ll(), c = [
    // number
    e.default,
    t.default,
    // string
    s.default,
    r.default,
    // object
    l.default,
    n.default,
    // array
    i.default,
    a.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    u.default,
    d.default
  ];
  return Kt.default = c, Kt;
}
var rr = {}, mt = {}, yo;
function bu() {
  if (yo) return mt;
  yo = 1, Object.defineProperty(mt, "__esModule", { value: !0 }), mt.validateAdditionalItems = void 0;
  const e = ee(), t = se(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: i, it: a } = n, { items: u } = i;
      if (!Array.isArray(u)) {
        (0, t.checkStrictMode)(a, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      l(n, u);
    }
  };
  function l(n, i) {
    const { gen: a, schema: u, data: d, keyword: c, it: $ } = n;
    $.items = !0;
    const g = a.const("len", (0, e._)`${d}.length`);
    if (u === !1)
      n.setParams({ len: i.length }), n.pass((0, e._)`${g} <= ${i.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)($, u)) {
      const b = a.var("valid", (0, e._)`${g} <= ${i.length}`);
      a.if((0, e.not)(b), () => _(b)), n.ok(b);
    }
    function _(b) {
      a.forRange("i", i.length, g, (w) => {
        n.subschema({ keyword: c, dataProp: w, dataPropType: t.Type.Num }, b), $.allErrors || a.if((0, e.not)(b), () => a.break());
      });
    }
  }
  return mt.validateAdditionalItems = l, mt.default = r, mt;
}
var nr = {}, pt = {}, vo;
function Su() {
  if (vo) return pt;
  vo = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.validateTuple = void 0;
  const e = ee(), t = se(), s = De(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: i, it: a } = n;
      if (Array.isArray(i))
        return l(n, "additionalItems", i);
      a.items = !0, !(0, t.alwaysValidSchema)(a, i) && n.ok((0, s.validateArray)(n));
    }
  };
  function l(n, i, a = n.schema) {
    const { gen: u, parentSchema: d, data: c, keyword: $, it: g } = n;
    w(d), g.opts.unevaluated && a.length && g.items !== !0 && (g.items = t.mergeEvaluated.items(u, a.length, g.items));
    const _ = u.name("valid"), b = u.const("len", (0, e._)`${c}.length`);
    a.forEach((f, y) => {
      (0, t.alwaysValidSchema)(g, f) || (u.if((0, e._)`${b} > ${y}`, () => n.subschema({
        keyword: $,
        schemaProp: y,
        dataProp: y
      }, _)), n.ok(_));
    });
    function w(f) {
      const { opts: y, errSchemaPath: o } = g, p = a.length, E = p === f.minItems && (p === f.maxItems || f[i] === !1);
      if (y.strictTuples && !E) {
        const m = `"${$}" is ${p}-tuple, but minItems or maxItems/${i} are not specified or different at path "${o}"`;
        (0, t.checkStrictMode)(g, m, y.strictTuples);
      }
    }
  }
  return pt.validateTuple = l, pt.default = r, pt;
}
var go;
function Fl() {
  if (go) return nr;
  go = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = Su(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (s) => (0, e.validateTuple)(s, "items")
  };
  return nr.default = t, nr;
}
var sr = {}, _o;
function zl() {
  if (_o) return sr;
  _o = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = De(), r = bu(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { schema: a, parentSchema: u, it: d } = i, { prefixItems: c } = u;
      d.items = !0, !(0, t.alwaysValidSchema)(d, a) && (c ? (0, r.validateAdditionalItems)(i, c) : i.ok((0, s.validateArray)(i)));
    }
  };
  return sr.default = n, sr;
}
var ar = {}, $o;
function Ul() {
  if ($o) return ar;
  $o = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${l} valid item(s)` : (0, e.str)`must contain at least ${l} and no more than ${n} valid item(s)`,
      params: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${l}}` : (0, e._)`{minContains: ${l}, maxContains: ${n}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: a, data: u, it: d } = l;
      let c, $;
      const { minContains: g, maxContains: _ } = a;
      d.opts.next ? (c = g === void 0 ? 1 : g, $ = _) : c = 1;
      const b = n.const("len", (0, e._)`${u}.length`);
      if (l.setParams({ min: c, max: $ }), $ === void 0 && c === 0) {
        (0, t.checkStrictMode)(d, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if ($ !== void 0 && c > $) {
        (0, t.checkStrictMode)(d, '"minContains" > "maxContains" is always invalid'), l.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(d, i)) {
        let p = (0, e._)`${b} >= ${c}`;
        $ !== void 0 && (p = (0, e._)`${p} && ${b} <= ${$}`), l.pass(p);
        return;
      }
      d.items = !0;
      const w = n.name("valid");
      $ === void 0 && c === 1 ? y(w, () => n.if(w, () => n.break())) : c === 0 ? (n.let(w, !0), $ !== void 0 && n.if((0, e._)`${u}.length > 0`, f)) : (n.let(w, !1), f()), l.result(w, () => l.reset());
      function f() {
        const p = n.name("_valid"), E = n.let("count", 0);
        y(p, () => n.if(p, () => o(E)));
      }
      function y(p, E) {
        n.forRange("i", 0, b, (m) => {
          l.subschema({
            keyword: "contains",
            dataProp: m,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, p), E();
        });
      }
      function o(p) {
        n.code((0, e._)`${p}++`), $ === void 0 ? n.if((0, e._)`${p} >= ${c}`, () => n.assign(w, !0).break()) : (n.if((0, e._)`${p} > ${$}`, () => n.assign(w, !1).break()), c === 1 ? n.assign(w, !0) : n.if((0, e._)`${p} >= ${c}`, () => n.assign(w, !0)));
      }
    }
  };
  return ar.default = r, ar;
}
var xn = {}, wo;
function la() {
  return wo || (wo = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = ee(), s = se(), r = De();
    e.error = {
      message: ({ params: { property: u, depsCount: d, deps: c } }) => {
        const $ = d === 1 ? "property" : "properties";
        return (0, t.str)`must have ${$} ${c} when property ${u} is present`;
      },
      params: ({ params: { property: u, depsCount: d, deps: c, missingProperty: $ } }) => (0, t._)`{property: ${u},
    missingProperty: ${$},
    depsCount: ${d},
    deps: ${c}}`
      // TODO change to reference
    };
    const l = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(u) {
        const [d, c] = n(u);
        i(u, d), a(u, c);
      }
    };
    function n({ schema: u }) {
      const d = {}, c = {};
      for (const $ in u) {
        if ($ === "__proto__")
          continue;
        const g = Array.isArray(u[$]) ? d : c;
        g[$] = u[$];
      }
      return [d, c];
    }
    function i(u, d = u.schema) {
      const { gen: c, data: $, it: g } = u;
      if (Object.keys(d).length === 0)
        return;
      const _ = c.let("missing");
      for (const b in d) {
        const w = d[b];
        if (w.length === 0)
          continue;
        const f = (0, r.propertyInData)(c, $, b, g.opts.ownProperties);
        u.setParams({
          property: b,
          depsCount: w.length,
          deps: w.join(", ")
        }), g.allErrors ? c.if(f, () => {
          for (const y of w)
            (0, r.checkReportMissingProp)(u, y);
        }) : (c.if((0, t._)`${f} && (${(0, r.checkMissingProp)(u, w, _)})`), (0, r.reportMissingProp)(u, _), c.else());
      }
    }
    e.validatePropertyDeps = i;
    function a(u, d = u.schema) {
      const { gen: c, data: $, keyword: g, it: _ } = u, b = c.name("valid");
      for (const w in d)
        (0, s.alwaysValidSchema)(_, d[w]) || (c.if(
          (0, r.propertyInData)(c, $, w, _.opts.ownProperties),
          () => {
            const f = u.subschema({ keyword: g, schemaProp: w }, b);
            u.mergeValidEvaluated(f, b);
          },
          () => c.var(b, !0)
          // TODO var
        ), u.ok(b));
    }
    e.validateSchemaDeps = a, e.default = l;
  })(xn)), xn;
}
var or = {}, Eo;
function Kl() {
  if (Eo) return or;
  Eo = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: l }) => (0, e._)`{propertyName: ${l.propertyName}}`
    },
    code(l) {
      const { gen: n, schema: i, data: a, it: u } = l;
      if ((0, t.alwaysValidSchema)(u, i))
        return;
      const d = n.name("valid");
      n.forIn("key", a, (c) => {
        l.setParams({ propertyName: c }), l.subschema({
          keyword: "propertyNames",
          data: c,
          dataTypes: ["string"],
          propertyName: c,
          compositeRule: !0
        }, d), n.if((0, e.not)(d), () => {
          l.error(!0), u.allErrors || n.break();
        });
      }), l.ok(d);
    }
  };
  return or.default = r, or;
}
var ir = {}, bo;
function Pu() {
  if (bo) return ir;
  bo = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const e = De(), t = ee(), s = Ce(), r = se(), n = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: i }) => (0, t._)`{additionalProperty: ${i.additionalProperty}}`
    },
    code(i) {
      const { gen: a, schema: u, parentSchema: d, data: c, errsCount: $, it: g } = i;
      if (!$)
        throw new Error("ajv implementation error");
      const { allErrors: _, opts: b } = g;
      if (g.props = !0, b.removeAdditional !== "all" && (0, r.alwaysValidSchema)(g, u))
        return;
      const w = (0, e.allSchemaProperties)(d.properties), f = (0, e.allSchemaProperties)(d.patternProperties);
      y(), i.ok((0, t._)`${$} === ${s.default.errors}`);
      function y() {
        a.forIn("key", c, (v) => {
          !w.length && !f.length ? E(v) : a.if(o(v), () => E(v));
        });
      }
      function o(v) {
        let P;
        if (w.length > 8) {
          const T = (0, r.schemaRefOrVal)(g, d.properties, "properties");
          P = (0, e.isOwnProperty)(a, T, v);
        } else w.length ? P = (0, t.or)(...w.map((T) => (0, t._)`${v} === ${T}`)) : P = t.nil;
        return f.length && (P = (0, t.or)(P, ...f.map((T) => (0, t._)`${(0, e.usePattern)(i, T)}.test(${v})`))), (0, t.not)(P);
      }
      function p(v) {
        a.code((0, t._)`delete ${c}[${v}]`);
      }
      function E(v) {
        if (b.removeAdditional === "all" || b.removeAdditional && u === !1) {
          p(v);
          return;
        }
        if (u === !1) {
          i.setParams({ additionalProperty: v }), i.error(), _ || a.break();
          return;
        }
        if (typeof u == "object" && !(0, r.alwaysValidSchema)(g, u)) {
          const P = a.name("valid");
          b.removeAdditional === "failing" ? (m(v, P, !1), a.if((0, t.not)(P), () => {
            i.reset(), p(v);
          })) : (m(v, P), _ || a.if((0, t.not)(P), () => a.break()));
        }
      }
      function m(v, P, T) {
        const C = {
          keyword: "additionalProperties",
          dataProp: v,
          dataPropType: r.Type.Str
        };
        T === !1 && Object.assign(C, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), i.subschema(C, P);
      }
    }
  };
  return ir.default = n, ir;
}
var cr = {}, So;
function Gl() {
  if (So) return cr;
  So = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const e = Nn(), t = De(), s = se(), r = Pu(), l = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, parentSchema: u, data: d, it: c } = n;
      c.opts.removeAdditional === "all" && u.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(c, r.default, "additionalProperties"));
      const $ = (0, t.allSchemaProperties)(a);
      for (const f of $)
        c.definedProperties.add(f);
      c.opts.unevaluated && $.length && c.props !== !0 && (c.props = s.mergeEvaluated.props(i, (0, s.toHash)($), c.props));
      const g = $.filter((f) => !(0, s.alwaysValidSchema)(c, a[f]));
      if (g.length === 0)
        return;
      const _ = i.name("valid");
      for (const f of g)
        b(f) ? w(f) : (i.if((0, t.propertyInData)(i, d, f, c.opts.ownProperties)), w(f), c.allErrors || i.else().var(_, !0), i.endIf()), n.it.definedProperties.add(f), n.ok(_);
      function b(f) {
        return c.opts.useDefaults && !c.compositeRule && a[f].default !== void 0;
      }
      function w(f) {
        n.subschema({
          keyword: "properties",
          schemaProp: f,
          dataProp: f
        }, _);
      }
    }
  };
  return cr.default = l, cr;
}
var ur = {}, Po;
function Hl() {
  if (Po) return ur;
  Po = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  const e = De(), t = ee(), s = se(), r = se(), l = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, data: u, parentSchema: d, it: c } = n, { opts: $ } = c, g = (0, e.allSchemaProperties)(a), _ = g.filter((E) => (0, s.alwaysValidSchema)(c, a[E]));
      if (g.length === 0 || _.length === g.length && (!c.opts.unevaluated || c.props === !0))
        return;
      const b = $.strictSchema && !$.allowMatchingProperties && d.properties, w = i.name("valid");
      c.props !== !0 && !(c.props instanceof t.Name) && (c.props = (0, r.evaluatedPropsToName)(i, c.props));
      const { props: f } = c;
      y();
      function y() {
        for (const E of g)
          b && o(E), c.allErrors ? p(E) : (i.var(w, !0), p(E), i.if(w));
      }
      function o(E) {
        for (const m in b)
          new RegExp(E).test(m) && (0, s.checkStrictMode)(c, `property ${m} matches pattern ${E} (use allowMatchingProperties)`);
      }
      function p(E) {
        i.forIn("key", u, (m) => {
          i.if((0, t._)`${(0, e.usePattern)(n, E)}.test(${m})`, () => {
            const v = _.includes(E);
            v || n.subschema({
              keyword: "patternProperties",
              schemaProp: E,
              dataProp: m,
              dataPropType: r.Type.Str
            }, w), c.opts.unevaluated && f !== !0 ? i.assign((0, t._)`${f}[${m}]`, !0) : !v && !c.allErrors && i.if((0, t.not)(w), () => i.break());
          });
        });
      }
    }
  };
  return ur.default = l, ur;
}
var lr = {}, Ro;
function Jl() {
  if (Ro) return lr;
  Ro = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if ((0, e.alwaysValidSchema)(n, l)) {
        s.fail();
        return;
      }
      const i = r.name("valid");
      s.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i), s.failResult(i, () => s.reset(), () => s.error());
    },
    error: { message: "must NOT be valid" }
  };
  return lr.default = t, lr;
}
var dr = {}, No;
function Bl() {
  if (No) return dr;
  No = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: De().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return dr.default = t, dr;
}
var fr = {}, Oo;
function Wl() {
  if (Oo) return fr;
  Oo = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: l }) => (0, e._)`{passingSchemas: ${l.passing}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: a, it: u } = l;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      if (u.opts.discriminator && a.discriminator)
        return;
      const d = i, c = n.let("valid", !1), $ = n.let("passing", null), g = n.name("_valid");
      l.setParams({ passing: $ }), n.block(_), l.result(c, () => l.reset(), () => l.error(!0));
      function _() {
        d.forEach((b, w) => {
          let f;
          (0, t.alwaysValidSchema)(u, b) ? n.var(g, !0) : f = l.subschema({
            keyword: "oneOf",
            schemaProp: w,
            compositeRule: !0
          }, g), w > 0 && n.if((0, e._)`${g} && ${c}`).assign(c, !1).assign($, (0, e._)`[${$}, ${w}]`).else(), n.if(g, () => {
            n.assign(c, !0), n.assign($, w), f && l.mergeEvaluated(f, e.Name);
          });
        });
      }
    }
  };
  return fr.default = r, fr;
}
var hr = {}, Io;
function Xl() {
  if (Io) return hr;
  Io = 1, Object.defineProperty(hr, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      const i = r.name("valid");
      l.forEach((a, u) => {
        if ((0, e.alwaysValidSchema)(n, a))
          return;
        const d = s.subschema({ keyword: "allOf", schemaProp: u }, i);
        s.ok(i), s.mergeEvaluated(d);
      });
    }
  };
  return hr.default = t, hr;
}
var mr = {}, To;
function Yl() {
  if (To) return mr;
  To = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: i, parentSchema: a, it: u } = n;
      a.then === void 0 && a.else === void 0 && (0, t.checkStrictMode)(u, '"if" without "then" and "else" is ignored');
      const d = l(u, "then"), c = l(u, "else");
      if (!d && !c)
        return;
      const $ = i.let("valid", !0), g = i.name("_valid");
      if (_(), n.reset(), d && c) {
        const w = i.let("ifClause");
        n.setParams({ ifClause: w }), i.if(g, b("then", w), b("else", w));
      } else d ? i.if(g, b("then")) : i.if((0, e.not)(g), b("else"));
      n.pass($, () => n.error(!0));
      function _() {
        const w = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, g);
        n.mergeEvaluated(w);
      }
      function b(w, f) {
        return () => {
          const y = n.subschema({ keyword: w }, g);
          i.assign($, g), n.mergeValidEvaluated(y, $), f ? i.assign(f, (0, e._)`${w}`) : n.setParams({ ifClause: w });
        };
      }
    }
  };
  function l(n, i) {
    const a = n.schema[i];
    return a !== void 0 && !(0, t.alwaysValidSchema)(n, a);
  }
  return mr.default = r, mr;
}
var pr = {}, jo;
function Ql() {
  if (jo) return pr;
  jo = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: s, parentSchema: r, it: l }) {
      r.if === void 0 && (0, e.checkStrictMode)(l, `"${s}" without "if" is ignored`);
    }
  };
  return pr.default = t, pr;
}
var Ao;
function Zl() {
  if (Ao) return rr;
  Ao = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const e = bu(), t = Fl(), s = Su(), r = zl(), l = Ul(), n = la(), i = Kl(), a = Pu(), u = Gl(), d = Hl(), c = Jl(), $ = Bl(), g = Wl(), _ = Xl(), b = Yl(), w = Ql();
  function f(y = !1) {
    const o = [
      // any
      c.default,
      $.default,
      g.default,
      _.default,
      b.default,
      w.default,
      // object
      i.default,
      a.default,
      n.default,
      u.default,
      d.default
    ];
    return y ? o.push(t.default, r.default) : o.push(e.default, s.default), o.push(l.default), o;
  }
  return rr.default = f, rr;
}
var yr = {}, yt = {}, ko;
function Ru() {
  if (ko) return yt;
  ko = 1, Object.defineProperty(yt, "__esModule", { value: !0 }), yt.dynamicAnchor = void 0;
  const e = ee(), t = Ce(), s = In(), r = ca(), l = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (a) => n(a, a.schema)
  };
  function n(a, u) {
    const { gen: d, it: c } = a;
    c.schemaEnv.root.dynamicAnchors[u] = !0;
    const $ = (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(u)}`, g = c.errSchemaPath === "#" ? c.validateName : i(a);
    d.if((0, e._)`!${$}`, () => d.assign($, g));
  }
  yt.dynamicAnchor = n;
  function i(a) {
    const { schemaEnv: u, schema: d, self: c } = a.it, { root: $, baseId: g, localRefs: _, meta: b } = u.root, { schemaId: w } = c.opts, f = new s.SchemaEnv({ schema: d, schemaId: w, root: $, baseId: g, localRefs: _, meta: b });
    return s.compileSchema.call(c, f), (0, r.getValidate)(a, f);
  }
  return yt.default = l, yt;
}
var vt = {}, qo;
function Nu() {
  if (qo) return vt;
  qo = 1, Object.defineProperty(vt, "__esModule", { value: !0 }), vt.dynamicRef = void 0;
  const e = ee(), t = Ce(), s = ca(), r = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (n) => l(n, n.schema)
  };
  function l(n, i) {
    const { gen: a, keyword: u, it: d } = n;
    if (i[0] !== "#")
      throw new Error(`"${u}" only supports hash fragment reference`);
    const c = i.slice(1);
    if (d.allErrors)
      $();
    else {
      const _ = a.let("valid", !1);
      $(_), n.ok(_);
    }
    function $(_) {
      if (d.schemaEnv.root.dynamicAnchors[c]) {
        const b = a.let("_v", (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(c)}`);
        a.if(b, g(b, _), g(d.validateName, _));
      } else
        g(d.validateName, _)();
    }
    function g(_, b) {
      return b ? () => a.block(() => {
        (0, s.callRef)(n, _), a.let(b, !0);
      }) : () => (0, s.callRef)(n, _);
    }
  }
  return vt.dynamicRef = l, vt.default = r, vt;
}
var vr = {}, Co;
function xl() {
  if (Co) return vr;
  Co = 1, Object.defineProperty(vr, "__esModule", { value: !0 });
  const e = Ru(), t = se(), s = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(r) {
      r.schema ? (0, e.dynamicAnchor)(r, "") : (0, t.checkStrictMode)(r.it, "$recursiveAnchor: false is ignored");
    }
  };
  return vr.default = s, vr;
}
var gr = {}, Do;
function ed() {
  if (Do) return gr;
  Do = 1, Object.defineProperty(gr, "__esModule", { value: !0 });
  const e = Nu(), t = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (s) => (0, e.dynamicRef)(s, s.schema)
  };
  return gr.default = t, gr;
}
var Mo;
function td() {
  if (Mo) return yr;
  Mo = 1, Object.defineProperty(yr, "__esModule", { value: !0 });
  const e = Ru(), t = Nu(), s = xl(), r = ed(), l = [e.default, t.default, s.default, r.default];
  return yr.default = l, yr;
}
var _r = {}, $r = {}, Lo;
function rd() {
  if (Lo) return $r;
  Lo = 1, Object.defineProperty($r, "__esModule", { value: !0 });
  const e = la(), t = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (s) => (0, e.validatePropertyDeps)(s)
  };
  return $r.default = t, $r;
}
var wr = {}, Vo;
function nd() {
  if (Vo) return wr;
  Vo = 1, Object.defineProperty(wr, "__esModule", { value: !0 });
  const e = la(), t = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (s) => (0, e.validateSchemaDeps)(s)
  };
  return wr.default = t, wr;
}
var Er = {}, Fo;
function sd() {
  if (Fo) return Er;
  Fo = 1, Object.defineProperty(Er, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: s, parentSchema: r, it: l }) {
      r.contains === void 0 && (0, e.checkStrictMode)(l, `"${s}" without "contains" is ignored`);
    }
  };
  return Er.default = t, Er;
}
var zo;
function ad() {
  if (zo) return _r;
  zo = 1, Object.defineProperty(_r, "__esModule", { value: !0 });
  const e = rd(), t = nd(), s = sd(), r = [e.default, t.default, s.default];
  return _r.default = r, _r;
}
var br = {}, Sr = {}, Uo;
function od() {
  if (Uo) return Sr;
  Uo = 1, Object.defineProperty(Sr, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = Ce(), l = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: n }) => (0, e._)`{unevaluatedProperty: ${n.unevaluatedProperty}}`
    },
    code(n) {
      const { gen: i, schema: a, data: u, errsCount: d, it: c } = n;
      if (!d)
        throw new Error("ajv implementation error");
      const { allErrors: $, props: g } = c;
      g instanceof e.Name ? i.if((0, e._)`${g} !== true`, () => i.forIn("key", u, (f) => i.if(b(g, f), () => _(f)))) : g !== !0 && i.forIn("key", u, (f) => g === void 0 ? _(f) : i.if(w(g, f), () => _(f))), c.props = !0, n.ok((0, e._)`${d} === ${s.default.errors}`);
      function _(f) {
        if (a === !1) {
          n.setParams({ unevaluatedProperty: f }), n.error(), $ || i.break();
          return;
        }
        if (!(0, t.alwaysValidSchema)(c, a)) {
          const y = i.name("valid");
          n.subschema({
            keyword: "unevaluatedProperties",
            dataProp: f,
            dataPropType: t.Type.Str
          }, y), $ || i.if((0, e.not)(y), () => i.break());
        }
      }
      function b(f, y) {
        return (0, e._)`!${f} || !${f}[${y}]`;
      }
      function w(f, y) {
        const o = [];
        for (const p in f)
          f[p] === !0 && o.push((0, e._)`${y} !== ${p}`);
        return (0, e.and)(...o);
      }
    }
  };
  return Sr.default = l, Sr;
}
var Pr = {}, Ko;
function id() {
  if (Ko) return Pr;
  Ko = 1, Object.defineProperty(Pr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: l } }) => (0, e.str)`must NOT have more than ${l} items`,
      params: ({ params: { len: l } }) => (0, e._)`{limit: ${l}}`
    },
    code(l) {
      const { gen: n, schema: i, data: a, it: u } = l, d = u.items || 0;
      if (d === !0)
        return;
      const c = n.const("len", (0, e._)`${a}.length`);
      if (i === !1)
        l.setParams({ len: d }), l.fail((0, e._)`${c} > ${d}`);
      else if (typeof i == "object" && !(0, t.alwaysValidSchema)(u, i)) {
        const g = n.var("valid", (0, e._)`${c} <= ${d}`);
        n.if((0, e.not)(g), () => $(g, d)), l.ok(g);
      }
      u.items = !0;
      function $(g, _) {
        n.forRange("i", _, c, (b) => {
          l.subschema({ keyword: "unevaluatedItems", dataProp: b, dataPropType: t.Type.Num }, g), u.allErrors || n.if((0, e.not)(g), () => n.break());
        });
      }
    }
  };
  return Pr.default = r, Pr;
}
var Go;
function cd() {
  if (Go) return br;
  Go = 1, Object.defineProperty(br, "__esModule", { value: !0 });
  const e = od(), t = id(), s = [e.default, t.default];
  return br.default = s, br;
}
var Rr = {}, Nr = {}, Ho;
function ud() {
  if (Ho) return Nr;
  Ho = 1, Object.defineProperty(Nr, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, l) {
      const { gen: n, data: i, $data: a, schema: u, schemaCode: d, it: c } = r, { opts: $, errSchemaPath: g, schemaEnv: _, self: b } = c;
      if (!$.validateFormats)
        return;
      a ? w() : f();
      function w() {
        const y = n.scopeValue("formats", {
          ref: b.formats,
          code: $.code.formats
        }), o = n.const("fDef", (0, e._)`${y}[${d}]`), p = n.let("fType"), E = n.let("format");
        n.if((0, e._)`typeof ${o} == "object" && !(${o} instanceof RegExp)`, () => n.assign(p, (0, e._)`${o}.type || "string"`).assign(E, (0, e._)`${o}.validate`), () => n.assign(p, (0, e._)`"string"`).assign(E, o)), r.fail$data((0, e.or)(m(), v()));
        function m() {
          return $.strictSchema === !1 ? e.nil : (0, e._)`${d} && !${E}`;
        }
        function v() {
          const P = _.$async ? (0, e._)`(${o}.async ? await ${E}(${i}) : ${E}(${i}))` : (0, e._)`${E}(${i})`, T = (0, e._)`(typeof ${E} == "function" ? ${P} : ${E}.test(${i}))`;
          return (0, e._)`${E} && ${E} !== true && ${p} === ${l} && !${T}`;
        }
      }
      function f() {
        const y = b.formats[u];
        if (!y) {
          m();
          return;
        }
        if (y === !0)
          return;
        const [o, p, E] = v(y);
        o === l && r.pass(P());
        function m() {
          if ($.strictSchema === !1) {
            b.logger.warn(T());
            return;
          }
          throw new Error(T());
          function T() {
            return `unknown format "${u}" ignored in schema at path "${g}"`;
          }
        }
        function v(T) {
          const C = T instanceof RegExp ? (0, e.regexpCode)(T) : $.code.formats ? (0, e._)`${$.code.formats}${(0, e.getProperty)(u)}` : void 0, V = n.scopeValue("formats", { key: u, ref: T, code: C });
          return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, e._)`${V}.validate`] : ["string", T, V];
        }
        function P() {
          if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
            if (!_.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${E}(${i})`;
          }
          return typeof p == "function" ? (0, e._)`${E}(${i})` : (0, e._)`${E}.test(${i})`;
        }
      }
    }
  };
  return Nr.default = s, Nr;
}
var Jo;
function ld() {
  if (Jo) return Rr;
  Jo = 1, Object.defineProperty(Rr, "__esModule", { value: !0 });
  const t = [ud().default];
  return Rr.default = t, Rr;
}
var ct = {}, Bo;
function dd() {
  return Bo || (Bo = 1, Object.defineProperty(ct, "__esModule", { value: !0 }), ct.contentVocabulary = ct.metadataVocabulary = void 0, ct.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], ct.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), ct;
}
var Wo;
function fd() {
  if (Wo) return Ft;
  Wo = 1, Object.defineProperty(Ft, "__esModule", { value: !0 });
  const e = Nl(), t = Vl(), s = Zl(), r = td(), l = ad(), n = cd(), i = ld(), a = dd(), u = [
    r.default,
    e.default,
    t.default,
    (0, s.default)(!0),
    i.default,
    a.metadataVocabulary,
    a.contentVocabulary,
    l.default,
    n.default
  ];
  return Ft.default = u, Ft;
}
var Or = {}, It = {}, Xo;
function hd() {
  if (Xo) return It;
  Xo = 1, Object.defineProperty(It, "__esModule", { value: !0 }), It.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (It.DiscrError = e = {})), It;
}
var Yo;
function md() {
  if (Yo) return Or;
  Yo = 1, Object.defineProperty(Or, "__esModule", { value: !0 });
  const e = ee(), t = hd(), s = In(), r = On(), l = se(), i = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: a, tagName: u } }) => a === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: a, tag: u, tagName: d } }) => (0, e._)`{error: ${a}, tag: ${d}, tagValue: ${u}}`
    },
    code(a) {
      const { gen: u, data: d, schema: c, parentSchema: $, it: g } = a, { oneOf: _ } = $;
      if (!g.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const b = c.propertyName;
      if (typeof b != "string")
        throw new Error("discriminator: requires propertyName");
      if (c.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!_)
        throw new Error("discriminator: requires oneOf keyword");
      const w = u.let("valid", !1), f = u.const("tag", (0, e._)`${d}${(0, e.getProperty)(b)}`);
      u.if((0, e._)`typeof ${f} == "string"`, () => y(), () => a.error(!1, { discrError: t.DiscrError.Tag, tag: f, tagName: b })), a.ok(w);
      function y() {
        const E = p();
        u.if(!1);
        for (const m in E)
          u.elseIf((0, e._)`${f} === ${m}`), u.assign(w, o(E[m]));
        u.else(), a.error(!1, { discrError: t.DiscrError.Mapping, tag: f, tagName: b }), u.endIf();
      }
      function o(E) {
        const m = u.name("valid"), v = a.subschema({ keyword: "oneOf", schemaProp: E }, m);
        return a.mergeEvaluated(v, e.Name), m;
      }
      function p() {
        var E;
        const m = {}, v = T($);
        let P = !0;
        for (let D = 0; D < _.length; D++) {
          let z = _[D];
          if (z?.$ref && !(0, l.schemaHasRulesButRef)(z, g.self.RULES)) {
            const M = z.$ref;
            if (z = s.resolveRef.call(g.self, g.schemaEnv.root, g.baseId, M), z instanceof s.SchemaEnv && (z = z.schema), z === void 0)
              throw new r.default(g.opts.uriResolver, g.baseId, M);
          }
          const U = (E = z?.properties) === null || E === void 0 ? void 0 : E[b];
          if (typeof U != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${b}"`);
          P = P && (v || T(z)), C(U, D);
        }
        if (!P)
          throw new Error(`discriminator: "${b}" must be required`);
        return m;
        function T({ required: D }) {
          return Array.isArray(D) && D.includes(b);
        }
        function C(D, z) {
          if (D.const)
            V(D.const, z);
          else if (D.enum)
            for (const U of D.enum)
              V(U, z);
          else
            throw new Error(`discriminator: "properties/${b}" must have "const" or "enum"`);
        }
        function V(D, z) {
          if (typeof D != "string" || D in m)
            throw new Error(`discriminator: "${b}" values must be unique strings`);
          m[D] = z;
        }
      }
    }
  };
  return Or.default = i, Or;
}
var Ir = {};
const pd = "https://json-schema.org/draft/2020-12/schema", yd = "https://json-schema.org/draft/2020-12/schema", vd = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, gd = "meta", _d = "Core and Validation specifications meta-schema", $d = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], wd = ["object", "boolean"], Ed = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", bd = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, Sd = {
  $schema: pd,
  $id: yd,
  $vocabulary: vd,
  $dynamicAnchor: gd,
  title: _d,
  allOf: $d,
  type: wd,
  $comment: Ed,
  properties: bd
}, Pd = "https://json-schema.org/draft/2020-12/schema", Rd = "https://json-schema.org/draft/2020-12/meta/applicator", Nd = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, Od = "meta", Id = "Applicator vocabulary meta-schema", Td = ["object", "boolean"], jd = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, Ad = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, kd = {
  $schema: Pd,
  $id: Rd,
  $vocabulary: Nd,
  $dynamicAnchor: Od,
  title: Id,
  type: Td,
  properties: jd,
  $defs: Ad
}, qd = "https://json-schema.org/draft/2020-12/schema", Cd = "https://json-schema.org/draft/2020-12/meta/unevaluated", Dd = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, Md = "meta", Ld = "Unevaluated applicator vocabulary meta-schema", Vd = ["object", "boolean"], Fd = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, zd = {
  $schema: qd,
  $id: Cd,
  $vocabulary: Dd,
  $dynamicAnchor: Md,
  title: Ld,
  type: Vd,
  properties: Fd
}, Ud = "https://json-schema.org/draft/2020-12/schema", Kd = "https://json-schema.org/draft/2020-12/meta/content", Gd = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, Hd = "meta", Jd = "Content vocabulary meta-schema", Bd = ["object", "boolean"], Wd = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, Xd = {
  $schema: Ud,
  $id: Kd,
  $vocabulary: Gd,
  $dynamicAnchor: Hd,
  title: Jd,
  type: Bd,
  properties: Wd
}, Yd = "https://json-schema.org/draft/2020-12/schema", Qd = "https://json-schema.org/draft/2020-12/meta/core", Zd = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, xd = "meta", ef = "Core vocabulary meta-schema", tf = ["object", "boolean"], rf = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, nf = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, sf = {
  $schema: Yd,
  $id: Qd,
  $vocabulary: Zd,
  $dynamicAnchor: xd,
  title: ef,
  type: tf,
  properties: rf,
  $defs: nf
}, af = "https://json-schema.org/draft/2020-12/schema", of = "https://json-schema.org/draft/2020-12/meta/format-annotation", cf = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, uf = "meta", lf = "Format vocabulary meta-schema for annotation results", df = ["object", "boolean"], ff = { format: { type: "string" } }, hf = {
  $schema: af,
  $id: of,
  $vocabulary: cf,
  $dynamicAnchor: uf,
  title: lf,
  type: df,
  properties: ff
}, mf = "https://json-schema.org/draft/2020-12/schema", pf = "https://json-schema.org/draft/2020-12/meta/meta-data", yf = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, vf = "meta", gf = "Meta-data vocabulary meta-schema", _f = ["object", "boolean"], $f = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, wf = {
  $schema: mf,
  $id: pf,
  $vocabulary: yf,
  $dynamicAnchor: vf,
  title: gf,
  type: _f,
  properties: $f
}, Ef = "https://json-schema.org/draft/2020-12/schema", bf = "https://json-schema.org/draft/2020-12/meta/validation", Sf = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, Pf = "meta", Rf = "Validation vocabulary meta-schema", Nf = ["object", "boolean"], Of = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, If = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Tf = {
  $schema: Ef,
  $id: bf,
  $vocabulary: Sf,
  $dynamicAnchor: Pf,
  title: Rf,
  type: Nf,
  properties: Of,
  $defs: If
};
var Qo;
function jf() {
  if (Qo) return Ir;
  Qo = 1, Object.defineProperty(Ir, "__esModule", { value: !0 });
  const e = Sd, t = kd, s = zd, r = Xd, l = sf, n = hf, i = wf, a = Tf, u = ["/properties"];
  function d(c) {
    return [
      e,
      t,
      s,
      r,
      l,
      $(this, n),
      i,
      $(this, a)
    ].forEach((g) => this.addMetaSchema(g, void 0, !1)), this;
    function $(g, _) {
      return c ? g.$dataMetaSchema(_, u) : _;
    }
  }
  return Ir.default = d, Ir;
}
var Zo;
function Af() {
  return Zo || (Zo = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
    const s = Pl(), r = fd(), l = md(), n = jf(), i = "https://json-schema.org/draft/2020-12/schema";
    class a extends s.default {
      constructor(_ = {}) {
        super({
          ..._,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((_) => this.addVocabulary(_)), this.opts.discriminator && this.addKeyword(l.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: _, meta: b } = this.opts;
        b && (n.default.call(this, _), this.refs["http://json-schema.org/schema"] = i);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(i) ? i : void 0);
      }
    }
    t.Ajv2020 = a, e.exports = t = a, e.exports.Ajv2020 = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
    var u = Nn();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var d = ee();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return d._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return d.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return d.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return d.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return d.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return d.CodeGen;
    } });
    var c = ia();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return c.default;
    } });
    var $ = On();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return $.default;
    } });
  })(Ct, Ct.exports)), Ct.exports;
}
var kf = Af(), Tr = { exports: {} }, es = {}, xo;
function qf() {
  return xo || (xo = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(D, z) {
      return { validate: D, compare: z };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(n, i),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(u(!0), d),
      "date-time": t(g(!0), _),
      "iso-time": t(u(), c),
      "iso-date-time": t(g(), b),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: y,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: V,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: p,
      // signed 32 bit integer
      int32: { type: "number", validate: v },
      // signed 64 bit integer
      int64: { type: "number", validate: P },
      // C-type float
      float: { type: "number", validate: T },
      // C-type double
      double: { type: "number", validate: T },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, i),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, _),
      "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, c),
      "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, b),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function s(D) {
      return D % 4 === 0 && (D % 100 !== 0 || D % 400 === 0);
    }
    const r = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, l = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function n(D) {
      const z = r.exec(D);
      if (!z)
        return !1;
      const U = +z[1], M = +z[2], F = +z[3];
      return M >= 1 && M <= 12 && F >= 1 && F <= (M === 2 && s(U) ? 29 : l[M]);
    }
    function i(D, z) {
      if (D && z)
        return D > z ? 1 : D < z ? -1 : 0;
    }
    const a = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function u(D) {
      return function(U) {
        const M = a.exec(U);
        if (!M)
          return !1;
        const F = +M[1], W = +M[2], B = +M[3], J = M[4], Y = M[5] === "-" ? -1 : 1, k = +(M[6] || 0), N = +(M[7] || 0);
        if (k > 23 || N > 59 || D && !J)
          return !1;
        if (F <= 23 && W <= 59 && B < 60)
          return !0;
        const A = W - N * Y, O = F - k * Y - (A < 0 ? 1 : 0);
        return (O === 23 || O === -1) && (A === 59 || A === -1) && B < 61;
      };
    }
    function d(D, z) {
      if (!(D && z))
        return;
      const U = (/* @__PURE__ */ new Date("2020-01-01T" + D)).valueOf(), M = (/* @__PURE__ */ new Date("2020-01-01T" + z)).valueOf();
      if (U && M)
        return U - M;
    }
    function c(D, z) {
      if (!(D && z))
        return;
      const U = a.exec(D), M = a.exec(z);
      if (U && M)
        return D = U[1] + U[2] + U[3], z = M[1] + M[2] + M[3], D > z ? 1 : D < z ? -1 : 0;
    }
    const $ = /t|\s/i;
    function g(D) {
      const z = u(D);
      return function(M) {
        const F = M.split($);
        return F.length === 2 && n(F[0]) && z(F[1]);
      };
    }
    function _(D, z) {
      if (!(D && z))
        return;
      const U = new Date(D).valueOf(), M = new Date(z).valueOf();
      if (U && M)
        return U - M;
    }
    function b(D, z) {
      if (!(D && z))
        return;
      const [U, M] = D.split($), [F, W] = z.split($), B = i(U, F);
      if (B !== void 0)
        return B || d(M, W);
    }
    const w = /\/|:/, f = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function y(D) {
      return w.test(D) && f.test(D);
    }
    const o = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function p(D) {
      return o.lastIndex = 0, o.test(D);
    }
    const E = -2147483648, m = 2 ** 31 - 1;
    function v(D) {
      return Number.isInteger(D) && D <= m && D >= E;
    }
    function P(D) {
      return Number.isInteger(D);
    }
    function T() {
      return !0;
    }
    const C = /[^\\]\\Z/;
    function V(D) {
      if (C.test(D))
        return !1;
      try {
        return new RegExp(D), !0;
      } catch {
        return !1;
      }
    }
  })(es)), es;
}
var ts = {}, jr = { exports: {} }, rs = {}, Ge = {}, ut = {}, ns = {}, ss = {}, as = {}, ei;
function wn() {
  return ei || (ei = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class s extends t {
      constructor(o) {
        if (super(), !e.IDENTIFIER.test(o))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = s;
    class r extends t {
      constructor(o) {
        super(), this._items = typeof o == "string" ? [o] : o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const o = this._items[0];
        return o === "" || o === '""';
      }
      get str() {
        var o;
        return (o = this._str) !== null && o !== void 0 ? o : this._str = this._items.reduce((p, E) => `${p}${E}`, "");
      }
      get names() {
        var o;
        return (o = this._names) !== null && o !== void 0 ? o : this._names = this._items.reduce((p, E) => (E instanceof s && (p[E.str] = (p[E.str] || 0) + 1), p), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function l(y, ...o) {
      const p = [y[0]];
      let E = 0;
      for (; E < o.length; )
        a(p, o[E]), p.push(y[++E]);
      return new r(p);
    }
    e._ = l;
    const n = new r("+");
    function i(y, ...o) {
      const p = [_(y[0])];
      let E = 0;
      for (; E < o.length; )
        p.push(n), a(p, o[E]), p.push(n, _(y[++E]));
      return u(p), new r(p);
    }
    e.str = i;
    function a(y, o) {
      o instanceof r ? y.push(...o._items) : o instanceof s ? y.push(o) : y.push($(o));
    }
    e.addCodeArg = a;
    function u(y) {
      let o = 1;
      for (; o < y.length - 1; ) {
        if (y[o] === n) {
          const p = d(y[o - 1], y[o + 1]);
          if (p !== void 0) {
            y.splice(o - 1, 3, p);
            continue;
          }
          y[o++] = "+";
        }
        o++;
      }
    }
    function d(y, o) {
      if (o === '""')
        return y;
      if (y === '""')
        return o;
      if (typeof y == "string")
        return o instanceof s || y[y.length - 1] !== '"' ? void 0 : typeof o != "string" ? `${y.slice(0, -1)}${o}"` : o[0] === '"' ? y.slice(0, -1) + o.slice(1) : void 0;
      if (typeof o == "string" && o[0] === '"' && !(y instanceof s))
        return `"${y}${o.slice(1)}`;
    }
    function c(y, o) {
      return o.emptyStr() ? y : y.emptyStr() ? o : i`${y}${o}`;
    }
    e.strConcat = c;
    function $(y) {
      return typeof y == "number" || typeof y == "boolean" || y === null ? y : _(Array.isArray(y) ? y.join(",") : y);
    }
    function g(y) {
      return new r(_(y));
    }
    e.stringify = g;
    function _(y) {
      return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = _;
    function b(y) {
      return typeof y == "string" && e.IDENTIFIER.test(y) ? new r(`.${y}`) : l`[${y}]`;
    }
    e.getProperty = b;
    function w(y) {
      if (typeof y == "string" && e.IDENTIFIER.test(y))
        return new r(`${y}`);
      throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
    }
    e.getEsmExportName = w;
    function f(y) {
      return new r(y.toString());
    }
    e.regexpCode = f;
  })(as)), as;
}
var os = {}, ti;
function ri() {
  return ti || (ti = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = wn();
    class s extends Error {
      constructor(d) {
        super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
      }
    }
    var r;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(r || (e.UsedValueState = r = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class l {
      constructor({ prefixes: d, parent: c } = {}) {
        this._names = {}, this._prefixes = d, this._parent = c;
      }
      toName(d) {
        return d instanceof t.Name ? d : this.name(d);
      }
      name(d) {
        return new t.Name(this._newName(d));
      }
      _newName(d) {
        const c = this._names[d] || this._nameGroup(d);
        return `${d}${c.index++}`;
      }
      _nameGroup(d) {
        var c, $;
        if (!(($ = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || $ === void 0) && $.has(d) || this._prefixes && !this._prefixes.has(d))
          throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
        return this._names[d] = { prefix: d, index: 0 };
      }
    }
    e.Scope = l;
    class n extends t.Name {
      constructor(d, c) {
        super(c), this.prefix = d;
      }
      setValue(d, { property: c, itemIndex: $ }) {
        this.value = d, this.scopePath = (0, t._)`.${new t.Name(c)}[${$}]`;
      }
    }
    e.ValueScopeName = n;
    const i = (0, t._)`\n`;
    class a extends l {
      constructor(d) {
        super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? i : t.nil };
      }
      get() {
        return this._scope;
      }
      name(d) {
        return new n(d, this._newName(d));
      }
      value(d, c) {
        var $;
        if (c.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const g = this.toName(d), { prefix: _ } = g, b = ($ = c.key) !== null && $ !== void 0 ? $ : c.ref;
        let w = this._values[_];
        if (w) {
          const o = w.get(b);
          if (o)
            return o;
        } else
          w = this._values[_] = /* @__PURE__ */ new Map();
        w.set(b, g);
        const f = this._scope[_] || (this._scope[_] = []), y = f.length;
        return f[y] = c.ref, g.setValue(c, { property: _, itemIndex: y }), g;
      }
      getValue(d, c) {
        const $ = this._values[d];
        if ($)
          return $.get(c);
      }
      scopeRefs(d, c = this._values) {
        return this._reduceValues(c, ($) => {
          if ($.scopePath === void 0)
            throw new Error(`CodeGen: name "${$}" has no value`);
          return (0, t._)`${d}${$.scopePath}`;
        });
      }
      scopeCode(d = this._values, c, $) {
        return this._reduceValues(d, (g) => {
          if (g.value === void 0)
            throw new Error(`CodeGen: name "${g}" has no value`);
          return g.value.code;
        }, c, $);
      }
      _reduceValues(d, c, $ = {}, g) {
        let _ = t.nil;
        for (const b in d) {
          const w = d[b];
          if (!w)
            continue;
          const f = $[b] = $[b] || /* @__PURE__ */ new Map();
          w.forEach((y) => {
            if (f.has(y))
              return;
            f.set(y, r.Started);
            let o = c(y);
            if (o) {
              const p = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              _ = (0, t._)`${_}${p} ${y} = ${o};${this.opts._n}`;
            } else if (o = g?.(y))
              _ = (0, t._)`${_}${o}${this.opts._n}`;
            else
              throw new s(y);
            f.set(y, r.Completed);
          });
        }
        return _;
      }
    }
    e.ValueScope = a;
  })(os)), os;
}
var ni;
function ne() {
  return ni || (ni = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = wn(), s = ri();
    var r = wn();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return r.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return r.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return r.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } });
    var l = ri();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return l.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return l.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return l.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return l.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class n {
      optimizeNodes() {
        return this;
      }
      optimizeNames(h, S) {
        return this;
      }
    }
    class i extends n {
      constructor(h, S, j) {
        super(), this.varKind = h, this.name = S, this.rhs = j;
      }
      render({ es5: h, _n: S }) {
        const j = h ? s.varKinds.var : this.varKind, K = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${j} ${this.name}${K};` + S;
      }
      optimizeNames(h, S) {
        if (h[this.name.str])
          return this.rhs && (this.rhs = M(this.rhs, h, S)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class a extends n {
      constructor(h, S, j) {
        super(), this.lhs = h, this.rhs = S, this.sideEffects = j;
      }
      render({ _n: h }) {
        return `${this.lhs} = ${this.rhs};` + h;
      }
      optimizeNames(h, S) {
        if (!(this.lhs instanceof t.Name && !h[this.lhs.str] && !this.sideEffects))
          return this.rhs = M(this.rhs, h, S), this;
      }
      get names() {
        const h = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return U(h, this.rhs);
      }
    }
    class u extends a {
      constructor(h, S, j, K) {
        super(h, j, K), this.op = S;
      }
      render({ _n: h }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + h;
      }
    }
    class d extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `${this.label}:` + h;
      }
    }
    class c extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `break${this.label ? ` ${this.label}` : ""};` + h;
      }
    }
    class $ extends n {
      constructor(h) {
        super(), this.error = h;
      }
      render({ _n: h }) {
        return `throw ${this.error};` + h;
      }
      get names() {
        return this.error.names;
      }
    }
    class g extends n {
      constructor(h) {
        super(), this.code = h;
      }
      render({ _n: h }) {
        return `${this.code};` + h;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(h, S) {
        return this.code = M(this.code, h, S), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class _ extends n {
      constructor(h = []) {
        super(), this.nodes = h;
      }
      render(h) {
        return this.nodes.reduce((S, j) => S + j.render(h), "");
      }
      optimizeNodes() {
        const { nodes: h } = this;
        let S = h.length;
        for (; S--; ) {
          const j = h[S].optimizeNodes();
          Array.isArray(j) ? h.splice(S, 1, ...j) : j ? h[S] = j : h.splice(S, 1);
        }
        return h.length > 0 ? this : void 0;
      }
      optimizeNames(h, S) {
        const { nodes: j } = this;
        let K = j.length;
        for (; K--; ) {
          const H = j[K];
          H.optimizeNames(h, S) || (F(h, H.names), j.splice(K, 1));
        }
        return j.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((h, S) => z(h, S.names), {});
      }
    }
    class b extends _ {
      render(h) {
        return "{" + h._n + super.render(h) + "}" + h._n;
      }
    }
    class w extends _ {
    }
    class f extends b {
    }
    f.kind = "else";
    class y extends b {
      constructor(h, S) {
        super(S), this.condition = h;
      }
      render(h) {
        let S = `if(${this.condition})` + super.render(h);
        return this.else && (S += "else " + this.else.render(h)), S;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const h = this.condition;
        if (h === !0)
          return this.nodes;
        let S = this.else;
        if (S) {
          const j = S.optimizeNodes();
          S = this.else = Array.isArray(j) ? new f(j) : j;
        }
        if (S)
          return h === !1 ? S instanceof y ? S : S.nodes : this.nodes.length ? this : new y(W(h), S instanceof y ? [S] : S.nodes);
        if (!(h === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(h, S) {
        var j;
        if (this.else = (j = this.else) === null || j === void 0 ? void 0 : j.optimizeNames(h, S), !!(super.optimizeNames(h, S) || this.else))
          return this.condition = M(this.condition, h, S), this;
      }
      get names() {
        const h = super.names;
        return U(h, this.condition), this.else && z(h, this.else.names), h;
      }
    }
    y.kind = "if";
    class o extends b {
    }
    o.kind = "for";
    class p extends o {
      constructor(h) {
        super(), this.iteration = h;
      }
      render(h) {
        return `for(${this.iteration})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iteration = M(this.iteration, h, S), this;
      }
      get names() {
        return z(super.names, this.iteration.names);
      }
    }
    class E extends o {
      constructor(h, S, j, K) {
        super(), this.varKind = h, this.name = S, this.from = j, this.to = K;
      }
      render(h) {
        const S = h.es5 ? s.varKinds.var : this.varKind, { name: j, from: K, to: H } = this;
        return `for(${S} ${j}=${K}; ${j}<${H}; ${j}++)` + super.render(h);
      }
      get names() {
        const h = U(super.names, this.from);
        return U(h, this.to);
      }
    }
    class m extends o {
      constructor(h, S, j, K) {
        super(), this.loop = h, this.varKind = S, this.name = j, this.iterable = K;
      }
      render(h) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iterable = M(this.iterable, h, S), this;
      }
      get names() {
        return z(super.names, this.iterable.names);
      }
    }
    class v extends b {
      constructor(h, S, j) {
        super(), this.name = h, this.args = S, this.async = j;
      }
      render(h) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(h);
      }
    }
    v.kind = "func";
    class P extends _ {
      render(h) {
        return "return " + super.render(h);
      }
    }
    P.kind = "return";
    class T extends b {
      render(h) {
        let S = "try" + super.render(h);
        return this.catch && (S += this.catch.render(h)), this.finally && (S += this.finally.render(h)), S;
      }
      optimizeNodes() {
        var h, S;
        return super.optimizeNodes(), (h = this.catch) === null || h === void 0 || h.optimizeNodes(), (S = this.finally) === null || S === void 0 || S.optimizeNodes(), this;
      }
      optimizeNames(h, S) {
        var j, K;
        return super.optimizeNames(h, S), (j = this.catch) === null || j === void 0 || j.optimizeNames(h, S), (K = this.finally) === null || K === void 0 || K.optimizeNames(h, S), this;
      }
      get names() {
        const h = super.names;
        return this.catch && z(h, this.catch.names), this.finally && z(h, this.finally.names), h;
      }
    }
    class C extends b {
      constructor(h) {
        super(), this.error = h;
      }
      render(h) {
        return `catch(${this.error})` + super.render(h);
      }
    }
    C.kind = "catch";
    class V extends b {
      render(h) {
        return "finally" + super.render(h);
      }
    }
    V.kind = "finally";
    class D {
      constructor(h, S = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...S, _n: S.lines ? `
` : "" }, this._extScope = h, this._scope = new s.Scope({ parent: h }), this._nodes = [new w()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(h) {
        return this._scope.name(h);
      }
      // reserves unique name in the external scope
      scopeName(h) {
        return this._extScope.name(h);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(h, S) {
        const j = this._extScope.value(h, S);
        return (this._values[j.prefix] || (this._values[j.prefix] = /* @__PURE__ */ new Set())).add(j), j;
      }
      getScopeValue(h, S) {
        return this._extScope.getValue(h, S);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(h) {
        return this._extScope.scopeRefs(h, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(h, S, j, K) {
        const H = this._scope.toName(S);
        return j !== void 0 && K && (this._constants[H.str] = j), this._leafNode(new i(h, H, j)), H;
      }
      // `const` declaration (`var` in es5 mode)
      const(h, S, j) {
        return this._def(s.varKinds.const, h, S, j);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(h, S, j) {
        return this._def(s.varKinds.let, h, S, j);
      }
      // `var` declaration with optional assignment
      var(h, S, j) {
        return this._def(s.varKinds.var, h, S, j);
      }
      // assignment code
      assign(h, S, j) {
        return this._leafNode(new a(h, S, j));
      }
      // `+=` code
      add(h, S) {
        return this._leafNode(new u(h, e.operators.ADD, S));
      }
      // appends passed SafeExpr to code or executes Block
      code(h) {
        return typeof h == "function" ? h() : h !== t.nil && this._leafNode(new g(h)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...h) {
        const S = ["{"];
        for (const [j, K] of h)
          S.length > 1 && S.push(","), S.push(j), (j !== K || this.opts.es5) && (S.push(":"), (0, t.addCodeArg)(S, K));
        return S.push("}"), new t._Code(S);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(h, S, j) {
        if (this._blockNode(new y(h)), S && j)
          this.code(S).else().code(j).endIf();
        else if (S)
          this.code(S).endIf();
        else if (j)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(h) {
        return this._elseNode(new y(h));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new f());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(y, f);
      }
      _for(h, S) {
        return this._blockNode(h), S && this.code(S).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(h, S) {
        return this._for(new p(h), S);
      }
      // `for` statement for a range of values
      forRange(h, S, j, K, H = this.opts.es5 ? s.varKinds.var : s.varKinds.let) {
        const Z = this._scope.toName(h);
        return this._for(new E(H, Z, S, j), () => K(Z));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(h, S, j, K = s.varKinds.const) {
        const H = this._scope.toName(h);
        if (this.opts.es5) {
          const Z = S instanceof t.Name ? S : this.var("_arr", S);
          return this.forRange("_i", 0, (0, t._)`${Z}.length`, (Q) => {
            this.var(H, (0, t._)`${Z}[${Q}]`), j(H);
          });
        }
        return this._for(new m("of", K, H, S), () => j(H));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(h, S, j, K = this.opts.es5 ? s.varKinds.var : s.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(h, (0, t._)`Object.keys(${S})`, j);
        const H = this._scope.toName(h);
        return this._for(new m("in", K, H, S), () => j(H));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(o);
      }
      // `label` statement
      label(h) {
        return this._leafNode(new d(h));
      }
      // `break` statement
      break(h) {
        return this._leafNode(new c(h));
      }
      // `return` statement
      return(h) {
        const S = new P();
        if (this._blockNode(S), this.code(h), S.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(P);
      }
      // `try` statement
      try(h, S, j) {
        if (!S && !j)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const K = new T();
        if (this._blockNode(K), this.code(h), S) {
          const H = this.name("e");
          this._currNode = K.catch = new C(H), S(H);
        }
        return j && (this._currNode = K.finally = new V(), this.code(j)), this._endBlockNode(C, V);
      }
      // `throw` statement
      throw(h) {
        return this._leafNode(new $(h));
      }
      // start self-balancing block
      block(h, S) {
        return this._blockStarts.push(this._nodes.length), h && this.code(h).endBlock(S), this;
      }
      // end the current self-balancing block
      endBlock(h) {
        const S = this._blockStarts.pop();
        if (S === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const j = this._nodes.length - S;
        if (j < 0 || h !== void 0 && j !== h)
          throw new Error(`CodeGen: wrong number of nodes: ${j} vs ${h} expected`);
        return this._nodes.length = S, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(h, S = t.nil, j, K) {
        return this._blockNode(new v(h, S, j)), K && this.code(K).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(v);
      }
      optimize(h = 1) {
        for (; h-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(h) {
        return this._currNode.nodes.push(h), this;
      }
      _blockNode(h) {
        this._currNode.nodes.push(h), this._nodes.push(h);
      }
      _endBlockNode(h, S) {
        const j = this._currNode;
        if (j instanceof h || S && j instanceof S)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${S ? `${h.kind}/${S.kind}` : h.kind}"`);
      }
      _elseNode(h) {
        const S = this._currNode;
        if (!(S instanceof y))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = S.else = h, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const h = this._nodes;
        return h[h.length - 1];
      }
      set _currNode(h) {
        const S = this._nodes;
        S[S.length - 1] = h;
      }
    }
    e.CodeGen = D;
    function z(O, h) {
      for (const S in h)
        O[S] = (O[S] || 0) + (h[S] || 0);
      return O;
    }
    function U(O, h) {
      return h instanceof t._CodeOrName ? z(O, h.names) : O;
    }
    function M(O, h, S) {
      if (O instanceof t.Name)
        return j(O);
      if (!K(O))
        return O;
      return new t._Code(O._items.reduce((H, Z) => (Z instanceof t.Name && (Z = j(Z)), Z instanceof t._Code ? H.push(...Z._items) : H.push(Z), H), []));
      function j(H) {
        const Z = S[H.str];
        return Z === void 0 || h[H.str] !== 1 ? H : (delete h[H.str], Z);
      }
      function K(H) {
        return H instanceof t._Code && H._items.some((Z) => Z instanceof t.Name && h[Z.str] === 1 && S[Z.str] !== void 0);
      }
    }
    function F(O, h) {
      for (const S in h)
        O[S] = (O[S] || 0) - (h[S] || 0);
    }
    function W(O) {
      return typeof O == "boolean" || typeof O == "number" || O === null ? !O : (0, t._)`!${A(O)}`;
    }
    e.not = W;
    const B = N(e.operators.AND);
    function J(...O) {
      return O.reduce(B);
    }
    e.and = J;
    const Y = N(e.operators.OR);
    function k(...O) {
      return O.reduce(Y);
    }
    e.or = k;
    function N(O) {
      return (h, S) => h === t.nil ? S : S === t.nil ? h : (0, t._)`${A(h)} ${O} ${A(S)}`;
    }
    function A(O) {
      return O instanceof t.Name ? O : (0, t._)`(${O})`;
    }
  })(ss)), ss;
}
var re = {}, si;
function ie() {
  if (si) return re;
  si = 1, Object.defineProperty(re, "__esModule", { value: !0 }), re.checkStrictMode = re.getErrorPath = re.Type = re.useFunc = re.setEvaluated = re.evaluatedPropsToName = re.mergeEvaluated = re.eachItem = re.unescapeJsonPointer = re.escapeJsonPointer = re.escapeFragment = re.unescapeFragment = re.schemaRefOrVal = re.schemaHasRulesButRef = re.schemaHasRules = re.checkUnknownRules = re.alwaysValidSchema = re.toHash = void 0;
  const e = ne(), t = wn();
  function s(m) {
    const v = {};
    for (const P of m)
      v[P] = !0;
    return v;
  }
  re.toHash = s;
  function r(m, v) {
    return typeof v == "boolean" ? v : Object.keys(v).length === 0 ? !0 : (l(m, v), !n(v, m.self.RULES.all));
  }
  re.alwaysValidSchema = r;
  function l(m, v = m.schema) {
    const { opts: P, self: T } = m;
    if (!P.strictSchema || typeof v == "boolean")
      return;
    const C = T.RULES.keywords;
    for (const V in v)
      C[V] || E(m, `unknown keyword: "${V}"`);
  }
  re.checkUnknownRules = l;
  function n(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const P in m)
      if (v[P])
        return !0;
    return !1;
  }
  re.schemaHasRules = n;
  function i(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const P in m)
      if (P !== "$ref" && v.all[P])
        return !0;
    return !1;
  }
  re.schemaHasRulesButRef = i;
  function a({ topSchemaRef: m, schemaPath: v }, P, T, C) {
    if (!C) {
      if (typeof P == "number" || typeof P == "boolean")
        return P;
      if (typeof P == "string")
        return (0, e._)`${P}`;
    }
    return (0, e._)`${m}${v}${(0, e.getProperty)(T)}`;
  }
  re.schemaRefOrVal = a;
  function u(m) {
    return $(decodeURIComponent(m));
  }
  re.unescapeFragment = u;
  function d(m) {
    return encodeURIComponent(c(m));
  }
  re.escapeFragment = d;
  function c(m) {
    return typeof m == "number" ? `${m}` : m.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  re.escapeJsonPointer = c;
  function $(m) {
    return m.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  re.unescapeJsonPointer = $;
  function g(m, v) {
    if (Array.isArray(m))
      for (const P of m)
        v(P);
    else
      v(m);
  }
  re.eachItem = g;
  function _({ mergeNames: m, mergeToName: v, mergeValues: P, resultToName: T }) {
    return (C, V, D, z) => {
      const U = D === void 0 ? V : D instanceof e.Name ? (V instanceof e.Name ? m(C, V, D) : v(C, V, D), D) : V instanceof e.Name ? (v(C, D, V), V) : P(V, D);
      return z === e.Name && !(U instanceof e.Name) ? T(C, U) : U;
    };
  }
  re.mergeEvaluated = {
    props: _({
      mergeNames: (m, v, P) => m.if((0, e._)`${P} !== true && ${v} !== undefined`, () => {
        m.if((0, e._)`${v} === true`, () => m.assign(P, !0), () => m.assign(P, (0, e._)`${P} || {}`).code((0, e._)`Object.assign(${P}, ${v})`));
      }),
      mergeToName: (m, v, P) => m.if((0, e._)`${P} !== true`, () => {
        v === !0 ? m.assign(P, !0) : (m.assign(P, (0, e._)`${P} || {}`), w(m, P, v));
      }),
      mergeValues: (m, v) => m === !0 ? !0 : { ...m, ...v },
      resultToName: b
    }),
    items: _({
      mergeNames: (m, v, P) => m.if((0, e._)`${P} !== true && ${v} !== undefined`, () => m.assign(P, (0, e._)`${v} === true ? true : ${P} > ${v} ? ${P} : ${v}`)),
      mergeToName: (m, v, P) => m.if((0, e._)`${P} !== true`, () => m.assign(P, v === !0 ? !0 : (0, e._)`${P} > ${v} ? ${P} : ${v}`)),
      mergeValues: (m, v) => m === !0 ? !0 : Math.max(m, v),
      resultToName: (m, v) => m.var("items", v)
    })
  };
  function b(m, v) {
    if (v === !0)
      return m.var("props", !0);
    const P = m.var("props", (0, e._)`{}`);
    return v !== void 0 && w(m, P, v), P;
  }
  re.evaluatedPropsToName = b;
  function w(m, v, P) {
    Object.keys(P).forEach((T) => m.assign((0, e._)`${v}${(0, e.getProperty)(T)}`, !0));
  }
  re.setEvaluated = w;
  const f = {};
  function y(m, v) {
    return m.scopeValue("func", {
      ref: v,
      code: f[v.code] || (f[v.code] = new t._Code(v.code))
    });
  }
  re.useFunc = y;
  var o;
  (function(m) {
    m[m.Num = 0] = "Num", m[m.Str = 1] = "Str";
  })(o || (re.Type = o = {}));
  function p(m, v, P) {
    if (m instanceof e.Name) {
      const T = v === o.Num;
      return P ? T ? (0, e._)`"[" + ${m} + "]"` : (0, e._)`"['" + ${m} + "']"` : T ? (0, e._)`"/" + ${m}` : (0, e._)`"/" + ${m}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return P ? (0, e.getProperty)(m).toString() : "/" + c(m);
  }
  re.getErrorPath = p;
  function E(m, v, P = m.opts.strictSchema) {
    if (P) {
      if (v = `strict mode: ${v}`, P === !0)
        throw new Error(v);
      m.self.logger.warn(v);
    }
  }
  return re.checkStrictMode = E, re;
}
var Ar = {}, ai;
function rt() {
  if (ai) return Ar;
  ai = 1, Object.defineProperty(Ar, "__esModule", { value: !0 });
  const e = ne(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Ar.default = t, Ar;
}
var oi;
function Tn() {
  return oi || (oi = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = ne(), s = ie(), r = rt();
    e.keywordError = {
      message: ({ keyword: f }) => (0, t.str)`must pass "${f}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: f, schemaType: y }) => y ? (0, t.str)`"${f}" keyword must be ${y} ($data)` : (0, t.str)`"${f}" keyword is invalid ($data)`
    };
    function l(f, y = e.keywordError, o, p) {
      const { it: E } = f, { gen: m, compositeRule: v, allErrors: P } = E, T = $(f, y, o);
      p ?? (v || P) ? u(m, T) : d(E, (0, t._)`[${T}]`);
    }
    e.reportError = l;
    function n(f, y = e.keywordError, o) {
      const { it: p } = f, { gen: E, compositeRule: m, allErrors: v } = p, P = $(f, y, o);
      u(E, P), m || v || d(p, r.default.vErrors);
    }
    e.reportExtraError = n;
    function i(f, y) {
      f.assign(r.default.errors, y), f.if((0, t._)`${r.default.vErrors} !== null`, () => f.if(y, () => f.assign((0, t._)`${r.default.vErrors}.length`, y), () => f.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = i;
    function a({ gen: f, keyword: y, schemaValue: o, data: p, errsCount: E, it: m }) {
      if (E === void 0)
        throw new Error("ajv implementation error");
      const v = f.name("err");
      f.forRange("i", E, r.default.errors, (P) => {
        f.const(v, (0, t._)`${r.default.vErrors}[${P}]`), f.if((0, t._)`${v}.instancePath === undefined`, () => f.assign((0, t._)`${v}.instancePath`, (0, t.strConcat)(r.default.instancePath, m.errorPath))), f.assign((0, t._)`${v}.schemaPath`, (0, t.str)`${m.errSchemaPath}/${y}`), m.opts.verbose && (f.assign((0, t._)`${v}.schema`, o), f.assign((0, t._)`${v}.data`, p));
      });
    }
    e.extendErrors = a;
    function u(f, y) {
      const o = f.const("err", y);
      f.if((0, t._)`${r.default.vErrors} === null`, () => f.assign(r.default.vErrors, (0, t._)`[${o}]`), (0, t._)`${r.default.vErrors}.push(${o})`), f.code((0, t._)`${r.default.errors}++`);
    }
    function d(f, y) {
      const { gen: o, validateName: p, schemaEnv: E } = f;
      E.$async ? o.throw((0, t._)`new ${f.ValidationError}(${y})`) : (o.assign((0, t._)`${p}.errors`, y), o.return(!1));
    }
    const c = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function $(f, y, o) {
      const { createErrors: p } = f.it;
      return p === !1 ? (0, t._)`{}` : g(f, y, o);
    }
    function g(f, y, o = {}) {
      const { gen: p, it: E } = f, m = [
        _(E, o),
        b(f, o)
      ];
      return w(f, y, m), p.object(...m);
    }
    function _({ errorPath: f }, { instancePath: y }) {
      const o = y ? (0, t.str)`${f}${(0, s.getErrorPath)(y, s.Type.Str)}` : f;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, o)];
    }
    function b({ keyword: f, it: { errSchemaPath: y } }, { schemaPath: o, parentSchema: p }) {
      let E = p ? y : (0, t.str)`${y}/${f}`;
      return o && (E = (0, t.str)`${E}${(0, s.getErrorPath)(o, s.Type.Str)}`), [c.schemaPath, E];
    }
    function w(f, { params: y, message: o }, p) {
      const { keyword: E, data: m, schemaValue: v, it: P } = f, { opts: T, propertyName: C, topSchemaRef: V, schemaPath: D } = P;
      p.push([c.keyword, E], [c.params, typeof y == "function" ? y(f) : y || (0, t._)`{}`]), T.messages && p.push([c.message, typeof o == "function" ? o(f) : o]), T.verbose && p.push([c.schema, v], [c.parentSchema, (0, t._)`${V}${D}`], [r.default.data, m]), C && p.push([c.propertyName, C]);
    }
  })(ns)), ns;
}
var ii;
function Cf() {
  if (ii) return ut;
  ii = 1, Object.defineProperty(ut, "__esModule", { value: !0 }), ut.boolOrEmptySchema = ut.topBoolOrEmptySchema = void 0;
  const e = Tn(), t = ne(), s = rt(), r = {
    message: "boolean schema is false"
  };
  function l(a) {
    const { gen: u, schema: d, validateName: c } = a;
    d === !1 ? i(a, !1) : typeof d == "object" && d.$async === !0 ? u.return(s.default.data) : (u.assign((0, t._)`${c}.errors`, null), u.return(!0));
  }
  ut.topBoolOrEmptySchema = l;
  function n(a, u) {
    const { gen: d, schema: c } = a;
    c === !1 ? (d.var(u, !1), i(a)) : d.var(u, !0);
  }
  ut.boolOrEmptySchema = n;
  function i(a, u) {
    const { gen: d, data: c } = a, $ = {
      gen: d,
      keyword: "false schema",
      data: c,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: a
    };
    (0, e.reportError)($, r, void 0, u);
  }
  return ut;
}
var ve = {}, lt = {}, ci;
function Ou() {
  if (ci) return lt;
  ci = 1, Object.defineProperty(lt, "__esModule", { value: !0 }), lt.getRules = lt.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function s(l) {
    return typeof l == "string" && t.has(l);
  }
  lt.isJSONType = s;
  function r() {
    const l = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...l, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, l.number, l.string, l.array, l.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return lt.getRules = r, lt;
}
var He = {}, ui;
function Iu() {
  if (ui) return He;
  ui = 1, Object.defineProperty(He, "__esModule", { value: !0 }), He.shouldUseRule = He.shouldUseGroup = He.schemaHasRulesForType = void 0;
  function e({ schema: r, self: l }, n) {
    const i = l.RULES.types[n];
    return i && i !== !0 && t(r, i);
  }
  He.schemaHasRulesForType = e;
  function t(r, l) {
    return l.rules.some((n) => s(r, n));
  }
  He.shouldUseGroup = t;
  function s(r, l) {
    var n;
    return r[l.keyword] !== void 0 || ((n = l.definition.implements) === null || n === void 0 ? void 0 : n.some((i) => r[i] !== void 0));
  }
  return He.shouldUseRule = s, He;
}
var li;
function En() {
  if (li) return ve;
  li = 1, Object.defineProperty(ve, "__esModule", { value: !0 }), ve.reportTypeError = ve.checkDataTypes = ve.checkDataType = ve.coerceAndCheckDataType = ve.getJSONTypes = ve.getSchemaTypes = ve.DataType = void 0;
  const e = Ou(), t = Iu(), s = Tn(), r = ne(), l = ie();
  var n;
  (function(o) {
    o[o.Correct = 0] = "Correct", o[o.Wrong = 1] = "Wrong";
  })(n || (ve.DataType = n = {}));
  function i(o) {
    const p = a(o.type);
    if (p.includes("null")) {
      if (o.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!p.length && o.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      o.nullable === !0 && p.push("null");
    }
    return p;
  }
  ve.getSchemaTypes = i;
  function a(o) {
    const p = Array.isArray(o) ? o : o ? [o] : [];
    if (p.every(e.isJSONType))
      return p;
    throw new Error("type must be JSONType or JSONType[]: " + p.join(","));
  }
  ve.getJSONTypes = a;
  function u(o, p) {
    const { gen: E, data: m, opts: v } = o, P = c(p, v.coerceTypes), T = p.length > 0 && !(P.length === 0 && p.length === 1 && (0, t.schemaHasRulesForType)(o, p[0]));
    if (T) {
      const C = b(p, m, v.strictNumbers, n.Wrong);
      E.if(C, () => {
        P.length ? $(o, p, P) : f(o);
      });
    }
    return T;
  }
  ve.coerceAndCheckDataType = u;
  const d = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function c(o, p) {
    return p ? o.filter((E) => d.has(E) || p === "array" && E === "array") : [];
  }
  function $(o, p, E) {
    const { gen: m, data: v, opts: P } = o, T = m.let("dataType", (0, r._)`typeof ${v}`), C = m.let("coerced", (0, r._)`undefined`);
    P.coerceTypes === "array" && m.if((0, r._)`${T} == 'object' && Array.isArray(${v}) && ${v}.length == 1`, () => m.assign(v, (0, r._)`${v}[0]`).assign(T, (0, r._)`typeof ${v}`).if(b(p, v, P.strictNumbers), () => m.assign(C, v))), m.if((0, r._)`${C} !== undefined`);
    for (const D of E)
      (d.has(D) || D === "array" && P.coerceTypes === "array") && V(D);
    m.else(), f(o), m.endIf(), m.if((0, r._)`${C} !== undefined`, () => {
      m.assign(v, C), g(o, C);
    });
    function V(D) {
      switch (D) {
        case "string":
          m.elseIf((0, r._)`${T} == "number" || ${T} == "boolean"`).assign(C, (0, r._)`"" + ${v}`).elseIf((0, r._)`${v} === null`).assign(C, (0, r._)`""`);
          return;
        case "number":
          m.elseIf((0, r._)`${T} == "boolean" || ${v} === null
              || (${T} == "string" && ${v} && ${v} == +${v})`).assign(C, (0, r._)`+${v}`);
          return;
        case "integer":
          m.elseIf((0, r._)`${T} === "boolean" || ${v} === null
              || (${T} === "string" && ${v} && ${v} == +${v} && !(${v} % 1))`).assign(C, (0, r._)`+${v}`);
          return;
        case "boolean":
          m.elseIf((0, r._)`${v} === "false" || ${v} === 0 || ${v} === null`).assign(C, !1).elseIf((0, r._)`${v} === "true" || ${v} === 1`).assign(C, !0);
          return;
        case "null":
          m.elseIf((0, r._)`${v} === "" || ${v} === 0 || ${v} === false`), m.assign(C, null);
          return;
        case "array":
          m.elseIf((0, r._)`${T} === "string" || ${T} === "number"
              || ${T} === "boolean" || ${v} === null`).assign(C, (0, r._)`[${v}]`);
      }
    }
  }
  function g({ gen: o, parentData: p, parentDataProperty: E }, m) {
    o.if((0, r._)`${p} !== undefined`, () => o.assign((0, r._)`${p}[${E}]`, m));
  }
  function _(o, p, E, m = n.Correct) {
    const v = m === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let P;
    switch (o) {
      case "null":
        return (0, r._)`${p} ${v} null`;
      case "array":
        P = (0, r._)`Array.isArray(${p})`;
        break;
      case "object":
        P = (0, r._)`${p} && typeof ${p} == "object" && !Array.isArray(${p})`;
        break;
      case "integer":
        P = T((0, r._)`!(${p} % 1) && !isNaN(${p})`);
        break;
      case "number":
        P = T();
        break;
      default:
        return (0, r._)`typeof ${p} ${v} ${o}`;
    }
    return m === n.Correct ? P : (0, r.not)(P);
    function T(C = r.nil) {
      return (0, r.and)((0, r._)`typeof ${p} == "number"`, C, E ? (0, r._)`isFinite(${p})` : r.nil);
    }
  }
  ve.checkDataType = _;
  function b(o, p, E, m) {
    if (o.length === 1)
      return _(o[0], p, E, m);
    let v;
    const P = (0, l.toHash)(o);
    if (P.array && P.object) {
      const T = (0, r._)`typeof ${p} != "object"`;
      v = P.null ? T : (0, r._)`!${p} || ${T}`, delete P.null, delete P.array, delete P.object;
    } else
      v = r.nil;
    P.number && delete P.integer;
    for (const T in P)
      v = (0, r.and)(v, _(T, p, E, m));
    return v;
  }
  ve.checkDataTypes = b;
  const w = {
    message: ({ schema: o }) => `must be ${o}`,
    params: ({ schema: o, schemaValue: p }) => typeof o == "string" ? (0, r._)`{type: ${o}}` : (0, r._)`{type: ${p}}`
  };
  function f(o) {
    const p = y(o);
    (0, s.reportError)(p, w);
  }
  ve.reportTypeError = f;
  function y(o) {
    const { gen: p, data: E, schema: m } = o, v = (0, l.schemaRefOrVal)(o, m, "type");
    return {
      gen: p,
      keyword: "type",
      data: E,
      schema: m.type,
      schemaCode: v,
      schemaValue: v,
      parentSchema: m,
      params: {},
      it: o
    };
  }
  return ve;
}
var Tt = {}, di;
function Df() {
  if (di) return Tt;
  di = 1, Object.defineProperty(Tt, "__esModule", { value: !0 }), Tt.assignDefaults = void 0;
  const e = ne(), t = ie();
  function s(l, n) {
    const { properties: i, items: a } = l.schema;
    if (n === "object" && i)
      for (const u in i)
        r(l, u, i[u].default);
    else n === "array" && Array.isArray(a) && a.forEach((u, d) => r(l, d, u.default));
  }
  Tt.assignDefaults = s;
  function r(l, n, i) {
    const { gen: a, compositeRule: u, data: d, opts: c } = l;
    if (i === void 0)
      return;
    const $ = (0, e._)`${d}${(0, e.getProperty)(n)}`;
    if (u) {
      (0, t.checkStrictMode)(l, `default is ignored for: ${$}`);
      return;
    }
    let g = (0, e._)`${$} === undefined`;
    c.useDefaults === "empty" && (g = (0, e._)`${g} || ${$} === null || ${$} === ""`), a.if(g, (0, e._)`${$} = ${(0, e.stringify)(i)}`);
  }
  return Tt;
}
var ke = {}, fe = {}, fi;
function Me() {
  if (fi) return fe;
  fi = 1, Object.defineProperty(fe, "__esModule", { value: !0 }), fe.validateUnion = fe.validateArray = fe.usePattern = fe.callValidateCode = fe.schemaProperties = fe.allSchemaProperties = fe.noPropertyInData = fe.propertyInData = fe.isOwnProperty = fe.hasPropFunc = fe.reportMissingProp = fe.checkMissingProp = fe.checkReportMissingProp = void 0;
  const e = ne(), t = ie(), s = rt(), r = ie();
  function l(o, p) {
    const { gen: E, data: m, it: v } = o;
    E.if(c(E, m, p, v.opts.ownProperties), () => {
      o.setParams({ missingProperty: (0, e._)`${p}` }, !0), o.error();
    });
  }
  fe.checkReportMissingProp = l;
  function n({ gen: o, data: p, it: { opts: E } }, m, v) {
    return (0, e.or)(...m.map((P) => (0, e.and)(c(o, p, P, E.ownProperties), (0, e._)`${v} = ${P}`)));
  }
  fe.checkMissingProp = n;
  function i(o, p) {
    o.setParams({ missingProperty: p }, !0), o.error();
  }
  fe.reportMissingProp = i;
  function a(o) {
    return o.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  fe.hasPropFunc = a;
  function u(o, p, E) {
    return (0, e._)`${a(o)}.call(${p}, ${E})`;
  }
  fe.isOwnProperty = u;
  function d(o, p, E, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(E)} !== undefined`;
    return m ? (0, e._)`${v} && ${u(o, p, E)}` : v;
  }
  fe.propertyInData = d;
  function c(o, p, E, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(E)} === undefined`;
    return m ? (0, e.or)(v, (0, e.not)(u(o, p, E))) : v;
  }
  fe.noPropertyInData = c;
  function $(o) {
    return o ? Object.keys(o).filter((p) => p !== "__proto__") : [];
  }
  fe.allSchemaProperties = $;
  function g(o, p) {
    return $(p).filter((E) => !(0, t.alwaysValidSchema)(o, p[E]));
  }
  fe.schemaProperties = g;
  function _({ schemaCode: o, data: p, it: { gen: E, topSchemaRef: m, schemaPath: v, errorPath: P }, it: T }, C, V, D) {
    const z = D ? (0, e._)`${o}, ${p}, ${m}${v}` : p, U = [
      [s.default.instancePath, (0, e.strConcat)(s.default.instancePath, P)],
      [s.default.parentData, T.parentData],
      [s.default.parentDataProperty, T.parentDataProperty],
      [s.default.rootData, s.default.rootData]
    ];
    T.opts.dynamicRef && U.push([s.default.dynamicAnchors, s.default.dynamicAnchors]);
    const M = (0, e._)`${z}, ${E.object(...U)}`;
    return V !== e.nil ? (0, e._)`${C}.call(${V}, ${M})` : (0, e._)`${C}(${M})`;
  }
  fe.callValidateCode = _;
  const b = (0, e._)`new RegExp`;
  function w({ gen: o, it: { opts: p } }, E) {
    const m = p.unicodeRegExp ? "u" : "", { regExp: v } = p.code, P = v(E, m);
    return o.scopeValue("pattern", {
      key: P.toString(),
      ref: P,
      code: (0, e._)`${v.code === "new RegExp" ? b : (0, r.useFunc)(o, v)}(${E}, ${m})`
    });
  }
  fe.usePattern = w;
  function f(o) {
    const { gen: p, data: E, keyword: m, it: v } = o, P = p.name("valid");
    if (v.allErrors) {
      const C = p.let("valid", !0);
      return T(() => p.assign(C, !1)), C;
    }
    return p.var(P, !0), T(() => p.break()), P;
    function T(C) {
      const V = p.const("len", (0, e._)`${E}.length`);
      p.forRange("i", 0, V, (D) => {
        o.subschema({
          keyword: m,
          dataProp: D,
          dataPropType: t.Type.Num
        }, P), p.if((0, e.not)(P), C);
      });
    }
  }
  fe.validateArray = f;
  function y(o) {
    const { gen: p, schema: E, keyword: m, it: v } = o;
    if (!Array.isArray(E))
      throw new Error("ajv implementation error");
    if (E.some((V) => (0, t.alwaysValidSchema)(v, V)) && !v.opts.unevaluated)
      return;
    const T = p.let("valid", !1), C = p.name("_valid");
    p.block(() => E.forEach((V, D) => {
      const z = o.subschema({
        keyword: m,
        schemaProp: D,
        compositeRule: !0
      }, C);
      p.assign(T, (0, e._)`${T} || ${C}`), o.mergeValidEvaluated(z, C) || p.if((0, e.not)(T));
    })), o.result(T, () => o.reset(), () => o.error(!0));
  }
  return fe.validateUnion = y, fe;
}
var hi;
function Mf() {
  if (hi) return ke;
  hi = 1, Object.defineProperty(ke, "__esModule", { value: !0 }), ke.validateKeywordUsage = ke.validSchemaType = ke.funcKeywordCode = ke.macroKeywordCode = void 0;
  const e = ne(), t = rt(), s = Me(), r = Tn();
  function l(g, _) {
    const { gen: b, keyword: w, schema: f, parentSchema: y, it: o } = g, p = _.macro.call(o.self, f, y, o), E = d(b, w, p);
    o.opts.validateSchema !== !1 && o.self.validateSchema(p, !0);
    const m = b.name("valid");
    g.subschema({
      schema: p,
      schemaPath: e.nil,
      errSchemaPath: `${o.errSchemaPath}/${w}`,
      topSchemaRef: E,
      compositeRule: !0
    }, m), g.pass(m, () => g.error(!0));
  }
  ke.macroKeywordCode = l;
  function n(g, _) {
    var b;
    const { gen: w, keyword: f, schema: y, parentSchema: o, $data: p, it: E } = g;
    u(E, _);
    const m = !p && _.compile ? _.compile.call(E.self, y, o, E) : _.validate, v = d(w, f, m), P = w.let("valid");
    g.block$data(P, T), g.ok((b = _.valid) !== null && b !== void 0 ? b : P);
    function T() {
      if (_.errors === !1)
        D(), _.modifying && i(g), z(() => g.error());
      else {
        const U = _.async ? C() : V();
        _.modifying && i(g), z(() => a(g, U));
      }
    }
    function C() {
      const U = w.let("ruleErrs", null);
      return w.try(() => D((0, e._)`await `), (M) => w.assign(P, !1).if((0, e._)`${M} instanceof ${E.ValidationError}`, () => w.assign(U, (0, e._)`${M}.errors`), () => w.throw(M))), U;
    }
    function V() {
      const U = (0, e._)`${v}.errors`;
      return w.assign(U, null), D(e.nil), U;
    }
    function D(U = _.async ? (0, e._)`await ` : e.nil) {
      const M = E.opts.passContext ? t.default.this : t.default.self, F = !("compile" in _ && !p || _.schema === !1);
      w.assign(P, (0, e._)`${U}${(0, s.callValidateCode)(g, v, M, F)}`, _.modifying);
    }
    function z(U) {
      var M;
      w.if((0, e.not)((M = _.valid) !== null && M !== void 0 ? M : P), U);
    }
  }
  ke.funcKeywordCode = n;
  function i(g) {
    const { gen: _, data: b, it: w } = g;
    _.if(w.parentData, () => _.assign(b, (0, e._)`${w.parentData}[${w.parentDataProperty}]`));
  }
  function a(g, _) {
    const { gen: b } = g;
    b.if((0, e._)`Array.isArray(${_})`, () => {
      b.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${_} : ${t.default.vErrors}.concat(${_})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(g);
    }, () => g.error());
  }
  function u({ schemaEnv: g }, _) {
    if (_.async && !g.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(g, _, b) {
    if (b === void 0)
      throw new Error(`keyword "${_}" failed to compile`);
    return g.scopeValue("keyword", typeof b == "function" ? { ref: b } : { ref: b, code: (0, e.stringify)(b) });
  }
  function c(g, _, b = !1) {
    return !_.length || _.some((w) => w === "array" ? Array.isArray(g) : w === "object" ? g && typeof g == "object" && !Array.isArray(g) : typeof g == w || b && typeof g > "u");
  }
  ke.validSchemaType = c;
  function $({ schema: g, opts: _, self: b, errSchemaPath: w }, f, y) {
    if (Array.isArray(f.keyword) ? !f.keyword.includes(y) : f.keyword !== y)
      throw new Error("ajv implementation error");
    const o = f.dependencies;
    if (o?.some((p) => !Object.prototype.hasOwnProperty.call(g, p)))
      throw new Error(`parent schema must have dependencies of ${y}: ${o.join(",")}`);
    if (f.validateSchema && !f.validateSchema(g[y])) {
      const E = `keyword "${y}" value is invalid at path "${w}": ` + b.errorsText(f.validateSchema.errors);
      if (_.validateSchema === "log")
        b.logger.error(E);
      else
        throw new Error(E);
    }
  }
  return ke.validateKeywordUsage = $, ke;
}
var Je = {}, mi;
function Lf() {
  if (mi) return Je;
  mi = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.extendSubschemaMode = Je.extendSubschemaData = Je.getSubschema = void 0;
  const e = ne(), t = ie();
  function s(n, { keyword: i, schemaProp: a, schema: u, schemaPath: d, errSchemaPath: c, topSchemaRef: $ }) {
    if (i !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const g = n.schema[i];
      return a === void 0 ? {
        schema: g,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}`
      } : {
        schema: g[a],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(a)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}/${(0, t.escapeFragment)(a)}`
      };
    }
    if (u !== void 0) {
      if (d === void 0 || c === void 0 || $ === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: d,
        topSchemaRef: $,
        errSchemaPath: c
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Je.getSubschema = s;
  function r(n, i, { dataProp: a, dataPropType: u, data: d, dataTypes: c, propertyName: $ }) {
    if (d !== void 0 && a !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: g } = i;
    if (a !== void 0) {
      const { errorPath: b, dataPathArr: w, opts: f } = i, y = g.let("data", (0, e._)`${i.data}${(0, e.getProperty)(a)}`, !0);
      _(y), n.errorPath = (0, e.str)`${b}${(0, t.getErrorPath)(a, u, f.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${a}`, n.dataPathArr = [...w, n.parentDataProperty];
    }
    if (d !== void 0) {
      const b = d instanceof e.Name ? d : g.let("data", d, !0);
      _(b), $ !== void 0 && (n.propertyName = $);
    }
    c && (n.dataTypes = c);
    function _(b) {
      n.data = b, n.dataLevel = i.dataLevel + 1, n.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), n.parentData = i.data, n.dataNames = [...i.dataNames, b];
    }
  }
  Je.extendSubschemaData = r;
  function l(n, { jtdDiscriminator: i, jtdMetadata: a, compositeRule: u, createErrors: d, allErrors: c }) {
    u !== void 0 && (n.compositeRule = u), d !== void 0 && (n.createErrors = d), c !== void 0 && (n.allErrors = c), n.jtdDiscriminator = i, n.jtdMetadata = a;
  }
  return Je.extendSubschemaMode = l, Je;
}
var Se = {}, is = { exports: {} }, pi;
function Vf() {
  if (pi) return is.exports;
  pi = 1;
  var e = is.exports = function(r, l, n) {
    typeof l == "function" && (n = l, l = {}), n = l.cb || n;
    var i = typeof n == "function" ? n : n.pre || function() {
    }, a = n.post || function() {
    };
    t(l, i, a, r, "", r);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(r, l, n, i, a, u, d, c, $, g) {
    if (i && typeof i == "object" && !Array.isArray(i)) {
      l(i, a, u, d, c, $, g);
      for (var _ in i) {
        var b = i[_];
        if (Array.isArray(b)) {
          if (_ in e.arrayKeywords)
            for (var w = 0; w < b.length; w++)
              t(r, l, n, b[w], a + "/" + _ + "/" + w, u, a, _, i, w);
        } else if (_ in e.propsKeywords) {
          if (b && typeof b == "object")
            for (var f in b)
              t(r, l, n, b[f], a + "/" + _ + "/" + s(f), u, a, _, i, f);
        } else (_ in e.keywords || r.allKeys && !(_ in e.skipKeywords)) && t(r, l, n, b, a + "/" + _, u, a, _, i);
      }
      n(i, a, u, d, c, $, g);
    }
  }
  function s(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return is.exports;
}
var yi;
function jn() {
  if (yi) return Se;
  yi = 1, Object.defineProperty(Se, "__esModule", { value: !0 }), Se.getSchemaRefs = Se.resolveUrl = Se.normalizeId = Se._getFullPath = Se.getFullPath = Se.inlineRef = void 0;
  const e = ie(), t = Pn(), s = Vf(), r = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function l(w, f = !0) {
    return typeof w == "boolean" ? !0 : f === !0 ? !i(w) : f ? a(w) <= f : !1;
  }
  Se.inlineRef = l;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function i(w) {
    for (const f in w) {
      if (n.has(f))
        return !0;
      const y = w[f];
      if (Array.isArray(y) && y.some(i) || typeof y == "object" && i(y))
        return !0;
    }
    return !1;
  }
  function a(w) {
    let f = 0;
    for (const y in w) {
      if (y === "$ref")
        return 1 / 0;
      if (f++, !r.has(y) && (typeof w[y] == "object" && (0, e.eachItem)(w[y], (o) => f += a(o)), f === 1 / 0))
        return 1 / 0;
    }
    return f;
  }
  function u(w, f = "", y) {
    y !== !1 && (f = $(f));
    const o = w.parse(f);
    return d(w, o);
  }
  Se.getFullPath = u;
  function d(w, f) {
    return w.serialize(f).split("#")[0] + "#";
  }
  Se._getFullPath = d;
  const c = /#\/?$/;
  function $(w) {
    return w ? w.replace(c, "") : "";
  }
  Se.normalizeId = $;
  function g(w, f, y) {
    return y = $(y), w.resolve(f, y);
  }
  Se.resolveUrl = g;
  const _ = /^[a-z_][-a-z0-9._]*$/i;
  function b(w, f) {
    if (typeof w == "boolean")
      return {};
    const { schemaId: y, uriResolver: o } = this.opts, p = $(w[y] || f), E = { "": p }, m = u(o, p, !1), v = {}, P = /* @__PURE__ */ new Set();
    return s(w, { allKeys: !0 }, (V, D, z, U) => {
      if (U === void 0)
        return;
      const M = m + D;
      let F = E[U];
      typeof V[y] == "string" && (F = W.call(this, V[y])), B.call(this, V.$anchor), B.call(this, V.$dynamicAnchor), E[D] = F;
      function W(J) {
        const Y = this.opts.uriResolver.resolve;
        if (J = $(F ? Y(F, J) : J), P.has(J))
          throw C(J);
        P.add(J);
        let k = this.refs[J];
        return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? T(V, k.schema, J) : J !== $(M) && (J[0] === "#" ? (T(V, v[J], J), v[J] = V) : this.refs[J] = M), J;
      }
      function B(J) {
        if (typeof J == "string") {
          if (!_.test(J))
            throw new Error(`invalid anchor "${J}"`);
          W.call(this, `#${J}`);
        }
      }
    }), v;
    function T(V, D, z) {
      if (D !== void 0 && !t(V, D))
        throw C(z);
    }
    function C(V) {
      return new Error(`reference "${V}" resolves to more than one schema`);
    }
  }
  return Se.getSchemaRefs = b, Se;
}
var vi;
function An() {
  if (vi) return Ge;
  vi = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.getData = Ge.KeywordCxt = Ge.validateFunctionCode = void 0;
  const e = Cf(), t = En(), s = Iu(), r = En(), l = Df(), n = Mf(), i = Lf(), a = ne(), u = rt(), d = jn(), c = ie(), $ = Tn();
  function g(R) {
    if (m(R) && (P(R), E(R))) {
      f(R);
      return;
    }
    _(R, () => (0, e.topBoolOrEmptySchema)(R));
  }
  Ge.validateFunctionCode = g;
  function _({ gen: R, validateName: I, schema: q, schemaEnv: L, opts: G }, X) {
    G.code.es5 ? R.func(I, (0, a._)`${u.default.data}, ${u.default.valCxt}`, L.$async, () => {
      R.code((0, a._)`"use strict"; ${o(q, G)}`), w(R, G), R.code(X);
    }) : R.func(I, (0, a._)`${u.default.data}, ${b(G)}`, L.$async, () => R.code(o(q, G)).code(X));
  }
  function b(R) {
    return (0, a._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${R.dynamicRef ? (0, a._)`, ${u.default.dynamicAnchors}={}` : a.nil}}={}`;
  }
  function w(R, I) {
    R.if(u.default.valCxt, () => {
      R.var(u.default.instancePath, (0, a._)`${u.default.valCxt}.${u.default.instancePath}`), R.var(u.default.parentData, (0, a._)`${u.default.valCxt}.${u.default.parentData}`), R.var(u.default.parentDataProperty, (0, a._)`${u.default.valCxt}.${u.default.parentDataProperty}`), R.var(u.default.rootData, (0, a._)`${u.default.valCxt}.${u.default.rootData}`), I.dynamicRef && R.var(u.default.dynamicAnchors, (0, a._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      R.var(u.default.instancePath, (0, a._)`""`), R.var(u.default.parentData, (0, a._)`undefined`), R.var(u.default.parentDataProperty, (0, a._)`undefined`), R.var(u.default.rootData, u.default.data), I.dynamicRef && R.var(u.default.dynamicAnchors, (0, a._)`{}`);
    });
  }
  function f(R) {
    const { schema: I, opts: q, gen: L } = R;
    _(R, () => {
      q.$comment && I.$comment && U(R), V(R), L.let(u.default.vErrors, null), L.let(u.default.errors, 0), q.unevaluated && y(R), T(R), M(R);
    });
  }
  function y(R) {
    const { gen: I, validateName: q } = R;
    R.evaluated = I.const("evaluated", (0, a._)`${q}.evaluated`), I.if((0, a._)`${R.evaluated}.dynamicProps`, () => I.assign((0, a._)`${R.evaluated}.props`, (0, a._)`undefined`)), I.if((0, a._)`${R.evaluated}.dynamicItems`, () => I.assign((0, a._)`${R.evaluated}.items`, (0, a._)`undefined`));
  }
  function o(R, I) {
    const q = typeof R == "object" && R[I.schemaId];
    return q && (I.code.source || I.code.process) ? (0, a._)`/*# sourceURL=${q} */` : a.nil;
  }
  function p(R, I) {
    if (m(R) && (P(R), E(R))) {
      v(R, I);
      return;
    }
    (0, e.boolOrEmptySchema)(R, I);
  }
  function E({ schema: R, self: I }) {
    if (typeof R == "boolean")
      return !R;
    for (const q in R)
      if (I.RULES.all[q])
        return !0;
    return !1;
  }
  function m(R) {
    return typeof R.schema != "boolean";
  }
  function v(R, I) {
    const { schema: q, gen: L, opts: G } = R;
    G.$comment && q.$comment && U(R), D(R), z(R);
    const X = L.const("_errs", u.default.errors);
    T(R, X), L.var(I, (0, a._)`${X} === ${u.default.errors}`);
  }
  function P(R) {
    (0, c.checkUnknownRules)(R), C(R);
  }
  function T(R, I) {
    if (R.opts.jtd)
      return W(R, [], !1, I);
    const q = (0, t.getSchemaTypes)(R.schema), L = (0, t.coerceAndCheckDataType)(R, q);
    W(R, q, !L, I);
  }
  function C(R) {
    const { schema: I, errSchemaPath: q, opts: L, self: G } = R;
    I.$ref && L.ignoreKeywordsWithRef && (0, c.schemaHasRulesButRef)(I, G.RULES) && G.logger.warn(`$ref: keywords ignored in schema at path "${q}"`);
  }
  function V(R) {
    const { schema: I, opts: q } = R;
    I.default !== void 0 && q.useDefaults && q.strictSchema && (0, c.checkStrictMode)(R, "default is ignored in the schema root");
  }
  function D(R) {
    const I = R.schema[R.opts.schemaId];
    I && (R.baseId = (0, d.resolveUrl)(R.opts.uriResolver, R.baseId, I));
  }
  function z(R) {
    if (R.schema.$async && !R.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function U({ gen: R, schemaEnv: I, schema: q, errSchemaPath: L, opts: G }) {
    const X = q.$comment;
    if (G.$comment === !0)
      R.code((0, a._)`${u.default.self}.logger.log(${X})`);
    else if (typeof G.$comment == "function") {
      const ae = (0, a.str)`${L}/$comment`, pe = R.scopeValue("root", { ref: I.root });
      R.code((0, a._)`${u.default.self}.opts.$comment(${X}, ${ae}, ${pe}.schema)`);
    }
  }
  function M(R) {
    const { gen: I, schemaEnv: q, validateName: L, ValidationError: G, opts: X } = R;
    q.$async ? I.if((0, a._)`${u.default.errors} === 0`, () => I.return(u.default.data), () => I.throw((0, a._)`new ${G}(${u.default.vErrors})`)) : (I.assign((0, a._)`${L}.errors`, u.default.vErrors), X.unevaluated && F(R), I.return((0, a._)`${u.default.errors} === 0`));
  }
  function F({ gen: R, evaluated: I, props: q, items: L }) {
    q instanceof a.Name && R.assign((0, a._)`${I}.props`, q), L instanceof a.Name && R.assign((0, a._)`${I}.items`, L);
  }
  function W(R, I, q, L) {
    const { gen: G, schema: X, data: ae, allErrors: pe, opts: ue, self: le } = R, { RULES: oe } = le;
    if (X.$ref && (ue.ignoreKeywordsWithRef || !(0, c.schemaHasRulesButRef)(X, oe))) {
      G.block(() => K(R, "$ref", oe.all.$ref.definition));
      return;
    }
    ue.jtd || J(R, I), G.block(() => {
      for (const he of oe.rules)
        Re(he);
      Re(oe.post);
    });
    function Re(he) {
      (0, s.shouldUseGroup)(X, he) && (he.type ? (G.if((0, r.checkDataType)(he.type, ae, ue.strictNumbers)), B(R, he), I.length === 1 && I[0] === he.type && q && (G.else(), (0, r.reportTypeError)(R)), G.endIf()) : B(R, he), pe || G.if((0, a._)`${u.default.errors} === ${L || 0}`));
    }
  }
  function B(R, I) {
    const { gen: q, schema: L, opts: { useDefaults: G } } = R;
    G && (0, l.assignDefaults)(R, I.type), q.block(() => {
      for (const X of I.rules)
        (0, s.shouldUseRule)(L, X) && K(R, X.keyword, X.definition, I.type);
    });
  }
  function J(R, I) {
    R.schemaEnv.meta || !R.opts.strictTypes || (Y(R, I), R.opts.allowUnionTypes || k(R, I), N(R, R.dataTypes));
  }
  function Y(R, I) {
    if (I.length) {
      if (!R.dataTypes.length) {
        R.dataTypes = I;
        return;
      }
      I.forEach((q) => {
        O(R.dataTypes, q) || S(R, `type "${q}" not allowed by context "${R.dataTypes.join(",")}"`);
      }), h(R, I);
    }
  }
  function k(R, I) {
    I.length > 1 && !(I.length === 2 && I.includes("null")) && S(R, "use allowUnionTypes to allow union type keyword");
  }
  function N(R, I) {
    const q = R.self.RULES.all;
    for (const L in q) {
      const G = q[L];
      if (typeof G == "object" && (0, s.shouldUseRule)(R.schema, G)) {
        const { type: X } = G.definition;
        X.length && !X.some((ae) => A(I, ae)) && S(R, `missing type "${X.join(",")}" for keyword "${L}"`);
      }
    }
  }
  function A(R, I) {
    return R.includes(I) || I === "number" && R.includes("integer");
  }
  function O(R, I) {
    return R.includes(I) || I === "integer" && R.includes("number");
  }
  function h(R, I) {
    const q = [];
    for (const L of R.dataTypes)
      O(I, L) ? q.push(L) : I.includes("integer") && L === "number" && q.push("integer");
    R.dataTypes = q;
  }
  function S(R, I) {
    const q = R.schemaEnv.baseId + R.errSchemaPath;
    I += ` at "${q}" (strictTypes)`, (0, c.checkStrictMode)(R, I, R.opts.strictTypes);
  }
  class j {
    constructor(I, q, L) {
      if ((0, n.validateKeywordUsage)(I, q, L), this.gen = I.gen, this.allErrors = I.allErrors, this.keyword = L, this.data = I.data, this.schema = I.schema[L], this.$data = q.$data && I.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, c.schemaRefOrVal)(I, this.schema, L, this.$data), this.schemaType = q.schemaType, this.parentSchema = I.schema, this.params = {}, this.it = I, this.def = q, this.$data)
        this.schemaCode = I.gen.const("vSchema", Q(this.$data, I));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, q.schemaType, q.allowUndefined))
        throw new Error(`${L} value must be ${JSON.stringify(q.schemaType)}`);
      ("code" in q ? q.trackErrors : q.errors !== !1) && (this.errsCount = I.gen.const("_errs", u.default.errors));
    }
    result(I, q, L) {
      this.failResult((0, a.not)(I), q, L);
    }
    failResult(I, q, L) {
      this.gen.if(I), L ? L() : this.error(), q ? (this.gen.else(), q(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(I, q) {
      this.failResult((0, a.not)(I), void 0, q);
    }
    fail(I) {
      if (I === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(I), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(I) {
      if (!this.$data)
        return this.fail(I);
      const { schemaCode: q } = this;
      this.fail((0, a._)`${q} !== undefined && (${(0, a.or)(this.invalid$data(), I)})`);
    }
    error(I, q, L) {
      if (q) {
        this.setParams(q), this._error(I, L), this.setParams({});
        return;
      }
      this._error(I, L);
    }
    _error(I, q) {
      (I ? $.reportExtraError : $.reportError)(this, this.def.error, q);
    }
    $dataError() {
      (0, $.reportError)(this, this.def.$dataError || $.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, $.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(I) {
      this.allErrors || this.gen.if(I);
    }
    setParams(I, q) {
      q ? Object.assign(this.params, I) : this.params = I;
    }
    block$data(I, q, L = a.nil) {
      this.gen.block(() => {
        this.check$data(I, L), q();
      });
    }
    check$data(I = a.nil, q = a.nil) {
      if (!this.$data)
        return;
      const { gen: L, schemaCode: G, schemaType: X, def: ae } = this;
      L.if((0, a.or)((0, a._)`${G} === undefined`, q)), I !== a.nil && L.assign(I, !0), (X.length || ae.validateSchema) && (L.elseIf(this.invalid$data()), this.$dataError(), I !== a.nil && L.assign(I, !1)), L.else();
    }
    invalid$data() {
      const { gen: I, schemaCode: q, schemaType: L, def: G, it: X } = this;
      return (0, a.or)(ae(), pe());
      function ae() {
        if (L.length) {
          if (!(q instanceof a.Name))
            throw new Error("ajv implementation error");
          const ue = Array.isArray(L) ? L : [L];
          return (0, a._)`${(0, r.checkDataTypes)(ue, q, X.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return a.nil;
      }
      function pe() {
        if (G.validateSchema) {
          const ue = I.scopeValue("validate$data", { ref: G.validateSchema });
          return (0, a._)`!${ue}(${q})`;
        }
        return a.nil;
      }
    }
    subschema(I, q) {
      const L = (0, i.getSubschema)(this.it, I);
      (0, i.extendSubschemaData)(L, this.it, I), (0, i.extendSubschemaMode)(L, I);
      const G = { ...this.it, ...L, items: void 0, props: void 0 };
      return p(G, q), G;
    }
    mergeEvaluated(I, q) {
      const { it: L, gen: G } = this;
      L.opts.unevaluated && (L.props !== !0 && I.props !== void 0 && (L.props = c.mergeEvaluated.props(G, I.props, L.props, q)), L.items !== !0 && I.items !== void 0 && (L.items = c.mergeEvaluated.items(G, I.items, L.items, q)));
    }
    mergeValidEvaluated(I, q) {
      const { it: L, gen: G } = this;
      if (L.opts.unevaluated && (L.props !== !0 || L.items !== !0))
        return G.if(q, () => this.mergeEvaluated(I, a.Name)), !0;
    }
  }
  Ge.KeywordCxt = j;
  function K(R, I, q, L) {
    const G = new j(R, q, I);
    "code" in q ? q.code(G, L) : G.$data && q.validate ? (0, n.funcKeywordCode)(G, q) : "macro" in q ? (0, n.macroKeywordCode)(G, q) : (q.compile || q.validate) && (0, n.funcKeywordCode)(G, q);
  }
  const H = /^\/(?:[^~]|~0|~1)*$/, Z = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Q(R, { dataLevel: I, dataNames: q, dataPathArr: L }) {
    let G, X;
    if (R === "")
      return u.default.rootData;
    if (R[0] === "/") {
      if (!H.test(R))
        throw new Error(`Invalid JSON-pointer: ${R}`);
      G = R, X = u.default.rootData;
    } else {
      const le = Z.exec(R);
      if (!le)
        throw new Error(`Invalid JSON-pointer: ${R}`);
      const oe = +le[1];
      if (G = le[2], G === "#") {
        if (oe >= I)
          throw new Error(ue("property/index", oe));
        return L[I - oe];
      }
      if (oe > I)
        throw new Error(ue("data", oe));
      if (X = q[I - oe], !G)
        return X;
    }
    let ae = X;
    const pe = G.split("/");
    for (const le of pe)
      le && (X = (0, a._)`${X}${(0, a.getProperty)((0, c.unescapeJsonPointer)(le))}`, ae = (0, a._)`${ae} && ${X}`);
    return ae;
    function ue(le, oe) {
      return `Cannot access ${le} ${oe} levels up, current level is ${I}`;
    }
  }
  return Ge.getData = Q, Ge;
}
var kr = {}, gi;
function da() {
  if (gi) return kr;
  gi = 1, Object.defineProperty(kr, "__esModule", { value: !0 });
  class e extends Error {
    constructor(s) {
      super("validation failed"), this.errors = s, this.ajv = this.validation = !0;
    }
  }
  return kr.default = e, kr;
}
var qr = {}, _i;
function kn() {
  if (_i) return qr;
  _i = 1, Object.defineProperty(qr, "__esModule", { value: !0 });
  const e = jn();
  class t extends Error {
    constructor(r, l, n, i) {
      super(i || `can't resolve reference ${n} from id ${l}`), this.missingRef = (0, e.resolveUrl)(r, l, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return qr.default = t, qr;
}
var Ie = {}, $i;
function fa() {
  if ($i) return Ie;
  $i = 1, Object.defineProperty(Ie, "__esModule", { value: !0 }), Ie.resolveSchema = Ie.getCompilingSchema = Ie.resolveRef = Ie.compileSchema = Ie.SchemaEnv = void 0;
  const e = ne(), t = da(), s = rt(), r = jn(), l = ie(), n = An();
  class i {
    constructor(y) {
      var o;
      this.refs = {}, this.dynamicAnchors = {};
      let p;
      typeof y.schema == "object" && (p = y.schema), this.schema = y.schema, this.schemaId = y.schemaId, this.root = y.root || this, this.baseId = (o = y.baseId) !== null && o !== void 0 ? o : (0, r.normalizeId)(p?.[y.schemaId || "$id"]), this.schemaPath = y.schemaPath, this.localRefs = y.localRefs, this.meta = y.meta, this.$async = p?.$async, this.refs = {};
    }
  }
  Ie.SchemaEnv = i;
  function a(f) {
    const y = c.call(this, f);
    if (y)
      return y;
    const o = (0, r.getFullPath)(this.opts.uriResolver, f.root.baseId), { es5: p, lines: E } = this.opts.code, { ownProperties: m } = this.opts, v = new e.CodeGen(this.scope, { es5: p, lines: E, ownProperties: m });
    let P;
    f.$async && (P = v.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const T = v.scopeName("validate");
    f.validateName = T;
    const C = {
      gen: v,
      allErrors: this.opts.allErrors,
      data: s.default.data,
      parentData: s.default.parentData,
      parentDataProperty: s.default.parentDataProperty,
      dataNames: [s.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: v.scopeValue("schema", this.opts.code.source === !0 ? { ref: f.schema, code: (0, e.stringify)(f.schema) } : { ref: f.schema }),
      validateName: T,
      ValidationError: P,
      schema: f.schema,
      schemaEnv: f,
      rootId: o,
      baseId: f.baseId || o,
      schemaPath: e.nil,
      errSchemaPath: f.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let V;
    try {
      this._compilations.add(f), (0, n.validateFunctionCode)(C), v.optimize(this.opts.code.optimize);
      const D = v.toString();
      V = `${v.scopeRefs(s.default.scope)}return ${D}`, this.opts.code.process && (V = this.opts.code.process(V, f));
      const U = new Function(`${s.default.self}`, `${s.default.scope}`, V)(this, this.scope.get());
      if (this.scope.value(T, { ref: U }), U.errors = null, U.schema = f.schema, U.schemaEnv = f, f.$async && (U.$async = !0), this.opts.code.source === !0 && (U.source = { validateName: T, validateCode: D, scopeValues: v._values }), this.opts.unevaluated) {
        const { props: M, items: F } = C;
        U.evaluated = {
          props: M instanceof e.Name ? void 0 : M,
          items: F instanceof e.Name ? void 0 : F,
          dynamicProps: M instanceof e.Name,
          dynamicItems: F instanceof e.Name
        }, U.source && (U.source.evaluated = (0, e.stringify)(U.evaluated));
      }
      return f.validate = U, f;
    } catch (D) {
      throw delete f.validate, delete f.validateName, V && this.logger.error("Error compiling schema, function code:", V), D;
    } finally {
      this._compilations.delete(f);
    }
  }
  Ie.compileSchema = a;
  function u(f, y, o) {
    var p;
    o = (0, r.resolveUrl)(this.opts.uriResolver, y, o);
    const E = f.refs[o];
    if (E)
      return E;
    let m = g.call(this, f, o);
    if (m === void 0) {
      const v = (p = f.localRefs) === null || p === void 0 ? void 0 : p[o], { schemaId: P } = this.opts;
      v && (m = new i({ schema: v, schemaId: P, root: f, baseId: y }));
    }
    if (m !== void 0)
      return f.refs[o] = d.call(this, m);
  }
  Ie.resolveRef = u;
  function d(f) {
    return (0, r.inlineRef)(f.schema, this.opts.inlineRefs) ? f.schema : f.validate ? f : a.call(this, f);
  }
  function c(f) {
    for (const y of this._compilations)
      if ($(y, f))
        return y;
  }
  Ie.getCompilingSchema = c;
  function $(f, y) {
    return f.schema === y.schema && f.root === y.root && f.baseId === y.baseId;
  }
  function g(f, y) {
    let o;
    for (; typeof (o = this.refs[y]) == "string"; )
      y = o;
    return o || this.schemas[y] || _.call(this, f, y);
  }
  function _(f, y) {
    const o = this.opts.uriResolver.parse(y), p = (0, r._getFullPath)(this.opts.uriResolver, o);
    let E = (0, r.getFullPath)(this.opts.uriResolver, f.baseId, void 0);
    if (Object.keys(f.schema).length > 0 && p === E)
      return w.call(this, o, f);
    const m = (0, r.normalizeId)(p), v = this.refs[m] || this.schemas[m];
    if (typeof v == "string") {
      const P = _.call(this, f, v);
      return typeof P?.schema != "object" ? void 0 : w.call(this, o, P);
    }
    if (typeof v?.schema == "object") {
      if (v.validate || a.call(this, v), m === (0, r.normalizeId)(y)) {
        const { schema: P } = v, { schemaId: T } = this.opts, C = P[T];
        return C && (E = (0, r.resolveUrl)(this.opts.uriResolver, E, C)), new i({ schema: P, schemaId: T, root: f, baseId: E });
      }
      return w.call(this, o, v);
    }
  }
  Ie.resolveSchema = _;
  const b = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function w(f, { baseId: y, schema: o, root: p }) {
    var E;
    if (((E = f.fragment) === null || E === void 0 ? void 0 : E[0]) !== "/")
      return;
    for (const P of f.fragment.slice(1).split("/")) {
      if (typeof o == "boolean")
        return;
      const T = o[(0, l.unescapeFragment)(P)];
      if (T === void 0)
        return;
      o = T;
      const C = typeof o == "object" && o[this.opts.schemaId];
      !b.has(P) && C && (y = (0, r.resolveUrl)(this.opts.uriResolver, y, C));
    }
    let m;
    if (typeof o != "boolean" && o.$ref && !(0, l.schemaHasRulesButRef)(o, this.RULES)) {
      const P = (0, r.resolveUrl)(this.opts.uriResolver, y, o.$ref);
      m = _.call(this, p, P);
    }
    const { schemaId: v } = this.opts;
    if (m = m || new i({ schema: o, schemaId: v, root: p, baseId: y }), m.schema !== m.root.schema)
      return m;
  }
  return Ie;
}
const Ff = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", zf = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Uf = "object", Kf = ["$data"], Gf = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, Hf = !1, Jf = {
  $id: Ff,
  description: zf,
  type: Uf,
  required: Kf,
  properties: Gf,
  additionalProperties: Hf
};
var Cr = {}, wi;
function Bf() {
  if (wi) return Cr;
  wi = 1, Object.defineProperty(Cr, "__esModule", { value: !0 });
  const e = Eu();
  return e.code = 'require("ajv/dist/runtime/uri").default', Cr.default = e, Cr;
}
var Ei;
function Wf() {
  return Ei || (Ei = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = An();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var s = ne();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return s.CodeGen;
    } });
    const r = da(), l = kn(), n = Ou(), i = fa(), a = ne(), u = jn(), d = En(), c = ie(), $ = Jf, g = Bf(), _ = (k, N) => new RegExp(k, N);
    _.code = "new RegExp";
    const b = ["removeAdditional", "useDefaults", "coerceTypes"], w = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), f = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, y = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, o = 200;
    function p(k) {
      var N, A, O, h, S, j, K, H, Z, Q, R, I, q, L, G, X, ae, pe, ue, le, oe, Re, he, nt, st;
      const je = k.strict, at = (N = k.code) === null || N === void 0 ? void 0 : N.optimize, St = at === !0 || at === void 0 ? 1 : at || 0, Pt = (O = (A = k.code) === null || A === void 0 ? void 0 : A.regExp) !== null && O !== void 0 ? O : _, Fn = (h = k.uriResolver) !== null && h !== void 0 ? h : g.default;
      return {
        strictSchema: (j = (S = k.strictSchema) !== null && S !== void 0 ? S : je) !== null && j !== void 0 ? j : !0,
        strictNumbers: (H = (K = k.strictNumbers) !== null && K !== void 0 ? K : je) !== null && H !== void 0 ? H : !0,
        strictTypes: (Q = (Z = k.strictTypes) !== null && Z !== void 0 ? Z : je) !== null && Q !== void 0 ? Q : "log",
        strictTuples: (I = (R = k.strictTuples) !== null && R !== void 0 ? R : je) !== null && I !== void 0 ? I : "log",
        strictRequired: (L = (q = k.strictRequired) !== null && q !== void 0 ? q : je) !== null && L !== void 0 ? L : !1,
        code: k.code ? { ...k.code, optimize: St, regExp: Pt } : { optimize: St, regExp: Pt },
        loopRequired: (G = k.loopRequired) !== null && G !== void 0 ? G : o,
        loopEnum: (X = k.loopEnum) !== null && X !== void 0 ? X : o,
        meta: (ae = k.meta) !== null && ae !== void 0 ? ae : !0,
        messages: (pe = k.messages) !== null && pe !== void 0 ? pe : !0,
        inlineRefs: (ue = k.inlineRefs) !== null && ue !== void 0 ? ue : !0,
        schemaId: (le = k.schemaId) !== null && le !== void 0 ? le : "$id",
        addUsedSchema: (oe = k.addUsedSchema) !== null && oe !== void 0 ? oe : !0,
        validateSchema: (Re = k.validateSchema) !== null && Re !== void 0 ? Re : !0,
        validateFormats: (he = k.validateFormats) !== null && he !== void 0 ? he : !0,
        unicodeRegExp: (nt = k.unicodeRegExp) !== null && nt !== void 0 ? nt : !0,
        int32range: (st = k.int32range) !== null && st !== void 0 ? st : !0,
        uriResolver: Fn
      };
    }
    class E {
      constructor(N = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), N = this.opts = { ...N, ...p(N) };
        const { es5: A, lines: O } = this.opts.code;
        this.scope = new a.ValueScope({ scope: {}, prefixes: w, es5: A, lines: O }), this.logger = z(N.logger);
        const h = N.validateFormats;
        N.validateFormats = !1, this.RULES = (0, n.getRules)(), m.call(this, f, N, "NOT SUPPORTED"), m.call(this, y, N, "DEPRECATED", "warn"), this._metaOpts = V.call(this), N.formats && T.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), N.keywords && C.call(this, N.keywords), typeof N.meta == "object" && this.addMetaSchema(N.meta), P.call(this), N.validateFormats = h;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: N, meta: A, schemaId: O } = this.opts;
        let h = $;
        O === "id" && (h = { ...$ }, h.id = h.$id, delete h.$id), A && N && this.addMetaSchema(h, h[O], !1);
      }
      defaultMeta() {
        const { meta: N, schemaId: A } = this.opts;
        return this.opts.defaultMeta = typeof N == "object" ? N[A] || N : void 0;
      }
      validate(N, A) {
        let O;
        if (typeof N == "string") {
          if (O = this.getSchema(N), !O)
            throw new Error(`no schema with key or ref "${N}"`);
        } else
          O = this.compile(N);
        const h = O(A);
        return "$async" in O || (this.errors = O.errors), h;
      }
      compile(N, A) {
        const O = this._addSchema(N, A);
        return O.validate || this._compileSchemaEnv(O);
      }
      compileAsync(N, A) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: O } = this.opts;
        return h.call(this, N, A);
        async function h(Q, R) {
          await S.call(this, Q.$schema);
          const I = this._addSchema(Q, R);
          return I.validate || j.call(this, I);
        }
        async function S(Q) {
          Q && !this.getSchema(Q) && await h.call(this, { $ref: Q }, !0);
        }
        async function j(Q) {
          try {
            return this._compileSchemaEnv(Q);
          } catch (R) {
            if (!(R instanceof l.default))
              throw R;
            return K.call(this, R), await H.call(this, R.missingSchema), j.call(this, Q);
          }
        }
        function K({ missingSchema: Q, missingRef: R }) {
          if (this.refs[Q])
            throw new Error(`AnySchema ${Q} is loaded but ${R} cannot be resolved`);
        }
        async function H(Q) {
          const R = await Z.call(this, Q);
          this.refs[Q] || await S.call(this, R.$schema), this.refs[Q] || this.addSchema(R, Q, A);
        }
        async function Z(Q) {
          const R = this._loading[Q];
          if (R)
            return R;
          try {
            return await (this._loading[Q] = O(Q));
          } finally {
            delete this._loading[Q];
          }
        }
      }
      // Adds schema to the instance
      addSchema(N, A, O, h = this.opts.validateSchema) {
        if (Array.isArray(N)) {
          for (const j of N)
            this.addSchema(j, void 0, O, h);
          return this;
        }
        let S;
        if (typeof N == "object") {
          const { schemaId: j } = this.opts;
          if (S = N[j], S !== void 0 && typeof S != "string")
            throw new Error(`schema ${j} must be string`);
        }
        return A = (0, u.normalizeId)(A || S), this._checkUnique(A), this.schemas[A] = this._addSchema(N, O, A, h, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(N, A, O = this.opts.validateSchema) {
        return this.addSchema(N, A, !0, O), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(N, A) {
        if (typeof N == "boolean")
          return !0;
        let O;
        if (O = N.$schema, O !== void 0 && typeof O != "string")
          throw new Error("$schema must be a string");
        if (O = O || this.opts.defaultMeta || this.defaultMeta(), !O)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const h = this.validate(O, N);
        if (!h && A) {
          const S = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(S);
          else
            throw new Error(S);
        }
        return h;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(N) {
        let A;
        for (; typeof (A = v.call(this, N)) == "string"; )
          N = A;
        if (A === void 0) {
          const { schemaId: O } = this.opts, h = new i.SchemaEnv({ schema: {}, schemaId: O });
          if (A = i.resolveSchema.call(this, h, N), !A)
            return;
          this.refs[N] = A;
        }
        return A.validate || this._compileSchemaEnv(A);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(N) {
        if (N instanceof RegExp)
          return this._removeAllSchemas(this.schemas, N), this._removeAllSchemas(this.refs, N), this;
        switch (typeof N) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const A = v.call(this, N);
            return typeof A == "object" && this._cache.delete(A.schema), delete this.schemas[N], delete this.refs[N], this;
          }
          case "object": {
            const A = N;
            this._cache.delete(A);
            let O = N[this.opts.schemaId];
            return O && (O = (0, u.normalizeId)(O), delete this.schemas[O], delete this.refs[O]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(N) {
        for (const A of N)
          this.addKeyword(A);
        return this;
      }
      addKeyword(N, A) {
        let O;
        if (typeof N == "string")
          O = N, typeof A == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), A.keyword = O);
        else if (typeof N == "object" && A === void 0) {
          if (A = N, O = A.keyword, Array.isArray(O) && !O.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (M.call(this, O, A), !A)
          return (0, c.eachItem)(O, (S) => F.call(this, S)), this;
        B.call(this, A);
        const h = {
          ...A,
          type: (0, d.getJSONTypes)(A.type),
          schemaType: (0, d.getJSONTypes)(A.schemaType)
        };
        return (0, c.eachItem)(O, h.type.length === 0 ? (S) => F.call(this, S, h) : (S) => h.type.forEach((j) => F.call(this, S, h, j))), this;
      }
      getKeyword(N) {
        const A = this.RULES.all[N];
        return typeof A == "object" ? A.definition : !!A;
      }
      // Remove keyword
      removeKeyword(N) {
        const { RULES: A } = this;
        delete A.keywords[N], delete A.all[N];
        for (const O of A.rules) {
          const h = O.rules.findIndex((S) => S.keyword === N);
          h >= 0 && O.rules.splice(h, 1);
        }
        return this;
      }
      // Add format
      addFormat(N, A) {
        return typeof A == "string" && (A = new RegExp(A)), this.formats[N] = A, this;
      }
      errorsText(N = this.errors, { separator: A = ", ", dataVar: O = "data" } = {}) {
        return !N || N.length === 0 ? "No errors" : N.map((h) => `${O}${h.instancePath} ${h.message}`).reduce((h, S) => h + A + S);
      }
      $dataMetaSchema(N, A) {
        const O = this.RULES.all;
        N = JSON.parse(JSON.stringify(N));
        for (const h of A) {
          const S = h.split("/").slice(1);
          let j = N;
          for (const K of S)
            j = j[K];
          for (const K in O) {
            const H = O[K];
            if (typeof H != "object")
              continue;
            const { $data: Z } = H.definition, Q = j[K];
            Z && Q && (j[K] = Y(Q));
          }
        }
        return N;
      }
      _removeAllSchemas(N, A) {
        for (const O in N) {
          const h = N[O];
          (!A || A.test(O)) && (typeof h == "string" ? delete N[O] : h && !h.meta && (this._cache.delete(h.schema), delete N[O]));
        }
      }
      _addSchema(N, A, O, h = this.opts.validateSchema, S = this.opts.addUsedSchema) {
        let j;
        const { schemaId: K } = this.opts;
        if (typeof N == "object")
          j = N[K];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof N != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let H = this._cache.get(N);
        if (H !== void 0)
          return H;
        O = (0, u.normalizeId)(j || O);
        const Z = u.getSchemaRefs.call(this, N, O);
        return H = new i.SchemaEnv({ schema: N, schemaId: K, meta: A, baseId: O, localRefs: Z }), this._cache.set(H.schema, H), S && !O.startsWith("#") && (O && this._checkUnique(O), this.refs[O] = H), h && this.validateSchema(N, !0), H;
      }
      _checkUnique(N) {
        if (this.schemas[N] || this.refs[N])
          throw new Error(`schema with key or id "${N}" already exists`);
      }
      _compileSchemaEnv(N) {
        if (N.meta ? this._compileMetaSchema(N) : i.compileSchema.call(this, N), !N.validate)
          throw new Error("ajv implementation error");
        return N.validate;
      }
      _compileMetaSchema(N) {
        const A = this.opts;
        this.opts = this._metaOpts;
        try {
          i.compileSchema.call(this, N);
        } finally {
          this.opts = A;
        }
      }
    }
    E.ValidationError = r.default, E.MissingRefError = l.default, e.default = E;
    function m(k, N, A, O = "error") {
      for (const h in k) {
        const S = h;
        S in N && this.logger[O](`${A}: option ${h}. ${k[S]}`);
      }
    }
    function v(k) {
      return k = (0, u.normalizeId)(k), this.schemas[k] || this.refs[k];
    }
    function P() {
      const k = this.opts.schemas;
      if (k)
        if (Array.isArray(k))
          this.addSchema(k);
        else
          for (const N in k)
            this.addSchema(k[N], N);
    }
    function T() {
      for (const k in this.opts.formats) {
        const N = this.opts.formats[k];
        N && this.addFormat(k, N);
      }
    }
    function C(k) {
      if (Array.isArray(k)) {
        this.addVocabulary(k);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const N in k) {
        const A = k[N];
        A.keyword || (A.keyword = N), this.addKeyword(A);
      }
    }
    function V() {
      const k = { ...this.opts };
      for (const N of b)
        delete k[N];
      return k;
    }
    const D = { log() {
    }, warn() {
    }, error() {
    } };
    function z(k) {
      if (k === !1)
        return D;
      if (k === void 0)
        return console;
      if (k.log && k.warn && k.error)
        return k;
      throw new Error("logger must implement log, warn and error methods");
    }
    const U = /^[a-z_$][a-z0-9_$:-]*$/i;
    function M(k, N) {
      const { RULES: A } = this;
      if ((0, c.eachItem)(k, (O) => {
        if (A.keywords[O])
          throw new Error(`Keyword ${O} is already defined`);
        if (!U.test(O))
          throw new Error(`Keyword ${O} has invalid name`);
      }), !!N && N.$data && !("code" in N || "validate" in N))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function F(k, N, A) {
      var O;
      const h = N?.post;
      if (A && h)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: S } = this;
      let j = h ? S.post : S.rules.find(({ type: H }) => H === A);
      if (j || (j = { type: A, rules: [] }, S.rules.push(j)), S.keywords[k] = !0, !N)
        return;
      const K = {
        keyword: k,
        definition: {
          ...N,
          type: (0, d.getJSONTypes)(N.type),
          schemaType: (0, d.getJSONTypes)(N.schemaType)
        }
      };
      N.before ? W.call(this, j, K, N.before) : j.rules.push(K), S.all[k] = K, (O = N.implements) === null || O === void 0 || O.forEach((H) => this.addKeyword(H));
    }
    function W(k, N, A) {
      const O = k.rules.findIndex((h) => h.keyword === A);
      O >= 0 ? k.rules.splice(O, 0, N) : (k.rules.push(N), this.logger.warn(`rule ${A} is not defined`));
    }
    function B(k) {
      let { metaSchema: N } = k;
      N !== void 0 && (k.$data && this.opts.$data && (N = Y(N)), k.validateSchema = this.compile(N, !0));
    }
    const J = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Y(k) {
      return { anyOf: [k, J] };
    }
  })(rs)), rs;
}
var Dr = {}, Mr = {}, Lr = {}, bi;
function Xf() {
  if (bi) return Lr;
  bi = 1, Object.defineProperty(Lr, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Lr.default = e, Lr;
}
var xe = {}, Si;
function Yf() {
  if (Si) return xe;
  Si = 1, Object.defineProperty(xe, "__esModule", { value: !0 }), xe.callRef = xe.getValidate = void 0;
  const e = kn(), t = Me(), s = ne(), r = rt(), l = fa(), n = ie(), i = {
    keyword: "$ref",
    schemaType: "string",
    code(d) {
      const { gen: c, schema: $, it: g } = d, { baseId: _, schemaEnv: b, validateName: w, opts: f, self: y } = g, { root: o } = b;
      if (($ === "#" || $ === "#/") && _ === o.baseId)
        return E();
      const p = l.resolveRef.call(y, o, _, $);
      if (p === void 0)
        throw new e.default(g.opts.uriResolver, _, $);
      if (p instanceof l.SchemaEnv)
        return m(p);
      return v(p);
      function E() {
        if (b === o)
          return u(d, w, b, b.$async);
        const P = c.scopeValue("root", { ref: o });
        return u(d, (0, s._)`${P}.validate`, o, o.$async);
      }
      function m(P) {
        const T = a(d, P);
        u(d, T, P, P.$async);
      }
      function v(P) {
        const T = c.scopeValue("schema", f.code.source === !0 ? { ref: P, code: (0, s.stringify)(P) } : { ref: P }), C = c.name("valid"), V = d.subschema({
          schema: P,
          dataTypes: [],
          schemaPath: s.nil,
          topSchemaRef: T,
          errSchemaPath: $
        }, C);
        d.mergeEvaluated(V), d.ok(C);
      }
    }
  };
  function a(d, c) {
    const { gen: $ } = d;
    return c.validate ? $.scopeValue("validate", { ref: c.validate }) : (0, s._)`${$.scopeValue("wrapper", { ref: c })}.validate`;
  }
  xe.getValidate = a;
  function u(d, c, $, g) {
    const { gen: _, it: b } = d, { allErrors: w, schemaEnv: f, opts: y } = b, o = y.passContext ? r.default.this : s.nil;
    g ? p() : E();
    function p() {
      if (!f.$async)
        throw new Error("async schema referenced by sync schema");
      const P = _.let("valid");
      _.try(() => {
        _.code((0, s._)`await ${(0, t.callValidateCode)(d, c, o)}`), v(c), w || _.assign(P, !0);
      }, (T) => {
        _.if((0, s._)`!(${T} instanceof ${b.ValidationError})`, () => _.throw(T)), m(T), w || _.assign(P, !1);
      }), d.ok(P);
    }
    function E() {
      d.result((0, t.callValidateCode)(d, c, o), () => v(c), () => m(c));
    }
    function m(P) {
      const T = (0, s._)`${P}.errors`;
      _.assign(r.default.vErrors, (0, s._)`${r.default.vErrors} === null ? ${T} : ${r.default.vErrors}.concat(${T})`), _.assign(r.default.errors, (0, s._)`${r.default.vErrors}.length`);
    }
    function v(P) {
      var T;
      if (!b.opts.unevaluated)
        return;
      const C = (T = $?.validate) === null || T === void 0 ? void 0 : T.evaluated;
      if (b.props !== !0)
        if (C && !C.dynamicProps)
          C.props !== void 0 && (b.props = n.mergeEvaluated.props(_, C.props, b.props));
        else {
          const V = _.var("props", (0, s._)`${P}.evaluated.props`);
          b.props = n.mergeEvaluated.props(_, V, b.props, s.Name);
        }
      if (b.items !== !0)
        if (C && !C.dynamicItems)
          C.items !== void 0 && (b.items = n.mergeEvaluated.items(_, C.items, b.items));
        else {
          const V = _.var("items", (0, s._)`${P}.evaluated.items`);
          b.items = n.mergeEvaluated.items(_, V, b.items, s.Name);
        }
    }
  }
  return xe.callRef = u, xe.default = i, xe;
}
var Pi;
function Qf() {
  if (Pi) return Mr;
  Pi = 1, Object.defineProperty(Mr, "__esModule", { value: !0 });
  const e = Xf(), t = Yf(), s = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return Mr.default = s, Mr;
}
var Vr = {}, Fr = {}, Ri;
function Zf() {
  if (Ri) return Fr;
  Ri = 1, Object.defineProperty(Fr, "__esModule", { value: !0 });
  const e = ne(), t = e.operators, s = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: i }) => (0, e.str)`must be ${s[n].okStr} ${i}`,
    params: ({ keyword: n, schemaCode: i }) => (0, e._)`{comparison: ${s[n].okStr}, limit: ${i}}`
  }, l = {
    keyword: Object.keys(s),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: i, data: a, schemaCode: u } = n;
      n.fail$data((0, e._)`${a} ${s[i].fail} ${u} || isNaN(${a})`);
    }
  };
  return Fr.default = l, Fr;
}
var zr = {}, Ni;
function xf() {
  if (Ni) return zr;
  Ni = 1, Object.defineProperty(zr, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: l, data: n, schemaCode: i, it: a } = r, u = a.opts.multipleOfPrecision, d = l.let("res"), c = u ? (0, e._)`Math.abs(Math.round(${d}) - ${d}) > 1e-${u}` : (0, e._)`${d} !== parseInt(${d})`;
      r.fail$data((0, e._)`(${i} === 0 || (${d} = ${n}/${i}, ${c}))`);
    }
  };
  return zr.default = s, zr;
}
var Ur = {}, Kr = {}, Oi;
function eh() {
  if (Oi) return Kr;
  Oi = 1, Object.defineProperty(Kr, "__esModule", { value: !0 });
  function e(t) {
    const s = t.length;
    let r = 0, l = 0, n;
    for (; l < s; )
      r++, n = t.charCodeAt(l++), n >= 55296 && n <= 56319 && l < s && (n = t.charCodeAt(l), (n & 64512) === 56320 && l++);
    return r;
  }
  return Kr.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Kr;
}
var Ii;
function th() {
  if (Ii) return Ur;
  Ii = 1, Object.defineProperty(Ur, "__esModule", { value: !0 });
  const e = ne(), t = ie(), s = eh(), l = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const a = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${a} than ${i} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: a, schemaCode: u, it: d } = n, c = i === "maxLength" ? e.operators.GT : e.operators.LT, $ = d.opts.unicode === !1 ? (0, e._)`${a}.length` : (0, e._)`${(0, t.useFunc)(n.gen, s.default)}(${a})`;
      n.fail$data((0, e._)`${$} ${c} ${u}`);
    }
  };
  return Ur.default = l, Ur;
}
var Gr = {}, Ti;
function rh() {
  if (Ti) return Gr;
  Ti = 1, Object.defineProperty(Gr, "__esModule", { value: !0 });
  const e = Me(), t = ne(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: l }) => (0, t.str)`must match pattern "${l}"`,
      params: ({ schemaCode: l }) => (0, t._)`{pattern: ${l}}`
    },
    code(l) {
      const { data: n, $data: i, schema: a, schemaCode: u, it: d } = l, c = d.opts.unicodeRegExp ? "u" : "", $ = i ? (0, t._)`(new RegExp(${u}, ${c}))` : (0, e.usePattern)(l, a);
      l.fail$data((0, t._)`!${$}.test(${n})`);
    }
  };
  return Gr.default = r, Gr;
}
var Hr = {}, ji;
function nh() {
  if (ji) return Hr;
  ji = 1, Object.defineProperty(Hr, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, a = l === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${a} ${i}`);
    }
  };
  return Hr.default = s, Hr;
}
var Jr = {}, Ai;
function sh() {
  if (Ai) return Jr;
  Ai = 1, Object.defineProperty(Jr, "__esModule", { value: !0 });
  const e = Me(), t = ne(), s = ie(), l = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: i, schema: a, schemaCode: u, data: d, $data: c, it: $ } = n, { opts: g } = $;
      if (!c && a.length === 0)
        return;
      const _ = a.length >= g.loopRequired;
      if ($.allErrors ? b() : w(), g.strictRequired) {
        const o = n.parentSchema.properties, { definedProperties: p } = n.it;
        for (const E of a)
          if (o?.[E] === void 0 && !p.has(E)) {
            const m = $.schemaEnv.baseId + $.errSchemaPath, v = `required property "${E}" is not defined at "${m}" (strictRequired)`;
            (0, s.checkStrictMode)($, v, $.opts.strictRequired);
          }
      }
      function b() {
        if (_ || c)
          n.block$data(t.nil, f);
        else
          for (const o of a)
            (0, e.checkReportMissingProp)(n, o);
      }
      function w() {
        const o = i.let("missing");
        if (_ || c) {
          const p = i.let("valid", !0);
          n.block$data(p, () => y(o, p)), n.ok(p);
        } else
          i.if((0, e.checkMissingProp)(n, a, o)), (0, e.reportMissingProp)(n, o), i.else();
      }
      function f() {
        i.forOf("prop", u, (o) => {
          n.setParams({ missingProperty: o }), i.if((0, e.noPropertyInData)(i, d, o, g.ownProperties), () => n.error());
        });
      }
      function y(o, p) {
        n.setParams({ missingProperty: o }), i.forOf(o, u, () => {
          i.assign(p, (0, e.propertyInData)(i, d, o, g.ownProperties)), i.if((0, t.not)(p), () => {
            n.error(), i.break();
          });
        }, t.nil);
      }
    }
  };
  return Jr.default = l, Jr;
}
var Br = {}, ki;
function ah() {
  if (ki) return Br;
  ki = 1, Object.defineProperty(Br, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, a = l === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${a} ${i}`);
    }
  };
  return Br.default = s, Br;
}
var Wr = {}, Xr = {}, qi;
function ha() {
  if (qi) return Xr;
  qi = 1, Object.defineProperty(Xr, "__esModule", { value: !0 });
  const e = Pn();
  return e.code = 'require("ajv/dist/runtime/equal").default', Xr.default = e, Xr;
}
var Ci;
function oh() {
  if (Ci) return Wr;
  Ci = 1, Object.defineProperty(Wr, "__esModule", { value: !0 });
  const e = En(), t = ne(), s = ie(), r = ha(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i, j: a } }) => (0, t.str)`must NOT have duplicate items (items ## ${a} and ${i} are identical)`,
      params: ({ params: { i, j: a } }) => (0, t._)`{i: ${i}, j: ${a}}`
    },
    code(i) {
      const { gen: a, data: u, $data: d, schema: c, parentSchema: $, schemaCode: g, it: _ } = i;
      if (!d && !c)
        return;
      const b = a.let("valid"), w = $.items ? (0, e.getSchemaTypes)($.items) : [];
      i.block$data(b, f, (0, t._)`${g} === false`), i.ok(b);
      function f() {
        const E = a.let("i", (0, t._)`${u}.length`), m = a.let("j");
        i.setParams({ i: E, j: m }), a.assign(b, !0), a.if((0, t._)`${E} > 1`, () => (y() ? o : p)(E, m));
      }
      function y() {
        return w.length > 0 && !w.some((E) => E === "object" || E === "array");
      }
      function o(E, m) {
        const v = a.name("item"), P = (0, e.checkDataTypes)(w, v, _.opts.strictNumbers, e.DataType.Wrong), T = a.const("indices", (0, t._)`{}`);
        a.for((0, t._)`;${E}--;`, () => {
          a.let(v, (0, t._)`${u}[${E}]`), a.if(P, (0, t._)`continue`), w.length > 1 && a.if((0, t._)`typeof ${v} == "string"`, (0, t._)`${v} += "_"`), a.if((0, t._)`typeof ${T}[${v}] == "number"`, () => {
            a.assign(m, (0, t._)`${T}[${v}]`), i.error(), a.assign(b, !1).break();
          }).code((0, t._)`${T}[${v}] = ${E}`);
        });
      }
      function p(E, m) {
        const v = (0, s.useFunc)(a, r.default), P = a.name("outer");
        a.label(P).for((0, t._)`;${E}--;`, () => a.for((0, t._)`${m} = ${E}; ${m}--;`, () => a.if((0, t._)`${v}(${u}[${E}], ${u}[${m}])`, () => {
          i.error(), a.assign(b, !1).break(P);
        })));
      }
    }
  };
  return Wr.default = n, Wr;
}
var Yr = {}, Di;
function ih() {
  if (Di) return Yr;
  Di = 1, Object.defineProperty(Yr, "__esModule", { value: !0 });
  const e = ne(), t = ie(), s = ha(), l = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: u, schemaCode: d, schema: c } = n;
      u || c && typeof c == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(i, s.default)}(${a}, ${d})`) : n.fail((0, e._)`${c} !== ${a}`);
    }
  };
  return Yr.default = l, Yr;
}
var Qr = {}, Mi;
function ch() {
  if (Mi) return Qr;
  Mi = 1, Object.defineProperty(Qr, "__esModule", { value: !0 });
  const e = ne(), t = ie(), s = ha(), l = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: u, schema: d, schemaCode: c, it: $ } = n;
      if (!u && d.length === 0)
        throw new Error("enum must have non-empty array");
      const g = d.length >= $.opts.loopEnum;
      let _;
      const b = () => _ ?? (_ = (0, t.useFunc)(i, s.default));
      let w;
      if (g || u)
        w = i.let("valid"), n.block$data(w, f);
      else {
        if (!Array.isArray(d))
          throw new Error("ajv implementation error");
        const o = i.const("vSchema", c);
        w = (0, e.or)(...d.map((p, E) => y(o, E)));
      }
      n.pass(w);
      function f() {
        i.assign(w, !1), i.forOf("v", c, (o) => i.if((0, e._)`${b()}(${a}, ${o})`, () => i.assign(w, !0).break()));
      }
      function y(o, p) {
        const E = d[p];
        return typeof E == "object" && E !== null ? (0, e._)`${b()}(${a}, ${o}[${p}])` : (0, e._)`${a} === ${E}`;
      }
    }
  };
  return Qr.default = l, Qr;
}
var Li;
function uh() {
  if (Li) return Vr;
  Li = 1, Object.defineProperty(Vr, "__esModule", { value: !0 });
  const e = Zf(), t = xf(), s = th(), r = rh(), l = nh(), n = sh(), i = ah(), a = oh(), u = ih(), d = ch(), c = [
    // number
    e.default,
    t.default,
    // string
    s.default,
    r.default,
    // object
    l.default,
    n.default,
    // array
    i.default,
    a.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    u.default,
    d.default
  ];
  return Vr.default = c, Vr;
}
var Zr = {}, gt = {}, Vi;
function Tu() {
  if (Vi) return gt;
  Vi = 1, Object.defineProperty(gt, "__esModule", { value: !0 }), gt.validateAdditionalItems = void 0;
  const e = ne(), t = ie(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: i, it: a } = n, { items: u } = i;
      if (!Array.isArray(u)) {
        (0, t.checkStrictMode)(a, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      l(n, u);
    }
  };
  function l(n, i) {
    const { gen: a, schema: u, data: d, keyword: c, it: $ } = n;
    $.items = !0;
    const g = a.const("len", (0, e._)`${d}.length`);
    if (u === !1)
      n.setParams({ len: i.length }), n.pass((0, e._)`${g} <= ${i.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)($, u)) {
      const b = a.var("valid", (0, e._)`${g} <= ${i.length}`);
      a.if((0, e.not)(b), () => _(b)), n.ok(b);
    }
    function _(b) {
      a.forRange("i", i.length, g, (w) => {
        n.subschema({ keyword: c, dataProp: w, dataPropType: t.Type.Num }, b), $.allErrors || a.if((0, e.not)(b), () => a.break());
      });
    }
  }
  return gt.validateAdditionalItems = l, gt.default = r, gt;
}
var xr = {}, _t = {}, Fi;
function ju() {
  if (Fi) return _t;
  Fi = 1, Object.defineProperty(_t, "__esModule", { value: !0 }), _t.validateTuple = void 0;
  const e = ne(), t = ie(), s = Me(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: i, it: a } = n;
      if (Array.isArray(i))
        return l(n, "additionalItems", i);
      a.items = !0, !(0, t.alwaysValidSchema)(a, i) && n.ok((0, s.validateArray)(n));
    }
  };
  function l(n, i, a = n.schema) {
    const { gen: u, parentSchema: d, data: c, keyword: $, it: g } = n;
    w(d), g.opts.unevaluated && a.length && g.items !== !0 && (g.items = t.mergeEvaluated.items(u, a.length, g.items));
    const _ = u.name("valid"), b = u.const("len", (0, e._)`${c}.length`);
    a.forEach((f, y) => {
      (0, t.alwaysValidSchema)(g, f) || (u.if((0, e._)`${b} > ${y}`, () => n.subschema({
        keyword: $,
        schemaProp: y,
        dataProp: y
      }, _)), n.ok(_));
    });
    function w(f) {
      const { opts: y, errSchemaPath: o } = g, p = a.length, E = p === f.minItems && (p === f.maxItems || f[i] === !1);
      if (y.strictTuples && !E) {
        const m = `"${$}" is ${p}-tuple, but minItems or maxItems/${i} are not specified or different at path "${o}"`;
        (0, t.checkStrictMode)(g, m, y.strictTuples);
      }
    }
  }
  return _t.validateTuple = l, _t.default = r, _t;
}
var zi;
function lh() {
  if (zi) return xr;
  zi = 1, Object.defineProperty(xr, "__esModule", { value: !0 });
  const e = ju(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (s) => (0, e.validateTuple)(s, "items")
  };
  return xr.default = t, xr;
}
var en = {}, Ui;
function dh() {
  if (Ui) return en;
  Ui = 1, Object.defineProperty(en, "__esModule", { value: !0 });
  const e = ne(), t = ie(), s = Me(), r = Tu(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { schema: a, parentSchema: u, it: d } = i, { prefixItems: c } = u;
      d.items = !0, !(0, t.alwaysValidSchema)(d, a) && (c ? (0, r.validateAdditionalItems)(i, c) : i.ok((0, s.validateArray)(i)));
    }
  };
  return en.default = n, en;
}
var tn = {}, Ki;
function fh() {
  if (Ki) return tn;
  Ki = 1, Object.defineProperty(tn, "__esModule", { value: !0 });
  const e = ne(), t = ie(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${l} valid item(s)` : (0, e.str)`must contain at least ${l} and no more than ${n} valid item(s)`,
      params: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${l}}` : (0, e._)`{minContains: ${l}, maxContains: ${n}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: a, data: u, it: d } = l;
      let c, $;
      const { minContains: g, maxContains: _ } = a;
      d.opts.next ? (c = g === void 0 ? 1 : g, $ = _) : c = 1;
      const b = n.const("len", (0, e._)`${u}.length`);
      if (l.setParams({ min: c, max: $ }), $ === void 0 && c === 0) {
        (0, t.checkStrictMode)(d, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if ($ !== void 0 && c > $) {
        (0, t.checkStrictMode)(d, '"minContains" > "maxContains" is always invalid'), l.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(d, i)) {
        let p = (0, e._)`${b} >= ${c}`;
        $ !== void 0 && (p = (0, e._)`${p} && ${b} <= ${$}`), l.pass(p);
        return;
      }
      d.items = !0;
      const w = n.name("valid");
      $ === void 0 && c === 1 ? y(w, () => n.if(w, () => n.break())) : c === 0 ? (n.let(w, !0), $ !== void 0 && n.if((0, e._)`${u}.length > 0`, f)) : (n.let(w, !1), f()), l.result(w, () => l.reset());
      function f() {
        const p = n.name("_valid"), E = n.let("count", 0);
        y(p, () => n.if(p, () => o(E)));
      }
      function y(p, E) {
        n.forRange("i", 0, b, (m) => {
          l.subschema({
            keyword: "contains",
            dataProp: m,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, p), E();
        });
      }
      function o(p) {
        n.code((0, e._)`${p}++`), $ === void 0 ? n.if((0, e._)`${p} >= ${c}`, () => n.assign(w, !0).break()) : (n.if((0, e._)`${p} > ${$}`, () => n.assign(w, !1).break()), c === 1 ? n.assign(w, !0) : n.if((0, e._)`${p} >= ${c}`, () => n.assign(w, !0)));
      }
    }
  };
  return tn.default = r, tn;
}
var cs = {}, Gi;
function hh() {
  return Gi || (Gi = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = ne(), s = ie(), r = Me();
    e.error = {
      message: ({ params: { property: u, depsCount: d, deps: c } }) => {
        const $ = d === 1 ? "property" : "properties";
        return (0, t.str)`must have ${$} ${c} when property ${u} is present`;
      },
      params: ({ params: { property: u, depsCount: d, deps: c, missingProperty: $ } }) => (0, t._)`{property: ${u},
    missingProperty: ${$},
    depsCount: ${d},
    deps: ${c}}`
      // TODO change to reference
    };
    const l = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(u) {
        const [d, c] = n(u);
        i(u, d), a(u, c);
      }
    };
    function n({ schema: u }) {
      const d = {}, c = {};
      for (const $ in u) {
        if ($ === "__proto__")
          continue;
        const g = Array.isArray(u[$]) ? d : c;
        g[$] = u[$];
      }
      return [d, c];
    }
    function i(u, d = u.schema) {
      const { gen: c, data: $, it: g } = u;
      if (Object.keys(d).length === 0)
        return;
      const _ = c.let("missing");
      for (const b in d) {
        const w = d[b];
        if (w.length === 0)
          continue;
        const f = (0, r.propertyInData)(c, $, b, g.opts.ownProperties);
        u.setParams({
          property: b,
          depsCount: w.length,
          deps: w.join(", ")
        }), g.allErrors ? c.if(f, () => {
          for (const y of w)
            (0, r.checkReportMissingProp)(u, y);
        }) : (c.if((0, t._)`${f} && (${(0, r.checkMissingProp)(u, w, _)})`), (0, r.reportMissingProp)(u, _), c.else());
      }
    }
    e.validatePropertyDeps = i;
    function a(u, d = u.schema) {
      const { gen: c, data: $, keyword: g, it: _ } = u, b = c.name("valid");
      for (const w in d)
        (0, s.alwaysValidSchema)(_, d[w]) || (c.if(
          (0, r.propertyInData)(c, $, w, _.opts.ownProperties),
          () => {
            const f = u.subschema({ keyword: g, schemaProp: w }, b);
            u.mergeValidEvaluated(f, b);
          },
          () => c.var(b, !0)
          // TODO var
        ), u.ok(b));
    }
    e.validateSchemaDeps = a, e.default = l;
  })(cs)), cs;
}
var rn = {}, Hi;
function mh() {
  if (Hi) return rn;
  Hi = 1, Object.defineProperty(rn, "__esModule", { value: !0 });
  const e = ne(), t = ie(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: l }) => (0, e._)`{propertyName: ${l.propertyName}}`
    },
    code(l) {
      const { gen: n, schema: i, data: a, it: u } = l;
      if ((0, t.alwaysValidSchema)(u, i))
        return;
      const d = n.name("valid");
      n.forIn("key", a, (c) => {
        l.setParams({ propertyName: c }), l.subschema({
          keyword: "propertyNames",
          data: c,
          dataTypes: ["string"],
          propertyName: c,
          compositeRule: !0
        }, d), n.if((0, e.not)(d), () => {
          l.error(!0), u.allErrors || n.break();
        });
      }), l.ok(d);
    }
  };
  return rn.default = r, rn;
}
var nn = {}, Ji;
function Au() {
  if (Ji) return nn;
  Ji = 1, Object.defineProperty(nn, "__esModule", { value: !0 });
  const e = Me(), t = ne(), s = rt(), r = ie(), n = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: i }) => (0, t._)`{additionalProperty: ${i.additionalProperty}}`
    },
    code(i) {
      const { gen: a, schema: u, parentSchema: d, data: c, errsCount: $, it: g } = i;
      if (!$)
        throw new Error("ajv implementation error");
      const { allErrors: _, opts: b } = g;
      if (g.props = !0, b.removeAdditional !== "all" && (0, r.alwaysValidSchema)(g, u))
        return;
      const w = (0, e.allSchemaProperties)(d.properties), f = (0, e.allSchemaProperties)(d.patternProperties);
      y(), i.ok((0, t._)`${$} === ${s.default.errors}`);
      function y() {
        a.forIn("key", c, (v) => {
          !w.length && !f.length ? E(v) : a.if(o(v), () => E(v));
        });
      }
      function o(v) {
        let P;
        if (w.length > 8) {
          const T = (0, r.schemaRefOrVal)(g, d.properties, "properties");
          P = (0, e.isOwnProperty)(a, T, v);
        } else w.length ? P = (0, t.or)(...w.map((T) => (0, t._)`${v} === ${T}`)) : P = t.nil;
        return f.length && (P = (0, t.or)(P, ...f.map((T) => (0, t._)`${(0, e.usePattern)(i, T)}.test(${v})`))), (0, t.not)(P);
      }
      function p(v) {
        a.code((0, t._)`delete ${c}[${v}]`);
      }
      function E(v) {
        if (b.removeAdditional === "all" || b.removeAdditional && u === !1) {
          p(v);
          return;
        }
        if (u === !1) {
          i.setParams({ additionalProperty: v }), i.error(), _ || a.break();
          return;
        }
        if (typeof u == "object" && !(0, r.alwaysValidSchema)(g, u)) {
          const P = a.name("valid");
          b.removeAdditional === "failing" ? (m(v, P, !1), a.if((0, t.not)(P), () => {
            i.reset(), p(v);
          })) : (m(v, P), _ || a.if((0, t.not)(P), () => a.break()));
        }
      }
      function m(v, P, T) {
        const C = {
          keyword: "additionalProperties",
          dataProp: v,
          dataPropType: r.Type.Str
        };
        T === !1 && Object.assign(C, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), i.subschema(C, P);
      }
    }
  };
  return nn.default = n, nn;
}
var sn = {}, Bi;
function ph() {
  if (Bi) return sn;
  Bi = 1, Object.defineProperty(sn, "__esModule", { value: !0 });
  const e = An(), t = Me(), s = ie(), r = Au(), l = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, parentSchema: u, data: d, it: c } = n;
      c.opts.removeAdditional === "all" && u.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(c, r.default, "additionalProperties"));
      const $ = (0, t.allSchemaProperties)(a);
      for (const f of $)
        c.definedProperties.add(f);
      c.opts.unevaluated && $.length && c.props !== !0 && (c.props = s.mergeEvaluated.props(i, (0, s.toHash)($), c.props));
      const g = $.filter((f) => !(0, s.alwaysValidSchema)(c, a[f]));
      if (g.length === 0)
        return;
      const _ = i.name("valid");
      for (const f of g)
        b(f) ? w(f) : (i.if((0, t.propertyInData)(i, d, f, c.opts.ownProperties)), w(f), c.allErrors || i.else().var(_, !0), i.endIf()), n.it.definedProperties.add(f), n.ok(_);
      function b(f) {
        return c.opts.useDefaults && !c.compositeRule && a[f].default !== void 0;
      }
      function w(f) {
        n.subschema({
          keyword: "properties",
          schemaProp: f,
          dataProp: f
        }, _);
      }
    }
  };
  return sn.default = l, sn;
}
var an = {}, Wi;
function yh() {
  if (Wi) return an;
  Wi = 1, Object.defineProperty(an, "__esModule", { value: !0 });
  const e = Me(), t = ne(), s = ie(), r = ie(), l = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, data: u, parentSchema: d, it: c } = n, { opts: $ } = c, g = (0, e.allSchemaProperties)(a), _ = g.filter((E) => (0, s.alwaysValidSchema)(c, a[E]));
      if (g.length === 0 || _.length === g.length && (!c.opts.unevaluated || c.props === !0))
        return;
      const b = $.strictSchema && !$.allowMatchingProperties && d.properties, w = i.name("valid");
      c.props !== !0 && !(c.props instanceof t.Name) && (c.props = (0, r.evaluatedPropsToName)(i, c.props));
      const { props: f } = c;
      y();
      function y() {
        for (const E of g)
          b && o(E), c.allErrors ? p(E) : (i.var(w, !0), p(E), i.if(w));
      }
      function o(E) {
        for (const m in b)
          new RegExp(E).test(m) && (0, s.checkStrictMode)(c, `property ${m} matches pattern ${E} (use allowMatchingProperties)`);
      }
      function p(E) {
        i.forIn("key", u, (m) => {
          i.if((0, t._)`${(0, e.usePattern)(n, E)}.test(${m})`, () => {
            const v = _.includes(E);
            v || n.subschema({
              keyword: "patternProperties",
              schemaProp: E,
              dataProp: m,
              dataPropType: r.Type.Str
            }, w), c.opts.unevaluated && f !== !0 ? i.assign((0, t._)`${f}[${m}]`, !0) : !v && !c.allErrors && i.if((0, t.not)(w), () => i.break());
          });
        });
      }
    }
  };
  return an.default = l, an;
}
var on = {}, Xi;
function vh() {
  if (Xi) return on;
  Xi = 1, Object.defineProperty(on, "__esModule", { value: !0 });
  const e = ie(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if ((0, e.alwaysValidSchema)(n, l)) {
        s.fail();
        return;
      }
      const i = r.name("valid");
      s.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i), s.failResult(i, () => s.reset(), () => s.error());
    },
    error: { message: "must NOT be valid" }
  };
  return on.default = t, on;
}
var cn = {}, Yi;
function gh() {
  if (Yi) return cn;
  Yi = 1, Object.defineProperty(cn, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Me().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return cn.default = t, cn;
}
var un = {}, Qi;
function _h() {
  if (Qi) return un;
  Qi = 1, Object.defineProperty(un, "__esModule", { value: !0 });
  const e = ne(), t = ie(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: l }) => (0, e._)`{passingSchemas: ${l.passing}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: a, it: u } = l;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      if (u.opts.discriminator && a.discriminator)
        return;
      const d = i, c = n.let("valid", !1), $ = n.let("passing", null), g = n.name("_valid");
      l.setParams({ passing: $ }), n.block(_), l.result(c, () => l.reset(), () => l.error(!0));
      function _() {
        d.forEach((b, w) => {
          let f;
          (0, t.alwaysValidSchema)(u, b) ? n.var(g, !0) : f = l.subschema({
            keyword: "oneOf",
            schemaProp: w,
            compositeRule: !0
          }, g), w > 0 && n.if((0, e._)`${g} && ${c}`).assign(c, !1).assign($, (0, e._)`[${$}, ${w}]`).else(), n.if(g, () => {
            n.assign(c, !0), n.assign($, w), f && l.mergeEvaluated(f, e.Name);
          });
        });
      }
    }
  };
  return un.default = r, un;
}
var ln = {}, Zi;
function $h() {
  if (Zi) return ln;
  Zi = 1, Object.defineProperty(ln, "__esModule", { value: !0 });
  const e = ie(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      const i = r.name("valid");
      l.forEach((a, u) => {
        if ((0, e.alwaysValidSchema)(n, a))
          return;
        const d = s.subschema({ keyword: "allOf", schemaProp: u }, i);
        s.ok(i), s.mergeEvaluated(d);
      });
    }
  };
  return ln.default = t, ln;
}
var dn = {}, xi;
function wh() {
  if (xi) return dn;
  xi = 1, Object.defineProperty(dn, "__esModule", { value: !0 });
  const e = ne(), t = ie(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: i, parentSchema: a, it: u } = n;
      a.then === void 0 && a.else === void 0 && (0, t.checkStrictMode)(u, '"if" without "then" and "else" is ignored');
      const d = l(u, "then"), c = l(u, "else");
      if (!d && !c)
        return;
      const $ = i.let("valid", !0), g = i.name("_valid");
      if (_(), n.reset(), d && c) {
        const w = i.let("ifClause");
        n.setParams({ ifClause: w }), i.if(g, b("then", w), b("else", w));
      } else d ? i.if(g, b("then")) : i.if((0, e.not)(g), b("else"));
      n.pass($, () => n.error(!0));
      function _() {
        const w = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, g);
        n.mergeEvaluated(w);
      }
      function b(w, f) {
        return () => {
          const y = n.subschema({ keyword: w }, g);
          i.assign($, g), n.mergeValidEvaluated(y, $), f ? i.assign(f, (0, e._)`${w}`) : n.setParams({ ifClause: w });
        };
      }
    }
  };
  function l(n, i) {
    const a = n.schema[i];
    return a !== void 0 && !(0, t.alwaysValidSchema)(n, a);
  }
  return dn.default = r, dn;
}
var fn = {}, ec;
function Eh() {
  if (ec) return fn;
  ec = 1, Object.defineProperty(fn, "__esModule", { value: !0 });
  const e = ie(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: s, parentSchema: r, it: l }) {
      r.if === void 0 && (0, e.checkStrictMode)(l, `"${s}" without "if" is ignored`);
    }
  };
  return fn.default = t, fn;
}
var tc;
function bh() {
  if (tc) return Zr;
  tc = 1, Object.defineProperty(Zr, "__esModule", { value: !0 });
  const e = Tu(), t = lh(), s = ju(), r = dh(), l = fh(), n = hh(), i = mh(), a = Au(), u = ph(), d = yh(), c = vh(), $ = gh(), g = _h(), _ = $h(), b = wh(), w = Eh();
  function f(y = !1) {
    const o = [
      // any
      c.default,
      $.default,
      g.default,
      _.default,
      b.default,
      w.default,
      // object
      i.default,
      a.default,
      n.default,
      u.default,
      d.default
    ];
    return y ? o.push(t.default, r.default) : o.push(e.default, s.default), o.push(l.default), o;
  }
  return Zr.default = f, Zr;
}
var hn = {}, mn = {}, rc;
function Sh() {
  if (rc) return mn;
  rc = 1, Object.defineProperty(mn, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, l) {
      const { gen: n, data: i, $data: a, schema: u, schemaCode: d, it: c } = r, { opts: $, errSchemaPath: g, schemaEnv: _, self: b } = c;
      if (!$.validateFormats)
        return;
      a ? w() : f();
      function w() {
        const y = n.scopeValue("formats", {
          ref: b.formats,
          code: $.code.formats
        }), o = n.const("fDef", (0, e._)`${y}[${d}]`), p = n.let("fType"), E = n.let("format");
        n.if((0, e._)`typeof ${o} == "object" && !(${o} instanceof RegExp)`, () => n.assign(p, (0, e._)`${o}.type || "string"`).assign(E, (0, e._)`${o}.validate`), () => n.assign(p, (0, e._)`"string"`).assign(E, o)), r.fail$data((0, e.or)(m(), v()));
        function m() {
          return $.strictSchema === !1 ? e.nil : (0, e._)`${d} && !${E}`;
        }
        function v() {
          const P = _.$async ? (0, e._)`(${o}.async ? await ${E}(${i}) : ${E}(${i}))` : (0, e._)`${E}(${i})`, T = (0, e._)`(typeof ${E} == "function" ? ${P} : ${E}.test(${i}))`;
          return (0, e._)`${E} && ${E} !== true && ${p} === ${l} && !${T}`;
        }
      }
      function f() {
        const y = b.formats[u];
        if (!y) {
          m();
          return;
        }
        if (y === !0)
          return;
        const [o, p, E] = v(y);
        o === l && r.pass(P());
        function m() {
          if ($.strictSchema === !1) {
            b.logger.warn(T());
            return;
          }
          throw new Error(T());
          function T() {
            return `unknown format "${u}" ignored in schema at path "${g}"`;
          }
        }
        function v(T) {
          const C = T instanceof RegExp ? (0, e.regexpCode)(T) : $.code.formats ? (0, e._)`${$.code.formats}${(0, e.getProperty)(u)}` : void 0, V = n.scopeValue("formats", { key: u, ref: T, code: C });
          return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, e._)`${V}.validate`] : ["string", T, V];
        }
        function P() {
          if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
            if (!_.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${E}(${i})`;
          }
          return typeof p == "function" ? (0, e._)`${E}(${i})` : (0, e._)`${E}.test(${i})`;
        }
      }
    }
  };
  return mn.default = s, mn;
}
var nc;
function Ph() {
  if (nc) return hn;
  nc = 1, Object.defineProperty(hn, "__esModule", { value: !0 });
  const t = [Sh().default];
  return hn.default = t, hn;
}
var dt = {}, sc;
function Rh() {
  return sc || (sc = 1, Object.defineProperty(dt, "__esModule", { value: !0 }), dt.contentVocabulary = dt.metadataVocabulary = void 0, dt.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], dt.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), dt;
}
var ac;
function Nh() {
  if (ac) return Dr;
  ac = 1, Object.defineProperty(Dr, "__esModule", { value: !0 });
  const e = Qf(), t = uh(), s = bh(), r = Ph(), l = Rh(), n = [
    e.default,
    t.default,
    (0, s.default)(),
    r.default,
    l.metadataVocabulary,
    l.contentVocabulary
  ];
  return Dr.default = n, Dr;
}
var pn = {}, jt = {}, oc;
function Oh() {
  if (oc) return jt;
  oc = 1, Object.defineProperty(jt, "__esModule", { value: !0 }), jt.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (jt.DiscrError = e = {})), jt;
}
var ic;
function Ih() {
  if (ic) return pn;
  ic = 1, Object.defineProperty(pn, "__esModule", { value: !0 });
  const e = ne(), t = Oh(), s = fa(), r = kn(), l = ie(), i = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: a, tagName: u } }) => a === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: a, tag: u, tagName: d } }) => (0, e._)`{error: ${a}, tag: ${d}, tagValue: ${u}}`
    },
    code(a) {
      const { gen: u, data: d, schema: c, parentSchema: $, it: g } = a, { oneOf: _ } = $;
      if (!g.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const b = c.propertyName;
      if (typeof b != "string")
        throw new Error("discriminator: requires propertyName");
      if (c.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!_)
        throw new Error("discriminator: requires oneOf keyword");
      const w = u.let("valid", !1), f = u.const("tag", (0, e._)`${d}${(0, e.getProperty)(b)}`);
      u.if((0, e._)`typeof ${f} == "string"`, () => y(), () => a.error(!1, { discrError: t.DiscrError.Tag, tag: f, tagName: b })), a.ok(w);
      function y() {
        const E = p();
        u.if(!1);
        for (const m in E)
          u.elseIf((0, e._)`${f} === ${m}`), u.assign(w, o(E[m]));
        u.else(), a.error(!1, { discrError: t.DiscrError.Mapping, tag: f, tagName: b }), u.endIf();
      }
      function o(E) {
        const m = u.name("valid"), v = a.subschema({ keyword: "oneOf", schemaProp: E }, m);
        return a.mergeEvaluated(v, e.Name), m;
      }
      function p() {
        var E;
        const m = {}, v = T($);
        let P = !0;
        for (let D = 0; D < _.length; D++) {
          let z = _[D];
          if (z?.$ref && !(0, l.schemaHasRulesButRef)(z, g.self.RULES)) {
            const M = z.$ref;
            if (z = s.resolveRef.call(g.self, g.schemaEnv.root, g.baseId, M), z instanceof s.SchemaEnv && (z = z.schema), z === void 0)
              throw new r.default(g.opts.uriResolver, g.baseId, M);
          }
          const U = (E = z?.properties) === null || E === void 0 ? void 0 : E[b];
          if (typeof U != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${b}"`);
          P = P && (v || T(z)), C(U, D);
        }
        if (!P)
          throw new Error(`discriminator: "${b}" must be required`);
        return m;
        function T({ required: D }) {
          return Array.isArray(D) && D.includes(b);
        }
        function C(D, z) {
          if (D.const)
            V(D.const, z);
          else if (D.enum)
            for (const U of D.enum)
              V(U, z);
          else
            throw new Error(`discriminator: "properties/${b}" must have "const" or "enum"`);
        }
        function V(D, z) {
          if (typeof D != "string" || D in m)
            throw new Error(`discriminator: "${b}" values must be unique strings`);
          m[D] = z;
        }
      }
    }
  };
  return pn.default = i, pn;
}
const Th = "http://json-schema.org/draft-07/schema#", jh = "http://json-schema.org/draft-07/schema#", Ah = "Core schema meta-schema", kh = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, qh = ["object", "boolean"], Ch = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, Dh = {
  $schema: Th,
  $id: jh,
  title: Ah,
  definitions: kh,
  type: qh,
  properties: Ch,
  default: !0
};
var cc;
function Mh() {
  return cc || (cc = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const s = Wf(), r = Nh(), l = Ih(), n = Dh, i = ["/properties"], a = "http://json-schema.org/draft-07/schema";
    class u extends s.default {
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((b) => this.addVocabulary(b)), this.opts.discriminator && this.addKeyword(l.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const b = this.opts.$data ? this.$dataMetaSchema(n, i) : n;
        this.addMetaSchema(b, a, !1), this.refs["http://json-schema.org/schema"] = a;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(a) ? a : void 0);
      }
    }
    t.Ajv = u, e.exports = t = u, e.exports.Ajv = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
    var d = An();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return d.KeywordCxt;
    } });
    var c = ne();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return c._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return c.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return c.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return c.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return c.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return c.CodeGen;
    } });
    var $ = da();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return $.default;
    } });
    var g = kn();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return g.default;
    } });
  })(jr, jr.exports)), jr.exports;
}
var uc;
function Lh() {
  return uc || (uc = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = Mh(), s = ne(), r = s.operators, l = {
      formatMaximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
      formatMinimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
      formatExclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
    }, n = {
      message: ({ keyword: a, schemaCode: u }) => (0, s.str)`should be ${l[a].okStr} ${u}`,
      params: ({ keyword: a, schemaCode: u }) => (0, s._)`{comparison: ${l[a].okStr}, limit: ${u}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(l),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: n,
      code(a) {
        const { gen: u, data: d, schemaCode: c, keyword: $, it: g } = a, { opts: _, self: b } = g;
        if (!_.validateFormats)
          return;
        const w = new t.KeywordCxt(g, b.RULES.all.format.definition, "format");
        w.$data ? f() : y();
        function f() {
          const p = u.scopeValue("formats", {
            ref: b.formats,
            code: _.code.formats
          }), E = u.const("fmt", (0, s._)`${p}[${w.schemaCode}]`);
          a.fail$data((0, s.or)((0, s._)`typeof ${E} != "object"`, (0, s._)`${E} instanceof RegExp`, (0, s._)`typeof ${E}.compare != "function"`, o(E)));
        }
        function y() {
          const p = w.schema, E = b.formats[p];
          if (!E || E === !0)
            return;
          if (typeof E != "object" || E instanceof RegExp || typeof E.compare != "function")
            throw new Error(`"${$}": format "${p}" does not define "compare" function`);
          const m = u.scopeValue("formats", {
            key: p,
            ref: E,
            code: _.code.formats ? (0, s._)`${_.code.formats}${(0, s.getProperty)(p)}` : void 0
          });
          a.fail$data(o(m));
        }
        function o(p) {
          return (0, s._)`${p}.compare(${d}, ${c}) ${l[$].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const i = (a) => (a.addKeyword(e.formatLimitDefinition), a);
    e.default = i;
  })(ts)), ts;
}
var lc;
function Vh() {
  return lc || (lc = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const s = qf(), r = Lh(), l = ne(), n = new l.Name("fullFormats"), i = new l.Name("fastFormats"), a = (d, c = { keywords: !0 }) => {
      if (Array.isArray(c))
        return u(d, c, s.fullFormats, n), d;
      const [$, g] = c.mode === "fast" ? [s.fastFormats, i] : [s.fullFormats, n], _ = c.formats || s.formatNames;
      return u(d, _, $, g), c.keywords && (0, r.default)(d), d;
    };
    a.get = (d, c = "full") => {
      const g = (c === "fast" ? s.fastFormats : s.fullFormats)[d];
      if (!g)
        throw new Error(`Unknown format "${d}"`);
      return g;
    };
    function u(d, c, $, g) {
      var _, b;
      (_ = (b = d.opts.code).formats) !== null && _ !== void 0 || (b.formats = (0, l._)`require("ajv-formats/dist/formats").${g}`);
      for (const w of c)
        d.addFormat(w, $[w]);
    }
    e.exports = t = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
  })(Tr, Tr.exports)), Tr.exports;
}
var Fh = Vh();
const zh = /* @__PURE__ */ gu(Fh), Uh = (e, t, s, r) => {
  if (s === "length" || s === "prototype" || s === "arguments" || s === "caller")
    return;
  const l = Object.getOwnPropertyDescriptor(e, s), n = Object.getOwnPropertyDescriptor(t, s);
  !Kh(l, n) && r || Object.defineProperty(e, s, n);
}, Kh = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Gh = (e, t) => {
  const s = Object.getPrototypeOf(t);
  s !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, s);
}, Hh = (e, t) => `/* Wrapped ${e}*/
${t}`, Jh = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Bh = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), Wh = (e, t, s) => {
  const r = s === "" ? "" : `with ${s.trim()}() `, l = Hh.bind(null, r, t.toString());
  Object.defineProperty(l, "name", Bh);
  const { writable: n, enumerable: i, configurable: a } = Jh;
  Object.defineProperty(e, "toString", { value: l, writable: n, enumerable: i, configurable: a });
};
function Xh(e, t, { ignoreNonConfigurable: s = !1 } = {}) {
  const { name: r } = e;
  for (const l of Reflect.ownKeys(t))
    Uh(e, t, l, s);
  return Gh(e, t), Wh(e, t, r), e;
}
const dc = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: s = 0,
    maxWait: r = Number.POSITIVE_INFINITY,
    before: l = !1,
    after: n = !0
  } = t;
  if (s < 0 || r < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!l && !n)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let i, a, u;
  const d = function(...c) {
    const $ = this, g = () => {
      i = void 0, a && (clearTimeout(a), a = void 0), n && (u = e.apply($, c));
    }, _ = () => {
      a = void 0, i && (clearTimeout(i), i = void 0), n && (u = e.apply($, c));
    }, b = l && !i;
    return clearTimeout(i), i = setTimeout(g, s), r > 0 && r !== Number.POSITIVE_INFINITY && !a && (a = setTimeout(_, r)), b && (u = e.apply($, c)), u;
  };
  return Xh(d, e), d.cancel = () => {
    i && (clearTimeout(i), i = void 0), a && (clearTimeout(a), a = void 0);
  }, d;
};
var yn = { exports: {} }, us, fc;
function qn() {
  if (fc) return us;
  fc = 1;
  const e = "2.0.0", t = 256, s = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, r = 16, l = t - 6;
  return us = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: l,
    MAX_SAFE_INTEGER: s,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, us;
}
var ls, hc;
function Cn() {
  return hc || (hc = 1, ls = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), ls;
}
var mc;
function At() {
  return mc || (mc = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: s,
      MAX_SAFE_BUILD_LENGTH: r,
      MAX_LENGTH: l
    } = qn(), n = Cn();
    t = e.exports = {};
    const i = t.re = [], a = t.safeRe = [], u = t.src = [], d = t.safeSrc = [], c = t.t = {};
    let $ = 0;
    const g = "[a-zA-Z0-9-]", _ = [
      ["\\s", 1],
      ["\\d", l],
      [g, r]
    ], b = (f) => {
      for (const [y, o] of _)
        f = f.split(`${y}*`).join(`${y}{0,${o}}`).split(`${y}+`).join(`${y}{1,${o}}`);
      return f;
    }, w = (f, y, o) => {
      const p = b(y), E = $++;
      n(f, E, y), c[f] = E, u[E] = y, d[E] = p, i[E] = new RegExp(y, o ? "g" : void 0), a[E] = new RegExp(p, o ? "g" : void 0);
    };
    w("NUMERICIDENTIFIER", "0|[1-9]\\d*"), w("NUMERICIDENTIFIERLOOSE", "\\d+"), w("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${g}*`), w("MAINVERSION", `(${u[c.NUMERICIDENTIFIER]})\\.(${u[c.NUMERICIDENTIFIER]})\\.(${u[c.NUMERICIDENTIFIER]})`), w("MAINVERSIONLOOSE", `(${u[c.NUMERICIDENTIFIERLOOSE]})\\.(${u[c.NUMERICIDENTIFIERLOOSE]})\\.(${u[c.NUMERICIDENTIFIERLOOSE]})`), w("PRERELEASEIDENTIFIER", `(?:${u[c.NONNUMERICIDENTIFIER]}|${u[c.NUMERICIDENTIFIER]})`), w("PRERELEASEIDENTIFIERLOOSE", `(?:${u[c.NONNUMERICIDENTIFIER]}|${u[c.NUMERICIDENTIFIERLOOSE]})`), w("PRERELEASE", `(?:-(${u[c.PRERELEASEIDENTIFIER]}(?:\\.${u[c.PRERELEASEIDENTIFIER]})*))`), w("PRERELEASELOOSE", `(?:-?(${u[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[c.PRERELEASEIDENTIFIERLOOSE]})*))`), w("BUILDIDENTIFIER", `${g}+`), w("BUILD", `(?:\\+(${u[c.BUILDIDENTIFIER]}(?:\\.${u[c.BUILDIDENTIFIER]})*))`), w("FULLPLAIN", `v?${u[c.MAINVERSION]}${u[c.PRERELEASE]}?${u[c.BUILD]}?`), w("FULL", `^${u[c.FULLPLAIN]}$`), w("LOOSEPLAIN", `[v=\\s]*${u[c.MAINVERSIONLOOSE]}${u[c.PRERELEASELOOSE]}?${u[c.BUILD]}?`), w("LOOSE", `^${u[c.LOOSEPLAIN]}$`), w("GTLT", "((?:<|>)?=?)"), w("XRANGEIDENTIFIERLOOSE", `${u[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), w("XRANGEIDENTIFIER", `${u[c.NUMERICIDENTIFIER]}|x|X|\\*`), w("XRANGEPLAIN", `[v=\\s]*(${u[c.XRANGEIDENTIFIER]})(?:\\.(${u[c.XRANGEIDENTIFIER]})(?:\\.(${u[c.XRANGEIDENTIFIER]})(?:${u[c.PRERELEASE]})?${u[c.BUILD]}?)?)?`), w("XRANGEPLAINLOOSE", `[v=\\s]*(${u[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[c.XRANGEIDENTIFIERLOOSE]})(?:${u[c.PRERELEASELOOSE]})?${u[c.BUILD]}?)?)?`), w("XRANGE", `^${u[c.GTLT]}\\s*${u[c.XRANGEPLAIN]}$`), w("XRANGELOOSE", `^${u[c.GTLT]}\\s*${u[c.XRANGEPLAINLOOSE]}$`), w("COERCEPLAIN", `(^|[^\\d])(\\d{1,${s}})(?:\\.(\\d{1,${s}}))?(?:\\.(\\d{1,${s}}))?`), w("COERCE", `${u[c.COERCEPLAIN]}(?:$|[^\\d])`), w("COERCEFULL", u[c.COERCEPLAIN] + `(?:${u[c.PRERELEASE]})?(?:${u[c.BUILD]})?(?:$|[^\\d])`), w("COERCERTL", u[c.COERCE], !0), w("COERCERTLFULL", u[c.COERCEFULL], !0), w("LONETILDE", "(?:~>?)"), w("TILDETRIM", `(\\s*)${u[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", w("TILDE", `^${u[c.LONETILDE]}${u[c.XRANGEPLAIN]}$`), w("TILDELOOSE", `^${u[c.LONETILDE]}${u[c.XRANGEPLAINLOOSE]}$`), w("LONECARET", "(?:\\^)"), w("CARETTRIM", `(\\s*)${u[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", w("CARET", `^${u[c.LONECARET]}${u[c.XRANGEPLAIN]}$`), w("CARETLOOSE", `^${u[c.LONECARET]}${u[c.XRANGEPLAINLOOSE]}$`), w("COMPARATORLOOSE", `^${u[c.GTLT]}\\s*(${u[c.LOOSEPLAIN]})$|^$`), w("COMPARATOR", `^${u[c.GTLT]}\\s*(${u[c.FULLPLAIN]})$|^$`), w("COMPARATORTRIM", `(\\s*)${u[c.GTLT]}\\s*(${u[c.LOOSEPLAIN]}|${u[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", w("HYPHENRANGE", `^\\s*(${u[c.XRANGEPLAIN]})\\s+-\\s+(${u[c.XRANGEPLAIN]})\\s*$`), w("HYPHENRANGELOOSE", `^\\s*(${u[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[c.XRANGEPLAINLOOSE]})\\s*$`), w("STAR", "(<|>)?=?\\s*\\*"), w("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), w("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(yn, yn.exports)), yn.exports;
}
var ds, pc;
function ma() {
  if (pc) return ds;
  pc = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return ds = (r) => r ? typeof r != "object" ? e : r : t, ds;
}
var fs, yc;
function ku() {
  if (yc) return fs;
  yc = 1;
  const e = /^[0-9]+$/, t = (r, l) => {
    if (typeof r == "number" && typeof l == "number")
      return r === l ? 0 : r < l ? -1 : 1;
    const n = e.test(r), i = e.test(l);
    return n && i && (r = +r, l = +l), r === l ? 0 : n && !i ? -1 : i && !n ? 1 : r < l ? -1 : 1;
  };
  return fs = {
    compareIdentifiers: t,
    rcompareIdentifiers: (r, l) => t(l, r)
  }, fs;
}
var hs, vc;
function Pe() {
  if (vc) return hs;
  vc = 1;
  const e = Cn(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: s } = qn(), { safeRe: r, t: l } = At(), n = ma(), { compareIdentifiers: i } = ku();
  class a {
    constructor(d, c) {
      if (c = n(c), d instanceof a) {
        if (d.loose === !!c.loose && d.includePrerelease === !!c.includePrerelease)
          return d;
        d = d.version;
      } else if (typeof d != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof d}".`);
      if (d.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", d, c), this.options = c, this.loose = !!c.loose, this.includePrerelease = !!c.includePrerelease;
      const $ = d.trim().match(c.loose ? r[l.LOOSE] : r[l.FULL]);
      if (!$)
        throw new TypeError(`Invalid Version: ${d}`);
      if (this.raw = d, this.major = +$[1], this.minor = +$[2], this.patch = +$[3], this.major > s || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > s || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > s || this.patch < 0)
        throw new TypeError("Invalid patch version");
      $[4] ? this.prerelease = $[4].split(".").map((g) => {
        if (/^[0-9]+$/.test(g)) {
          const _ = +g;
          if (_ >= 0 && _ < s)
            return _;
        }
        return g;
      }) : this.prerelease = [], this.build = $[5] ? $[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(d) {
      if (e("SemVer.compare", this.version, this.options, d), !(d instanceof a)) {
        if (typeof d == "string" && d === this.version)
          return 0;
        d = new a(d, this.options);
      }
      return d.version === this.version ? 0 : this.compareMain(d) || this.comparePre(d);
    }
    compareMain(d) {
      return d instanceof a || (d = new a(d, this.options)), this.major < d.major ? -1 : this.major > d.major ? 1 : this.minor < d.minor ? -1 : this.minor > d.minor ? 1 : this.patch < d.patch ? -1 : this.patch > d.patch ? 1 : 0;
    }
    comparePre(d) {
      if (d instanceof a || (d = new a(d, this.options)), this.prerelease.length && !d.prerelease.length)
        return -1;
      if (!this.prerelease.length && d.prerelease.length)
        return 1;
      if (!this.prerelease.length && !d.prerelease.length)
        return 0;
      let c = 0;
      do {
        const $ = this.prerelease[c], g = d.prerelease[c];
        if (e("prerelease compare", c, $, g), $ === void 0 && g === void 0)
          return 0;
        if (g === void 0)
          return 1;
        if ($ === void 0)
          return -1;
        if ($ === g)
          continue;
        return i($, g);
      } while (++c);
    }
    compareBuild(d) {
      d instanceof a || (d = new a(d, this.options));
      let c = 0;
      do {
        const $ = this.build[c], g = d.build[c];
        if (e("build compare", c, $, g), $ === void 0 && g === void 0)
          return 0;
        if (g === void 0)
          return 1;
        if ($ === void 0)
          return -1;
        if ($ === g)
          continue;
        return i($, g);
      } while (++c);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(d, c, $) {
      if (d.startsWith("pre")) {
        if (!c && $ === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (c) {
          const g = `-${c}`.match(this.options.loose ? r[l.PRERELEASELOOSE] : r[l.PRERELEASE]);
          if (!g || g[1] !== c)
            throw new Error(`invalid identifier: ${c}`);
        }
      }
      switch (d) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", c, $);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", c, $);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", c, $), this.inc("pre", c, $);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", c, $), this.inc("pre", c, $);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const g = Number($) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [g];
          else {
            let _ = this.prerelease.length;
            for (; --_ >= 0; )
              typeof this.prerelease[_] == "number" && (this.prerelease[_]++, _ = -2);
            if (_ === -1) {
              if (c === this.prerelease.join(".") && $ === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(g);
            }
          }
          if (c) {
            let _ = [c, g];
            $ === !1 && (_ = [c]), i(this.prerelease[0], c) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = _) : this.prerelease = _;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${d}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return hs = a, hs;
}
var ms, gc;
function bt() {
  if (gc) return ms;
  gc = 1;
  const e = Pe();
  return ms = (s, r, l = !1) => {
    if (s instanceof e)
      return s;
    try {
      return new e(s, r);
    } catch (n) {
      if (!l)
        return null;
      throw n;
    }
  }, ms;
}
var ps, _c;
function Yh() {
  if (_c) return ps;
  _c = 1;
  const e = bt();
  return ps = (s, r) => {
    const l = e(s, r);
    return l ? l.version : null;
  }, ps;
}
var ys, $c;
function Qh() {
  if ($c) return ys;
  $c = 1;
  const e = bt();
  return ys = (s, r) => {
    const l = e(s.trim().replace(/^[=v]+/, ""), r);
    return l ? l.version : null;
  }, ys;
}
var vs, wc;
function Zh() {
  if (wc) return vs;
  wc = 1;
  const e = Pe();
  return vs = (s, r, l, n, i) => {
    typeof l == "string" && (i = n, n = l, l = void 0);
    try {
      return new e(
        s instanceof e ? s.version : s,
        l
      ).inc(r, n, i).version;
    } catch {
      return null;
    }
  }, vs;
}
var gs, Ec;
function xh() {
  if (Ec) return gs;
  Ec = 1;
  const e = bt();
  return gs = (s, r) => {
    const l = e(s, null, !0), n = e(r, null, !0), i = l.compare(n);
    if (i === 0)
      return null;
    const a = i > 0, u = a ? l : n, d = a ? n : l, c = !!u.prerelease.length;
    if (!!d.prerelease.length && !c) {
      if (!d.patch && !d.minor)
        return "major";
      if (d.compareMain(u) === 0)
        return d.minor && !d.patch ? "minor" : "patch";
    }
    const g = c ? "pre" : "";
    return l.major !== n.major ? g + "major" : l.minor !== n.minor ? g + "minor" : l.patch !== n.patch ? g + "patch" : "prerelease";
  }, gs;
}
var _s, bc;
function em() {
  if (bc) return _s;
  bc = 1;
  const e = Pe();
  return _s = (s, r) => new e(s, r).major, _s;
}
var $s, Sc;
function tm() {
  if (Sc) return $s;
  Sc = 1;
  const e = Pe();
  return $s = (s, r) => new e(s, r).minor, $s;
}
var ws, Pc;
function rm() {
  if (Pc) return ws;
  Pc = 1;
  const e = Pe();
  return ws = (s, r) => new e(s, r).patch, ws;
}
var Es, Rc;
function nm() {
  if (Rc) return Es;
  Rc = 1;
  const e = bt();
  return Es = (s, r) => {
    const l = e(s, r);
    return l && l.prerelease.length ? l.prerelease : null;
  }, Es;
}
var bs, Nc;
function Le() {
  if (Nc) return bs;
  Nc = 1;
  const e = Pe();
  return bs = (s, r, l) => new e(s, l).compare(new e(r, l)), bs;
}
var Ss, Oc;
function sm() {
  if (Oc) return Ss;
  Oc = 1;
  const e = Le();
  return Ss = (s, r, l) => e(r, s, l), Ss;
}
var Ps, Ic;
function am() {
  if (Ic) return Ps;
  Ic = 1;
  const e = Le();
  return Ps = (s, r) => e(s, r, !0), Ps;
}
var Rs, Tc;
function pa() {
  if (Tc) return Rs;
  Tc = 1;
  const e = Pe();
  return Rs = (s, r, l) => {
    const n = new e(s, l), i = new e(r, l);
    return n.compare(i) || n.compareBuild(i);
  }, Rs;
}
var Ns, jc;
function om() {
  if (jc) return Ns;
  jc = 1;
  const e = pa();
  return Ns = (s, r) => s.sort((l, n) => e(l, n, r)), Ns;
}
var Os, Ac;
function im() {
  if (Ac) return Os;
  Ac = 1;
  const e = pa();
  return Os = (s, r) => s.sort((l, n) => e(n, l, r)), Os;
}
var Is, kc;
function Dn() {
  if (kc) return Is;
  kc = 1;
  const e = Le();
  return Is = (s, r, l) => e(s, r, l) > 0, Is;
}
var Ts, qc;
function ya() {
  if (qc) return Ts;
  qc = 1;
  const e = Le();
  return Ts = (s, r, l) => e(s, r, l) < 0, Ts;
}
var js, Cc;
function qu() {
  if (Cc) return js;
  Cc = 1;
  const e = Le();
  return js = (s, r, l) => e(s, r, l) === 0, js;
}
var As, Dc;
function Cu() {
  if (Dc) return As;
  Dc = 1;
  const e = Le();
  return As = (s, r, l) => e(s, r, l) !== 0, As;
}
var ks, Mc;
function va() {
  if (Mc) return ks;
  Mc = 1;
  const e = Le();
  return ks = (s, r, l) => e(s, r, l) >= 0, ks;
}
var qs, Lc;
function ga() {
  if (Lc) return qs;
  Lc = 1;
  const e = Le();
  return qs = (s, r, l) => e(s, r, l) <= 0, qs;
}
var Cs, Vc;
function Du() {
  if (Vc) return Cs;
  Vc = 1;
  const e = qu(), t = Cu(), s = Dn(), r = va(), l = ya(), n = ga();
  return Cs = (a, u, d, c) => {
    switch (u) {
      case "===":
        return typeof a == "object" && (a = a.version), typeof d == "object" && (d = d.version), a === d;
      case "!==":
        return typeof a == "object" && (a = a.version), typeof d == "object" && (d = d.version), a !== d;
      case "":
      case "=":
      case "==":
        return e(a, d, c);
      case "!=":
        return t(a, d, c);
      case ">":
        return s(a, d, c);
      case ">=":
        return r(a, d, c);
      case "<":
        return l(a, d, c);
      case "<=":
        return n(a, d, c);
      default:
        throw new TypeError(`Invalid operator: ${u}`);
    }
  }, Cs;
}
var Ds, Fc;
function cm() {
  if (Fc) return Ds;
  Fc = 1;
  const e = Pe(), t = bt(), { safeRe: s, t: r } = At();
  return Ds = (n, i) => {
    if (n instanceof e)
      return n;
    if (typeof n == "number" && (n = String(n)), typeof n != "string")
      return null;
    i = i || {};
    let a = null;
    if (!i.rtl)
      a = n.match(i.includePrerelease ? s[r.COERCEFULL] : s[r.COERCE]);
    else {
      const _ = i.includePrerelease ? s[r.COERCERTLFULL] : s[r.COERCERTL];
      let b;
      for (; (b = _.exec(n)) && (!a || a.index + a[0].length !== n.length); )
        (!a || b.index + b[0].length !== a.index + a[0].length) && (a = b), _.lastIndex = b.index + b[1].length + b[2].length;
      _.lastIndex = -1;
    }
    if (a === null)
      return null;
    const u = a[2], d = a[3] || "0", c = a[4] || "0", $ = i.includePrerelease && a[5] ? `-${a[5]}` : "", g = i.includePrerelease && a[6] ? `+${a[6]}` : "";
    return t(`${u}.${d}.${c}${$}${g}`, i);
  }, Ds;
}
var Ms, zc;
function um() {
  if (zc) return Ms;
  zc = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(s) {
      const r = this.map.get(s);
      if (r !== void 0)
        return this.map.delete(s), this.map.set(s, r), r;
    }
    delete(s) {
      return this.map.delete(s);
    }
    set(s, r) {
      if (!this.delete(s) && r !== void 0) {
        if (this.map.size >= this.max) {
          const n = this.map.keys().next().value;
          this.delete(n);
        }
        this.map.set(s, r);
      }
      return this;
    }
  }
  return Ms = e, Ms;
}
var Ls, Uc;
function Ve() {
  if (Uc) return Ls;
  Uc = 1;
  const e = /\s+/g;
  class t {
    constructor(F, W) {
      if (W = l(W), F instanceof t)
        return F.loose === !!W.loose && F.includePrerelease === !!W.includePrerelease ? F : new t(F.raw, W);
      if (F instanceof n)
        return this.raw = F.value, this.set = [[F]], this.formatted = void 0, this;
      if (this.options = W, this.loose = !!W.loose, this.includePrerelease = !!W.includePrerelease, this.raw = F.trim().replace(e, " "), this.set = this.raw.split("||").map((B) => this.parseRange(B.trim())).filter((B) => B.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const B = this.set[0];
        if (this.set = this.set.filter((J) => !w(J[0])), this.set.length === 0)
          this.set = [B];
        else if (this.set.length > 1) {
          for (const J of this.set)
            if (J.length === 1 && f(J[0])) {
              this.set = [J];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let F = 0; F < this.set.length; F++) {
          F > 0 && (this.formatted += "||");
          const W = this.set[F];
          for (let B = 0; B < W.length; B++)
            B > 0 && (this.formatted += " "), this.formatted += W[B].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(F) {
      const B = ((this.options.includePrerelease && _) | (this.options.loose && b)) + ":" + F, J = r.get(B);
      if (J)
        return J;
      const Y = this.options.loose, k = Y ? u[d.HYPHENRANGELOOSE] : u[d.HYPHENRANGE];
      F = F.replace(k, z(this.options.includePrerelease)), i("hyphen replace", F), F = F.replace(u[d.COMPARATORTRIM], c), i("comparator trim", F), F = F.replace(u[d.TILDETRIM], $), i("tilde trim", F), F = F.replace(u[d.CARETTRIM], g), i("caret trim", F);
      let N = F.split(" ").map((S) => o(S, this.options)).join(" ").split(/\s+/).map((S) => D(S, this.options));
      Y && (N = N.filter((S) => (i("loose invalid filter", S, this.options), !!S.match(u[d.COMPARATORLOOSE])))), i("range list", N);
      const A = /* @__PURE__ */ new Map(), O = N.map((S) => new n(S, this.options));
      for (const S of O) {
        if (w(S))
          return [S];
        A.set(S.value, S);
      }
      A.size > 1 && A.has("") && A.delete("");
      const h = [...A.values()];
      return r.set(B, h), h;
    }
    intersects(F, W) {
      if (!(F instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((B) => y(B, W) && F.set.some((J) => y(J, W) && B.every((Y) => J.every((k) => Y.intersects(k, W)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(F) {
      if (!F)
        return !1;
      if (typeof F == "string")
        try {
          F = new a(F, this.options);
        } catch {
          return !1;
        }
      for (let W = 0; W < this.set.length; W++)
        if (U(this.set[W], F, this.options))
          return !0;
      return !1;
    }
  }
  Ls = t;
  const s = um(), r = new s(), l = ma(), n = Mn(), i = Cn(), a = Pe(), {
    safeRe: u,
    t: d,
    comparatorTrimReplace: c,
    tildeTrimReplace: $,
    caretTrimReplace: g
  } = At(), { FLAG_INCLUDE_PRERELEASE: _, FLAG_LOOSE: b } = qn(), w = (M) => M.value === "<0.0.0-0", f = (M) => M.value === "", y = (M, F) => {
    let W = !0;
    const B = M.slice();
    let J = B.pop();
    for (; W && B.length; )
      W = B.every((Y) => J.intersects(Y, F)), J = B.pop();
    return W;
  }, o = (M, F) => (M = M.replace(u[d.BUILD], ""), i("comp", M, F), M = v(M, F), i("caret", M), M = E(M, F), i("tildes", M), M = T(M, F), i("xrange", M), M = V(M, F), i("stars", M), M), p = (M) => !M || M.toLowerCase() === "x" || M === "*", E = (M, F) => M.trim().split(/\s+/).map((W) => m(W, F)).join(" "), m = (M, F) => {
    const W = F.loose ? u[d.TILDELOOSE] : u[d.TILDE];
    return M.replace(W, (B, J, Y, k, N) => {
      i("tilde", M, B, J, Y, k, N);
      let A;
      return p(J) ? A = "" : p(Y) ? A = `>=${J}.0.0 <${+J + 1}.0.0-0` : p(k) ? A = `>=${J}.${Y}.0 <${J}.${+Y + 1}.0-0` : N ? (i("replaceTilde pr", N), A = `>=${J}.${Y}.${k}-${N} <${J}.${+Y + 1}.0-0`) : A = `>=${J}.${Y}.${k} <${J}.${+Y + 1}.0-0`, i("tilde return", A), A;
    });
  }, v = (M, F) => M.trim().split(/\s+/).map((W) => P(W, F)).join(" "), P = (M, F) => {
    i("caret", M, F);
    const W = F.loose ? u[d.CARETLOOSE] : u[d.CARET], B = F.includePrerelease ? "-0" : "";
    return M.replace(W, (J, Y, k, N, A) => {
      i("caret", M, J, Y, k, N, A);
      let O;
      return p(Y) ? O = "" : p(k) ? O = `>=${Y}.0.0${B} <${+Y + 1}.0.0-0` : p(N) ? Y === "0" ? O = `>=${Y}.${k}.0${B} <${Y}.${+k + 1}.0-0` : O = `>=${Y}.${k}.0${B} <${+Y + 1}.0.0-0` : A ? (i("replaceCaret pr", A), Y === "0" ? k === "0" ? O = `>=${Y}.${k}.${N}-${A} <${Y}.${k}.${+N + 1}-0` : O = `>=${Y}.${k}.${N}-${A} <${Y}.${+k + 1}.0-0` : O = `>=${Y}.${k}.${N}-${A} <${+Y + 1}.0.0-0`) : (i("no pr"), Y === "0" ? k === "0" ? O = `>=${Y}.${k}.${N}${B} <${Y}.${k}.${+N + 1}-0` : O = `>=${Y}.${k}.${N}${B} <${Y}.${+k + 1}.0-0` : O = `>=${Y}.${k}.${N} <${+Y + 1}.0.0-0`), i("caret return", O), O;
    });
  }, T = (M, F) => (i("replaceXRanges", M, F), M.split(/\s+/).map((W) => C(W, F)).join(" ")), C = (M, F) => {
    M = M.trim();
    const W = F.loose ? u[d.XRANGELOOSE] : u[d.XRANGE];
    return M.replace(W, (B, J, Y, k, N, A) => {
      i("xRange", M, B, J, Y, k, N, A);
      const O = p(Y), h = O || p(k), S = h || p(N), j = S;
      return J === "=" && j && (J = ""), A = F.includePrerelease ? "-0" : "", O ? J === ">" || J === "<" ? B = "<0.0.0-0" : B = "*" : J && j ? (h && (k = 0), N = 0, J === ">" ? (J = ">=", h ? (Y = +Y + 1, k = 0, N = 0) : (k = +k + 1, N = 0)) : J === "<=" && (J = "<", h ? Y = +Y + 1 : k = +k + 1), J === "<" && (A = "-0"), B = `${J + Y}.${k}.${N}${A}`) : h ? B = `>=${Y}.0.0${A} <${+Y + 1}.0.0-0` : S && (B = `>=${Y}.${k}.0${A} <${Y}.${+k + 1}.0-0`), i("xRange return", B), B;
    });
  }, V = (M, F) => (i("replaceStars", M, F), M.trim().replace(u[d.STAR], "")), D = (M, F) => (i("replaceGTE0", M, F), M.trim().replace(u[F.includePrerelease ? d.GTE0PRE : d.GTE0], "")), z = (M) => (F, W, B, J, Y, k, N, A, O, h, S, j) => (p(B) ? W = "" : p(J) ? W = `>=${B}.0.0${M ? "-0" : ""}` : p(Y) ? W = `>=${B}.${J}.0${M ? "-0" : ""}` : k ? W = `>=${W}` : W = `>=${W}${M ? "-0" : ""}`, p(O) ? A = "" : p(h) ? A = `<${+O + 1}.0.0-0` : p(S) ? A = `<${O}.${+h + 1}.0-0` : j ? A = `<=${O}.${h}.${S}-${j}` : M ? A = `<${O}.${h}.${+S + 1}-0` : A = `<=${A}`, `${W} ${A}`.trim()), U = (M, F, W) => {
    for (let B = 0; B < M.length; B++)
      if (!M[B].test(F))
        return !1;
    if (F.prerelease.length && !W.includePrerelease) {
      for (let B = 0; B < M.length; B++)
        if (i(M[B].semver), M[B].semver !== n.ANY && M[B].semver.prerelease.length > 0) {
          const J = M[B].semver;
          if (J.major === F.major && J.minor === F.minor && J.patch === F.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Ls;
}
var Vs, Kc;
function Mn() {
  if (Kc) return Vs;
  Kc = 1;
  const e = /* @__PURE__ */ Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, $) {
      if ($ = s($), c instanceof t) {
        if (c.loose === !!$.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), i("comparator", c, $), this.options = $, this.loose = !!$.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, i("comp", this);
    }
    parse(c) {
      const $ = this.options.loose ? r[l.COMPARATORLOOSE] : r[l.COMPARATOR], g = c.match($);
      if (!g)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = g[1] !== void 0 ? g[1] : "", this.operator === "=" && (this.operator = ""), g[2] ? this.semver = new a(g[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (i("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new a(c, this.options);
        } catch {
          return !1;
        }
      return n(c, this.operator, this.semver, this.options);
    }
    intersects(c, $) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new u(c.value, $).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new u(this.value, $).test(c.semver) : ($ = s($), $.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !$.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || n(this.semver, "<", c.semver, $) && this.operator.startsWith(">") && c.operator.startsWith("<") || n(this.semver, ">", c.semver, $) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  Vs = t;
  const s = ma(), { safeRe: r, t: l } = At(), n = Du(), i = Cn(), a = Pe(), u = Ve();
  return Vs;
}
var Fs, Gc;
function Ln() {
  if (Gc) return Fs;
  Gc = 1;
  const e = Ve();
  return Fs = (s, r, l) => {
    try {
      r = new e(r, l);
    } catch {
      return !1;
    }
    return r.test(s);
  }, Fs;
}
var zs, Hc;
function lm() {
  if (Hc) return zs;
  Hc = 1;
  const e = Ve();
  return zs = (s, r) => new e(s, r).set.map((l) => l.map((n) => n.value).join(" ").trim().split(" ")), zs;
}
var Us, Jc;
function dm() {
  if (Jc) return Us;
  Jc = 1;
  const e = Pe(), t = Ve();
  return Us = (r, l, n) => {
    let i = null, a = null, u = null;
    try {
      u = new t(l, n);
    } catch {
      return null;
    }
    return r.forEach((d) => {
      u.test(d) && (!i || a.compare(d) === -1) && (i = d, a = new e(i, n));
    }), i;
  }, Us;
}
var Ks, Bc;
function fm() {
  if (Bc) return Ks;
  Bc = 1;
  const e = Pe(), t = Ve();
  return Ks = (r, l, n) => {
    let i = null, a = null, u = null;
    try {
      u = new t(l, n);
    } catch {
      return null;
    }
    return r.forEach((d) => {
      u.test(d) && (!i || a.compare(d) === 1) && (i = d, a = new e(i, n));
    }), i;
  }, Ks;
}
var Gs, Wc;
function hm() {
  if (Wc) return Gs;
  Wc = 1;
  const e = Pe(), t = Ve(), s = Dn();
  return Gs = (l, n) => {
    l = new t(l, n);
    let i = new e("0.0.0");
    if (l.test(i) || (i = new e("0.0.0-0"), l.test(i)))
      return i;
    i = null;
    for (let a = 0; a < l.set.length; ++a) {
      const u = l.set[a];
      let d = null;
      u.forEach((c) => {
        const $ = new e(c.semver.version);
        switch (c.operator) {
          case ">":
            $.prerelease.length === 0 ? $.patch++ : $.prerelease.push(0), $.raw = $.format();
          /* fallthrough */
          case "":
          case ">=":
            (!d || s($, d)) && (d = $);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${c.operator}`);
        }
      }), d && (!i || s(i, d)) && (i = d);
    }
    return i && l.test(i) ? i : null;
  }, Gs;
}
var Hs, Xc;
function mm() {
  if (Xc) return Hs;
  Xc = 1;
  const e = Ve();
  return Hs = (s, r) => {
    try {
      return new e(s, r).range || "*";
    } catch {
      return null;
    }
  }, Hs;
}
var Js, Yc;
function _a() {
  if (Yc) return Js;
  Yc = 1;
  const e = Pe(), t = Mn(), { ANY: s } = t, r = Ve(), l = Ln(), n = Dn(), i = ya(), a = ga(), u = va();
  return Js = (c, $, g, _) => {
    c = new e(c, _), $ = new r($, _);
    let b, w, f, y, o;
    switch (g) {
      case ">":
        b = n, w = a, f = i, y = ">", o = ">=";
        break;
      case "<":
        b = i, w = u, f = n, y = "<", o = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (l(c, $, _))
      return !1;
    for (let p = 0; p < $.set.length; ++p) {
      const E = $.set[p];
      let m = null, v = null;
      if (E.forEach((P) => {
        P.semver === s && (P = new t(">=0.0.0")), m = m || P, v = v || P, b(P.semver, m.semver, _) ? m = P : f(P.semver, v.semver, _) && (v = P);
      }), m.operator === y || m.operator === o || (!v.operator || v.operator === y) && w(c, v.semver))
        return !1;
      if (v.operator === o && f(c, v.semver))
        return !1;
    }
    return !0;
  }, Js;
}
var Bs, Qc;
function pm() {
  if (Qc) return Bs;
  Qc = 1;
  const e = _a();
  return Bs = (s, r, l) => e(s, r, ">", l), Bs;
}
var Ws, Zc;
function ym() {
  if (Zc) return Ws;
  Zc = 1;
  const e = _a();
  return Ws = (s, r, l) => e(s, r, "<", l), Ws;
}
var Xs, xc;
function vm() {
  if (xc) return Xs;
  xc = 1;
  const e = Ve();
  return Xs = (s, r, l) => (s = new e(s, l), r = new e(r, l), s.intersects(r, l)), Xs;
}
var Ys, eu;
function gm() {
  if (eu) return Ys;
  eu = 1;
  const e = Ln(), t = Le();
  return Ys = (s, r, l) => {
    const n = [];
    let i = null, a = null;
    const u = s.sort((g, _) => t(g, _, l));
    for (const g of u)
      e(g, r, l) ? (a = g, i || (i = g)) : (a && n.push([i, a]), a = null, i = null);
    i && n.push([i, null]);
    const d = [];
    for (const [g, _] of n)
      g === _ ? d.push(g) : !_ && g === u[0] ? d.push("*") : _ ? g === u[0] ? d.push(`<=${_}`) : d.push(`${g} - ${_}`) : d.push(`>=${g}`);
    const c = d.join(" || "), $ = typeof r.raw == "string" ? r.raw : String(r);
    return c.length < $.length ? c : r;
  }, Ys;
}
var Qs, tu;
function _m() {
  if (tu) return Qs;
  tu = 1;
  const e = Ve(), t = Mn(), { ANY: s } = t, r = Ln(), l = Le(), n = ($, g, _ = {}) => {
    if ($ === g)
      return !0;
    $ = new e($, _), g = new e(g, _);
    let b = !1;
    e: for (const w of $.set) {
      for (const f of g.set) {
        const y = u(w, f, _);
        if (b = b || y !== null, y)
          continue e;
      }
      if (b)
        return !1;
    }
    return !0;
  }, i = [new t(">=0.0.0-0")], a = [new t(">=0.0.0")], u = ($, g, _) => {
    if ($ === g)
      return !0;
    if ($.length === 1 && $[0].semver === s) {
      if (g.length === 1 && g[0].semver === s)
        return !0;
      _.includePrerelease ? $ = i : $ = a;
    }
    if (g.length === 1 && g[0].semver === s) {
      if (_.includePrerelease)
        return !0;
      g = a;
    }
    const b = /* @__PURE__ */ new Set();
    let w, f;
    for (const T of $)
      T.operator === ">" || T.operator === ">=" ? w = d(w, T, _) : T.operator === "<" || T.operator === "<=" ? f = c(f, T, _) : b.add(T.semver);
    if (b.size > 1)
      return null;
    let y;
    if (w && f) {
      if (y = l(w.semver, f.semver, _), y > 0)
        return null;
      if (y === 0 && (w.operator !== ">=" || f.operator !== "<="))
        return null;
    }
    for (const T of b) {
      if (w && !r(T, String(w), _) || f && !r(T, String(f), _))
        return null;
      for (const C of g)
        if (!r(T, String(C), _))
          return !1;
      return !0;
    }
    let o, p, E, m, v = f && !_.includePrerelease && f.semver.prerelease.length ? f.semver : !1, P = w && !_.includePrerelease && w.semver.prerelease.length ? w.semver : !1;
    v && v.prerelease.length === 1 && f.operator === "<" && v.prerelease[0] === 0 && (v = !1);
    for (const T of g) {
      if (m = m || T.operator === ">" || T.operator === ">=", E = E || T.operator === "<" || T.operator === "<=", w) {
        if (P && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === P.major && T.semver.minor === P.minor && T.semver.patch === P.patch && (P = !1), T.operator === ">" || T.operator === ">=") {
          if (o = d(w, T, _), o === T && o !== w)
            return !1;
        } else if (w.operator === ">=" && !r(w.semver, String(T), _))
          return !1;
      }
      if (f) {
        if (v && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === v.major && T.semver.minor === v.minor && T.semver.patch === v.patch && (v = !1), T.operator === "<" || T.operator === "<=") {
          if (p = c(f, T, _), p === T && p !== f)
            return !1;
        } else if (f.operator === "<=" && !r(f.semver, String(T), _))
          return !1;
      }
      if (!T.operator && (f || w) && y !== 0)
        return !1;
    }
    return !(w && E && !f && y !== 0 || f && m && !w && y !== 0 || P || v);
  }, d = ($, g, _) => {
    if (!$)
      return g;
    const b = l($.semver, g.semver, _);
    return b > 0 ? $ : b < 0 || g.operator === ">" && $.operator === ">=" ? g : $;
  }, c = ($, g, _) => {
    if (!$)
      return g;
    const b = l($.semver, g.semver, _);
    return b < 0 ? $ : b > 0 || g.operator === "<" && $.operator === "<=" ? g : $;
  };
  return Qs = n, Qs;
}
var Zs, ru;
function $m() {
  if (ru) return Zs;
  ru = 1;
  const e = At(), t = qn(), s = Pe(), r = ku(), l = bt(), n = Yh(), i = Qh(), a = Zh(), u = xh(), d = em(), c = tm(), $ = rm(), g = nm(), _ = Le(), b = sm(), w = am(), f = pa(), y = om(), o = im(), p = Dn(), E = ya(), m = qu(), v = Cu(), P = va(), T = ga(), C = Du(), V = cm(), D = Mn(), z = Ve(), U = Ln(), M = lm(), F = dm(), W = fm(), B = hm(), J = mm(), Y = _a(), k = pm(), N = ym(), A = vm(), O = gm(), h = _m();
  return Zs = {
    parse: l,
    valid: n,
    clean: i,
    inc: a,
    diff: u,
    major: d,
    minor: c,
    patch: $,
    prerelease: g,
    compare: _,
    rcompare: b,
    compareLoose: w,
    compareBuild: f,
    sort: y,
    rsort: o,
    gt: p,
    lt: E,
    eq: m,
    neq: v,
    gte: P,
    lte: T,
    cmp: C,
    coerce: V,
    Comparator: D,
    Range: z,
    satisfies: U,
    toComparators: M,
    maxSatisfying: F,
    minSatisfying: W,
    minVersion: B,
    validRange: J,
    outside: Y,
    gtr: k,
    ltr: N,
    intersects: A,
    simplifyRange: O,
    subset: h,
    SemVer: s,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: r.compareIdentifiers,
    rcompareIdentifiers: r.rcompareIdentifiers
  }, Zs;
}
var wm = $m();
const $t = /* @__PURE__ */ gu(wm), Em = Object.prototype.toString, bm = "[object Uint8Array]", Sm = "[object ArrayBuffer]";
function Mu(e, t, s) {
  return e ? e.constructor === t ? !0 : Em.call(e) === s : !1;
}
function Lu(e) {
  return Mu(e, Uint8Array, bm);
}
function Pm(e) {
  return Mu(e, ArrayBuffer, Sm);
}
function Rm(e) {
  return Lu(e) || Pm(e);
}
function Nm(e) {
  if (!Lu(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Om(e) {
  if (!Rm(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function xs(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ??= e.reduce((l, n) => l + n.length, 0);
  const s = new Uint8Array(t);
  let r = 0;
  for (const l of e)
    Nm(l), s.set(l, r), r += l.length;
  return s;
}
const nu = {
  utf8: new globalThis.TextDecoder("utf8")
};
function vn(e, t = "utf8") {
  return Om(e), nu[t] ??= new globalThis.TextDecoder(t), nu[t].decode(e);
}
function Im(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Tm = new globalThis.TextEncoder();
function ea(e) {
  return Im(e), Tm.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const su = "aes-256-cbc", Vu = /* @__PURE__ */ new Set([
  "aes-256-cbc",
  "aes-256-gcm",
  "aes-256-ctr"
]), jm = (e) => typeof e == "string" && Vu.has(e), Be = () => /* @__PURE__ */ Object.create(null), au = (e) => e !== void 0, ta = (e, t) => {
  const s = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), r = typeof t;
  if (s.has(r))
    throw new TypeError(`Setting a value of type \`${r}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, et = "__internal__", ra = `${et}.migrations.version`;
class Am {
  path;
  events;
  #n;
  #s;
  #a;
  #e;
  #t = {};
  #o = !1;
  #i;
  #c;
  #r;
  constructor(t = {}) {
    const s = this.#u(t);
    this.#e = s, this.#l(s), this.#f(s), this.#h(s), this.events = new EventTarget(), this.#s = s.encryptionKey, this.#a = s.encryptionAlgorithm ?? su, this.path = this.#m(s), this.#p(s), s.watch && this._watch();
  }
  get(t, s) {
    if (this.#e.accessPropertiesByDotNotation)
      return this._get(t, s);
    const { store: r } = this;
    return t in r ? r[t] : s;
  }
  set(t, s) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && s === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${et} key, as it's used to manage this module internal operations.`);
    const { store: r } = this, l = (n, i) => {
      if (ta(n, i), this.#e.accessPropertiesByDotNotation)
        kt(r, n, i);
      else {
        if (n === "__proto__" || n === "constructor" || n === "prototype")
          return;
        r[n] = i;
      }
    };
    if (typeof t == "object") {
      const n = t;
      for (const [i, a] of Object.entries(n))
        l(i, a);
    } else
      l(t, s);
    this.store = r;
  }
  has(t) {
    return this.#e.accessPropertiesByDotNotation ? Un(this.store, t) : t in this.store;
  }
  appendToArray(t, s) {
    ta(t, s);
    const r = this.#e.accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
    if (!Array.isArray(r))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    this.set(t, [...r, s]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const s of t)
      au(this.#t[s]) && this.set(s, this.#t[s]);
  }
  delete(t) {
    const { store: s } = this;
    this.#e.accessPropertiesByDotNotation ? Ju(s, t) : delete s[t], this.store = s;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = Be();
    for (const s of Object.keys(this.#t))
      au(this.#t[s]) && (ta(s, this.#t[s]), this.#e.accessPropertiesByDotNotation ? kt(t, s, this.#t[s]) : t[s] = this.#t[s]);
    this.store = t;
  }
  onDidChange(t, s) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof s != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof s}`);
    return this._handleValueChange(() => this.get(t), s);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleStoreChange(t);
  }
  get size() {
    return Object.keys(this.store).filter((s) => !this._isReservedKeyPath(s)).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    try {
      const t = x.readFileSync(this.path, this.#s ? null : "utf8"), s = this._decryptData(t);
      return ((l) => {
        const n = this._deserialize(l);
        return this.#o || this._validate(n), Object.assign(Be(), n);
      })(s);
    } catch (t) {
      if (t?.code === "ENOENT")
        return this._ensureDirectory(), Be();
      if (this.#e.clearInvalidConfig) {
        const s = t;
        if (s.name === "SyntaxError" || s.message?.startsWith("Config schema violation:") || s.message === "Failed to decrypt config data.")
          return Be();
      }
      throw t;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !Un(t, et))
      try {
        const s = x.readFileSync(this.path, this.#s ? null : "utf8"), r = this._decryptData(s), l = this._deserialize(r);
        Un(l, et) && kt(t, et, Ea(l, et));
      } catch {
      }
    this.#o || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, s] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, s]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    this.#i && (this.#i.close(), this.#i = void 0), this.#c && (x.unwatchFile(this.path), this.#c = !1), this.#r = void 0;
  }
  _decryptData(t) {
    const s = this.#s;
    if (!s)
      return typeof t == "string" ? t : vn(t);
    const r = this.#a, l = r === "aes-256-gcm" ? 16 : 0, n = ":".codePointAt(0), i = typeof t == "string" ? t.codePointAt(16) : t[16];
    if (!(n !== void 0 && i === n)) {
      if (r === "aes-256-cbc")
        return typeof t == "string" ? t : vn(t);
      throw new Error("Failed to decrypt config data.");
    }
    const u = (_) => {
      if (l === 0)
        return { ciphertext: _ };
      const b = _.length - l;
      if (b < 0)
        throw new Error("Invalid authentication tag length.");
      return {
        ciphertext: _.slice(0, b),
        authenticationTag: _.slice(b)
      };
    }, d = t.slice(0, 16), c = t.slice(17), $ = typeof c == "string" ? ea(c) : c, g = (_) => {
      const { ciphertext: b, authenticationTag: w } = u($), f = Rt.pbkdf2Sync(s, _, 1e4, 32, "sha512"), y = Rt.createDecipheriv(r, f, d);
      return w && y.setAuthTag(w), vn(xs([y.update(b), y.final()]));
    };
    try {
      return g(d);
    } catch {
      try {
        return g(d.toString());
      } catch {
      }
    }
    if (r === "aes-256-cbc")
      return typeof t == "string" ? t : vn(t);
    throw new Error("Failed to decrypt config data.");
  }
  _handleStoreChange(t) {
    let s = this.store;
    const r = () => {
      const l = s, n = this.store;
      $a(n, l) || (s = n, t.call(this, n, l));
    };
    return this.events.addEventListener("change", r), () => {
      this.events.removeEventListener("change", r);
    };
  }
  _handleValueChange(t, s) {
    let r = t();
    const l = () => {
      const n = r, i = t();
      $a(i, n) || (r = i, s.call(this, i, n));
    };
    return this.events.addEventListener("change", l), () => {
      this.events.removeEventListener("change", l);
    };
  }
  _deserialize = (t) => JSON.parse(t);
  _serialize = (t) => JSON.stringify(t, void 0, "	");
  _validate(t) {
    if (!this.#n || this.#n(t) || !this.#n.errors)
      return;
    const r = this.#n.errors.map(({ instancePath: l, message: n = "" }) => `\`${l.slice(1)}\` ${n}`);
    throw new Error("Config schema violation: " + r.join("; "));
  }
  _ensureDirectory() {
    x.mkdirSync(ce.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let s = this._serialize(t);
    const r = this.#s;
    if (r) {
      const l = Rt.randomBytes(16), n = Rt.pbkdf2Sync(r, l, 1e4, 32, "sha512"), i = Rt.createCipheriv(this.#a, n, l), a = xs([i.update(ea(s)), i.final()]), u = [l, ea(":"), a];
      this.#a === "aes-256-gcm" && u.push(i.getAuthTag()), s = xs(u);
    }
    if (me.env.SNAP)
      x.writeFileSync(this.path, s, { mode: this.#e.configFileMode });
    else
      try {
        vu(this.path, s, { mode: this.#e.configFileMode });
      } catch (l) {
        if (l?.code === "EXDEV") {
          x.writeFileSync(this.path, s, { mode: this.#e.configFileMode });
          return;
        }
        throw l;
      }
  }
  _watch() {
    if (this._ensureDirectory(), x.existsSync(this.path) || this._write(Be()), me.platform === "win32" || me.platform === "darwin") {
      this.#r ??= dc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 });
      const t = ce.dirname(this.path), s = ce.basename(this.path);
      this.#i = x.watch(t, { persistent: !1, encoding: "utf8" }, (r, l) => {
        l && l !== s || typeof this.#r == "function" && this.#r();
      });
    } else
      this.#r ??= dc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 }), x.watchFile(this.path, { persistent: !1 }, (t, s) => {
        typeof this.#r == "function" && this.#r();
      }), this.#c = !0;
  }
  _migrate(t, s, r) {
    let l = this._get(ra, "0.0.0");
    const n = Object.keys(t).filter((a) => this._shouldPerformMigration(a, l, s));
    let i = structuredClone(this.store);
    for (const a of n)
      try {
        r && r(this, {
          fromVersion: l,
          toVersion: a,
          finalVersion: s,
          versions: n
        });
        const u = t[a];
        u?.(this), this._set(ra, a), l = a, i = structuredClone(this.store);
      } catch (u) {
        this.store = i;
        const d = u instanceof Error ? u.message : String(u);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${d}`);
      }
    (this._isVersionInRangeFormat(l) || !$t.eq(l, s)) && this._set(ra, s);
  }
  _containsReservedKey(t) {
    return typeof t == "string" ? this._isReservedKeyPath(t) : !t || typeof t != "object" ? !1 : this._objectContainsReservedKey(t);
  }
  _objectContainsReservedKey(t) {
    if (!t || typeof t != "object")
      return !1;
    for (const [s, r] of Object.entries(t))
      if (this._isReservedKeyPath(s) || this._objectContainsReservedKey(r))
        return !0;
    return !1;
  }
  _isReservedKeyPath(t) {
    return t === et || t.startsWith(`${et}.`);
  }
  _isVersionInRangeFormat(t) {
    return $t.clean(t) === null;
  }
  _shouldPerformMigration(t, s, r) {
    return this._isVersionInRangeFormat(t) ? s !== "0.0.0" && $t.satisfies(s, t) ? !1 : $t.satisfies(r, t) : !($t.lte(t, s) || $t.gt(t, r));
  }
  _get(t, s) {
    return Ea(this.store, t, s);
  }
  _set(t, s) {
    const { store: r } = this;
    kt(r, t, s), this.store = r;
  }
  #u(t) {
    const s = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (s.encryptionAlgorithm ??= su, !jm(s.encryptionAlgorithm))
      throw new TypeError(`The \`encryptionAlgorithm\` option must be one of: ${[...Vu].join(", ")}`);
    if (!s.cwd) {
      if (!s.projectName)
        throw new Error("Please specify the `projectName` option.");
      s.cwd = Yu(s.projectName, { suffix: s.projectSuffix }).config;
    }
    return typeof s.fileExtension == "string" && (s.fileExtension = s.fileExtension.replace(/^\.+/, "")), s;
  }
  #l(t) {
    if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
      return;
    if (t.schema && typeof t.schema != "object")
      throw new TypeError("The `schema` option must be an object.");
    const s = zh.default, r = new kf.Ajv2020({
      allErrors: !0,
      useDefaults: !0,
      ...t.ajvOptions
    });
    s(r);
    const l = {
      ...t.rootSchema,
      type: "object",
      properties: t.schema
    };
    this.#n = r.compile(l), this.#d(t.schema);
  }
  #d(t) {
    const s = Object.entries(t ?? {});
    for (const [r, l] of s) {
      if (!l || typeof l != "object" || !Object.hasOwn(l, "default"))
        continue;
      const { default: n } = l;
      n !== void 0 && (this.#t[r] = n);
    }
  }
  #f(t) {
    t.defaults && Object.assign(this.#t, t.defaults);
  }
  #h(t) {
    t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
  }
  #m(t) {
    const s = typeof t.fileExtension == "string" ? t.fileExtension : void 0, r = s ? `.${s}` : "";
    return ce.resolve(t.cwd, `${t.configName ?? "config"}${r}`);
  }
  #p(t) {
    if (t.migrations) {
      this.#y(t), this._validate(this.store);
      return;
    }
    const s = this.store, r = Object.assign(Be(), t.defaults ?? {}, s);
    this._validate(r);
    try {
      wa.deepEqual(s, r);
    } catch {
      this.store = r;
    }
  }
  #y(t) {
    const { migrations: s, projectVersion: r } = t;
    if (s) {
      if (!r)
        throw new Error("Please specify the `projectVersion` option.");
      this.#o = !0;
      try {
        const l = this.store, n = Object.assign(Be(), t.defaults ?? {}, l);
        try {
          wa.deepEqual(l, n);
        } catch {
          this._write(n);
        }
        this._migrate(s, r, t.beforeEachMigration);
      } finally {
        this.#o = !1;
      }
    }
  }
}
const { app: gn, ipcMain: na, shell: km } = lu;
let ou = !1;
const iu = () => {
  if (!na || !gn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: gn.getPath("userData"),
    appVersion: gn.getVersion()
  };
  return ou || (na.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), ou = !0), e;
};
class qm extends Am {
  constructor(t) {
    let s, r;
    if (me.type === "renderer") {
      const l = lu.ipcRenderer.sendSync("electron-store-get-data");
      if (!l)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: s, appVersion: r } = l);
    } else na && gn && ({ defaultCwd: s, appVersion: r } = iu());
    t = {
      name: "config",
      ...t
    }, t.projectVersion ||= r, t.cwd ? t.cwd = ce.isAbsolute(t.cwd) ? t.cwd : ce.join(s, t.cwd) : t.cwd = s, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    iu();
  }
  async openInEditor() {
    const t = await km.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const Cm = Ku(import.meta.url), cu = qe.dirname(Cm), Vn = new qm();
du.registerSchemesAsPrivileged([
  { scheme: "media", privileges: { secure: !0, standard: !0, supportFetchAPI: !0, bypassCSP: !0, stream: !0, corsEnabled: !0 } }
]);
let Ee = null;
async function Fu() {
  const e = We.getAppPath();
  if (e.endsWith(".asar")) {
    const r = e + ".unpacked", l = qe.join(r, "dist", "audio");
    try {
      if ((await ft.stat(l)).isDirectory())
        return console.log("Found unpacked audio at:", l), l;
    } catch {
    }
  }
  const t = qe.join(e, "dist");
  try {
    if ((await ft.readdir(t)).includes("audio"))
      return qe.join(t, "audio");
  } catch {
  }
  const s = qe.join(e, "public/audio");
  try {
    if ((await ft.stat(s)).isDirectory())
      return s;
  } catch {
  }
  return null;
}
async function Dm() {
  const e = qe.join(We.getPath("temp"), "gamify-life-audio");
  try {
    await ft.rm(e, { recursive: !0, force: !0 });
  } catch {
  }
}
const uu = () => {
  Ee = new sa({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    title: "The Hidden Covenant",
    backgroundColor: "#0a0a0a",
    autoHideMenuBar: !0,
    // Hide the menu bar (File, Edit, View, etc.)
    webPreferences: {
      preload: qe.join(cu, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1,
      webSecurity: !1,
      // Required for Spotify Embed to work in local/file protocol
      plugins: !0,
      // Required for Widevine CDM (Spotify full tracks)
      webviewTag: !0,
      // Required for <webview> tag
      autoplayPolicy: "no-user-gesture-required"
      // Allow audio to autoplay on start
      // Use default session for better persistent cookie support
      // partition: 'persist:main_session'
    }
  }), Ee.webContents.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"), Ee.webContents.session.setPermissionRequestHandler((t, s, r) => {
    r(!0);
  }), process.env.VITE_DEV_SERVER_URL ? Ee.loadURL(process.env.VITE_DEV_SERVER_URL) : Ee.loadFile(qe.join(cu, "../dist/index.html")), Ee.on("closed", () => {
    Ee = null;
  });
};
We.whenReady().then(() => {
  du.registerFileProtocol("media", async (t, s) => {
    try {
      let r = t.url.replace(/^media:\/*/, "");
      r = decodeURIComponent(r);
      const l = await Fu();
      if (!l) {
        console.error("Audio root not found");
        return;
      }
      const n = qe.join(l, r);
      s({ path: n });
    } catch (r) {
      console.error(`Failed to handle media request: ${t.url}`, r);
    }
  });
  const e = {
    urls: ["*://*.spotify.com/*", "*://spotify.com/*"]
  };
  zu.defaultSession.webRequest.onBeforeSendHeaders(e, (t, s) => {
    t.requestHeaders.Referer = "https://open.spotify.com/", s({ requestHeaders: t.requestHeaders });
  }), uu(), We.on("activate", () => {
    sa.getAllWindows().length === 0 && uu();
  });
});
We.on("window-all-closed", () => {
  process.platform !== "darwin" && We.quit();
});
We.on("will-quit", () => {
  Dm();
});
Te.handle("store:get", (e, t) => Vn.get(t));
Te.handle("store:set", (e, t, s) => (Vn.set(t, s), !0));
Te.handle("store:delete", (e, t) => (Vn.delete(t), !0));
Te.handle("store:clear", () => (Vn.clear(), !0));
Te.handle("audio:get-playlists", async () => {
  const e = [];
  try {
    const t = We.getAppPath();
    e.push(`App Path: ${t}`);
    const s = await Fu();
    if (!s)
      return e.push("x Audio folder not found via getAudioRoot()"), { playlists: [], debugInfo: e };
    e.push(`✓ Resolved Audio Root: ${s}`);
    const r = await ft.readdir(s, { withFileTypes: !0 }), l = [];
    let n = !1;
    for (const i of r)
      if (i.isDirectory()) {
        const a = qe.join(s, i.name), u = await ft.readdir(a), d = u.filter((c) => /\.(mp3|wav|ogg|m4a)$/i.test(c)).map((c) => ({
          name: c.replace(/\.[^/.]+$/, ""),
          // Crucial: Used by protocol handler. 
          // Must match the relative path structure expected by 'media://'
          path: `media:///${i.name}/${c}`
        }));
        if (d.length > 0 && (l.push({ name: i.name, tracks: d }), !n)) {
          n = !0;
          const c = u.find((g) => /\.(mp3|wav|ogg|m4a)$/i.test(g)), $ = qe.join(a, c);
          try {
            await ft.access($), e.push(`✓ Sanity Check: File exists at ${$}`);
          } catch (g) {
            e.push(`x Sanity Check Failed: ${g.message}`);
          }
        }
      }
    return { playlists: l, debugInfo: e };
  } catch (t) {
    return console.error("Error scanning audio:", t), { playlists: [], debugInfo: [`Fatal Error: ${t.message}`] };
  }
});
Te.handle("app:spotifyLogin", async () => new Promise((e) => {
  const t = new sa({
    width: 800,
    height: 600,
    parent: Ee || void 0,
    // Modal if parent is set
    modal: !0,
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      webSecurity: !1
      // Ensure consistent session handling
      // Share session (default)
      // partition: 'persist:main_session'
    }
  });
  t.loadURL("https://accounts.spotify.com/login"), t.on("closed", () => {
    e();
  });
}));
Te.handle("app:getVersion", () => We.getVersion());
Te.handle("app:openExternal", (e, t) => {
  Uu.openExternal(t);
});
Te.on("window:minimize", () => {
  Ee?.minimize();
});
Te.on("window:maximize", () => {
  Ee?.isMaximized() ? Ee.unmaximize() : Ee?.maximize();
});
Te.on("window:close", () => {
  Ee?.close();
});
Te.on("window:toggle-fullscreen", () => {
  Ee && Ee.setFullScreen(!Ee.isFullScreen());
});
