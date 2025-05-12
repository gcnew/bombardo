
import * as Game from './game'

import { KbShortcut } from './keyboard'
import { setup, setGameObject, registerShortcuts, toggleDebug } from './engine'

let KbShortcuts: KbShortcut[] = [
    [toggleDebug,  '['],
];

window.onload = function() {
    setup();
    registerShortcuts(KbShortcuts);
    setGameObject(Game);
};
