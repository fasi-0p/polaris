import { StateEffect, StateField } from "@codemirror/state";
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
    keymap
} from "@codemirror/view";

const setSuggestionEffect = StateEffect.define<string | null>();

const suggestionState = StateField.define<string | null>({
    create() {
        return "//todo ";
    },

    update(value, transaction) {
        for (const effect of transaction.effects) {
            if (effect.is(setSuggestionEffect)) {
                return effect.value;
            }
        }

        return value;
    },
});

class SuggestionWidget extends WidgetType {
    constructor(readonly text: string) {
        super();
    }

    toDOM() {
        const span = document.createElement("span");
        span.textContent = this.text;
        span.style.opacity = "0.4";
        span.style.pointerEvents = "none";
        return span;
    }
}

const renderPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = this.build(view);
        }

        update(update: ViewUpdate) {
            const suggestionChanged = update.transactions.some((transaction) => {
                return transaction.effects.some((effect) => {
                    return effect.is(setSuggestionEffect);
                });
            });

            if (update.docChanged || suggestionChanged || update.selectionSet) {
                this.decorations = this.build(update.view);
            }
        }

        build(view: EditorView): DecorationSet {
            const suggestion = view.state.field(suggestionState);

            if (!suggestion) {
                return Decoration.none;
            }

            const cursor = view.state.selection.main.head;

            return Decoration.set([
                Decoration.widget({
                    widget: new SuggestionWidget(suggestion),
                    side: 1,
                }).range(cursor),
            ]);
        }
    },
    {
        decorations: (plugin) => plugin.decorations,
    }
);

export const suggestion = (fileName: string) => [
    suggestionState,
    renderPlugin,
];