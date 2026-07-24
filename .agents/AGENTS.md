# Project Style Guidelines

- **Strict File Length Limits:** Strictly enforce that ALL source files (.ts, .tsx, etc.) are kept under 150 lines. Keep components small, modular, and single-responsibility.
- **Thoughtful Barrel Exports & Encapsulation:** Thoughtfully consider what is leaking out of a folder. Only interfaces and type definitions should leak outside module folder boundaries. All concrete class implementations, React sub-components, and helpers should remain encapsulated inside their containing folder (instantiated or created via default factories or barrel exports as needed).

BEFORE MERGING OR COMMITTING CODE, ALWAYS RUN /august-review