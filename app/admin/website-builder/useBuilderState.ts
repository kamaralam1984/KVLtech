import { useReducer, useState, useCallback, useEffect } from 'react';
import type {
  WebsiteProject,
  BuilderPage,
  Section,
  Column,
  BuilderElement,
  ElementType,
  ElementConfig,
  GlobalStyles,
  SelectionState,
} from './builder-types';

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------
let _idCounter = 0;
const genId = () => 'el' + (++_idCounter) + '_' + ((performance.now() | 0).toString(36));

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  primaryColor: '#C9A227',
  secondaryColor: '#0B1437',
  accentColor: '#3B82F6',
  headingFont: 'Poppins',
  bodyFont: 'Inter',
  baseFontSize: 16,
  maxWidth: 1280,
  borderRadius: 'md',
};

export const DEFAULT_PROJECT: WebsiteProject = {
  id: 'proj_1',
  name: 'My Website',
  pages: [
    {
      id: 'page_1',
      name: 'Home',
      slug: 'home',
      seo: { title: '', description: '', keywords: '' },
      sections: [
        {
          id: 'sec_hero',
          name: 'Hero Section',
          columns: [
            {
              id: 'col_1',
              width: 100,
              elements: [
                {
                  id: 'el_hero_1',
                  type: 'hero',
                  styles: {},
                  config: {
                    heading: 'Welcome to Our Website',
                    subheading: 'Your Success is Our Mission',
                    text: 'We build amazing digital experiences that transform your business.',
                    cta: { label: 'Get Started', href: '#', variant: 'primary', size: 'lg' },
                    overlay: 40,
                    align: 'center',
                    bgImage: '',
                  },
                },
              ],
            },
          ],
          background: { type: 'color', value: '#ffffff' },
          padding: { top: 0, bottom: 0 },
          margin: { top: 0, bottom: 0 },
          maxWidth: 'full',
        },
      ],
    },
  ],
  globalStyles: DEFAULT_GLOBAL_STYLES,
  createdAt: '2026-06-09T00:00:00.000Z',
  updatedAt: '2026-06-09T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Reducer types
// ---------------------------------------------------------------------------
interface UndoRedoState {
  past: WebsiteProject[];
  present: WebsiteProject;
  future: WebsiteProject[];
}

type Action =
  | { type: 'SET_PROJECT'; project: WebsiteProject }
  | { type: 'ADD_SECTION'; pageId: string; section: Section }
  | { type: 'REMOVE_SECTION'; pageId: string; sectionId: string }
  | { type: 'MOVE_SECTION'; pageId: string; fromIdx: number; toIdx: number }
  | { type: 'UPDATE_SECTION'; pageId: string; sectionId: string; updates: Partial<Section> }
  | { type: 'DUPLICATE_SECTION'; pageId: string; sectionId: string; newSection: Section }
  | { type: 'ADD_ELEMENT'; pageId: string; sectionId: string; columnId: string; element: BuilderElement }
  | { type: 'REMOVE_ELEMENT'; pageId: string; sectionId: string; columnId: string; elementId: string }
  | { type: 'UPDATE_ELEMENT'; pageId: string; sectionId: string; columnId: string; elementId: string; updates: Partial<BuilderElement> }
  | { type: 'DUPLICATE_ELEMENT'; pageId: string; sectionId: string; columnId: string; elementId: string; newElement: BuilderElement }
  | { type: 'UPDATE_GLOBAL_STYLES'; styles: Partial<GlobalStyles> }
  | { type: 'UPDATE_PROJECT_NAME'; name: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const MAX_HISTORY = 20;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function withTimestamp(project: WebsiteProject): WebsiteProject {
  return { ...project, updatedAt: new Date().toISOString() };
}

function pushHistory(past: WebsiteProject[], present: WebsiteProject): WebsiteProject[] {
  const next = [...past, present];
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}

function mapPages(
  project: WebsiteProject,
  pageId: string,
  fn: (page: BuilderPage) => BuilderPage,
): WebsiteProject {
  return {
    ...project,
    pages: project.pages.map((p) => (p.id === pageId ? fn(p) : p)),
  };
}

function mapSections(
  page: BuilderPage,
  sectionId: string,
  fn: (section: Section) => Section,
): BuilderPage {
  return {
    ...page,
    sections: page.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
  };
}

function mapColumns(
  section: Section,
  columnId: string,
  fn: (col: Column) => Column,
): Section {
  return {
    ...section,
    columns: section.columns.map((c) => (c.id === columnId ? fn(c) : c)),
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function reducer(state: UndoRedoState, action: Action): UndoRedoState {
  switch (action.type) {
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: pushHistory(state.past, state.present),
        present: next,
        future: state.future.slice(1),
      };
    }

    case 'SET_PROJECT': {
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(action.project),
        future: [],
      };
    }

    case 'ADD_SECTION': {
      const updated = mapPages(state.present, action.pageId, (page) => ({
        ...page,
        sections: [...page.sections, action.section],
      }));
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    case 'REMOVE_SECTION': {
      const updated = mapPages(state.present, action.pageId, (page) => ({
        ...page,
        sections: page.sections.filter((s) => s.id !== action.sectionId),
      }));
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    case 'MOVE_SECTION': {
      const updated = mapPages(state.present, action.pageId, (page) => {
        const sections = [...page.sections];
        const [moved] = sections.splice(action.fromIdx, 1);
        sections.splice(action.toIdx, 0, moved);
        return { ...page, sections };
      });
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    case 'UPDATE_SECTION': {
      const updated = mapPages(state.present, action.pageId, (page) =>
        mapSections(page, action.sectionId, (section) => ({
          ...section,
          ...action.updates,
        })),
      );
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    case 'DUPLICATE_SECTION': {
      const updated = mapPages(state.present, action.pageId, (page) => {
        const idx = page.sections.findIndex((s) => s.id === action.sectionId);
        if (idx === -1) return page;
        const sections = [...page.sections];
        sections.splice(idx + 1, 0, action.newSection);
        return { ...page, sections };
      });
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    case 'ADD_ELEMENT': {
      const updated = mapPages(state.present, action.pageId, (page) =>
        mapSections(page, action.sectionId, (section) =>
          mapColumns(section, action.columnId, (col) => ({
            ...col,
            elements: [...col.elements, action.element],
          })),
        ),
      );
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    case 'REMOVE_ELEMENT': {
      const updated = mapPages(state.present, action.pageId, (page) =>
        mapSections(page, action.sectionId, (section) =>
          mapColumns(section, action.columnId, (col) => ({
            ...col,
            elements: col.elements.filter((e) => e.id !== action.elementId),
          })),
        ),
      );
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    case 'UPDATE_ELEMENT': {
      const updated = mapPages(state.present, action.pageId, (page) =>
        mapSections(page, action.sectionId, (section) =>
          mapColumns(section, action.columnId, (col) => ({
            ...col,
            elements: col.elements.map((e) =>
              e.id === action.elementId ? { ...e, ...action.updates } : e,
            ),
          })),
        ),
      );
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    case 'DUPLICATE_ELEMENT': {
      const updated = mapPages(state.present, action.pageId, (page) =>
        mapSections(page, action.sectionId, (section) =>
          mapColumns(section, action.columnId, (col) => {
            const idx = col.elements.findIndex((e) => e.id === action.elementId);
            if (idx === -1) return col;
            const elements = [...col.elements];
            elements.splice(idx + 1, 0, action.newElement);
            return { ...col, elements };
          }),
        ),
      );
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    case 'UPDATE_GLOBAL_STYLES': {
      const updated: WebsiteProject = {
        ...state.present,
        globalStyles: { ...state.present.globalStyles, ...action.styles },
      };
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    case 'UPDATE_PROJECT_NAME': {
      const updated: WebsiteProject = { ...state.present, name: action.name };
      return {
        past: pushHistory(state.past, state.present),
        present: withTimestamp(updated),
        future: [],
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Local storage key
// ---------------------------------------------------------------------------
const LS_KEY = 'kvl_builder_project';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
function useBuilderState() {
  const [state, dispatch] = useReducer(reducer, {
    past: [],
    present: DEFAULT_PROJECT,
    future: [],
  });

  const [currentPageId, setCurrentPageId] = useState<string>(
    DEFAULT_PROJECT.pages[0]?.id ?? '',
  );

  const [selection, setSelection] = useState<SelectionState>({
    pageId: null,
    sectionId: null,
    columnId: null,
    elementId: null,
    level: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WebsiteProject;
        dispatch({ type: 'SET_PROJECT', project: parsed });
        if (parsed.pages.length > 0) {
          setCurrentPageId(parsed.pages[0].id);
        }
      }
    } catch {
      // Silently ignore parse errors — use default project
    }
  }, []);

  const project = state.present;
  const currentPage = project.pages.find((p) => p.id === currentPageId);

  // ---- undo / redo -------------------------------------------------------
  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  // ---- section operations ------------------------------------------------
  const addSection = useCallback(
    (preset?: string) => {
      const colId = genId();
      const sectionId = genId();

      const columns: Column[] =
        preset === 'hero'
          ? [
              {
                id: colId,
                width: 100,
                elements: [
                  {
                    id: genId(),
                    type: 'hero',
                    styles: {},
                    config: {
                      heading: 'New Hero Heading',
                      subheading: 'Hero Subheading',
                      text: 'Add your hero description here.',
                      cta: { label: 'Get Started', href: '#', variant: 'primary', size: 'lg' },
                      overlay: 40,
                      align: 'center',
                      bgImage: '',
                    },
                  },
                ],
              },
            ]
          : [{ id: colId, width: 100, elements: [] }];

      const newSection: Section = {
        id: sectionId,
        name: preset ? `${preset.charAt(0).toUpperCase()}${preset.slice(1)} Section` : 'New Section',
        columns,
        background: { type: 'color', value: '#ffffff' },
        padding: { top: 60, bottom: 60 },
        margin: { top: 0, bottom: 0 },
        maxWidth: 'xl',
      };

      if (!currentPageId) return;
      dispatch({ type: 'ADD_SECTION', pageId: currentPageId, section: newSection });
    },
    [currentPageId],
  );

  const removeSection = useCallback(
    (sectionId: string) => {
      if (!currentPageId) return;
      dispatch({ type: 'REMOVE_SECTION', pageId: currentPageId, sectionId });
    },
    [currentPageId],
  );

  const moveSection = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (!currentPageId) return;
      dispatch({ type: 'MOVE_SECTION', pageId: currentPageId, fromIdx, toIdx });
    },
    [currentPageId],
  );

  const duplicateSection = useCallback(
    (sectionId: string) => {
      if (!currentPageId) return;
      const page = project.pages.find((p) => p.id === currentPageId);
      const section = page?.sections.find((s) => s.id === sectionId);
      if (!section) return;

      // Deep-clone the section with new IDs
      const newSection: Section = {
        ...section,
        id: genId(),
        name: `${section.name} (Copy)`,
        columns: section.columns.map((col) => ({
          ...col,
          id: genId(),
          elements: col.elements.map((el) => ({ ...el, id: genId() })),
        })),
      };

      dispatch({
        type: 'DUPLICATE_SECTION',
        pageId: currentPageId,
        sectionId,
        newSection,
      });
    },
    [currentPageId, project],
  );

  const updateSection = useCallback(
    (sectionId: string, updates: Partial<Section>) => {
      if (!currentPageId) return;
      dispatch({ type: 'UPDATE_SECTION', pageId: currentPageId, sectionId, updates });
    },
    [currentPageId],
  );

  // ---- element operations ------------------------------------------------
  const addElement = useCallback(
    (
      sectionId: string,
      columnId: string,
      type: ElementType,
      config: ElementConfig,
    ) => {
      if (!currentPageId) return;
      const element: BuilderElement = {
        id: genId(),
        type,
        styles: {},
        config,
      };
      dispatch({
        type: 'ADD_ELEMENT',
        pageId: currentPageId,
        sectionId,
        columnId,
        element,
      });
    },
    [currentPageId],
  );

  const removeElement = useCallback(
    (sectionId: string, columnId: string, elementId: string) => {
      if (!currentPageId) return;
      dispatch({
        type: 'REMOVE_ELEMENT',
        pageId: currentPageId,
        sectionId,
        columnId,
        elementId,
      });
    },
    [currentPageId],
  );

  const updateElement = useCallback(
    (
      sectionId: string,
      columnId: string,
      elementId: string,
      updates: Partial<BuilderElement>,
    ) => {
      if (!currentPageId) return;
      dispatch({
        type: 'UPDATE_ELEMENT',
        pageId: currentPageId,
        sectionId,
        columnId,
        elementId,
        updates,
      });
    },
    [currentPageId],
  );

  const duplicateElement = useCallback(
    (sectionId: string, columnId: string, elementId: string) => {
      if (!currentPageId) return;
      const page = project.pages.find((p) => p.id === currentPageId);
      const section = page?.sections.find((s) => s.id === sectionId);
      const col = section?.columns.find((c) => c.id === columnId);
      const element = col?.elements.find((e) => e.id === elementId);
      if (!element) return;

      const newElement: BuilderElement = {
        ...element,
        id: genId(),
        label: element.label ? `${element.label} (Copy)` : undefined,
        config: { ...element.config },
        styles: { ...element.styles },
      };

      dispatch({
        type: 'DUPLICATE_ELEMENT',
        pageId: currentPageId,
        sectionId,
        columnId,
        elementId,
        newElement,
      });
    },
    [currentPageId, project],
  );

  // ---- global styles & project name -------------------------------------
  const updateGlobalStyles = useCallback((styles: Partial<GlobalStyles>) => {
    dispatch({ type: 'UPDATE_GLOBAL_STYLES', styles });
  }, []);

  const updateProjectName = useCallback((name: string) => {
    dispatch({ type: 'UPDATE_PROJECT_NAME', name });
  }, []);

  // ---- persistence -------------------------------------------------------
  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state.present));
    } catch {
      // Silently ignore storage quota errors
    }
  }, [state.present]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WebsiteProject;
        dispatch({ type: 'SET_PROJECT', project: parsed });
        if (parsed.pages.length > 0) {
          setCurrentPageId(parsed.pages[0].id);
        }
      }
    } catch {
      // Silently ignore parse errors
    }
  }, []);

  return {
    project,
    currentPage,
    selection,
    setCurrentPageId,
    setSelection,
    canUndo,
    canRedo,
    undo,
    redo,
    addSection,
    removeSection,
    moveSection,
    duplicateSection,
    updateSection,
    addElement,
    removeElement,
    updateElement,
    duplicateElement,
    updateGlobalStyles,
    updateProjectName,
    saveToLocalStorage,
    loadFromLocalStorage,
  };
}

export default useBuilderState;
