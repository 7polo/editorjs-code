/**
 * Editor 代码编辑器
 */
import './style.css';

import {Highlight} from './highlight';
import {getString, htmlEncode, make} from './common/utils';

export default class Code {

    constructor({data, api, config, readOnly}) {
        this.api = api;
        this.config = {
            showLine: true
        };
        this.data = {
            code: this.transform(getString(data.code, ''), true),
            language: getString(data.language, 'java'),
            theme: data.theme || this.config.theme || 'tomorrow'
        };

        this.readOnly = readOnly;

        this.highlight = new Highlight(this.data, this.config)
    }

    static get sanitize() {
        return {
            code: true,
            language: false,
            theme: false
        }
    }

    static get toolbox() {
        return {
            title: 'Code',
            icon: '<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.71,6.29a1,1,0,0,0-1.42,0l-5,5a1,1,0,0,0,0,1.42l5,5a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L5.41,12l4.3-4.29A1,1,0,0,0,9.71,6.29Zm11,5-5-5a1,1,0,0,0-1.42,1.42L18.59,12l-4.3,4.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5A1,1,0,0,0,20.71,11.29Z"/></svg>'
        };
    }

    static get displayInToolbox() {
        return true;
    }

    static get enableLineBreaks() {
        return true;
    }

    static get isReadOnlySupported() {
        return true;
    }

    save() {
        return Object.assign(this.data, {code: this.transform(this.codeArea.innerText, false)});
    }

    validate(savedData) {
        return savedData.code.trim();
    }

    render() {
        const cls = `language-${this.data.language}`
        const codeHolder = make('pre', [`code_holder line-numbers ${cls}`]);
        this.codeArea = make('code', [cls], {
            spellcheck: false,
            contenteditable: !this.readOnly,
            'data-dependencies': this.data.language
        });

        this.codeArea.innerHTML = htmlEncode(this.data.code);
        codeHolder.appendChild(this.codeArea);

        this.api.listeners.on(this.codeArea, 'input', () => this.toHighlight(), false);
        this.api.listeners.on(this.codeArea, 'paste', event => this.handlePaste(event), false);
        this.initHighlightRender();
        return codeHolder;
    }

    initHighlightRender() {
        const timer = setInterval(() => {
            if (this.highlight.isReady()) {
                this.toHighlight();
                clearInterval(timer);
            }
        }, 50);
    }

    destroy() {
        this.api.listeners.off(this.codeArea, 'input', () => this.toHighlight(), false);
        this.api.listeners.off(this.codeArea, 'paste', event => this.handlePaste(event), false);
    }

    toHighlight() {
        this.highlight.toHighlight(this.codeArea);
    }

    handlePaste(e) {
        e.stopPropagation();
        e.preventDefault();
        // 去除复制带过来的样式
        let clp = (e.originalEvent || e).clipboardData;
        let text = clp ? clp.getData('text/plain') : window.clipboardData.getData("text");
        if (text) {
            const textNode = document.createTextNode(this.transform(text, true));
            if (window.getSelection()) {
                const range = window.getSelection().getRangeAt(0);
                range.deleteContents();
                range.insertNode(textNode);
            } else {
                this.codeArea.appendChild(textNode);
            }
        }
        this.toHighlight();
    }

    transform(text, lineFeed) {
        return lineFeed ? text.replaceAll('\r\n', '\n') : text.replaceAll('\n', '\r\n');
    }
}
