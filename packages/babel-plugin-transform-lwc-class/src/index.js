const classProperty = require('babel-plugin-transform-class-properties');

const component = require('./component');
const decorators = require('./decorators');

/**
 * The transform is done in 2 passes:
 *    - First, apply in a single AST traversal the decorators and the component transformation.
 *    - Then, in a second path transform class properties using the official babel plugin "babel-plugin-transform-class-properties".
 */
module.exports = function ({ types, traverse }) {
    const { merge: mergeVisitors } = traverse.visitors;

    const { visitor: classPropertyVisitor } = classProperty({ types });

    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push('decorators');
            parserOpts.plugins.push('classProperties');
        },
        visitor: mergeVisitors([
            decorators({ types }),
            component({ types }),
            {
                Program: {
                    exit(path, state) {
                        path.traverse(
                            classPropertyVisitor,
                            state
                        );
                    }
                }
            },
        ])
    }
}