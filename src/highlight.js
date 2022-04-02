import {make} from './common/utils';
import Prism from './prismjs/prism.min.js';

const baseUrl = 'https://cdn.jsdelivr.net/npm/prismjs@1.25.0';
let ready = false;

export class Highlight {
    defaultPlugins() {
        return {
            autoloader: {
                js: `${baseUrl}/plugins/autoloader/prism-autoloader.min.js`
            },
            'line-numbers': {
                css: `http://file.apologizebao.cn/resource/prismjs/line-number.css`,
                js: `http://file.apologizebao.cn/resource/prismjs/line-number.js`
            },
            'autolinker': {
                css: `${baseUrl}/plugins/autolinker/prism-autolinker.css`,
                js: `${baseUrl}/plugins/autolinker/prism-autolinker.min.js`
            },
            'toolbar': {
                css: `${baseUrl}/plugins/toolbar/prism-toolbar.css`,
                js: `${baseUrl}/plugins/toolbar/prism-toolbar.js`
            }
        };
    }

    constructor({theme, language}, config) {
        Object.assign(this, {language: language, theme: theme});
        this.loadTheme(theme);
        setTimeout(() => {
            this.loadPlugins(config);
        }, 100);
    }

    loadPlugins(config) {
        const plugins = Object.assign(this.defaultPlugins(), config.plugins || {});

        for (let name in plugins) {

            const plugin = plugins[name];

            if (!plugin) {
                continue;
            }
            if (plugin.css) {
                this.loadResource('link', plugin.css, `css-${name}`);
            }
            if (plugin.js) {
                const load = this.loadResource('script', plugin.js, `js-${name}`);
                if (name === 'toolbar' && load) {
                    this.toolbarButtons(10);
                }
            }
        }
    }

    loadResource(tag, url, id) {
        id = `hl-${id}`;
        if (document.querySelector(`#${id}`)) {
            return false;
        }

        const head = document.querySelector('head');
        let attrs = {id: id};
        if ('script' === tag) {
            Object.assign(attrs, {src: url});
        } else if ('link' === tag) {
            Object.assign(attrs, {'rel': 'stylesheet', 'href': url,});
        }
        const dom = make(tag, [], attrs);
        if (head) head.appendChild(dom);
        return true;
    }

    loadTheme(theme) {
        this.loadResource('link', `${baseUrl}/themes/prism${theme !== '' ? ('-' + theme) : ''}.css`, `theme-${theme}`);
    }

    toHighlight(el, toPosition = true) {
        this.el = el
        if (!Prism) {
            return;
        }
        const location = this.getCursorPosition(el);
        Prism.highlightElement(el);
        if (toPosition) {
            this.setCurrentCursorPosition(el, location);
        }
    }

    getCursorPosition(element) {
        let caretOffset = 0;
        const doc = element.ownerDocument || element.document;
        const win = doc.defaultView || doc.parentWindow;
        let sel;
        if (typeof win.getSelection !== 'undefined') {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ((sel = doc.selection) && sel.type !== 'Control') {
            const textRange = sel.createRange();
            const preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
    }

    setCurrentCursorPosition(el, offset) {
        if (offset >= 0) {
            const selection = window.getSelection();
            const range = this.createRange(el, {count: offset});
            if (range) {
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    createRange(node, chars, range) {
        if (!range) {
            range = document.createRange();
            range.selectNode(node);
            range.setStart(node, 0);
        }

        if (chars.count === 0) {
            range.setEnd(node, chars.count);
        } else if (node && chars.count > 0) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent.length < chars.count) {
                    chars.count -= node.textContent.length;
                } else {
                    range.setEnd(node, chars.count);
                    chars.count = 0;
                }
            } else {
                for (let lp = 0; lp < node.childNodes.length; lp++) {
                    range = this.createRange(node.childNodes[lp], chars, range);
                    if (chars.count === 0) {
                        break;
                    }
                }
            }
        }
        return range;
    }

    toolbarButtons(retry) {
        const me = this;
        retry--;
        if (!(Prism && Prism.plugins.toolbar) && retry > 0) {
            setTimeout(() => this.toolbarButtons(retry), 1000);
            return;
        }
        retry = 0;
        Prism.plugins.toolbar.registerButton('copy', {
            text: 'Copy',
            onClick: function (env) {
                me.copy(env);
            }
        });
        Prism.plugins.toolbar.registerButton('language', {
            text: this.language,
            onClick: () => function (env) {
            }
        });
        Prism.plugins.toolbar.registerButton('theme', {
            text: this.theme,
            onClick: () => function (env) {
                env.language = 'css';
            }
        });
        ready = true;
    }

    isReady() {
        return ready;
    }

    copy(env) {
        const transfer = document.createElement('input');
        document.body.appendChild(transfer);
        transfer.value = env.element.textContent;
        transfer.focus();
        transfer.select();
        if (document.execCommand('copy')) {
            document.execCommand('copy');
        }
        transfer.blur();
        console.log('复制成功');
        document.body.removeChild(transfer);

    }
}
