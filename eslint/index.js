import rule from './rules/controller-import-style.js';
import frozenFacade from './rules/frozen-facade.js';

/** Local ESLint plugin for deterministic architecture constraints. */
export default {
    rules: {
        'controller-import-style': rule,
        'frozen-facade': frozenFacade,
    },
};
