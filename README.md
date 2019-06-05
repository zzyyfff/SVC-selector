# Programming Exercise

#### Prerequisites
+ Node.js v10.15.0+

#### Installation:
1.  Fork and clone the respository locally
2.  Install dependencies with `npm install`.

#### Usage:
1. Run `node SVC-selector.js` from the command line
2. Enter `*` to view the entire JSON file
3. Enter a selector to search for matching views
    1. For a view class, simply enter the name, e.g. `StackView`
    1. For CSS class names, prefix the name with a `.`, e.g. `.container`
    1. For a view identifier, prefix the name with a `#`, e.g. `#videoMode`
4. If any matching views are found, you'll be given the option of displaying them.
5. You may also chain selectors by entering multiple selectors separated by a **single** space, e.g. `.container Box` will match all views with class `Box` which also have an ancestor of `.container`
6. Compound selectors are supported. This means you may combine selectors by entering multiple selectors **not** separated by any space, e.g. `StackView.accessoryView` will match all views with class `StackView` **AND** the className `accessoryView`. These can be part of chains as well, e.g. `StackView.accessoryView #apply`
7. Enter `exit` to exit the program
