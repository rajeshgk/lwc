/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from "../shared/assert";
import { isUndefined, isObject, isArray, create, ArrayPush } from "../shared/language";

import { Context } from "./context";
import { VNodeData } from "../3rdparty/snabbdom/types";
import { ComponentDef } from "./def";
import { VM } from "./vm";

type ServiceCallback = (component: object, data: VNodeData, def: ComponentDef, context: Context) => void;
interface ServiceDef {
    wiring?: ServiceCallback;
    locator?: ServiceCallback;
    connected?: ServiceCallback;
    disconnected?: ServiceCallback;
    rendered?: ServiceCallback;
}

export const Services: {
  wiring?: ServiceCallback[];
  locator?: ServiceCallback[];
  connected?: ServiceCallback[];
  disconnected?: ServiceCallback[];
  rendered?: ServiceCallback[];
} = create(null);

const hooks: Array<keyof ServiceDef> = ['wiring', 'locator', 'rendered', 'connected', 'disconnected'];

export function register(service: ServiceDef) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isObject(service), `Invalid service declaration, ${service}: service must be an object`);
    }
    for (let i = 0; i < hooks.length; ++i) {
        const hookName = hooks[i];
        if (hookName in service) {
            let l = Services[hookName];
            if (isUndefined(l)) {
                Services[hookName] = l = [];
            }
            ArrayPush.call(l, service[hookName]);
        }
    }
}

export function invokeServiceHook(vm: VM, cbs: ServiceCallback[]) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isTrue(isArray(cbs) && cbs.length > 0, `Optimize invokeServiceHook() to be invoked only when needed`);
    }
    const { component, data, def, context } = vm;
    for (let i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
    }
}