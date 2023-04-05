export default class ObjectList {

    constructor(list) {
        this.controls = list.querySelector('.object-list--controls');
        this.list = list.querySelector('.object-list--objects');
        this.objects = [];
        this.onSelectedItemChangedListeners = [];
        this.onSelectedItemDeletedListeners = [];
        this.serializeItemCallback = null;
        this.selected = null;

        this.registerEventListeners();
    }

    add(name, obj, select) {
        if(typeof name !== "string") return;

        const index = this.objects.length;
        const newObject = {
            name: name,
            obj: obj,
            li: this.createListItem(name, index)
        };
        this.objects.push(newObject);
        this.list.appendChild(newObject.li);

        this.select(newObject);
    }

    registerEventListeners() {
        this.controls.querySelector('.delete').addEventListener('click', () => this.deleteSelected());
        this.controls.querySelector('.rename').addEventListener('click', () => this.renameSelected());
        this.controls.querySelector('.copy').addEventListener('click', () => this.copySelected());
    }

    deleteSelected(e) {
        if(this.selected === null) return;

        const index = parseInt(this.selected.dataset.objectIndex);
        console.log(index);
        this.list.removeChild(this.selected);
        this.objects.splice(index, 1);

        for(let i = index; i < this.objects.length; i++) {
            this.objects[i].li.dataset.objectIndex = i;
        }

        this.onSelectedItemDeletedListeners.forEach(cb => cb());

        if(this.objects.length > 0) {
            this.select(this.objects[index - 1]);
        }
        else {
            this.selected = null;
        }
    }

    renameSelected() {
        if(this.selected === null || this.selected.classList.contains('renaming')) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.selected.innerHTML + "";
        input.placeholder = 'Enter a name...';

        this.selected.innerHTML = "";
        this.selected.classList.add('renaming');
        this.selected.appendChild(input);

        input.addEventListener('focusout', () => this.commitRename(input));
        input.addEventListener('keyup', (e) => {
            e.stopPropagation();
            if(e.code === 'Enter') {
                this.commitRename(input);
            }
        });

        input.focus();
        input.select();
    }

    commitRename(input) {
        this.selected.name = input.value;
        this.selected.removeChild(input);
        this.selected.classList.remove('renaming');
        this.selected.innerHTML = this.selected.name;
    }

    copySelected() {
        if(this.serializeItemCallback === null || this.selected === null) return;

        const index = parseInt(this.selected.dataset.objectIndex);
        navigator.clipboard.writeText(this.serializeItemCallback(this.objects[index].obj));
    }

    createListItem(name, index) {
        let li = document.createElement("li");
        li.classList.add("object");
        li.addEventListener('click', (e) => this.onItemClick(e));
        li.dataset.objectIndex = index;
        li.innerHTML = name;

        return li;
    }

    onItemClick(e) {
        const li = e.currentTarget;
        const index = parseInt(li.dataset.objectIndex);
        this.select(this.objects[index]);
    }

    addSelectedItemChangedListener(callback) {
        this.onSelectedItemChangedListeners.push(callback);
    }

    addSelectedItemDeletedListener(callback) {
        this.onSelectedItemDeletedListeners.push(callback);
    }

    select(obj) {
        if(this.selected == obj.li) return;
        if(this.selected !== null) this.selected.classList.remove('selected');
        this.selected = obj.li;
        obj.li.classList.add('selected');
        this.onSelectedItemChangedListeners.forEach(cb => cb(obj.obj));
    }

}
