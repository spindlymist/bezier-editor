import BezierEditor from './BezierEditor.js';

const canvas = document.querySelector('#canvas');
const objectList = document.querySelector('.object-list');
new BezierEditor(canvas, objectList);

window.MicroModal.init();
document.querySelector('#help-modal [role=dialog]')
    .addEventListener('click', e => {
        if(e.target === e.currentTarget) {
            e.stopPropagation();
        }
    });
window.addEventListener('keyup', e => {
    if(e.code === 'KeyH') {
        window.MicroModal.show('help-modal');
    }
});
window.MicroModal.show('help-modal');
