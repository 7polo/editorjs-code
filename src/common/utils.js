/**
 * 防抖函数
 * @param fn
 * @param wait 等待事件
 * @param immediate 是否立即
 */
export const debounce = (fn, wait = 50, immediate) => {
    let timer = null
    let count  = 0
    return function (...args) {
        count++;
        if (timer) clearTimeout(timer)
        if ((immediate && !timer) || count > 5) {
            fn.apply(this, args)
            count = 0
        }
        timer = setTimeout(() => {
            fn.apply(this, args)
            count = 0
        }, wait)
    }
}

/**
 * 转义
 * @param text
 * @returns {*}
 */
export function htmlEncode(text) {
    return text.replace(/[<>"&]/g, function (match) {
        switch (match) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case "\"":
                return "&quot;";
        }
    });
}

export function getString(v, defaultVal) {
    return v && typeof v === 'string' ? v : defaultVal
}

/**
 * 创建dom
 * @param tagName
 * @param classNames
 * @param attributes
 * @returns {*}
 */
export function make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName);
    if (classNames && classNames.length > 0) {
        attributes['class'] = Array.isArray(classNames) ? classNames.join(" ") : classNames
    }
    for (const attrName in attributes) {
        el.setAttribute(attrName, attributes[attrName]);
    }
    return el;
}

